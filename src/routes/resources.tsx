import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FileText, ExternalLink } from "lucide-react";
import { publishedDocumentsQuery, formatFileSize } from "@/lib/documents";

export const Route = createFileRoute("/resources")({
  loader: ({ context }) => context.queryClient.ensureQueryData(publishedDocumentsQuery),
  head: () => ({
    meta: [
      { title: "Resources & Documents — Trillion Liberty Pte Ltd" },
      {
        name: "description",
        content:
          "Download catalogues, datasheets and technical PDF documents for marine and port equipment supplied by Trillion Liberty Pte Ltd.",
      },
      { property: "og:title", content: "Resources & Documents — Trillion Liberty" },
      {
        property: "og:description",
        content: "Catalogues, datasheets and technical documents available to download.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/resources" }],
  }),
  component: ResourcesPage,
});

function ResourcesPage() {
  const { data, isLoading } = useQuery(publishedDocumentsQuery);
  const docs = data ?? [];

  return (
    <>
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent-teal">
            Downloads
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold md:text-5xl">Resources & Documents</h1>
          <p className="mt-6 max-w-2xl text-primary-foreground/80">
            Catalogues, datasheets and technical documents for our marine and port equipment range.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-6">
                <div className="h-12 w-12 animate-pulse rounded-md bg-secondary" />
                <div className="mt-5 h-5 w-2/3 animate-pulse rounded bg-secondary" />
                <div className="mt-3 h-3 w-full animate-pulse rounded bg-secondary" />
                <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-secondary" />
                <div className="mt-6 h-9 w-32 animate-pulse rounded-md bg-secondary" />
              </div>
            ))}
          </div>
        ) : docs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-md bg-primary/10 text-primary">
              <FileText className="h-6 w-6" />
            </span>
            <h2 className="mt-5 text-lg font-bold">No documents available yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Please check back soon — catalogues and datasheets will be published here.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {docs.map((d) => (
              <article
                key={d.id}
                className="flex flex-col rounded-xl border border-border bg-card p-6 transition hover:shadow-md"
              >
                <span className="grid h-12 w-12 place-items-center rounded-md bg-primary/10 text-primary">
                  <FileText className="h-6 w-6" />
                </span>
                <h2 className="mt-5 text-lg font-bold">{d.title}</h2>
                {d.description && (
                  <p className="mt-2 text-sm text-muted-foreground">{d.description}</p>
                )}
                <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">
                  PDF · {formatFileSize(d.file_size)}
                </p>
                <a
                  href={d.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex w-fit items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                  View PDF <ExternalLink className="h-4 w-4" />
                </a>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
