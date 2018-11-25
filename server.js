// npm
const { register, listen } = require("fastify")({ logger: { level: "error" } })
const nextjs = require("next")

// self
const mabo = require("./data/mabo.json")

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== "production"

register((fastify, opts, next) => {
  const get = fastify.get.bind(fastify)
  const setNotFoundHandler = fastify.setNotFoundHandler.bind(fastify)
  const app = nextjs({ dev })
  const handleRequest = app.handleRequest.bind(app)
  const render = app.render.bind(app)
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

  prepare()
    .then(() => {
      if (dev) {
        get("/_next/*", handler)
        get("/_error/*", handler)
      }

      /*
      get('/a', (req, reply) => {
        return render(req.req, reply.res, '/b', req.query)
          .then(() => {
            reply.sent = true
          })
      })

      get('/b', (req, reply) => {
        return render(req.req, reply.res, '/a', req.query)
          .then(() => {
            reply.sent = true
          })
      })
      */

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
