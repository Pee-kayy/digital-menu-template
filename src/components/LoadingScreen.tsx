interface Props {
  label?: string;
  fullscreen?: boolean;
}

const RESTAURANT_NAME = import.meta.env.VITE_RESTAURANT_NAME ?? "Restaurant Name";

export function LoadingScreen({ label = RESTAURANT_NAME, fullscreen = true }: Props) {
  return (
    <div
      className={
        fullscreen
          ? "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white"
          : "flex flex-col items-center justify-center py-24"
      }
    >
      <div className="animate-shimmer-glow text-glow text-4xl font-semibold tracking-wide text-primary md:text-5xl">
        {label}
      </div>
      <p className="mt-3 text-xs uppercase tracking-[0.32em] text-muted-foreground">
        Loading experience
      </p>
      <div className="mt-8 h-[2px] w-40 overflow-hidden rounded-full bg-primary/10">
        <div className="h-full w-1/3 rounded-full bg-brand-gradient animate-progress-slide" />
      </div>
    </div>
  );
}
