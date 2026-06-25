"use client";

import { useMemo, useState } from "react";
import type { PartnerService } from "@/lib/constants/partners/types";

const currencies = ["JPY", "NZD", "AUD", "CAD"] as const;

const sampleRates: Record<string, number> = {
  "JPY-NZD": 0.011,
  "JPY-AUD": 0.0105,
  "JPY-CAD": 0.0094,
  "NZD-JPY": 91,
  "AUD-JPY": 95,
  "CAD-JPY": 106,
  "NZD-AUD": 0.96,
  "AUD-NZD": 1.04,
  "NZD-CAD": 0.86,
  "CAD-NZD": 1.16,
  "AUD-CAD": 0.9,
  "CAD-AUD": 1.11,
};

const assumptions: Record<
  string,
  { feeRate: number; fixedFee: number; rateAdjustment: number; speed: string }
> = {
  "wise-transfer": { feeRate: 0.006, fixedFee: 200, rateAdjustment: 0.998, speed: "数分〜数営業日" },
  ofx: { feeRate: 0.004, fixedFee: 0, rateAdjustment: 0.996, speed: "1〜数営業日" },
  remitly: { feeRate: 0.008, fixedFee: 300, rateAdjustment: 0.995, speed: "即日〜数営業日" },
  "western-union": { feeRate: 0.012, fixedFee: 500, rateAdjustment: 0.992, speed: "即日〜数営業日" },
  "xe-money-transfer": { feeRate: 0.006, fixedFee: 100, rateAdjustment: 0.996, speed: "数分〜数営業日" },
  paysend: { feeRate: 0.01, fixedFee: 250, rateAdjustment: 0.993, speed: "即日〜数営業日" },
  revolut: { feeRate: 0.007, fixedFee: 0, rateAdjustment: 0.995, speed: "即日〜数営業日" },
  currencyfair: { feeRate: 0.005, fixedFee: 350, rateAdjustment: 0.996, speed: "数営業日" },
};

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("ja-JP", {
    maximumFractionDigits: currency === "JPY" ? 0 : 2,
  }).format(value);
}

export default function MoneyTransferSimulator({
  services,
}: {
  services: PartnerService[];
}) {
  const [fromCurrency, setFromCurrency] = useState("JPY");
  const [toCurrency, setToCurrency] = useState("NZD");
  const [amount, setAmount] = useState("300000");

  const results = useMemo(() => {
    const numericAmount = Number(amount) || 0;
    const baseRate =
      fromCurrency === toCurrency
        ? 1
        : sampleRates[`${fromCurrency}-${toCurrency}`] || 1;

    return services.map((service) => {
      const assumption =
        assumptions[service.id] || assumptions["wise-transfer"];
      const fee = numericAmount * assumption.feeRate + assumption.fixedFee;
      const sendable = Math.max(numericAmount - fee, 0);
      const received = sendable * baseRate * assumption.rateAdjustment;

      return {
        id: service.id,
        name: service.name,
        received,
        fee,
        speed: assumption.speed,
      };
    });
  }, [amount, fromCurrency, services, toCurrency]);

  return (
    <section className="rounded-2xl bg-white p-4 shadow md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            簡易送金シミュレーター
          </h2>
          <p className="mt-1 text-sm font-medium leading-6 text-gray-700">
            現時点では概算用のダミー計算です。実際のレート・手数料は公式サイトをご確認ください。
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <label>
          <span className="text-sm font-bold text-gray-900">送金元通貨</span>
          <select
            value={fromCurrency}
            onChange={(event) => setFromCurrency(event.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-3 font-medium text-gray-900"
          >
            {currencies.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="text-sm font-bold text-gray-900">送金先通貨</span>
          <select
            value={toCurrency}
            onChange={(event) => setToCurrency(event.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-3 font-medium text-gray-900"
          >
            {currencies.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="text-sm font-bold text-gray-900">送金額</span>
          <input
            type="number"
            min="0"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-3 font-medium text-gray-900"
          />
        </label>
      </div>

      <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-[720px] text-left text-sm">
          <thead className="bg-gray-50 text-gray-900">
            <tr>
              <th className="px-4 py-3 font-bold">サービス</th>
              <th className="px-4 py-3 font-bold">概算受取額</th>
              <th className="px-4 py-3 font-bold">手数料目安</th>
              <th className="px-4 py-3 font-bold">着金目安</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => (
              <tr key={result.id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-bold text-gray-900">
                  {result.name}
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">
                  {formatMoney(result.received, toCurrency)} {toCurrency}
                </td>
                <td className="px-4 py-3 font-medium text-gray-800">
                  {formatMoney(result.fee, fromCurrency)} {fromCurrency}
                </td>
                <td className="px-4 py-3 font-medium text-gray-800">
                  {result.speed}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 rounded-xl bg-gray-50 p-3 text-sm font-medium leading-6 text-gray-700">
        ※実際のレート・手数料・着金時間は、本人確認状況、送金額、支払方法、通貨、受取銀行によって変わります。申込前に必ず公式サイトをご確認ください。
      </p>
    </section>
  );
}
