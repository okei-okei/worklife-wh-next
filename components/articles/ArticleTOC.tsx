"use client";

import { useEffect, useState } from "react";

export type TocItem = {
  id: string;
  title: string;
  level: 2 | 3;
};

export default function ArticleTOC({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState(items[0]?.id || "");

  useEffect(() => {
    if (!items.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible?.target.id) setActiveId(visible.target.id);
      },
      { rootMargin: "-20% 0px -65% 0px" },
    );

    items.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [items]);

  if (!items.length) return null;

  const list = (
    <nav className="space-y-1">
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className={`block rounded-lg px-2 py-1.5 text-sm font-bold ${
            item.level === 3 ? "ml-3" : ""
          } ${
            activeId === item.id
              ? "bg-blue-50 text-blue-700"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          {item.title}
        </a>
      ))}
    </nav>
  );

  return (
    <>
      <details className="rounded-2xl border border-gray-200 bg-white p-3 md:hidden">
        <summary className="cursor-pointer text-sm font-bold text-gray-900">
          目次を開く
        </summary>
        <div className="mt-3">{list}</div>
      </details>
      <aside className="sticky top-20 hidden max-h-[calc(100vh-6rem)] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-3 shadow-sm md:block">
        <h2 className="mb-2 text-sm font-bold text-gray-900">目次</h2>
        {list}
      </aside>
    </>
  );
}
