import { BoundaryStatus } from "@/components/server/boundary-status";

export function ServerComponentSection() {
  return (
    <section aria-labelledby="server-heading" className="space-y-3">
      <h2 id="server-heading" className="text-lg font-semibold">
        1. Server Component
      </h2>
      <p className="text-sm text-muted-foreground">
        This block is rendered on the server for each request. It reads the
        server environment and reports whether a key exists, never the key
        itself.
      </p>
      <BoundaryStatus />
    </section>
  );
}
