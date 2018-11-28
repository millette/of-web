// npm
import Head from "next/head"

// self
import { Footer } from "../components"

export default ({ title, children }) => {
  return (
    <>
      {title && (
        <Head>
          <title>{title}</title>
        </Head>
      )}
      {children}
      <Footer />
    </>
  )
}
