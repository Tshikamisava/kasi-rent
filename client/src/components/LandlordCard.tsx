import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useState } from "react";

export const LandlordCard = () => {
  const { user, userType } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    if (!user) {
      // redirect to sign in with redirect param
      navigate('/signin?redirect=/dashboard/landlord');
      return;
    }

    if (userType === 'landlord') {
      navigate('/dashboard/landlord');
      return;
    }

    // Show modal offering upgrade or redirect
    setOpen(true);
  };

  const handleUpgrade = () => {
    setOpen(false);
    navigate('/get-started');
  };

  const handleGoToDashboard = () => {
    setOpen(false);
    navigate(`/dashboard/${userType}`);
  };

  return (
    <section className="py-12">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto bg-card rounded-2xl p-8 shadow-md border border-border flex items-center gap-6">
          <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white">
            <Building2 className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold">Are you a landlord?</h3>
            <p className="text-muted-foreground">List and manage properties, view applications, and connect with tenants on KasiRent.</p>
          </div>
          <div>
            <Button onClick={handleClick} size="lg">Go to Dashboard</Button>
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Landlord Access</DialogTitle>
            <DialogDescription>
              You are signed in as <strong className="capitalize">{userType}</strong>. To access the Landlord Dashboard you need a landlord account.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              You can upgrade your account by creating a landlord profile. This will allow you to list properties, view applications, and manage tenants.
            </p>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={handleGoToDashboard}>Go to my dashboard</Button>
            <Button onClick={handleUpgrade}>Upgrade to Landlord</Button>
            <DialogClose asChild>
              <Button variant="outline" className="ml-2">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};