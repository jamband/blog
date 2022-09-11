import { useRouter } from "next/router";
import { APP_NAME } from "~/constants/app";
import { Component } from "./component";

export const Header: React.FC = () => {
  const { pathname } = useRouter();

  const [name, repository] = APP_NAME.split("/");
  const isPost = pathname === "/[year]/[month]/[slug]" ? true : false;

  return <Component name={name} repository={repository} isPost={isPost} />;
};
