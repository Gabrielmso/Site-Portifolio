function slideCarosel() {
    let larguraJanela = window.innerWidth;
    let alturaJanela = window.innerHeight;

    const contents = document.getElementsByClassName("content"),
        bttverdetalhes = document.getElementById("bttverdetalhes"),
        compararFolhasCaderno = document.getElementById("compararFolhasCaderno"),
        telaslide = document.getElementsByClassName("telaslide"),
        slides = document.getElementsByClassName("slides"),
        fundocomparafolhas = document.getElementById("fundocomparafolhas"),
        folhascontentimgicons = document.getElementById("folhascontentimgicons"),
        folhasbtnLeft = document.getElementById("folhasbtnLeft"),
        folhasbtnRight = document.getElementById("folhasbtnRight"),
        fecharfolhas = document.getElementById("fecharfolhas"),
        slidesFolhas = [document.getElementById("imgtoschool"),
        document.getElementById("imgdoghouse")];

    const proporcao4por3 = (4 / 3),
        left = ((70 * 4 / 3) / 2);

    let contSlides = 1;
    let leftimgicons = (larguraJanela / 2) - left;

    folhascontentimgicons.style.left = leftimgicons + "px";
    //_________________________________________Comparar folhas de caderno_______________________________________________

    const iconfolhas = [document.getElementById("icontoschool"),
    document.getElementById("icondoghouse")],
        imgparaescola = document.getElementById("imgparaescola"),
        imgcasadecachorro = document.getElementById("imgcasadecachorro");
    let folhavisivel = false;
    mudaSlideFolha();

    compararFolhasCaderno.addEventListener("click", function () {//Visualizar a div para ver as "folhas de caderno de desenho". 
        fadeoutcontentsSlide();
        $(fundocomparafolhas).fadeIn(700);
        tamanhoTelaSlide();
        document.addEventListener("keydown", funcoesSlideImgTeclado);
    });

    fecharfolhas.addEventListener("click", function () {
        $(fundocomparafolhas).fadeOut(300);
        fadeincontentsSlide();
        voltaPrimeiroSlideFolha();
        imgparaescola.style.opacity = "0";
        imgcasadecachorro.style.opacity = "0";
        folhavisivel = false;
        document.removeEventListener("keydown", funcoesSlideImgTeclado);
        document.addEventListener("keydown", abrirFundosComparacao);
    });

    imgparaescola.addEventListener("click", function () {
        clickComparaImagens(this);
    });

    imgcasadecachorro.addEventListener("click", function () {
        clickComparaImagens(this);
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
        else if (contSlides == 1) {
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
        else if (contSlides == iconfolhas.length) {
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
                imgparaescola.style.opacity = "0";
                imgcasadecachorro.style.opacity = "0";
                folhasbtnLeft.addEventListener("click", voltaFolha);
                folhasbtnRight.addEventListener("click", avancaFolha);
                folhavisivel = false;
            }, 350)
        }, 5)
    };
    //__________________________________________Comparar Mapa da escola____________________________________________

    const compararescola = document.getElementById("compararEscola"),
        fundomapaescola = document.getElementById("fundomapaescola"),
        fecharfundoescola = document.getElementById("fecharfundoescola"),
        escolacontentimgicons = document.getElementById("escolacontentimgicons"),
        mapaescolabtnLeft = document.getElementById("mapaescolabtnLeft"),
        mapaescolabtnRight = document.getElementById("mapaescolabtnRight"),
        imgescolap = document.getElementById("imgescolap"),
        imgescola1a = document.getElementById("imgescola1a"),
        imgescola2a = document.getElementById("imgescola2a"),
        imgescolat = document.getElementById("imgescolat");

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
        fadeoutcontentsSlide();
        $(fundomapaescola).fadeIn(700);
        tamanhoTelaSlide();
        document.addEventListener("keydown", funcoesSlideImgTeclado);
    });

    fecharfundoescola.addEventListener("click", function () {//Fechar a div para comparar o mapa de Escola.
        $(fundomapaescola).fadeOut(300);
        fadeincontentsSlide();
        folhavisivel = false;
        voltaPrimeiroSlideMapaEscola();
        document.removeEventListener("keydown", funcoesSlideImgTeclado);
        document.addEventListener("keydown", abrirFundosComparacao);
    });

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

    imgescolap.addEventListener("click", function () {
        clickComparaImagens(this);
    });

    imgescola1a.addEventListener("click", function () {
        clickComparaImagens(this);
    });

    imgescola2a.addEventListener("click", function () {
        clickComparaImagens(this);
    });

    imgescolat.addEventListener("click", function () {
        clickComparaImagens(this);
    });

    function voltaMapaEscola() {
        if (contSlides > 1) {
            leftimgicons = leftimgicons + left * 2;
            contSlides--;
            mudaSlideMapaEscola();
        }
        else if (contSlides == 1) {
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
        else if (contSlides == iconMapaEscola.length) {
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
                imgescolap.style.opacity = "0";
                imgescola1a.style.opacity = "0";
                imgescola2a.style.opacity = "0";
                imgescolat.style.opacity = "0";
                folhavisivel = false;
            }, 350)
        }, 5)
    };
    //____________________________________________________________________________________________________________________

    function clickComparaImagens(element) {
        if (folhavisivel == false) {
            element.style.opacity = "1";
            folhavisivel = true;
        }
        else {
            element.style.opacity = "0";
            folhavisivel = false;
        }
    }

    function tamanhoTelaSlide() {
        for (let i = 0; i < telaslide.length; i++) {
            telaslide[i].style.height = (alturaJanela - 72) + "px";
        }

        for (let i = 0; i < slides.length; i++) {
            if ((telaslide[i].offsetWidth / telaslide[i].offsetHeight) > proporcao4por3) {
                slides[i].style.height = "97%";
                slides[i].style.width = slides[i].offsetHeight * proporcao4por3 + "px";
            }
            else {
                slides[i].style.width = "100%";
                slides[i].style.height = slides[i].offsetWidth / proporcao4por3 + "px";
            }
        }
    };

    function fadeincontentsSlide() {//Faz todas as divs que possuem conteúdo "sumirem".
        $(bttverdetalhes).fadeIn(700);
        for (let i = 0; i < contents.length; i++) {
            $(contents[i]).fadeIn(700);
        }
    };

    function fadeoutcontentsSlide() {//Faz todas as divs que possuem conteúdo "aparecerem".       
        $(bttverdetalhes).fadeOut(300);
        for (let i = 0; i < contents.length; i++) {
            $(contents[i]).fadeOut(300);
        }
    };

    function funcoesSlideImgTeclado(e) {
        switch (e.code) {
            case code = "Space":
                if (fundocomparafolhas.style.display == "block") {
                    if (contSlides == 1) {
                        imgparaescola.click();
                    }
                    else if (contSlides == 2) {
                        imgcasadecachorro.click();
                    }
                }
                else if (fundomapaescola.style.display == "block") {
                    if (contSlides == 1) {
                        imgescolap.click();
                    }
                    else if (contSlides == 2) {
                        imgescola1a.click();
                    }
                    else if (contSlides == 3) {
                        imgescola2a.click();
                    }
                    else if (contSlides == 4) {
                        imgescolat.click();
                    }
                }
                break;

            case code = "ArrowRight":
                if (fundocomparafolhas.style.display == "block") {
                    folhasbtnRight.click();
                }
                else if (fundomapaescola.style.display == "block") {
                    mapaescolabtnRight.click();
                }
                break;

            case code = "KeyA":
                if (fundocomparafolhas.style.display == "block") {
                    folhasbtnRight.click();
                }
                else if (fundomapaescola.style.display == "block") {
                    mapaescolabtnRight.click();
                }
                break;

            case code = "ArrowLeft":
                if (fundocomparafolhas.style.display == "block") {
                    folhasbtnLeft.click();
                }
                else if (fundomapaescola.style.display == "block") {
                    mapaescolabtnLeft.click();
                }
                break;

            case code = "KeyD":
                if (fundocomparafolhas.style.display == "block") {
                    folhasbtnLeft.click();
                }
                else if (fundomapaescola.style.display == "block") {
                    mapaescolabtnLeft.click();
                }
                break;

            case code = "Escape":
                if (fundocomparafolhas.style.display == "block") {
                    fecharfolhas.click();
                }
                else if (fundomapaescola.style.display == "block") {
                    fecharfundoescola.click();
                }
                break;
        }
    }

    window.addEventListener("resize", function () {
        larguraJanela = window.innerWidth;
        alturaJanela = window.innerHeight;
        leftimgicons = ((larguraJanela / 2) - left) - ((left * 2) * (contSlides - 1));
        folhascontentimgicons.style.left = leftimgicons + "px";
        escolacontentimgicons.style.left = leftimgicons + "px";
        tamanhoTelaSlide();
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

