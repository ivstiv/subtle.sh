export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "subtle.sh",
  description:
    "Beautifully designed components built with Radix UI and Tailwind CSS.",
  mainNav: [
    {
      title: "Home",
      href: "/",
    },
    {
      title: "About",
      href: "/about",
    },
  ],
  links: {
    github: "https://github.com/shadcn/ui",
  },
};
