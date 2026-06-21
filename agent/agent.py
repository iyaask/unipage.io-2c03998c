import argparse
import asyncio
import json
import logging
import os
import random
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional
from urllib.parse import urlparse

from dotenv import load_dotenv
from browser_use import Agent, Browser, ChatAnthropic, ChatBrowserUse
import httpx

load_dotenv()

# Models
DEFAULT_MODEL = "claude-sonnet-4-20250514"
DISCOVERY_MODEL = "claude-sonnet-4-20250514"

# Configuration
DEFAULT_MOTIVATION = "I am a financially needy student seeking support to complete my studies."
REQUIRED_STUDENT_FIELDS = (
    "full_name",
    "id_number",
    "email",
    "phone",
    "university",
    "course",
    "year_of_study",
)

# Rate limiting & safety
MIN_STEP_DELAY = 0.5  # seconds
MAX_STEP_DELAY = 2.0  # seconds
MAX_RETRIES = 3
RETRY_BACKOFF = 2.0
TIMEOUT_SECONDS = 300  # 5 minutes per application
MAX_STEPS = 80  # Increased from 60

# Supabase config (will be set from env)
SUPABASE_URL = None
SUPABASE_KEY = None

logger = logging.getLogger(__name__)


def _build_llm(model: str):
    """Use Anthropic when configured; otherwise fall back to Browser Use Cloud."""
    if os.getenv("ANTHROPIC_API_KEY"):
        return ChatAnthropic(model=model)
    if os.getenv("BROWSER_USE_API_KEY"):
        return ChatBrowserUse()
    raise RuntimeError("Set ANTHROPIC_API_KEY or BROWSER_USE_API_KEY to run the agent.")


def _setup_logging(verbose: bool = False) -> None:
    """Configure structured logging."""
    level = logging.DEBUG if verbose else logging.INFO
    logging.basicConfig(
        level=level,
        format="%(asctime)s | %(name)s | %(levelname)s | %(message)s",
        handlers=[
            logging.StreamHandler(),
            logging.FileHandler("agent_operations.log"),
        ],
    )


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _timestamp() -> str:
    return datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")


def _safe_slug(value: Any, fallback: str = "student") -> str:
    slug = str(value or fallback).lower().replace(" ", "-").replace("/", "-")
    return "".join(char for char in slug if char.isalnum() or char in {"-", "_"})


def _validate_url(url: str) -> None:
    """Validate that URL is well-formed HTTP(S)."""
    parsed = urlparse(url)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise ValueError("bursary_url must be a valid http(s) URL.")


def _validate_student(student: dict[str, Any]) -> list[str]:
    """Check that required student fields are present and valid."""
    missing = [
        field
        for field in REQUIRED_STUDENT_FIELDS
        if not str(student.get(field, "")).strip()
    ]
    if "@" not in str(student.get("email", "")):
        missing.append("valid_email")
    return missing


def _normalise_documents(documents: dict[str, str] | None) -> dict[str, str]:
    """Convert document paths to absolute paths and validate."""
    if not documents:
        return {}

    normalised = {}
    for label, path in documents.items():
        if not path:
            continue
        document_path = Path(path).expanduser()
        normalised[label] = str(document_path)
    return normalised


def _document_notes(documents: dict[str, str]) -> str:
    """Generate notes about available documents."""
    if not documents:
        return "No document files were provided. Do not invent or upload missing files."

    lines = []
    for label, path in documents.items():
        exists = Path(path).exists()
        status = "available" if exists else "missing"
        size_info = ""
        if exists:
            size_mb = Path(path).stat().st_size / (1024 * 1024)
            size_info = f" ({size_mb:.1f}MB)"
        lines.append(f"- {label}: {path} ({status}){size_info}")
    return "\n".join(lines)


async def _sleep_with_jitter(min_delay: float = MIN_STEP_DELAY, max_delay: float = MAX_STEP_DELAY) -> None:
    """Sleep with randomized jitter to avoid bot detection."""
    delay = random.uniform(min_delay, max_delay)
    logger.debug(f"Rate limiting: sleeping {delay:.2f}s")
    await asyncio.sleep(delay)


