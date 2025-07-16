document.CTA = {
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