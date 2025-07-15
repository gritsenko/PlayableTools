var headNode = document.getElementsByTagName("head")[0],
    script = document.createElement("script");

// script attribute
script.setAttribute("type", "text/javascript");
script.setAttribute("charset", "utf-8");
script.setAttribute("src", "https://sf16-muse-va.ibytedtos.com/obj/union-fe-nc-i18n/playable/sdk/playable-sdk.js");
// inject elements
headNode.appendChild(script);

script.onload = function () {
    //sdk api loaded
};

document.CTA = {
    onClick: function () {
        try {
            window.playableSDK.openAppStore();
        } catch (b) {
            console.log(b);
        }
        window.console.log("CTA Clicked");
    }
};

document.XRQ = window["XMLHttp" + "Request"];