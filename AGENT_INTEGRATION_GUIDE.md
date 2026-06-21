# Bursary Agent Integration Guide

This guide shows how to integrate the enhanced AI bursary application agent into unipage.io.

---

## Architecture Overview

```
┌─────────────────────┐
│  unipage.io Frontend │
│  (React + Supabase)  │
└──────────┬──────────┘
           │ POST /webhook/apply-bursary
           ↓
┌─────────────────────────────────────────┐
│  Railway Node.js Backend                │
│  - agentHandler.mjs (webhook receiver)  │
│  - supabaseAdmin.mjs (DB access)        │
└──────────┬──────────────────────────────┘
           │ spawn('python agent.py')
           ↓
┌─────────────────────────────────────────┐
│  Python Agent (agent.py)                │
│  - Discovery phase                      │
│  - Classification phase                 │
│  - Form filling + submission            │
│  - Supabase result write                │
└──────────┬──────────────────────────────┘
           │ async write to table
           ↓
┌─────────────────────────────────────────┐
│  Supabase PostgreSQL                    │
│  - bursary_results table                │
└─────────────────────────────────────────┘
```

---

## Files Modified/Created

| File | Purpose |
|------|---------|
| `agent/agent.py` | **Rewritten** — Core AI agent (discovery, classification, apply) |
| `agent/requirements.txt` | **Updated** — Python dependencies |
| `agent/PRODUCTION_ENHANCEMENTS.md` | **New** — Detailed enhancements documentation |
| `agent/AGENT_SUMMARY.md` | **New** — Quick reference guide |
| `server/agentHandler.mjs` | **New** — Express webhook handlers |
| `AGENT_INTEGRATION_GUIDE.md` | **New** — This file |

---

## Step 1: Database Schema

Add the `bursary_results` table to Supabase:

```sql
CREATE TABLE bursary_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bursary_url TEXT NOT NULL,
  status TEXT NOT NULL,  -- 'submitted', 'review_required', 'timeout', 'failed', etc.
  success BOOLEAN NOT NULL,
  final_report TEXT,
  conversation_path TEXT,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_bursary_results_user_id ON bursary_results(user_id);
CREATE INDEX idx_bursary_results_status ON bursary_results(status);
```

---

## Step 2: Environment Variables

In Railway (or local `.env`):

```bash
# Agent configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_public_DNPyAujAfSL...
ANTHROPIC_API_KEY=sk-ant-v0-...

# Optional: Python runtime path (if not in $PATH)
PYTHON_PATH=/usr/bin/python3
```

---

## Step 3: Install Agent Dependencies

In your Railway deployment:

```bash
# Install Python agent dependencies
pip install -r agent/requirements.txt
```

Or add to your build process:

```dockerfile
RUN cd /app && pip install -r agent/requirements.txt
```

---

## Step 4: Add Webhook Handlers

In `server/index.mjs` (or your main Express app):

```javascript
import { handlers } from './agentHandler.mjs';

// Apply to a specific bursary
app.post('/webhook/apply-bursary', handlers.applyToBursary);

// Get user's applications
app.get('/api/applications/:user_id', handlers.getApplicationStatus);

// Admin stats
app.get('/api/stats/applications', handlers.getApplicationStats);
```

---

## Step 5: Call from Frontend

In your React component (e.g., `Dashboard.tsx` or `BursaryMatches.tsx`):

```typescript
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';

export function BursaryCard({ bursary }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isApplying, setIsApplying] = useState(false);

  const handleAutoApply = async () => {
    if (!user?.id) {
      toast({ description: 'Please log in first' });
      return;
    }

    setIsApplying(true);
    try {
      const response = await fetch('/webhook/apply-bursary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          bursary_url: bursary.url,
          allow_submit: false, // Review first
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Application Ready',
          description: result.final_report,
        });
      } else {
        toast({
          title: 'Application Failed',
          description: result.error || result.final_report,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h3>{bursary.name}</h3>
      </CardHeader>
      <CardContent>
        <p>{bursary.description}</p>
        <Button
          onClick={handleAutoApply}
          disabled={isApplying}
        >
          {isApplying ? 'Applying...' : 'Auto-Apply'}
        </Button>
      </CardContent>
    </Card>
  );
}
```

---

## Step 6: Show Application Status

In a new page (`src/pages/Applications.tsx`):

