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

    window.addEventListener("resize", function () {
        larguraJanela = window.innerWidth;
        alturaJanela = window.innerHeight;
        leftimgicons = ((larguraJanela / 2) - left) - ((left * 2) * (contSlides - 1));
        folhascontentimgicons.style.left = leftimgicons + "px";
        tamanhoTelaSlide();
        folhascontentimgicons.style.transition = "";
        for (let i = 0; i < slidesFolhas.length; i++) {
            slidesFolhas[i].style.transition = "";
        }
    })

    //----------------------Comparar folhas de caderno-------------------------
    const iconfolhas = [document.getElementById("icontoschool"),
    document.getElementById("icondoghouse")],
        imgparaescola = document.getElementById("imgparaescola"),
        imgcasadecachorro = document.getElementById("imgcasadecachorro");
    let folhavisivel = false;
    mudaSlideFolha();
    // iconfolhas[contSlides - 1].style.border = "1px solid #d5c06b88";
    // iconfolhas[contSlides - 1].style.opacity = "1";

    compararFolhasCaderno.addEventListener("click", function () {//Visualizar a div para ver as "folhas de caderno de desenho". 
        fadeoutcontentsSlide();
        $(fundocomparafolhas).fadeIn(700);
        tamanhoTelaSlide();
    });

    fecharfolhas.addEventListener("click", function () {
        $(fundocomparafolhas).fadeOut(300);
        fadeincontentsSlide();
        voltaPrimeiroSlideFolha();
        imgparaescola.style.opacity = "0";
        imgcasadecachorro.style.opacity = "0";
        folhavisivel = false;
    });

    imgparaescola.addEventListener("click", function () {
        if (folhavisivel == false) {
            this.style.opacity = "1";
            folhavisivel = true;
        }
        else {
            this.style.opacity = "0";
            folhavisivel = false;
        }
    });

    imgcasadecachorro.addEventListener("click", function () {
        if (folhavisivel == false) {
            this.style.opacity = "1";
            folhavisivel = true;
        }
        else {
            this.style.opacity = "0";
            folhavisivel = false;
        }
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
            folhascontentimgicons.style.left = leftimgicons + "px";
            contSlides--;
            mudaSlideFolha();
        }
        else if (contSlides == 1) {
            leftimgicons = ((larguraJanela / 2) - left) - ((left * 2) * (iconfolhas.length - 1));
            folhascontentimgicons.style.left = leftimgicons + "px";
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
            slidesFolhas[contSlides - 1].style.width = "99.9%";
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
                folhavisivel = false;
            }, 350)
        }, 5)
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
    }

    //____________________________________________________________________________________________________________________

    function fadeincontentsSlide() {//Faz todas as divs que possuem conteúdo "sumirem".
        $(bttverdetalhes).fadeIn(700);
        for (let i = 0; i < contents.length; i++) {
            $(contents[i]).fadeIn(700);
        }
    }

    function fadeoutcontentsSlide() {//Faz todas as divs que possuem conteúdo "aparecerem".       
        $(bttverdetalhes).fadeOut(300);
        for (let i = 0; i < contents.length; i++) {
            $(contents[i]).fadeOut(300);
        }
    }
}

