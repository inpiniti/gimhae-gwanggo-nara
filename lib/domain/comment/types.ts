/** comment 도메인 — docs/domain/comment/overview.md */
export type PublicComment = {
  id: string;
  workId: string;
  nickname: string;
  body: string;
  isOwner: boolean;
  createdAt: string;
};
