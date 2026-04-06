import { useMemo } from "react";
import { 
  TrendingUp, 
  Users, 
  FileText, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useData } from "@/contexts/DataContext";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const { stats, invoices, clients } = useData();

  const recentInvoices = useMemo(() => {
    return invoices
      .filter(i => !i.archived)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [invoices]);

  const pendingAmount = useMemo(() => {
    return invoices
      .filter(i => i.status !== "payée" && !i.archived && i.type === "facture")
      .reduce((acc, curr) => acc + (curr.montantTTC - curr.paye), 0);
  }, [invoices]);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Tableau de bord" 
        description="Vue d'ensemble de la performance d'Apress Mali" 
      />

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Chiffre d'affaires"
          value={`${stats.totalFacture.toLocaleString()} FCFA`}
          icon={TrendingUp}
          trend={{ value: "Total facturé", isPositive: true }}
        />
        <StatCard
          title="Recouvrement"
          value={`${stats.totalEncaisse.toLocaleString()} FCFA`}
          icon={CheckCircle2}
          trend={{ value: `${stats.tauxRecouvrement.toFixed(1)}% encaissé`, isPositive: true }}
        />
        <StatCard
          title="Reste à percevoir"
          value={`${stats.resteARecouvrer.toLocaleString()} FCFA`}
          icon={Clock}
          trend={{ value: "Factures en attente", isPositive: false }}
          className="border-l-4 border-l-warning"
        />
        <StatCard
          title="Clients Actifs"
          value={clients.filter(c => !c.archived).length.toString()}
          icon={Users}
          trend={{ value: "Base client", isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity / Invoices */}
        <Card className="lg:col-span-2 glass-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Factures Récentes</CardTitle>
            <Badge variant="outline" className="font-normal">Dernières transactions</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentInvoices.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-sm">
                  Aucune facture enregistrée.
                </div>
              ) : (
                recentInvoices.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/5 group hover:bg-muted/10 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${inv.status === 'payée' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                        {inv.status === 'payée' ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{inv.numero}</p>
                        <p className="text-xs text-muted-foreground">{inv.clientName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{inv.montantTTC.toLocaleString()} FCFA</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(inv.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recap & Health */}
        <div className="space-y-6">
          <Card className="glass-card overflow-hidden">
            <CardHeader className="bg-primary/5 pb-4">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-primary">
                <AlertCircle className="h-4 w-4" /> Santé Financière
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Taux de recouvrement</span>
                  <span className="font-bold">{stats.tauxRecouvrement.toFixed(1)}%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-1000" 
                    style={{ width: `${stats.tauxRecouvrement}%` }}
                  />
                </div>
              </div>
              <div className="pt-2 border-t space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Facturé ce mois</span>
                  <span className="text-sm font-bold">En cours...</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Délai moyen paiement</span>
                  <span className="text-sm font-bold">14 jours</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary text-primary-foreground shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-white/20 rounded-lg">
                  <CreditCard className="h-6 w-6" />
                </div>
                <ArrowUpRight className="h-5 w-5 opacity-50" />
              </div>
              <p className="text-white/70 text-sm font-medium">À recouvrer</p>
              <h2 className="text-2xl font-black mt-1">{stats.resteARecouvrer.toLocaleString()} FCFA</h2>
              <p className="text-[10px] mt-4 opacity-70 italic text-white/80">
                Pensez à relancer les clients en attente de paiement.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
