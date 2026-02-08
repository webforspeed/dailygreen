import { Card } from "../ui/card";

type ChartDemoProps = {
  origin: string;
  username: string;
};

export function ChartDemo({ origin, username }: ChartDemoProps) {
  return (
    <section className="mt-8">
      <h2 className="block-title mb-2 text-sm lowercase text-neutral-400">preview</h2>
      <Card>
        <img
          id="preview"
          src={`${origin}/${username}`}
          alt={`${username}'s Github chart`}
          className="w-full rounded-md border border-neutral-200 bg-white p-2"
        />
      </Card>
    </section>
  );
}
