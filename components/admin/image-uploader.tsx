"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ArrowUp, ImagePlus, Star, X } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { removeUploadedImage, uploadWorkImage } from "@/lib/domain/work/image-client";
import type { WorkImageInputType } from "@/lib/domain/work/policies";
import { ko } from "@/lib/i18n/ko";

export type FormImage = WorkImageInputType & { previewUrl: string; isNew: boolean };

type Props = {
  workId: string;
  images: FormImage[];
  onChange: (next: FormImage[]) => void;
  defaultAlt: (index: number) => string;
};

const MAX = 30;

/** 다중 업로드, 순서 변경, 대표 지정, alt 입력 (W-ADM-4) */
export function ImageUploader({ workId, images, onChange, defaultAlt }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<{ n: number; total: number } | null>(null);

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const list = Array.from(files).slice(0, MAX - images.length);
    if (list.length === 0) {
      toast.error(`사진은 ${MAX}장까지 올릴 수 있어요`);
      return;
    }
    const next = [...images];
    for (let i = 0; i < list.length; i++) {
      setProgress({ n: i + 1, total: list.length });
      try {
        const up = await uploadWorkImage(list[i], workId);
        next.push({
          path: up.path,
          thumbPath: up.thumbPath,
          width: up.width,
          height: up.height,
          alt: defaultAlt(next.length),
          previewUrl: up.previewUrl,
          isNew: true,
        });
        onChange([...next]);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "사진을 올리지 못했어요");
      }
    }
    setProgress(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  const remove = async (i: number) => {
    const img = images[i];
    onChange(images.filter((_, idx) => idx !== i));
    if (img.isNew) {
      // 저장 전 새 사진은 즉시 Storage 에서 제거. 기존 사진은 saveWork 가 정리.
      await removeUploadedImage([img.path, ...(img.thumbPath ? [img.thumbPath] : [])]);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => addFiles(e.target.files)}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={!!progress}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-dashed border-primary/60 bg-accent text-sm font-semibold text-accent-foreground disabled:opacity-60"
      >
        <ImagePlus className="size-4" />
        {progress ? ko.admin.form.uploading(progress.n, progress.total) : ko.admin.form.addPhotos}
      </button>

      {images.length > 0 && (
        <ul className="flex flex-col gap-2">
          {images.map((img, i) => (
            <li key={img.path} className="flex gap-3 rounded-xl bg-secondary p-2">
              <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                <Image src={img.previewUrl} alt="" fill sizes="80px" className="object-cover" unoptimized />
                {i === 0 && (
                  <span className="absolute top-1 left-1 rounded bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                    대표
                  </span>
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <Input
                  value={img.alt ?? ""}
                  onChange={(e) => {
                    const next = [...images];
                    next[i] = { ...img, alt: e.target.value };
                    onChange(next);
                  }}
                  placeholder={ko.admin.form.alt}
                  className="h-9 rounded-lg text-sm"
                />
                <div className="flex gap-1">
                  {i > 0 && (
                    <>
                      <IconBtn onClick={() => move(i, 0)} label={ko.admin.form.makeCover}>
                        <Star className="size-3.5" />
                      </IconBtn>
                      <IconBtn onClick={() => move(i, i - 1)} label="위로">
                        <ArrowUp className="size-3.5" />
                      </IconBtn>
                    </>
                  )}
                  <IconBtn onClick={() => remove(i)} label={ko.admin.form.remove} danger>
                    <X className="size-3.5" />
                  </IconBtn>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function IconBtn({
  onClick,
  label,
  danger,
  children,
}: {
  onClick: () => void;
  label: string;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-8 items-center gap-1 rounded-lg bg-card px-2 text-xs font-semibold ${danger ? "text-destructive" : "text-secondary-foreground"}`}
    >
      {children}
      {label}
    </button>
  );
}
