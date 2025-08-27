import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4 text-balance">Terms of Service</h1>
          <p className="text-muted-foreground text-lg">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Acceptance of Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using our agricultural marketplace platform, you accept and agree to be bound by the
              terms and provision of this agreement. If you do not agree to abide by the above, please do not use this
              service.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Use License</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              Permission is granted to temporarily access our platform for personal, non-commercial transitory viewing
              only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="space-y-2 text-muted-foreground ml-4">
              <li>• Modify or copy the materials</li>
              <li>• Use the materials for commercial purposes or public display</li>
              <li>• Attempt to reverse engineer any software</li>
              <li>• Remove any copyright or proprietary notations</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>User Accounts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Client Accounts</h3>
              <p className="text-muted-foreground leading-relaxed">
                Clients may create accounts to view and purchase agricultural goods and services. You are responsible
                for maintaining the confidentiality of your account credentials.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Business Accounts</h3>
              <p className="text-muted-foreground leading-relaxed">
                Agricultural businesses may create accounts to sell products through our platform. Business users must
                provide accurate information about their products, certifications, and comply with all applicable
                agricultural regulations.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Product Listings and Sales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              Business users selling agricultural products agree to:
            </p>
            <ul className="space-y-2 text-muted-foreground ml-4">
              <li>• Provide accurate product descriptions and pricing</li>
              <li>• Maintain product quality and safety standards</li>
              <li>• Comply with all local, state, and federal regulations</li>
              <li>• Honor all sales commitments made through the platform</li>
              <li>• Provide proper documentation and certifications when required</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Payment and Transactions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              All transactions are subject to our payment processing terms. We reserve the right to refuse or cancel
              orders at our discretion. Prices are subject to change without notice.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              For agricultural products, delivery terms and conditions may vary based on product type, seasonality, and
              location.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Prohibited Uses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              You may not use our platform for any unlawful purpose or to solicit others to perform unlawful acts. This
              includes but is not limited to:
            </p>
            <ul className="space-y-2 text-muted-foreground ml-4">
              <li>• Selling prohibited or regulated substances without proper authorization</li>
              <li>• Misrepresenting product quality, origin, or certifications</li>
              <li>• Engaging in fraudulent activities</li>
              <li>• Violating any applicable laws or regulations</li>
              <li>• Interfering with or disrupting the platform's operation</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Disclaimer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              The materials on our platform are provided on an 'as is' basis. We make no warranties, expressed or
              implied, and hereby disclaim all other warranties including, without limitation, implied warranties of
              merchantability, fitness for a particular purpose, or non-infringement of intellectual property.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Limitations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              In no event shall our company or its suppliers be liable for any damages (including, without limitation,
              damages for loss of data or profit, or due to business interruption) arising out of the use or inability
              to use our platform, even if we have been notified of the possibility of such damage.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Modifications</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              We may revise these terms of service at any time without notice. By using this platform, you are agreeing
              to be bound by the then current version of these terms of service.
            </p>
          </CardContent>
        </Card>

        <Separator className="my-8" />

        <div className="text-center">
          <Link href="/privacy-policy" className="text-primary hover:underline mr-6">
            Privacy Policy
          </Link>
          <Link href="/login" className="text-primary hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
