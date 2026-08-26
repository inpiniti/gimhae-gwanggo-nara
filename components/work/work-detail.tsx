import Link from "next/link";
import { CategoryBadge } from "@/components/category/category-badge";
import { CommentForm } from "@/components/comment/comment-form";
import { CommentList } from "@/components/comment/comment-list";
import { listCategories } from "@/lib/domain/category/queries";
import { toCategoryMap } from "@/lib/domain/category/types";
import { listComments } from "@/lib/domain/comment/queries";
import { formatWorkedAt, type WorkDetail as WorkDetailModel } from "@/lib/domain/work/types";
import { ko } from "@/lib/i18n/ko";
import { WorkActions } from "./work-actions";
import { WorkGallery } from "./work-gallery";

type Props = { work: WorkDetailModel; variant: "panel" | "page" };

/** 상세 본문 — 패널/전체 페이지 공용 서버 컴포넌트 */
export async function WorkDetail({ work, variant }: Props) {
  const [categories, comments] = await Promise.all([listCategories(), listComments(work.id)]);
  const categoryMap = toCategoryMap(categories);
  const Heading = variant === "page" ? "h1" : "h2";

  return (
    <article className="flex flex-col gap-5">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-1.5">
          {work.categories.map(
            (c) => categoryMap[c] && <CategoryBadge key={c} category={categoryMap[c]} />,
          )}
        </div>
        <Heading className="text-[22px] leading-tight font-bold">{work.shopName}</Heading>
        {work.summary && <p className="text-[15px] text-secondary-foreground">{work.summary}</p>}
        <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[14px]">
          <dt className="text-muted-foreground">주소</dt>
          <dd>{work.address}</dd>
          {work.phone && (
            <>
              <dt className="text-muted-foreground">전화</dt>
              <dd className="tabular-nums">{work.phone}</dd>
            </>
          )}
          {work.workedAt && (
            <>
              <dt className="text-muted-foreground">{ko.detail.workedAt}</dt>
              <dd className="tabular-nums">{formatWorkedAt(work.workedAt)}</dd>
            </>
          )}
        </dl>
      </header>

      <WorkActions
        shopName={work.shopName}
        phone={work.phone}
        address={work.address}
        location={work.location}
        slug={work.slug}
      />

      <section>
        <h3 className="mb-2 text-[15px] font-bold">{ko.detail.photos}</h3>
        <WorkGallery images={work.images} />
      </section>

      {work.description && (
        <section className="text-[15px] leading-relaxed whitespace-pre-line">{work.description}</section>
      )}

      <section>
        <h3 className="mb-2 text-[15px] font-bold">
          {ko.comment.title}{" "}
          <span className="text-muted-foreground tabular-nums">{comments.length}</span>
        </h3>
        <CommentList comments={comments} />
        <div className="mt-3">
          <CommentForm workId={work.id} />
        </div>
      </section>

      <div className="flex gap-3 border-t border-border pt-4 text-[13px] font-semibold">
        <Link href="/about" className="text-primary">
          {ko.footer.about}
        </Link>
        <Link href="/privacy" className="text-muted-foreground">
          {ko.footer.privacy}
        </Link>
      </div>
    </article>
  );
}
