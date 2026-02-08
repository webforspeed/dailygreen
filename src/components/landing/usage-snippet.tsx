import { Card } from "../ui/card";

type UsageSnippetProps = {
  origin: string;
  username: string;
};

export function UsageSnippet({ origin, username }: UsageSnippetProps) {
  const snippet = `<img src="${origin}/${username}" alt="${username}'s Github chart" />`;

  return (
    <section className="mt-10">
      <h2 className="block-title mb-2 text-sm lowercase text-neutral-400">usage</h2>
      <Card>
        <pre id="snippet" className="overflow-x-auto whitespace-pre-wrap break-all text-[14px] text-neutral-700">
          {snippet}
        </pre>
      </Card>
    </section>
  );
}
