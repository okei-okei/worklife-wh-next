import { redirect } from "next/navigation";

type Props = {
  params: Promise<{
    category: string;
  }>;
};

function normalizeCategory(category: string) {
  if (category === "remittance") return "money_transfer";
  if (category === "english") return "school";

  return category;
}

const categoryRedirects: Record<string, string> = {
  sim: "/partners/sim-esim",
  insurance: "/partners/insurance",
  bank: "/partners/bank",
  money_transfer: "/partners/money-transfer",
  "money-transfer": "/partners/money-transfer",
  power: "/partners/electricity",
  electricity: "/partners/electricity",
  internet: "/partners/internet",
  furniture: "/partners/furniture",
  school: "/partners/language-school",
  language_school: "/partners/language-school",
  "language-school": "/partners/language-school",
  travel: "/partners/flights-transport",
  flights_transport: "/partners/flights-transport",
  "flights-transport": "/partners/flights-transport",
};

export default async function PartnerCategoryRedirectPage({ params }: Props) {
  const { category } = await params;
  const normalizedCategory = normalizeCategory(category);

  redirect(
    categoryRedirects[normalizedCategory] ||
      `/partners?category=${normalizedCategory}`,
  );
}
