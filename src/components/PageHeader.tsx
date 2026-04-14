import { ReactNode } from "react";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  showBack?: boolean;
}

const PageHeader = ({ title, description, action, showBack }: PageHeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-4">
        {showBack && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)} 
            className="rounded-full hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight">{title}</h1>
          {description && <p className="text-xs md:text-sm text-muted-foreground font-medium">{description}</p>}
        </div>
      </div>
      {action && (
        <div className="flex items-center gap-2">
          {action}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
