import { getElement, getAllElementsClass, setStyle } from "../js/geral.js";
import loadTopoMenu from "../topoMenu/topoMenu.js";
import particlesAnimation from "../particulas/particles.js";

let topoMenu;
function traduSilentFunctions() {
    const titulo = getElement("titulo"), info = getElement("info"), traprogress = getElement("traprogress"),
        textos = getAllElementsClass("texto"), bttverdetalhes = getElement("bttverdetalhes"),
        telaSlideCarrosel = getAllElementsClass("telaslide"), imgTrad = getAllElementsClass("imgtrad"),
        slides = getAllElementsClass("slides"),
        particles = particlesAnimation(getElement("particulas")),
        tempoTransicao = 700, styletransicao = "height " + tempoTransicao + "ms ease-in-out";//Armazena a configuração da transição dos slides.
    const proporcao4por3 = 4 / 3;
    let numSlide = 0, contCarrosel = 0, fundoComparacaoAberto = false, mouseTexto = false, imgVisivel = false, mudarCarrosel = true;
    let tmp, larguraJanela = window.innerWidth, alturaJanela = window.innerHeight;
    const sessao = [
        { slide: getElement("sessao1"), imagem: getElement("fundo1") },
        {
            slide: getElement("sessao2"), imagem: getElement("fundo2"),
            comparacao: {
                abre: getElement("compararthereareviolent"),
                fecha: getElement("fecharfundo1"),
                fundo: getElement("fundocomparacao"),
                imagem: { container: getElement("imgviolentasorig") }
            }, visualizacao: {
                abre1: getElement("imgverjap"),
                abre2: getElement("imgverlimp"),
                fecha: getElement("imgjap"),
                fundo: getElement("fundoverjapelimp")
            }
        },
        {
            slide: getElement("sessao3"), imagem: getElement("fundo3"),
            comparacao: {
                abre: getElement("omedodesangue"),
                fecha: getElement("fecharcomparacg"),
                fundo: getElement("fundocomparacg"),
                imagem: {
                    container: getElement("fecharcomparacg"),
                    cgHorizontal: getElement("gifcgintrohori"),
                    cgVertical: getElement("gifcgintrovert")
                }
            }
        },
        {
            slide: getElement("sessao4"), imagem: getElement("fundo4"),
            comparacao: {
                abre: getElement("compararMapaAntigaSilent"),
                fecha: getElement("fecharantigasilenthill"),
                fundo: getElement("fundoantigasilenthill"),
                imagem: { container: getElement("imgoldsilenthill") }
            }
        },
        {
            slide: getElement("sessao5"), imagem: getElement("fundo5"),
            comparacao: {
                abre: getElement("compararFolhasCaderno"),
                fecha: getElement("fecharfolhas"),
                fundo: getElement("fundocomparafolhas"),
                carrosel: {
                    slides: [getElement("imgtoschool"),
                    getElement("imgdoghouse")],
                    icones: [getElement("icontoschool"),
                    getElement("icondoghouse")],
                    contentIcons: getElement("folhascontentimgicons"),
                    bttEsquerda: getElement("folhasbtnLeft"),
                    bttDireita: getElement("folhasbtnRight"),
                }
            }
        },
        {
            slide: getElement("sessao6"), imagem: getElement("fundo6"),
            comparacao: {
                abre: getElement("compararChavesEclipse"),
                fecha: getElement("fecharchavesparaoeclipse"),
                fundo: getElement("fundochavesparaoeclipse"),
                imagem: { container: getElement("imgkeysforeclipse") }
            }
        },
        {
            slide: getElement("sessao7"), imagem: getElement("fundo7"),
            comparacao: {
                abre: getElement("compararEscola"),
                fecha: getElement("fecharfundoescola"),
                fundo: getElement("fundomapaescola"),
                carrosel: {
                    slides: [getElement("imgschoolp"),
                    getElement("imgschool1a"),
                    getElement("imgschool2a"),
                    getElement("imgschoolt")],
                    icones: [getElement("iconmapaescolap"),
                    getElement("iconmapaescola1a"),
                    getElement("iconmapaescola2a"),
                    getElement("iconmapaescolat")],
                    contentIcons: getElement("escolacontentimgicons"),
                    bttEsquerda: getElement("mapaescolabtnLeft"),
                    bttDireita: getElement("mapaescolabtnRight"),
                }
            }
        },
    ];

    window.addEventListener("resize", () => {
        larguraJanela = window.innerWidth;
        alturaJanela = window.innerHeight;
        setStyle(traprogress, { marginTop: larguraJanela <= 650 ? "13px" : "0px" })
        ajustarElementos();
        ajustarimgscomparacao();
        mudarMenu();
    });

    topoMenu.logo.addEventListener("click", () => {
        if (numSlide > 0) { voltaPrimeiroSlide(); }
        else { window.location.href = "index.html"; }
    });

    info.addEventListener("mouseenter", () => mouseTexto = true);
    info.addEventListener("mouseleave", () => mouseTexto = false);
    info.addEventListener("wheel", scrollTextoMudarSlide, { passive: true });
    traprogress.addEventListener("mouseenter", () => mouseTexto = true);
    traprogress.addEventListener("mouseleave", () => mouseTexto = false);
    traprogress.addEventListener("wheel", scrollTextoMudarSlide, { passive: true });
    for (let i = 0; i < textos.length; i++) {
        textos[i].addEventListener("mouseenter", () => mouseTexto = true);
        textos[i].addEventListener("mouseleave", () => mouseTexto = false);
        textos[i].addEventListener("wheel", scrollTextoMudarSlide, { passive: true });
    }

    for (let i = 0; i < imgTrad.length; i++) { imgTrad[i].addEventListener("mousedown", compararImagens); }

    for (let i = 0; i < sessao.length; i++) {
        if (sessao[i].comparacao) {
            const comparacao = sessao[i].comparacao;
            comparacao.abre.addEventListener("click", () => {
                fundoFadeIn(sessao[i].comparacao.fundo);
            })
            comparacao.fecha.addEventListener("click", () => {
                if (!fundoComparacaoAberto) { return; }
                contCarrosel = 0;
                imgVisivel = false;
                fundoFadeOut(sessao[i].comparacao.fundo);
            })
            if (comparacao.carrosel) {
                for (let e = 0; e < comparacao.carrosel.icones.length; e++) {
                    comparacao.carrosel.icones[e].addEventListener("mousedown", () => {
                        if (!mudarCarrosel) { return; }
                        contCarrosel = e;
                        mudarSlideCarrosel(e, i);
                    });
                }
                comparacao.carrosel.bttEsquerda.addEventListener("mousedown", () => {
                    if (!mudarCarrosel) { return; }
                    contCarrosel = contCarrosel === 0 ? comparacao.carrosel.icones.length - 1 : contCarrosel - 1;
                    mudarSlideCarrosel(contCarrosel, i);
                });
                comparacao.carrosel.bttDireita.addEventListener("mousedown", () => {
                    if (!mudarCarrosel) { return; }
                    contCarrosel = contCarrosel === comparacao.carrosel.icones.length - 1 ? 0 : contCarrosel + 1;
                    mudarSlideCarrosel(contCarrosel, i);
                });
                mudarSlideCarrosel(0, i);
            }
        }
    }
    const imglimp = getElement("imglimp");
    sessao[1].visualizacao.abre1.addEventListener("click", () => {
        setStyle(imglimp, { opacity: null });
        fundoFadeIn(sessao[1].visualizacao.fundo);
    });

    sessao[1].visualizacao.abre2.addEventListener("click", () => {
        setStyle(imglimp, { opacity: "1" });
        fundoFadeIn(sessao[1].visualizacao.fundo);
    });

    sessao[1].visualizacao.fecha.addEventListener("click", () => fundoFadeOut(sessao[1].visualizacao.fundo));

    function fundoFadeIn(content) {
        const tempo = 650;
        setStyle(content, { display: "block", transition: "opacity " + tempo + "ms ease-in-out" });
        setTimeout(() => {
            setStyle(content, { opacity: "1" });
            setTimeout(() => {
                fundoComparacaoAberto = true;
                setStyle(content, { transition: "opacity " + tempo / 2 + "ms ease-in-out" });
                particles.stop();
            }, tempo);
        }, 16);
    }

    function fundoFadeOut(content) {
        particles.start();
        setStyle(content, { opacity: null });
        fundoComparacaoAberto = false;
        setTimeout(() => {
            setStyle(content, { display: null });
            for (let i = 0; i < imgTrad.length; i++) { setStyle(imgTrad[i], { opacity: null }); }
            for (let i = 0; i < sessao.length; i++) {
                if (sessao[i].comparacao && sessao[i].comparacao.carrosel) { mudarSlideCarrosel(0, i); }
            }
        }, 330);
    }

    function carregamento() {//Faz os elementos do primeiro "slide" aparecerem e após isso permite trocar de slide.
        setStyle(getElement("conteudoSlide1"), { opacity: null });
        setStyle(info, { display: "block" });
        setStyle(traprogress, { display: "block" });
        tmp = setInterval(brilhotitulo, 1250);
        setTimeout(() => {//Fazer a "traprogress" e a "info" aparecerem.
            const bttdownload = getElement("bttdownload");
            setStyle(traprogress, { opacity: "1", marginTop: larguraJanela <= 650 ? "13px" : "0px" });
            setStyle(info, { opacity: "1", marginTop: "0px" });
            setStyle(bttdownload, { display: "block" });
            setTimeout(() => {
                setStyle(traprogress, { trasition: "none" });
                setStyle(info, { trasition: "none" });
            }, 600);
            setTimeout(() => {//Fazer o "bttdownload" aparecer.
                setStyle(bttdownload, { opacity: "1" });
                setStyle(bttverdetalhes, { display: "block" });
                for (let i = 0; i < sessao.length; i++) { carregarImagemFundo(sessao[i].imagem, i + 1); }
                setTimeout(() => {//Fazer o "bttverdetalhes" aparecer.
                    setStyle(bttverdetalhes, { opacity: "1" });
                    bttverdetalhes.addEventListener("click", mudarslidebttverdetalhes);
                    document.addEventListener("wheel", mudarSlideScroll);
                    setStyle(getElement("espacoparticulas"), { opacity: "1" });
                    particles.start();
                }, 1000);
            }, 900);
        }, 1500);
    };

    function brilhotitulo() {
        titulo.classList.toggle("brilho");
    }

    function mudarSlideScroll(e) {
        if (mouseTexto) { return; }
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
        tmp = setInterval(brilhotitulo, 1250);
        const conteudoSlides = getAllElementsClass("mycontainer");
        for (let i = 0; i < sessao.length; i++) {
            setStyle(sessao[i].slide, { transition: styletransicao, height: null });
            setStyle(conteudoSlides[i], { overflow: "hidden" });
        }
        setTimeout(() => {
            for (let i = 0; i < sessao.length; i++) {
                setStyle(sessao[i].slide, { transition: null, height: null });
                setStyle(conteudoSlides[i], { overflow: null });
            }
            mudarMenu();
        }, tempoTransicao + 16);
        setStyle(bttverdetalhes, { opacity: "1" });
    }

    function slideDown(numSlideAtual) {
        if (numSlide === 0 || fundoComparacaoAberto) { return; }
        document.removeEventListener("wheel", mudarSlideScroll);
        bttverdetalhes.removeEventListener("click", mudarslidebttverdetalhes);
        numSlide--;
        const numSlideAnterior = numSlideAtual - 1, conteudoSlideAtual = sessao[numSlideAtual].slide.getElementsByClassName("mycontainer")[0],
            conteudoSlideAnterior = sessao[numSlideAnterior].slide.getElementsByClassName("mycontainer")[0];
        setStyle(sessao[numSlideAnterior].slide, { transition: styletransicao, height: null });
        setStyle(conteudoSlideAnterior, { overflow: "hidden" });
        setStyle(conteudoSlideAtual, { overflow: "hidden" });
        setTimeout(() => {
            if (numSlideAtual === 1) {
                mudarMenu();
                tmp = setInterval(brilhotitulo, 1250);
            }
            setStyle(conteudoSlideAnterior, { overflow: null });
            setStyle(conteudoSlideAtual, { overflow: null });
            setStyle(sessao[numSlideAnterior].slide, { transition: null });
            document.addEventListener("wheel", mudarSlideScroll);
            bttverdetalhes.addEventListener("click", mudarslidebttverdetalhes);
        }, tempoTransicao + 16);
        if (numSlideAtual === sessao.length - 1) { setStyle(bttverdetalhes, { opacity: "1" }); }
    }

    function slideUp(numSlideAtual) {
        if (numSlide === sessao.length - 1 || fundoComparacaoAberto) { return; }
        document.removeEventListener("wheel", mudarSlideScroll);
        numSlide++;
        const numProximoSlide = numSlideAtual + 1, conteudoSlideAtual = sessao[numSlideAtual].slide.getElementsByClassName("mycontainer")[0],
            conteudoProximoSlide = sessao[numProximoSlide].slide.getElementsByClassName("mycontainer")[0];
        bttverdetalhes.removeEventListener("click", mudarslidebttverdetalhes);
        setStyle(conteudoProximoSlide, { overflow: "hidden" });
        setStyle(conteudoSlideAtual, { overflow: "hidden" });
        clearInterval(tmp);
        setStyle(sessao[numSlideAtual].slide, { transition: styletransicao, height: "0px" });
        setTimeout(() => {
            setStyle(conteudoProximoSlide, { overflow: null });
            setStyle(conteudoSlideAtual, { overflow: null });
            setStyle(sessao[numSlideAtual].slide, { transition: null });
            bttverdetalhes.addEventListener("click", mudarslidebttverdetalhes);
            document.addEventListener("wheel", mudarSlideScroll);
        }, tempoTransicao + 16);
        if (numSlideAtual === 0) { mudarMenu(); }
        else if (numProximoSlide === sessao.length - 1) { setStyle(bttverdetalhes, { opacity: "0" });; }
    }

    function mudarSlideCarrosel(numSlide, numSessao) {
        mudarCarrosel = false;
        const slides = sessao[numSessao].comparacao.carrosel.slides, icones = sessao[numSessao].comparacao.carrosel.icones,
            contentIcones = sessao[numSessao].comparacao.carrosel.contentIcons;
        setStyle(contentIcones, { transition: "left 350ms ease-in-out" });
        for (let i = 0; i < slides.length; i++) {
            setStyle(slides[i], { transition: "width 350ms ease-in-out" });
        }
        setTimeout(() => {
            for (let i = 0; i < slides.length; i++) {
                if (i != numSlide) { setStyle(slides[i], { width: "0%" }); }
            }
            setStyle(slides[numSlide], { width: "100%" });
            setStyle(contentIcones, { left: ((larguraJanela / 2) - 44) - (88 * numSlide) + "px" });
            setStyle(icones[numSlide], { border: "1px solid rgba(213, 192, 107, 0.55)" });
            setTimeout(() => {
                setStyle(icones[numSlide], { opacity: "1" });
                for (let i = 0; i < icones.length; i++) {
                    if (i != numSlide) { setStyle(icones[i], { opacity: null, border: null }); }
                    setStyle(slides[i], { transition: null });
                }
                setStyle(contentIcones, { transition: null });
                imgVisivel = false;
                for (let i = 0; i < imgTrad.length; i++) { setStyle(imgTrad[i], { opacity: "0" }); }
                mudarCarrosel = true;
            }, 350)
        }, 16)
    }

    function mudarMenu() {
        if (numSlide === 0) { topoMenu.changeTheme(true); }
        else { topoMenu.changeTheme(false); }
    }

    function ajustarimgscomparacao() {
        if ((larguraJanela / alturaJanela) > proporcao4por3) {
            const altura = Math.round(alturaJanela * (98 / 100));
            for (let i = 0; i < sessao.length; i++) {
                if (i != 2 && sessao[i].comparacao && sessao[i].comparacao.imagem) {
                    const el = sessao[i].comparacao.imagem.container;
                    setStyle(el, { height: altura + "px", width: altura * proporcao4por3 + "px" });
                } else if (i === 2) {
                    const largura = Math.round(larguraJanela * (98 / 100));
                    setStyle(sessao[2].comparacao.imagem.cgVertical, { display: "none" });
                    setStyle(sessao[2].comparacao.imagem.cgHorizontal, { display: "block" });
                    setStyle(sessao[2].comparacao.fecha, {
                        width: largura + "px", height: largura / (proporcao4por3 * 2) + "px"
                    });
                }
            }
            setStyle(sessao[1].visualizacao.fecha, {
                width: Math.round(alturaJanela * (7.5 / 10)) * proporcao4por3 + "px",
                height: Math.round(alturaJanela * (7.5 / 10)) + "px"
            });
        } else {
            for (let i = 0; i < sessao.length; i++) {
                if (i != 2 && sessao[i].comparacao && sessao[i].comparacao.imagem) {
                    const el = sessao[i].comparacao.imagem.container;
                    setStyle(el, { height: larguraJanela / proporcao4por3 + "px", width: larguraJanela + "px" });
                } else if (i === 2) {
                    const altura = Math.round(alturaJanela * (98 / 100));
                    setStyle(sessao[2].comparacao.imagem.cgVertical, { display: "block" });
                    setStyle(sessao[2].comparacao.imagem.cgHorizontal, { display: "none" });
                    setStyle(sessao[2].comparacao.fecha, {
                        width: altura * (proporcao4por3 / 2) + "px", height: altura + "px"
                    });
                }
            }
        }
        for (let i = 0; i < sessao.length; i++) {
            if (sessao[i].comparacao && sessao[i].comparacao.carrosel) {
                setStyle(sessao[i].comparacao.carrosel.contentIcons, {
                    left: ((larguraJanela / 2) - 44) - (88 * contCarrosel) + "px"
                });
            }
        }
        for (let i = 0; i < telaSlideCarrosel.length; i++) {
            setStyle(telaSlideCarrosel[i], { height: alturaJanela - 68 + "px" });
        }
        if (larguraJanela / (alturaJanela - 68) > proporcao4por3) {
            const alturaCarrosel = Math.round((alturaJanela - 68) * (98 / 100));
            for (let i = 0; i < slides.length; i++) {
                setStyle(slides[i], {
                    height: alturaCarrosel + "px",
                    width: alturaCarrosel * proporcao4por3 + "px"
                });
            }
        } else {
            for (let i = 0; i < slides.length; i++) {
                setStyle(slides[i], {
                    width: larguraJanela + "px",
                    height: larguraJanela / proporcao4por3 + "px"
                });
            }
        }
    }
    function carregarImagemFundo(fundo, i) {
        const imagem = new Image();
        imagem.onload = (e) => setStyle(fundo, { backgroundImage: "url('" + e.currentTarget.src + "')" });
        imagem.src = "/ContTraduSilent/imagens/fundo/fundo" + i + ".jpg";
    }
    function compararImagens(e) {
        setStyle(e.currentTarget, { opacity: imgVisivel ? "0" : "1" });
        imgVisivel = !imgVisivel;
    }
    function ajustarElementos() {
        const largura = larguraJanela <= alturaJanela ? "90%" : "55%";
        for (let i = 0; i < sessao.length; i++) {
            if (sessao[i].comparacao) { setStyle(sessao[i].comparacao.abre, { width: largura }); }
        }
    }
    function scrollTextoMudarSlide(e) {
        const el = e.currentTarget;
        if (e.deltaY > 0) {
            mouseTexto = el.scrollTop + el.offsetHeight === el.scrollHeight ? false : true;
        } else { mouseTexto = el.scrollTop === 0 ? false : true; }
    }
    ajustarimgscomparacao();
    setTimeout(carregamento, 800);
}

export default async function traduSilent() {
    topoMenu = await loadTopoMenu();
    if (topoMenu) {
        traduSilentFunctions();
        return true;
    }
    return false;
}