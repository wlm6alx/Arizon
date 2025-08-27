import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4 text-balance">Privacy Policy</h1>
          <p className="text-muted-foreground text-lg">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Information We Collect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Personal Information</h3>
              <p className="text-muted-foreground leading-relaxed">
                We collect information you provide directly to us, such as when you create an account, make a purchase,
                or contact us. This may include your name, email address, phone number, shipping address, and payment
                information.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Agricultural Business Information</h3>
              <p className="text-muted-foreground leading-relaxed">
                For business users selling agricultural products, we may collect information about your farm, products,
                certifications, and business operations to facilitate transactions.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Usage Information</h3>
              <p className="text-muted-foreground leading-relaxed">
                We automatically collect certain information about your use of our platform, including your IP address,
                browser type, device information, and pages visited.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>How We Use Your Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                <span>To provide, maintain, and improve our agricultural marketplace services</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                <span>To process transactions and send related information</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                <span>To communicate with you about products, services, and promotional offers</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                <span>To verify the quality and authenticity of agricultural products</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                <span>To comply with legal obligations and protect our rights</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Information Sharing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              We do not sell, trade, or otherwise transfer your personal information to third parties without your
              consent, except in the following circumstances:
            </p>
            <ul className="space-y-2 text-muted-foreground ml-4">
              <li>• With service providers who assist in our operations</li>
              <li>• When required by law or to protect our rights</li>
              <li>• In connection with a business transfer or merger</li>
              <li>• With your explicit consent</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Data Security</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal information
              against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission
              over the internet is 100% secure.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Rights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">You have the right to:</p>
            <ul className="space-y-2 text-muted-foreground ml-4">
              <li>• Access and update your personal information</li>
              <li>• Request deletion of your data</li>
              <li>• Opt-out of marketing communications</li>
              <li>• Request data portability</li>
              <li>• Lodge a complaint with supervisory authorities</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at privacy@example.com or through
              our contact form.
            </p>
          </CardContent>
        </Card>

        <Separator className="my-8" />

        <div className="text-center">
          <Link href="/terms-of-service" className="text-primary hover:underline mr-6">
            Terms of Service
          </Link>
          <Link href="/login" className="text-primary hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
