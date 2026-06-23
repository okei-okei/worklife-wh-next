"use client";

import { useMemo, useState } from "react";

type Props = {
  initialStayMonths?: number;
  initialWeeklyIncome?: number;
  initialWeeklyRent?: number;
  initialWeeklyFood?: number;
  initialWeeklyTransport?: number;
  initialWeeklyOther?: number;
  initialCost?: number;
  currentSavings?: number;
  showInputs?: boolean;
  compact?: boolean;
};

type MoneyField =
  | "initialCost"
  | "weeklyIncome"
  | "weeklyRent"
  | "weeklyFood"
  | "weeklyTransport"
  | "weeklyOtherCost"
  | "otherOneTimeCost"
  | "currentSavings";

function dateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + Math.max(months, 1));
  return next;
}

function currency(value: number) {
  return new Intl.NumberFormat("en-NZ", {
    style: "currency",
    currency: "NZD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function ReturnBalanceSimulator({
  initialStayMonths = 6,
  initialWeeklyIncome = 0,
  initialWeeklyRent = 0,
  initialWeeklyFood = 115,
  initialWeeklyTransport = 35,
  initialWeeklyOther = 80,
  initialCost = 0,
  currentSavings = 0,
  showInputs = true,
  compact = false,
}: Props) {
  const today = useMemo(() => new Date(), []);
  const [startDate, setStartDate] = useState(dateInputValue(today));
  const [returnDate, setReturnDate] = useState(
    dateInputValue(addMonths(today, initialStayMonths)),
  );
  const [values, setValues] = useState<Record<MoneyField, string>>({
    initialCost: initialCost ? initialCost.toFixed(2) : "0",
    weeklyIncome: initialWeeklyIncome ? initialWeeklyIncome.toFixed(2) : "0",
    weeklyRent: initialWeeklyRent ? initialWeeklyRent.toFixed(2) : "0",
    weeklyFood: initialWeeklyFood.toFixed(2),
    weeklyTransport: initialWeeklyTransport.toFixed(2),
    weeklyOtherCost: initialWeeklyOther.toFixed(2),
    otherOneTimeCost: "0",
    currentSavings: currentSavings ? currentSavings.toFixed(2) : "0",
  });

  const updateMoney = (field: MoneyField, value: string) =>
    setValues((current) => ({ ...current, [field]: value }));

  const result = useMemo(() => {
    const fromInput = (field: MoneyField) =>
      Math.max(Number(values[field]) || 0, 0);
    const fromProps = (value: number) => Math.max(Number(value) || 0, 0);

    const totalDays = showInputs
      ? Math.max(
          (new Date(`${returnDate}T00:00:00`).getTime() -
            new Date(`${startDate}T00:00:00`).getTime()) /
            86400000,
          0,
        )
      : Math.max(initialStayMonths, 0) * 30.44;

    const totalWeeks = totalDays / 7;
    const totalMonths = totalDays / 30.44;
    const weeklyIncome = showInputs
      ? fromInput("weeklyIncome")
      : fromProps(initialWeeklyIncome);
    const weeklyRent = showInputs ? fromInput("weeklyRent") : fromProps(initialWeeklyRent);
    const weeklyFood = showInputs ? fromInput("weeklyFood") : fromProps(initialWeeklyFood);
    const weeklyTransport = showInputs
      ? fromInput("weeklyTransport")
      : fromProps(initialWeeklyTransport);
    const weeklyOther = showInputs
      ? fromInput("weeklyOtherCost")
      : fromProps(initialWeeklyOther);
    const oneTimeCost = showInputs
      ? fromInput("initialCost") + fromInput("otherOneTimeCost")
      : fromProps(initialCost);
    const savings = showInputs ? fromInput("currentSavings") : fromProps(currentSavings);

    const totalIncome = weeklyIncome * totalWeeks;
    const totalLivingCost =
      (weeklyRent + weeklyFood + weeklyTransport + weeklyOther) * totalWeeks;
    const netChange = totalIncome - totalLivingCost - oneTimeCost;
    const finalBalance = savings + netChange;

    return {
      valid: totalDays > 0,
      totalWeeks,
      totalMonths,
      totalIncome,
      totalLivingCost,
      totalOneTimeCost: oneTimeCost,
      netChange,
      finalBalance,
      monthlySavings: totalMonths ? netChange / totalMonths : 0,
      weeklyBalance: totalWeeks ? netChange / totalWeeks : 0,
    };
  }, [
    currentSavings,
    initialCost,
    initialStayMonths,
    initialWeeklyFood,
    initialWeeklyIncome,
    initialWeeklyOther,
    initialWeeklyRent,
    initialWeeklyTransport,
    returnDate,
    showInputs,
    startDate,
    values,
  ]);

  const inputClass =
    "mt-1 h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-gray-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";
  const moneyFields: Array<[MoneyField, string]> = [
    ["currentSavings", "現在の貯金額"],
    ["initialCost", "初期費用"],
    ["weeklyIncome", "週収入"],
    ["weeklyRent", "週家賃"],
    ["weeklyFood", "週生活費"],
    ["weeklyTransport", "週交通費"],
    ["weeklyOtherCost", "その他週支出"],
    ["otherOneTimeCost", "その他一時費用"],
  ];

  const summaryRows = [
    ["滞在期間", `${result.totalMonths.toFixed(1)}か月`],
    ["総収入", currency(result.totalIncome)],
    ["総支出", currency(result.totalLivingCost)],
    ["初期費用", currency(result.totalOneTimeCost)],
    ["月平均", currency(result.monthlySavings)],
    ["週平均", currency(result.weeklyBalance)],
  ];

  return (
    <section
      className={`mb-6 overflow-hidden rounded-lg border border-gray-200 bg-white ${
        compact ? "p-4" : "p-4 md:p-6"
      }`}
    >
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-bold text-emerald-700">
            滞在期間から計算
          </p>
          <h2 className="mt-1 text-xl font-bold md:text-2xl">
            帰国時点の収支予測
          </h2>
          <p className="mt-2 text-sm font-medium leading-6 text-gray-700">
            {showInputs
              ? "開始日と帰国予定日、週ごとの収支を入力すると、帰国時の残高を試算します。"
              : "選択中の生活プランの収入・家賃と、生活費シミュレーションの入力内容から自動で試算します。"}
          </p>
        </div>
        {!showInputs ? (
          <p className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">
            選択中プランに連動
          </p>
        ) : null}
      </div>

      {showInputs ? (
        <div className="mt-5 space-y-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label>
              <span className="text-sm font-bold">渡航開始日</span>
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className={inputClass}
              />
            </label>
            <label>
              <span className="text-sm font-bold">帰国予定日</span>
              <input
                type="date"
                value={returnDate}
                min={startDate}
                onChange={(event) => setReturnDate(event.target.value)}
                className={inputClass}
              />
            </label>
            <label>
              <span className="text-sm font-bold">滞在月数</span>
              <input
                readOnly
                value={result.valid ? result.totalMonths.toFixed(1) : "-"}
                className={`${inputClass} bg-gray-100`}
              />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {moneyFields.map(([field, label]) => (
              <label key={field} className="min-w-0">
                <span className="block text-sm font-bold leading-5">
                  {label}
                </span>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-600">
                    $
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={values[field]}
                    onChange={(event) => updateMoney(field, event.target.value)}
                    className={`${inputClass} pl-7`}
                  />
                </div>
              </label>
            ))}
          </div>
        </div>
      ) : null}

      <div
        className={`mt-5 rounded-lg border p-4 ${
          result.valid && result.finalBalance < 0
            ? "border-red-200 bg-red-50"
            : "border-emerald-200 bg-emerald-50"
        }`}
      >
        {!result.valid ? (
          <p className="font-bold text-red-700">
            滞在期間は1か月以上になるように入力してください。
          </p>
        ) : (
          <>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold text-gray-700">
                  帰国時点の予想残高
                </p>
                <p
                  className={`mt-1 break-words text-3xl font-bold md:text-4xl ${
                    result.finalBalance < 0
                      ? "text-red-600"
                      : "text-green-700"
                  }`}
                >
                  {currency(result.finalBalance)}
                </p>
              </div>
              <p
                className={`text-sm font-bold leading-6 ${
                  result.finalBalance < 0 ? "text-red-700" : "text-green-800"
                }`}
              >
                {result.finalBalance < 0
                  ? "この条件では残高がマイナスになる可能性があります。"
                  : `約 ${currency(result.finalBalance)} 残る見込みです。`}
              </p>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-2 text-sm md:grid-cols-3">
              {summaryRows.map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-md border border-black/10 bg-white/70 p-3"
                >
                  <dt className="text-xs font-bold text-gray-600">{label}</dt>
                  <dd className="mt-1 break-words font-bold text-gray-900">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </>
        )}
      </div>

      <p className="mt-3 text-xs font-medium leading-5 text-gray-600">
        この結果は入力値をもとにした概算です。税金、為替、予期しない支出は含まれません。
      </p>
    </section>
  );
}
