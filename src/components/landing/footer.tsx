import { Card } from "../ui/card";

const SOURCE_REPOSITORY_URL = "https://github.com/webforspeed/dailygreen";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-12 pb-10">
      <h2 className="section-label block-title mb-2 text-sm lowercase">source</h2>
      <Card className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="page-body text-sm">© {currentYear} webforspeed.</p>
        <p className="page-body text-sm">
          Source available on <a href={SOURCE_REPOSITORY_URL}>GitHub</a>.
        </p>
      </Card>
    </footer>
  );
}
