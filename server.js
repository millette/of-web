// npm
const { register, listen } = require("fastify")()
const nextjs = require("next")
const AsyncLRU = require("async-lru")

// self
const mabo = require("./data/mabo.json")

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
    load: (req, reply, path, opts, cb) =>
      renderToHTML(req.req, reply.res, path, opts)
        .then((html) => cb(null, html))
        .catch(cb),
  })

  prepare()
    .then(() => {
      if (dev) {
        get("/_next/*", handler)
        // get("/_error", handler)
        // get("/_error/*", handler)
      }

      get("/page-3/:q", (req, reply) => {
        if (!req.params.q) {
          return send404(req, reply)
        }

        lru.get(
          `/page-3/${req.params.q}`,
          [
            req,
            reply,
            "/page-3",
            {
              ...req.params,
              ...req.query,
            },
          ],
          (err, html) => {
            if (err) {
              console.log("ERR:", err)
              return send404(req, reply)
            }
            reply.type("text/html")
            return reply.send(html)
          },
        )
      })

      get("/page-3", (req, reply) =>
        req.query.q
          ? reply.redirect(301, `/page-3/${req.query.q}`)
          : send404(req, reply),
      )

      get("/api/mabo", (req, reply) => {
        if (!req.query.q) {
          reply.type("application/json")
          return reply.send(mabo)
        }
        if (mabo[0].products[req.query.q]) {
          reply.type("application/json")
          return reply.send(mabo[0].products[req.query.q])
        }
        return send404(req, reply)
      })

      get("/", (req, reply) => {
        lru.get("/", [req, reply, "/", null], (err, html) => {
          if (err) {
            console.log("ERR:", err)
            return send404(req, reply)
          }
          reply.type("text/html")
          return reply.send(html)
        })
      })

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
