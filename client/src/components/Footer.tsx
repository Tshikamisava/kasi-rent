import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import ExternalLinkConfirm from "@/components/ExternalLinkConfirm";
import { trackEvent } from "@/lib/analytics";

export const Footer = () => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmUrl, setConfirmUrl] = useState<string | undefined>(undefined);
  const [confirmLabel, setConfirmLabel] = useState<string | undefined>(undefined);

  const handleExternalClick = (url: string, label?: string) => (e?: React.MouseEvent) => {
    e?.preventDefault();
    setConfirmUrl(url);
    setConfirmLabel(label ?? url);
    setConfirmOpen(true);
  };

  const doOpenExternal = () => {
    if (!confirmUrl) return;
    trackEvent('external_link_click', { url: confirmUrl, label: confirmLabel });
    window.open(confirmUrl, '_blank', 'noopener');
    setConfirmOpen(false);
  };

  return (
    <>
      <footer className="bg-muted/50 border-t border-border py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <span className="text-white font-bold text-xl">K</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  KasiRent
                </span>
              </div>
              <p className="text-muted-foreground">
                South Africa's trusted digital rental platform for township communities
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/properties" className="hover:text-primary transition-colors">Browse Properties</Link></li>
                <li><Link to="/list-property" className="hover:text-primary transition-colors">List Property</Link></li>
                <li><Link to="/help" className="hover:text-primary transition-colors">Help Center</Link></li>
                <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/help" className="hover:text-primary transition-colors">Help Center</Link></li>
                <li><Link to="/safety" className="hover:text-primary transition-colors">Safety Tips</Link></li>
                <li><Link to="/terms-of-service" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link to="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <a href="mailto:info@kasirent.co.za" className="hover:text-primary transition-colors">info@kasirent.co.za</a>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <a href="tel:+27111234567" className="hover:text-primary transition-colors">+27 11 123 4567</a>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Johannesburg, SA</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground text-sm">
              © 2025 KasiRent. All rights reserved.
            </p>
            <div className="flex gap-4">
              <button onClick={handleExternalClick('https://www.facebook.com/kasirent', 'Facebook')} className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </button>
              <button onClick={handleExternalClick('https://twitter.com/kasirent', 'Twitter')} className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </button>
              <button onClick={handleExternalClick('https://instagram.com/kasirent', 'Instagram')} className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </footer>

      <ExternalLinkConfirm open={confirmOpen} url={confirmUrl} title={`Open ${confirmLabel}`} onClose={() => setConfirmOpen(false)} onConfirm={doOpenExternal} />
    </>
  );
};
