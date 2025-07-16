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

document.XRQ = window["XMLHttp" + "Request"];