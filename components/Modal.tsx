"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
  className?: string;
}

export default function Modal({ title, onClose, children, maxWidth = "max-w-md", className }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className={`w-full ${maxWidth} shadow-xl ${className ?? ""}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>{title}</CardTitle>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-xl leading-none"
            type="button"
          >
            ×
          </button>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
}
