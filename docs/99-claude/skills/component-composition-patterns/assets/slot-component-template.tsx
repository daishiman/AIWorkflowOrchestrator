import type { ReactNode } from "react";

type SlotProps = {
  children: ReactNode;
  className?: string;
};

type SlotRootProps = {
  asChild?: boolean;
  className?: string;
  children: ReactNode;
};

export function SlotRoot({
  asChild = false,
  className,
  children,
}: SlotRootProps) {
  const Component: any = asChild ? SlotChild : "div";
  return <Component className={className}>{children}</Component>;
}

export function SlotChild({ children, className }: SlotProps) {
  return <span className={className}>{children}</span>;
}
