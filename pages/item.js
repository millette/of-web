// npm
import fetch from "isomorphic-unfetch"
import Link from "next/link"

// self
import { Pre, Layout, ProductTeaser, Pager } from "../components"
import { baseUrl } from "../utils"

const style = { marginTop: "6px" }

const Page3 = ({ product, n, nProducts, prev, next }) => (
  <Layout title={product.microdata["@graph"][0].name}>
    <section className="section">
      <div className="container">
        <h1 className="title">{product.microdata["@graph"][0].name}</h1>
        <h2 className="subtitle">
          #{n} de {nProducts}
        </h2>
        <div className="columns">
          <div className="column is-narrow">
            <Pager n={n - 1} nProducts={nProducts} />
          </div>
          <div className="column">
            <p style={style}>
              <Link prefetch href="/">
                <a>
                  <b>⌂ Page d’accueil</b>
                </a>
              </Link>
            </p>
          </div>
        </div>
        <ProductTeaser product={product} />
      </div>
    </section>
    <section className="section">
      <div className="container">
        <h3 className="title is-5">microdata</h3>
        <Pre>{product.microdata["@graph"][0]}</Pre>
      </div>
    </section>
    <section className="section">
      <div className="container">
        <h3 className="title is-5">json</h3>
        <Pre>{product}</Pre>
      </div>
    </section>
  </Layout>
)

Page3.getInitialProps = async ({ req, query }) => {
  if (!query.q) return {}
  try {
    const q = query.q
    const { product, nProducts } = await fetch(
      baseUrl(req, `api/mabo/${q}`),
    ).then((res) => res.json())

    return {
      n: parseInt(q, 10) + 1,
      nProducts,
      product,
    }
  } catch (e) {
    return {}
  }
}

export default Page3
