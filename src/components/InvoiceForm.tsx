import { useMemo, useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Trash2, Calculator, CreditCard, ShieldAlert, Tag, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useData, InvoiceItem, Invoice } from "@/contexts/DataContext";
import { formatCurrency, calculateInvoiceTotals } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

const invoiceItemSchema = z.object({
  categoryId: z.string().min(1, "Catégorie requise"),
  serviceId: z.string().min(1, "Service requis"),
  quantite: z.number().min(1, "Quantité min 1"),
  prixUnitaire: z.number().min(0, "Prix invalide"),
});

const invoiceSchema = z.object({
  clientId: z.string().min(1, "Client requis"),
  type: z.enum(["facture", "devis"]),
  date: z.string().min(1, "Date requise"),
  echeance: z.string().min(1, "Échéance requise"),
  tva: z.number().min(0).max(100),
  paymentMethod: z.string().min(1, "Mode requis"),
  paymentReference: z.string().min(3, "Référence obligatoire"),
  items: z.array(invoiceItemSchema).min(1, "Au moins une prestation est requise"),
});

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;

export interface InvoiceFormSubmitData extends InvoiceFormValues {
  clientName: string;
  clientEmail?: string;
  clientTelephone?: string;
  clientAdresse?: string;
  items: (InvoiceItem & { montant: number })[];
  sousTotal: number;
  tvaMontant: number;
  montantTTC: number;
}

interface InvoiceFormProps {
  onSubmit: (data: InvoiceFormSubmitData) => void;
  onCancel: () => void;
  initialData?: Invoice | null;
}

