import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      
      <div className="container mx-auto px-6 pt-24 pb-12">
        <Link to="/get-started">
          <Button variant="ghost" className="mb-6 hover:bg-white/50">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Registration
          </Button>
        </Link>
        
        <Card className="max-w-4xl mx-auto shadow-xl">
          <CardHeader className="text-center pb-8 border-b">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Privacy Policy
            </CardTitle>
            <p className="text-gray-500 mt-2">Last updated: January 11, 2026</p>
          </CardHeader>
          
          <CardContent className="prose prose-lg max-w-none p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                At KasiRent, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, 
                and safeguard your information when you use our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">2. Information We Collect</h2>
              <div className="space-y-3">
                <p className="text-gray-700 leading-relaxed">
                  <strong className="text-gray-900">2.1 Personal Information:</strong> When you register, we collect your name, 
                  email address, phone number, and role (tenant or landlord).
                </p>
                <p className="text-gray-700 leading-relaxed">
                  <strong className="text-gray-900">2.2 Property Information:</strong> Landlords provide property details including 
                  addresses, descriptions, pricing, and images.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  <strong className="text-gray-900">2.3 Usage Data:</strong> We collect information about how you interact with our 
                  platform, including IP addresses, browser types, and page views.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  <strong className="text-gray-900">2.4 Communications:</strong> Messages sent through our chat system and booking 
                  inquiries are stored to facilitate transactions.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">3. How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>To provide and maintain our services</li>
                <li>To facilitate connections between landlords and tenants</li>
                <li>To process payments and bookings</li>
                <li>To send notifications about your account and transactions</li>
                <li>To improve our platform and user experience</li>
                <li>To detect and prevent fraud or abuse</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">4. Information Sharing</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                We do not sell your personal information. We may share your information in the following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong className="text-gray-900">Between Users:</strong> Contact information is shared when bookings are made</li>
                <li><strong className="text-gray-900">Service Providers:</strong> With third-party providers who assist in platform operations</li>
                <li><strong className="text-gray-900">Payment Processors:</strong> Payment information is shared with secure payment gateways</li>
                <li><strong className="text-gray-900">Legal Requirements:</strong> When required by law or to protect our rights</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">5. Data Security</h2>
              <p className="text-gray-700 leading-relaxed">
                We implement industry-standard security measures to protect your information, including encryption, 
                secure servers, and regular security audits. However, no method of transmission over the internet is 
                100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">6. Cookies and Tracking</h2>
              <p className="text-gray-700 leading-relaxed">
                We use cookies and similar tracking technologies to enhance your experience on our platform. You can 
                control cookie settings through your browser, but disabling cookies may limit functionality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">7. Your Rights</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong className="text-gray-900">Access:</strong> Request a copy of your personal data</li>
                <li><strong className="text-gray-900">Correction:</strong> Update or correct inaccurate information</li>
                <li><strong className="text-gray-900">Deletion:</strong> Request deletion of your account and data</li>
                <li><strong className="text-gray-900">Opt-out:</strong> Unsubscribe from marketing communications</li>
                <li><strong className="text-gray-900">Portability:</strong> Request your data in a portable format</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">8. Data Retention</h2>
              <p className="text-gray-700 leading-relaxed">
                We retain your information for as long as your account is active or as needed to provide services. 
                We may retain certain information after account closure for legal, tax, or regulatory purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">9. Children's Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                Our platform is not intended for users under 18 years of age. We do not knowingly collect information 
                from children. If you believe we have collected information from a minor, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">10. International Users</h2>
              <p className="text-gray-700 leading-relaxed">
                If you access our platform from outside South Africa, your information may be transferred to and 
                processed in South Africa, which may have different data protection laws than your jurisdiction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">11. Changes to Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy periodically. We will notify you of significant changes through 
                email or platform notifications. Your continued use after changes indicates acceptance.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">12. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed">
                For questions about this Privacy Policy or to exercise your privacy rights, contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mt-3">
                <p className="text-gray-700">Email: privacy@kasirent.com</p>
                <p className="text-gray-700">Phone: +27 11 123 4567</p>
                <p className="text-gray-700">Address: KasiRent, Johannesburg, South Africa</p>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