async def _discover_form_url(initial_url: str, model: str = DISCOVERY_MODEL) -> tuple[str, dict[str, Any]]:
    """
    Detect if initial_url is a form or directory, find direct form link if needed.
    Returns (form_url, metadata).
    """
    logger.info(f"Discovering form URL from: {initial_url}")

    llm = _build_llm(model)
    browser = Browser(headless=True)

    discovery_task = f"""
You are analyzing a bursary website. Determine if the URL is:
1. A direct application form (proceed with application data)
2. A bursary directory/listing page (find and return the direct form link)

Visit this URL and analyze: {initial_url}

Return JSON with:
{{
  "form_type": "direct_form" | "directory" | "unsupported",
  "direct_form_url": "URL if found or same as input",
  "page_title": "page title",
  "fields_detected": ["field names visible"],
  "reasoning": "brief explanation"
}}

Only return valid JSON, no other text.
"""

    try:
        agent = Agent(
            task=discovery_task,
            llm=llm,
            browser=browser,
        )
        history = await agent.run(max_steps=20)
        result_text = history.final_result()
        if not result_text:
            raise RuntimeError("Discovery failed because the LLM returned no final result.")

        # Parse JSON from result
        try:
            metadata = json.loads(result_text)
            form_url = metadata.get("direct_form_url", initial_url)
            logger.info(f"Discovery result: {metadata['form_type']}")
            return form_url, metadata
        except json.JSONDecodeError:
            logger.warning(f"Could not parse discovery result, using initial URL")
            return initial_url, {"form_type": "unknown", "reasoning": "parse_failed"}

    except Exception as e:
        logger.error(f"Discovery failed: {e}")
        return initial_url, {"form_type": "error", "error": str(e)}

    finally:
        await browser.close()


async def _classify_form(form_url: str, model: str = DISCOVERY_MODEL) -> dict[str, Any]:
    """
    Screenshot form and analyze to classify type (simple, multi-step, complex, etc.).
    Returns classification metadata.
    """
    logger.info(f"Classifying form at: {form_url}")

    llm = _build_llm(model)
    browser = Browser(headless=True)

    classify_task = f"""
Visit {form_url} and analyze the form. Return JSON with:
{{
  "complexity": "simple" | "intermediate" | "complex",
  "estimated_fields": number,
  "multi_step": boolean,
  "requires_file_upload": boolean,
  "requires_login": boolean,
  "has_captcha": boolean,
  "payment_required": boolean,
  "field_categories": ["education", "financial", "personal", ...],
  "warnings": ["list of potential blockers"],
  "recommendation": "proceed" | "caution" | "skip"
}}
"""

    try:
        agent = Agent(
            task=classify_task,
            llm=llm,
            browser=browser,
        )
        history = await agent.run(max_steps=10)
        result_text = history.final_result()
        if not result_text:
            raise RuntimeError("Classification failed because the LLM returned no final result.")

        try:
            classification = json.loads(result_text)
            logger.info(f"Form classification: {classification['complexity']}")
            return classification
        except json.JSONDecodeError:
            return {"complexity": "unknown", "recommendation": "caution"}

    except Exception as e:
        logger.error(f"Classification failed: {e}")
        return {"complexity": "error", "error": str(e), "recommendation": "skip"}

    finally:
        await browser.close()


