export function FlightRouteGraphic({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <svg
        viewBox="0 0 480 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mx-auto h-auto w-full max-w-lg"
      >
        <circle cx="240" cy="140" r="90" stroke="currentColor" strokeWidth="1" className="text-amber-400/10" />
        <circle cx="240" cy="140" r="55" stroke="currentColor" strokeWidth="1" className="text-amber-400/10" />

        <line
          x1="40"
          y1="140"
          x2="440"
          y2="140"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="4 6"
          className="text-border"
        />

        <path
          d="M 72 128 C 140 28, 340 28, 408 128"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="text-amber-400/35"
        />
        <path
          d="M 72 128 C 140 28, 340 28, 408 128"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="6 10"
          className="flight-route-dash text-amber-400"
        />

        <g>
          <circle cx="72" cy="128" r="5" fill="currentColor" className="text-amber-400" />
          <circle
            cx="72"
            cy="128"
            r="10"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
            className="text-amber-400/50"
          />
          <text
            x="72"
            y="154"
            textAnchor="middle"
            fill="currentColor"
            fontSize="11"
            letterSpacing="0.2em"
            className="font-mono text-muted-foreground"
          >
            ORD
          </text>
        </g>

        <g>
          <circle cx="408" cy="128" r="5" fill="currentColor" className="text-amber-400" />
          <circle
            cx="408"
            cy="128"
            r="10"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
            className="text-amber-400/50"
          />
          <text
            x="408"
            y="154"
            textAnchor="middle"
            fill="currentColor"
            fontSize="11"
            letterSpacing="0.2em"
            className="font-mono text-muted-foreground"
          >
            LAX
          </text>
        </g>

        <g className="flight-plane">
          <animateMotion
            dur="8s"
            repeatCount="indefinite"
            rotate="auto"
            path="M 72 128 C 140 28, 340 28, 408 128"
          />
          {/* Top-down aircraft silhouette, nose pointing +X for rotate="auto" */}
          <path
            d="M 14 0
               L 6 -2.2 L 2 -2.2 L -1 -9 L -4 -9 L -2 -2.2
               L -10 -2 L -12 -5 L -14 -5 L -13 -1.2 L -14 0 L -13 1.2 L -14 5 L -12 5 L -10 2
               L -2 2.2 L -4 9 L -1 9 L 2 2.2 L 6 2.2 Z"
            fill="currentColor"
            className="text-amber-400"
          />
        </g>

        <line
          x1="240"
          y1="42"
          x2="240"
          y2="54"
          stroke="currentColor"
          strokeWidth="1"
          className="text-amber-400/60"
        />
        <text
          x="240"
          y="36"
          textAnchor="middle"
          fill="currentColor"
          fontSize="9"
          letterSpacing="0.15em"
          className="font-mono text-amber-400/80"
        >
          FL350
        </text>
      </svg>
    </div>
  );
}
