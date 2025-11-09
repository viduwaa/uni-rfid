"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IdCard, ArrowLeft, CreditCard } from "lucide-react";
import IssueNewCard from "./IssueNewCard";
import ManageExistingCard from "./ManageExistingCard";
import { UserCog } from "lucide-react";
import DeviceStatus from "@/components/DeviceStatus";
import AddMenu from "./AddMenu";
import { DollarSign, Loader2 } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import formatCurrency from "@/lib/formatCurrency";

interface RFIDStats {
  activeCards: number;
  issuedCards: number;
  totalBalance: number;
  unissuedCards: number;
}

export default function RFIDManagement() {
  const [showIssueNew, setShowIssueNew] = useState(true);
  const [stats, setStats] = useState<RFIDStats>({
    activeCards: 0,
    issuedCards: 0,
    totalBalance: 0,
    unissuedCards: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Fetch RFID stats
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const response = await fetch("/api/rfid/stats");
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      } else {
        toast.error("Failed to load statistics");
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Error loading statistics");
    } finally {
      setLoadingStats(false);
    }
  };

  // Refresh stats when switching tabs or after operations
  const handleRefreshStats = () => {
    fetchStats();
  };

  return (
    <>
      <div className="container mx-auto">
        <div className="p-6 space-y-6">
          <PageHeader
            title={"RFID Card Management"}
            subtitle={"Modern card management system"}
            backHref="/admin/dashboard"
            centerIcon={<IdCard className="h-6 w-6" />}
            right={<DeviceStatus />}
          />

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="flex items-center p-4">
                <CreditCard className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  {loadingStats ? (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  ) : (
                    <p className="text-2xl font-bold">{stats.activeCards}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Active Cards</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-4">
                <IdCard className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  {loadingStats ? (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  ) : (
                    <p className="text-2xl font-bold">{stats.issuedCards}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Total Issued Cards
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-4">
                <UserCog className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  {loadingStats ? (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  ) : (
                    <p className="text-2xl font-bold">{stats.unissuedCards}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Unissued Cards
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-4">
                <DollarSign className="h-8 w-8 text-orange-600 mr-3" />
                <div>
                  {loadingStats ? (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  ) : (
                    <p className="text-2xl font-bold">
                      {formatCurrency(stats.totalBalance)}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">Total Balance</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <Card>
            {showIssueNew ? (
              <IssueNewCard onCardIssued={handleRefreshStats} />
            ) : (
              <ManageExistingCard onCardUpdated={handleRefreshStats} />
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
