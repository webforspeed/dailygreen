import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";

export function UsernamePreviewForm() {
  return (
    <section className="mb-20 mt-8">
      <h2 className="section-label block-title mb-2 text-sm lowercase">preview another username</h2>
      <Card>
        <form id="username-form" className="flex gap-2">
          <Input id="username" name="username" type="text" placeholder="octocat" autoComplete="off" />
          <Button type="submit">Preview</Button>
        </form>
        <p id="error" className="mt-2 hidden text-sm text-red-600">
          Please enter a valid GitHub username.
        </p>
      </Card>
    </section>
  );
}
