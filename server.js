// core
const { readFileSync } = require("fs")
const { join } = require("path")

// npm
const elFastify = require("fastify")()
const nextjs = require("next")
const AsyncLRU = require("async-lru")

// self
const { name, version } = require("./package.json")
const mabo = require("./data/mabo.json")

// TODO: fix in the scraper instead
mabo[0].products = mabo[0].products.map((product) => {
  product.microdata["@graph"][0].image = product.microdata[
    "@graph"
  ][0].image.replace("http://mabo.ca/Upload/", "https://companyshop.ca/Upload/")
  return product
})

const register = elFastify.register.bind(elFastify)
const listen = elFastify.listen.bind(elFastify)
const decorateReply = elFastify.decorateReply.bind(elFastify)

const bulmaPath = require.resolve("bulma/css/bulma.min.css")
const bulma =
  readFileSync(bulmaPath, "utf-8") + "\npre { white-space: pre-wrap; }"

const favicon = readFileSync("favicon.ico")
const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== "production"

if (dev) {
  decorateReply("etag", () => false)
} else {
  register(require("fastify-compress"), {
    customTypes: /.*/,
  })
  register(require("fastify-response-time"))
  register(require("fastify-caching"))
  register(require("fastify-static"), {
    root: join(__dirname, ".next"),
    prefix: "/_next/",
  })
}

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
  const render = app.render.bind(app)
  const renderToHTML = app.renderToHTML.bind(app)
  const render404 = app.render404.bind(app)
  const prepare = app.prepare.bind(app)

  const nextJsHandler = (req, reply) => {
    return app.handleRequest(req.req, reply.res).then(() => {
      reply.sent = true
    })
  }

  const send404 = (req, reply) =>
    render404(req.req, reply.res).then(() => {
      reply.sent = true
    })

  const lru = new AsyncLRU({
    max: dev ? 1 : 20,
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
        reply.etag(`${key}-${name}-v${version}`)
        resolve(reply.send(html))
      })
    })

  prepare()
    .then(() => {
      if (dev) {
        get("/_next/*", nextJsHandler)
      }
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
        reply.etag(`${req.raw.url}-${name}-v${version}`)
        return reply.send({
          product: mabo[0].products[req.params.q],
          nProducts: mabo[0].products.length,
        })
      })
      get("/api/mabo", (req, reply) => {
        reply.type("application/json")
        reply.etag(`${req.raw.url}-${name}-v${version}`)
        return reply.send(mabo)
      })
      get("/favicon.ico", (req, reply) => {
        reply.type("image/x-icon")
        reply.etag(`${req.raw.url}-${name}-v${version}`)
        return reply.send(favicon)
      })
      get("/bulma.css", (req, reply) => {
        reply.type("text/css")
        reply.etag(`${req.raw.url}-${name}-v${version}`)
        return reply.send(bulma)
      })
      get("/", cacheSend.bind(null, "/"))
      // get("/*", nextJsHandler)
      setNotFoundHandler(send404)
      next()
    })
    .catch(next)
})

listen(port, process.env.HOSTNAME)
  .then(() => console.log("> Ready"))
  .catch(console.error)
