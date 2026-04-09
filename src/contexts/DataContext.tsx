import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { generateId } from "@/lib/utils";

export interface Category {
  id: string;
  nom: string;
  archived?: boolean;
}

export interface Service {
  id: string;
  nom: string;
  categorieId: string;
  prix: number;
  description: string;
  archived?: boolean;
}

export interface Client {
  id: string;
  nom: string;
  email: string;
  telephone: string;
  adresse: string;
  secteur: string;
  archived?: boolean;
}
export interface InvoiceItem {
  serviceId: string;
  serviceName: string;
  quantite: number;
  prixUnitaire: number;
  montant: number;
}

export interface Invoice {
  id: string;
  numero: string;
  clientId: string;
  clientName: string;
  clientEmail?: string;
  clientTelephone?: string;
  clientAdresse?: string;
  date: string;
  echeance: string;
  items: InvoiceItem[];
  sousTotal: number;
  tva: number;
  tvaMontant: number;
  montantTTC: number;
  paye: number;
  status: "payée" | "partielle" | "non_payée";
  type: "facture" | "devis";
  archived?: boolean;
  paymentMethod?: string;
  paymentReference?: string;
}

export interface AppSettings {
  defaultTva: number;
  currency: string;
  companyName: string;
  companyAddress: string;
  companyNif: string;
  companyRCCM: string;
  bankDetails: string;
  mobileMoneyDetails: string;
  legalMentions: string;
  companyNina?: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  date: string;
  method: string;
  reference?: string;
}

interface DataContextType {
  categories: Category[];
  services: Service[];
  clients: Client[];
  invoices: Invoice[];
  payments: Payment[];
  settings: AppSettings;
  addCategory: (category: Omit<Category, "id">) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  addService: (service: Omit<Service, "id">) => void;
  addClient: (client: Omit<Client, "id">) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  addInvoice: (invoice: Omit<Invoice, "id" | "numero">) => void;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void;
  updateInvoiceStatus: (id: string, paye: number) => void;
  updateService: (id: string, service: Partial<Service>) => void;
  addPayment: (payment: Omit<Payment, "id">) => void;
  deletePayment: (id: string) => void;
  archiveItem: (type: "clients" | "services" | "invoices" | "categories", id: string) => void;
  updateSettings: (settings: AppSettings) => void;
  exportData: () => void;
  importData: (jsonData: string) => boolean;
  stats: {
    totalFacture: number;
    totalEncaisse: number;
    resteARecouvrer: number;
    tauxRecouvrement: number;
  };
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CATEGORIES: "apress_v3_categories",
  SERVICES: "apress_v3_services",
  CLIENTS: "apress_v3_clients",
  INVOICES: "apress_v3_invoices",
  PAYMENTS: "apress_v3_payments",
  SETTINGS: "apress_v3_settings",
};

const initialCategories: Category[] = [
  { id: "cat_grh", nom: "GESTION DES RESSOURCES HUMAINES" },
  { id: "cat_aa", nom: "ASSISTANCE ADMINISTRATIVE" },
  { id: "cat_ps", nom: "PRESTATIONS SOCIALES" },
  { id: "cat_ap", nom: "AUTRES PRESTATIONS" },
];

