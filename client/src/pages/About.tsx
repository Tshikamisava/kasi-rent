import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Shield, Users, Heart, TrendingUp, Target, Award, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

const values = [
  {
    icon: Shield,
    title: "Trust & Safety",
    description: "We verify every property and landlord to ensure your safety and prevent scams in the rental process.",
  },
  {
    icon: Users,
    title: "Community First",
    description: "Built for South African townships, by people who understand the community's unique needs.",
  },
  {
    icon: Heart,
    title: "Transparency",
    description: "Clear pricing, honest reviews, and open communication between all parties.",
  },
  {
    icon: TrendingUp,
    title: "Growth & Opportunity",
    description: "Empowering landlords to grow their businesses while helping tenants find homes.",
  },
];

const teamMembers = [
  {
    name: "Tshikamisava Mzwandie",
    role: "Founder & CEO",
    description: "Visionary leader committed to transforming township rental experiences.",
    image: "/team/ceo.jpg",
    initials: "TM",
    color: "from-indigo-600 to-purple-600"
  },
  {
    name: "Development Team",
    role: "Technology",
    description: "Building secure and innovative solutions for our community.",
    image: "/team/dev-team.jpg",
    initials: "DT",
    color: "from-green-600 to-emerald-600"
  },
  {
    name: "Support Team",
    role: "Customer Success",
    description: "Dedicated to ensuring every user has a seamless experience.",
    image: "/team/support-team.jpg",
    initials: "ST",
    color: "from-orange-600 to-amber-600"
  },
];

const milestones = [
  {
    year: "2024",
    title: "Platform Launch",
    description: "KasiRent goes live, connecting tenants and landlords across South Africa.",
  },
  {
    year: "2025",
    title: "Rapid Growth",
    description: "Expanding to multiple townships and reaching thousands of users.",
  },
  {
    year: "Future",
    title: "Vision 2030",
    description: "Becoming the leading rental platform in all South African townships.",
  },
];

const ValueCard = ({ value, index }: { value: any; index: number }) => {
  const { ref, isVisible } = useScrollAnimation();
  
  return (
    <div
      ref={ref}
      className={`text-center transition-all ${
        isVisible ? 'animate-in fade-in slide-in-from-bottom-4' : 'opacity-0'
      }`}
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
    >
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4 hover:scale-110 transition-transform">
        <value.icon className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
      <p className="text-muted-foreground">{value.description}</p>
    </div>
  );
};

const About = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-12">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-block mb-6">
                <Target className="w-16 h-16 mx-auto text-primary" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                About KasiRent
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
                We're on a mission to transform township rental experiences across South Africa through technology, transparency, and trust.
              </p>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <Award className="w-10 h-10 text-primary" />
                <h2 className="text-3xl md:text-4xl font-bold">Our Story</h2>
              </div>
              <Card className="border-2 border-primary/20">
                <CardContent className="p-8">
                  <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                    <p className="first-letter:text-5xl first-letter:font-bold first-letter:text-primary first-letter:mr-2 first-letter:float-left">
                      KasiRent was born from a simple observation: finding rental properties in South African townships was unnecessarily difficult, risky, and often led to scams. We knew there had to be a better way.
                    </p>
                    <p>
                      Our founders, who grew up in township communities, understood firsthand the challenges tenants face - from unreliable listings to unsafe payment methods. They also saw how landlords struggled to find trustworthy tenants and manage their properties efficiently.
                    </p>
                    <p className="font-medium text-foreground">
                      Today, KasiRent connects thousands of tenants and landlords across South Africa, making the rental process transparent, secure, and accessible for everyone. We're proud to serve our communities and help people find not just houses, but homes.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              <Card className="border-2 border-secondary/20 hover:border-secondary transition-colors">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <Zap className="w-10 h-10 text-secondary" />
                    <h3 className="text-2xl font-bold">Our Mission</h3>
                  </div>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    To provide a safe, transparent, and efficient platform that connects tenants with quality rental properties while empowering landlords to manage their properties with confidence and ease.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-2 border-accent/20 hover:border-accent transition-colors">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <Target className="w-10 h-10 text-accent" />
                    <h3 className="text-2xl font-bold">Our Vision</h3>
                  </div>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    To become the leading digital rental platform in South African townships, trusted by millions for finding and managing rental properties with complete peace of mind.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Values</h2>
              <p className="text-xl text-muted-foreground">
                The principles that guide everything we do
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {values.map((value, index) => (
                <ValueCard key={index} value={value} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Journey</h2>
              <p className="text-xl text-muted-foreground">
                Building the future of township rentals
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-8">
              {milestones.map((milestone, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex gap-6 items-start">
                      <div className="flex-shrink-0">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg">
                          {milestone.year}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-2">{milestone.title}</h3>
                        <p className="text-lg text-muted-foreground">{milestone.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet Our Team</h2>
              <p className="text-xl text-muted-foreground">
                Passionate people building better rental experiences
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {teamMembers.map((member, index) => (
                <Card key={index} className="hover:shadow-xl transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden">
                      <img 
                        src={member.image} 
                        alt={member.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to gradient background with initials if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.classList.add('bg-gradient-to-br', ...member.color.split(' '), 'flex', 'items-center', 'justify-center');
                            parent.innerHTML = `<span class="text-white text-2xl font-bold">${member.initials}</span>`;
                          }
                        }}
                      />
                    </div>
                    <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                    <p className="text-primary font-medium mb-3">{member.role}</p>
                    <p className="text-muted-foreground">{member.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Impact</h2>
              <p className="text-xl text-muted-foreground">
                Growing together with our community
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <Card className="text-center hover:shadow-xl transition-shadow border-2">
                <CardContent className="p-8">
                  <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                    1,000+
                  </div>
                  <div className="text-lg font-medium text-foreground">Properties Listed</div>
                  <p className="text-sm text-muted-foreground mt-2">Verified quality rentals</p>
                </CardContent>
              </Card>
              <Card className="text-center hover:shadow-xl transition-shadow border-2">
                <CardContent className="p-8">
                  <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent mb-2">
                    5,000+
                  </div>
                  <div className="text-lg font-medium text-foreground">Happy Users</div>
                  <p className="text-sm text-muted-foreground mt-2">Tenants & landlords served</p>
                </CardContent>
              </Card>
              <Card className="text-center hover:shadow-xl transition-shadow border-2">
                <CardContent className="p-8">
                  <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent mb-2">
                    50+
                  </div>
                  <div className="text-lg font-medium text-foreground">Townships</div>
                  <p className="text-sm text-muted-foreground mt-2">Communities we serve</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
