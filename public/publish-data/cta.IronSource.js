let inited = false;
document.XRQ = window["XMLHttp" + "Request"];
document.CTA = {
    onClick: function () {
        dapi.openStoreUrl();
        window.console.log("CTA Clicked");
    },
    platform: "mraid3"
};
function startGame() {
    if (document.CTA.startGame) {
        document.CTA.startGame();
        inited = true;
    }
}

function mute() {
    if (document.CTA.mute)
        document.CTA.mute();
}

function unmute() {
    if (document.CTA.unmute)
        document.CTA.unmute();
}

function viewableChangeCallback(e) {
    e.isViewable ? this.startGame() : pause(); //start the game or resume
}

//app - класс плейбла
// методы:
// init()
// mute()
// unmute()
// флаг inited
window.onload = function () {
    var isAudioEnabled = false;
    mraid.addEventListener("audioVolumeChange", audioVolumeChangeCallback);

    function init() {
        startGame();//запускаем плейбл
        volumeGame();
    }

    function isReady() {
        if (mraid.isViewable()) {
            init();
        } else {
            mraid.addEventListener('viewableChange', function (viewable) {
                if (viewable) {
                    mraid.removeEventListener('viewableChange', arguments.callee);
                    init();
                }
            });
        }
    }

    if (mraid.getState() === 'loading') {
        mraid.addEventListener('ready', isReady);
    } else {
        isReady();
    }

    function audioVolumeChangeCallback(volume) {
        isAudioEnabled = !!volume;
        volumeGame();
    }

    function volumeGame() {
        if (!inited) return;
        try {
            if (isAudioEnabled) {
                unmute();
            } else {
                mute();
            }
        } catch (e) {
        }
    }
}