import React, { createContext, useContext } from "react";
import { cn } from "@/lib/utils";

type CardVariant = "purple" | "white";
const CardContext = createContext<{ variant: CardVariant }>({
  variant: "white",
});

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

export function Card({ className, children, variant, ...props }: CardProps) {
  // Determine variant: explicit variant prop > className containing clay-card-purple > default "white"
  const isPurple =
    variant === "purple" ||
    (typeof className === "string" && className.includes("clay-card-purple"));
  const effectiveVariant: CardVariant = isPurple ? "purple" : "white";

  return (
    <CardContext.Provider value={{ variant: effectiveVariant }}>
      <div
        className={cn(
          "ui-card overflow-hidden transition-colors duration-200",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </CardContext.Provider>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  const { variant } = useContext(CardContext);
  return (
    <h3
      className={cn(
        "text-lg font-semibold leading-tight",
        variant === "purple" ? "text-white" : "text-slate-900",
        className,
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  const { variant } = useContext(CardContext);
  return (
    <p
      className={cn(
        "text-sm leading-relaxed font-medium",
        variant === "purple" ? "text-white" : "text-slate-600",
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-6 pt-0", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center p-6 pt-0 mt-auto", className)}
      {...props}
    >
      {children}
    </div>
  );
}
