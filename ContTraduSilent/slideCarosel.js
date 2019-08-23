function slideCarosel() {
    let larguraJanela = window.innerWidth;

    const compararFolhasCaderno = document.getElementById("compararFolhasCaderno"),
        fundocomparafolhas = document.getElementById("fundocomparafolhas"),
        folhascontentimgicons = document.getElementById("folhascontentimgicons"),
        folhasbtnLeft = document.getElementById("folhasbtnLeft"),
        folhasbtnRight = document.getElementById("folhasbtnRight"),
        fecharfolhas = document.getElementById("fecharfolhas"),
        slidesFolhas = [document.getElementById("imgtoschool"),
        document.getElementById("imgdoghouse")],
        left = ((70 * 4 / 3) / 2);

    let contSlides = 1;
    let leftimgicons = (larguraJanela / 2) - left;

    folhascontentimgicons.style.left = leftimgicons + "px";
    //_________________________________________Comparar folhas de caderno_______________________________________________

    const iconfolhas = [document.getElementById("icontoschool"),
    document.getElementById("icondoghouse")];

    mudaSlideFolha();

    compararFolhasCaderno.addEventListener("click", function () {//Visualizar a div para ver as "folhas de caderno de desenho". 
        $(fundocomparafolhas).fadeIn(700);
        clickSlideComparar();
    });

    fecharfolhas.addEventListener("click", function () {
        $(fundocomparafolhas).fadeOut(300);
        clickFecharComparacaoSlide();
        voltaPrimeiroSlideFolha();
    });

    folhasbtnLeft.addEventListener("click", voltaFolha);
    folhasbtnRight.addEventListener("click", avancaFolha);

    iconfolhas[0].addEventListener("click", voltaPrimeiroSlideFolha);
    function voltaPrimeiroSlideFolha() {
        leftimgicons = ((larguraJanela / 2) - left) - ((left * 2) * (0));
        contSlides = 1;
        mudaSlideFolha();
    }

    iconfolhas[1].addEventListener("click", function () {
        leftimgicons = ((larguraJanela / 2) - left) - ((left * 2) * (1));
        contSlides = 2;
        mudaSlideFolha();
    });

    function voltaFolha() {
        if (contSlides > 1) {
            leftimgicons = leftimgicons + left * 2;
            contSlides--;
            mudaSlideFolha();
        }
        else if (contSlides === 1) {
            leftimgicons = ((larguraJanela / 2) - left) - ((left * 2) * (iconfolhas.length - 1));
            contSlides = iconfolhas.length;
            mudaSlideFolha();
        }
    };

    function avancaFolha() {
        if (contSlides < iconfolhas.length) {
            leftimgicons = leftimgicons - left * 2;
            contSlides++;
            mudaSlideFolha();
        }
        else if (contSlides === iconfolhas.length) {
            leftimgicons = (larguraJanela / 2) - left;
            contSlides = 1;
            mudaSlideFolha();
        }
    };

    function mudaSlideFolha() {
        folhasbtnLeft.removeEventListener("click", voltaFolha);
        folhasbtnRight.removeEventListener("click", avancaFolha);
        folhascontentimgicons.style.transition = "left 350ms ease-in-out";
        for (let i = 0; i < slidesFolhas.length; i++) {
            slidesFolhas[i].style.transition = "width 350ms ease-in-out";
        }
        setTimeout(function () {
            for (let i = 0; i < slidesFolhas.length; i++) {
                if (i != (contSlides - 1)) {
                    slidesFolhas[i].style.width = "0%";
                }
            }
            slidesFolhas[contSlides - 1].style.width = "100%";
            folhascontentimgicons.style.left = leftimgicons + "px";
            iconfolhas[contSlides - 1].style.border = "1px solid rgba(213, 192, 107, 0.555)";
            setTimeout(function () {
                iconfolhas[contSlides - 1].style.opacity = "1";
                for (let i = 0; i < iconfolhas.length; i++) {
                    if (i != contSlides - 1) {
                        iconfolhas[i].style.border = "";
                        iconfolhas[i].style.opacity = "";
                    }
                }
                folhasbtnLeft.addEventListener("click", voltaFolha);
                folhasbtnRight.addEventListener("click", avancaFolha);
                for (let i = 0; i < imgsComparacao.length; i++) {
                    imgsComparacao[i].style.opacity = "0";
                }
                imgvisivel = false;  
            }, 350)
        }, 5)
    };
    //__________________________________________Comparar Mapa da escola____________________________________________

    const compararescola = document.getElementById("compararEscola"),
        fundomapaescola = document.getElementById("fundomapaescola"),
        fecharfundoescola = document.getElementById("fecharfundoescola"),
        escolacontentimgicons = document.getElementById("escolacontentimgicons"),
        mapaescolabtnLeft = document.getElementById("mapaescolabtnLeft"),
        mapaescolabtnRight = document.getElementById("mapaescolabtnRight");

    const iconMapaEscola = [document.getElementById("iconmapaescolap"),
    document.getElementById("iconmapaescola1a"),
    document.getElementById("iconmapaescola2a"),
    document.getElementById("iconmapaescolat")];

    const slidesMapaEscola = [document.getElementById("imgschoolp"),
    document.getElementById("imgschool1a"),
    document.getElementById("imgschool2a"),
    document.getElementById("imgschoolt")];

    escolacontentimgicons.style.left = leftimgicons + "px";

    mudaSlideMapaEscola();

    compararescola.addEventListener("click", function () {//Visualizar a div para comparar o mapa de Escola.
        $(fundomapaescola).fadeIn(700);
        clickSlideComparar();
    });

    fecharfundoescola.addEventListener("click", function () {//Fechar a div para comparar o mapa de Escola.
        $(fundomapaescola).fadeOut(300);        
        voltaPrimeiroSlideMapaEscola();       
        clickFecharComparacaoSlide();
    });

    function clickSlideComparar() {//O que acontece quando o usuário clica em alguma imagem para comparar as edições.
        document.removeEventListener("keydown", abrirFundosComparacao);
        setTimeout(function () {
            document.addEventListener("keydown", funcoesSlideImgTeclado);
        }, 600);
    }

    function clickFecharComparacaoSlide() {//O que acontece quando o usuário "fecha" alguma div de comparação.
        folhavisivel = false;
        document.removeEventListener("keydown", funcoesSlideImgTeclado);
        setTimeout(function () {
            document.addEventListener("keydown", abrirFundosComparacao);
        }, 310);
    }

    mapaescolabtnLeft.addEventListener("click", voltaMapaEscola);
    mapaescolabtnRight.addEventListener("click", avancaMapaEscola);

    iconMapaEscola[0].addEventListener("click", voltaPrimeiroSlideMapaEscola);
    function voltaPrimeiroSlideMapaEscola() {
        leftimgicons = ((larguraJanela / 2) - left) - ((left * 2) * (0));
        contSlides = 1;
        mudaSlideMapaEscola();
    };

    iconMapaEscola[1].addEventListener("click", function () {
        leftimgicons = ((larguraJanela / 2) - left) - ((left * 2) * (1));
        contSlides = 2;
        mudaSlideMapaEscola();
    });

    iconMapaEscola[2].addEventListener("click", function () {
        leftimgicons = ((larguraJanela / 2) - left) - ((left * 2) * (2));
        contSlides = 3;
        mudaSlideMapaEscola();
    });

    iconMapaEscola[3].addEventListener("click", function () {
        leftimgicons = ((larguraJanela / 2) - left) - ((left * 2) * (3));
        contSlides = 4;
        mudaSlideMapaEscola();
    });

    function voltaMapaEscola() {
        if (contSlides > 1) {
            leftimgicons = leftimgicons + left * 2;
            contSlides--;
            mudaSlideMapaEscola();
        }
        else if (contSlides === 1) {
            leftimgicons = ((larguraJanela / 2) - left) - ((left * 2) * (iconMapaEscola.length - 1));
            contSlides = iconMapaEscola.length;
            mudaSlideMapaEscola();
        }
    };

    function avancaMapaEscola() {
        if (contSlides < iconMapaEscola.length) {
            leftimgicons = leftimgicons - left * 2;
            contSlides++;
            mudaSlideMapaEscola();
        }
        else if (contSlides === iconMapaEscola.length) {
            leftimgicons = (larguraJanela / 2) - left;
            contSlides = 1;
            mudaSlideMapaEscola();
        }
    };

    function mudaSlideMapaEscola() {
        mapaescolabtnLeft.removeEventListener("click", voltaMapaEscola);
        mapaescolabtnRight.removeEventListener("click", avancaMapaEscola);
        escolacontentimgicons.style.transition = "left 350ms ease-in-out";
        for (let i = 0; i < slidesMapaEscola.length; i++) {
            slidesMapaEscola[i].style.transition = "width 350ms ease-in-out";
        }
        setTimeout(function () {
            for (let i = 0; i < slidesMapaEscola.length; i++) {
                if (i != (contSlides - 1)) {
                    slidesMapaEscola[i].style.width = "0%";
                }
            }
            slidesMapaEscola[contSlides - 1].style.width = "100%";
            escolacontentimgicons.style.left = leftimgicons + "px";
            iconMapaEscola[contSlides - 1].style.border = "1px solid rgba(213, 192, 107, 0.555)";
            setTimeout(function () {
                iconMapaEscola[contSlides - 1].style.opacity = "1";
                for (let i = 0; i < iconMapaEscola.length; i++) {
                    if (i != contSlides - 1) {
                        iconMapaEscola[i].style.border = "";
                        iconMapaEscola[i].style.opacity = "";
                    }
                }
                mapaescolabtnLeft.addEventListener("click", voltaMapaEscola);
                mapaescolabtnRight.addEventListener("click", avancaMapaEscola);
                for (let i = 0; i < imgsComparacao.length; i++) {
                    imgsComparacao[i].style.opacity = "0";
                }
                imgvisivel = false;
            }, 350)
        }, 5)
    };
    //____________________________________________________________________________________________________________________

    function funcoesSlideImgTeclado(e) {
        switch (e.code) {
            case code = "Space":
                if (fundocomparafolhas.style.display === "block") {
                    if (contSlides === 1) {
                        imgsComparacao[2].click();
                    }
                    else if (contSlides === 2) {
                        imgsComparacao[3].click();
                    }
                }
                else if (fundomapaescola.style.display === "block") {
                    if (contSlides === 1) {
                        imgsComparacao[5].click();
                    }
                    else if (contSlides === 2) {
                        imgsComparacao[6].click();
                    }
                    else if (contSlides === 3) {
                        imgsComparacao[7].click();
                    }
                    else if (contSlides === 4) {
                        imgsComparacao[8].click();
                    }
                }
                break;

            case code = "ArrowRight":
                if (fundocomparafolhas.style.display === "block") {
                    folhasbtnRight.click();
                }
                else if (fundomapaescola.style.display === "block") {
                    mapaescolabtnRight.click();
                }
                break;

            case code = "KeyD":
                if (fundocomparafolhas.style.display === "block") {
                    folhasbtnRight.click();
                }
                else if (fundomapaescola.style.display === "block") {
                    mapaescolabtnRight.click();
                }
                break;

            case code = "ArrowLeft":
                if (fundocomparafolhas.style.display === "block") {
                    folhasbtnLeft.click();
                }
                else if (fundomapaescola.style.display === "block") {
                    mapaescolabtnLeft.click();
                }
                break;

            case code = "KeyA":
                if (fundocomparafolhas.style.display === "block") {
                    folhasbtnLeft.click();
                }
                else if (fundomapaescola.style.display === "block") {
                    mapaescolabtnLeft.click();
                }
                break;

            case code = "Escape":
                if (fundocomparafolhas.style.display === "block") {
                    fecharfolhas.click();
                }
                else if (fundomapaescola.style.display === "block") {
                    fecharfundoescola.click();
                }
                break;
        }
    }

    window.addEventListener("resize", function () {
        larguraJanela = window.innerWidth;
        leftimgicons = ((larguraJanela / 2) - left) - ((left * 2) * (contSlides - 1));
        folhascontentimgicons.style.left = leftimgicons + "px";
        escolacontentimgicons.style.left = leftimgicons + "px";
        folhascontentimgicons.style.transition = "";
        escolacontentimgicons.style.transition = "";
        for (let i = 0; i < slidesFolhas.length; i++) {
            slidesFolhas[i].style.transition = "";
        }
        for (let i = 0; i < slidesMapaEscola.length; i++) {
            slidesMapaEscola[i].style.transition = "";
        }
    });
}