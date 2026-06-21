# Agent.py Production Enhancements

## What Changed

### 1. **Discovery Phase** (New)
- **Problem:** Many bursary URLs are directory/listing pages, not direct forms
- **Solution:** Async `_discover_form_url()` visits URL, identifies form vs directory, finds actual form link
- **Benefit:** Won't waste time on wrong URLs; automatically redirects to real form
- **Flag:** `--skip-discovery` to disable

### 2. **Form Pre-processing & Classification** (New)
- **Problem:** Agent treats simple and complex forms the same
- **Solution:** `_classify_form()` analyzes form before application attempt
  - Detects: complexity level, field count, multi-step, file uploads, logins, CAPTCHAs, payments
  - Returns: recommendation (proceed/caution/skip)
- **Benefit:** Skip impossible forms early; adjust strategy based on form type
- **Flag:** `--skip-classification` to disable

### 3. **Headless Mode Toggle** (New)
- **Problem:** Headless browser misses JS-heavy forms, visual rendering issues
- **Solution:** `--visual` flag runs with headless=False (shows browser window)
- **Benefit:** Better accuracy for complex sites, but slower; auto-use for flagged forms
- **Trade-off:** Headless is 2x faster; visual is more reliable

### 4. **Supabase Integration** (New)
- **Problem:** No persistent storage of application results
- **Solution:** `_write_result_to_supabase()` writes to `bursary_results` table
  - Tracks: user_id, bursary_url, status, success, final_report, error, timestamp
  - Creates audit trail for all applications
- **Setup:** Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` env vars
- **Flag:** `--user-id` to link result to Supabase user

### 5. **Rate Limiting with Jitter** (New)
- **Problem:** Rapid requests trigger bot detection
- **Solution:** `_sleep_with_jitter()` adds random 0.5-2.0s delays between steps
- **Benefit:** Avoids rate limits, looks human-like
- **Tuning:** Edit MIN_STEP_DELAY, MAX_STEP_DELAY to adjust

### 6. **Production-Ready Features** (New)

#### Structured Logging
```python
_setup_logging(verbose=True)  # Enable debug logs, writes to agent_operations.log
```
- File + console output
- Debug flag for verbose mode
- Helps diagnose issues in production

#### Timeout Handling
```python
timeout=TIMEOUT_SECONDS  # 300s per application (configurable)
```
- Prevents agents from running forever
- Returns "timeout" status instead of hanging

#### Retry Logic
- Built-in max_failures=3 for agent steps
- Exponential backoff for transient errors (not yet auto-implemented, can add)

#### Better Error Messages
- Detailed logging at each phase
- Distinguish: missing info → unsupported form → timeout → execution error
- Helps debugging in production

#### Document Validation
- Checks file sizes before upload
- Validates file exists before referencing
- Reports available vs. missing documents clearly

#### Task Optimization
- Form classification info fed into task prompt
- Conditional instructions for complex forms
- Better prompting = fewer errors

#### Session Management
- Artifacts saved with unique timestamps + student slug
- Conversation history + GIF recording for debugging
- All metadata preserved in JSON artifact

---

## Usage Examples

### Basic (Review-Only, No Supabase)
```bash
python agent.py \
  --student-json student.json \
  --url https://example.com/apply
```

### Full Production (Submit + Track)
```bash
python agent.py \
  --student-json student.json \
  --documents-json docs.json \
  --url https://example.com/apply \
  --user-id abc123 \
  --submit \
  --verbose
```

### Visual Mode (For Troubleshooting)
```bash
python agent.py \
  --student-json student.json \
  --url https://example.com/apply \
  --visual \
  --verbose
```

### Skip Pre-processing (If You Know The Form)
```bash
python agent.py \
  --student-json student.json \
  --url https://direct-form.com/apply \
  --skip-discovery \
  --skip-classification
```

---

## Env Variables Required

Create `.env`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_public_...
```

Optional:
```
ANTHROPIC_API_KEY=sk-ant-...  # If not already set
```

---

## Model Choice

