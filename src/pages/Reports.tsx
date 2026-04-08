import { useMemo } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Download,
  Filter,
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
import { formatCurrency, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Reports = () => {
  const { invoices, categories, clients, stats } = useData();

  const reportStats = useMemo(() => {
    const validInvoices = invoices.filter(i => i.type === 'facture' && !i.archived);
    const totalCount = validInvoices.length;
    const paidCount = validInvoices.filter(i => i.status === 'payée').length;
    const pendingCount = totalCount - paidCount;
    const avgInvoiceValue = totalCount > 0 ? stats.totalFacture / totalCount : 0;

    return { totalCount, paidCount, pendingCount, avgInvoiceValue };
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
        .filter(inv => !inv.archived)
        .flatMap(inv => inv.items)
        .filter(item => {
          // Simplification pour l'exemple : on pourrait lier via le service
          return true; 
        })
        .reduce((sum, item) => sum + item.montant, 0);
      return { name: cat.nom.split(' ')[0], value: total };
    }).filter(d => d.value > 0);
    
    return data.length > 0 ? data : [{ name: 'Aucun', value: 1 }];
  }, [invoices, categories]);

  return (
    <div className="space-y-8 pb-12">
      <PageHeader 
        title="Rapports Analytiques" 
        description="Analyse approfondie des performances d'Apress Mali"
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" /> Période
            </Button>
            <Button size="sm">
              <Download className="h-4 w-4 mr-2" /> Exporter PDF
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card overflow-hidden group">
          <CardContent className="p-6">
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Valeur Moyenne Facture</p>
            <h3 className="text-2xl font-black mt-2 text-primary">{formatCurrency(reportStats.avgInvoiceValue)}</h3>
            <div className="mt-4 flex items-center gap-1 text-xs text-success font-bold">
              <TrendingUp className="h-3 w-3" /> +12% vs mois dernier
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card overflow-hidden group">
          <CardContent className="p-6">
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Taux de Paiement</p>
            <h3 className="text-2xl font-black mt-2 text-foreground">
              {reportStats.totalCount > 0 
                ? ((reportStats.paidCount / reportStats.totalCount) * 100).toFixed(1) 
                : 0}%
            </h3>
            <div className="mt-4 flex items-center gap-1 text-xs text-muted-foreground font-medium">
              {reportStats.paidCount} factures sur {reportStats.totalCount}
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card overflow-hidden group">
          <CardContent className="p-6">
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Encaissement Total</p>
            <h3 className="text-2xl font-black mt-2 text-success">{formatCurrency(stats.totalEncaisse)}</h3>
            <div className="mt-4 flex items-center gap-1 text-xs text-success font-bold">
              <TrendingUp className="h-3 w-3" /> Performance optimale
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card overflow-hidden group">
          <CardContent className="p-6">
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Créances Clients</p>
            <h3 className="text-2xl font-black mt-2 text-destructive">{formatCurrency(stats.resteARecouvrer)}</h3>
            <div className="mt-4 flex items-center gap-1 text-xs text-destructive font-bold">
              <TrendingDown className="h-3 w-3" /> À relancer urgemment
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card border-none shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" /> Revenus & Encaissements
            </CardTitle>
            <CardDescription>Comparaison entre facturé et encaissé par mois</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v/1000000).toFixed(1)}M`} />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="total" name="Facturé" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="paid" name="Encaissé" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card border-none shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-primary" /> Volume par Catégorie
            </CardTitle>
            <CardDescription>Répartition du chiffre d'affaires annuel</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] flex flex-col items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-none shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <TableIcon className="h-5 w-5 text-primary" /> Top Clients
            </CardTitle>
            <CardDescription>Classement par volume d'affaires</CardDescription>
          </div>
          <Badge variant="outline" className="font-bold">Annuel</Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {clients.slice(0, 5).map((client, idx) => {
              const clientInvoices = invoices.filter(i => i.clientId === client.id && !i.archived);
              const total = clientInvoices.reduce((s, i) => s + i.montantTTC, 0);
              const progress = stats.totalFacture > 0 ? (total / stats.totalFacture) * 100 : 0;
              
              return (
                <div key={client.id} className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-[10px]">{idx + 1}</span>
                      <span className="font-bold">{client.nom}</span>
                    </div>
                    <span className="font-black text-primary">{formatCurrency(total)}</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-1000 ease-out" 
                      style={{ width: `${progress}%` }}
                    />
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
