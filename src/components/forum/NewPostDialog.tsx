import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GreenButton } from "@/components/ui/GreenButton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type ForumCategory = Database["public"]["Enums"]["forum_category"];

const categories: { value: ForumCategory; label: string }[] = [
  { value: "question", label: "🤔 Frage" },
  { value: "experience", label: "📖 Erfahrung" },
  { value: "tip", label: "💡 Tipp" },
  { value: "challenge", label: "🏆 Challenge" },
  { value: "motivation", label: "💪 Motivation" },
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
  const [tags, setTags] = useState("");
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

      const parsedTags = tags
        .split(",")
        .map((t) => t.trim().replace(/^#/, ""))
        .filter(Boolean)
        .slice(0, 5);

      const { error } = await supabase.from("forum_posts").insert({
        title: title.trim(),
        content: content.trim(),
        category,
        tags: parsedTags.length ? parsedTags : null,
        is_anonymous: isAnonymous,
        user_id: user.id,
      });

      if (error) throw error;

      // Award XP for posting
      await supabase.rpc("add_xp", {
        _user_id: user.id,
        _points: 15,
        _reason: "Forum-Beitrag erstellt",
        _source: "forum_post",
      });

      toast.success("+15 XP! Beitrag erstellt 🎉");
      setTitle(""); setContent(""); setTags(""); setIsAnonymous(false);
      onOpenChange(false);
      onPostCreated();
    } catch (err) {
      toast.error("Fehler beim Erstellen des Beitrags.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-foreground">Neuer Beitrag</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Teile deine Frage oder Erfahrung mit der Community.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Kategorie</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as ForumCategory)}>
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Titel</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z.B. Wie geht ihr mit Nervosität um?"
              className="bg-secondary border-border"
              maxLength={200}
            />
          </div>

          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Inhalt</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Beschreibe dein Anliegen..."
              className="bg-secondary border-border min-h-[120px]"
              maxLength={5000}
            />
          </div>

          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Tags (kommagetrennt)</Label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="#versagensangst, #torwart"
              className="bg-secondary border-border"
            />
          </div>

          <div className="flex items-center justify-between rounded-xl bg-secondary/50 p-3">
            <div>
              <Label className="text-sm text-foreground">Anonym posten</Label>
              <p className="text-[11px] text-muted-foreground">Dein Name wird als "Spieler #XXXX" angezeigt</p>
            </div>
            <Switch checked={isAnonymous} onCheckedChange={setIsAnonymous} />
          </div>

          <GreenButton onClick={handleSubmit} disabled={submitting} className="w-full">
            {submitting ? "Wird gepostet..." : "Beitrag veröffentlichen (+15 XP)"}
          </GreenButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
