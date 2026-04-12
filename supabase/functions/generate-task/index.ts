import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.103.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { context } = await req.json();

    // Fetch user profile
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

    // Fetch recent completions for mood
    const { data: recentCompletion } = await supabase
      .from("task_completions")
      .select("mood_after")
      .eq("user_id", user.id)
      .order("completed_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Weekly task count
    const monday = new Date();
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    monday.setHours(0, 0, 0, 0);
    const { count: weeklyCount } = await supabase
      .from("task_completions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("completed_at", monday.toISOString());

    // Active block
    const { data: activeBlock } = await supabase
      .from("block_progress")
      .select("*, block_programs(*)")
      .eq("user_id", user.id)
      .is("completed_at", null)
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const positionMap: Record<string, string> = {
      goalkeeper: "Torwart", defender: "Verteidiger", midfielder: "Mittelfeldspieler", striker: "Stürmer", other: "Spieler"
    };

    const challengesList = profile?.challenges?.join(", ") || "keine angegeben";
    const position = positionMap[profile?.position || "other"] || "Spieler";
    const mood = recentCompletion?.mood_after ? `${recentCompletion.mood_after}/5` : "unbekannt";
    const blockInfo = activeBlock?.block_programs
      ? `Aktives Block-Programm: "${activeBlock.block_programs.title}", Tag ${activeBlock.current_step} von 5`
      : "Kein aktives Block-Programm";
    const contextInfo = context || "allgemeine Aufgabe";

    const systemPrompt = `Du bist ein erfahrener Sportpsychologe und Mentalcoach für Fußballer. Du erstellst personalisierte mentale Trainingsaufgaben.

Antworte IMMER mit einem JSON-Objekt im folgenden Format (keine Markdown-Codeblöcke):
{
  "title": "Kurzer Aufgabentitel",
  "category": "focus|confidence|pressure|team|recovery|visualization",
  "duration_min": 5-20,
  "why_this_helps": "2-3 Sätze wissenschaftlich fundiert",
  "steps": ["Schritt 1", "Schritt 2", ...],
  "affirmation": "Persönlicher Affirmationssatz"
}`;

    const userPrompt = `Erstelle eine personalisierte mentale Trainingsaufgabe für diesen Spieler:
- Position: ${position}
- Herausforderungen: ${challengesList}
- Letzte Stimmung: ${mood}
- Aufgaben diese Woche: ${weeklyCount || 0}
- ${blockInfo}
- Kontext: ${contextInfo}

Passe die Aufgabe an die spezifische Situation an. Die Schritte müssen konkret und umsetzbar sein.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "create_task",
            description: "Create a personalized mental training task",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string" },
                category: { type: "string", enum: ["focus", "confidence", "pressure", "team", "recovery", "visualization"] },
                duration_min: { type: "number", minimum: 3, maximum: 20 },
                why_this_helps: { type: "string" },
                steps: { type: "array", items: { type: "string" } },
                affirmation: { type: "string" },
              },
              required: ["title", "category", "duration_min", "why_this_helps", "steps", "affirmation"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "create_task" } },
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limit erreicht. Bitte versuche es später erneut." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "AI-Guthaben aufgebraucht." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI gateway error: ${status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in response");

    const task = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ task }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-task error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
