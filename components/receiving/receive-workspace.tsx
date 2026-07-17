"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { BrowserMultiFormatReader, type IScannerControls } from "@zxing/browser";
import { Bot, Camera, Mic, Search, Square, Upload } from "lucide-react";
import { createWorker } from "tesseract.js";
import {
  PANTRY_CATEGORIES,
  SOURCE_TYPES,
  STORAGE_TYPES,
  UNITS,
} from "@/contracts/goodco-pantry-mesh.constants";
import type {
  PantryCategory,
  SourceType,
  StorageType,
  Unit,
} from "@/contracts/goodco-pantry-mesh.types";
import type { CategorySource } from "@/lib/categories/taxonomy";
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

type ReceivingDraftState = {
  itemName: string;
  quantity: string;
  unit: Unit;
  category: PantryCategory;
  subcategory: string | null;
  storageType: StorageType;
  sourceType: SourceType;
  categorySource: CategorySource | "manual";
  categoryConfidence: number;
  date: string;
  redistributionAllowed: boolean;
};

type ReceivingParseResult = {
  itemName?: string | null;
  quantity?: number | null;
  unit?: Unit | null;
  category: ProductLookupResult["pantryCategory"];
  subcategory: string | null;
  storageType: ProductLookupResult["categoryStorageType"];
  sourceType?: SourceType | null;
  redistributionAllowed?: boolean | null;
  categoryConfidence: number;
  date: {
    normalizedDate: string | null;
    labelType: DateDraft["labelType"];
    confidence: number;
    rawText: string | null;
  } | null;
};

