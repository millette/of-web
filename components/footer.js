// self
import { External } from "../components"

export default () => (
  <footer className="footer">
    <div className="container">
      <div className="content has-text-centered">
        <p>
          Démo d’affichage de données collectées par{" "}
          <External href="http://robin.millette.info">Robin Millette</External>;
          consulter le{" "}
          <External href="https://github.com/millette/of-web">
            code source
          </External>
          .
        </p>
      </div>
    </div>
  </footer>
)
