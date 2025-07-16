var headNode = document.getElementsByTagName("head")[0],
    script = document.createElement("script");

// script attribute
script.setAttribute("type", "text/javascript");
script.setAttribute("charset", "utf-8");
script.setAttribute("src", "mraid.js");
// inject elements
headNode.appendChild(script);

document.CTA = {
    onClick: function (store) {

        if (store === undefined)
            store = navigator.userAgent.toLowerCase().indexOf("android") > -1 ? "google" : "apple";

        var urls = {
            "google": "{{google}}",
            "apple": "{{apple}}"
        };
        var url = urls[store];
        window.console.log("CTA Clicked store: " + store + " link: " + url);
        mraid.open(url);
    }
};