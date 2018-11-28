// npm
import fetch from "isomorphic-unfetch"
import Link from "next/link"

// self
import { Layout, Catalog, StoreInfo } from "../components"
import { baseUrl } from "../utils"

const Page = ({
  json: [
    {
      data: { url, rdfa },
      products,
    },
  ],
}) => (
  <Layout title="Accueil">
    <StoreInfo rdfa={rdfa["@graph"][0]} url={url}>
      <Catalog products={products} />
    </StoreInfo>
  </Layout>
)

Page.getInitialProps = ({ req }) =>
  fetch(baseUrl(req, "api/mabo"))
    .then((res) => res.json())
    .then((json) => ({ json }))

export default Page
