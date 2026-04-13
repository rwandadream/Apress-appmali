import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import InvoiceForm, { InvoiceFormSubmitData } from "@/components/InvoiceForm";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/hooks/use-toast";

const NewInvoice = () => {
  const navigate = useNavigate();
  const { addInvoice } = useData();
  const { toast } = useToast();

  const handleSubmit = (data: InvoiceFormSubmitData) => {
    addInvoice(data);
    toast({
      title: "Document généré",
      description: `Le document pour ${data.clientName} a été créé avec succès.`,
    });
    navigate("/invoices");
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <PageHeader 
        title="Nouveau Document" 
        description="Créer une facture ou un devis pour Apress Mali" 
      />
      
      <div className="glass-card p-6 md:p-8 rounded-[32px] border border-border/50 shadow-xl">
        <InvoiceForm 
          onSubmit={handleSubmit} 
          onCancel={() => navigate("/invoices")} 
        />
      </div>
    </div>
  );
};

export default NewInvoice;
