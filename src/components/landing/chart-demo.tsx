import { Card } from "../ui/card";

type ChartDemoProps = {
  origin: string;
  username: string;
};

export function ChartDemo({ origin, username }: ChartDemoProps) {
  return (
    <section className="mt-8">
      <h2 className="section-label block-title mb-2 text-sm lowercase">preview</h2>
      <Card>
        <img
          id="preview"
          src={`${origin}/${username}`}
          alt={`${username}'s Github chart`}
          className="preview-image w-full rounded-md border p-2"
        />
      </Card>
    </section>
  );
}
