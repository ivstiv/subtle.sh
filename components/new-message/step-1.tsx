import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import type { useNewMessageForm } from "./use-new-message-form";

type Props = {
  form: ReturnType<typeof useNewMessageForm>;
};
export const Step1 = ({ form }: Props) => {
  return (
    <>
      <div className="mb-4 grid w-full items-center gap-1.5">
        <Label htmlFor="label">Label</Label>
        <Input
          type="text"
          id="label"
          placeholder="MY_SUPER_SECRET..."
          value={form.values.label}
          onChange={form.handleChange}
          disabled={form.isSubmitting}
        />
        <p className={cn("-mt-1 text-sm font-semibold text-destructive")}>
          {form.errors.label}
        </p>
      </div>
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          placeholder="as78e32yehuqwd..."
          value={form.values.content}
          onChange={form.handleChange}
          disabled={form.isSubmitting}
        />
        <p className={cn("-mt-1 text-sm font-semibold text-destructive")}>
          {form.errors.content}
        </p>
      </div>
    </>
  );
};
