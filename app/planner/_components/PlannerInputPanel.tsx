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
    <div className="mb-6 rounded-2xl bg-white p-5 shadow">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold">{title}</h2>

        {(summary || action) && (
          <div className="flex flex-wrap items-center gap-3">
            {summary ? (
              <span className="text-sm font-medium text-gray-600">
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
            <span className="mb-2 block text-sm font-bold text-gray-700">
              {input.label}
            </span>

            <div className="flex h-12 items-center rounded-lg border border-gray-300 bg-white px-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
              {input.prefix ? (
                <span className="mr-2 text-sm font-bold text-gray-500">
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
                className="min-w-0 flex-1 border-none bg-transparent text-base font-bold outline-none placeholder:text-gray-300"
              />

              {input.suffix ? (
                <span className="ml-2 whitespace-nowrap text-sm font-bold text-gray-500">
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
