"use client";

import imageCompression from "browser-image-compression";
import { createClient } from "@/lib/supabase/client";

export type UploadedImage = {
  path: string;
  thumbPath: string;
  width: number;
  height: number;
  previewUrl: string;
};

const MAX_INPUT_MB = 10;

/**
 * 브라우저에서 리사이즈/WebP 변환 후 Storage 업로드 (docs/domain/work/prd.md W-ADM-4).
 * canvas 재인코딩이라 EXIF(GPS 포함)는 제거되고 orientation 은 적용된다.
 */
export async function uploadWorkImage(file: File, workId: string): Promise<UploadedImage> {
  if (!file.type.startsWith("image/")) throw new Error("이미지 파일만 올릴 수 있어요");
  if (file.size > MAX_INPUT_MB * 1024 * 1024) throw new Error(`사진은 ${MAX_INPUT_MB}MB 이하만 올릴 수 있어요`);

  const [full, thumb] = await Promise.all([
    imageCompression(file, {
      maxWidthOrHeight: 1600,
      maxSizeMB: 1,
      fileType: "image/webp",
      initialQuality: 0.8,
      useWebWorker: true,
    }),
    imageCompression(file, {
      maxWidthOrHeight: 400,
      maxSizeMB: 0.15,
      fileType: "image/webp",
      initialQuality: 0.75,
      useWebWorker: true,
    }),
  ]);

  const bitmap = await createImageBitmap(full);
  const { width, height } = bitmap;
  bitmap.close();

  const id = crypto.randomUUID();
  const path = `${workId}/${id}.webp`;
  const thumbPath = `${workId}/${id}.thumb.webp`;

  const supabase = createClient();
  const bucket = supabase.storage.from("works");
  const [r1, r2] = await Promise.all([
    bucket.upload(path, full, { contentType: "image/webp", cacheControl: "31536000" }),
    bucket.upload(thumbPath, thumb, { contentType: "image/webp", cacheControl: "31536000" }),
  ]);
  if (r1.error) throw new Error(`업로드하지 못했어요 (${r1.error.message})`);
  if (r2.error) throw new Error(`업로드하지 못했어요 (${r2.error.message})`);

  return { path, thumbPath, width, height, previewUrl: URL.createObjectURL(thumb) };
}

/** 저장 전에 폼에서 제거된 새 사진은 즉시 Storage 에서 지운다 (고아 객체 방지) */
export async function removeUploadedImage(paths: string[]) {
  const supabase = createClient();
  await supabase.storage.from("works").remove(paths);
}
