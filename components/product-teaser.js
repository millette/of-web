// npm
import Link from "next/link"

export default ({ className, product: { url, microdata }, i }) => {
  const { name, description, image } = microdata["@graph"][0]
  return (
    <div className={className}>
      <h3 className="title is-5">
        {i >= 0 ? (
          <Link prefetch href={`/item?q=${i}`} as={`/item/${i}`}>
            <a>{name}</a>
          </Link>
        ) : (
          name
        )}
      </h3>
      <div className="columns">
        <div className="column">
          <p>{description}</p>
        </div>
        {!(i >= 0) && (
          <div className="column">
            <figure className="image">
              <img src={image} />
            </figure>
          </div>
        )}
      </div>
      <p>{url}</p>
    </div>
  )
}
