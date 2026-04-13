import { Invoice, AppSettings } from "@/contexts/DataContext";
import { formatCurrency, formatDate, numberToWords, calculateInvoiceTotals } from "@/lib/utils";
import logo from "@/assets/logo_apress.jpeg";

interface InvoicePrintProps {
  invoice: Invoice;
  settings: AppSettings;
}

const InvoicePrint = ({ invoice, settings }: InvoicePrintProps) => {
  const totals = calculateInvoiceTotals(invoice.items, invoice.tva);

  return (
    <div className="invoice-print-container bg-white text-slate-900 mx-auto w-full">
      {/* Filigrane ou Bordure de page A4 simulée (uniquement à l'écran) */}
      <div className="print:p-10 print:m-0 print:max-w-none print:h-[297mm] p-8 max-w-[210mm] mx-auto min-h-[297mm] flex flex-col bg-white">
        
        {/* EN-TETE PROFESSIONNEL */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-6">
          <div className="flex gap-6 items-center">
            <div className="h-20 w-20 bg-white flex items-center justify-center">
              <img src={logo} alt="Logo" className="h-16 w-16 object-contain" />
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-black tracking-tighter uppercase text-slate-900 leading-none">
                {settings.companyName}
              </h1>
              <div className="text-[10px] font-bold text-slate-700 space-y-0.5">
                <p>NIF: {settings.companyNif} | RCCM: {settings.companyRCCM}</p>
                <p className="whitespace-pre-wrap">{settings.companyAddress}</p>
                <p>{settings.mobileMoneyDetails}</p>
                <p className="italic">{settings.legalMentions}</p>
              </div>
            </div>
          </div>
          <div className="text-right flex flex-col items-end">
            <div className="bg-slate-900 text-white px-4 py-2 rounded-sm">
              <p className="text-sm font-black tracking-widest">N° {invoice.numero}</p>
            </div>
            <div className="mt-4 text-[10px] font-black uppercase text-slate-500 space-y-1">
              <p>Émis le : <span className="text-slate-900 ml-2">{formatDate(invoice.date)}</span></p>
              <p>Échéance : <span className="text-slate-900 ml-2">{formatDate(invoice.echeance)}</span></p>
            </div>
          </div>
        </div>

        {/* SECTION DESTINATAIRE */}
        <div className="mb-8 flex justify-end">
          <div className="w-1/2 bg-slate-50 p-6 rounded-sm border-l-4 border-slate-900">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-2">Facturé à :</p>
            <h3 className="text-lg font-black uppercase tracking-tight mb-1 text-slate-900">{invoice.clientName}</h3>
            <p className="text-[11px] font-bold text-slate-700 leading-relaxed italic mb-1">
              {invoice.clientAdresse || "Adresse non spécifiée"}
            </p>
            {invoice.clientTelephone && (
              <p className="text-[11px] font-black text-slate-900">Tél: {invoice.clientTelephone}</p>
            )}
            {invoice.clientEmail && (
              <p className="text-[11px] font-medium text-slate-600 underline">{invoice.clientEmail}</p>
            )}
          </div>
        </div>

        {/* TABLEAU DES PRESTATIONS */}
        <div className="flex-1 overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="text-left p-3 text-[10px] font-black uppercase tracking-widest w-12">Qté</th>
                <th className="text-left p-3 text-[10px] font-black uppercase tracking-widest">Désignation</th>
                <th className="text-right p-3 text-[10px] font-black uppercase tracking-widest">P.U. (FCFA)</th>
                <th className="text-right p-3 text-[10px] font-black uppercase tracking-widest">Total (FCFA)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 border-b-2 border-slate-900">
              {invoice.items.map((item, i) => (
                <tr key={i} className="page-break-inside-avoid">
                  <td className="p-3 text-sm font-bold text-slate-600">{item.quantite}</td>
                  <td className="p-3">
                    <p className="text-sm font-black text-slate-900 tracking-tight">{item.serviceName}</p>
                  </td>
                  <td className="p-3 text-right text-sm font-bold">{item.prixUnitaire.toLocaleString()}</td>
                  <td className="p-3 text-right text-sm font-black">{item.montant.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TOTALS ET BAS DE PAGE */}
        <div className="mt-6 space-y-6">
          <div className="flex justify-between items-start gap-12">
            {/* Infos Paiement */}
            <div className="flex-1 space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-sm">
                <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1 underline">Informations de Paiement</p>
                <p className="text-[10px] font-black text-slate-900 leading-relaxed font-mono whitespace-pre-wrap">
                  {settings.bankDetails}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Arrêtée la présente facture à la somme de :</p>
                <p className="text-xs font-black text-slate-900 bg-slate-100 p-2 border-l-4 border-slate-900 uppercase">
                  {numberToWords(totals.montantTTC)}
                </p>
              </div>
            </div>

            {/* Bloc Totaux */}
            <div className="w-1/3 space-y-1">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-500">
                <span>Total HT</span>
                <span className="text-slate-900">{totals.sousTotalHT.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-500 pb-1">
                <span>TVA ({invoice.tva}%)</span>
                <span className="text-slate-900">{totals.tvaMontant.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t-4 border-slate-900 items-baseline">
                <span className="font-black uppercase text-xs tracking-tighter text-slate-900">NET À PAYER</span>
                <span className="text-2xl font-black tracking-tighter text-slate-900">{totals.montantTTC.toLocaleString()} FCFA</span>
              </div>
            </div>
          </div>

          {/* SIGNATURES */}
          <div className="grid grid-cols-2 gap-8 pt-6 pb-6">
            <div className="text-center border border-dashed border-slate-300 p-4 h-24 flex flex-col justify-between">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Cachet & Signature Client</p>
              <div className="text-[8px] text-slate-400 italic">Bon pour accord</div>
            </div>
            <div className="text-center border border-dashed border-slate-300 p-4 h-24 flex flex-col justify-between">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">La Direction</p>
              <div className="text-[8px] text-slate-400">APRESS MALI SARL</div>
            </div>
          </div>

          {/* FOOTER LEGAL */}
          <div className="text-center pt-4 border-t border-slate-100">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">
              {settings.companyName} — CAPITAL 1.000.000 FCFA — BAMAKO MALI
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePrint;
