"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { BrowserMultiFormatReader, type IScannerControls } from "@zxing/browser";
import { Camera, Mic, Search, Square, Upload } from "lucide-react";
import { createWorker } from "tesseract.js";
import { parseDateDraft, type DateDraft } from "@/lib/dates/parse";
import type { ProductLookupResult } from "@/lib/products/types";

type SpeechRecognitionConstructor = new () => SpeechRecognition;

type SpeechRecognition = {
  lang: string;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult:
    | ((event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void)
    | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

type SpeechWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

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
  const [dateDraft, setDateDraft] = useState<DateDraft | null>(null);
  const [dateStatus, setDateStatus] = useState<
    "idle" | "reading" | "listening" | "error"
  >("idle");
  const [dateError, setDateError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const speechRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    return () => {
      controlsRef.current?.stop();
      speechRef.current?.stop();
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

  async function readDateFromImage(file: File | null) {
    if (!file) return;

    setDateStatus("reading");
    setDateError(null);

    try {
      const worker = await createWorker("eng");
      const result = await worker.recognize(file);
      await worker.terminate();
      const rawText = result.data.text.trim();
      setDateDraft(parseDateDraft(rawText, "ocr"));
      setDateStatus("idle");
    } catch {
      setDateError("Could not read date.");
      setDateStatus("error");
    }
  }

  function startVoiceDate() {
    const speechWindow = window as SpeechWindow;
    const Recognition =
      speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;

    if (!Recognition) {
      setDateError("Voice unavailable.");
      setDateStatus("error");
      return;
    }

    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? "";
      setDateDraft(parseDateDraft(transcript, "voice", transcript));
    };
    recognition.onerror = () => {
      setDateError("Voice failed.");
      setDateStatus("error");
    };
    recognition.onend = () => {
      setDateStatus("idle");
      speechRef.current = null;
    };
    speechRef.current = recognition;
    setDateError(null);
    setDateStatus("listening");
    recognition.start();
  }

  const isLoading = lookup.status === "loading" || isPending;

  return (
    <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="grid gap-4">
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

        <div className="rounded-panel border border-border bg-surface p-4 shadow-panel">
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-panel border border-border px-4 text-sm font-semibold transition hover:bg-background focus-within:outline focus-within:outline-2 focus-within:outline-offset-2">
              <Upload aria-hidden="true" size={17} />
              Photo
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) =>
                  void readDateFromImage(event.target.files?.[0] ?? null)
                }
              />
            </label>
            <button
              type="button"
              onClick={startVoiceDate}
              disabled={dateStatus === "listening" || dateStatus === "reading"}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-panel border border-border px-4 text-sm font-semibold transition hover:bg-background disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <Mic aria-hidden="true" size={17} />
              Date
            </button>
            <span className="text-sm text-muted">
              {dateStatus === "reading"
                ? "Reading"
                : dateStatus === "listening"
                  ? "Listening"
                  : null}
            </span>
          </div>

          {dateDraft ? (
            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs text-muted">Draft</dt>
                <dd className="font-medium">
                  {dateDraft.normalizedDate ?? "Needs review"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Label</dt>
                <dd>{dateDraft.labelType}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Source</dt>
                <dd>{dateDraft.source}</dd>
              </div>
              <div className="sm:col-span-3">
                <dt className="text-xs text-muted">Raw text</dt>
                <dd className="mt-1 rounded-panel border border-border bg-background p-2">
                  {dateDraft.rawText || dateDraft.transcript}
                </dd>
              </div>
            </dl>
          ) : null}

          {dateError ? (
            <p className="mt-3 text-sm text-danger">{dateError}</p>
          ) : null}
        </div>
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
