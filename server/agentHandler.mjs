/**
 * Integration handler for the bursary application agent.
 * Call this from webhooks to trigger AI-powered form filling.
 *
 * Usage:
 *   POST /webhook/apply-bursary
 *   {
 *     "user_id": "550e8400-e29b-41d4-a716-446655440000",
 *     "bursary_url": "https://bursary-site.co.za/apply",
 *     "allow_submit": false
 *   }
 */

import { spawn } from 'child_process';
import { supabaseAdmin } from './supabaseAdmin.mjs';
import fs from 'fs';
import path from 'path';

/**
 * Fetch student profile from Supabase.
 */
async function getStudentProfile(userId) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw new Error(`Failed to fetch profile: ${error.message}`);
  return data;
}

/**
 * Run the Python agent as a subprocess.
 */
function runAgent(studentJson, agentArgs) {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(process.cwd(), 'agent', 'agent.py');

    const args = [
      pythonScript,
      '--student-json', studentJson,
      ...agentArgs,
    ];

    console.log(`[Agent] Spawning: python ${args.join(' ')}`);

    const agent = spawn('python', args, {
      cwd: process.cwd(),
      env: { ...process.env },
      timeout: 6 * 60 * 1000, // 6 minutes (agent timeout is 5 min)
    });

    let stdout = '';
    let stderr = '';

    agent.stdout.on('data', (data) => {
      stdout += data.toString();
      console.log(`[Agent stdout] ${data}`);
    });

    agent.stderr.on('data', (data) => {
      stderr += data.toString();
      console.error(`[Agent stderr] ${data}`);
    });

    agent.on('error', (error) => {
      console.error(`[Agent] Spawn error:`, error);
      reject(error);
    });

    agent.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(stdout);
          console.log(`[Agent] Success: ${result.status}`);
          resolve(result);
        } catch (parseError) {
          console.error(`[Agent] JSON parse failed:`, parseError);
          reject(new Error(`Failed to parse agent output: ${parseError.message}`));
        }
      } else {
        console.error(`[Agent] Process exited with code ${code}`);
        reject(new Error(`Agent exited with code ${code}: ${stderr}`));
      }
    });
  });
}

/**
 * Main webhook handler.
 */
export async function applyToBursary(req, res) {
  const { user_id, bursary_url, allow_submit = false } = req.body;

  // Validate input
  if (!user_id || !bursary_url) {
    return res.status(400).json({
      error: 'Missing user_id or bursary_url',
    });
  }

  console.log(`[Bursary Apply] Starting for user ${user_id} → ${bursary_url}`);

  try {
    // Fetch student profile
    const student = await getStudentProfile(user_id);
    console.log(`[Bursary Apply] Fetched profile for ${student.full_name}`);

    // Prepare student JSON as temp file (agent reads from file)
    const tempDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const tempStudentFile = path.join(tempDir, `student-${user_id}-${Date.now()}.json`);
    fs.writeFileSync(tempStudentFile, JSON.stringify(student, null, 2));

    // Build agent arguments
    const agentArgs = [
      '--url', bursary_url,
      '--user-id', user_id,
    ];

    if (allow_submit) {
      agentArgs.push('--submit');
    }

    // Run agent
    const result = await runAgent(tempStudentFile, agentArgs);

    // Clean up temp file
    fs.unlinkSync(tempStudentFile);

    // Return result
    return res.json({
      success: result.success,
      status: result.status,
      final_report: result.final_report,
      artifact_path: result.artifact_path,
      created_at: result.created_at,
    });

  } catch (error) {
    console.error(`[Bursary Apply] Error:`, error);
    return res.status(500).json({
      error: error.message,
    });
  }
}

/**
 * Fetch application status from Supabase.
 */
export async function getApplicationStatus(req, res) {
  const { user_id } = req.params;

  try {
    const { data, error } = await supabaseAdmin
      .from('bursary_results')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return res.json({
      user_id,
      applications: data,
      total: data?.length || 0,
    });

  } catch (error) {
    console.error(`[Get Status] Error:`, error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Get summary stats (admin only).
 */
export async function getApplicationStats(req, res) {
  try {
    // Total applications
    const { count: totalCount } = await supabaseAdmin
      .from('bursary_results')
      .select('*', { count: 'exact', head: true });

    // Successful applications
    const { count: successCount } = await supabaseAdmin
      .from('bursary_results')
      .select('*', { count: 'exact', head: true })
      .eq('success', true);

    // By status
    const { data: byStatus } = await supabaseAdmin
      .from('bursary_results')
      .select('status')
      .then(({ data, error }) => {
        if (error) throw error;
        const stats = {};
        data?.forEach(row => {
          stats[row.status] = (stats[row.status] || 0) + 1;
        });
        return { data: stats };
      });

    return res.json({
      total: totalCount,
      successful: successCount,
      success_rate: totalCount ? ((successCount / totalCount) * 100).toFixed(1) + '%' : 'N/A',
      by_status: byStatus,
    });

  } catch (error) {
    console.error(`[Stats] Error:`, error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Export handlers for Express/Fastify.
 */
export const handlers = {
  applyToBursary,
  getApplicationStatus,
  getApplicationStats,
};

/**
 * Example Express route setup:
 *
 * import { handlers } from './agentHandler.mjs';
 *
 * app.post('/webhook/apply-bursary', handlers.applyToBursary);
 * app.get('/api/applications/:user_id', handlers.getApplicationStatus);
 * app.get('/api/stats/applications', handlers.getApplicationStats);
 */
