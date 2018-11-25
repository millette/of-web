// npm
import Link from "next/link"

const style = {
  border: "thin solid blue",
  margin: "1em",
  padding: "1em",
}

export default ({ product, i }) => (
  <div style={style}>
    <h3>
      {i >= 0 ? (
        <Link href={`/page-3?q=${i}`} as={`/page-3/${i}`}>
          <a>{product.microdata["@graph"][0].name}</a>
        </Link>
      ) : (
        product.microdata["@graph"][0].name
      )}
    </h3>
    <p>{product.microdata["@graph"][0].description}</p>
    {!(i >= 0) && <img src={product.microdata["@graph"][0].image} />}
    <p>{product.url}</p>
  </div>
)
