"use client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

interface ModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export function Modal({ 
  isOpen, 
  title, 
  message, 
  onClose, 
  onConfirm, 
  confirmText = "Aceptar", 
  cancelText = "Cancelar" 
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-all duration-200">
      <Card className="w-full max-w-sm shadow-xl animate-in zoom-in-95 fade-in-0 duration-200">
        <CardHeader className="space-y-2">
          <CardTitle>{title}</CardTitle>
          <CardDescription className="text-base text-foreground leading-relaxed">
            {message}
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-end gap-3 pt-4">
          {onConfirm && (
            <Button variant="outline" onClick={onClose}>
              {cancelText}
            </Button>
          )}
          <Button 
            variant={onConfirm ? "destructive" : "emerald"} 
            onClick={onConfirm || onClose}
          >
            {confirmText}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
