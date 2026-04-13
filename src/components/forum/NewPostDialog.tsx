import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Database } from "@/integrations/supabase/types";

type ForumCategory = Database["public"]["Enums"]["forum_category"];

const categories: { value: ForumCategory; label: string }[] = [
  { value: "question", label: "Frage" },
  { value: "experience", label: "Erfahrung" },
  { value: "tip", label: "Tipp" },
  { value: "challenge", label: "Challenge" },
  { value: "motivation", label: "Motivation" },
];

interface NewPostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPostCreated: () => void;
}

export function NewPostDialog({ open, onOpenChange, onPostCreated }: NewPostDialogProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<ForumCategory>("question");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Titel und Inhalt sind erforderlich.");
      return;
    }
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Bitte melde dich an."); return; }

      const { error } = await supabase.from("forum_posts").insert({
        title: title.trim(),
        content: content.trim(),
        category,
        is_anonymous: isAnonymous,
        user_id: user.id,
      });
      if (error) throw error;

      await supabase.rpc("add_xp", {
        _user_id: user.id,
        _points: 15,
        _reason: "Forum-Beitrag erstellt",
        _source: "forum_post",
      });

      toast.success("+15 XP! Beitrag erstellt");
      setTitle(""); setContent(""); setIsAnonymous(false);
      onOpenChange(false);
      onPostCreated();
    } catch {
      toast.error("Fehler beim Erstellen des Beitrags.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-foreground">Neue Frage stellen</DialogTitle>
          <DialogDescription className="text-tertiary text-sm font-light">
            Teile deine Frage oder Erfahrung mit der Community.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-3">
          {/* Category segmented control */}
          <div>
            <Label className="text-xs text-tertiary mb-2 block uppercase tracking-wider">Kategorie</Label>
            <div className="flex gap-1 bg-muted rounded-xl p-1">
              {categories.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className={cn(
                    "flex-1 rounded-lg py-1.5 text-[12px] font-medium transition-all",
                    category === c.value
                      ? "bg-card text-foreground shadow-sm"
                      : "text-tertiary hover:text-foreground"
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs text-tertiary mb-1.5 block uppercase tracking-wider">Titel</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z.B. Wie geht ihr mit Nervosität um?"
              className="bg-transparent border-border rounded-2xl px-4 py-3 text-sm focus-visible:ring-0 focus-visible:border-primary"
              maxLength={200}
            />
          </div>

          <div>
            <Label className="text-xs text-tertiary mb-1.5 block uppercase tracking-wider">Inhalt</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Beschreibe dein Anliegen..."
              className="bg-transparent border-border rounded-2xl px-4 py-3 text-sm min-h-[120px] focus-visible:ring-0 focus-visible:border-primary"
              maxLength={5000}
            />
          </div>

          <div className="flex items-center justify-between rounded-xl bg-muted/50 p-3">
            <div>
              <Label className="text-sm text-foreground">Anonym posten</Label>
              <p className="text-[11px] text-tertiary">Dein Name wird als „Spieler #XXXX" angezeigt</p>
            </div>
            <Switch checked={isAnonymous} onCheckedChange={setIsAnonymous} />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-[10px] border border-border px-4 py-[11px] text-[13px] text-foreground hover:bg-muted/30 transition-colors"
            >
              Abbrechen
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 rounded-[10px] bg-primary text-primary-foreground px-4 py-[11px] text-[13px] font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? "Wird gepostet..." : "Veröffentlichen (+15 XP)"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
