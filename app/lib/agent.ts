const AGENT_BASE = (
  process.env.NEXT_PUBLIC_BESCOM_AGENT_URL ?? 'https://bescom-ev-agent.vercel.app'
).replace(/\/$/, '');

export async function queryAgent(message: string): Promise<string> {
  const res = await fetch(`${AGENT_BASE}/agent/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error(`Agent error: ${res.status}`);
  const data = await res.json();
  return data.reply as string;
}
