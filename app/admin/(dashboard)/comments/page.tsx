import { CommentManager } from "@/components/admin/comment-manager";
import { listAllComments } from "@/lib/domain/comment/admin";
import { ko } from "@/lib/i18n/ko";

export default async function AdminCommentsPage() {
  const comments = await listAllComments();
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-[20px] font-bold">
        {ko.admin.nav.comments} <span className="text-muted-foreground tabular-nums">{comments.length}</span>
      </h1>
      <CommentManager comments={comments} />
    </div>
  );
}
