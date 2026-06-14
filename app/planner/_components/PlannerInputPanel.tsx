"use client";

import type { PlannerInputConfig } from "../_lib/types";

type PlannerInputPanelProps = {
  title: string;
  summary?: string;
  action?: React.ReactNode;
  inputs: PlannerInputConfig[];
  columnsClassName?: string;
};

export function PlannerInputPanel({
  title,
  summary,
  action,
  inputs,
  columnsClassName = "grid gap-4 md:grid-cols-3",
}: PlannerInputPanelProps) {
  return (
    <div className="mb-6 min-w-0 rounded-2xl bg-white p-4 text-gray-900 shadow md:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="min-w-0 whitespace-normal break-words text-xl font-bold md:text-2xl">
          {title}
        </h2>

        {(summary || action) && (
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
            {summary ? (
              <span className="text-sm font-bold text-gray-800">
                {summary}
              </span>
            ) : null}

            {action}
          </div>
        )}
      </div>

      <div className={columnsClassName}>
        {inputs.map((input) => (
          <label key={input.id} className="block">
            <span className="mb-2 block text-sm font-bold text-gray-900">
              {input.label}
            </span>

            <div className="flex h-12 items-center rounded-lg border border-gray-300 bg-white px-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
              {input.prefix ? (
                <span className="mr-2 text-sm font-bold text-gray-700">
                  {input.prefix}
                </span>
              ) : null}

              <input
                id={input.id}
                type="number"
                min="0"
                inputMode="decimal"
                value={input.value}
                onChange={(event) => input.onChange(event.target.value)}
                placeholder={input.placeholder}
                className="min-w-0 flex-1 border-none bg-transparent text-base font-bold text-gray-900 outline-none placeholder:text-gray-600"
              />

              {input.suffix ? (
                <span className="ml-2 whitespace-nowrap text-sm font-bold text-gray-700">
                  {input.suffix}
                </span>
              ) : null}
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
