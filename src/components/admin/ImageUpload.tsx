import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { uploadSiteImage } from "@/lib/site-image.functions";
import { inputCls, SecondaryButton } from "./AdminUI";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const s = String(r.result ?? "");
      const i = s.indexOf(",");
      resolve(i >= 0 ? s.slice(i + 1) : s);
    };
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

export function ImageUpload({
  value,
  onChange,
  label,
  hint,
  aspect = "landscape",
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
  aspect?: "landscape" | "square" | "logo";
}) {
  const upload = useServerFn(uploadSiteImage);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Max image size is 8 MB");
      return;
    }
    setBusy(true);
    try {
      const base64 = await fileToBase64(file);
      const res = await upload({
        data: { filename: file.name, contentType: file.type || "image/jpeg", base64 },
      });
      onChange(res.url);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  const previewCls =
    aspect === "square"
      ? "aspect-square"
      : aspect === "logo"
        ? "h-24"
        : "aspect-[16/9]";

  return (
    <div className="space-y-2">
      {label && <span className="block text-sm font-medium">{label}</span>}
      <div className="flex gap-4">
        <div
          className={`${previewCls} w-40 shrink-0 overflow-hidden rounded-md border border-border bg-secondary`}
        >
          {value ? (
            <img
              src={value}
              alt=""
              className={aspect === "logo" ? "h-full w-full object-contain p-2" : "h-full w-full object-cover"}
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-[10px] uppercase tracking-wide text-muted-foreground">
              No image
            </div>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <input
            type="url"
            className={inputCls}
            placeholder="https://… or upload"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onPick}
            />
            <SecondaryButton onClick={() => inputRef.current?.click()}>
              <Upload className="mr-1 h-3.5 w-3.5" />
              {busy ? "Uploading…" : value ? "Replace image" : "Upload image"}
            </SecondaryButton>
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                Clear
              </button>
            )}
          </div>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
      </div>
    </div>
  );
}