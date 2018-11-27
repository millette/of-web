import Document, { Head, Main, NextScript } from "next/document"

export default class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    let [, lang] = ctx.req.url.split("/")
    if (lang !== "en") lang = "fr"
    return { ...initialProps, lang }
  }

  render() {
    return (
      <html lang={this.props.lang}>
        <Head>
          <meta
            name="viewport"
            content="initial-scale=1.0, width=device-width, shrink-to-fit=no"
          />
          <link rel="stylesheet" href="/bulma.css" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    )
  }
}
