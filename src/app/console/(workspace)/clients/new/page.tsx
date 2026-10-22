import { PageHeader, Panel } from "@/components/ui";
import { requireStaff } from "@/lib/auth";
import { NewClientForm } from "../../forms";

export default async function NewClientPage() {
  await requireStaff();
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader back={{ href: "/console/clients", label: "Clients" }} title="New client" subtitle="Company, first project and the person who will sign in." />
      <Panel>
        <NewClientForm />
      </Panel>
    </div>
  );
}
