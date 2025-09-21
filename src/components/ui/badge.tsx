import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-lg border px-2.5 py-1 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-all duration-200 overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-zyra-primary text-white shadow-sm [a&]:hover:bg-zyra-primary/90",
        secondary:
          "border-transparent bg-zyra-background dark:bg-zyra-card-dark text-zyra-text-secondary dark:text-zyra-text-secondary-dark [a&]:hover:bg-zyra-background/80 dark:[a&]:hover:bg-zyra-card-dark/80",
        destructive:
          "border-transparent bg-zyra-danger text-white shadow-sm [a&]:hover:bg-zyra-danger/90 focus-visible:ring-zyra-danger/20",
        outline:
          "border-zyra-border dark:border-zyra-border-dark text-zyra-text-primary dark:text-zyra-text-primary-dark [a&]:hover:bg-zyra-background dark:[a&]:hover:bg-zyra-card-dark [a&]:hover:text-zyra-text-primary dark:[a&]:hover:text-zyra-text-primary-dark",
        success:
          "border-transparent bg-zyra-success text-white shadow-sm [a&]:hover:bg-zyra-success/90",
        warning:
          "border-transparent bg-zyra-warning text-white shadow-sm [a&]:hover:bg-zyra-warning/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
