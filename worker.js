const ALLOWED_ORIGIN = "https://likhithkveda-boop.github.io";
const MODEL = "@cf/qwen/qwen2.5-14b-instruct";
const EVENT_FACTS = `Confirmed event facts: This is the first death anniversary remembrance for S. Geetha. Date: Sunday, 25 October 2026. Morning pooja: 8:00 AM IST. Lunch: 12:00 PM. Venue: the family's residence in Rajahmundry, Andhra Pradesh, India. A family-provided Google Maps link is https://maps.app.goo.gl/4yqUkjHbmtVqX3X5A. The website contains a memorial photo gallery with 24 photographs. Do not invent a street address, travel route, rituals, contacts, or additional event details.`;
const hits = new Map();
function json(data, status, origin) {
  return new Response(JSON.stringify(data), { status, headers: {
    "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": origin || ALLOWED_ORIGIN, "Vary": "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type",
    "X-Content-Type-Options": "nosniff"
  }});
}
export default {
 async fetch(request, env) {
  const origin = request.headers.get("Origin") || "";
  if (origin !== ALLOWED_ORIGIN) return json({ error: "Origin not allowed" }, 403, ALLOWED_ORIGIN);
  if (request.method === "OPTIONS") return new Response(null, {status:204,headers:{"Access-Control-Allow-Origin":ALLOWED_ORIGIN,"Access-Control-Allow-Methods":"POST, OPTIONS","Access-Control-Allow-Headers":"Content-Type","Access-Control-Max-Age":"86400","Vary":"Origin"}});
  if (new URL(request.url).pathname !== "/chat") return json({error:"Not found"},404,origin);
  if (request.method !== "POST") return json({error:"Method not allowed"},405,origin);
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const now = Date.now(); let entry = hits.get(ip);
  if (!entry || now-entry.start > 60000) entry = {start:now,count:0};
  entry.count++; hits.set(ip,entry);
  if (entry.count > 12) return json({error:"Rate limit reached. Please wait a minute."},429,origin);
  let body; try { body = await request.json(); } catch { return json({error:"Invalid JSON"},400,origin); }
  const question = typeof body.question === "string" ? body.question.trim() : "";
  const language = body.language === "te" ? "Telugu" : "English";
  if (!question || question.length > 500) return json({error:"Question must be 1–500 characters"},400,origin);
  if (!env.AI) return json({error:"AI binding is not configured"},503,origin);
  try {
   const result = await env.AI.run(MODEL, { messages:[
    {role:"system",content:`You are a warm, respectful bilingual memorial event assistant for S. Geetha's first death anniversary. Reply in ${language} unless the user clearly asks for another language. Use natural, respectful Telugu for Telugu questions. Be concise, gentle, and helpful. ${EVENT_FACTS} Treat these event facts as the only confirmed event details. You may answer general questions, but do not invent personal details. If asked for unknown family, address, transport, or schedule details, say you do not have that confirmed information and suggest asking the family. Never claim to be a human or a relative. Do not request or encourage sharing sensitive personal information. No medical, legal, or financial advice is needed.`},
    {role:"user",content:question}
   ], max_tokens:350, temperature:0.3});
   let answer = result?.response;
   if (typeof answer !== "string" || !answer.trim()) throw new Error("Model returned no answer");
   return json({answer:answer.trim()},200,origin);
  } catch (e) { return json({error:"AI response unavailable"},502,origin); }
 }
};
