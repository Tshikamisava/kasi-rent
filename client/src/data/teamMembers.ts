export type TeamMember = {
  name: string;
  role: string;
  bio: string;
  image: string;
  linkedin?: string;
  email?: string;
};

export const teamMembers: TeamMember[] = [
  {
    name: "Tshikamisava Mmbengwa",
    role: "Founder & CEO",
    bio: "Leading KasiRent with a focus on trust, community impact, and modern rental experiences.",
    image: "https://images.pexels.com/photos/30938726/pexels-photo-30938726.jpeg?cs=srgb&dl=pexels-baobab-photos-2149382979-30938726.jpg&fm=jpg",
    linkedin: "https://www.linkedin.com/in/tshikamisava-mmbengwa-394b11260/",
    email: "tshika@kasirent.com",
  },
  {
    name: "Sipho Dlamini",
    role: "Developer",
    bio: "Building fast, reliable product experiences that help tenants and landlords connect seamlessly.",
    image: "https://images.pexels.com/photos/2216607/pexels-photo-2216607.jpeg?cs=srgb&dl=pexels-elsimage-2216607.jpg&fm=jpg",
    linkedin: "#",
    email: "sipho@kasirent.com",
  },
  {
    name: "Thando Mokoena",
    role: "Assistant Manager",
    bio: "Coordinating daily operations and making sure every user gets the right support at the right time.",
    image: "https://images.pexels.com/photos/35303003/pexels-photo-35303003.jpeg?cs=srgb&dl=pexels-gsoulgraphix-35303003.jpg&fm=jpg",
    linkedin: "#",
    email: "thando@kasirent.com",
  },
];