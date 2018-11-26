// npm
import fetch from "isomorphic-unfetch"
import Link from "next/link"

// self
import ProductTeaser from "../components/product-teaser"

const Page = ({ json: [stuff] }) => {
  const rdfa = stuff.data.rdfa["@graph"][0]
  return (
    <div>
      <h1>Hello sir</h1>
      <h2>{rdfa["og:site_name"]}</h2>
      <p>{rdfa["og:description"]}</p>
      <p>
        Hey there, looking for{" "}
        <Link prefetch href="/page-2">
          <a>page 2</a>
        </Link>
        ?
      </p>
      <p>{stuff.data.url}</p>
      <pre>{JSON.stringify(rdfa, null, "  ")}</pre>
      {stuff.products.map((product, i) => (
        <ProductTeaser key={`product-${i}`} i={i} product={product} />
      ))}
    </div>
  )
}

Page.getInitialProps = ({ req }) => {
  const encrypted = req.socket.encrypted || req.connection.encrypted
  return fetch(
    req
      ? `${encrypted ? "https" : "http"}://${req.hostname}/api/mabo`
      : "/api/mabo",
  )
    .then((res) => res.json())
    .then((json) => ({ json }))
}

export default Page
