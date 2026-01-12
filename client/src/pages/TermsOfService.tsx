import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const TermsOfService = () => {
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
              <FileText className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Terms of Service
            </CardTitle>
            <p className="text-gray-500 mt-2">Last updated: January 11, 2026</p>
          </CardHeader>
          
          <CardContent className="prose prose-lg max-w-none p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using KasiRent ("the Platform"), you accept and agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">2. Description of Service</h2>
              <p className="text-gray-700 leading-relaxed">
                KasiRent is an online platform connecting property landlords with potential tenants. We provide a marketplace 
                for property listings, messaging, booking, and payment processing services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">3. User Accounts</h2>
              <div className="space-y-3">
                <p className="text-gray-700 leading-relaxed">
                  <strong className="text-gray-900">3.1 Registration:</strong> You must register and create an account to access certain features. 
                  You agree to provide accurate, current, and complete information.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  <strong className="text-gray-900">3.2 Account Security:</strong> You are responsible for maintaining the confidentiality of your 
                  account credentials and for all activities under your account.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  <strong className="text-gray-900">3.3 Account Types:</strong> Users can register as either tenants or landlords, with different 
                  rights and responsibilities for each role.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">4. Landlord Responsibilities</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Provide accurate and truthful information about properties</li>
                <li>Maintain properties in habitable condition</li>
                <li>Respond to tenant inquiries in a timely manner</li>
                <li>Honor bookings and rental agreements made through the platform</li>
                <li>Comply with all local housing laws and regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">5. Tenant Responsibilities</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Provide accurate personal and contact information</li>
                <li>Make timely rental payments as agreed</li>
                <li>Respect property and follow rental agreements</li>
                <li>Report damages or issues promptly</li>
                <li>Vacate property on time at the end of rental period</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">6. Payments and Fees</h2>
              <p className="text-gray-700 leading-relaxed">
                All payments are processed securely through our payment gateway. Service fees may apply to transactions. 
                Refund policies vary by listing and circumstances. We reserve the right to modify our fee structure with notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">7. Prohibited Activities</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Posting false, misleading, or fraudulent listings</li>
                <li>Harassment or discrimination of any kind</li>
                <li>Attempting to circumvent payment through the platform</li>
                <li>Violating any local, state, or national laws</li>
                <li>Using the platform for unauthorized commercial purposes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">8. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed">
                KasiRent acts as a platform connecting landlords and tenants. We are not responsible for the actual 
                rental transactions, property conditions, or disputes between parties. Use of our service is at your own risk.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">9. Termination</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to suspend or terminate accounts that violate these terms or engage in harmful activities. 
                You may also terminate your account at any time by contacting support.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">10. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update these Terms of Service from time to time. Continued use of the platform after changes 
                constitutes acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">11. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed">
                For questions about these Terms of Service, please contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mt-3">
                <p className="text-gray-700">Email: support@kasirent.com</p>
                <p className="text-gray-700">Phone: +27 11 123 4567</p>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default TermsOfService;
