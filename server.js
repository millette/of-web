// npm
const { register, listen } = require("fastify")()
const nextjs = require("next")
const AsyncLRU = require("async-lru")

// self
const mabo = require("./data/mabo.json")

// TODO: fix in the scraper instead
mabo[0].products = mabo[0].products.map((product) => {
  product.microdata["@graph"][0].image = product.microdata[
    "@graph"
  ][0].image.replace("http://mabo.ca/Upload/", "https://companyshop.ca/Upload/")
  return product
})

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== "production"

register(require("fastify-compress"))
register(require("fastify-response-time"))

register((fastify, opts, next) => {
  fastify.addSchema({
    $id: "itemq",
    type: "object",
    properties: {
      q: { type: "integer" },
    },
  })

  const get = fastify.get.bind(fastify)
  const setNotFoundHandler = fastify.setNotFoundHandler.bind(fastify)
  const app = nextjs({ dev })
  const handleRequest = app.handleRequest.bind(app)
  const render = app.render.bind(app)
  const renderToHTML = app.renderToHTML.bind(app)
  const render404 = app.render404.bind(app)
  const prepare = app.prepare.bind(app)

  const handler = (req, reply) =>
    handleRequest(req.req, reply.res).then(() => {
      reply.sent = true
    })

  const send404 = (req, reply) =>
    render404(req.req, reply.res).then(() => {
      reply.sent = true
    })

  const lru = new AsyncLRU({
    max: 20,
    load: (req, reply, path, opts, cb) => {
      const ok = cb.bind(null, null)
      renderToHTML(req.req, reply.res, path, opts)
        .then(ok)
        .catch(cb)
    },
  })

  const cacheSend = (key, req, reply, path, opts) =>
    new Promise((resolve, reject) => {
      lru.get(key, [req, reply, path || key, opts], (err, html) => {
        if (err) return reject(err)
        reply.type("text/html")
        resolve(reply.send(html))
      })
    })

  prepare()
    .then(() => {
      // get("/_error", handler)
      // get("/_error/*", handler)
      if (dev) get("/_next/*", handler)

      get("/item/:q", { schema: { params: "itemq#" } }, (req, reply) => {
        if (!mabo[0].products[req.params.q]) return send404(req, reply)
        cacheSend(`/item/${req.params.q}`, req, reply, "/item", {
          q: String(req.params.q),
        })
      })

      get(
        "/item",
        { schema: { querystring: { q: { type: "integer" } } } },
        (req, reply) => {
          if (req.query.q === undefined) return send404(req, reply)
          reply.redirect(301, `/item/${req.query.q}`)
        },
      )

      get("/api/mabo/:q", { schema: { params: "itemq#" } }, (req, reply) => {
        if (!mabo[0].products[req.params.q]) return send404(req, reply)
        reply.type("application/json")
        return reply.send({
          product: mabo[0].products[req.params.q],
          nProducts: mabo[0].products.length,
        })
      })

      get("/api/mabo", (req, reply) => {
        reply.type("application/json")
        return reply.send(mabo)
      })

      get("/", cacheSend.bind(null, "/"))
      get("/*", handler)
      setNotFoundHandler(send404)
      next()
    })
    .catch(next)
})

listen(port, (err) => {
  if (err) throw err
  console.log(`> Ready on http://localhost:${port}`)
})
