import { Card, CardContent } from "@/components/ui/card";
import { Linkedin, Mail } from "lucide-react";

const teamMembers = [
  {
    name: "Tshikamisava Mmbengwa",
    role: "Co-Founder & CEO",
    bio: "Passionate about transforming township rentals and empowering communities",
    image: "https://media.licdn.com/dms/image/v2/D4D03AQHqvKv8LlLgRA/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1733946685456?e=1742428800&v=beta&t=LdQtU5gNM2VPXCqAYZz7ixZPaSnRYr8i7u-dLdC5iig",
    linkedin: "https://www.linkedin.com/in/tshikamisava-mmbengwa-394b11260/",
    email: "tshika@kasirent.com",
  },
  {
    name: "Team Member 2",
    role: "Co-Founder & CTO",
    bio: "Building technology that bridges the gap in the rental market",
    image: "/placeholder.svg",
    linkedin: "#",
    email: "team2@kasirent.com",
  },
  {
    name: "Team Member 3",
    role: "Head of Operations",
    bio: "Ensuring smooth operations and excellent customer experience",
    image: "/placeholder.svg",
    linkedin: "#",
    email: "team3@kasirent.com",
  },
];

export const OurTeam = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Our Team</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Meet the passionate individuals working to revolutionize township rentals
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {teamMembers.map((member, index) => (
            <Card key={index} className="overflow-hidden border-border hover:border-primary/50 transition-all hover:shadow-lg">
              <div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center overflow-hidden">
                {member.image && !member.image.includes('placeholder') ? (
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = `<div class="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-4xl font-bold">${member.name.charAt(0)}</div>`;
                    }}
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-4xl font-bold">
                    {member.name.charAt(0)}
                  </div>
                )}
              </div>
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                <p className="text-sm text-primary font-medium mb-3">{member.role}</p>
                <p className="text-sm text-muted-foreground mb-4">{member.bio}</p>
                <div className="flex justify-center gap-3">
                  <a
                    href={member.linkedin}
                    className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary hover:text-white flex items-center justify-center transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a
                    href={`mailto:${member.email}`}
                    className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary hover:text-white flex items-center justify-center transition-colors"
                    aria-label="Email"
                  >
                    <Mail className="w-5 h-5" />
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};