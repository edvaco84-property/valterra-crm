import { PipelineBoard } from "@/components/pipeline/pipeline-board";
import { PageShell } from "@/components/shared/page-shell";
import { permissions, requireRole } from "@/lib/permissions";
import { getPipelineColumns } from "@/lib/dashboard/queries";

export default async function PipelinePage() {
  await requireRole(permissions.managePipeline);
  const columns = await getPipelineColumns();

  return (
    <PageShell>
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Pipeline</p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-950">Embudo comercial</h1>
        <p className="mt-2 text-sm text-zinc-600">Vista real de etapas para detectar atasques antes de que se conviertan en excusas.</p>
      </div>
      <PipelineBoard columns={columns} />
    </PageShell>
  );
}
