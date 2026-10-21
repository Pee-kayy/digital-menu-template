import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download, Printer, Menu as MenuIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { openAdminMenu } from "./admin";

// STATIC URL — never depends on database state
const MENU_URL = import.meta.env.VITE_MENU_URL ?? "https://digital-menu-template-puce.vercel.app/menu";

export const Route = createFileRoute("/_authenticated/admin/qr")({
  component: QrPage,
});

function QrPage() {
  const svgRef = useRef<HTMLDivElement>(null);

  function downloadPng() {
    const svg = svgRef.current?.querySelector("svg");
    if (!svg) return;
    const xml = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const size = 1024;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${import.meta.env.VITE_RESTAURANT_NAME ?? "restaurant"}-qr.png`;
        a.click();
        URL.revokeObjectURL(a.href);
      }, "image/png");
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }

  function printQr() {
    window.print();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header strip matching brand */}
      <header className="rounded-b-[28px] bg-brand-gradient text-white shadow-neon">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-6 md:px-8">
          <div>
            <h1 className="text-glow text-3xl font-semibold tracking-wide md:text-4xl">QR Code</h1>
            <p className="mt-1 text-xs uppercase tracking-[0.28em] text-white/80">
              Scan to open the menu
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={openAdminMenu}
            className="rounded-full text-white hover:bg-white/15 hover:text-white"
          >
            <MenuIcon className="h-6 w-6" />
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-xl px-4 py-10 md:px-8">
        <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-soft print:border-0 print:shadow-none">
          <div ref={svgRef} className="mx-auto inline-block rounded-2xl bg-white p-5 shadow-neon print:shadow-none">
            <QRCodeSVG
              value={MENU_URL}
              size={260}
              level="H"
              fgColor="#7B2CBF"
              bgColor="#ffffff"
              includeMargin={false}
            />
          </div>
          <p className="mt-6 text-glow text-2xl font-semibold text-primary">{import.meta.env.VITE_RESTAURANT_NAME ?? "Restaurant Name"}</p>
          <p className="mt-1 break-all text-xs text-muted-foreground">{MENU_URL}</p>

          <div className="mt-6 flex flex-wrap justify-center gap-3 print:hidden">
            <Button onClick={downloadPng} className="bg-brand-gradient text-white">
              <Download className="h-4 w-4" /> Download PNG
            </Button>
            <Button variant="outline" onClick={printQr}>
              <Printer className="h-4 w-4" /> Print
            </Button>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground print:hidden">
          This QR code is static — it never changes when the menu is updated.
        </p>
      </main>
    </div>
  );
}
