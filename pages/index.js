// npm
import fetch from "isomorphic-unfetch"
import Link from "next/link"

// self
import { Catalog, StoreInfo } from "../components"
import { baseUrl } from "../utils"

const Page = ({ json: [stuff] }) => {
  const rdfa = stuff.data.rdfa["@graph"][0]
  return (
    <div>
      <StoreInfo rdfa={rdfa} url={stuff.data.url} />
      <Catalog products={stuff.products} />
    </div>
  )
}

Page.getInitialProps = ({ req }) =>
  fetch(baseUrl(req, "api/mabo"))
    .then((res) => res.json())
    .then((json) => ({ json }))

export default Page