def _build_task(
    student: dict[str, Any],
    bursary_url: str,
    documents: dict[str, str],
    allow_submit: bool,
    form_classification: dict[str, Any],
) -> str:
    """Build optimized task prompt based on form classification."""
    submit_instruction = (
        "Submit the application only after all required fields are complete and you have reviewed the final screen."
        if allow_submit
        else (
            "Do not click the final submit/apply/send button. Stop at the final review "
            "screen or just before submission so the student can review."
        )
    )

    complexity_notes = ""
    if form_classification.get("complexity") == "complex":
        complexity_notes = """
SPECIAL INSTRUCTIONS FOR COMPLEX FORM:
- This form may have conditional fields. Read all labels carefully before filling.
- Take screenshots between major steps to understand the current state.
- If a field disappears after selection, that is normal.
"""

    return f"""
You are helping prepare a bursary application for a student who has given consent.

Target application URL: {bursary_url}
Form complexity: {form_classification.get('complexity', 'unknown')}

CRITICAL SAFETY RULES:
1. Use ONLY the student data below. Never invent missing values.
2. Do not guess at dates, ID numbers, income, or addresses.
3. If asked for a captcha, OTP, payment, login, or unsupported file format → STOP and report.
4. Upload documents ONLY when explicitly matched to available files.
5. Leave required fields blank rather than guess. Report missing info in final status.
6. {submit_instruction}

STUDENT PROFILE:
- Full name: {student.get("full_name")}
- ID number: {student.get("id_number")}
- Email: {student.get("email")}
- Phone: {student.get("phone")}
- University: {student.get("university")}
- Course/Degree: {student.get("course")}
- Year of study: {student.get("year_of_study")}
- Motivation: {student.get("motivation") or DEFAULT_MOTIVATION}

AVAILABLE DOCUMENTS:
{_document_notes(documents)}

{complexity_notes}

WORK TO COMPLETE:
1. Navigate to each form field carefully.
2. Fill every field that matches available student data.
3. Upload documents only when you find an exact match.
4. Screenshot before submission so the student can review.
5. Provide final report:
   - Current page/section
   - Fields completed
   - Documents uploaded
   - Any blockers or warnings
   - Confirmation number (only if submitted)
"""


async def _write_result_to_supabase(
    user_id: str,
    bursary_url: str,
    result: dict[str, Any],
) -> Optional[str]:
    """Write application result to Supabase bursary_results table."""
    if not SUPABASE_URL or not SUPABASE_KEY:
        logger.warning("Supabase not configured, skipping database write")
        return None

    try:
        async with httpx.AsyncClient() as client:
            payload = {
                "user_id": user_id,
                "bursary_url": bursary_url,
                "status": result.get("status"),
                "success": result.get("success"),
                "final_report": result.get("final_report"),
                "conversation_path": result.get("conversation_path"),
                "error": result.get("error"),
                "created_at": _utc_now(),
            }

            response = await client.post(
                f"{SUPABASE_URL}/rest/v1/bursary_results",
                headers={
                    "apikey": SUPABASE_KEY,
                    "Authorization": f"Bearer {SUPABASE_KEY}",
                    "Content-Type": "application/json",
                },
                json=payload,
                timeout=10,
            )

            if response.status_code in (200, 201):
                logger.info(f"Result saved to Supabase for user {user_id}")
                return bursary_url
            else:
                logger.error(f"Supabase write failed: {response.status_code}")
                return None

    except Exception as e:
        logger.error(f"Failed to write to Supabase: {e}")
        return None


def _write_artifact(payload: dict[str, Any], artifact_dir: str | Path) -> str:
    """Write application artifact to disk."""
    output_dir = Path(artifact_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    timestamp = _timestamp()
    safe_student = _safe_slug(payload.get("student"))
    path = output_dir / f"{timestamp}-{safe_student}-application.json"
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=True), encoding="utf-8")
    logger.debug(f"Artifact written to: {path}")
    return str(path)


