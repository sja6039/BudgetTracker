import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import Papa from 'papaparse';

export const ensureFile = (path: string, header: string): void => {
  mkdirSync(dirname(path), { recursive: true });
  if (!existsSync(path)) writeFileSync(path, header + '\n');
};

export const readCsv = <T extends Record<string, unknown>>(path: string): T[] => {
  if (!existsSync(path)) return [];
  const text = readFileSync(path, 'utf8');
  if (!text.trim()) return [];
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: 'greedy',
    dynamicTyping: false,
  });
  if (result.errors.length > 0) {
    const fatal = result.errors.find((e) => e.type !== 'FieldMismatch');
    if (fatal) throw new Error(`CSV parse error in ${path}: ${fatal.message}`);
  }
  return result.data.map((row) => {
    const clean: Record<string, string> = {};
    for (const [k, v] of Object.entries(row)) {
      clean[k] = typeof v === 'string' ? v.trim() : (v as string);
    }
    return clean as unknown as T;
  });
};

export const writeCsv = <T extends Record<string, unknown>>(path: string, rows: T[], columns: string[]): void => {
  mkdirSync(dirname(path), { recursive: true });
  const data = rows.map((r) =>
    columns.map((c) => {
      const v = r[c];
      if (v === null || v === undefined) return '';
      return typeof v === 'string' ? v.trim() : v;
    }),
  );
  const csv = Papa.unparse({ fields: columns, data }, { newline: '\n' });
  writeFileSync(path, csv + '\n');
};

export const readJson = <T,>(path: string, fallback: T): T => {
  if (!existsSync(path)) return fallback;
  const text = readFileSync(path, 'utf8');
  if (!text.trim()) return fallback;
  return JSON.parse(text) as T;
};

export const writeJson = (path: string, data: unknown): void => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2));
};