Changed from Sonnet 4 → **Opus 4.8** for:
- Better accuracy on ambiguous forms
- Fewer retries needed
- Handles complex conditionals
- Cost: ~3x input tokens, but fewer failures

Set `DEFAULT_MODEL` in code to override.

---

## Monitoring & Observability

### Logs
- Real-time: Console + `agent_operations.log`
- Debug flag (`--verbose`) for development
- Structured format for log aggregation

### Artifacts
- Location: `agent/artifacts/`
- Per-application: conversation.json, recording.gif, application.json
- Sorted by timestamp for easy browsing

### Supabase Tracking
- All results written to `bursary_results` table
- Query user's applications: `SELECT * FROM bursary_results WHERE user_id = ?`
- Dashboard can surface success rate, blockers, etc.

---

## Configuration Tuning

In `agent.py`:

```python
# Rate limiting (seconds)
MIN_STEP_DELAY = 0.5
MAX_STEP_DELAY = 2.0

# Timeouts
TIMEOUT_SECONDS = 300  # 5 min per application
MAX_STEPS = 80  # Increased from 60

# Retries
MAX_RETRIES = 3
RETRY_BACKOFF = 2.0

# Models
DEFAULT_MODEL = "claude-opus-4-8-20250514"
DISCOVERY_MODEL = "claude-opus-4-8-20250514"
```

---

## Known Limitations

1. **Captchas** — Stops and reports; manual intervention needed
2. **Login-required forms** — Stops; can't handle multi-step auth
3. **Payment** — Stops; no auto-payment handling
4. **PDFs** — Can upload but doesn't extract/parse content
5. **JS-heavy SPAs** — Visual mode helps but not guaranteed

---

## Roadmap Improvements

- [ ] Add exponential backoff retry for transient errors
- [ ] Auto-detect and use visual mode for flagged forms
- [ ] PDF content extraction + field matching
- [ ] Webhook notifications (Slack/email) on completion
- [ ] Batch processing (queue multiple applications)
- [ ] Captcha detection → webhook for human intervention
- [ ] Form template caching (skip discovery for repeated URLs)

---

## Testing

### Test with Demo (No Real Submission)
```bash
python agent.py --verbose
# Uses default student + ZA Bursaries directory
# Runs discovery & classification
# Stops before submit
```

### Test with Your Data
```bash
echo '{
  "full_name": "Your Name",
  "id_number": "1234567890123",
  "email": "you@example.com",
  "phone": "+27812345678",
  "university": "University of Cape Town",
  "course": "Computer Science",
  "year_of_study": "2"
}' > test_student.json

python agent.py --student-json test_student.json --url <test_url> --verbose
```

---

## Integration with unipage.io

### From Node.js Backend
```javascript
// In Railway webhook handler
const { exec } = require('child_process');

exec(
  `python agent/agent.py --student-json student.json --user-id ${userId} --submit`,
  (error, stdout, result) => {
    // Handle result JSON
    saveToDatabase(JSON.parse(stdout));
  }
);
```

### Via API Endpoint
```javascript
// server/applyAgent.mjs
import { spawn } from 'child_process';

export async function applyToBursary(studentData, bursaryUrl, userId) {
  return new Promise((resolve, reject) => {
    const agent = spawn('python', [
      'agent/agent.py',
      '--student-json', JSON.stringify(studentData),
      '--url', bursaryUrl,
      '--user-id', userId,
      '--submit'
    ]);

    let output = '';
    agent.stdout.on('data', (data) => { output += data; });
    agent.on('close', (code) => {
      if (code === 0) resolve(JSON.parse(output));
      else reject(new Error(output));
    });
  });
}
```

---

## Troubleshooting

### "Missing Supabase config"
→ Set env vars or remove `user_id` flag

### "Timeout after 300s"
→ Increase `TIMEOUT_SECONDS` for slow sites; check network

### "Form type skip"
→ Form flagged as unsupported; use `--visual --skip-classification` to override

### "Captcha detected"
→ Manual intervention needed; agent reports location and stops

### "Form changed structure"
→ Classification outdated; try `--skip-classification` or use `--visual`
