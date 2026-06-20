/**
 * Renders a JSON-LD <script> for structured data so search engines and AI
 * assistants can read the page as data. Server component — no client JS.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
