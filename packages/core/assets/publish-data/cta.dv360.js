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

console.log('%c  %c  %c Playable Ad Tools v1.7 ', 'background:#e63946;padding:3px 0', 'background:#457b9d;padding:3px 0', 'color:#fff;background:#1d3557;padding:3px 6px');
document.CTA = {
    platform: "dv360",
    sdk: "dv360",
    analytics: { trackEvent: function(name) {} },
    onClick: function () {
        bgExitHandler();
        window.console.log("CTA Clicked");
    }
};