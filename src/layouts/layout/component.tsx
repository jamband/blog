import { Copyright } from "~/layouts/copyright";
import { Footer } from "~/layouts/footer";
import { Header } from "~/layouts/header";
import type { _Props } from "./types";

export const Component: React.VFC<_Props> = (props) => (
  <div className="flex min-h-screen flex-col">
    <Header />
    <main className="container mx-auto flex-grow pt-28 pb-10">
      {props.children}
    </main>
    <Copyright />
    <Footer />
  </div>
);
