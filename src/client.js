import ReconnectingWebSocket from "reconnecting-websocket"

function log (message) {
    console.log(`Roam Filesystem: ${message}`)
}

async function sleep (ms) {
    await new Promise(resolve => setTimeout(resolve, ms))
}

async function pageIdByTitle(pageTitle) {
    const result = roamAlphaAPI.q(`[:find ?v
                :in $ ?page-title
                :where [?e :block/uid ?v]
                [?e :node/title ?page-title]]`, pageTitle)
    
    if (result.length === 0) {
        createPage(pageTitle)
        await sleep(300)
        return pageIdByTitle(pageTitle)
    } else {
        return result[0][0]
    }
}

function createPage(pageTitle) {
    return roamAlphaAPI.createPage({
        page: { title: pageTitle },
    })
}

function blockExists(blockUid) {
    const result = roamAlphaAPI.q(`[:find ?e
                :in $ ?block-uid
                :where [?e :block/uid ?block-uid]]`, blockUid)
    
    return result.length !== 0
}

function blockIsChildOf(blockUid, pageTitle) {
    const result = roamAlphaAPI.q(`[:find ?e 
        :in $ ?block-uid ?page-title
        :where [?e :block/uid ?block-uid]
        [?e :block/parents ?p]
        [?p :node/title ?page-title]]`, blockUid, pageTitle) 

    return result.length !== 0
}

function createBlock(blockUid, blockString, pageUid) {
    return roamAlphaAPI.createBlock({
        block: { uid: blockUid, string: blockString },
        location: { "parent-uid": pageUid, order: 0 }
    })
}

function updateBlock(blockUid, blockString) {
    return roamAlphaAPI.updateBlock({
        block: { uid: blockUid, string: blockString }
    })
}

async function connect() {
    const pageUid = await pageIdByTitle(PAGE_TITLE)
    const socket = new ReconnectingWebSocket(`ws://${HOST}:${PORT}`);

    socket.addEventListener('open', () => {
        log("Connected")
    });
    
    socket.addEventListener('message', (event) => {
        const { blockUid, blockString } = JSON.parse(event.data)

        if (blockExists(blockUid)) {
            if (PAGE_ONLY && !blockIsChildOf(blockUid, PAGE_TITLE)) {
                log(`Not updating ${blockUid}: it is not on a page ${PAGE_TITLE}`)
            } else {
                log(`Updating block ${blockUid}`)
                updateBlock(blockUid, blockString)
            }
        } else {
            createBlock(blockUid, blockString, pageUid)
            log(`Creating block ${blockUid}`)
        }
    });

    socket.addEventListener('close', () => {
        log("Disconnected")
    })
}

connect()