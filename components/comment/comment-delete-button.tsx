"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { deleteOwnComment } from "@/lib/domain/comment/actions";
import { ko } from "@/lib/i18n/ko";

const t = ko.comment;

/** 본인 비밀번호로 삭제 (CM-4). 다이얼로그 보조 버튼은 "닫기" */
export function CommentDeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const submit = () =>
    start(async () => {
      const res = await deleteOwnComment({ id, password });
      if (res.ok) {
        toast.success(t.deleted);
        setOpen(false);
        setPassword("");
        router.refresh();
      } else setError(res.error);
    });

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="text-xs text-muted-foreground hover:text-foreground">
        {t.delete}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm rounded-3xl p-6">
          <DialogTitle className="text-[18px] font-bold">{t.deleteTitle}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">{t.deleteHint}</DialogDescription>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            className="mt-2 flex flex-col gap-3"
          >
            <Input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              placeholder={t.password}
              autoFocus
              className="h-12 rounded-xl"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-12 flex-1 rounded-xl bg-secondary text-[15px] font-semibold"
              >
                {ko.detail.close}
              </button>
              <button
                type="submit"
                disabled={pending || password.length === 0}
                className="h-12 flex-1 rounded-xl bg-destructive text-[15px] font-semibold text-white disabled:opacity-50"
              >
                {t.delete}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
