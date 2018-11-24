import fetch from 'isomorphic-unfetch'
import Link from 'next/link'

const style = {
  border: 'thin solid blue',
  margin: '1em',
  padding: '1em'
}

const Page = ({ json: [ stuff ] }) => {
  const rdfa = stuff.data.rdfa['@graph'][0]
  return (
    <div>
      <h1>Hello sir</h1>
      <h2>{rdfa['og:site_name']}</h2>
      <p>{rdfa['og:description']}</p>
      <p>Hey there, looking for <Link href='/page-2'><a>page 2</a></Link>?</p>
      <p>{stuff.data.url}</p>
      <pre>{JSON.stringify(rdfa, null, '  ')}</pre>
      {stuff.products.map((product, i) => (
        <div key={`product-${i}`} style={style}>
          <h3><Link href={`/page-3?q=${i}`}><a>{product.microdata['@graph'][0].name}</a></Link></h3>
          <p>{product.microdata['@graph'][0].description}</p>
          { false && <img src={product.microdata['@graph'][0].image} />}
          <p>{product.url}</p>
        </div>
      ))}
    </div>
  )
}

Page.getInitialProps = async ({ req }) => {
  const res = await fetch('http://localhost:3000/static/mabo.json')
  const json = await res.json()
  return { json }
}

export default Page