async def apply_to_bursary(
    student: dict[str, Any],
    bursary_url: str,
    *,
    documents: dict[str, str] | None = None,
    allow_submit: bool = False,
    user_id: Optional[str] = None,
    artifact_dir: str | Path = "agent/artifacts",
    model: str = DEFAULT_MODEL,
    max_steps: int = MAX_STEPS,
    use_headless: bool = True,
    skip_discovery: bool = False,
    skip_classification: bool = False,
) -> dict[str, Any]:
    """
    Apply to a bursary on behalf of a student.

    Args:
        student: Student profile dict
        bursary_url: URL of bursary application
        documents: Paths to student documents
        allow_submit: If True, actually submit. Default is review-only.
        user_id: Supabase user_id for result tracking
        artifact_dir: Where to save conversation/GIF/JSON
        model: LLM to use (default Opus)
        max_steps: Max agent steps (default 80)
        use_headless: If False, run with visual mode (slower but more reliable)
        skip_discovery: If True, assume bursary_url is direct form
        skip_classification: If True, skip form type analysis
    """
    logger.info(
        f"Starting application for {student.get('full_name')} → {bursary_url} "
        f"(submit={allow_submit}, user_id={user_id})"
    )

    # Validate input
    _validate_url(bursary_url)
    missing_fields = _validate_student(student)
    normalised_documents = _normalise_documents(documents)

    if missing_fields:
        result = {
            "success": False,
            "status": "needs_student_info",
            "student": student.get("full_name"),
            "bursary_url": bursary_url,
            "missing_fields": sorted(set(missing_fields)),
            "created_at": _utc_now(),
        }
        result["artifact_path"] = _write_artifact(result, artifact_dir)
        logger.warning(f"Missing fields: {missing_fields}")
        if user_id:
            await _write_result_to_supabase(user_id, bursary_url, result)
        return result

    # Step 1: Discover form URL
    actual_url = bursary_url
    discovery_metadata = {}
    if not skip_discovery:
        await _sleep_with_jitter()
        try:
            actual_url, discovery_metadata = await _discover_form_url(bursary_url)
            if discovery_metadata.get("form_type") == "unsupported":
                result = {
                    "success": False,
                    "status": "unsupported_form",
                    "student": student.get("full_name"),
                    "bursary_url": bursary_url,
                    "discovery_metadata": discovery_metadata,
                    "created_at": _utc_now(),
                }
                result["artifact_path"] = _write_artifact(result, artifact_dir)
                if user_id:
                    await _write_result_to_supabase(user_id, bursary_url, result)
                return result
        except Exception as e:
            logger.error(f"Discovery error (continuing anyway): {e}")

    # Step 2: Classify form
    form_classification = {}
    if not skip_classification:
        await _sleep_with_jitter()
        try:
            form_classification = await _classify_form(actual_url)
            if form_classification.get("recommendation") == "skip":
                result = {
                    "success": False,
                    "status": "form_type_skip",
                    "student": student.get("full_name"),
                    "bursary_url": actual_url,
                    "classification": form_classification,
                    "created_at": _utc_now(),
                }
                result["artifact_path"] = _write_artifact(result, artifact_dir)
                if user_id:
                    await _write_result_to_supabase(user_id, bursary_url, result)
                return result
        except Exception as e:
            logger.error(f"Classification error (continuing anyway): {e}")

    # Step 3: Apply with optimized task
    output_dir = Path(artifact_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    run_id = f"{_timestamp()}-{_safe_slug(student.get('full_name'))}"
    conversation_path = output_dir / f"{run_id}-conversation.json"
    recording_path = output_dir / f"{run_id}-recording.gif"

    llm = _build_llm(model)
    browser = Browser(headless=use_headless)
    task = _build_task(student, actual_url, normalised_documents, allow_submit, form_classification)

    try:
        logger.info(f"Launching agent (headless={use_headless}, max_steps={max_steps})")
        agent = Agent(
            task=task,
            llm=llm,
            browser=browser,
            max_failures=3,
            save_conversation_path=str(conversation_path),
            generate_gif=str(recording_path),
            available_file_paths=[
                path for path in normalised_documents.values() if Path(path).exists()
            ],
        )

        # Run with timeout
        try:
            history = await asyncio.wait_for(
                agent.run(max_steps=max_steps),
                timeout=TIMEOUT_SECONDS,
            )
        except asyncio.TimeoutError:
            logger.error(f"Application timed out after {TIMEOUT_SECONDS}s")
            result = {
                "success": False,
                "status": "timeout",
                "student": student.get("full_name"),
                "bursary_url": actual_url,
                "timeout_seconds": TIMEOUT_SECONDS,
                "created_at": _utc_now(),
            }
            result["artifact_path"] = _write_artifact(result, artifact_dir)
            if user_id:
                await _write_result_to_supabase(user_id, bursary_url, result)
            return result

        final_report = history.final_result()

        result = {
            "success": True,
            "status": "submitted" if allow_submit else "review_required",
            "student": student.get("full_name"),
            "bursary_url": actual_url,
            "discovered_url": actual_url if actual_url != bursary_url else None,
            "allow_submit": allow_submit,
            "documents": normalised_documents,
            "discovery_metadata": discovery_metadata or None,
            "form_classification": form_classification or None,
            "conversation_path": str(conversation_path),
            "recording_path": str(recording_path),
            "final_report": final_report,
            "created_at": _utc_now(),
        }
        result["artifact_path"] = _write_artifact(result, artifact_dir)
        logger.info(f"Application completed: {result['status']}")

        if user_id:
            await _write_result_to_supabase(user_id, bursary_url, result)

        return result

    except Exception as error:
        logger.error(f"Application error: {error}", exc_info=True)
        result = {
            "success": False,
            "status": "failed",
            "student": student.get("full_name"),
            "bursary_url": actual_url,
            "allow_submit": allow_submit,
            "documents": normalised_documents,
            "conversation_path": str(conversation_path),
            "recording_path": str(recording_path),
            "error": str(error),
            "created_at": _utc_now(),
        }
        result["artifact_path"] = _write_artifact(result, artifact_dir)

        if user_id:
            await _write_result_to_supabase(user_id, bursary_url, result)

        return result

    finally:
        await browser.close()


def _load_json(path: str) -> dict[str, Any]:
    return json.loads(Path(path).read_text(encoding="utf-8"))


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="AI agent for bursary applications.")
    parser.add_argument("--student-json", help="Path to JSON file with student data.")
    parser.add_argument("--url", help="Direct bursary application URL.")
    parser.add_argument("--documents-json", help="Path to JSON file with document paths.")
    parser.add_argument(
        "--submit",
        action="store_true",
        help="Actually submit. Use only with explicit student approval.",
    )
    parser.add_argument("--user-id", help="Supabase user_id for result tracking.")
    parser.add_argument("--visual", action="store_true", help="Run in visual mode (slower, more reliable).")
    parser.add_argument("--skip-discovery", action="store_true", help="Skip form URL discovery.")
    parser.add_argument("--skip-classification", action="store_true", help="Skip form type analysis.")
    parser.add_argument("--verbose", action="store_true", help="Verbose logging.")
    return parser


