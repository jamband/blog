import { Component } from "./component";
import { APP_NAME } from "~/constants/app";

export const Header: React.VFC = () => {
  const [name, repository] = APP_NAME.split("/");
  return <Component name={name} repository={repository} />;
};
