const style = { whiteSpace: "pre-wrap" }

export default ({ children }) => (
  <pre style={style}>{JSON.stringify(children, null, "  ")}</pre>
)
