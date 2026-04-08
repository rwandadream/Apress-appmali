import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
  className?: string;
}

const StatCard = ({ title, value, icon: Icon, trend, className }: StatCardProps) => {
  return (
    <div className={cn("glass-card group overflow-hidden relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1", className)}>
      <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="p-2.5 rounded-xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
            <Icon className="h-5 w-5" />
          </div>
          {trend && (
            <div className={cn(
              "flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider",
              trend.isNeutral ? "bg-muted text-muted-foreground" : 
              trend.isPositive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
            )}>
              {trend.isNeutral ? <Minus className="h-3 w-3" /> : 
               trend.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {trend.value}
            </div>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-sm text-muted-foreground font-medium uppercase tracking-tight">{title}</p>
          <h3 className="text-2xl font-black text-foreground tracking-tighter">{value}</h3>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
