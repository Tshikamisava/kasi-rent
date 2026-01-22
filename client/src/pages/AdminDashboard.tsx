import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Shield, FileText, CheckCircle, XCircle, Eye } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

interface TenantVerification {
  id: string;
  tenant: {
    id: string;
    name: string;
    email: string;
  };
  status: 'pending' | 'verified' | 'rejected';
  id_number: string;
  id_document_url: string;
  id_verified: boolean;
  employment_status: string;
  employer_name: string;
  employment_letter_url: string;
  monthly_income: number;
  employment_verified: boolean;
  bank_statement_url: string;
  credit_score: number;
  credit_report_url: string;
  financial_verified: boolean;
  previous_landlord_name: string;
  previous_landlord_phone: string;
  previous_landlord_email: string;
  reference_letter_url: string;
  references_verified: boolean;
  reviewed_at: string;
  rejection_reason: string;
  admin_notes: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [verifications, setVerifications] = useState<TenantVerification[]>([]);
  const [selectedVerification, setSelectedVerification] = useState<TenantVerification | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('pending');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Helper to render a status badge for verification items
  function getStatusBadge(status: TenantVerification['status'] | string | undefined) {
    if (!status) return <Badge>Unknown</Badge>;
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'verified':
        return <Badge variant="default"><CheckCircle className="w-4 h-4 mr-1 inline" /> Verified</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-4 h-4 mr-1 inline" /> Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  }

  // Admin role change form
  const [roleEmail, setRoleEmail] = useState('');
  const [roleValue, setRoleValue] = useState<'user' | 'tenant' | 'landlord' | 'admin'>('user');

  // Review form state
  const [reviewData, setReviewData] = useState({
    id_verified: false,
    employment_verified: false,
    financial_verified: false,
    references_verified: false,
    rejection_reason: '',
    admin_notes: ''
  });

  useEffect(() => {
    fetchVerifications();
  }, [filter]);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const token = user?.token || localStorage.getItem('token');
      console.log('API_BASE:', API_BASE);
      const url = filter === 'pending' 
        ? `${API_BASE}/api/verification/admin/pending`
        : `${API_BASE}/api/verification/admin/all?status=${filter === 'all' ? '' : filter}`;
      console.log('Fetching verifications ->', url, 'token present?', !!token);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const text = await response.text().catch(() => null);
        throw new Error(text || `Failed to fetch verifications (${response.status})`);
      }

