// core
// const { readFileSync } = require("fs")
const { join } = require("path")

// npm
const elFastify = require("fastify")()
const nextjs = require("next")
// const AsyncLRU = require("async-lru")
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

// const cache = abstractCache({
const cacheOptions = {
  // useAwait: true,
  driver: {
    options: {},
  },
}

if (dev) {
  cacheOptions.driver.options.maxItems = 1
}

const cache = abstractCache(cacheOptions)

register(require("fastify-response-time"))
register(require("fastify-caching"), { cache })

/*
if (dev) {
  // decorateReply("etag", () => false)
} else {
  register(require("fastify-static"), {
    root: join(__dirname, ".next"),
    prefix: "/_next/",
  })
}
*/

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

  /*
  const lru = new AsyncLRU({
    max: dev ? 1 : 20,
    load: (req, reply, path, opts, cb) => {
      const ok = cb.bind(null, null)
      renderToHTML(req.req, reply.res, path, opts)
        .then(ok)
        .catch(cb)
    },
  })
  */

  /*
  const cacheSend = (key, req, reply, path, opts) =>
    new Promise((resolve, reject) => {
      lru.get(key, [req, reply, path || key, opts], (err, html) => {
        if (err) return reject(err)
        reply.type("text/html")
        reply.etag(`"${key}-${name}-v${version}"`.replace(/[-./]+/g, ""))
        resolve(reply.send(html))
      })
    })
  */

  prepare()
    .then(() => {
      if (dev) {
        get("/_next/*", nextJsHandler)
      } else {
        register(require("fastify-static"), {
          root: join(__dirname, ".next"),
          prefix: "/_next/",
        })
      }
      get("/item/:q", { schema: { params: "itemq#" } }, async (req, reply) => {
        console.log("GET ITEM...")
        if (!mabo[0].products[req.params.q]) return send404(req, reply)
        console.log("GET ITEM: Lets see...")
        // FIXME
        /*
        cacheSend(`/item/${req.params.q}`, req, reply, "/item", {
          q: String(req.params.q),
        })
        */

        /*
        render(req.req, reply.res, "/item", {
          q: String(req.params.q),
        })
        */

        // const cached = await fastify.cache.get(req.raw.url)

        const getPromise = (key) =>
          new Promise((resolve, reject) => {
            fastify.cache.get(req.raw.url, (err, cached) => {
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

        const cached = await getPromise(req.raw.url)
        if (cached && cached.item && cached.item.html) {
          console.log("SEND CACHED", cached.item.date)
          // reply.etag(`"${req.raw.url.replace(/[^a-z0-9]/g, '')}${cached.item.html.length}"`)
          reply.etag(cached.item.etag)
          reply.type("text/html")
          reply.header("last-modified", cached.item.date)
          return reply.send(cached.item.html)
        }

        const html = await renderToHTML(req.req, reply.res, "/item", {
          q: String(req.params.q),
        })

        console.log("SET CACHE")
        const { etag, date } = await setPromise(req.raw.url, html, 666666)
        console.log("SEND HTML", date)
        // reply.etag(`"${req.raw.url.replace(/[^a-z0-9]/g, '')}${html.length}"`)
        reply.etag(etag)
        reply.type("text/html")
        reply.header("last-modified", date)
        return reply.send(html)

        /*
        return new Promise((resolve2, reject2) => {
          fastify.cache.get(req.raw.url, (err, cached) => {
            // if (err) return reply.send(err)
            if (err) return reject2(err)
            reply.type("text/html")
            console.log('GOT CACHE?', cached && Object.keys(cached))

            if (cached && cached.item) {
              // return reply.send(cached.item)
              // html = cached.item
              console.log('GOT CACHE')
              // return reply.send(cached.item)
              return resolve2(cached.item)
            }


            renderToHTML(req.req, reply.res, "/item", {
              q: String(req.params.q),
            })
              .then((html) => {
                console.log('step #2')
                // return new Promise((resolve, reject) => {
                  console.log('step #3')
                  fastify.cache.set(req.raw.url, html, 666, (err) => {
                    console.log('step #4')
                    // if (err) return resolve(reply.send(err))
                    // if (err) return resolve(err)
                    if (err) return reject2(err)
                    console.log('step #5')
                    resolve2(html)
                  })
                // })
              })
              // .then(reply.send.bind(reply))
              // .catch(reply.send.bind(reply))

            // console.log('SET CACHE', html.length)
            // await fastify.cache.set(req.raw.url, html, 666)
            // return Promise.all([fastify.cache.set(req.raw.url, html), reply.send(html)])

          })
        })
        .then((o) => reply.send(o))
        .catch((e) => reply.send(e))
        */

        /*
        console.log('GET ITEM: ', cached)
        reply.type("text/html")
        // reply.etag()
        // let html
        if (cached && cached.item) {
          // return reply.send(cached.item)
          // html = cached.item
          console.log('GOT CACHE')
          return reply.send(cached.item)
        }
        console.log('NO CACHE, must RENDER')
        const html = await renderToHTML(req.req, reply.res, "/item", {
          q: String(req.params.q),
        })
        console.log('SET CACHE', html.length)
        // await fastify.cache.set(req.raw.url, html, 666)
        return Promise.all([fastify.cache.set(req.raw.url, html), reply.send(html)])
        */

        /*
          // console.log('GET ITEM: ', html)
          // await fastify.cache.set(req.raw.url, html)
          // console.log('SENDING')
          // return reply.send(html)
          // return Promise.all([fastify.cache.set(req.raw.url, html), reply.send(html)])
        // console.log('REPLY')
        // return reply.send('ok')
        */
      })
      /*
      get(
        "/item",
        { schema: { querystring: { q: { type: "integer" } } } },
        (req, reply) => {
          if (!mabo[0].products[req.query.q]) return send404(req, reply)
          reply.redirect(301, `/item/${req.query.q}`)
        },
      )
      */
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
      get("/favicon.ico", (req, reply) => {
        reply.type("image/x-icon")
        reply.etag(
          `"${req.raw.url}-${name}-v${version}"`.replace(/[-./]+/g, ""),
        )
        return reply.send(favicon)
      })
      */
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
      // get("/*", nextJsHandler)
      setNotFoundHandler(send404)
      next()
    })
    .catch(next)
})

listen(port, process.env.HOSTNAME)
  .then(() => console.log("> Ready"))
  .catch(console.error)
