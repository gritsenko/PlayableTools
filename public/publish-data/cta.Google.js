var headNode = document.getElementsByTagName("head")[0],
    script = document.createElement("script");

// script attribute
script.setAttribute("type", "text/javascript");
script.setAttribute("charset", "utf-8");
script.setAttribute("src", "//tpc.googlesyndication.com/pagead/gadgets/html5/api/exitapi.js");
// inject elements
headNode.appendChild(script);

script.onload = function () {
    ExitApi.delayCloseButton(0);
};

document.CTA = {
    onClick: function () {
        try {
            ExitApi.exit();
        } catch (b) {
            console.log(b);
        }
        window.console.log("CTA Clicked");
    }
};