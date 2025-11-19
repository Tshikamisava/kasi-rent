import { Facebook, Instagram, Twitter, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const socialLinks = [
  { icon: Facebook, label: "Facebook", url: "https://facebook.com/kasirent", color: "hover:text-[#1877F2]" },
  { icon: Instagram, label: "Instagram", url: "https://instagram.com/kasirent", color: "hover:text-[#E4405F]" },
  { icon: Twitter, label: "Twitter", url: "https://twitter.com/kasirent", color: "hover:text-[#1DA1F2]" },
  { icon: Linkedin, label: "LinkedIn", url: "https://linkedin.com/company/kasirent", color: "hover:text-[#0A66C2]" },
];

const contactInfo = [
  { icon: Mail, label: "Email", value: "hello@kasirent.com", href: "mailto:hello@kasirent.com" },
  { icon: Phone, label: "Phone", value: "+27 123 456 789", href: "tel:+27123456789" },
  { icon: MapPin, label: "Location", value: "Johannesburg, South Africa", href: "#" },
];

export const ConnectWithUs = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Connect With Us</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Stay updated and reach out through your preferred channel
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Social Media */}
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-center mb-8">Follow Us</h3>
            <div className="flex justify-center gap-6 flex-wrap">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group flex flex-col items-center gap-3 p-6 rounded-2xl border border-border hover:border-primary/50 transition-all hover:shadow-lg ${social.color}`}
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <social.icon className="w-8 h-8 text-white" />
                  </div>
                  <span className="font-medium">{social.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 rounded-3xl p-8 md:p-12">
            <h3 className="text-2xl font-semibold text-center mb-8">Get In Touch</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {contactInfo.map((contact, index) => (
                <a
                  key={index}
                  href={contact.href}
                  className="flex flex-col items-center text-center p-6 rounded-2xl bg-background/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-all hover:shadow-md"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4">
                    <contact.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{contact.label}</p>
                  <p className="font-medium">{contact.value}</p>
                </a>
              ))}
            </div>

            {/* Newsletter Signup */}
            <div className="mt-12 text-center">
              <h4 className="text-xl font-semibold mb-4">Subscribe to Our Newsletter</h4>
              <p className="text-muted-foreground mb-6">Get the latest updates on properties and platform features</p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button size="lg" className="whitespace-nowrap">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};