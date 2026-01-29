import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SaveMoney() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Save Money — No Agent Fees</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-gray-700">Connect directly with landlords through our platform to avoid agent fees and keep more money in your pocket. It's faster, clearer, and more cost-effective.</p>

          <ul className="list-disc pl-5 space-y-2 mb-6 text-sm text-gray-600">
            <li>Contact landlords directly from listing pages.</li>
            <li>Negotiate terms without middlemen.</li>
            <li>Enjoy transparent pricing and quicker responses.</li>
          </ul>

          <div className="flex gap-3">
            <Button onClick={() => navigate('/properties')}>Browse Listings</Button>
            <Button variant="outline" onClick={() => navigate('/list-property')}>List a Property</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
