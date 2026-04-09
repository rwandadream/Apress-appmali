import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

const PageHeader = ({ title, description, action }: PageHeaderProps) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
    <div className="space-y-1">
      <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight">{title}</h1>
      {description && <p className="text-xs md:text-sm text-muted-foreground font-medium">{description}</p>}
    </div>
    {action && (
      <div className="flex items-center gap-2">
        {action}
      </div>
    )}
  </div>
);

export default PageHeader;
