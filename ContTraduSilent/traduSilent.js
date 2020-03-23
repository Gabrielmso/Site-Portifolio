const proporcao4por3 = 4 / 3;
let numSlide = 0, contSlideCarrosel = 0, fundoComparacaoAberto = false, mouseTexto, imgVisivel = false, mudarCarrosel = true;
function traduSilent() {
    const titulo = document.getElementById("titulo"), info = document.getElementById("info"),
        traprogress = document.getElementById("traprogress"), textos = document.getElementsByClassName("texto"),
        bttverdetalhes = document.getElementById("bttverdetalhes"), telaSlideCarrosel = document.getElementsByClassName("telaslide"),
        imgTrad = document.getElementsByClassName("imgtrad"), slides = document.getElementsByClassName("slides"),
        tempoTransicao = 700, styletransicao = "height " + tempoTransicao + "ms ease-in-out";//Armazena a configuração da transição dos slides.
    let larguraJanela = window.innerWidth;
    let alturaJanela = window.innerHeight;
    const sessao = [
        { slide: document.getElementById("sessao1") },
        {
            slide: document.getElementById("sessao2"), comparacao: {
                abre: document.getElementById("compararthereareviolent"),
                fecha: document.getElementById("fecharfundo1"),
                fundo: document.getElementById("fundocomparacao"),
                imagem: { container: document.getElementById("imgviolentasorig") }
            }, visualizacao: {
                abre1: document.getElementById("imgverjap"),
                abre2: document.getElementById("imgverlimp"),
                fecha: document.getElementById("imgjap"),
                fundo: document.getElementById("fundoverjapelimp")
            }
        },
        {
            slide: document.getElementById("sessao3"), comparacao: {
                abre: document.getElementById("omedodesangue"),
                fecha: document.getElementById("fecharcomparacg"),
                fundo: document.getElementById("fundocomparacg"),
                imagem: {
                    container: document.getElementById("fecharcomparacg"),
                    cgHorizontal: document.getElementById("gifcgintrohori"),
                    cgVertical: document.getElementById("gifcgintrovert")
                }
            }
        },
        {
            slide: document.getElementById("sessao4"), comparacao: {
                abre: document.getElementById("compararMapaAntigaSilent"),
                fecha: document.getElementById("fecharantigasilenthill"),
                fundo: document.getElementById("fundoantigasilenthill"),
                imagem: { container: document.getElementById("imgoldsilenthill") }
            }
        },
        {
            slide: document.getElementById("sessao5"), comparacao: {
                abre: document.getElementById("compararFolhasCaderno"),
                fecha: document.getElementById("fecharfolhas"),
                fundo: document.getElementById("fundocomparafolhas"),
                carrosel: {
                    slides: [document.getElementById("imgtoschool"),
                    document.getElementById("imgdoghouse")],
                    icones: [document.getElementById("icontoschool"),
                    document.getElementById("icondoghouse")],
                    contentIcons: document.getElementById("folhascontentimgicons"),
                    bttEsquerda: document.getElementById("folhasbtnLeft"),
                    bttDireita: document.getElementById("folhasbtnRight"),
                }
            }
        },
        {
            slide: document.getElementById("sessao6"), comparacao: {
                abre: document.getElementById("compararChavesEclipse"),
                fecha: document.getElementById("fecharchavesparaoeclipse"),
                fundo: document.getElementById("fundochavesparaoeclipse"),
                imagem: { container: document.getElementById("imgkeysforeclipse") }
            }
        },
        {
            slide: document.getElementById("sessao7"), comparacao: {
                abre: document.getElementById("compararEscola"),
                fecha: document.getElementById("fecharfundoescola"),
                fundo: document.getElementById("fundomapaescola"),
                carrosel: {
                    slides: [document.getElementById("imgschoolp"),
                    document.getElementById("imgschool1a"),
                    document.getElementById("imgschool2a"),
                    document.getElementById("imgschoolt")],
                    icones: [document.getElementById("iconmapaescolap"),
                    document.getElementById("iconmapaescola1a"),
                    document.getElementById("iconmapaescola2a"),
                    document.getElementById("iconmapaescolat")],
                    contentIcons: document.getElementById("escolacontentimgicons"),
                    bttEsquerda: document.getElementById("mapaescolabtnLeft"),
                    bttDireita: document.getElementById("mapaescolabtnRight"),
                }
            }
        },
    ];

    window.addEventListener("resize", function () {
        larguraJanela = window.innerWidth;
        alturaJanela = window.innerHeight;
        if (larguraJanela <= 650) { traprogress.style.marginTop = "13px"; }
        else { traprogress.style.marginTop = "0px"; }
        ajustarElementos();
        ajustarimgscomparacao();
        ajustarBlurFundo();
        mudarMenu();
    });

    logoBlack.addEventListener("click", function () {
        if (numSlide > 0) { voltaPrimeiroSlide(); }
        else { window.location.href = "index.html"; }
    });

    info.addEventListener("mouseenter", () => mouseTexto = true);
    traprogress.addEventListener("mouseenter", () => mouseTexto = true);
    info.addEventListener("mouseleave", () => mouseTexto = false);
    traprogress.addEventListener("mouseleave", () => mouseTexto = false);
    for (let i = 0; i < textos.length; i++) {
        textos[i].addEventListener("mouseenter", () => mouseTexto = true);
        textos[i].addEventListener("mouseleave", () => mouseTexto = false);
    }

    for (let i = 0; i < imgTrad.length; i++) { imgTrad[i].addEventListener("mousedown", compararImagens); }

    for (let i = 0; i < sessao.length; i++) {
        if (sessao[i].comparacao) {
            const comparacao = sessao[i].comparacao;
            comparacao.abre.addEventListener("click", () => {
                fundoFadeIn(sessao[i].comparacao.fundo);
            })
            comparacao.fecha.addEventListener("click", () => {
                if (fundoComparacaoAberto === false) { return; }
                contSlideCarrosel = 0;
                imgVisivel = false;
                fundoFadeOut(sessao[i].comparacao.fundo);
            })
            if (comparacao.carrosel) {
                for (let e = 0; e < comparacao.carrosel.icones.length; e++) {
                    comparacao.carrosel.icones[e].addEventListener("mousedown", () => {
                        if (mudarCarrosel === false) { return; }
                        contSlideCarrosel = e;
                        mudarSlideCarrosel(e, i);
                    });
                }
                comparacao.carrosel.bttEsquerda.addEventListener("mousedown", () => {
                    if (mudarCarrosel === false) { return; }
                    if (contSlideCarrosel === 0) { contSlideCarrosel = comparacao.carrosel.icones.length - 1; }
                    else { contSlideCarrosel--; }
                    mudarSlideCarrosel(contSlideCarrosel, i);
                });
                comparacao.carrosel.bttDireita.addEventListener("mousedown", () => {
                    if (mudarCarrosel === false) { return; }
                    if (contSlideCarrosel === comparacao.carrosel.icones.length - 1) { contSlideCarrosel = 0; }
                    else { contSlideCarrosel++; }
                    mudarSlideCarrosel(contSlideCarrosel, i);
                });
                mudarSlideCarrosel(0, i);
            }
        }
    }

    sessao[1].visualizacao.abre1.addEventListener("click", () => {
        imglimp.style.opacity = "0";
        fundoFadeIn(sessao[1].visualizacao.fundo);
    });

    sessao[1].visualizacao.abre2.addEventListener("click", () => {
        imglimp.style.opacity = "1";
        fundoFadeIn(sessao[1].visualizacao.fundo);
    });

    sessao[1].visualizacao.fecha.addEventListener("click", () => fundoFadeOut(sessao[1].visualizacao.fundo));

    function fundoFadeIn(content) {
        const tempo = 650;
        content.style.display = "block";
        content.style.transition = "opacity " + tempo + "ms ease-in-out";
        setTimeout(() => {
            content.style.opacity = "1";
            setTimeout(() => {
                fundoComparacaoAberto = true;
                content.style.transition = "opacity " + tempo / 2 + "ms ease-in-out";;
            }, tempo);
        }, 16);
    }

    function fundoFadeOut(content) {
        content.style.opacity = "0";
        fundoComparacaoAberto = false;
        setTimeout(() => {
            content.style.display = "none";
            for (let i = 0; i < imgTrad.length; i++) { imgTrad[i].style.opacity = "0"; }
            for (let i = 0; i < sessao.length; i++) {
                if (sessao[i].comparacao && sessao[i].comparacao.carrosel) { mudarSlideCarrosel(0, i); }
            }
        }, 330);
    }

    function carregamento() {//Faz os elementos do primeiro "slide" aparecerem e após isso permite trocar de slide.
        document.getElementById("conteudoSlide1").style.opacity = "1";
        ajustarBlurFundo();
        info.style.display = "block";
        traprogress.style.display = "block";
        tmp = setInterval(brilhotitulo, 1500);
        setTimeout(() => {//Fazer a "traprogress" e a "info" aparecerem.
            traprogress.style.opacity = "1";
            if (larguraJanela <= 650) { traprogress.style.marginTop = "13px"; }
            else { traprogress.style.marginTop = "0px"; }
            info.style.opacity = "1";
            info.style.marginTop = "0px";
            bttdownload.style.display = "block";
            setTimeout(() => {
                traprogress.style.webkitTransition = "none";
                traprogress.style.trasition = "none";
                info.style.webkitTransition = "none";
                info.style.trasition = "none";
            }, 600);
            setTimeout(() => {//Fazer o "bttdownload" aparecer.
                document.getElementById("espacoparticulas").style.opacity = "1";
                particulas();
                bttdownload.style.opacity = "1";
                bttverdetalhes.style.display = "block";
                setTimeout(() => {//Fazer o "bttverdetalhes" aparecer.
                    bttverdetalhes.style.opacity = "1";
                    bttverdetalhes.addEventListener("click", mudarslidebttverdetalhes);
                    document.addEventListener("wheel", mudarSlideScroll);
                }, 1000);
            }, 900);
        }, 1500);
    };

    function brilhotitulo() {
        if (titulo.classList.contains("brilho") === true) { titulo.classList.remove("brilho"); }
        else { titulo.classList.add("brilho"); }
    }

    function mudarSlideScroll(e) {
        if (mouseTexto === true) { return; }
        if (e.deltaY < 0) { slideDown(numSlide); }
        else { slideUp(numSlide); }
    };

    function mudarslidebttverdetalhes() {
        if (numSlide < sessao.length - 1) {
            slideUp(numSlide);
        }
    }

    function voltaPrimeiroSlide() {
        numSlide = 0;
        tmp = setInterval(brilhotitulo, 1200);
        const conteudoSlides = document.getElementsByClassName("mycontainer");
        for (let i = 0; i < sessao.length; i++) {
            sessao[i].slide.style.webkitTransition = styletransicao;
            sessao[i].slide.style.transition = styletransicao;
            sessao[i].slide.style.height = "";
            conteudoSlides[i].style.overflow = "hidden";
        }
        setTimeout(function () {
            for (let i = 0; i < sessao.length; i++) {
                sessao[i].slide.style.webkitTransition = "";
                sessao[i].slide.style.transition = "";
                conteudoSlides[i].style.overflow = "";
            }
            mudarMenu();
        }, tempoTransicao + 16);
        bttverdetalhes.style.opacity = "1";
    }

    function slideDown(numSlideAtual) {
        if (numSlide === 0 || fundoComparacaoAberto === true) { return; }
        document.removeEventListener("wheel", mudarSlideScroll);
        bttverdetalhes.removeEventListener("click", mudarslidebttverdetalhes);
        numSlide--;
        const numSlideAnterior = numSlideAtual - 1, conteudoSlideAtual = sessao[numSlideAtual].slide.getElementsByClassName("mycontainer")[0],
            conteudoSlideAnterior = sessao[numSlideAnterior].slide.getElementsByClassName("mycontainer")[0];
        sessao[numSlideAnterior].slide.style.webkitTransition = styletransicao;
        sessao[numSlideAnterior].slide.style.transition = styletransicao;
        conteudoSlideAtual.style.overflow = "hidden";
        conteudoSlideAnterior.style.overflow = "hidden";
        sessao[numSlideAnterior].slide.style.height = "";
        setTimeout(function () {
            if (numSlideAtual === 1) {
                mudarMenu();
                tmp = setInterval(brilhotitulo, 1200);
            }
            conteudoSlideAtual.style.overflow = "";
            conteudoSlideAnterior.style.overflow = "";
            sessao[numSlideAnterior].slide.style.webkitTransition = "";
            sessao[numSlideAnterior].slide.style.transition = "";
            document.addEventListener("wheel", mudarSlideScroll);
            bttverdetalhes.addEventListener("click", mudarslidebttverdetalhes);
        }, tempoTransicao + 16);
        if (numSlideAtual === sessao.length - 1) { bttverdetalhes.style.opacity = "1"; }
    }

    function slideUp(numSlideAtual) {
        if (numSlide === sessao.length - 1 || fundoComparacaoAberto === true) { return; }
        document.removeEventListener("wheel", mudarSlideScroll);
        numSlide++;
        const numProximoSlide = numSlideAtual + 1, conteudoSlideAtual = sessao[numSlideAtual].slide.getElementsByClassName("mycontainer")[0],
            conteudoProximoSlide = sessao[numProximoSlide].slide.getElementsByClassName("mycontainer")[0];
        bttverdetalhes.removeEventListener("click", mudarslidebttverdetalhes);
        conteudoSlideAtual.style.overflow = "hidden";
        conteudoProximoSlide.style.overflow = "hidden";
        clearInterval(tmp);
        sessao[numSlideAtual].slide.style.webkitTransition = styletransicao;
        sessao[numSlideAtual].slide.style.transition = styletransicao;
        sessao[numSlideAtual].slide.style.height = "0px";
        setTimeout(function () {
            conteudoProximoSlide.style.overflow = "";
            conteudoSlideAtual.style.overflow = "";
            sessao[numSlideAtual].slide.style.webkitTransition = "";
            sessao[numSlideAtual].slide.style.transition = "";
            bttverdetalhes.addEventListener("click", mudarslidebttverdetalhes);
            document.addEventListener("wheel", mudarSlideScroll);
        }, tempoTransicao + 16);
        if (numSlideAtual === 0) { mudarMenu(); }
        else if (numProximoSlide === sessao.length - 1) { bttverdetalhes.style.opacity = "0"; }
    }

    function mudarSlideCarrosel(numSlide, numSessao) {
        mudarCarrosel = false;
        const slides = sessao[numSessao].comparacao.carrosel.slides, icones = sessao[numSessao].comparacao.carrosel.icones,
            contentIcones = sessao[numSessao].comparacao.carrosel.contentIcons;
        contentIcones.style.transition = "left 350ms ease-in-out";
        for (let i = 0; i < slides.length; i++) {
            slides[i].style.transition = "width 350ms ease-in-out";
        }
        setTimeout(() => {
            for (let i = 0; i < slides.length; i++) {
                if (i != numSlide) { slides[i].style.width = "0%"; }
            }
            slides[numSlide].style.width = "100%";
            contentIcones.style.left = ((larguraJanela / 2) - 44) - (88 * numSlide) + "px";
            icones[numSlide].style.border = "1px solid rgba(213, 192, 107, 0.55)";
            setTimeout(function () {
                icones[numSlide].style.opacity = "1";
                for (let i = 0; i < icones.length; i++) {
                    if (i != numSlide) {
                        icones[i].style.border = "";
                        icones[i].style.opacity = "";
                    }
                    slides[i].style.transition = "";
                }
                contentIcones.style.transition = "";
                imgVisivel = false;
                for (let i = 0; i < imgTrad.length; i++) { imgTrad[i].style.opacity = "0"; }
                mudarCarrosel = true;
            }, 350)
        }, 16)
    }

    function mudarMenu() {
        if (numSlide === 0) {
            menu.classList.replace("mudamenu", "iniciomenu");
            logoBlack.classList.replace("mudalogoBlack", "iniciologoBlack");
            iconesetablack.classList.replace("mudaiconeblack", "inicioiconeblack");
            iconemenublack.classList.replace("mudaiconeblack", "inicioiconeblack");
            for (let i = 0; i < arrayop.length; i++) { arrayop[i].classList.replace("mudaopcoes", "inicioopcoes"); }
        } else {
            menu.classList.replace("iniciomenu", "mudamenu");
            logoBlack.classList.replace("iniciologoBlack", "mudalogoBlack");
            iconesetablack.classList.replace("inicioiconeblack", "mudaiconeblack");
            iconemenublack.classList.replace("inicioiconeblack", "mudaiconeblack");
            for (let i = 0; i < arrayop.length; i++) { arrayop[i].classList.replace("inicioopcoes", "mudaopcoes"); }
        }
    }

    function ajustarimgscomparacao() {
        if ((larguraJanela / alturaJanela) > proporcao4por3) {
            const altura = Math.round(alturaJanela * (98 / 100));
            for (let i = 0; i < sessao.length; i++) {
                if (i != 2 && sessao[i].comparacao && sessao[i].comparacao.imagem) {
                    const el = sessao[i].comparacao.imagem.container;
                    el.style.height = altura + "px";
                    el.style.width = altura * proporcao4por3 + "px";
                } else if (i === 2) {
                    const largura = Math.round(larguraJanela * (98 / 100));
                    sessao[2].comparacao.imagem.cgVertical.style.display = "none";
                    sessao[2].comparacao.imagem.cgHorizontal.style.display = "block";
                    sessao[2].comparacao.fecha.style.width = largura + "px";
                    sessao[2].comparacao.fecha.style.height = largura / (proporcao4por3 * 2) + "px";
                }
            }
            sessao[1].visualizacao.fecha.style.height = Math.round(alturaJanela * (7.5 / 10)) + "px";
            sessao[1].visualizacao.fecha.style.width = Math.round(alturaJanela * (7.5 / 10)) * proporcao4por3 + "px";
        } else {
            for (let i = 0; i < sessao.length; i++) {
                if (i != 2 && sessao[i].comparacao && sessao[i].comparacao.imagem) {
                    const el = sessao[i].comparacao.imagem.container;
                    el.style.width = larguraJanela + "px";
                    el.style.height = larguraJanela / proporcao4por3 + "px";;
                } else if (i === 2) {
                    const altura = Math.round(alturaJanela * (98 / 100));
                    sessao[2].comparacao.imagem.cgVertical.style.display = "block";
                    sessao[2].comparacao.imagem.cgHorizontal.style.display = "none";
                    sessao[2].comparacao.fecha.style.height = altura + "px";
                    sessao[2].comparacao.fecha.style.width = altura * (proporcao4por3 / 2) + "px";
                }
            }
        }
        for (let i = 0; i < sessao.length; i++) {
            if (sessao[i].comparacao && sessao[i].comparacao.carrosel) {
                sessao[i].comparacao.carrosel.contentIcons.style.left = ((larguraJanela / 2) - 44) - (88 * contSlideCarrosel) + "px";
            }
        }
        for (let i = 0; i < telaSlideCarrosel.length; i++) { telaSlideCarrosel[i].style.height = alturaJanela - 68 + "px"; }
        if (larguraJanela / (alturaJanela - 68) > proporcao4por3) {
            const alturaCarrosel = Math.round((alturaJanela - 68) * (98 / 100));
            for (let i = 0; i < slides.length; i++) {
                slides[i].style.height = alturaCarrosel + "px";
                slides[i].style.width = alturaCarrosel * proporcao4por3 + "px";
            }
        } else {
            for (let i = 0; i < slides.length; i++) {
                slides[i].style.width = larguraJanela + "px";
                slides[i].style.height = larguraJanela / proporcao4por3 + "px";
            }
        }
    }

    function compararImagens() {
        if (imgVisivel === false) { this.style.opacity = "1"; }
        else { this.style.opacity = "0"; }
        imgVisivel = !imgVisivel;
    }
    function ajustarElementos() {
        let largura = "55%";
        if (larguraJanela <= alturaJanela) { largura = "90%"; }
        for (let i = 0; i < sessao.length; i++) {
            if (sessao[i].comparacao) { sessao[i].comparacao.abre.style.width = largura; }
        }
    }

    function ajustarBlurFundo() {
        const fundos = document.getElementsByClassName("fundo");
        let relacao;
        if (larguraJanela > alturaJanela) { relacao = larguraJanela; }
        else { relacao = alturaJanela; }
        const pLargura = 1000 / relacao;
        let numBlur = 3 / pLargura;
        for (let i = 0; i < fundos.length; i++) { fundos[i].style.filter = "blur(" + numBlur + "px)"; }
    }
    ajustarimgscomparacao();
    setTimeout(carregamento, 850);
}