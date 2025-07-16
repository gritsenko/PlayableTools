var headNode = document.getElementsByTagName("head")[0],
    script = document.createElement("script");

// script attribute
script.setAttribute("type", "text/javascript");
script.setAttribute("charset", "utf-8");
script.setAttribute("src", "mraid.js");
// inject elements
headNode.appendChild(script);


document.CTA = {
    platform: "mraid3",
    onClick: function (storeOrUrl) {
        let finalUrl;

        // Check if storeOrUrl is a direct URL (e.g., starts with http)
        if (typeof storeOrUrl === 'string' && (storeOrUrl.startsWith('http://') || storeOrUrl.startsWith('https://'))) {
            finalUrl = storeOrUrl;
            console.log('document.CTA.onClick() received a direct URL:', finalUrl);
        } else {
            // Fallback to original logic if it's a store type or undefined
            let store = storeOrUrl;
            if (store === undefined) {
                store = navigator.userAgent.toLowerCase().indexOf("android") > -1 ? "google" : "apple";
            }
            const urls = {
                "google": "{{google}}",
                "apple": "{{apple}}"
            };
            finalUrl = urls[store];
            console.log("CTA Clicked store: " + store + " link: " + finalUrl);
        }

        if (typeof mraid !== 'undefined' && mraid.open) {
            try {
                mraid.open(finalUrl);
                console.log('MRAID open() called successfully for URL:', finalUrl);
            } catch (e) {
                console.error('Error calling mraid.open():', e);
                // Fallback if mraid.open fails (e.g., not in MRAID environment)
                window.open(finalUrl, '_blank');
            }
        } else {
            console.warn('MRAID object not found or mraid.open not available. Opening URL via window.open().');
            window.open(finalUrl, '_blank');
        }
    }
};

document.XRQ = window["XMLHttp" + "Request"];

window.onload = () => {
    try {
        if (mraid && mraid.getState() === 'loading') {
            console.log('MRAID detected. Adding MRAID event listeners.');
            mraid.addEventListener('ready', mraidIsReady);
        }
    } catch (e) {
        console.error('Error during MRAID initialization:', e);
    }
}

const mraidIsReady = () => {
    mraid.addEventListener("orientationchange", () => { });

    if (typeof mraid.isViewable === 'function') {
        mraid.addEventListener("viewableChange", viewableChangeCallback);
    }
    mraid.addEventListener('exposureChange', onMraidExposureChange);
    mraid.addEventListener("audioVolumeChange", audioVolumeChangeCallback);
    mraid.removeEventListener("ready", mraidIsReady);

    document.CTA.startGame();
}

function onMraidExposureChange(exposedPercentage, coveredRectangles, boundingRect) {
    const isViewable = exposedPercentage > 0;
    viewableChangeCallback(isViewable);
}

let oldIsViewable = false;

const viewableChangeCallback = (isViewable) => {

    if (oldIsViewable === isViewable) {
        return;
    }

    if (isViewable) {
        document.CTA.unmute();
        window.isGlobalSound = true;
    } else {
        document.CTA.mute()
        window.isGlobalSound = false;
    }
    document.CTA.mute()
}

const audioVolumeChangeCallback = (volume) => {
    let isAudioEnabled = !!volume;
    if (isAudioEnabled) {
        document.CTA.unmute()
        window.isGlobalSound = true;
    } else {
        document.CTA.mute()
        window.isGlobalSound = false;
    }
}
