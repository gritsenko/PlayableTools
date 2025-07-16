var scriptElt = { "type": "ok" }; //to avoid script error in Facebook
document.CTA = {
    onClick: function () {
        FbPlayableAd.onCTAClick();
        window.console.log("CTA Clicked");
    }
};