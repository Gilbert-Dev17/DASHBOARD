import type { ReactNode } from "react";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  return (
    <div>
      {/* TODO: Add sidebar/navbar here */}
      <main>{children}</main>
    </div>
  );
}