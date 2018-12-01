// core
// const { readFileSync } = require("fs")
const { join } = require("path")

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

/*
const bulmaPath = require.resolve("bulma/css/bulma.min.css")
const bulma =
  readFileSync(bulmaPath, "utf-8") + "\npre { white-space: pre-wrap; }"
*/

// const favicon = readFileSync("favicon.ico")
const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== "production"

const cacheOptions = {
  driver: {
    options: {},
  },
}

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

  const nextJsHandler = (req, reply) => {
    return app.handleRequest(req.req, reply.res).then(() => {
      reply.sent = true
    })
  }

  const send404 = (req, reply) =>
    render404(req.req, reply.res).then(() => {
      reply.sent = true
    })

  const getPromise = (key) =>
    new Promise((resolve, reject) => {
      fastify.cache.get(key, (err, cached) => {
        if (err) return reject(err)
        resolve(cached)
      })
    })

  const setPromise = (key, html, ttl) =>
    new Promise((resolve, reject) => {
      const date = new Date().toUTCString()
      const etag = `"${key.replace(/[^a-z0-9]/g, "")}${html.length}"`
      const obj = { html, date, etag }
      fastify.cache.set(key, obj, ttl, (err) => {
        if (err) return reject(err)
        resolve(obj)
      })
    })

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
        root: join(__dirname, "root"),
        serve: false,
      })

      get("/favicon.ico", (req, reply) => reply.sendFile("favicon.ico"))

      get("/item/:q", { schema: { params: "itemq#" } }, async (req, reply) => {
        if (!mabo[0].products[req.params.q]) return send404(req, reply)
        const cached = await getPromise(req.raw.url)
        if (cached && cached.item && cached.item.html) {
          reply.etag(cached.item.etag)
          reply.type("text/html")
          reply.header("last-modified", cached.item.date)
          return reply.send(cached.item.html)
        }

        const html = await renderToHTML(req.req, reply.res, "/item", {
          q: String(req.params.q),
        })

        const { etag, date } = await setPromise(req.raw.url, html, 666666)
        reply.etag(etag)
        reply.type("text/html")
        reply.header("last-modified", date)
        return reply.send(html)
      })

      get("/api/mabo/:q", { schema: { params: "itemq#" } }, (req, reply) => {
        if (!mabo[0].products[req.params.q]) return send404(req, reply)
        reply.type("application/json")
        // FIXME
        /*
        reply.etag(
          `"${req.raw.url}-${name}-v${version}"`.replace(/[-./]+/g, ""),
        )
        */
        return reply.send({
          product: mabo[0].products[req.params.q],
          nProducts: mabo[0].products.length,
        })
      })
      get("/api/mabo", (req, reply) => {
        reply.type("application/json")
        // FIXME
        /*
        reply.etag(
          `"${req.raw.url}-${name}-v${version}"`.replace(/[-./]+/g, ""),
        )
        */
        return reply.send(mabo)
      })

      // FIXME
      /*
      get("/bulma.css", (req, reply) => {
        reply.type("text/css")
        reply.etag(
          `"${req.raw.url}-${name}-v${version}"`.replace(/[-./]+/g, ""),
        )
        // reply.etag()
        return reply.send(bulma)
      })
      */
      // FIXME
      // get("/", cacheSend.bind(null, "/"))
      get("/", async (req, reply) => {
        const cached = await getPromise("/")
        if (cached && cached.item && cached.item.html) {
          reply.etag(cached.item.etag)
          reply.type("text/html")
          reply.header("last-modified", cached.item.date)
          return reply.send(cached.item.html)
        }

        const html = await renderToHTML(req.req, reply.res, "/")
        const { etag, date } = await setPromise("/", html, 666666)
        reply.etag(etag)
        reply.type("text/html")
        reply.header("last-modified", date)
        return reply.send(html)
      })

      // get("/*", nextJsHandler) // not needed
      setNotFoundHandler(send404)
      next()
    })
    .catch(next)
})

listen(port, process.env.HOSTNAME)
  .then(() => console.log("> Ready"))
  .catch(console.error)
