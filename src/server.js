const http = require('http')
const path = require('path')
const fs = require('fs')
const ws = require('ws')
const esbuild = require('esbuild')
const chokidar = require('chokidar')
const defaults = require('./defaults')

const CLIENT_PATH = '/client.js'

module.exports = function (config) {
    config = {...defaults, ...config}
    
    const httpServer = http.createServer((req, res) => {
        res.setHeader("Access-Control-Allow-Origin", "https://roamresearch.com")

        if (req.url === CLIENT_PATH) {
            const clientScript = esbuild.buildSync({
                entryPoints: [path.join(__dirname, 'client.js')],
                define: { 
                    PAGE_TITLE: `"${config.pageTitle}"`,
                    PAGE_ONLY: config.pageOnly,
                    HOST: `"${config.host}"`,
                    PORT: config.port,
                },
                minify: true,
                bundle: true,
                write: false,
            })
            res.writeHead(200, {
                "Content-Type": "text/json"
            })
            return res.end(clientScript.outputFiles[0].contents)
        }

        res.writeHead(404)
        return res.end()
    })
    
    const resolvedDirectory = path.resolve(config.directory)

    new ws.Server({ server: httpServer })
        .on("connection", (ws) => {
            console.log("Roam client connected, watching files now")
            

            const watcher = chokidar
                .watch(resolvedDirectory, { cwd: resolvedDirectory })
                .on("all", (event, relativePath) => {
                    if (event !== "add" && event !== "change") {
                        return
                    }
                    
                    const block = config.getBlock(relativePath, path.join(resolvedDirectory, relativePath))
                    
                    if (block && block.uid && block.string) {
                        console.log(`Sending ${relativePath}"`)
                        ws.send(JSON.stringify({ 
                            blockUid: block.uid, 
                            blockString: block.string 
                        }));
                    } else {
                        console.log(`Not sending ${relativePath}: getBlock didn't return uid or string"`)
                    }
                })

            ws.on("close", () => {
                console.log("Roam client disconnected, stopping file watching")
                watcher.unwatch()
            })
        })

    const installScript = esbuild.buildSync({
        entryPoints: [path.join(__dirname, 'install.js')],
        define: {
            CLIENT_PATH: `"${CLIENT_PATH}"`,
            PAGE_TITLE: `"${config.pageTitle}"`,
            HOST: `"${config.host}"`,
            PORT: `${config.port}`
        },
        minify: true,
        bundle: true,
        write: false,
    }).outputFiles[0].text

    httpServer.listen(config.port, config.host, () => {
        console.log('Server is running. To install the client, run the following javascript in your Roam.')
        console.log('-----------------------------------------------')
        console.log(installScript)
        console.log('-----------------------------------------------')
    })

    return httpServer
}