import { DollarSign, FileText, Users, TrendingUp, AlertTriangle } from "lucide-react";
import StatCard from "@/components/StatCard";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Badge } from "@/components/ui/badge";

const monthlyRevenue = [
  { month: "Jan", revenue: 4200000 },
  { month: "Fév", revenue: 3800000 },
  { month: "Mar", revenue: 5100000 },
  { month: "Avr", revenue: 4700000 },
  { month: "Mai", revenue: 6200000 },
  { month: "Jun", revenue: 5500000 },
];

const serviceDistribution = [
  { name: "Gestion RH", value: 40, color: "hsl(220, 72%, 33%)" },
  { name: "Admin", value: 30, color: "hsl(355, 82%, 52%)" },
  { name: "Social", value: 20, color: "hsl(38, 92%, 50%)" },
  { name: "Autres", value: 10, color: "hsl(142, 71%, 45%)" },
];

const overdueInvoices = [
  { id: "APM-2026-012", client: "Société Alpha", amount: "1 250 000 FCFA", days: 15 },
  { id: "APM-2026-018", client: "Enterprise Beta", amount: "850 000 FCFA", days: 8 },
  { id: "APM-2026-021", client: "Groupe Gamma", amount: "2 100 000 FCFA", days: 22 },
];

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <PageHeader title="Tableau de bord" description="Vue d'ensemble de votre activité" />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Revenu Total"
          value="29 500 000 FCFA"
          change="+12.5% ce mois"
          changeType="positive"
          icon={DollarSign}
        />
        <StatCard
          title="Factures en attente"
          value="14"
          change="3 en retard"
          changeType="negative"
          icon={FileText}
        />
        <StatCard
          title="Clients Actifs"
          value="48"
          change="+5 ce mois"
          changeType="positive"
          icon={Users}
        />
        <StatCard
          title="Taux d'encaissement"
          value="87.3%"
          change="+2.1% vs mois dernier"
          changeType="positive"
          icon={TrendingUp}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 glass-card">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Évolution des Revenus</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 90%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                <Tooltip formatter={(v: number) => `${v.toLocaleString()} FCFA`} />
                <Bar dataKey="revenue" fill="hsl(220, 72%, 33%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Répartition Services</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={serviceDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={4}>
                  {serviceDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {serviceDistribution.map((s) => (
                <div key={s.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-muted-foreground">{s.name}</span>
                  </div>
                  <span className="font-medium">{s.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          <CardTitle className="text-base font-semibold">Factures en retard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            {overdueInvoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between py-3">
                <div>
                  <span className="font-medium text-sm">{inv.id}</span>
                  <p className="text-xs text-muted-foreground">{inv.client}</p>
                </div>
                <div className="text-right flex items-center gap-3">
                  <span className="font-semibold text-sm">{inv.amount}</span>
                  <Badge variant="destructive" className="text-xs">
                    {inv.days}j de retard
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
