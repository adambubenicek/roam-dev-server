# Roam Dev Server

Roam Dev Server syncs your local files into your [Roam](http://roamresearch.com/) database. You can now develop your `roam/css`, `roam/js`, and `roam/render` extensions in your favorite text editor. And, since you're now dealing with local files, nothing is stopping you from using your favorite build tools either. All without having to copy paste, in real time.

## Status

Highly experimental, API might change. Data loss is unlikely, but might still happen due to unforseen circumstances. I recommend backing up first, or developing in a different graph, before copy-pasting final code blocks into your main graph.

## Prerequisities

- [Node.js](https://nodejs.org/en/)

## Quick start

First, lets create a new directory:

```console
$ mkdir roam-files 
$ cd roam-files
```

Create a new CSS file:

```console
$ echo "body {background: blue}" > our-beautiful-theme.css
```

And just run our server:

```console
$ npx roam-dev-server
```

The server generates a small JavaScript snippet, which we copy and paste into Roam's [Developer console](https://support.airtable.com/hc/en-us/articles/232313848-How-to-open-the-developer-console).

If all went well, we will find our CSS in a new block on a page called `Roam Dev Server`. Let's nest it under a `{{roam/css}}` block now, so we can appreciate its true beauty.

And there we go. We can now go back to our text editor, save our changes, and see them reflected right away.

## Quick start demo
![Kapture 2021-03-27 at 13 11 46](https://user-images.githubusercontent.com/3390406/112720565-6f4c2d00-8eff-11eb-95c2-cdc824659347.gif)

## Installation

You can either [run it right away with npx](#quick-start), or install it as a regular npm dependency.

```console
$ npm add roam-dev-server
```

## Command line interface

```console
$ npx roam-dev-server --help
roam-dev-server [directory]

Starts a development server for Roam

Positionals:
  d, directory  directory                                [string] [default: "."]

Options:
      --help        Show help                                          [boolean]
      --version     Show version number                                [boolean]
  -c, --config      Configuration file
  -h, --host        Server host                  [string] [default: "localhost"]
  -p, --port        Server port                         [number] [default: 8080]
  -t, --page-title  Default Roam page title[string] [default: "Roam Dev Server"]
  -w, --page-only   Update only blocks on the default Roam page
                                                       [boolean] [default: true]
```

## Node.js interface

```javascript
const RoamDevServer = require('roam-dev-server')
const config = require('./roam-dev-server.config.js') // optional

const rds = new RoamDevServer(config) // returns Node.js http server instance
```

## Configuration

Both Command line and Node.js interfaces can take an optional JavaScript configuration object. Most of the options can be specified with [CLI](#command-line-interface) flags, with the exception of the `getBlock` function.

```javascript
const fs = require('fs')

module.exports = {
    // Server configuration
    host: 'localhost',
    port: 8080,

    // Roam page name, where your files will be initially synced to
    pageTitle: 'Roam Dev Server',

    // Prevent updates to blocks outside of the default page.
    // A measure against data loss in case of a UID collision.
    pageOnly: true,
    
    // Watched directory
    directory: '.',
    
    // A synchronous function which returns block UID and its string content.
    // If either value is null, or null is returned, block will not be synced.
    getBlock: (relativePath, absolutePath) => {

        // Get language string for JavaScript, Clojure, and CSS files
        const language = /\.(clj[sc]?|edn)$/.test(relativePath) ? "clojure"
            : /\.js$/.test(relativePath) ? "javascript" 
            : /\.css$/.test(relativePath) ? "css" 
            : null

        // Don't sync if we don't understand the language
        if (language === null) {
            return null
        }

        // Read the file contents
        const content = fs.readFileSync(absolutePath, 'utf-8')
        
        return {
            // UID is the file path. Encoded to work nicely in the URL, e.g.:
            // subdir/myfile.css > subdir%2Fmyfile.css
            uid: encodeURIComponent(relativePath),
            
            // Content is wrapped in a code block Roam will understand, e.g.:
            // ```javascript
            // console.log("I am the content of your file")
            // ```
            string: `\`\`\`${language}\n${content}\`\`\``
        }
    }
}
```
