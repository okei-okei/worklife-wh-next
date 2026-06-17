"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type ConsentItem = {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  required?: boolean;
};

type LegalConsentCheckboxesProps = {
  items: ConsentItem[];
  errorMessage?: string;
};

export function LegalConsentCheckboxes({
  items,
  errorMessage,
}: LegalConsentCheckboxesProps) {
  return (
    <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-sm font-bold text-gray-900">同意事項</p>
      <div className="space-y-3">
        {items.map((item) => (
          <label
            key={item.id}
            className="flex gap-3 text-sm font-medium leading-6 text-gray-900"
          >
            <input
              type="checkbox"
              checked={item.checked}
              onChange={(event) => item.onChange(event.target.checked)}
              className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300"
            />
            <span>
              {item.label}
              {item.required ? (
                <span className="ml-1 font-bold text-red-700">必須</span>
              ) : null}
            </span>
          </label>
        ))}
      </div>
      {errorMessage ? (
        <p className="rounded-lg bg-red-50 p-3 text-sm font-bold text-red-700">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

export function LegalLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} target="_blank" className="font-bold text-blue-700 underline">
      {children}
    </Link>
  );
}
