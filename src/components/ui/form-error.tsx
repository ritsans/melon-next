import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormErrorProps {
  error?: string;
  className?: string;
}

export function FormError({ error, className }: FormErrorProps) {
  if (!error) return null;

  return (
    <div className={cn("flex items-center gap-1 text-sm text-red-600", className)}>
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <p>{error}</p>
    </div>
  );
}
