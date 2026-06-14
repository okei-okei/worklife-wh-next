export const jobStatusOptions = [
  "気になる",
  "応募予定",
  "応募済み",
  "返信待ち",
  "面接予定",
  "トライアル予定",
  "採用",
  "不採用",
  "辞退",
] as const;

export const propertyStatusOptions = [
  "気になる",
  "問い合わせ予定",
  "問い合わせ済み",
  "返信待ち",
  "内見予定",
  "申込済み",
  "入居決定",
  "見送り",
] as const;

const greenStatuses = new Set(["採用", "入居決定"]);
const blueStatuses = new Set([
  "応募済み",
  "問い合わせ済み",
  "面接予定",
  "内見予定",
  "トライアル予定",
]);
const amberStatuses = new Set(["応募予定", "問い合わせ予定", "返信待ち", "申込済み"]);
const redStatuses = new Set(["不採用", "辞退", "見送り"]);

export function getStatusBadgeClassName(status: string | null | undefined) {
  if (!status) {
    return "bg-gray-100 text-gray-800";
  }

  if (greenStatuses.has(status)) {
    return "bg-green-100 text-green-800";
  }

  if (blueStatuses.has(status)) {
    return "bg-blue-100 text-blue-800";
  }

  if (amberStatuses.has(status)) {
    return "bg-amber-100 text-amber-800";
  }

  if (redStatuses.has(status)) {
    return "bg-red-100 text-red-800";
  }

  return "bg-gray-100 text-gray-800";
}
