// npm
import Link from "next/link"

const style = {
  border: "thin solid blue",
  margin: "1em",
  padding: "1em",
}

export default ({ product, i }) => {
  return (
    <div style={style}>
      <h3>
        {i ? (
          <Link href={`/page-3?q=${i}`}>
            <a>{product.microdata["@graph"][0].name}</a>
          </Link>
        ) : (
          product.microdata["@graph"][0].name
        )}
      </h3>
      <p>{product.microdata["@graph"][0].description}</p>
      {false && <img src={product.microdata["@graph"][0].image} />}
      <p>{product.url}</p>
    </div>
  )
}
