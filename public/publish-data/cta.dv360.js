var headNode = document.getElementsByTagName("head")[0],
    script = document.createElement("script");

// script attribute
script.setAttribute("type", "text/javascript");
script.setAttribute("charset", "utf-8");
script.setAttribute("src", "https://s0.2mdn.net/ads/studio/Enabler.js");
// inject elements
headNode.appendChild(script);

var clickTag = "http://my.com";

window.onload = function () {
    if (Enabler.isInitialized()) {
        enablerInitHandler();
    } else {
        Enabler.addEventListener(studio.events.StudioEvent.INIT, enablerInitHandler);
    }
}

function enablerInitHandler() {

}

function bgExitHandler(e) {
    Enabler.exit('Background Exit');
}

document.CTA = {
    onClick: function () {
        bgExitHandler();
        window.console.log("CTA Clicked");
    }
};