      const data = await response.json();
      setVerifications(data.verifications || []);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load verifications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const viewVerification = async (id: string) => {
    try {
      const token = user?.token || localStorage.getItem('token');
      console.log('View verification id', id, 'API_BASE', API_BASE, 'token present?', !!token);
      const response = await fetch(`${API_BASE}/api/verification/admin/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const text = await response.text().catch(() => null);
        throw new Error(text || `Failed to fetch verification details (${response.status})`);
      }

      const data = await response.json();
      setSelectedVerification(data.verification);
      
      // Set initial review data from current verification
      setReviewData({
        id_verified: data.verification.id_verified,
        employment_verified: data.verification.employment_verified,
        financial_verified: data.verification.financial_verified,
        references_verified: data.verification.references_verified,
        rejection_reason: data.verification.rejection_reason || '',
        admin_notes: data.verification.admin_notes || ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load verification",
        variant: "destructive"
      });
    }
  };

  const approveVerification = async () => {
    if (!selectedVerification) return;

    try {
      const token = user?.token || localStorage.getItem('token');
      console.log('Approving verification', selectedVerification.id, 'token present?', !!token);
      const response = await fetch(`${API_BASE}/api/verification/admin/${selectedVerification.id}/review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'verified',
          ...reviewData
        })
      });

      if (!response.ok) {
        const text = await response.text().catch(() => null);
        throw new Error(text || `Failed to approve verification (${response.status})`);
      }

      toast({
        title: "Success",
        description: "Verification approved successfully"
      });

      setSelectedVerification(null);
      fetchVerifications();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to approve verification",
        variant: "destructive"
      });
    }
  };

  const rejectVerification = async () => {
    if (!selectedVerification || !reviewData.rejection_reason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a rejection reason",
        variant: "destructive"
      });
      return;
    }
    try {
      const token = user?.token || localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/verification/admin/${selectedVerification.id}/review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'rejected',
          rejection_reason: reviewData.rejection_reason,
          admin_notes: reviewData.admin_notes
        })
      });

      if (!response.ok) {
        const text = await response.text().catch(() => null);
        throw new Error(text || `Failed to reject verification (${response.status})`);
      }

      toast({
        title: "Success",
        description: "Verification rejected"
      });

      setSelectedVerification(null);
      fetchVerifications();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reject verification",
        variant: "destructive"
      });
    }
  };

  const changeUserRole = async () => {
    if (!roleEmail.trim()) {
      toast({ title: 'Error', description: 'Please provide an email', variant: 'destructive' });
      return;
    }

    try {
      const token = user?.token || localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/admin/user/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: roleEmail.trim(), role: roleValue })
      });

      if (!response.ok) {
        const text = await response.text().catch(() => null);
        throw new Error(text || `Failed to update role (${response.status})`);
      }

      toast({ title: 'Success', description: 'User role updated' });
      setRoleEmail('');
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to update role', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading verifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary" />
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Manage tenant verification requests</p>
        </div>
      </div>

      {/* Admin Role Change */}
      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Change User Role</CardTitle>
            <CardDescription>Update a user's role by email (admin only)</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 md:flex-row md:items-end">
            <div className="flex-1">
              <Input
                placeholder="user@example.com"
                value={roleEmail}
                onChange={(e) => setRoleEmail(e.target.value)}
              />
            </div>

            <div className="w-48">
              <Select onValueChange={(val) => setRoleValue(val as any)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="tenant">Tenant</SelectItem>
                  <SelectItem value="landlord">Landlord</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Button onClick={changeUserRole}>Update Role</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        <Button 
          variant={filter === 'pending' ? 'default' : 'outline'}
          onClick={() => setFilter('pending')}
        >
          Pending ({verifications.filter(v => v.status === 'pending').length})
        </Button>
        <Button 
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          All
        </Button>
        <Button 
          variant={filter === 'verified' ? 'default' : 'outline'}
          onClick={() => setFilter('verified')}
        >
          Verified
        </Button>
        <Button 
          variant={filter === 'rejected' ? 'default' : 'outline'}
          onClick={() => setFilter('rejected')}
        >
          Rejected
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verifications List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Verification Requests</h2>
          
          {verifications.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                No verifications found
              </CardContent>
            </Card>
          ) : (
            verifications.map((verification) => (
              <Card 
                key={verification.id} 
                className={`cursor-pointer hover:shadow-lg transition-shadow ${
                  selectedVerification?.id === verification.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => viewVerification(verification.id)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{verification.tenant.name}</CardTitle>
                      <CardDescription>{verification.tenant.email}</CardDescription>
                    </div>
                    {getStatusBadge(verification.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Submitted: {new Date(verification.created_at).toLocaleDateString()}</span>
                    <Button size="sm" variant="ghost">
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Verification Details */}
        <div>
          {selectedVerification ? (
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Verification Details</span>
                  {getStatusBadge(selectedVerification.status)}
                </CardTitle>
                <CardDescription>Review and approve/reject verification</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Tenant Info */}
                <div>
                  <h3 className="font-semibold mb-2">Tenant Information</h3>
                  <p className="text-sm"><strong>Name:</strong> {selectedVerification.tenant.name}</p>
                  <p className="text-sm"><strong>Email:</strong> {selectedVerification.tenant.email}</p>
                </div>

                {/* ID Verification */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">ID Document</h3>
                    <Checkbox 
                      checked={reviewData.id_verified}
                      onCheckedChange={(checked) => setReviewData({...reviewData, id_verified: checked as boolean})}
                      disabled={selectedVerification.status !== 'pending'}
                    />
                  </div>
                  <p className="text-sm text-gray-600">ID Number: {selectedVerification.id_number}</p>
                  {selectedVerification.id_document_url && (
                    <a 
                      href={`${API_BASE}${selectedVerification.id_document_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary text-sm hover:underline flex items-center mt-1"
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      View ID Document
                    </a>
                  )}
                </div>

                {/* Employment Verification */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Employment</h3>
                    <Checkbox 
                      checked={reviewData.employment_verified}
                      onCheckedChange={(checked) => setReviewData({...reviewData, employment_verified: checked as boolean})}
                      disabled={selectedVerification.status !== 'pending'}
                    />
                  </div>
                  <p className="text-sm text-gray-600">Status: {selectedVerification.employment_status}</p>
                  <p className="text-sm text-gray-600">Employer: {selectedVerification.employer_name}</p>
                  <p className="text-sm text-gray-600">Income: R{selectedVerification.monthly_income?.toLocaleString()}</p>
                  {selectedVerification.employment_letter_url && (
                    <a 
                      href={`${API_BASE}${selectedVerification.employment_letter_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary text-sm hover:underline flex items-center mt-1"
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      View Employment Letter
                    </a>
                  )}
                </div>

                {/* Financial Verification */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Financial Information</h3>
                    <Checkbox 
                      checked={reviewData.financial_verified}
                      onCheckedChange={(checked) => setReviewData({...reviewData, financial_verified: checked as boolean})}
                      disabled={selectedVerification.status !== 'pending'}
                    />
                  </div>
                  {selectedVerification.credit_score && (
                    <p className="text-sm text-gray-600">Credit Score: {selectedVerification.credit_score}</p>
                  )}
                  <div className="flex flex-col gap-1 mt-1">
                    {selectedVerification.bank_statement_url && (
                      <a 
                        href={`${API_BASE}${selectedVerification.bank_statement_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary text-sm hover:underline flex items-center"
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        View Bank Statement
                      </a>
                    )}
                    {selectedVerification.credit_report_url && (
                      <a 
                        href={`${API_BASE}${selectedVerification.credit_report_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary text-sm hover:underline flex items-center"
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        View Credit Report
                      </a>
                    )}
                  </div>
                </div>

                {/* References Verification */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">References</h3>
                    <Checkbox 
                      checked={reviewData.references_verified}
                      onCheckedChange={(checked) => setReviewData({...reviewData, references_verified: checked as boolean})}
                      disabled={selectedVerification.status !== 'pending'}
                    />
                  </div>
                  {selectedVerification.previous_landlord_name && (
                    <>
                      <p className="text-sm text-gray-600">Landlord: {selectedVerification.previous_landlord_name}</p>
                      <p className="text-sm text-gray-600">Phone: {selectedVerification.previous_landlord_phone}</p>
                      <p className="text-sm text-gray-600">Email: {selectedVerification.previous_landlord_email}</p>
                    </>
                  )}
                  {selectedVerification.reference_letter_url && (
                    <a 
                      href={`${API_BASE}${selectedVerification.reference_letter_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary text-sm hover:underline flex items-center mt-1"
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      View Reference Letter
                    </a>
                  )}
                </div>

                {/* Admin Notes */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Admin Notes</h3>
                  <Textarea
                    placeholder="Add internal notes about this verification..."
                    value={reviewData.admin_notes}
                    onChange={(e) => setReviewData({...reviewData, admin_notes: e.target.value})}
                    disabled={selectedVerification.status !== 'pending'}
                    rows={3}
                  />
                </div>

                {/* Rejection Reason */}
                {(selectedVerification.status === 'pending' || selectedVerification.rejection_reason) && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2">Rejection Reason</h3>
                    <Textarea
                      placeholder="Provide reason for rejection (visible to tenant)..."
                      value={reviewData.rejection_reason}
                      onChange={(e) => setReviewData({...reviewData, rejection_reason: e.target.value})}
                      disabled={selectedVerification.status !== 'pending'}
                      rows={3}
                    />
                  </div>
                )}

                {/* Action Buttons */}
                {selectedVerification.status === 'pending' && (
                  <div className="flex gap-2 pt-4 border-t">
                    <Button 
                      onClick={approveVerification}
                      className="flex-1"
                      disabled={!(reviewData.id_verified && reviewData.employment_verified && reviewData.financial_verified && reviewData.references_verified)}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button 
                      onClick={rejectVerification}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}

                {selectedVerification.status !== 'pending' && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600">
                      {selectedVerification.status === 'verified' ? 'Approved' : 'Rejected'} on {new Date(selectedVerification.reviewed_at).toLocaleString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                Select a verification to review
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
