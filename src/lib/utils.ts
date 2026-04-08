import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace("XOF", "FCFA");
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export interface CalculatedTotals {
  sousTotalHT: number;
  tvaMontant: number;
  montantTTC: number;
}

export function calculateInvoiceTotals(items: { prixUnitaire: number; quantite: number }[], tvaTaux: number): CalculatedTotals {
  const sousTotalHT = items.reduce((sum, item) => sum + (item.prixUnitaire * item.quantite), 0);
  const tvaMontant = Math.round(sousTotalHT * (tvaTaux / 100));
  const montantTTC = sousTotalHT + tvaMontant;
  
  return {
    sousTotalHT,
    tvaMontant,
    montantTTC
  };
}

export function exportToCSV(data: Record<string, unknown>[], filename: string) {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]).join(",");
  const rows = data.map(obj => {
    return Object.values(obj).map(val => {
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    }).join(",");
  });
  
  const csvContent = [headers, ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
