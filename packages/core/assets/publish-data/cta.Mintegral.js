console.log('%c  %c  %c Playable Ad Tools v1.7 ', 'background:#e63946;padding:3px 0', 'background:#457b9d;padding:3px 0', 'color:#fff;background:#1d3557;padding:3px 6px');
document.CTA = {
    platform: "Mintegral",
    sdk: "Mintegral",
    analytics: { trackEvent: function(name) {} },
    onClick: function (store) {
        window.install && window.install();
    },

    gameEnd: function () {
        window.gameEnd && window.gameEnd();
    },

    gameReady: function () {
        window.gameReady && window.gameReady();
    }

};

window.addEventListener('load', (event) => {
    window.gameReady && window.gameReady();
});

function gameStart() {
    console.log("Game started");
}

function gameClose() {
    console.log("Game closed");
}