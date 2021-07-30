import { Component } from "./component";

export const Footer: React.VFC = () => {
  const copyright = `\u00a9 ${new Date().getFullYear()} Tomoki Morita`;

  return <Component copyright={copyright} />;
};
