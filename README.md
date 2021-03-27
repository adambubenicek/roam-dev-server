# Roam Dev Server

Roam Dev Server syncs your local files into your [Roam](http://roamresearch.com/) database. You can now develop your `roam/css`, `roam/js`, and `roam/render` extensions in your favorite text editor. And, since you're now dealing with local files, nothing is stopping you from using your favorite build tools either. All without having to copy paste, in real time.

## Status

Highly experimental, API might change. Data loss is unlikely, but might still happen due to unforseen circumstances. I recommend backing up first, or developing in a different graph, before copy-pasting final code blocks into your main graph.

## Prerequisities

- [Node.js](https://nodejs.org/en/)

## Quick start

First, lets create a new directory:

```sh
mkdir roam-files 
cd roam-files
```

Create a new CSS file:

```sh
echo "body {background: bisque}" > our-beautiful-theme.css
```

And just run our server:

```sh
npx roam-dev-server
```

The server generates a small JavaScript snippet, which we copy and paste into Roam's [Developer console](https://support.airtable.com/hc/en-us/articles/232313848-How-to-open-the-developer-console).

If all went well, we will find our CSS in a new block on a page called `Roam Dev Server`. Let's nest it under a `{{roam/css}}` block now, so we can appreciate its true beauty.

And there we go. We can now go back to our text editor, save our changes, and see them reflected right away.