if __name__ == "__main__":
    # Load Supabase config
    import os
    SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
    SUPABASE_KEY = os.getenv("VITE_SUPABASE_PUBLISHABLE_KEY")

    args = _build_parser().parse_args()
    _setup_logging(args.verbose)

    demo_student = {
        "full_name": "Test Student",
        "id_number": "0012345678901",
        "email": "test@student.example",
        "phone": "0812345678",
        "university": "Stellenbosch University",
        "course": "Bachelor of Accounting Sciences",
        "year_of_study": "3rd Year",
    }

    student_data = _load_json(args.student_json) if args.student_json else demo_student
    document_data = _load_json(args.documents_json) if args.documents_json else None
    target_url = args.url or "https://www.zabursaries.co.za/"

    logger.info("═" * 60)
    logger.info("BURSARY APPLICATION AGENT")
    logger.info(f"Student: {student_data.get('full_name')}")
    logger.info(f"Target: {target_url}")
    logger.info(f"Mode: {'submit' if args.submit else 'review'}")
    logger.info(f"Visual: {args.visual}")
    logger.info("═" * 60)

    output = asyncio.run(
        apply_to_bursary(
            student_data,
            target_url,
            documents=document_data,
            allow_submit=args.submit,
            user_id=args.user_id,
            use_headless=not args.visual,
            skip_discovery=args.skip_discovery,
            skip_classification=args.skip_classification,
        )
    )
    print(json.dumps(output, indent=2, ensure_ascii=True))
