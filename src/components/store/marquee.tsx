export function Marquee({ words, className = "" }: { words: string[]; className?: string }) {
  const row = words.join("  ·  ") + "  ·  ";
  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`} aria-hidden>
      <div className="inline-flex animate-marquee">
        <span className="pr-8">{row}</span>
        <span className="pr-8">{row}</span>
        <span className="pr-8">{row}</span>
        <span className="pr-8">{row}</span>
      </div>
    </div>
  );
}
