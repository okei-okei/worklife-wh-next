type ViewMode = "list" | "map";

export default function ListMapToggle({
  value,
  onChange,
}: {
  value: ViewMode;
  onChange: (value: ViewMode) => void;
}) {
  return (
    <div className="inline-grid w-full grid-cols-2 rounded-lg border border-gray-300 bg-white p-1 sm:w-auto">
      {(["list", "map"] as const).map((mode) => (
        <button
          key={mode}
          type="button"
          onClick={() => onChange(mode)}
          className={`rounded-md px-4 py-2 text-sm font-bold ${
            value === mode
              ? "bg-blue-600 text-white"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          {mode === "list" ? "リスト" : "地図"}
        </button>
      ))}
    </div>
  );
}
