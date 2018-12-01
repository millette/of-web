// core
const { join, dirname } = require("path")

// npm
const elFastify = require("fastify")()
const nextjs = require("next")
const abstractCache = require("abstract-cache")

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
const dev = process.env.NODE_ENV !== "production"
const TTL = dev ? 30 : 86400000 * 30
const cacheOptions = { driver: { options: {} } }
if (dev) cacheOptions.driver.options.maxItems = 10
const cache = abstractCache(cacheOptions)
register(require("fastify-response-time"))
register(require("fastify-caching"), { cache })

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

  const nextJsHandler = (req, reply) =>
    app.handleRequest(req.req, reply.res).then(() => {
      reply.sent = true
    })

  const send404 = (req, reply) =>
    render404(req.req, reply.res).then(() => {
      reply.sent = true
    })

  const getPromise = (key) =>
    new Promise((resolve, reject) =>
      fastify.cache.get(key, (err, cached) =>
        err ? reject(err) : resolve(cached),
      ),
    )

  const setPromise = (key, html) =>
    new Promise((resolve, reject) => {
      const date = new Date().toUTCString()
      const etag = `"${key.replace(/[^a-z0-9]/g, "")}${html.length}"`
      const obj = { html, date, etag }
      fastify.cache.set(key, obj, TTL, (err) =>
        err ? reject(err) : resolve(obj),
      )
    })

  const cacheSend = async (req, reply, opts, path) => {
    const cached = await getPromise(req.raw.url)
    if (cached && cached.item && cached.item.html) {
      reply
        .etag(cached.item.etag)
        .type("text/html")
        .header("last-modified", cached.item.date)
      return cached.item.html
    }
    const html = await renderToHTML(
      req.req,
      reply.res,
      path || req.raw.url,
      opts,
    )
    const { etag, date } = await setPromise(req.raw.url, html)
    reply
      .etag(etag)
      .type("text/html")
      .header("last-modified", date)
    return html
  }

  prepare()
    .then(() => {
      if (dev) {
        get("/_next/*", nextJsHandler)
      } else {
        register(require("fastify-static"), {
          root: join(__dirname, ".next"),
          prefix: "/_next/",
          decorateReply: false,
        })
      }

      register(require("fastify-static"), {
        root: dirname(require.resolve("bulma/css/bulma.min.css")),
        prefix: "/css/",
        decorateReply: false,
      })

      register(require("fastify-static"), {
        root: join(__dirname, "root"),
        serve: false,
      })

      // TODO: automatically route each file in /root
      get("/favicon.ico", (req, reply) => reply.sendFile("favicon.ico"))

      get(
        "/api/mabo/:q",
        { schema: { params: "itemq#" } },
        async (req, reply) => {
          if (!mabo[0].products[req.params.q]) return send404(req, reply)
          reply
            .type("application/json; charset=utf-8")
            .etag(`"api-item-${req.params.q}-${name}-v${version}"`)
          return {
            product: mabo[0].products[req.params.q],
            nProducts: mabo[0].products.length,
          }
        },
      )

      get("/api/mabo", async (req, reply) => {
        reply
          .type("application/json; charset=utf-8")
          .etag(`"api-mabo-${name}-v${version}"`)
        return mabo
      })

      get("/item/:q", { schema: { params: "itemq#" } }, async (req, reply) => {
        if (!mabo[0].products[req.params.q]) return send404(req, reply)
        const q = String(req.params.q)
        return cacheSend(req, reply, { q }, "/item")
      })

      get("/", cacheSend)

      setNotFoundHandler(send404)
      next()
    })
    .catch(next)
})

listen(parseInt(process.env.PORT, 10) || 3000, process.env.HOSTNAME)
  .then(() => console.log("> Ready"))
  .catch(console.error)
