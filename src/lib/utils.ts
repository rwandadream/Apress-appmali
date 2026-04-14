import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  try {
    if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
      return window.crypto.randomUUID();
    }
  } catch (e) {
    // Fallback if crypto fails or not available
  }
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
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

export function numberToWords(amount: number): string {
  if (amount === 0) return "ZÉRO FRANCS CFA";

  const units = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf"];
  const teens = ["dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];
  const tens = ["", "dix", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante-dix", "quatre-vingts", "quatre-vingt-dix"];

  function convert(n: number): string {
    if (n < 10) return units[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) {
      if (n === 71) return "soixante-et-onze";
      if (n === 81) return "quatre-vingt-un";
      if (n === 91) return "quatre-vingt-onze";
      const ten = Math.floor(n / 10);
      const unit = n % 10;
      if (unit === 1 && ten < 8) return tens[ten] + "-et-" + units[unit];
      return tens[ten] + (unit > 0 ? "-" + units[unit] : "");
    }
    if (n < 1000) {
      const hundred = Math.floor(n / 100);
      const rest = n % 100;
      const hundredStr = hundred === 1 ? "cent" : units[hundred] + " cent";
      return hundredStr + (rest > 0 ? " " + convert(rest) : "");
    }
    if (n < 1000000) {
      const thousand = Math.floor(n / 1000);
      const rest = n % 1000;
      const thousandStr = thousand === 1 ? "mille" : convert(thousand) + " mille";
      return thousandStr + (rest > 0 ? " " + convert(rest) : "");
    }
    if (n < 1000000000) {
      const million = Math.floor(n / 1000000);
      const rest = n % 1000000;
      const millionStr = million === 1 ? "un million" : convert(million) + " millions";
      return millionStr + (rest > 0 ? " " + convert(rest) : "");
    }
    return n.toString();
  }

  return convert(amount).toUpperCase() + " FRANCS CFA";
}

export function calculateInvoiceTotals(items: { prixUnitaire: number; quantite: number }[], tvaTaux: number): CalculatedTotals {
  // Calcul du sous-total HT en arrondissant chaque ligne pour éviter les erreurs de précision
  const sousTotalHT = items.reduce((sum, item) => {
    const ligneTotal = Math.round(item.prixUnitaire * item.quantite);
    return sum + ligneTotal;
  }, 0);

  // Calcul de la TVA arrondi à l'unité (standard FCFA)
  const tvaMontant = Math.round(sousTotalHT * (tvaTaux / 100));

  // Le TTC doit être la somme exacte du HT et de la TVA calculés
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
