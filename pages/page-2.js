import Link from "next/link"

export default () => (
  <div>
    <h1>Page 2</h1>
    <p>
      Hey there, looking for{" "}
      <Link prefetch href="/">
        <a>home</a>
      </Link>
      ?
    </p>
  </div>
)
