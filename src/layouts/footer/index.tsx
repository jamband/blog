import { Component } from "./component";

export const Footer: React.FC = () => {
  const links = [
    { href: "/about", text: "About" },
    { href: "/contact", text: "Contact" },
  ];

  return <Component links={links} />;
};