```typescript
import { useAuth } from '@/components/auth/AuthProvider';
import { useQuery } from '@tanstack/react-query';

export default function Applications() {
  const { user } = useAuth();

  const { data: applications, isLoading } = useQuery({
    queryKey: ['applications', user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/applications/${user?.id}`);
      return res.json();
    },
    enabled: !!user?.id,
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Your Applications</h1>
      {applications?.applications?.map((app) => (
        <Card key={app.id}>
          <CardHeader>
            <p className="text-sm text-gray-500">{app.bursary_url}</p>
            <Badge variant={app.success ? 'default' : 'destructive'}>
              {app.status}
            </Badge>
          </CardHeader>
          <CardContent>
            <p>{app.final_report}</p>
            {app.error && <p className="text-red-500">{app.error}</p>}
            <p className="text-xs text-gray-400 mt-2">
              {new Date(app.created_at).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

---

## Step 7: Integrate into Dashboard Sidebar

Add to `src/components/dashboard/DashboardSidebar.tsx`:

```typescript
// Add to navigation items
{
  label: 'Applications',
  path: '/dashboard/applications',
  icon: CheckCircle,
}
```

And add route in `src/pages/Dashboard.tsx`:

```typescript
<Route path="applications" element={<Applications />} />
```

---

## Testing

### Local Test (No Submission)

```bash
cd /path/to/project

# Set env vars
export VITE_SUPABASE_URL=https://your-project.supabase.co
export VITE_SUPABASE_PUBLISHABLE_KEY=sb_public_...
export ANTHROPIC_API_KEY=sk-ant-...

# Run agent directly
python agent/agent.py \
  --student-json test_student.json \
  --url https://www.zabursaries.co.za/ \
  --verbose
```

### Webhook Test

```bash
curl -X POST http://localhost:3000/webhook/apply-bursary \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "bursary_url": "https://www.zabursaries.co.za/",
    "allow_submit": false
  }'
```

### Check Status

```bash
curl http://localhost:3000/api/applications/550e8400-e29b-41d4-a716-446655440000
```

---

## Monitoring

### Agent Logs

```bash
# Tail agent logs in production
tail -f agent_operations.log
```

### Supabase Dashboard

```sql
-- View all applications
SELECT user_id, bursary_url, status, success, created_at
FROM bursary_results
ORDER BY created_at DESC
LIMIT 20;

-- Success rate
SELECT 
  status,
  COUNT(*) as count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) as percent
FROM bursary_results
GROUP BY status;

-- By user
SELECT 
  user_id,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE success) as successful
FROM bursary_results
GROUP BY user_id
ORDER BY total DESC;
```

---

## Troubleshooting

### Agent Times Out

→ Increase `TIMEOUT_SECONDS` in `agent/agent.py`  
→ Check network/site latency  
→ Use `--visual` flag to see what's happening

### "Captcha Detected"

→ Agent stops automatically (can't solve CAPTCHAs)  
→ User must manually verify and resubmit  
→ Future: integrate with CAPTCHA service

### "Form Type Skip"

→ Form flagged as unsupported  
→ Use `--visual --skip-classification` to override  
→ Or investigate form structure and adjust prompts

### Supabase Write Failed

→ Check env vars set correctly  
→ Verify `bursary_results` table exists  
→ Check Supabase API key has correct permissions

---

## Performance Notes

- **Discovery phase:** ~10-15s (visits URL, analyzes structure)
- **Classification phase:** ~5-10s (screenshots form, analyzes)
- **Application phase:** ~30-120s (depends on form complexity)
- **Total:** ~1-3 minutes per application

Run phases in parallel when possible or skip for known forms.

---

## Security Considerations

1. **Student Data** — Only use authenticated requests; validate user_id matches
2. **API Key** — Never commit ANTHROPIC_API_KEY to repo; use Railway secrets
3. **Documents** — Validate file paths before passing to agent; scan for malware
4. **Supabase Key** — Use publishable key (anon) for agent, service key for admin
5. **Rate Limiting** — Agent includes jitter; add endpoint rate limiting in Express
6. **Submission** — Always require `allow_submit=true` explicitly; log submissions

---

## Future Enhancements

- [ ] Batch processing (queue multiple applications)
- [ ] CAPTCHA solving via API
- [ ] PDF document extraction
- [ ] Webhook notifications (Slack/email on completion)
- [ ] Form template caching (skip discovery for repeat URLs)
- [ ] A/B testing (visual vs headless per form)
- [ ] Prometheus metrics export
- [ ] Auto-submit on high confidence

---

## Support

For issues or questions:
1. Check logs: `agent_operations.log`
2. Review artifacts: `agent/artifacts/`
3. Test locally first: `python agent/agent.py --verbose`
4. Check Supabase table: `SELECT * FROM bursary_results ORDER BY created_at DESC`
