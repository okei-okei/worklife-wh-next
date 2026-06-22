import ArticleEditorForm from "../../_components/ArticleEditorForm";

type Props = { params: Promise<{ id: string }> };

export default async function EditArticlePage({ params }: Props) {
  const { id } = await params;
  return (
    <main className="min-h-screen bg-gray-100 p-4 text-gray-900 md:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header><p className="text-sm font-bold text-emerald-700">WorkLife WH Admin</p><h1 className="mt-1 text-2xl font-bold md:text-4xl">記事を編集</h1></header>
        <ArticleEditorForm articleId={id} />
      </div>
    </main>
  );
}
