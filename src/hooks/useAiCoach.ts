import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AiTask {
  title: string;
  category: string;
  duration_min: number;
  why_this_helps: string;
  steps: string[];
  affirmation: string;
}

export function useAiTaskGenerator() {
  const [task, setTask] = useState<AiTask | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async (context?: string) => {
    setLoading(true);
    setTask(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Bitte melde dich an."); return; }

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-task`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ context }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Fehler bei der KI-Generierung");
      }

      const { task: generatedTask } = await res.json();
      setTask(generatedTask);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "KI-Aufgabe konnte nicht generiert werden.");
    } finally {
      setLoading(false);
    }
  };

  return { task, loading, generate, clear: () => setTask(null) };
}

export function useAiForumAnswer() {
  const [loading, setLoading] = useState(false);

  const generateAnswer = async (postId: string) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Bitte melde dich an."); return null; }

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-forum-answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ postId }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Fehler bei der KI-Antwort");
      }

      const { answer } = await res.json();
      toast.success("KI-Antwort wurde gepostet!");
      return answer;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "KI-Antwort konnte nicht generiert werden.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loading, generateAnswer };
}
