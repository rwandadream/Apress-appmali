import { useNavigate, useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import PageHeader from "@/components/PageHeader";
import InvoiceForm, { InvoiceFormSubmitData } from "@/components/InvoiceForm";
import InvoicePrint from "@/components/InvoicePrint";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft, Pencil, Eye, Download } from "lucide-react";
// @ts-expect-error - html2pdf doesn't have official types
import html2pdf from 'html2pdf.js';

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { invoices, updateInvoice, settings } = useData();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const invoice = useMemo(() => invoices.find((inv) => inv.id === id), [invoices, id]);

  const handleDownloadPDF = async () => {
    if (!invoice) return;
    
    setIsDownloading(true);
    const element = document.querySelector('.invoice-print-wrapper');
    const options = {
      margin: 10,
      filename: `Facture_${invoice.numero}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        letterRendering: true,
        logging: false 
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      await html2pdf().set(options).from(element).save();
      toast({
        title: "Succès",
        description: "La facture a été téléchargée.",
      });
    } catch (error) {
      console.error("PDF Error:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de générer le PDF.",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  if (!invoice) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-black opacity-20 uppercase tracking-tighter">Document introuvable</h2>
        <Button variant="ghost" onClick={() => navigate("/invoices")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Retour à la liste
        </Button>
      </div>
    );
  }

  const handleSubmit = (data: InvoiceFormSubmitData) => {
    updateInvoice(invoice.id, data);
    toast({
      title: "Document mis à jour",
      description: `Les modifications ont été enregistrées avec succès.`,
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <div className="no-print">
        <PageHeader 
          title={`Document ${invoice.numero}`} 
          description={isEditing ? "Modification du document" : "Consultation et impression"}
          showBack
          action={
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)} className="gap-2">
                {isEditing ? <><Eye className="h-4 w-4" /> Voir</> : <><Pencil className="h-4 w-4" /> Modifier</>}
              </Button>
              {!isEditing && (
                <>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={handleDownloadPDF} 
                    disabled={isDownloading}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" /> 
                    {isDownloading ? "Génération..." : "Télécharger PDF"}
                  </Button>
                  <Button size="sm" onClick={() => window.print()} className="gap-2 shadow-lg shadow-primary/20">
                    <Printer className="h-4 w-4" /> Imprimer
                  </Button>
                </>
              )}
            </div>
          }
        />
      </div>
      
      {isEditing ? (
        <div className="glass-card p-6 md:p-8 rounded-[32px] border border-border/50 shadow-xl no-print">
          <InvoiceForm 
            onSubmit={handleSubmit} 
            onCancel={() => setIsEditing(false)} 
            initialData={invoice}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Container with forced white background for the invoice paper feel, but dark-mode friendly wrapper */}
          <div className="bg-white text-slate-900 rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 mx-auto max-w-[850px] transition-all invoice-print-wrapper">
            <InvoicePrint invoice={invoice} settings={settings} />
          </div>
          
          <div className="flex justify-center no-print">
            <Button variant="ghost" onClick={() => navigate("/invoices")} className="text-muted-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" /> Revenir à la liste des factures
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceDetail;