const InvoiceForm = ({ onSubmit, onCancel, initialData }: InvoiceFormProps) => {
  const { clients, categories, services, settings } = useData();

  // Prepare initial data with categoryId if missing (for editing)
  const preparedInitialData = useMemo(() => {
    if (!initialData) return null;
    return {
      ...initialData,
      items: initialData.items.map((item: InvoiceItem) => {
        const svc = services.find(s => s.id === item.serviceId);
        return {
          ...item,
          categoryId: svc?.categorieId || ""
        };
      })
    };
  }, [initialData, services]);

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: preparedInitialData || {
      clientId: "",
      type: "facture",
      date: new Date().toISOString().split('T')[0],
      echeance: "",
      tva: settings.defaultTva || 18,
      paymentMethod: "Virement Bancaire",
      paymentReference: "",
      items: [{ categoryId: "", serviceId: "", quantite: 1, prixUnitaire: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedItems = form.watch("items");
  const watchedTva = form.watch("tva");

  const totals = useMemo(() => {
    return calculateInvoiceTotals(watchedItems, watchedTva);
  }, [watchedItems, watchedTva]);

  const handleFormSubmit = (values: InvoiceFormValues) => {
    const client = clients.find(c => c.id === values.clientId);
    const enrichedItems = values.items.map(item => {
      const svc = services.find(s => s.id === item.serviceId);
      return {
        serviceId: item.serviceId,
        serviceName: svc?.nom || "Service inconnu",
        quantite: item.quantite,
        prixUnitaire: item.prixUnitaire,
        montant: item.prixUnitaire * item.quantite
      };
    });
    
    onSubmit({
      ...values,
      clientName: client?.nom || "Inconnu",
      clientEmail: client?.email,
      clientTelephone: client?.telephone,
      clientAdresse: client?.adresse,
      items: enrichedItems,
      sousTotal: totals.sousTotalHT,
      tvaMontant: totals.tvaMontant,
      montantTTC: totals.montantTTC
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold">Type de document</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-11 border-primary/50 bg-primary/5"><SelectValue placeholder="Type" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="facture">Facture Officielle</SelectItem>
                    <SelectItem value="devis">Devis / Proposition</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="clientId"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel className="font-bold">Client</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-11"><SelectValue placeholder="Sélectionner un client" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {clients.filter(c => !c.archived).map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.nom}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Date Émission</FormLabel>
                  <FormControl><Input type="date" className="h-11" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="echeance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Échéance</FormLabel>
                  <FormControl><Input type="date" className="h-11" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-1">
             {/* Spacing */}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold">Mode de Paiement Préféré</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-11"><SelectValue placeholder="Choisir un mode" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Virement Bancaire">Virement Bancaire</SelectItem>
                    <SelectItem value="Chèque">Chèque</SelectItem>
                    <SelectItem value="Espèces">Espèces</SelectItem>
                    <SelectItem value="Orange Money">Orange Money</SelectItem>
                    <SelectItem value="Moov Money">Moov Money</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="paymentReference"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-primary flex items-center gap-2">
                  <CreditCard className="h-4 w-4" /> Référence de paiement obligatoire
                </FormLabel>
                <FormControl>
                  <Input placeholder="Ex: COMMANDE #123 ou Projet X" className="h-11 border-primary/20" {...field} />
                </FormControl>
                <p className="text-[10px] text-muted-foreground italic">Cette référence devra figurer sur le virement du client.</p>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Calculator className="h-4 w-4" /> Détail des Prestations
            </h3>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => append({ categoryId: "", serviceId: "", quantite: 1, prixUnitaire: 0 })}
              className="h-8"
            >
              <Plus className="h-4 w-4 mr-1" /> Ajouter une ligne
            </Button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <Card key={field.id} className="border-border/50 bg-muted/20 overflow-hidden group">
                <CardContent className="p-4">
                  <div className="grid grid-cols-12 gap-4 items-end">
                    <div className="col-span-12 md:col-span-4">
                      <FormField
                        control={form.control}
                        name={`items.${index}.categoryId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase flex items-center gap-1 text-muted-foreground dark:text-slate-300">
                              <Tag className="h-3 w-3" /> 1. Catégorie
                            </FormLabel>
                            <Select 
                              onValueChange={(val) => {
                                field.onChange(val);
                                // Reset service when category changes
                                form.setValue(`items.${index}.serviceId`, "");
                                form.setValue(`items.${index}.prixUnitaire`, 0);
                              }} 
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="h-10 bg-white dark:bg-slate-900 border-border"><SelectValue placeholder="Choisir catégorie..." /></SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories.map((cat) => (
                                  <SelectItem key={cat.id} value={cat.id}>{cat.nom}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-12 md:col-span-4">
                      <FormField
                        control={form.control}
                        name={`items.${index}.serviceId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase flex items-center gap-1 text-muted-foreground dark:text-slate-300">
                              <Briefcase className="h-3 w-3" /> 2. Prestation
                            </FormLabel>
                            <Select 
                              disabled={!watchedItems[index]?.categoryId}
                              onValueChange={(val) => {
                                field.onChange(val);
                                const svc = services.find(s => s.id === val);
                                if (svc) form.setValue(`items.${index}.prixUnitaire`, svc.prix);
                              }} 
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="h-10 bg-white dark:bg-slate-900 border-border"><SelectValue placeholder="Choisir service..." /></SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {services
                                  .filter(s => s.categorieId === watchedItems[index]?.categoryId && !s.archived)
                                  .map((s) => (
                                    <SelectItem key={s.id} value={s.id}>{s.nom}</SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-3 md:col-span-1">
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantite`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase text-muted-foreground dark:text-slate-300">Qté</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                className="h-10 bg-white dark:bg-slate-900 border-border" 
                                {...field} 
                                onChange={e => field.onChange(parseInt(e.target.value) || 0)} 
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-6 md:col-span-2">
                      <FormField
                        control={form.control}
                        name={`items.${index}.prixUnitaire`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase text-muted-foreground dark:text-slate-300">P.U. (FCFA)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                className="h-10 font-bold bg-white dark:bg-slate-900 border-border" 
                                placeholder="Prix..."
                                value={field.value === 0 ? "" : field.value}
                                onChange={e => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-3 md:col-span-1 flex justify-end">
                      {fields.length > 1 && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="h-10 w-10 text-muted-foreground hover:text-destructive transition-colors"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start pt-6 border-t">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="tva"
              render={({ field }) => (
                <FormItem className="max-w-[150px]">
                  <FormLabel className="font-bold">Taux TVA (%)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      className="h-11"
                      {...field} 
                      onChange={e => field.onChange(parseInt(e.target.value) || 0)} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3 text-amber-800">
              <ShieldAlert className="h-5 w-5 shrink-0" />
              <p className="text-[11px] leading-relaxed">
                <strong>Attention :</strong> Conformément à la réglementation au Mali, une pénalité de retard de 10% par mois sera appliquée pour tout paiement au-delà de l'échéance.
              </p>
            </div>
          </div>

          <Card className="bg-slate-900 text-white border-none shadow-xl rounded-[24px] overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
            <CardContent className="p-8 space-y-4 relative">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest opacity-60">
                <span>Total Hors Taxes</span>
                <span>{formatCurrency(totals.sousTotalHT)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest opacity-60 pb-4 border-b border-white/10">
                <span>TVA ({watchedTva}%)</span>
                <span>{formatCurrency(totals.tvaMontant)}</span>
              </div>
              <div className="flex justify-between pt-2 items-baseline">
                <span className="font-black uppercase text-sm tracking-tighter text-primary">Total TTC</span>
                <span className="text-3xl font-black tracking-tighter text-white">{formatCurrency(totals.montantTTC)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" className="h-12 px-8 rounded-xl font-bold" onClick={onCancel}>Annuler</Button>
          <Button type="submit" size="lg" className="h-12 px-12 font-black rounded-xl shadow-xl shadow-primary/20">
            Valider et Générer
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default InvoiceForm;