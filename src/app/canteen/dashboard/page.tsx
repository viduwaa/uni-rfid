import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Calendar,
  History,
} from "lucide-react";

export default function CanteenDashboard() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-10 p-6 space-y-6">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-center">
            Canteen Management System
          </h1>
          <p className="mt-2 text-muted-foreground text-center">
            Manage food purchases, track canteen usage, and oversee meal plans.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 px-5">
          
          <Link href=" " className="block">
            <Card className="h-full transition-all hover:shadow-md">
              <CardHeader>
                <ShoppingCart className="h-8 w-8 text-primary" />
                <CardTitle className="mt-2">Food Purchases</CardTitle>
                <CardDescription>
                  Manage daily food transactions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                 Process student purchases, manage payment methods, and track daily sales transactions
                </p>
              </CardContent>
            </Card>
          </Link>

          
          <Link href=" " className="block">
            <Card className="h-full transition-all hover:shadow-md">
              <CardHeader>
                <Calendar className="h-8 w-8 text-primary" />
                <CardTitle className="mt-2">Meal Plans</CardTitle>
                <CardDescription>
                  Oversee weekly meal planning.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Plan weekly menus, manage dietary requirements, and schedule meal preparations.
                </p>
              </CardContent>
            </Card>
          </Link>


          <Link href="/canteen/transaction-history" className="block">
            <Card className="h-full transition-all hover:shadow-md">
              <CardHeader>
                <History className="h-8 w-8 text-primary" />
                <CardTitle className="mt-2">Transaction History</CardTitle>
                <CardDescription>
                  View past transaction records.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Review historical transaction data and track spending patterns over time.
                </p>
              </CardContent>
            </Card>
          </Link>

        </div>

        <div className="mt-8 flex justify-end px-5">
                  <Link href="/">
                    <Button variant="outline">Logout</Button>
                  </Link>
                </div>
              </div>
            </div>
          );
        }