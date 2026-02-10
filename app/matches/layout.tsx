import { ReactNode } from 'react';

export default function MatchLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { id: string };
}) {
  return children;
}
