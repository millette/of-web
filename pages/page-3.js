// npm
import fetch from "isomorphic-unfetch"
import Link from "next/link"

// self
import ProductTeaser from "../components/product-teaser"

const Page3 = ({ json }) => (
  <div>
    <h1>Page 3</h1>
    <p>
      Hey there, looking for{" "}
      <Link href="/">
        <a>home</a>
      </Link>
      ?
    </p>
    {json && <ProductTeaser product={json} />}
    <pre>{JSON.stringify(json, null, "  ")}</pre>
  </div>
)

Page3.getInitialProps = async ({ query }) => {
  const { q } = query
  if (!q) {
    return {}
  }
  const res = await fetch("http://localhost:3000/static/mabo.json")
  const json = await res.json()
  if (!json[0].products[q]) {
    return {}
  }
  return { json: json[0].products[q] }
}

export default Page3
