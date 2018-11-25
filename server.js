// npm
const fastify = require("fastify")({ logger: { level: "error" } })
const nextjs = require("next")

// self
const mabo = require("./data/mabo.json")

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== "production"

fastify.register((fastify, opts, next) => {
  const app = nextjs({ dev })

  const { handleRequest, render, render404 } = app
  app
    .prepare()
    .then(() => {
      if (dev) {
        fastify.get("/_next/*", (req, reply) => {
          return handleRequest(req.req, reply.res).then(() => {
            reply.sent = true
          })
        })

        fastify.get("/_error/*", (req, reply) => {
          return handleRequest(req.req, reply.res).then(() => {
            reply.sent = true
          })
        })
      }

      /*
      fastify.get('/a', (req, reply) => {
        return render(req.req, reply.res, '/b', req.query)
          .then(() => {
            reply.sent = true
          })
      })

      fastify.get('/b', (req, reply) => {
        return render(req.req, reply.res, '/a', req.query)
          .then(() => {
            reply.sent = true
          })
      })
      */

      fastify.get("/api/mabo", async (req, reply) => {
        if (req.query.q) {
          if (mabo[0].products[req.query.q]) {
            reply.type("application/json")
            reply.send(mabo[0].products[req.query.q])
          } else {
            await render404(req.req, reply.res)
            reply.sent = true
          }
          return
        }
        reply.type("application/json")
        reply.send(mabo)
      })

      fastify.get("/*", async (req, reply) => {
        await handleRequest(req.req, reply.res)
        reply.sent = true
      })

      fastify.setNotFoundHandler(async (request, reply) => {
        await render404(request.req, reply.res)
        reply.sent = true
      })

      next()
    })
    .catch(next)
})

fastify.listen(port, (err) => {
  if (err) throw err
  console.log(`> Ready on http://localhost:${port}`)
})
