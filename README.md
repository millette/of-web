# Hello.

## Docker usage

### Only node web server

```sh
docker build --file=node.dockerfile --tag=of-web-app .
docker run --detach --publish=80:3000 --name=running-of-web of-web-app
```

Change `80` to a more suitable port according to your needs.

### Caddy and node together

```sh
docker-compose  up
```