export function ReceiveWorkspace() {
  const [barcode, setBarcode] = useState("");
  const [lookup, setLookup] = useState<LookupState>({
    status: "idle",
    result: null,
    error: null,
  });
  const [isScanning, setIsScanning] = useState(false);
  const [dateDraft, setDateDraft] = useState<DateDraft | null>(null);
  const [reviewConfirmed, setReviewConfirmed] = useState(false);
  const [draft, setDraft] = useState<ReceivingDraftState>({
    itemName: "",
    quantity: "",
    unit: "each",
    category: "unknown",
    subcategory: null,
    storageType: "dry",
    sourceType: "unknown",
    categorySource: "manual",
    categoryConfidence: 0.25,
    date: "",
    redistributionAllowed: false,
  });
  const [dateStatus, setDateStatus] = useState<
    "idle" | "reading" | "listening" | "parsing" | "error"
  >("idle");
  const [dateError, setDateError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const speechRef = useRef<SpeechRecognition | null>(null);
  const voiceParsingRef = useRef(false);

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

        const result = body.result;
        setLookup({ status: "done", result, error: null });
        setDraft((current) => ({
          ...current,
          itemName: result.name,
          category: result.pantryCategory,
          subcategory: result.subcategory,
          storageType: result.categoryStorageType,
          categorySource: result.categorySource,
          categoryConfidence: result.categoryConfidence,
        }));
        setReviewConfirmed(false);
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
      setDraft((current) => ({
        ...current,
        date: parseDateDraft(rawText, "ocr").normalizedDate ?? current.date,
      }));
      setReviewConfirmed(false);
      setDateStatus("idle");
    } catch {
      setDateError("Could not read date.");
      setDateStatus("error");
    }
  }

  function applyReceivingParseResult(
    result: ReceivingParseResult,
    transcript: string | null = null,
  ) {
    setLookup((current) =>
      current.result
        ? {
            status: "done",
            error: null,
            result: {
              ...current.result,
              pantryCategory: result.category,
              subcategory: result.subcategory,
              categoryStorageType: result.storageType,
              categoryConfidence: result.categoryConfidence,
              categorySource: "llm_parse",
              categoryMatchedBy: null,
            },
          }
        : current,
    );

    if (result.date) {
      setDateDraft({
        rawText: result.date.rawText ?? transcript ?? "",
        transcript,
        normalizedDate: result.date.normalizedDate,
        labelType: result.date.labelType,
        source: "llm_parse",
        confidence: result.date.confidence,
        reviewStatus: result.date.normalizedDate
          ? "draft_high_confidence"
          : "needs_review",
      });
    } else if (transcript) {
      setDateDraft(parseDateDraft(transcript, "voice", transcript));
    }

    setDraft((current) => {
      const categoryWasUnknown = current.category === "unknown";
      const shouldUseCategory =
        result.category !== "unknown" || categoryWasUnknown;

      return {
        ...current,
        itemName: result.itemName?.trim() || current.itemName,
        quantity:
          typeof result.quantity === "number"
            ? String(result.quantity)
            : current.quantity,
        unit: result.unit ?? current.unit,
        category: shouldUseCategory ? result.category : current.category,
        subcategory: shouldUseCategory ? result.subcategory : current.subcategory,
        storageType: shouldUseCategory ? result.storageType : current.storageType,
        sourceType: result.sourceType ?? current.sourceType,
        categorySource: shouldUseCategory ? "llm_parse" : current.categorySource,
        categoryConfidence: shouldUseCategory
          ? result.categoryConfidence
          : current.categoryConfidence,
        date: result.date?.normalizedDate ?? current.date,
        redistributionAllowed:
          typeof result.redistributionAllowed === "boolean"
            ? result.redistributionAllowed
            : current.redistributionAllowed,
      };
    });
    resetReviewState();
  }

  async function parseVoiceDescription(transcript: string) {
    const cleaned = transcript.trim();
    if (!cleaned) {
      setDateError("Nothing heard.");
      setDateStatus("error");
      return;
    }

    voiceParsingRef.current = true;
    setDateStatus("parsing");
    setDateError(null);

    try {
      const response = await fetch("/api/receiving/fallback-parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: draft.itemName || null,
          externalCategory:
            draft.category === "unknown" ? null : draft.category,
          dateRawText: cleaned,
          voiceTranscript: cleaned,
        }),
      });
      const body = (await response.json()) as {
        result?: ReceivingParseResult | null;
      };

      if (!response.ok || !body.result) {
        throw new Error("Voice parse failed");
      }

      applyReceivingParseResult(body.result, cleaned);
      setDateStatus("idle");
    } catch {
      setDateDraft(parseDateDraft(cleaned, "voice", cleaned));
      setDateError("Review manually.");
      setDateStatus("error");
    } finally {
      voiceParsingRef.current = false;
    }
  }

  function startVoiceIntake() {
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
      void parseVoiceDescription(transcript);
    };
    recognition.onerror = () => {
      setDateError("Voice failed.");
      setDateStatus("error");
    };
    recognition.onend = () => {
      if (!voiceParsingRef.current) {
        setDateStatus("idle");
      }
      speechRef.current = null;
    };
    speechRef.current = recognition;
    setDateError(null);
    setDateStatus("listening");
    recognition.start();
  }

  const isLoading = lookup.status === "loading" || isPending;
  const canFallbackParse =
    lookup.result?.found &&
    (lookup.result.categorySource === "unknown" ||
      dateDraft?.reviewStatus === "needs_review");
  const canSave =
    reviewConfirmed && draft.itemName.trim() && Number(draft.quantity) > 0;

  function resetReviewState() {
    setReviewConfirmed(false);
    setSaveStatus("idle");
    setSaveError(null);
  }

  function receivingProductDraft() {
    if (lookup.result?.found) {
      return {
        barcode: lookup.result.barcode || null,
        name: lookup.result.name,
        brand: lookup.result.brand,
        packageSize: lookup.result.packageSize,
        ingredients: lookup.result.ingredients,
        allergens: lookup.result.allergens,
        source: lookup.result.source ?? "manual",
        openFoodFactsCategories: lookup.result.openFoodFactsCategories,
        fdcFoodCategory: lookup.result.fdcFoodCategory,
        suggestedCategory: lookup.result.pantryCategory,
        categorySource: lookup.result.categorySource,
        categoryConfidence: lookup.result.categoryConfidence,
        subcategory: lookup.result.subcategory,
      };
    }

    return {
      barcode: barcode.trim() || null,
      name: draft.itemName.trim(),
      brand: null,
      packageSize: null,
      ingredients: null,
      allergens: [],
      source: "manual" as const,
      openFoodFactsCategories: [],
      fdcFoodCategory: null,
      suggestedCategory: draft.category as PantryCategory,
      categorySource: draft.categorySource,
      categoryConfidence: draft.categoryConfidence,
      subcategory: draft.subcategory,
    };
  }

  async function runFallbackParse() {
    if (!lookup.result?.found) return;

    try {
      const response = await fetch("/api/receiving/fallback-parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barcode: lookup.result.barcode,
          productName: lookup.result.name,
          brand: lookup.result.brand,
          externalCategory: lookup.result.categoryText,
          dateRawText: dateDraft?.rawText ?? null,
        }),
      });
      const body = (await response.json()) as {
        result?: ReceivingParseResult | null;
      };

      if (!response.ok || !body.result) return;

      applyReceivingParseResult(body.result, dateDraft?.transcript ?? null);
    } catch {
      setDateError("Manual review needed.");
    }
  }

  async function saveReceivingDraft() {
    if (!canSave) return;

    const receivingProduct = receivingProductDraft();
    setSaveStatus("saving");
    setSaveError(null);

    try {
      const response = await fetch("/api/inventory/receive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: {
            barcode: receivingProduct.barcode,
            name: receivingProduct.name,
            brand: receivingProduct.brand,
            packageSize: receivingProduct.packageSize,
            ingredients: receivingProduct.ingredients,
            allergens: receivingProduct.allergens,
            source: receivingProduct.source,
            openFoodFactsCategories: receivingProduct.openFoodFactsCategories,
            fdcFoodCategory: receivingProduct.fdcFoodCategory,
            suggestedCategory: receivingProduct.suggestedCategory,
            categorySource: receivingProduct.categorySource,
            categoryConfidence: receivingProduct.categoryConfidence,
          },
          lot: {
            itemName: draft.itemName,
            quantity: Number(draft.quantity),
            unit: draft.unit,
            category: draft.category,
            subcategory: receivingProduct.subcategory,
            storageType: draft.storageType,
            sourceType: draft.sourceType,
            date: draft.date || null,
            dateLabelType: dateDraft?.labelType ?? "unknown",
            dateRawText: dateDraft?.rawText ?? null,
            dateVoiceTranscript: dateDraft?.transcript ?? null,
            dateSource: dateDraft?.source ?? (draft.date ? "manual" : null),
            dateConfidence: dateDraft?.confidence ?? (draft.date ? 1 : null),
            redistributionAllowed: draft.redistributionAllowed,
          },
        }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        setSaveStatus("error");
        setSaveError(body?.error ?? "Save failed.");
        return;
      }

      setSaveStatus("saved");
      setReviewConfirmed(false);
    } catch {
      setSaveStatus("error");
      setSaveError("Save failed.");
    }
  }

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
              onClick={startVoiceIntake}
              disabled={
                dateStatus === "listening" ||
                dateStatus === "reading" ||
                dateStatus === "parsing"
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-panel border border-border px-4 text-sm font-semibold transition hover:bg-background disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <Mic aria-hidden="true" size={17} />
              Voice
            </button>
            <span className="text-sm text-muted">
              {dateStatus === "reading"
                ? "Reading"
                : dateStatus === "listening"
                  ? "Listening"
                  : dateStatus === "parsing"
                    ? "Parsing"
                  : null}
            </span>
            {canFallbackParse ? (
              <button
                type="button"
                onClick={() => void runFallbackParse()}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-panel border border-border px-4 text-sm font-semibold transition hover:bg-background focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <Bot aria-hidden="true" size={17} />
                Parse
              </button>
            ) : null}
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

      <aside className="grid gap-4">
        <div className="rounded-panel border border-border bg-surface p-4 shadow-panel">
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
              <dt className="text-xs text-muted">Confidence</dt>
              <dd>{Math.round(lookup.result.categoryConfidence * 100)}%</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Source</dt>
              <dd>{lookup.result.source}</dd>
            </div>
          </dl>
        ) : draft.itemName.trim() ? (
          <dl className="mt-3 grid gap-3 text-sm">
            <div>
              <dt className="text-xs text-muted">Name</dt>
              <dd className="font-medium">{draft.itemName}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Category</dt>
              <dd>{draft.category}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Source</dt>
              <dd>manual</dd>
            </div>
          </dl>
        ) : (
          <p className="mt-3 text-sm text-muted">No product selected.</p>
        )}
        </div>

        <div className="rounded-panel border border-border bg-surface p-4 shadow-panel">
          <h2 className="text-sm font-semibold">Review</h2>
          <div className="mt-3 grid gap-3">
            <label className="grid gap-1 text-sm font-medium">
              Item
              <input
                value={draft.itemName}
                onChange={(event) => {
                  setDraft((current) => ({
                    ...current,
                    itemName: event.target.value,
                  }));
                  resetReviewState();
                }}
                className="h-10 rounded-panel border border-border bg-surface px-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              />
            </label>

            <div className="grid grid-cols-[1fr_7rem] gap-2">
              <label className="grid gap-1 text-sm font-medium">
                Qty
                <input
                  value={draft.quantity}
                  onChange={(event) => {
                  setDraft((current) => ({
                    ...current,
                    quantity: event.target.value,
                  }));
                  resetReviewState();
                }}
                  inputMode="decimal"
                  className="h-10 rounded-panel border border-border bg-surface px-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                />
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Unit
                <select
                  value={draft.unit}
                  onChange={(event) => {
                  setDraft((current) => ({
                    ...current,
                    unit: event.target.value as Unit,
                  }));
                  resetReviewState();
                }}
                  className="h-10 rounded-panel border border-border bg-surface px-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  {UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="grid gap-1 text-sm font-medium">
              Category
              <select
                value={draft.category}
                onChange={(event) => {
                  setDraft((current) => ({
                    ...current,
                    category: event.target.value as PantryCategory,
                    subcategory: null,
                    categorySource: "manual",
                    categoryConfidence: event.target.value === "unknown" ? 0.25 : 1,
                  }));
                  resetReviewState();
                }}
                className="h-10 rounded-panel border border-border bg-surface px-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                {PANTRY_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-2">
              <label className="grid gap-1 text-sm font-medium">
                Storage
                <select
                  value={draft.storageType}
                  onChange={(event) => {
                  setDraft((current) => ({
                    ...current,
                    storageType: event.target.value as StorageType,
                  }));
                  resetReviewState();
                }}
                  className="h-10 rounded-panel border border-border bg-surface px-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  {STORAGE_TYPES.map((storageType) => (
                    <option key={storageType} value={storageType}>
                      {storageType}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Date
                <input
                  value={draft.date}
                  onChange={(event) => {
                  setDraft((current) => ({
                    ...current,
                    date: event.target.value,
                  }));
                  resetReviewState();
                }}
                  type="date"
                  className="h-10 rounded-panel border border-border bg-surface px-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                />
              </label>
            </div>

            <label className="grid gap-1 text-sm font-medium">
              Source
              <select
                value={draft.sourceType}
                onChange={(event) => {
                  setDraft((current) => ({
                    ...current,
                    sourceType: event.target.value as SourceType,
                  }));
                  resetReviewState();
                }}
                className="h-10 rounded-panel border border-border bg-surface px-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                {SOURCE_TYPES.map((sourceType) => (
                  <option key={sourceType} value={sourceType}>
                    {sourceType}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                checked={draft.redistributionAllowed}
                onChange={(event) => {
                  setDraft((current) => ({
                    ...current,
                    redistributionAllowed: event.target.checked,
                  }));
                  resetReviewState();
                }}
                type="checkbox"
                className="size-4 accent-accent"
              />
              Redistribute
            </label>

            <button
              type="button"
              onClick={() => setReviewConfirmed(true)}
              disabled={
                !draft.itemName.trim() || Number(draft.quantity) <= 0
              }
              className="inline-flex h-11 items-center justify-center rounded-panel bg-foreground px-4 text-sm font-semibold text-surface transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Confirm
            </button>

            {reviewConfirmed ? (
              <p className="text-sm font-medium text-success">Ready</p>
            ) : null}

            <button
              type="button"
              onClick={() => void saveReceivingDraft()}
              disabled={!canSave || saveStatus === "saving"}
              className="inline-flex h-11 items-center justify-center rounded-panel bg-accent px-4 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {saveStatus === "saving" ? "Saving" : "Save lot"}
            </button>

            {saveStatus === "saved" ? (
              <p className="text-sm font-medium text-success">Saved</p>
            ) : null}
            {saveStatus === "error" && saveError ? (
              <p className="text-sm text-danger">{saveError}</p>
            ) : null}
          </div>
        </div>
      </aside>
    </section>
  );
}
