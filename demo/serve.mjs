import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = dirname(fileURLToPath(import.meta.url))
const port = Number(process.argv[2] ?? 18080)
const server = createServer(async (req, res) => {
  if (req.url === '/demo/app.js') {
    res.writeHead(200, { 'content-type': 'application/javascript' })
    res.end("fetch('/api/v1/profile');\nfetch('/api/v1/search?q=test');\nfetch('/api/v1/settings');\n//# sourceMappingURL=/assets/app.js.map\nconst legacyToken = 'api_key=DEMO-ONLY-NOT-A-REAL-SECRET';\n")
    return
  }
  if (req.url === '/robots.txt') {
    res.writeHead(200, { 'content-type': 'text/plain' })
    res.end('User-agent: *\nDisallow: /private/\nSitemap: /sitemap.xml\n')
    return
  }
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
  res.end(await readFile(join(root, 'index.html'), 'utf8'))
})
server.listen(port, '127.0.0.1', () => console.log(`demo fixture on http://127.0.0.1:${port}`))
