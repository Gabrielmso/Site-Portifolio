function home() {
    let larguraJanela = window.innerWidth;
    let alturaJanela = window.innerHeight;

    const topoApresentacao = document.getElementById("topoApresentacao"),
        imgFundos = [document.getElementById("imgFundo"),
        document.getElementById("imgFundoBlur")],
        proporcaoImgFundo = 16/9;

    centralizaFundo();

    window.addEventListener("resize", function () {
        larguraJanela = window.innerWidth;
        alturaJanela = window.innerHeight;
        centralizaFundo();
    });

    document.addEventListener("scroll", throttle(function () {
        if (scrollposicao > 50) {
            imgFundos[1].style.opacity = "1";
        }
        else {
            imgFundos[1].style.opacity = "0";
        }
    }, 120, true));

    logoBlack.addEventListener("click", function () {
        if (scrollposicao > 3) {
            $("html, body").animate({ scrollTop: 0 }, 700);
        }
        else {
            window.location.href = "index.html";
        }
    });

    function centralizaFundo() {
        topoApresentacao.style.height = alturaJanela + "px";
        let proporcaoJanela = larguraJanela / alturaJanela;
        if (proporcaoJanela <= proporcaoImgFundo) {
            let novaLargura = alturaJanela * proporcaoImgFundo;
            let backgroundSize = novaLargura + "px " + alturaJanela + "px";
            let backgroundPositionY = "0px";
            let backgroundPositionX = -((novaLargura / 2) - (larguraJanela / 2)) + "px";
            for (let i = 0; i < imgFundos.length; i++) {
                imgFundos[i].style.backgroundSize = backgroundSize;
                imgFundos[i].style.backgroundPositionY = backgroundPositionY;
                imgFundos[i].style.backgroundPositionX = backgroundPositionX;
            }
        }
        else {
            let novaAltura = larguraJanela / proporcaoImgFundo;
            let backgroundSize = larguraJanela + "px " + novaAltura + "px";
            let backgroundPositionX = "0px";
            let backgroundPositionY = -((novaAltura / 2) - (alturaJanela / 2)) + "px";
            for (let i = 0; i < imgFundos.length; i++) {
                imgFundos[i].style.backgroundSize = backgroundSize;
                imgFundos[i].style.backgroundPositionY = backgroundPositionY;
                imgFundos[i].style.backgroundPositionX = backgroundPositionX;
            }
        }
    }
}