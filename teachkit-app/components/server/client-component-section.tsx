import { LessonRequestForm } from "@/components/client/lesson-request-form";

export function ClientComponentSection() {
  return (
    <section aria-labelledby="client-heading" className="space-y-3">
      <h2 id="client-heading" className="text-lg font-semibold">
        2. Client Component and 3. Server Action
      </h2>
      <p className="text-sm text-muted-foreground">
        The form is a Client Component (it has state and handles events). On
        submit it calls a Server Action, which validates the input on the
        server and returns a typed result.
      </p>
      <LessonRequestForm />
    </section>
  );
}
