"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { BrowserMultiFormatReader, type IScannerControls } from "@zxing/browser";
import { Camera, Search, Square } from "lucide-react";
import type { ProductLookupResult } from "@/lib/products/types";

type LookupState =
  | { status: "idle"; result: null; error: null }
  | { status: "loading"; result: ProductLookupResult | null; error: null }
  | { status: "done"; result: ProductLookupResult; error: null }
  | { status: "error"; result: ProductLookupResult | null; error: string };

export function ReceiveWorkspace() {
  const [barcode, setBarcode] = useState("");
  const [lookup, setLookup] = useState<LookupState>({
    status: "idle",
    result: null,
    error: null,
  });
  const [isScanning, setIsScanning] = useState(false);
  const [isPending, startTransition] = useTransition();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);

  useEffect(() => {
    return () => {
      controlsRef.current?.stop();
    };
  }, []);

  async function lookupBarcode(nextBarcode = barcode) {
    const trimmed = nextBarcode.trim();
    if (!trimmed) return;

    setLookup((current) => ({
      status: "loading",
      result: current.result,
      error: null,
    }));

    startTransition(async () => {
      try {
        const response = await fetch(
          `/api/products/lookup?barcode=${encodeURIComponent(trimmed)}`,
        );
        const body = (await response.json()) as {
          result?: ProductLookupResult;
          error?: string;
        };

        if (!response.ok || !body.result) {
          throw new Error(body.error ?? "Lookup failed");
        }

        setLookup({ status: "done", result: body.result, error: null });
      } catch (error) {
        setLookup((current) => ({
          status: "error",
          result: current.result,
          error: error instanceof Error ? error.message : "Lookup failed",
        }));
      }
    });
  }

  async function startScanning() {
    if (!videoRef.current || isScanning) return;

    setIsScanning(true);
    const reader = new BrowserMultiFormatReader();
    controlsRef.current = await reader.decodeFromVideoDevice(
      undefined,
      videoRef.current,
      (result) => {
        const text = result?.getText();
        if (!text) return;

        setBarcode(text);
        controlsRef.current?.stop();
        setIsScanning(false);
        void lookupBarcode(text);
      },
    );
  }

  function stopScanning() {
    controlsRef.current?.stop();
    setIsScanning(false);
  }

  const isLoading = lookup.status === "loading" || isPending;

  return (
    <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="rounded-panel border border-border bg-surface p-4 shadow-panel">
        <div className="flex flex-wrap items-end gap-3">
          <label className="grid min-w-64 flex-1 gap-1 text-sm font-medium">
            Barcode
            <input
              value={barcode}
              onChange={(event) => setBarcode(event.target.value)}
              inputMode="numeric"
              className="h-11 rounded-panel border border-border bg-surface px-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            />
          </label>
          <button
            type="button"
            onClick={() => void lookupBarcode()}
            disabled={!barcode.trim() || isLoading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-panel bg-accent px-4 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <Search aria-hidden="true" size={17} />
            Lookup
          </button>
          {isScanning ? (
            <button
              type="button"
              onClick={stopScanning}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-panel border border-border px-4 text-sm font-semibold transition hover:bg-background focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <Square aria-hidden="true" size={17} />
              Stop
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void startScanning()}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-panel border border-border px-4 text-sm font-semibold transition hover:bg-background focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <Camera aria-hidden="true" size={17} />
              Scan
            </button>
          )}
        </div>

        <video
          ref={videoRef}
          aria-label="Barcode camera"
          className={[
            "mt-4 aspect-video w-full rounded-panel border border-border bg-background object-cover",
            isScanning ? "block" : "hidden",
          ].join(" ")}
          muted
          playsInline
        />

        {lookup.error ? (
          <p className="mt-3 text-sm text-danger">{lookup.error}</p>
        ) : null}
      </div>

      <aside className="rounded-panel border border-border bg-surface p-4 shadow-panel">
        <h2 className="text-sm font-semibold">Product</h2>
        {lookup.result?.found ? (
          <dl className="mt-3 grid gap-3 text-sm">
            <div>
              <dt className="text-xs text-muted">Name</dt>
              <dd className="font-medium">{lookup.result.name}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Brand</dt>
              <dd>{lookup.result.brand ?? "None"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Package</dt>
              <dd>{lookup.result.packageSize ?? "Unknown"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Category</dt>
              <dd>{lookup.result.pantryCategory}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Source</dt>
              <dd>{lookup.result.source}</dd>
            </div>
          </dl>
        ) : (
          <p className="mt-3 text-sm text-muted">No product selected.</p>
        )}
      </aside>
    </section>
  );
}
