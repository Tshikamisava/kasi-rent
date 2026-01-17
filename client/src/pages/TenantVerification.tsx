import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Shield, CheckCircle, XCircle, Clock, Upload, ArrowRight, ArrowLeft } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

interface VerificationStatus {
  id: string;
  status: 'pending' | 'verified' | 'rejected';
  id_verified: boolean;
  employment_verified: boolean;
  financial_verified: boolean;
  references_verified: boolean;
  rejection_reason: string;
  created_at: string;
}

export default function TenantVerification() {
  const [currentStep, setCurrentStep] = useState(1);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Form data
  const [formData, setFormData] = useState({
    // Personal
    id_number: '',
    id_document: null as File | null,
    
    // Employment
    employment_status: '',
    employer_name: '',
    employment_letter: null as File | null,
    monthly_income: '',
    
    // Financial
    bank_statement: null as File | null,
    credit_score: '',
    credit_report: null as File | null,
    
    // References
    previous_landlord_name: '',
    previous_landlord_phone: '',
    previous_landlord_email: '',
    reference_letter: null as File | null,
  });

  useEffect(() => {
    checkVerificationStatus();
  }, []);

  const checkVerificationStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/verification/status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setVerificationStatus(data.verification);
      }
    } catch (error) {
      // No verification yet, that's fine
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (field: string, file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const submitData = new FormData();
      
      // Add all form fields
      submitData.append('id_number', formData.id_number);
      if (formData.id_document) submitData.append('id_document', formData.id_document);
      
      submitData.append('employment_status', formData.employment_status);
      submitData.append('employer_name', formData.employer_name);
      if (formData.employment_letter) submitData.append('employment_letter', formData.employment_letter);
      submitData.append('monthly_income', formData.monthly_income);
      
      if (formData.bank_statement) submitData.append('bank_statement', formData.bank_statement);
      if (formData.credit_score) submitData.append('credit_score', formData.credit_score);
      if (formData.credit_report) submitData.append('credit_report', formData.credit_report);
      
      submitData.append('previous_landlord_name', formData.previous_landlord_name);
      submitData.append('previous_landlord_phone', formData.previous_landlord_phone);
      submitData.append('previous_landlord_email', formData.previous_landlord_email);
      if (formData.reference_letter) submitData.append('reference_letter', formData.reference_letter);

      const response = await fetch(`${API_BASE}/api/verification/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });

      if (!response.ok) {
        throw new Error('Failed to submit verification');
      }

      toast({
        title: "Success",
        description: "Verification submitted successfully! You'll be notified once reviewed."
      });

      checkVerificationStatus();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit verification",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending Review</Badge>;
      case 'verified':
        return <Badge variant="outline" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If already verified
  if (verificationStatus?.status === 'verified') {
    return (
      <div className="container mx-auto py-12 px-4 max-w-2xl">
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-6 h-6" />
                Verification Complete
              </CardTitle>
              {getStatusBadge('verified')}
            </div>
          </CardHeader>
          <CardContent className="text-green-700">
            <p className="mb-4">Your tenant verification has been approved! You now have verified tenant status.</p>
            <div className="bg-white rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>{verificationStatus.id_verified ? 'ID Verified' : 'ID Pending'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>{verificationStatus.employment_verified ? 'Employment Verified' : 'Employment Pending'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>{verificationStatus.financial_verified ? 'Financial Verified' : 'Financial Pending'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>{verificationStatus.references_verified ? 'References Verified' : 'References Pending'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If rejected
  if (verificationStatus?.status === 'rejected') {
    return (
      <div className="container mx-auto py-12 px-4 max-w-2xl">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-red-800">
                <XCircle className="w-6 h-6" />
                Verification Rejected
              </CardTitle>
              {getStatusBadge('rejected')}
            </div>
          </CardHeader>
          <CardContent className="text-red-700">
            <p className="mb-4">Unfortunately, your verification was rejected. Please review the reason below and resubmit with corrected information.</p>
            {verificationStatus.rejection_reason && (
              <div className="bg-white rounded-lg p-4 mb-4">
                <h4 className="font-semibold mb-2">Rejection Reason:</h4>
                <p className="text-gray-700">{verificationStatus.rejection_reason}</p>
              </div>
            )}
            <Button onClick={() => setVerificationStatus(null)}>
              Resubmit Verification
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If pending
  if (verificationStatus?.status === 'pending') {
    return (
      <div className="container mx-auto py-12 px-4 max-w-2xl">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-yellow-800">
                <Clock className="w-6 h-6" />
                Verification Pending
              </CardTitle>
              {getStatusBadge('pending')}
            </div>
          </CardHeader>
          <CardContent className="text-yellow-700">
            <p className="mb-4">Your verification is currently under review. You'll be notified once the admin has reviewed your documents.</p>
            <p className="text-sm">Submitted on: {new Date(verificationStatus.created_at).toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Verification form
  return (
    <div className="container mx-auto py-12 px-4 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
          <Shield className="w-8 h-8 text-primary" />
          Tenant Verification
        </h1>
        <p className="text-gray-600">Complete your verification to become a verified tenant</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center flex-1">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              currentStep >= step ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {step}
            </div>
            {step < 4 && (
              <div className={`flex-1 h-1 mx-2 ${
                currentStep > step ? 'bg-primary' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      <Card>
          <CardHeader>
          <CardTitle>
            {currentStep === 1 && 'Personal Information'}
            {currentStep === 2 && 'Employment Details'}
            {currentStep === 3 && 'Financial Information'}
            {currentStep === 4 && 'References'}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 && 'Upload your identification document'}
            {currentStep === 2 && 'Provide employment details (employment letter optional)'}
            {currentStep === 3 && 'Share your financial documents'}
            {currentStep === 4 && 'Add landlord references'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Step 1: Personal */}
          {currentStep === 1 && (
            <>
              <div>
                <Label htmlFor="id_number">ID Number *</Label>
                <Input
                  id="id_number"
                  value={formData.id_number}
                  onChange={(e) => handleInputChange('id_number', e.target.value)}
                  placeholder="Enter your ID number"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="id_document">ID Document (PDF, Image) *</Label>
                <Input
                  id="id_document"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange('id_document', e.target.files?.[0] || null)}
                  required
                />
                {formData.id_document && (
                  <p className="text-sm text-green-600 mt-1">
                    <CheckCircle className="w-4 h-4 inline mr-1" />
                    {formData.id_document.name}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Step 2: Employment */}
          {currentStep === 2 && (
            <>
              <div>
                <Label htmlFor="employment_status">Employment Status *</Label>
                <Select
                  value={formData.employment_status}
                  onValueChange={(value) => handleInputChange('employment_status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employed">Employed</SelectItem>
                    <SelectItem value="self-employed">Self Employed</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="unemployed">Unemployed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="employer_name">Employer Name</Label>
                <Input
                  id="employer_name"
                  value={formData.employer_name}
                  onChange={(e) => handleInputChange('employer_name', e.target.value)}
                  placeholder="Company name"
                />
              </div>

              <div>
                <Label htmlFor="monthly_income">Monthly Income (R) *</Label>
                <Input
                  id="monthly_income"
                  type="number"
                  value={formData.monthly_income}
                  onChange={(e) => handleInputChange('monthly_income', e.target.value)}
                  placeholder="0"
                  required
                />
              </div>

              <div>
                <Label htmlFor="employment_letter">Employment Letter / Payslip <span className="text-sm text-gray-500">(optional)</span></Label>
                <Input
                  id="employment_letter"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileChange('employment_letter', e.target.files?.[0] || null)}
                />
                <p className="text-xs text-gray-500 mt-1">Optional — upload a payslip or employment letter to speed up verification.</p>
                {formData.employment_letter && (
                  <p className="text-sm text-green-600 mt-1">
                    <CheckCircle className="w-4 h-4 inline mr-1" />
                    {formData.employment_letter.name} — {(formData.employment_letter.size / 1024).toFixed(0)} KB
                  </p>
                )}
              </div>
            </>
          )}

          {/* Step 3: Financial */}
          {currentStep === 3 && (
            <>
              <div>
                <Label htmlFor="bank_statement">Bank Statement (PDF)</Label>
                <Input
                  id="bank_statement"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileChange('bank_statement', e.target.files?.[0] || null)}
                />
                {formData.bank_statement && (
                  <p className="text-sm text-green-600 mt-1">
                    <CheckCircle className="w-4 h-4 inline mr-1" />
                    {formData.bank_statement.name}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="credit_score">Credit Score (Optional)</Label>
                <Input
                  id="credit_score"
                  type="number"
                  value={formData.credit_score}
                  onChange={(e) => handleInputChange('credit_score', e.target.value)}
                  placeholder="300-850"
                />
              </div>

              <div>
                <Label htmlFor="credit_report">Credit Report (PDF)</Label>
                <Input
                  id="credit_report"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileChange('credit_report', e.target.files?.[0] || null)}
                />
                {formData.credit_report && (
                  <p className="text-sm text-green-600 mt-1">
                    <CheckCircle className="w-4 h-4 inline mr-1" />
                    {formData.credit_report.name}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Step 4: References */}
          {currentStep === 4 && (
            <>
              <div>
                <Label htmlFor="previous_landlord_name">Previous Landlord Name</Label>
                <Input
                  id="previous_landlord_name"
                  value={formData.previous_landlord_name}
                  onChange={(e) => handleInputChange('previous_landlord_name', e.target.value)}
                  placeholder="Full name"
                />
              </div>

              <div>
                <Label htmlFor="previous_landlord_phone">Previous Landlord Phone</Label>
                <Input
                  id="previous_landlord_phone"
                  value={formData.previous_landlord_phone}
                  onChange={(e) => handleInputChange('previous_landlord_phone', e.target.value)}
                  placeholder="+27 XX XXX XXXX"
                />
              </div>

              <div>
                <Label htmlFor="previous_landlord_email">Previous Landlord Email</Label>
                <Input
                  id="previous_landlord_email"
                  type="email"
                  value={formData.previous_landlord_email}
                  onChange={(e) => handleInputChange('previous_landlord_email', e.target.value)}
                  placeholder="landlord@example.com"
                />
              </div>

              <div>
                <Label htmlFor="reference_letter">Reference Letter (PDF)</Label>
                <Input
                  id="reference_letter"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileChange('reference_letter', e.target.files?.[0] || null)}
                />
                {formData.reference_letter && (
                  <p className="text-sm text-green-600 mt-1">
                    <CheckCircle className="w-4 h-4 inline mr-1" />
                    {formData.reference_letter.name}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {currentStep < 4 ? (
              <Button onClick={() => setCurrentStep(prev => Math.min(4, prev + 1))}>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading}>
                <Upload className="w-4 h-4 mr-2" />
                Submit Verification
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Your Information is Secure
        </h3>
        <p className="text-sm text-blue-700">
          All documents are encrypted and stored securely. Only authorized administrators can access your verification documents. Your information will never be shared with third parties without your consent.
        </p>
      </div>
    </div>
  );
}
