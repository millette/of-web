export default (req, path) => {
  const h =
    (req &&
      req.socket &&
      req.connection &&
      `${
        req.socket.encrypted || req.connection.encrypted ? "https" : "http"
      }://${req.hostname}`) ||
    ""
  return `${h}/${path}`
}
