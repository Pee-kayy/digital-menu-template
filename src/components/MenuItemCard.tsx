import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { formatNaira } from "@/lib/format";
import { getImageSignedUrl, type MenuItem } from "@/lib/menu-queries";
import { cn } from "@/lib/utils";

interface Props {
  item: MenuItem;
  admin?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function MenuItemCard({ item, admin, onEdit, onDelete }: Props) {
  const [imgFailed, setImgFailed] = useState(false);
  const [imgUrl, setImgUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setImgFailed(false);
    setImgUrl(null);
    getImageSignedUrl(item.image_url).then((url) => {
      if (!cancelled) setImgUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [item.image_url]);

  const showImage = !!imgUrl && !imgFailed;


  return (
    <div className="group animate-fade-up overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-neon/40">
      {showImage && (
        <div className="h-44 w-full overflow-hidden bg-muted">
          <img
            src={imgUrl!}
            alt={item.name}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}
      <div className={cn("flex items-start justify-between gap-3 p-4", !showImage && "pt-5")}>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-foreground">{item.name}</h3>
          {item.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
          )}
          <p className="mt-2 text-lg font-bold text-primary">{formatNaira(item.price)}</p>
        </div>
        {admin && (
          <div className="flex shrink-0 flex-col gap-2">
            <button
              onClick={onEdit}
              className="rounded-full border border-border p-2 text-muted-foreground hover:border-primary hover:text-primary"
              aria-label="Edit"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={onDelete}
              className="rounded-full border border-border p-2 text-muted-foreground hover:border-destructive hover:text-destructive"
              aria-label="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
