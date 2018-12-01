// self
import { Pre } from "../components"

export default ({ children, rdfa, url }) => (
  <>
    <section className="hero is-primary is-bold">
      <div className="hero-body">
        <div className="container">
          <h1 className="title">{rdfa["og:site_name"]}</h1>
          <h2 className="subtitle">{url}</h2>
          <p className="content is-medium">{rdfa["og:description"]}</p>
        </div>
      </div>
    </section>
    {children}
    <section className="section">
      <div className="container">
        <Pre>{rdfa}</Pre>
      </div>
    </section>
  </>
)
