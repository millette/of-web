// self
import { ProductTeaser } from "../components"

export default ({ products }) =>
  products.map((product, i) => (
    <ProductTeaser key={`product-${i}`} i={i} product={product} />
  ))
