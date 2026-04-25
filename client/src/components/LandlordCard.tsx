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

    // Allow landlords or admins to access the landlord dashboard
    if (userType === 'landlord' || userType === 'admin') {
      navigate('/dashboard/landlord');
      return;
    }

    // Show modal offering upgrade or redirect / explain restriction
    setOpen(true);
  };

  const handleUpgrade = () => {
    setOpen(false);
    navigate('/get-started');
  };

  const handleGoToDashboard = () => {
    setOpen(false);
    // Non-admins don't have access to landlord dashboard; route them safely
    toast({ title: 'Access denied', description: 'You do not have admin access to the Landlord Dashboard.', variant: 'destructive' });
    navigate('/');
  };

  return (
    <section className="py-10 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto w-full bg-card rounded-2xl p-4 sm:p-6 md:p-8 shadow-md border border-border flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-6 overflow-hidden">
          <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shrink-0 mx-auto md:mx-0">
            <Building2 className="w-6 h-6 md:w-8 md:h-8" />
          </div>
          <div className="flex-1 min-w-0 text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-bold leading-tight">Are you a landlord?</h3>
            <p className="mt-2 text-sm sm:text-base leading-relaxed text-muted-foreground break-words">List and manage properties, view applications, and connect with tenants on KasiRent.</p>
          </div>
          <div className="w-full md:w-auto md:self-center">
            <Button onClick={handleClick} size="lg" className="w-full md:w-auto px-6">Go to Dashboard</Button>
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