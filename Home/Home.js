function home() {
    let larguraJanela = window.innerWidth;
    let alturaJanela = window.innerHeight;
    let topo = true;

    const topoApresentacao = document.getElementById("topoApresentacao"),
        sobreMim = document.getElementById("sobreMim"),
        imgFundos = [document.getElementById("imgFundo"),
        document.getElementById("imgFundoBlur")],
        proporcaoImgFundo = 16 / 9,
        txt1 = document.getElementById("txt1"),
        txt2 = document.getElementById("txt2"),
        txt3 = document.getElementById("txt3"),
        txt4 = document.getElementById("txt4"),
        bttSobreMim = document.getElementById("bttSobreMim");;

    centralizaFundo();
    topoApresentacao.style.display = "block";
    sobreMim.style.display = "block";
    setTimeout(carregamento, 1200);
    
    window.addEventListener("resize", function () {
        larguraJanela = window.innerWidth;
        alturaJanela = window.innerHeight;
        centralizaFundo();
        if(topo === false){
            $("html, body").animate({ scrollTop: alturaJanela }, 0);
        }
    });

    document.addEventListener("scroll", throttle(function () {
        if (scrollposicao > alturaJanela / 2) {
            imgFundos[1].style.opacity = "1";
            imgFundos[0].style.opacity = "0.75";
            topo = false;
        }
        else {
            imgFundos[1].style.opacity = "0";
            imgFundos[0].style.opacity = "0.55";
            topo = true;
        }
    }, 120, true));

    logoBlack.addEventListener("click", function () {
        if (scrollposicao > 3) {
            $("html, body").animate({ scrollTop: 0 }, 900);
        }
        else {
            window.location.href = "index.html";
        }
    });

    bttSobreMim.addEventListener("click", function () {
        $("html, body").animate({ scrollTop: alturaJanela }, 900);
    })

    function carregamento() {
        txt1.style.opacity = "1";
        setTimeout(function () {
            txt2.style.opacity = "1";
            txt2.style.marginLeft = "8px";
            setTimeout(function () {
                txt3.style.opacity = "1";
                setTimeout(function () {
                    txt3.style.borderBottom = "2px solid rgba(255, 255, 255, 0.302)";
                    setTimeout(function () {
                        txt4.style.opacity = "1";
                        bttSobreMim.style.display = "block";
                        setTimeout(function () {
                            bttSobreMim.style.opacity = "1";
                        }, 800);
                    }, 1500);
                }, 500);
            }, 1100);
        }, 1000);
    }

    function centralizaFundo() {
        topoApresentacao.style.height = alturaJanela + "px";
        sobreMim.style.height = topoApresentacao.style.height;
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