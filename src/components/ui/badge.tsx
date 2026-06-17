import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary-light text-primary-dark",
        secondary: "border-transparent bg-muted text-foreground/80",
        outline: "border-border text-foreground/80",
        success: "border-transparent bg-accent-light text-accent",
        warning: "border-transparent bg-amber-100 text-amber-800",
        danger: "border-transparent bg-rose-100 text-rose-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
