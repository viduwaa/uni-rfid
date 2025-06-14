import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ForgotPassword() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
          <CardDescription className="text-center">
            Enter your email to receive a password reset link
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">User Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="user@university.edu" 
              className="focus-visible:ring-primary"
            />
            <p className="text-sm text-muted-foreground">
              You'll receive an email with instructions to reset your password.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button className="w-full" type="submit">
            Send Reset Link
          </Button>
          <div className="flex items-center justify-center space-x-2 text-sm">
            <span>Remember your password?</span>
            <Link 
              href="/admin/adminlogin" 
              className="font-medium text-primary hover:underline"
            >
              Login
            </Link>
          </div>
          <Link href="/" className="w-full">
            <Button variant="outline" className="w-full">
              Back to Home
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}