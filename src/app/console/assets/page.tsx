import { PageHeader, Pill, ProtoNote } from "@/components/ui";
import { assets } from "@/lib/mock";

const tone = { Online: "success", Down: "danger", Degraded: "warning" } as const;

export default function AssetMonitor() {
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Asset Monitor" subtitle="Every site, app and pipeline you look after, with its health and renewals." />
      <div className="overflow-x-auto rounded-3xl border border-line bg-surface">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-muted">
              {["Asset", "Client", "Provider · tech", "Uptime (30d)", "SSL", "Domain", "Status"].map((h) => (
                <th key={h} className="px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {assets.map((a) => (
              <tr key={a.name}>
                <td className="px-4 py-3">
                  <span className="block font-medium">{a.name}</span>
                  <span className="text-xs text-muted">{a.type}</span>
                </td>
                <td className="px-4 py-3">{a.client}</td>
                <td className="px-4 py-3 text-muted">{a.provider} · {a.tech}</td>
                <td className="px-4 py-3">{a.uptime}</td>
                <td className="px-4 py-3 text-muted">{a.ssl}</td>
                <td className="px-4 py-3 text-muted">{a.domain}</td>
                <td className="px-4 py-3"><Pill tone={tone[a.status]}>{a.status}</Pill></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ProtoNote>live uptime, SSL and domain checks arrive in Phase 5; the inventory comes first in Phase 2.</ProtoNote>
    </div>
  );
}
