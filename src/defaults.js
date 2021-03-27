const fs = require('fs')

module.exports = {
    // Server configuration
    host: 'localhost',
    port: 8080,

    // Roam page name, where your files will be initially synced to
    pageTitle: 'Roam Dev Server',

    // Prevent updates to blocks outside of the default page.
    // A measure against data loss in case of UID collision.
    pageOnly: true,
    
    // Watched directory
    directory: '.',
    
    // A synchronous function which returns block UID and its string content.
    // If either value is null, or null is returned, block will not be synced.
    getBlock: (relativePath, absolutePath) => {

        // Get a code block language for JavaScript, Clojure, and CSS files
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
            // UID is the file path. Encoded to play nicely with the URL, e.g.:
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