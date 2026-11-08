import { BarChart3, MapPinned, ShieldCheck } from "lucide-react";

export function AuthContextPanel() {
  return (
    <aside className="auth-context" aria-label="Flight Tracker capabilities">
      <div className="max-w-2xl">
        <p className="eyebrow">Flight Tracker</p>
        <h2 className="mt-3 max-w-xl font-heading text-3xl font-medium tracking-[-0.035em] text-foreground sm:text-4xl">
          Route decisions grounded in historical performance.
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
          Explore U.S. domestic corridors, compare airline reliability, and understand
          when and why delays occur. This platform analyzes historical route data—it
          does not display live aircraft positions.
        </p>
        <div className="auth-route-visual">
          <div className="flex items-center gap-3 font-mono text-xl tracking-[0.14em]">
            <span className="text-positive">ORD</span>
            <span className="relative h-px flex-1 bg-border" aria-hidden="true"><i className="absolute left-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-positive" /><i className="absolute right-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-primary" /></span>
            <span className="text-primary">LAX</span>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <ContextItem icon={MapPinned} label="Route map" />
            <ContextItem icon={ShieldCheck} label="Reliability" />
            <ContextItem icon={BarChart3} label="Delay analytics" />
          </div>
        </div>
      </div>
    </aside>
  );
}

function ContextItem({ icon: Icon, label }: { icon: typeof MapPinned; label: string }) {
  return <div className="flex items-center gap-2 text-xs text-muted-foreground"><Icon className="h-4 w-4 text-primary" aria-hidden="true" />{label}</div>;
}
