export default ({ rdfa, url }) => (
  <>
    <h1>{rdfa["og:site_name"]}</h1>
    <p>{rdfa["og:description"]}</p>
    <p>{url}</p>
    <pre>{JSON.stringify(rdfa, null, "  ")}</pre>
  </>
)
