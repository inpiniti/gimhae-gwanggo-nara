import type { PublicComment } from "@/lib/domain/comment/types";
import { ko } from "@/lib/i18n/ko";
import { cn } from "@/lib/utils";

function formatDate(iso: string) {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`;
}

/** 댓글 목록 (읽기). 작성 폼은 Phase 5. */
export function CommentList({ comments }: { comments: PublicComment[] }) {
  if (comments.length === 0) {
    return (
      <div className="rounded-2xl bg-muted p-5 text-center text-sm text-muted-foreground">
        💬 {ko.comment.empty}
      </div>
    );
  }
  return (
    <ul className="flex flex-col gap-2">
      {comments.map((c) => (
        <li
          key={c.id}
          className={cn("rounded-2xl p-3.5", c.isOwner ? "bg-accent" : "bg-secondary")}
        >
          <div className="flex items-center gap-2 text-[13px]">
            <span className="font-semibold">{c.nickname}</span>
            {c.isOwner && (
              <span className="rounded-md bg-primary px-1.5 py-0.5 text-[11px] font-semibold text-primary-foreground">
                {ko.comment.owner}
              </span>
            )}
            <span className="ml-auto text-muted-foreground tabular-nums">{formatDate(c.createdAt)}</span>
          </div>
          <p className="mt-1.5 text-[15px] leading-relaxed whitespace-pre-line">{c.body}</p>
        </li>
      ))}
    </ul>
  );
}
