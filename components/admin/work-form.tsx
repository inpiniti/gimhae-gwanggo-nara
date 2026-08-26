"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Category } from "@/lib/domain/category/types";
import { isInGimhae, type GeocodeResult, type Location } from "@/lib/domain/geo/types";
import { saveWork } from "@/lib/domain/work/actions";
import type { WorkInputType } from "@/lib/domain/work/policies";
import { makeSlug } from "@/lib/domain/work/slug";
import { ko } from "@/lib/i18n/ko";
import { cn } from "@/lib/utils";
import { AddressSearch } from "./address-search";
import { ImageUploader, type FormImage } from "./image-uploader";
import { LocationPicker } from "./location-picker";

type Props = {
  categories: Category[];
  initial?: WorkInputType & { imageUrls: string[] };
};

const t = ko.admin.form;

export function WorkForm({ categories, initial }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const isEdit = !!initial;

  const [id] = useState(() => initial?.id ?? crypto.randomUUID());
  const [shopName, setShopName] = useState(initial?.shopName ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [dong, setDong] = useState(initial?.addressDong ?? "");
  const [location, setLocation] = useState<Location | null>(
    initial ? { lng: initial.lng, lat: initial.lat } : null,
  );
  const [summary, setSummary] = useState(initial?.summary ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [workedAt, setWorkedAt] = useState(initial?.workedAt ?? new Date().toISOString().slice(0, 10));
  const [selected, setSelected] = useState<string[]>(initial?.categories ?? []);
  const [consent, setConsent] = useState(initial?.consent ?? false);
  const [isPublished, setIsPublished] = useState(initial?.isPublished ?? false);
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [images, setImages] = useState<FormImage[]>(
    (initial?.images ?? []).map((img, i) => ({ ...img, previewUrl: initial!.imageUrls[i], isNew: false })),
  );
  const [fieldError, setFieldError] = useState<string | null>(null);

  const activeCategories = useMemo(() => categories.filter((c) => c.isActive), [categories]);
  const primaryName = useMemo(() => {
    const first = activeCategories.find((c) => selected.includes(c.code));
    return first?.name.replace(/\(.*\)/, "") ?? "";
  }, [activeCategories, selected]);

  const autoSlug = makeSlug([shopName, dong, primaryName]);
  const effectiveSlug = slugTouched ? slug : autoSlug;

  const onAddressSelect = (r: GeocodeResult) => {
    setAddress(r.roadAddress);
    setDong(r.dong ?? "");
    setLocation(r.location);
  };

  const submit = () => {
    setFieldError(null);
    if (!location) {
      setFieldError("주소를 찾아 위치를 정해 주세요");
      return;
    }
    start(async () => {
      const res = await saveWork({
        id,
        slug: effectiveSlug,
        shopName,
        phone: phone || null,
        address,
        addressDong: dong || null,
        lng: location.lng,
        lat: location.lat,
        summary: summary || null,
        description: description || null,
        workedAt: workedAt || null,
        isPublished,
        consent,
        categories: selected,
        images: images.map(({ id, path, thumbPath, alt, width, height }) => ({
          id,
          path,
          thumbPath,
          alt: alt || null,
          width,
          height,
        })),
      } satisfies WorkInputType);
      if (res.ok) {
        toast.success(ko.admin.works.saved);
        router.push("/admin");
        router.refresh();
      } else {
        setFieldError(res.error);
        toast.error(res.error);
      }
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="flex flex-col gap-6"
    >
      <h1 className="text-[22px] font-bold">{isEdit ? t.titleEdit : t.titleNew}</h1>

      <Field label={t.shopName} required>
        <Input value={shopName} onChange={(e) => setShopName(e.target.value)} required className="h-11 rounded-xl" />
      </Field>

      <Field label={t.categories} required>
        <div className="flex flex-wrap gap-2">
          {activeCategories.map((c) => {
            const on = selected.includes(c.code);
            return (
              <button
                key={c.code}
                type="button"
                aria-pressed={on}
                onClick={() => setSelected(on ? selected.filter((x) => x !== c.code) : [...selected, c.code])}
                className={cn(
                  "h-10 rounded-full border px-4 text-sm font-semibold",
                  on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card",
                )}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label={t.address} required hint={location ? t.addressSelected : undefined}>
        <AddressSearch onSelect={onAddressSelect} />
        {address && (
          <div className="mt-2 flex flex-col gap-2">
            <Input value={address} onChange={(e) => setAddress(e.target.value)} className="h-11 rounded-xl" />
            <div className="flex items-center gap-2">
              <Label className="shrink-0 text-muted-foreground">{t.dong}</Label>
              <Input value={dong} onChange={(e) => setDong(e.target.value)} className="h-10 max-w-40 rounded-xl" />
            </div>
          </div>
        )}
        <div className="mt-2">
          <LocationPicker value={location} onChange={setLocation} />
        </div>
        {location && !isInGimhae(location) && (
          <p className="mt-1 text-sm text-warning">⚠️ {t.outsideGimhae}</p>
        )}
      </Field>

      <Field label={t.phone} hint={t.phoneHint}>
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" className="h-11 rounded-xl" />
      </Field>

      <Field label={t.summary} hint={t.summaryHint}>
        <Input value={summary} onChange={(e) => setSummary(e.target.value)} maxLength={120} className="h-11 rounded-xl" />
      </Field>

      <Field label={t.description}>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          maxLength={3000}
          className="rounded-xl"
        />
      </Field>

      <Field label={t.workedAt}>
        <Input type="date" value={workedAt} onChange={(e) => setWorkedAt(e.target.value)} className="h-11 max-w-56 rounded-xl" />
      </Field>

      <Field label={t.photos} hint={t.photosHint}>
        <ImageUploader
          workId={id}
          images={images}
          onChange={setImages}
          defaultAlt={(i) => `${shopName || "가게"} ${primaryName || "작업"} 사진 ${i + 1}`}
        />
      </Field>

      <Field label={t.slug} hint={t.slugHint}>
        <Input
          value={effectiveSlug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
          className="h-11 rounded-xl font-mono text-sm"
        />
      </Field>

      <div className="flex flex-col gap-3 rounded-2xl bg-secondary p-4">
        <label className="flex items-center gap-3 text-[15px]">
          <Checkbox checked={consent} onCheckedChange={(v) => setConsent(v === true)} className="size-5" />
          {t.consent}
        </label>
        <label className={cn("flex items-center gap-3 text-[15px]", !consent && "opacity-50")}>
          <Checkbox
            checked={isPublished}
            disabled={!consent}
            onCheckedChange={(v) => setIsPublished(v === true)}
            className="size-5"
          />
          {t.publish}
        </label>
        {!consent && <p className="text-xs text-muted-foreground">{ko.admin.works.needConsent}</p>}
      </div>

      {fieldError && <p className="text-sm text-destructive">{fieldError}</p>}

      <div className="sticky bottom-0 -mx-4 flex gap-2 border-t border-border bg-card/95 p-4 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border">
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="h-12 rounded-xl bg-secondary px-5 text-[15px] font-semibold text-secondary-foreground"
        >
          {t.close}
        </button>
        <button
          type="submit"
          disabled={pending}
          className="h-12 flex-1 rounded-xl bg-primary text-[15px] font-semibold text-primary-foreground disabled:opacity-60"
        >
          {pending ? t.saving : t.save}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-[15px] font-semibold">
        {label}
        {required && <span className="ml-0.5 text-primary">*</span>}
      </Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
