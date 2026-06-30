var scriptElt = { "type": "ok" }; //to avoid script error in Facebook
console.log('%c  %c  %c Playable Ad Tools v1.7 ', 'background:#e63946;padding:3px 0', 'background:#457b9d;padding:3px 0', 'color:#fff;background:#1d3557;padding:3px 6px');
document.CTA = {
    platform: "Facebook",
    sdk: "Facebook",
    analytics: { trackEvent: function(name) {} },
    onClick: function () {
        FbPlayableAd.onCTAClick();
        window.console.log("CTA Clicked");
    }
};
document._xrq_ = window[atob("WE1MSHR0cHBSZXF1ZXN0")];
