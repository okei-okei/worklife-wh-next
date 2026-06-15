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

export default async function PartnerCategoryRedirectPage({ params }: Props) {
  const { category } = await params;

  redirect(`/partners?category=${normalizeCategory(category)}`);
}
