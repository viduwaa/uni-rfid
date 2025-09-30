"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calculator, CreditCard, DollarSign } from "lucide-react";

interface ManualPaymentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (amount: number) => void;
    totalAmount: number;
    currentBalance: number;
    studentName: string;
}

export default function ManualPaymentDialog({
    isOpen,
    onClose,
    onConfirm,
    totalAmount,
    currentBalance,
    studentName,
}: ManualPaymentDialogProps) {
    const [manualAmount, setManualAmount] = useState<string>(
        totalAmount.toString()
    );
    const [isProcessing, setIsProcessing] = useState(false);

    const deficit = totalAmount - currentBalance;
    const numericAmount = parseFloat(manualAmount) || 0;

    const handleConfirm = async () => {
        setIsProcessing(true);
        try {
            await onConfirm(numericAmount);
            onClose();
        } catch (error) {
            console.error("Manual payment error:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    const resetAmount = () => {
        setManualAmount(totalAmount.toString());
    };

    const setMinimumAmount = () => {
        setManualAmount(deficit.toString());
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Manual Payment Required
                    </DialogTitle>
                    <DialogDescription>
                        Insufficient card balance. Process manual payment for{" "}
                        <strong>{studentName}</strong>.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <Alert>
                        <Calculator className="h-4 w-4" />
                        <AlertDescription>
                            <div className="space-y-1">
                                <div className="flex justify-between">
                                    <span>Order Total:</span>
                                    <span className="font-medium">
                                        Rs.{totalAmount}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Card Balance:</span>
                                    <span className="font-medium">
                                        Rs.{currentBalance}
                                    </span>
                                </div>
                                <div className="flex justify-between border-t pt-1">
                                    <span>Deficit:</span>
                                    <span className="font-bold text-red-600">
                                        Rs.{deficit}
                                    </span>
                                </div>
                            </div>
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                        <Label htmlFor="manual-amount">
                            Manual Payment Amount
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                id="manual-amount"
                                type="number"
                                min="0"
                                step="0.01"
                                value={manualAmount}
                                onChange={(e) =>
                                    setManualAmount(e.target.value)
                                }
                                placeholder="Enter amount"
                                className="flex-1"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={setMinimumAmount}
                                title="Set minimum amount to cover deficit"
                            >
                                Min
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={resetAmount}
                                title="Set full order amount"
                            >
                                Full
                            </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Minimum: Rs.{deficit} • Suggested: Rs.{totalAmount}
                        </p>
                    </div>

                    {numericAmount < deficit && (
                        <Alert>
                            <AlertDescription className="text-amber-600">
                                ⚠️ Amount is less than the deficit. Remaining
                                balance will still be insufficient.
                            </AlertDescription>
                        </Alert>
                    )}
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isProcessing}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={isProcessing || numericAmount <= 0}
                        className="flex items-center gap-2"
                    >
                        <CreditCard className="h-4 w-4" />
                        {isProcessing
                            ? "Processing..."
                            : `Process Rs.${numericAmount}`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
