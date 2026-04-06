import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconColor?: string;
}

const StatCard = ({ title, value, change, changeType = "neutral", icon: Icon, iconColor }: StatCardProps) => {
  const changeColors = {
    positive: "text-success",
    negative: "text-destructive",
    neutral: "text-muted-foreground",
  };

  return (
    <div className="glass-card rounded-xl p-5 animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {change && (
            <p className={`text-xs font-medium ${changeColors[changeType]}`}>{change}</p>
          )}
        </div>
        <div className={`p-2.5 rounded-lg ${iconColor || "bg-primary/10"}`}>
          <Icon className={`h-5 w-5 ${iconColor ? "text-primary-foreground" : "text-primary"}`} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
