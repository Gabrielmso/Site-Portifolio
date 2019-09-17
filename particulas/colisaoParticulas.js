function colisaoParticulas(arguments) {
    const fundo = document.getElementById("fundo");
    ajustarFundo();
    window.addEventListener("resize", ajustarFundo);
    function ajustarFundo() {
        let largurajanela = window.innerWidth;
        let alturajanela = window.innerHeight;
        let proporcao = largurajanela / alturajanela;
        if (proporcao <= 1) {
            let backgroundsize = alturajanela + "px " + alturajanela + "px";
            let backgroundpositionx = -1 * ((alturajanela / 2) - (largurajanela / 2)) + "px";
            let backgroundpositiony = "0px";
            fundo.style.backgroundSize = backgroundsize;
            fundo.style.backgroundPositionX = backgroundpositionx;
            fundo.style.backgroundPositionY = backgroundpositiony;
        }
        else {
            let backgroundsize = largurajanela + "px " + largurajanela + "px";
            let backgroundpositionx = "0px";
            let backgroundpositiony = -1 * ((largurajanela / 2) - (alturajanela / 2)) + "px";
            fundo.style.backgroundSize = backgroundsize;
            fundo.style.backgroundPositionX = backgroundpositionx;
            fundo.style.backgroundPositionY = backgroundpositiony;
        }
    }
}