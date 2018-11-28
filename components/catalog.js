// npm
import Fuse from "fuse.js"
import React, { Component } from "react"

// self
import { ProductTeaser } from "../components"

export default class Catalog extends Component {
  constructor(props) {
    super(props)
    let first = true
    const searchSet = props.products.map(({ microdata }, id) => ({
      microdata: microdata["@graph"][0],
      id,
    }))
    this.state = {
      search: "",
      found: [],
    }

    const options = {
      shouldSort: true,
      includeScore: true,
      keys: ["microdata.name", "microdata.description"],
    }

    this.fuse = new Fuse(searchSet, options)
    this.onChange = this.onChange.bind(this)
  }

  onChange({ target: { value } }) {
    const found = this.fuse.search(value).map(({ score, item: { id } }) => ({
      product: this.props.products[id],
      score,
      id,
    }))
    this.setState({
      search: value,
      found,
    })
  }

  render() {
    return (
      <section className="section">
        <div className="container">
          <input type="text" onChange={this.onChange} />
          <br />
          <p>Trouvé {this.state.found.length} item(s).</p>
          <div className="columns is-multiline">
            {this.state.found.map(({ product, id, score }) => (
              <ProductTeaser
                className="column is-half"
                key={`product-${id}`}
                score={score}
                i={id}
                product={product}
              />
            ))}
          </div>
        </div>
      </section>
    )
  }
}
