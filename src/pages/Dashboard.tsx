import { useMemo } from "react";
import { 
  TrendingUp, 
  Users, 
  CreditCard, 
  ArrowUpRight, 
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  PieChart as PieChartIcon,
  Plus
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useData } from "@/contexts/DataContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { cn } from "@/lib/utils";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Dashboard = () => {
  const { invoices, clients, categories, services, stats } = useData();
  const navigate = useNavigate();

  const recentInvoices = useMemo(() => {
    try {
      return [...invoices]
        .filter(i => i && !i.archived)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);
    } catch (e) {
      console.error("Error in recentInvoices calculation", e);
      return [];
    }
  }, [invoices]);

  const chartData = useMemo(() => {
    try {
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        return d.toLocaleString('fr-FR', { month: 'short' });
      }).reverse();

      return last6Months.map(month => {
        const total = invoices
          .filter(inv => {
            if (!inv || !inv.date || inv.archived) return false;
            const invDate = new Date(inv.date);
            return invDate.toLocaleString('fr-FR', { month: 'short' }) === month && 
                   inv.type === 'facture';
          })
          .reduce((sum, inv) => sum + (inv.montantTTC || 0), 0);
        
        return { name: month, total };
      });
    } catch (e) {
      console.error("Error in chartData calculation", e);
      return [];
    }
  }, [invoices]);

  const pieData = useMemo(() => {
    try {
      if (!categories || categories.length === 0) return [{ name: 'Aucune catégorie', value: 1 }];

      const res = categories.map(cat => {
        const total = invoices
          .filter(inv => inv && inv.type === 'facture' && !inv.archived)
          .reduce((sum, inv) => {
            const categoryItems = (inv.items || []).filter(item => {
              const svc = services.find(s => s.id === item.serviceId);
              return svc?.categorieId === cat.id;
            });
            return sum + categoryItems.reduce((s, item) => s + (item.montant || 0), 0);
          }, 0);
        return { name: cat.nom ? cat.nom.split(' ')[0] : "Cat", value: total };
      }).filter(d => d.value > 0);

      return res.length > 0 ? res : [{ name: 'En attente', value: 1 }];
    } catch (e) {
      console.error("Error in pieData calculation", e);
      return [{ name: 'Erreur', value: 1 }];
    }
  }, [invoices, categories, services]);

  const COLORS = ['#0f172a', '#1e293b', '#334155', '#475569', '#64748b'];

  const safeStats = {
    totalFacture: stats?.totalFacture || 0,
    totalEncaisse: stats?.totalEncaisse || 0,
    resteARecouvrer: stats?.resteARecouvrer || 0,
    tauxRecouvrement: stats?.tauxRecouvrement || 0,
  };

  return (
    <div className="space-y-8 pb-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader 
          title="Tableau de bord" 
          description="Vue d'ensemble de la performance d'Apress Mali" 
        />
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm">
            <Link to="/reports">Consulter les rapports</Link>
          </Button>
          <Button asChild size="sm" className="shadow-lg shadow-primary/20">
            <Link to="/invoices">
              <Plus className="h-4 w-4 mr-2" /> Nouvelle Facture
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Chiffre d'affaires"
          value={`${safeStats.totalFacture.toLocaleString()} FCFA`}
          icon={TrendingUp}
          trend={{ value: "Total facturé", isPositive: true }}
          onClick={() => navigate("/invoices")}
        />
        <StatCard
          title="Recouvrement"
          value={`${safeStats.totalEncaisse.toLocaleString()} FCFA`}
          icon={CheckCircle2}
          trend={{ value: `${safeStats.tauxRecouvrement.toFixed(1)}% encaissé`, isPositive: safeStats.tauxRecouvrement > 50 }}
          onClick={() => navigate("/invoices")}
        />
        <StatCard
          title="Reste à percevoir"
          value={`${safeStats.resteARecouvrer.toLocaleString()} FCFA`}
          icon={Clock}
          trend={{ value: "Factures en attente", isNeutral: true }}
          onClick={() => navigate("/invoices")}
        />
        <StatCard
          title="Clients Actifs"
          value={clients.filter(c => c && !c.archived).length.toString()}
          icon={Users}
          trend={{ value: "Base client", isPositive: true }}
          onClick={() => navigate("/clients")}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 glass-card border-slate-100 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" /> Performance Financière
                </CardTitle>
                <CardDescription>Évolution du chiffre d'affaires sur les 6 derniers mois</CardDescription>
              </div>
              <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-bold text-[10px]">MENSUEL</Badge>
            </div>
          </CardHeader>
          <CardContent className="h-[350px] pt-4">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 'bold' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="total" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorTotal)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm italic">
                Données graphiques insuffisantes
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card border-slate-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-primary" /> Répartition
            </CardTitle>
            <CardDescription>Par catégorie de service</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {pieData.slice(0, 4).map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-[10px] text-muted-foreground truncate font-medium uppercase tracking-tight">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 glass-card border-slate-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Factures Récentes</CardTitle>
              <CardDescription>Suivi des dernières transactions</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-primary font-bold hover:bg-primary/5">
              <Link to="/invoices">Voir tout</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentInvoices.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-sm italic">
                  Aucune facture enregistrée dans le système.
                </div>
              ) : (
                recentInvoices.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white/50 group hover:bg-primary/5 transition-all hover:border-primary/20">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-3 rounded-xl transition-all",
                        inv.status === 'payée' ? 'bg-success/10 text-success' : 
                        inv.status === 'partielle' ? 'bg-warning/10 text-warning' : 'bg-destructive/10 text-destructive'
                      )}>
                        {inv.status === 'payée' ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 group-hover:text-primary transition-colors tracking-tight">{inv.numero}</p>
                        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">{inv.clientName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900 tracking-tighter">{inv.montantTTC.toLocaleString()} FCFA</p>
                      <p className="text-[10px] text-slate-400 font-bold">{new Date(inv.date).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="glass-card overflow-hidden border-slate-100 shadow-sm">
            <CardHeader className="bg-slate-50/50 pb-4 border-b border-slate-100">
              <CardTitle className="text-[10px] font-black flex items-center gap-2 text-slate-400 uppercase tracking-[0.2em]">
                <AlertCircle className="h-4 w-4 text-primary" /> Santé Financière
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1">
                  <span className="text-slate-400">Taux de recouvrement</span>
                  <span className="text-primary">{safeStats.tauxRecouvrement.toFixed(1)}%</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-1000 shadow-sm" 
                    style={{ width: `${safeStats.tauxRecouvrement}%` }}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[9px] text-slate-400 uppercase font-black tracking-[0.1em] mb-1">Encaissé</p>
                  <p className="text-sm font-black text-slate-900 tracking-tight">{safeStats.totalEncaisse.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[9px] text-slate-400 uppercase font-black tracking-[0.1em] mb-1">En attente</p>
                  <p className="text-sm font-black text-slate-900 tracking-tight">{safeStats.resteARecouvrer.toLocaleString()}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-slate-500">Délai moyen règlement</span>
                  <Badge variant="outline" className="text-[9px] font-black uppercase border-slate-200 text-slate-400">14 JOURS</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 text-white border-none shadow-2xl relative overflow-hidden group rounded-[32px]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <CardContent className="p-8 relative">
              <div className="flex items-center justify-between mb-8">
                <div className="p-4 bg-white/10 rounded-[20px] backdrop-blur-md">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <ArrowUpRight className="h-5 w-5 text-white/30" />
              </div>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Créances à recouvrer</p>
              <h2 className="text-3xl font-black mt-2 tracking-tighter">{safeStats.resteARecouvrer.toLocaleString()} FCFA</h2>
              <p className="text-[11px] mt-8 text-white/50 italic font-medium leading-relaxed">
                Relancez vos clients pour optimiser la trésorerie d'Apress Mali.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
