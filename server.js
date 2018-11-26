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
      if (dev) {
        get("/_next/*", handler)
        // get("/_error", handler)
        // get("/_error/*", handler)
      }

      get("/item/:q", (req, reply) => {
        // FIXME: use schema validation (fastify) instead
        if (!req.params.q) {
          return send404(req, reply)
        }

        return cacheSend(`/item/${req.params.q}`, req, reply, "/item", {
          ...req.params,
          ...req.query,
        })
      })

      get("/item", (req, reply) =>
        req.query.q
          ? reply.redirect(301, `/item/${req.query.q}`)
          : send404(req, reply),
      )

      get("/api/mabo", (req, reply) => {
        if (!req.query.q) {
          reply.type("application/json")
          return reply.send(mabo)
        }
        if (mabo[0].products[req.query.q]) {
          reply.type("application/json")
          return reply.send({
            product: mabo[0].products[req.query.q],
            nProducts: mabo[0].products.length,
          })
        }
        return send404(req, reply)
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
