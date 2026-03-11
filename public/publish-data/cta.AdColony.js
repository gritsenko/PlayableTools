console.log('%c  %c  %c Playable Ad Tools v1.7 ', 'background:#e63946;padding:3px 0', 'background:#457b9d;padding:3px 0', 'color:#fff;background:#1d3557;padding:3px 6px');
document.CTA = {
    platform: "AdColony",
    sdk: "mraid2",
    analytics: { trackEvent: function(name) {} },
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