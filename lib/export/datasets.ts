export const EXPORT_DATASETS = [
  "products",
  "lots",
  "movements",
  "listings",
  "requests",
  "transfers",
  "classification_events",
  "policy_records",
] as const;

export type ExportDataset = (typeof EXPORT_DATASETS)[number];

export function isExportDataset(value: string): value is ExportDataset {
  return EXPORT_DATASETS.includes(value as ExportDataset);
}
