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
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { postId } = await req.json();
    if (!postId) return new Response(JSON.stringify({ error: "postId required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // Get the post
    const { data: post } = await supabase.from("forum_posts").select("*").eq("id", postId).single();
    if (!post) return new Response(JSON.stringify({ error: "Post not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const systemPrompt = `Du bist der MindPitch KI-Coach, ein erfahrener Sportpsychologe und Mentalcoach für Fußballer.

Beantworte Fragen aus der Community mit folgendem Aufbau:
1. Einfühlsame Einleitung (1-2 Sätze, zeige Verständnis)
2. Erklärung des Phänomens (wissenschaftlich fundiert, 2-3 Sätze)
3. Konkrete Übung oder Technik (Schritt-für-Schritt, praktisch umsetzbar)
4. Ermutigender Abschluss (1-2 Sätze, motivierend)

Schreibe auf Deutsch, in einem warmen aber professionellen Ton. Verwende Absätze für bessere Lesbarkeit.`;

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
          { role: "user", content: `Kategorie: ${post.category}\nTitel: ${post.title}\n\n${post.content}` },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limit erreicht." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "AI-Guthaben aufgebraucht." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI gateway error: ${status}`);
    }

    const aiData = await aiResponse.json();
    const answer = aiData.choices?.[0]?.message?.content;
    if (!answer) throw new Error("No content in AI response");

    // Post the AI answer as a comment
    const { error: commentError } = await supabase.from("forum_comments").insert({
      post_id: postId,
      user_id: user.id,
      content: `🤖 **MindPitch KI-Coach**\n\n${answer}`,
      is_coach_reply: false,
    });
    if (commentError) throw commentError;

    return new Response(JSON.stringify({ answer }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-forum-answer error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
