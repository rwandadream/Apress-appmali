import { useMemo } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Download,
  PieChart as PieChartIcon,
  Table as TableIcon
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useData } from "@/contexts/DataContext";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Reports = () => {
  const { invoices, categories, clients, services, stats } = useData();

  const reportStats = useMemo(() => {
    const validInvoices = invoices.filter(i => i.type === 'facture' && !i.archived);
    const totalCount = validInvoices.length;
    const paidCount = validInvoices.filter(i => i.status === 'payée').length;
    const avgInvoiceValue = totalCount > 0 ? stats.totalFacture / totalCount : 0;

    return { totalCount, paidCount, avgInvoiceValue };
  }, [invoices, stats]);

  const monthlyData = useMemo(() => {
    const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
    const currentYear = new Date().getFullYear();

    return months.map((month, index) => {
      const total = invoices
        .filter(inv => {
          const d = new Date(inv.date);
          return d.getMonth() === index && d.getFullYear() === currentYear && inv.type === 'facture' && !inv.archived;
        })
        .reduce((sum, inv) => sum + inv.montantTTC, 0);
      
      const paid = invoices
        .filter(inv => {
          const d = new Date(inv.date);
          return d.getMonth() === index && d.getFullYear() === currentYear && inv.status === 'payée' && !inv.archived;
        })
        .reduce((sum, inv) => sum + inv.paye, 0);

      return { name: month, total, paid };
    });
  }, [invoices]);

  const categoryDistribution = useMemo(() => {
    const data = categories.map(cat => {
      const total = invoices
        .filter(inv => !inv.archived && inv.type === 'facture')
        .flatMap(inv => inv.items)
        .filter(item => {
          const service = services.find(s => s.id === item.serviceId);
          return service?.categorieId === cat.id;
        })
        .reduce((sum, item) => sum + item.montant, 0);
      return { name: cat.nom.split(' ')[0], value: total };
    }).filter(d => d.value > 0);
    
    return data.length > 0 ? data : [{ name: 'N/A', value: 1 }];
  }, [invoices, categories, services]);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <div className="no-print">
        <PageHeader 
          title="Rapports" 
          description="Analyse des performances"
          action={
            <Button size="sm" onClick={() => window.print()} className="gap-2">
              <Download className="h-4 w-4" /> <span className="hidden xs:inline">Exporter</span>
            </Button>
          }
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Moyenne/Facture", value: formatCurrency(reportStats.avgInvoiceValue), icon: TrendingUp, color: "text-primary" },
          { label: "Taux Paiement", value: `${reportStats.totalCount > 0 ? ((reportStats.paidCount/reportStats.totalCount)*100).toFixed(1) : 0}%`, icon: PieChartIcon, color: "text-foreground" },
          { label: "Total Encaissé", value: formatCurrency(stats.totalEncaisse), icon: TrendingUp, color: "text-success" },
          { label: "Créances", value: formatCurrency(stats.resteARecouvrer), icon: TrendingDown, color: "text-destructive" }
        ].map((s, i) => (
          <Card key={i} className="glass-card">
            <CardContent className="p-5">
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{s.label}</p>
              <h3 className={`text-xl font-black mt-1 tracking-tighter ${s.color}`}>{s.value}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card border-none shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 font-black">
              <BarChart3 className="h-4 w-4 text-primary" /> Revenus & Encaissements
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] sm:h-[350px] px-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Bar dataKey="total" name="Facturé" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="paid" name="Encaissé" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card border-none shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 font-black">
              <PieChartIcon className="h-4 w-4 text-primary" /> Volume par Catégorie
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] sm:h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryDistribution} innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                  {categoryDistribution.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '12px' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-none shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2 font-black">
            <TableIcon className="h-4 w-4 text-primary" /> Top Clients
          </CardTitle>
          <Badge variant="secondary" className="text-[10px] font-black uppercase">Annuel</Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {clients.slice(0, 5).map((client, idx) => {
              const clientInvoices = invoices.filter(i => i.clientId === client.id && !i.archived);
              const total = clientInvoices.reduce((s, i) => s + i.montantTTC, 0);
              const progress = stats.totalFacture > 0 ? (total / stats.totalFacture) * 100 : 0;
              return (
                <div key={client.id} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold flex items-center gap-2">
                      <span className="opacity-30">{idx + 1}.</span> {client.nom}
                    </span>
                    <span className="font-black text-primary">{formatCurrency(total)}</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
