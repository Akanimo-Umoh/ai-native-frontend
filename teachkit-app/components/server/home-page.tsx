import { ClientComponentSection } from "@/components/server/client-component-section";
import { HomeHeader } from "@/components/server/home-header";
import { ServerComponentSection } from "@/components/server/server-component-section";

export function HomePage() {
  return (
    <main className="mx-auto flex min-h-svh max-w-3xl flex-col gap-10 px-6 py-12">
      <HomeHeader />
      <ServerComponentSection />
      <ClientComponentSection />
    </main>
  );
}
