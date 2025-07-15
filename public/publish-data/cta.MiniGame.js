function initializeMiniGame() {
    if (window["c3_runtimeInterface"] === undefined) {
        const a = false, b = "undefined" != typeof OffscreenCanvas;
        window["c3_runtimeInterface"] = new RuntimeInterface({
            useWorker: a && b,
            workerMainUrl: "workermain.js",
            engineScripts: ["c3runtime.js"],
            scriptFolder: "",
            workerDependencyScripts: [],
            exportType: "playable-ad"
        });
    } else {
        console.warn("Game already initialized.");
    }
}

document.XRQ = window["XMLHttp" + "Request"];