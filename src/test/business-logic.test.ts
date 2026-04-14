import { describe, it, expect } from 'vitest';
import { calculateInvoiceTotals, numberToWords } from '../lib/utils';

describe('Invoice Business Logic', () => {
  describe('calculateInvoiceTotals', () => {
    it('should correctly calculate totals for multiple items', () => {
      const items = [
        { prixUnitaire: 1000, quantite: 2 },
        { prixUnitaire: 500, quantite: 3 }
      ];
      const tva = 18;
      const totals = calculateInvoiceTotals(items, tva);

      expect(totals.sousTotalHT).toBe(3500);
      expect(totals.tvaMontant).toBe(630); // 3500 * 0.18
      expect(totals.montantTTC).toBe(4130);
    });

    it('should handle zero items', () => {
      const totals = calculateInvoiceTotals([], 18);
      expect(totals.sousTotalHT).toBe(0);
      expect(totals.tvaMontant).toBe(0);
      expect(totals.montantTTC).toBe(0);
    });
  });

  describe('numberToWords', () => {
    it('should convert simple numbers correctly', () => {
      expect(numberToWords(125)).toContain('CENT VINGT-CINQ');
      expect(numberToWords(1000)).toContain('MILLE');
      expect(numberToWords(150000)).toContain('CENT CINQUANTE MILLE');
    });

    it('should handle zero', () => {
      expect(numberToWords(0)).toBe('ZÉRO FRANCS CFA');
    });
  });
});
