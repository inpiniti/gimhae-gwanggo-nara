"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { deleteComment, replyAsOwner, setCommentHidden, type AdminComment } from "@/lib/domain/comment/admin";
import { ko } from "@/lib/i18n/ko";
import { cn } from "@/lib/utils";

const t = ko.admin.comments;

export function CommentManager({ comments }: { comments: AdminComment[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [reply, setReply] = useState("");

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, okMsg: string) =>
    start(async () => {
      const res = await fn();
      if (res.ok) {
        toast.success(okMsg);
        setReplyTo(null);
        setReply("");
        router.refresh();
      } else toast.error(res.error ?? "실패했어요");
    });

  if (comments.length === 0) {
    return <div className="rounded-2xl bg-card p-12 text-center text-muted-foreground shadow-card">💬 {t.empty}</div>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {comments.map((c) => (
        <li key={c.id} className={cn("rounded-2xl bg-card p-4 shadow-card", c.isHidden && "opacity-60")}>
          <div className="flex flex-wrap items-center gap-2 text-[13px]">
            <Link href={`/works/${c.workSlug}`} target="_blank" className="font-semibold text-primary">
              {c.shopName}
            </Link>
            <span className="font-semibold">{c.nickname}</span>
            {c.isOwner && (
              <span className="rounded-md bg-primary px-1.5 py-0.5 text-[11px] font-semibold text-primary-foreground">
                {ko.comment.owner}
              </span>
            )}
            {c.isHidden && (
              <span className="rounded-md bg-warning/15 px-1.5 py-0.5 text-[11px] font-semibold text-warning">
                {t.hidden}
              </span>
            )}
            <span className="ml-auto text-muted-foreground tabular-nums">{c.createdAt.slice(0, 10).replaceAll("-", ".")}</span>
          </div>
          <p className="mt-2 text-[15px] whitespace-pre-line">{c.body}</p>
          <div className="mt-3 flex flex-wrap gap-1.5 text-xs font-semibold">
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => setCommentHidden(c.id, !c.isHidden), ko.admin.works.saved)}
              className="rounded-lg bg-secondary px-2.5 py-1.5"
            >
              {c.isHidden ? t.unhide : t.hide}
            </button>
            {!c.isOwner && (
              <button
                type="button"
                onClick={() => setReplyTo(replyTo === c.id ? null : c.id)}
                className="rounded-lg bg-secondary px-2.5 py-1.5"
              >
                {t.reply}
              </button>
            )}
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                if (window.confirm("이 댓글을 삭제할까요?")) run(() => deleteComment(c.id), ko.admin.works.deleted);
              }}
              className="ml-auto rounded-lg px-2.5 py-1.5 text-destructive"
            >
              {t.delete}
            </button>
          </div>
          {replyTo === c.id && (
            <div className="mt-3 flex flex-col gap-2">
              <Textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder={t.replyPlaceholder}
                className="rounded-xl"
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setReplyTo(null)} className="h-10 rounded-xl bg-secondary px-4 text-sm font-semibold">
                  {ko.admin.form.close}
                </button>
                <button
                  type="button"
                  disabled={pending || reply.trim().length === 0}
                  onClick={() => run(() => replyAsOwner({ workId: c.workId, body: reply }), "답글을 남겼어요")}
                  className="h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                >
                  {t.reply}
                </button>
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
