export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "subtle.sh",
  description:
    "E2E encrypted ephemeral messaging app. Share secrets securely without setup. Built with Next.js, Soketi, and OpenPGP.js. Self-hostable.",
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
    github: "https://github.com/ivstiv/subtle.sh",
  },
};
