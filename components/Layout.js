import Head from "next/head";
import Nav from "./Nav";
import Footer from "./Footer";

export default function Layout({
  children,
  title = "Salezot",
  description = "Salezot — built for revenue teams.",
}) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Nav />
      <main>{children}</main>
      <Footer />
    </>
  );
}
