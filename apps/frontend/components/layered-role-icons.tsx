type Bar = readonly [x: number, width: number];

type LayeredRoleIconProps = {
  className?: string;
};

const rows = [3.5, 7.75, 12] as const;
const opacities = [0.9, 0.55, 0.3] as const;

function LayeredRoleIcon({
  bars,
  className,
}: LayeredRoleIconProps & { bars: readonly Bar[] }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {bars.map(([x, width], index) => (
        <rect
          key={`${x}-${width}-${index}`}
          x={x}
          y={rows[index]}
          width={width}
          height="2.5"
          rx="1"
          fill="currentColor"
          opacity={opacities[index]}
        />
      ))}
    </svg>
  );
}

/** Conversation narrows as raw context becomes a focused answer. */
export function PlaygroundRoleIcon(props: LayeredRoleIconProps) {
  return (
    <LayeredRoleIcon
      {...props}
      bars={[
        [3, 12],
        [4.5, 9],
        [6, 6],
      ]}
    />
  );
}

/** Offset layers read as a small document stack. */
export function SourcesRoleIcon(props: LayeredRoleIconProps) {
  return (
    <LayeredRoleIcon
      {...props}
      bars={[
        [3, 10],
        [4, 10],
        [5, 10],
      ]}
    />
  );
}

/** Alternating reach suggests systems meeting in the middle. */
export function ConnectorsRoleIcon(props: LayeredRoleIconProps) {
  return (
    <LayeredRoleIcon
      {...props}
      bars={[
        [3, 8],
        [7, 8],
        [3, 12],
      ]}
    />
  );
}

/** A long authority layer resolves into a compact credential. */
export function KeysRoleIcon(props: LayeredRoleIconProps) {
  return (
    <LayeredRoleIcon
      {...props}
      bars={[
        [3, 12],
        [3, 8],
        [7, 8],
      ]}
    />
  );
}

/** Mirrored outer layers frame a shorter reference layer. */
export function DocsRoleIcon(props: LayeredRoleIconProps) {
  return (
    <LayeredRoleIcon
      {...props}
      bars={[
        [3, 12],
        [5, 8],
        [3, 12],
      ]}
    />
  );
}

/** Varied insets evoke three calibrated controls. */
export function SettingsRoleIcon(props: LayeredRoleIconProps) {
  return (
    <LayeredRoleIcon
      {...props}
      bars={[
        [3, 12],
        [6, 9],
        [4.5, 10.5],
      ]}
    />
  );
}
