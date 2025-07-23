import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SignIn } from "@clerk/nextjs";

export default function LecturerLogin() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Lecturer Login</CardTitle>
          <CardDescription>
            Sign in to access the lecturer dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <SignIn
            appearance={{
              elements: {
                formButtonPrimary: "bg-primary hover:bg-primary/90",
                card: "shadow-none",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
              },
            }}
            redirectUrl="/lecturer/dashboard"
            fallbackRedirectUrl="/lecturer/dashboard"
          />
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/" className="w-full">
            <Button variant="outline" className="w-full">
              Back to Home
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}