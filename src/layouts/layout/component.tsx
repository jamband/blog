import { Copyright } from "../copyright";
import { Footer } from "../footer";
import { Header } from "../header";
import type { _Props } from "./types";

export const Component: React.FC<_Props> = (props) => (
  <div className="flex min-h-screen flex-col">
    <Header />
    <main className="container mx-auto flex-grow pt-28 pb-10">
      {props.children}
    </main>
    <Copyright />
    <Footer />
  </div>
);
