import { formatMoney } from "@/lib/money";

type Day = { date: string; revenue: number; orders: number };

const short = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });

/** Single-series bar chart: one ink hue, recessive grid, per-bar hover tooltip, table fallback. */
export function RevenueChart({ days }: { days: Day[] }) {
  const max = Math.max(...days.map((d) => d.revenue), 1);
  const total = days.reduce((n, d) => n + d.revenue, 0);
  const ticks = [1, 0.5, 0];

  return (
    <figure>
      <figcaption className="text-sm text-muted mb-4">
        <span className="font-display text-2xl text-ink font-semibold tabular-nums">{formatMoney(total)}</span> from {days.reduce((n, d) => n + d.orders, 0)} paid orders
      </figcaption>
      <div className="relative h-56 pl-14">
        {ticks.map((t) => (
          <div key={t} className="absolute left-14 right-0 border-t border-line/70" style={{ bottom: `${t * 100}%` }}>
            <span className="absolute -left-14 -translate-y-1/2 w-12 text-right text-[0.65rem] text-muted tabular-nums">
              {t === 0 ? "0" : formatMoney(Math.round(max * t))}
            </span>
          </div>
        ))}
        <div className="absolute inset-0 left-14 flex items-end gap-[2px]">
          {days.map((d) => (
            <div key={d.date} className="group relative flex-1 h-full flex items-end" tabIndex={0} aria-label={`${short.format(new Date(d.date))}: ${formatMoney(d.revenue)}, ${d.orders} orders`}>
              <div
                className="w-full rounded-t-[4px] bg-ink/85 group-hover:bg-ink group-focus:bg-ink transition-colors"
                style={{ height: d.revenue ? `max(${(d.revenue / max) * 100}%, 3px)` : "0px" }}
              />
              <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block group-focus:block z-10 whitespace-nowrap rounded-xl bg-ink text-paper px-3 py-2 text-xs shadow-lg">
                <p className="font-medium">{short.format(new Date(d.date))}</p>
                <p className="tabular-nums">{formatMoney(d.revenue)} · {d.orders} {d.orders === 1 ? "order" : "orders"}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="pl-14 mt-2 flex gap-[2px] text-[0.6rem] text-muted">
        {days.map((d, i) => (
          <span key={d.date} className="flex-1 text-center">{i % 2 === 0 ? short.format(new Date(d.date)) : ""}</span>
        ))}
      </div>
      <details className="mt-4 text-xs">
        <summary className="cursor-pointer text-muted">View as table</summary>
        <table className="mt-2 w-full">
          <tbody>
            {days.map((d) => (
              <tr key={d.date} className="border-t border-line"><td className="py-1">{short.format(new Date(d.date))}</td><td className="py-1 text-right tabular-nums">{formatMoney(d.revenue)}</td><td className="py-1 text-right">{d.orders}</td></tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
