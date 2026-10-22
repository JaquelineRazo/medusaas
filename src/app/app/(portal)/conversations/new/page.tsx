import { requireClient } from "@/lib/auth";
import { Conversation } from "./Conversation";

export default async function NewConversation({ searchParams }: { searchParams: Promise<{ intent?: string; project?: string }> }) {
  const { intent, project } = await searchParams;
  const { supabase, profile } = await requireClient();
  const { data: projects } = await supabase.from("projects").select("id, name").neq("status", "archived").order("created_at");
  return (
    <Conversation
      firstName={profile?.full_name?.split(" ")[0] ?? ""}
      projects={projects ?? []}
      initialKind={intent === "issue" || intent === "change" ? intent : undefined}
      initialProject={projects?.some((p) => p.id === project) ? project : undefined}
    />
  );
}
