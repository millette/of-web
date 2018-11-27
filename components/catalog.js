// self
import { ProductTeaser } from "../components"

export default ({ products }) => (
  <section className="section">
    <div className="container">
      <div className="columns is-multiline">
        {products.map((product, i) => (
          <ProductTeaser
            className="column is-half"
            key={`product-${i}`}
            i={i}
            product={product}
          />
        ))}
      </div>
    </div>
  </section>
)
