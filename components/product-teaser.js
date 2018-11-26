// npm
import Link from "next/link"

const style = {
  border: "thin solid blue",
  margin: "1em",
  padding: "1em",
}

export default ({ product: { url, microdata }, i }) => {
  const { name, description, image } = microdata["@graph"][0]
  return (
    <div style={style}>
      <h3>
        {i >= 0 ? (
          <Link prefetch href={`/item?q=${i}`} as={`/item/${i}`}>
            <a>{name}</a>
          </Link>
        ) : (
          name
        )}
      </h3>
      <p>{description}</p>
      {!(i >= 0) && <img src={image} />}
      <p>{url}</p>
    </div>
  )
}