const initialServices: Service[] = [
  { id: "s1", nom: "La prise en charge administrative du personnel", categorieId: "cat_grh", prix: 0, description: "" },
  { id: "s2", nom: "La mise à disposition du personnel", categorieId: "cat_grh", prix: 0, description: "" },
  { id: "s3", nom: "La placement/Intérim", categorieId: "cat_grh", prix: 0, description: "" },
  { id: "s4", nom: "Elaboration de contrat de travail", categorieId: "cat_grh", prix: 0, description: "" },
  { id: "s5", nom: "La gestion des contrats (CDD-CDI)", categorieId: "cat_grh", prix: 0, description: "" },
  { id: "s6", nom: "Les recrutements", categorieId: "cat_grh", prix: 0, description: "" },
  { id: "s7", nom: "La formation", categorieId: "cat_grh", prix: 0, description: "" },
  { id: "s8", nom: "Elaboration de manuel de procédure administrative", categorieId: "cat_aa", prix: 0, description: "" },
  { id: "s9", nom: "Assistance dans la gestion des litiges de travail", categorieId: "cat_aa", prix: 0, description: "" },
  { id: "s10", nom: "L’assistance à la création d’entreprises", categorieId: "cat_aa", prix: 0, description: "" },
  { id: "s11", nom: "Gestion des formalités administratives et consulaires", categorieId: "cat_aa", prix: 0, description: "" },
  { id: "s12", nom: "Elaboration de contrats (bail, location, gérance)", categorieId: "cat_aa", prix: 0, description: "" },
  { id: "s13", nom: "Suivi des relations contractuelles commerciales", categorieId: "cat_aa", prix: 0, description: "" },
  { id: "s14", nom: "Immatriculation INPS (structures et personnel)", categorieId: "cat_ps", prix: 0, description: "" },
  { id: "s15", nom: "Gestion des accidents de travail et AF", categorieId: "cat_ps", prix: 0, description: "" },
  { id: "s16", nom: "Liquidation des dossiers de retraite", categorieId: "cat_ps", prix: 0, description: "" },
  { id: "s17", nom: "Le contrôle de parcours (transporteur)", categorieId: "cat_ap", prix: 0, description: "" },
  { id: "s18", nom: "L’assistance et la formation gestion de stock", categorieId: "cat_ap", prix: 0, description: "" },
  { id: "s19", nom: "Inventaire et calcul mouvements de stocks", categorieId: "cat_ap", prix: 0, description: "" },
  { id: "s20", nom: "Les études / enquêtes", categorieId: "cat_ap", prix: 0, description: "" },
  { id: "s21", nom: "La distribution de courrier", categorieId: "cat_ap", prix: 0, description: "" },
  { id: "s22", nom: "Traduction des documents (Anglais-Français)", categorieId: "cat_ap", prix: 0, description: "" },
  { id: "s23", nom: "Le traitement chimique (Désinsectisation...)", categorieId: "cat_ap", prix: 0, description: "" },
  { id: "s24", nom: "Entretien des climatisations", categorieId: "cat_ap", prix: 0, description: "" },
];

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return saved ? JSON.parse(saved) : initialCategories;
  });

  const [services, setServices] = useState<Service[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SERVICES);
    return saved ? JSON.parse(saved) : initialServices;
  });

  const [clients, setClients] = useState<Client[]>(() => JSON.parse(localStorage.getItem(STORAGE_KEYS.CLIENTS) || "[]"));
  const [invoices, setInvoices] = useState<Invoice[]>(() => JSON.parse(localStorage.getItem(STORAGE_KEYS.INVOICES) || "[]"));
  const [payments, setPayments] = useState<Payment[]>(() => JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYMENTS) || "[]"));
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) return JSON.parse(saved);
    return {
      defaultTva: 18,
      currency: "FCFA",
      companyName: "APRESS MALI S.A.R.L",
      companyAddress: "Immeuble ABK III, 1er étage, Porte 102, Hamdallaye ACI 2000, Bamako, Mali",
      companyNif: "00101860E",
      companyRCCM: "RC Bamako 2006B3016",
      companyNina: "40609194223321A",
      bankDetails: "BDM-SA N° ML016 01201 020401004992-60",
      mobileMoneyDetails: "Tél: 20 29 39 53 / Fax: 20 29 21 35",
      legalMentions: "BP E1466 - Email: specialprestamali@hotmail.com"
    };
  });

  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services)); }, [services]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients)); }, [clients]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices)); }, [invoices]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments)); }, [payments]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings)); }, [settings]);

  const addCategory = useCallback((c: Omit<Category, "id">) => setCategories(prev => [...prev, { ...c, id: generateId() }]), []);
  const updateCategory = useCallback((id: string, updated: Partial<Category>) => setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c)), []);
  const addService = useCallback((s: Omit<Service, "id">) => setServices(prev => [...prev, { ...s, id: generateId() }]), []);
  const updateService = useCallback((id: string, updated: Partial<Service>) => setServices(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s)), []);
  const addClient = useCallback((c: Omit<Client, "id">) => setClients(prev => [...prev, { ...c, id: generateId() }]), []);
  const updateClient = useCallback((id: string, updated: Partial<Client>) => setClients(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c)), []);

  const addInvoice = useCallback((inv: Omit<Invoice, "id" | "numero">) => {
    setInvoices(prev => {
      const prefix = inv.type === "facture" ? "FAC" : "DEV";
      const count = prev.filter(i => i.type === inv.type).length + 1;
      const numero = `${prefix}-${new Date().getFullYear()}-${String(count).padStart(3, '0')}`;
      return [...prev, { ...inv, id: generateId(), numero }];
    });
  }, []);

  const updateInvoice = useCallback((id: string, updated: Partial<Invoice>) => setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, ...updated } : inv)), []);

  const updateInvoiceStatus = useCallback((id: string, amountPaid: number) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === id) {
        const newPaye = inv.paye + amountPaid;
        let newStatus: Invoice["status"] = "non_payée";
        if (newPaye >= inv.montantTTC) newStatus = "payée";
        else if (newPaye > 0) newStatus = "partielle";
        return { ...inv, paye: newPaye, status: newStatus };
      }
      return inv;
    }));
  }, []);

  const addPayment = useCallback((p: Omit<Payment, "id">) => {
    setPayments(prev => [...prev, { ...p, id: generateId() }]);
    updateInvoiceStatus(p.invoiceId, p.amount);
  }, [updateInvoiceStatus]);

  const deletePayment = useCallback((id: string) => {
    setPayments(prevPayments => {
      const p = prevPayments.find(item => item.id === id);
      if (p) {
        setInvoices(prevInvoices => prevInvoices.map(inv => {
          if (inv.id === p.invoiceId) {
            const newPaye = Math.max(0, inv.paye - p.amount);
            let newStatus: Invoice["status"] = "non_payée";
            if (newPaye >= inv.montantTTC) newStatus = "payée";
            else if (newPaye > 0) newStatus = "partielle";
            return { ...inv, paye: newPaye, status: newStatus };
          }
          return inv;
        }));
        return prevPayments.filter(item => item.id !== id);
      }
      return prevPayments;
    });
  }, []);

  const archiveItem = useCallback((type: "clients" | "services" | "invoices" | "categories", id: string) => {
    if (type === "clients") setClients(prev => prev.map(c => c.id === id ? { ...c, archived: true } : c));
    if (type === "services") setServices(prev => prev.map(s => s.id === id ? { ...s, archived: true } : s));
    if (type === "invoices") setInvoices(prev => prev.map(i => i.id === id ? { ...i, archived: true } : i));
    if (type === "categories") setCategories(prev => prev.map(c => c.id === id ? { ...c, archived: true } : c));
  }, []);

  const updateSettings = useCallback((s: AppSettings) => setSettings(s), []);

  const exportData = useCallback(() => {
    const data = { categories, services, clients, invoices, payments, settings };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `apress_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  }, [categories, services, clients, invoices, payments, settings]);

  const importData = useCallback((jsonData: string) => {
    try {
      const data = JSON.parse(jsonData);
      if (data.categories) setCategories(data.categories);
      if (data.services) setServices(data.services);
      if (data.clients) setClients(data.clients);
      if (data.invoices) setInvoices(data.invoices);
      if (data.payments) setPayments(data.payments);
      if (data.settings) setSettings(data.settings);
      return true;
    } catch (e) { return false; }
  }, []);

  const stats = useMemo(() => {
    const valid = invoices.filter(i => i.type === "facture" && !i.archived);
    const totalFacture = valid.reduce((acc, curr) => acc + curr.montantTTC, 0);
    const totalEncaisse = valid.reduce((acc, curr) => acc + curr.paye, 0);
    const resteARecouvrer = totalFacture - totalEncaisse;
    const tauxRecouvrement = totalFacture > 0 ? (totalEncaisse / totalFacture) * 100 : 0;
    return { totalFacture, totalEncaisse, resteARecouvrer, tauxRecouvrement };
  }, [invoices]);

  const contextValue = useMemo(() => ({
    categories, services, clients, invoices, payments, settings, stats,
    addCategory, updateCategory, addService, updateService, addClient, updateClient,
    addInvoice, updateInvoice, updateInvoiceStatus, addPayment, deletePayment, archiveItem,
    updateSettings, exportData, importData
  }), [
    categories, services, clients, invoices, payments, settings, stats,
    addCategory, updateCategory, addService, updateService, addClient, updateClient,
    addInvoice, updateInvoice, updateInvoiceStatus, addPayment, deletePayment, archiveItem,
    updateSettings, exportData, importData
  ]);

  return <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within DataProvider");
  return context;
};
