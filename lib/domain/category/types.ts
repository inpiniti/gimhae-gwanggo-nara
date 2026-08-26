/** category 도메인 — docs/domain/category/overview.md */
export type Category = {
  code: string;
  name: string;
  color: string;
  sortOrder: number;
  isActive: boolean;
};

export type CategoryMap = Record<string, Category>;

export function toCategoryMap(list: Category[]): CategoryMap {
  return Object.fromEntries(list.map((c) => [c.code, c]));
}

/** 대표 카테고리 = sort_order 가 가장 작은 것 */
export function primaryCategory(codes: string[], map: CategoryMap): Category | undefined {
  return codes
    .map((c) => map[c])
    .filter(Boolean)
    .sort((a, b) => a.sortOrder - b.sortOrder)[0];
}
