import { z } from "zod";

/** 관리자 폼 → 서버 액션 입력 (docs/domain/work/prd.md W-ADM-2/4) */
export const WorkImageInput = z.object({
  id: z.uuid().optional(),
  path: z.string().min(1),
  thumbPath: z.string().nullable(),
  alt: z.string().trim().max(120).nullable(),
  width: z.number().int().positive().nullable(),
  height: z.number().int().positive().nullable(),
});

export const WorkInput = z
  .object({
    id: z.uuid(),
    slug: z.string().trim().min(1).max(80),
    shopName: z.string().trim().min(1, "상호명을 입력해 주세요").max(60),
    phone: z.string().trim().max(20).nullable(),
    address: z.string().trim().min(1, "주소를 입력해 주세요").max(200),
    addressDong: z.string().trim().max(30).nullable(),
    lng: z.number().min(-180).max(180),
    lat: z.number().min(-90).max(90),
    summary: z.string().trim().max(120).nullable(),
    description: z.string().trim().max(3000).nullable(),
    workedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
    isPublished: z.boolean(),
    consent: z.boolean(),
    categories: z.array(z.string()).min(1, "작업 종류를 하나 이상 골라 주세요").max(10),
    images: z.array(WorkImageInput).max(30, "사진은 30장까지 올릴 수 있어요"),
  })
  .refine((v) => !v.isPublished || v.consent, {
    message: "가게 사장님의 게시 동의가 있어야 공개할 수 있어요",
    path: ["consent"],
  });

export type WorkInputType = z.infer<typeof WorkInput>;
export type WorkImageInputType = z.infer<typeof WorkImageInput>;

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string; field?: string };
