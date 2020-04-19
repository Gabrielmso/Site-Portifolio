mudarMenu = false;
const projeto = { nome: null, resolucao: { largura: 0, altura: 0, proporcao: 0 }, corFundo: null, numeroCamadas: 0 }; //Armazena as propriedades escolhidas ao criar o projeto.
const grid = {//Propriedades do grid e da visualização do projeto antes de criar o grid, e saber se está visível.
    tela: null, tamanho: 80, posicao: { x: 0, y: 0 }, visivel: false, visualizacaoAnterior: { scrollX: 0, scrollY: 0, zoom: 0 }
};
let corPrincipal, corSecundaria, corPrincipalOuSecundaria;
let corEscolhidaPrincipal = { R: 0, G: 0, B: 0 };//Armazena a cor escolhida do primeiro plano.
let corEscolhidaSecudaria = { R: 255, G: 255, B: 255 };//Armazena a cor escolhida no segundo plano.
let drawingTools;
let undoRedoChange;
let hotKeys;
let previewFunctions;
let arrayCoresSalvas = [];//Armazena objetos cuja as propriedades possuem as informações sobre as cores salvas.
let arrayCamadas = [];//Armazena objetos cuja as propriedades possuem as informações sobre as camadas, como os elementos canvas, icones, etc.
let janelaPrincipal;
let contentTelas;//Elemento onde ficará a "tela" para desenhar.
let telasCanvas;//Elemento onde ficarão os canvas "camadas".
let camadaSelecionada = 0;//Armazena a posição do arrayTelasCamadas com a camada selecionada.
let ctxDesenho;//Armazena o contexto 2d do canvas "desenho" que receberá o "desenho completo".
let corFundo;//Div de fundo que receberá a cor de fundo escolhida para o projeto.
let ctxPintar;//Armazena o contexto 2d do canvas "pintar" onde ocorrerá os "eventos" de pintura.
let projetoCriado = false;//Saber se um projeto foi criado.
let txtCorEscolhida;//Recebe a string da cor do primeiro plano no formato RGB para informar ao usuário.
let txtResolucao;//Recebe a string da resolução que o usuário escolheu para o projeto para informar ao usuário.
let txtPosicaoCursor;//Recebe a string com a posição do cursor no eixo X e Y sobre a "telasCanvas".
let txtPorcentagemZoom;//Recebe a string com a porcentagem de zoom no "telasCanvas".
let janelaSeleciona;//Recebe toda a função "janelaSeletorDeCor".
let MouseNoBttVer = false;//Saber se o mouse está sobre os botões que deixam as camadas invisíveis ou visíveis.
let cursorOpacidadeCamada;
function colorPaint() {
    drawingTools = drawingToolsObject();
    undoRedoChange = undoRedoChangeObject();
    previewFunctions = previewFunctionsObject();
    hotKeys = hotKeysObject();
    const contentJanelaCriarProjeto = document.getElementById("contentJanelaCriarProjeto");
    const contentJanelaAtalhos = document.getElementById("contentJanelaAtalhos");
    const contentJanelaMenuGrid = document.getElementById("contentJanelaMenuGrid");
    const contentTools = document.getElementById("contentTools");
    const barraLateralEsquerda = document.getElementById("barraLateralEsquerda");
    const barraLateralDireita = document.getElementById("barraLateralDireita");
    const corAtual = document.getElementById("corAtual");
    const barraOpacidadeCamada = document.getElementById("barraOpacidadeCamada");
    const contentCentro = document.getElementById("contentCentro");
    cursorOpacidadeCamada = document.getElementById("cursorOpacidadeCamada");
    janelaPrincipal = document.getElementById("janelaPrincipal");
    contentTelas = document.getElementById("contentTelas");
    telasCanvas = document.getElementById("telasCanvas");
    corFundo = document.getElementById("corFundo");
    corPrincipal = document.getElementById("corPrincipal");
    corSecundaria = document.getElementById("corSecundaria");
    txtCorEscolhida = document.getElementById("txtCorEscolhida");
    txtResolucao = document.getElementById("txtResolucao");
    txtPosicaoCursor = document.getElementById("txtPosicaoCursor");
    txtPorcentagemZoom = document.getElementById("txtPorcentagemZoom");
    ctxPintar = document.getElementById("pintar").getContext("2d");
    ctxDesenho = document.getElementById("desenho").getContext("2d");
    grid.tela = document.getElementById("grid");
    janelaSeleciona = new janelaSeletorDeCor();
    let mudarOpacidadeCamada = false;//Saber se o mouse está pressionado na "barraOpacidadeCamada". 
    let moverDesenhoEspaco = { mover: false, coordenadaInicio: null, scroolTop: 0, scrollLeft: 0 };

    menuPadrao();
    ajustarContents();
    criarOuAbrirProjeto();
    txtCorEscolhida.value = "rgb(" + corEscolhidaPrincipal.R + ", " + corEscolhidaPrincipal.G + ", " + corEscolhidaPrincipal.B + ")";

    drawingTools.addEventsToElements();
    previewFunctions.addEventsToElements();
    undoRedoChange.addEventsToElements();

    document.getElementById("bttCriarNovoProjeto").addEventListener("click", function () {
        if (projetoCriado === false) {
            if (janelaSelecionarCorVisivel === false) { contentJanelaCriarProjeto.style.display = "flex"; }
        }
        else {
            if (confirm("Todo o progresso não salvo será perdido, deseja continuar?") === true) {
                sessionStorage.setItem("criarNovoProjeto", "true");
                window.location.reload();
            }
        }
    });

    document.getElementById("bttCriarprojeto").addEventListener("click", function () {
        validarPropriedades();
        if (projetoCriado === true) { contentJanelaCriarProjeto.style.display = "none"; }
    });

    document.getElementById("bttCancelaCriarprojetor").addEventListener("click", function () {
        contentJanelaCriarProjeto.style.display = "none";
    });

    document.getElementById("bttCriarGrade").addEventListener("click", function () {
        if (projetoCriado === true) {
            grid.visualizacaoAnterior.scrollX = contentTelas.scrollLeft;
            grid.visualizacaoAnterior.scrollY = contentTelas.scrollTop;
            grid.visualizacaoAnterior.zoom = parseFloat(((txtPorcentagemZoom.value).replace("%", "")).replace(",", "."));
            contentJanelaMenuGrid.style.display = "block";
            document.getElementById("txtTamanhoGrid").value = grid.tamanho;
            document.getElementById("txtPosicaoVerticalGrid").value = grid.posicao.y;
            document.getElementById("txtPosicaoHorizontalGrid").value = grid.posicao.x;
            ajustarNaVisualizacaoTelasCanvas();
            if (grid.visivel === false) {
                criarGrid(grid.tela, grid.tamanho, grid.posicao, true);
            }
        }
        else { alert("Nenhum projeto criado!"); }
    });

    document.getElementById("txtTamanhoGrid").addEventListener("change", function () {
        const num = parseInt(this.value);
        if (isNaN(num) === false && num > 0) {
            grid.tamanho = num;
            criarGrid(grid.tela, grid.tamanho, grid.posicao, true);
        }
    });

    document.getElementById("txtPosicaoVerticalGrid").addEventListener("change", function () {
        const num = parseInt(this.value);
        if (isNaN(num) === false) {
            grid.posicao.y = num;
            criarGrid(grid.tela, grid.tamanho, grid.posicao, true);
        }
    });

    document.getElementById("txtPosicaoHorizontalGrid").addEventListener("change", function () {
        const num = parseInt(this.value);
        if (isNaN(num) === false) {
            grid.posicao.x = num;
            criarGrid(grid.tela, grid.tamanho, grid.posicao, true);
        }
    });

    document.getElementById("bttOkGrid").addEventListener("click", function () {
        contentJanelaMenuGrid.style.display = "none";
        ajustarVisualizacaoAntesGrid();
    });

    document.getElementById("bttcancelarGrid").addEventListener("click", function () {
        if (projetoCriado === true) {
            criarGrid(grid.tela, grid.tamanho, grid.posicao, false);
            contentJanelaMenuGrid.style.display = "none";
            ajustarVisualizacaoAntesGrid();
        }
    });

    document.getElementById("bttSalvarDesenho").addEventListener("click", function () {
        if (projetoCriado === true) { salvarDesenho(); }
        else { alert("Nenhum projeto criado!"); }
    });

    document.getElementById("bttSalvarProjeto").addEventListener("click", function () {
        if (projetoCriado === true) { salvarProjeto(); }
        else { alert("Nenhum projeto criado!"); }
    });

    document.getElementById("bttAbrirProjeto").addEventListener("click", function () {
        if (projetoCriado === true) {
            if (confirm("Todo o progresso não salvo será perdido, deseja continuar?") === true) {
                sessionStorage.setItem("abrirProjetoSalvo", "true");
                window.location.reload();
            }
        }
        else { abrirProjeto(); }
    });

    corPrincipal.addEventListener("click", function () {
        if (janelaSelecionarCorVisivel === true) {
            janelaSeleciona.procurarCor(corEscolhidaPrincipal);
        }
        else {
            corPrincipalOuSecundaria = 1;
            corAtual.style.backgroundColor = "rgb(" + corEscolhidaPrincipal.R + ", " + corEscolhidaPrincipal.G + ", " + corEscolhidaPrincipal.B + ")";
            janelaSeleciona.abrir(corEscolhidaPrincipal);
        }
    });

    corSecundaria.addEventListener("click", function () {
        if (janelaSelecionarCorVisivel === true) {
            janelaSeleciona.procurarCor(corEscolhidaSecudaria);
        }
        else {
            corPrincipalOuSecundaria = 2;
            corAtual.style.backgroundColor = "rgb(" + corEscolhidaSecudaria.R + ", " + corEscolhidaSecudaria.G + ", " + corEscolhidaSecudaria.B + ")";
            janelaSeleciona.abrir(corEscolhidaSecudaria);
        }
    });

    document.getElementById("bttCoresPrincipais").addEventListener("mousedown", function () {//Coloca preto na corPrincipalEcolhida e branco na corSecundariaEscolhida.
        if (janelaSelecionarCorVisivel === false) {
            corEscolhidaPrincipal = { R: 0, G: 0, B: 0 };
            drawingTools.toolProperties.color = corEscolhidaPrincipal;
            corEscolhidaSecudaria = { R: 255, G: 255, B: 255 };
            corPrincipal.style.backgroundColor = "rgb(" + corEscolhidaPrincipal.R + ", " + corEscolhidaPrincipal.G + ", " + corEscolhidaPrincipal.B + ")";
            corSecundaria.style.backgroundColor = "rgb(" + corEscolhidaSecudaria.R + ", " + corEscolhidaSecudaria.G + ", " + corEscolhidaSecudaria.B + ")";
            txtCorEscolhida.value = "rgb(" + corEscolhidaPrincipal.R + ", " + corEscolhidaPrincipal.G + ", " + corEscolhidaPrincipal.B + ")";
        }
    });

    document.getElementById("bttAlternaCor").addEventListener("mousedown", function () {//Alterna entre a corPrincipalEcolhida e a corSecundariaEscolhida.
        if (janelaSelecionarCorVisivel === false) {
            corPrincipal.style.backgroundColor = "rgb(" + corEscolhidaSecudaria.R + ", " + corEscolhidaSecudaria.G + ", " + corEscolhidaSecudaria.B + ")";
            corSecundaria.style.backgroundColor = "rgb(" + corEscolhidaPrincipal.R + ", " + corEscolhidaPrincipal.G + ", " + corEscolhidaPrincipal.B + ")";
            const cor = corEscolhidaPrincipal;
            corEscolhidaPrincipal = corEscolhidaSecudaria;
            drawingTools.toolProperties.color = corEscolhidaPrincipal
            corEscolhidaSecudaria = cor;
            txtCorEscolhida.value = "rgb(" + corEscolhidaPrincipal.R + ", " + corEscolhidaPrincipal.G + ", " + corEscolhidaPrincipal.B + ")";
        }
    });

    telasCanvas.addEventListener("mousemove", () => txtPosicaoCursor.value = Math.floor(drawingTools.mousePosition.x + 1) + ", " + Math.floor(drawingTools.mousePosition.y + 1));

    telasCanvas.addEventListener("mouseleave", () => txtPosicaoCursor.value = "");

    telasCanvas.addEventListener("mousedown", (e) => {
        if (hotKeys.spacePressed === true) {
            telasCanvas.style.cursor = "grabbing";
            moverDesenhoEspaco = { mover: true, coordenadaInicio: pegarPosicaoMouse(contentTelas, e), scroolTop: contentTelas.scrollTop, scrollLeft: contentTelas.scrollLeft };
        }
    });

    barraOpacidadeCamada.addEventListener("mousedown", function (e) {
        mudarOpacidadeCamada = true;
        calculaOpacidadeCamada(e);
    });

    document.addEventListener("mousemove", (e) => {
        if (mudarOpacidadeCamada === true) { calculaOpacidadeCamada(e); }
        else if (moverDesenhoEspaco.mover === true) { moverDesenhoComEspaco(moverDesenhoEspaco, pegarPosicaoMouse(contentTelas, e)); }
    });

    document.getElementById("bttZoomMais").addEventListener("click", function () {//Aumentar o zoom no projeto.
        if (projetoCriado === false) { return; };
        zoomNoProjeto(true, true, 1.25);
    });

    document.getElementById("bttZoomMenos").addEventListener("click", function () {//Diminuir o zoom no projeto.
        if (projetoCriado === false) { return; };
        if (telasCanvas.offsetWidth >= 25) {
            zoomNoProjeto(false, true, 1.25);
        }
    });

    txtPorcentagemZoom.addEventListener("keyup", function (e) {
        if (e.code === "Enter" || e.keyCode === 13) {
            const valor = parseFloat(((this.value).replace("%", "")).replace(",", "."));
            if (isNaN(valor) === false && valor >= 1) {
                zoomNoProjeto("porcentagem", true, valor);
            }
        }
    });

    document.getElementById("bttAtalhos").addEventListener("click", function () {
        contentJanelaAtalhos.style.display = "flex";
    });

    document.getElementById("bttOkAtalhos").addEventListener("click", function () {
        contentJanelaAtalhos.style.display = "none";
    });

    document.addEventListener("mouseup", function (e) {
        if (mudarOpacidadeCamada === true) {
            desenhoNoPreviewEIcone();
            mudarOpacidadeCamada = false;
        }
        else if (hotKeys.spacePressed === true) {
            moverDesenhoEspaco.mover = false;
            telasCanvas.style.cursor = "grab";
        }
    });

    document.addEventListener("keydown", function (e) {//Criar teclas de atalho.
        if (projetoCriado === false) { return; }
        if (drawingTools.painting === true) { e.preventDefault(); return; }
        if (hotKeys.ctrlPressed === true) {//Teclas de atalho com o ctrl.
            const keyFunction = hotKeys.keyDown[e.code];
            if (keyFunction) {
                e.preventDefault();
                drawingTools.clickToCurve = false;
                keyFunction();
            }
        }
        else {
            if (e.code === "BracketRight") {//Aumentar o tamanho da ferramenta.
                drawingTools.changeToolSizeHotKey(true);
            }
            else if (e.code === "Backslash") {//Diminuir o tamanho da ferramenta.
                drawingTools.changeToolSizeHotKey(false);
            }
        }
        if (e.code === "ControlRight" || e.code === "ControlLeft" || e.keyCode === 17) {
            e.preventDefault();
            hotKeys.keyDownControl();
        }
        if (e.code === "Space") {
            e.preventDefault();
            hotKeys.keyDownSpace();
        }
    });

    document.addEventListener("keyup", function (e) {
        if (e.code === "ControlRight" || e.code === "ControlLeft" || e.keyCode === 17) {
            e.preventDefault();
            hotKeys.keyUpControl();
        }
        if (e.code === "Space") {
            e.preventDefault();
            moverDesenhoEspaco.mover = false;
            hotKeys.keyUpSpace();
        }
    });

    document.getElementById("colorPaintContent").addEventListener("wheel", function (e) {//Zoom com o scroll do mouse.
        if (hotKeys.ctrlPressed === true && projetoCriado === true) {
            e.preventDefault();
            if (e.deltaY < 0) {
                zoomNoProjeto(true, false, 1.11, e);
            }
            else {
                zoomNoProjeto(false, false, 1.11, e);
            }
            const posContentTelas = pegarPosicaoMouse(contentTelas, e);
            const proporcaoPosY = drawingTools.mousePosition.y / projeto.resolucao.altura;
            const proporcaoPosX = drawingTools.mousePosition.x / projeto.resolucao.largura;
            contentTelas.scrollTop = (contentTelas.scrollHeight * proporcaoPosY) - (posContentTelas.y) - 5;
            contentTelas.scrollLeft = (contentTelas.scrollWidth * proporcaoPosX) - (posContentTelas.x) - 5;
        }
    });

    window.addEventListener("resize", function () {
        ajustarContents();
        if (projetoCriado === true) {
            ajustarNaVisualizacaoTelasCanvas();
            setTimeout(function () {
                ajustarContents();
            }, 120);
        };
    });

    function calculaOpacidadeCamada(e) {
        const mouse = pegarPosicaoMouse(barraOpacidadeCamada, e);
        let porcentagem = Math.round((mouse.x * 100) / barraOpacidadeCamada.offsetWidth);
        if (mouse.x <= 1) {
            porcentagem = 1;
            cursorOpacidadeCamada.style.left = "-7px";
            arrayCamadas[camadaSelecionada].porcentagemOpa.value = "1%";
        }
        else if (mouse.x >= 200) {
            porcentagem = 100;
            cursorOpacidadeCamada.style.left = "193px";
            arrayCamadas[camadaSelecionada].porcentagemOpa.value = "100%";
        }
        else {
            cursorOpacidadeCamada.style.left = mouse.x - 7 + "px";
            arrayCamadas[camadaSelecionada].porcentagemOpa.value = porcentagem + "%";
        }
        let opacidade = porcentagem / 100;
        arrayCamadas[camadaSelecionada].opacidade = opacidade;
        arrayCamadas[camadaSelecionada].camada.style.opacity = opacidade;
    }

    function menuPadrao() {
        menu.classList.replace("iniciomenu", "mudamenu");
        logoBlack.classList.replace("iniciologoBlack", "mudalogoBlack");
        iconesetablack.classList.replace("inicioiconeblack", "mudaiconeblack");
        iconemenublack.classList.replace("inicioiconeblack", "mudaiconeblack");
        for (let i = 0; i < arrayop.length; i++) { arrayop[i].classList.replace("inicioopcoes", "mudaopcoes"); }
    }

    function ajustarVisualizacaoAntesGrid() {
        zoomNoProjeto("porcentagem", false, grid.visualizacaoAnterior.zoom);
        contentTelas.scrollTop = grid.visualizacaoAnterior.scrollY;
        contentTelas.scrollLeft = grid.visualizacaoAnterior.scrollX;
    }

    function ajustarContents() {
        contentTools.style.height = (janelaPrincipal.offsetHeight - 90) + "px";
        contentCentro.style.width = contentTools.offsetWidth - barraLateralEsquerda.offsetWidth - barraLateralDireita.offsetWidth - 0.5 + "px";
        contentCentro.style.height = contentTools.style.height;
        contentTelas.style.height = (contentCentro.offsetHeight - 15) + "px";
        document.getElementById("janelaCamadas").style.height = (barraLateralEsquerda.offsetHeight - 336) + "px";
    }
}

function moverDesenhoComEspaco(info, mousePosition) {
    const newScrollLeft = info.scrollLeft + info.coordenadaInicio.x - mousePosition.x;
    const newScrollTop = info.scroolTop + info.coordenadaInicio.y - mousePosition.y;
    contentTelas.scrollLeft = newScrollLeft;
    contentTelas.scrollTop = newScrollTop;
}
// ==========================================================================================================================================================================================================================================

function criarGrid(tela, tamanho, posicao, criar) {
    const numDeQuadrados = (Math.trunc((projeto.resolucao.largura / tamanho) + 2.099)) * (Math.trunc((projeto.resolucao.altura / tamanho) + 2.099));
    if (numDeQuadrados > 5700) {
        alert("Aumente o tamanho da grade!");
        return;
    }
    else if (numDeQuadrados > 1100) {
        alert("O tamanho da grade está muito baixo, isso pode acarretar problemas de performance!");
    }
    let el = tela.firstElementChild;
    while (el != null) {
        el.remove();
        el = tela.firstElementChild;
    }
    if (criar === true) {
        const pos = {
            x: (((posicao.x / tamanho) - (Math.trunc(posicao.x / tamanho))) * tamanho),
            y: (((posicao.y / tamanho) - (Math.trunc(posicao.y / tamanho))) * tamanho)
        }
        if (pos.x < 0) { pos.x = tamanho + pos.x };
        if (pos.y < 0) { pos.y = tamanho + pos.y };
        const larguraTela = (projeto.resolucao.largura + (tamanho * 2.1)),
            alturaTela = (projeto.resolucao.altura + (tamanho * 2.1));
        const larguraQuadrado = ((tamanho / larguraTela) * 100), alturaQuadrado = ((tamanho / alturaTela) * 100);
        const styleQuadrado = "width: " + larguraQuadrado + "%; height: " + alturaQuadrado + "%;";
        tela.style.top = (-100 * ((tamanho - pos.y) / projeto.resolucao.altura)) + "%";
        tela.style.left = (-100 * ((tamanho - pos.x) / projeto.resolucao.largura)) + "%";
        tela.style.width = ((larguraTela / projeto.resolucao.largura) * 100) + "%";
        tela.style.height = ((alturaTela / projeto.resolucao.altura) * 100) + "%";
        for (let i = 0; i < numDeQuadrados; i++) {
            const quadrado = document.createElement("div");
            quadrado.setAttribute("class", "quadrado");
            quadrado.setAttribute("style", styleQuadrado);
            tela.appendChild(quadrado);
        }
    }
    grid.visivel = criar;
}
// ==========================================================================================================================================================================================================================================

function desenharNaCamada() {
    undoRedoChange.saveChanges();
    arrayCamadas[camadaSelecionada].ctx.drawImage(ctxPintar.canvas, 0, 0, projeto.resolucao.largura, projeto.resolucao.altura);
    ctxPintar.clearRect(0, 0, projeto.resolucao.largura, projeto.resolucao.altura);
}

function desenhoNoPreviewEIcone() {
    const ctxTelaPreview = previewFunctions.ctxTelaPreview;
    ctxTelaPreview.clearRect(0, 0, ctxTelaPreview.canvas.width, ctxTelaPreview.canvas.height);
    for (let i = 0; i < projeto.numeroCamadas; i++) {
        if (arrayCamadas[i].visivel === true) {
            const opacidadeCamada = arrayCamadas[i].opacidade;
            ctxTelaPreview.beginPath();
            ctxTelaPreview.globalAlpha = opacidadeCamada;
            ctxTelaPreview.drawImage(arrayCamadas[i].ctx.canvas, 0, 0, ctxTelaPreview.canvas.width, ctxTelaPreview.canvas.height);
            ctxTelaPreview.closePath();
        };
    }
    const larguraMiniatura = arrayCamadas[camadaSelecionada].ctxMiniatura.canvas.width,
        alturaMiniatura = arrayCamadas[camadaSelecionada].ctxMiniatura.canvas.height;
    arrayCamadas[camadaSelecionada].ctxMiniatura.clearRect(0, 0, larguraMiniatura, alturaMiniatura);
    arrayCamadas[camadaSelecionada].ctxMiniatura.globalAlpha = arrayCamadas[camadaSelecionada].opacidade;
    arrayCamadas[camadaSelecionada].ctxMiniatura.drawImage(arrayCamadas[camadaSelecionada].ctx.canvas, 0, 0, larguraMiniatura, alturaMiniatura);
}

function desenhoCompleto() {
    ctxDesenho.clearRect(0, 0, projeto.resolucao.largura, projeto.resolucao.altura);
    if (projeto.corFundo != false) {
        ctxDesenho.globalAlpha = 1;
        ctxDesenho.fillStyle = "rgb(" + projeto.corFundo.R + ", " + projeto.corFundo.G + ", " + projeto.corFundo.B + ")";
        ctxDesenho.fillRect(0, 0, projeto.resolucao.largura, projeto.resolucao.altura);
    }
    for (let i = 0; i < projeto.numeroCamadas; i++) {
        if (arrayCamadas[i].visivel === true) {
            const opacidadeCamada = arrayCamadas[i].opacidade;
            ctxDesenho.beginPath();
            ctxDesenho.globalAlpha = opacidadeCamada;
            ctxDesenho.drawImage(arrayCamadas[i].ctx.canvas, 0, 0, projeto.resolucao.largura, projeto.resolucao.altura);
            ctxDesenho.closePath();
        };
    }
}
// ==========================================================================================================================================================================================================================================

function ajustarTelasCanvas() {
    const larguraMax = contentTelas.offsetWidth - 12, alturaMax = contentTelas.offsetHeight - 12;
    if (projeto.resolucao.largura >= larguraMax || projeto.resolucao.altura >= alturaMax) {
        ajustarNaVisualizacaoTelasCanvas();
    }
    else { zoomNoProjeto("porcentagem", false, 100); }
}

function ajustarNaVisualizacaoTelasCanvas() {
    const larguraMax = contentTelas.offsetWidth - 12, alturaMax = contentTelas.offsetHeight - 12,
        proporcaoContent = larguraMax / alturaMax;
    let larguraTelasCanvas;
    if (projeto.resolucao.proporcao >= proporcaoContent) {
        let novaAltura = larguraMax / projeto.resolucao.proporcao;
        telasCanvas.style.width = larguraMax + "px";
        telasCanvas.style.height = novaAltura + "px";
        telasCanvas.style.top = ((alturaMax + 12) / 2) - (novaAltura / 2) + "px";
        telasCanvas.style.left = "6px";
        larguraTelasCanvas = larguraMax;
    }
    else {
        let novaLargura = alturaMax * projeto.resolucao.proporcao;
        telasCanvas.style.width = novaLargura + "px";
        telasCanvas.style.height = alturaMax + "px";
        telasCanvas.style.top = "6px";
        telasCanvas.style.left = ((larguraMax + 12) / 2) - (novaLargura / 2) + "px";
        larguraTelasCanvas = novaLargura;
    }
    let zoomTelasCanvas = ((larguraTelasCanvas * 100) / projeto.resolucao.largura).toFixed(2);
    zoomTelasCanvas = zoomTelasCanvas.replace(".", ",");
    txtPorcentagemZoom.value = zoomTelasCanvas + "%";
    previewFunctions.changeMoverScrollSizeZoom();
    drawingTools.changeCursorTool();
}
// ==========================================================================================================================================================================================================================================

function zoomNoProjeto(zoom, centralizar, quanto) {
    const larguraAnterior = telasCanvas.offsetWidth;
    let larguraAtual, alturaAtual;
    if (zoom === "porcentagem") {
        larguraAtual = projeto.resolucao.largura * (quanto / 100);
        alturaAtual = (larguraAtual / projeto.resolucao.proporcao);
        telasCanvas.style.width = larguraAtual + "px";
        telasCanvas.style.height = alturaAtual + "px";
    }
    else if (zoom === true) {
        larguraAtual = (larguraAnterior * quanto);
        alturaAtual = (larguraAtual / projeto.resolucao.proporcao);
        telasCanvas.style.width = larguraAtual + "px";
        telasCanvas.style.height = alturaAtual + "px";
    }
    else if (zoom === false) {
        larguraAtual = (larguraAnterior / quanto);
        alturaAtual = (larguraAtual / projeto.resolucao.proporcao);
        telasCanvas.style.width = larguraAtual + "px";
        telasCanvas.style.height = alturaAtual + "px";
    }
    if (larguraAtual >= (contentTelas.offsetWidth - 12)) { telasCanvas.style.left = "6px"; }
    else { telasCanvas.style.left = (contentTelas.offsetWidth / 2) - (larguraAtual / 2) + "px"; }
    if (alturaAtual >= (contentTelas.offsetHeight - 12)) { telasCanvas.style.top = "6px"; }
    else { telasCanvas.style.top = (contentTelas.offsetHeight / 2) - (alturaAtual / 2) + "px"; }
    if (centralizar === true) {
        contentTelas.scrollTop = ((alturaAtual / 2) + 12) - (contentTelas.offsetHeight / 2);
        contentTelas.scrollLeft = ((larguraAtual / 2) + 12) - (contentTelas.offsetWidth / 2);
    }
    txtPorcentagemZoom.value = ((larguraAtual * 100) / projeto.resolucao.largura).toFixed(2).replace(".", ",") + "%";
    previewFunctions.changeMoverScrollSizeZoom();
    drawingTools.changeCursorTool();
}
// ==========================================================================================================================================================================================================================================

function salvarDesenho() {
    desenhoCompleto();
    const blob = dataURLtoBlob(ctxDesenho.canvas.toDataURL("imagem/png"));
    const url = URL.createObjectURL(blob);
    const salvarImagem = document.getElementById("salvarImagem");
    salvarImagem.setAttribute("download", projeto.nome + ".png");
    salvarImagem.setAttribute("href", url);
    salvarImagem.click();
    function dataURLtoBlob(dataURI) {
        const BASE64_MARKER = ";base64,";
        const base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
        const base64 = dataURI.substring(base64Index);
        const raw = window.atob(base64);
        const rawLength = raw.length;
        let array = new Uint8Array(rawLength);
        for (i = 0; i < rawLength; i++) { array[i] = raw.charCodeAt(i); }
        const blob = new Blob([array], { type: "image/png" });
        return blob;
    }
}

function salvarProjeto() {
    let dadosCamadas = [], coresSalvasProjeto = [];
    for (let i = 0; i < projeto.numeroCamadas; i++) {
        dadosCamadas[i] = {
            imgDataCamada: arrayCamadas[i].ctx.canvas.toDataURL("imagem/png"),
            opacidade: arrayCamadas[i].opacidade,
            visivel: arrayCamadas[i].visivel,
        };
    }
    for (let i = 0; i < arrayCoresSalvas.length; i++) {
        coresSalvasProjeto[i] = arrayCoresSalvas[i].cor;
    }
    const objProjeto = {
        nomeProjeto: projeto.nome,
        resolucaoDoProjeto: projeto.resolucao,
        corDeFundo: projeto.corFundo,
        coresSalvas: coresSalvasProjeto,
        grid: {
            tamanho: grid.tamanho,
            posicao: grid.posicao,
            visivel: grid.visivel,
        },
        numeroDeCamadas: projeto.numeroCamadas,
        camadas: dadosCamadas
    }

    const data = encode(JSON.stringify(objProjeto));
    const blob = new Blob([data], { type: "application/octet-stream;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.getElementById("salvarProjeto");
    link.setAttribute("href", url);
    link.setAttribute("download", projeto.nome + ".gm");
    link.click();
    function encode(s) {
        let out = [];
        for (let i = 0; i < s.length; i++) {
            out[i] = s.charCodeAt(i);
        }
        return new Uint8Array(out);
    }
}

function abrirProjeto() {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.addEventListener("change", function (e) {
        const arquivo = e.target.files[0];
        const reader = new FileReader();
        reader.onload = function () {
            if (this.result === "") { alert("Este arquivo não possui projeto salvo!"); }
            else { carregarProjeto(this.result); }
        };

        if (!arquivo) { alert("Erro ao carregar projeto, tente novamente!"); }
        else {
            const extencao = arquivo.name.split('.').pop().toLowerCase();
            if (extencao === "gm") { reader.readAsText(arquivo, "ISO-8859-1"); }
            else { alert("Arquivo selecionado inválido!"); }
        }
    }, false);

    function carregarProjeto(projetoJSON) {
        const objProjeto = JSON.parse(projetoJSON), ctxTelaPreview = previewFunctions.ctxTelaPreview;
        arrayCamadas = [];
        arrayVoltarAlteracoes = [];
        arrayAvancarAlteracoes = [];
        criarProjeto(objProjeto.nomeProjeto, objProjeto.resolucaoDoProjeto, objProjeto.corDeFundo, objProjeto.numeroDeCamadas);
        for (let i = 0; i < projeto.numeroCamadas; i++) {
            const opacidade = objProjeto.camadas[i].opacidade;
            arrayCamadas[i].porcentagemOpa.value = Math.round(opacidade * 100) + "%";
            arrayCamadas[i].opacidade = opacidade;
            arrayCamadas[i].camada.style.opacity = opacidade;
            const imgData = new Image();
            imgData.src = objProjeto.camadas[i].imgDataCamada;
            imgData.onload = function () {
                arrayCamadas[i].ctx.drawImage(imgData, 0, 0);
                const opacidadeCamada = arrayCamadas[i].opacidade;
                const larguraMiniatura = arrayCamadas[i].ctxMiniatura.canvas.width, alturaMiniatura = arrayCamadas[i].ctxMiniatura.canvas.height;
                arrayCamadas[i].ctxMiniatura.clearRect(0, 0, larguraMiniatura, alturaMiniatura);
                arrayCamadas[i].ctxMiniatura.globalAlpha = opacidadeCamada;
                arrayCamadas[i].ctxMiniatura.drawImage(arrayCamadas[i].ctx.canvas, 0, 0, larguraMiniatura, alturaMiniatura);
                ctxTelaPreview.globalAlpha = opacidadeCamada;
                ctxTelaPreview.drawImage(arrayCamadas[i].ctx.canvas, 0, 0, ctxTelaPreview.canvas.width, ctxTelaPreview.canvas.height);
                if (objProjeto.camadas[i].visivel === false) {
                    clickCamadaVisivel.call(arrayCamadas[i].bttVer);
                };
            }
        }
        cursorOpacidadeCamada.style.left = ((arrayCamadas[0].opacidade * 200) - 7) + "px";
        for (let i = 0; i < objProjeto.coresSalvas.length; i++) {
            janelaSeleciona.salvarCor(objProjeto.coresSalvas[i]);
        }
        grid.tamanho = objProjeto.grid.tamanho;
        grid.posicao = objProjeto.grid.posicao;
        if (objProjeto.grid.visivel === true) {
            criarGrid(grid.tela, grid.tamanho, grid.posicao, true);
        }
    }
    input.click();
}

function criarOuAbrirProjeto() {
    const carregar = document.getElementById("carregamento");
    if (sessionStorage.getItem("abrirProjetoSalvo") === "true") {
        document.body.removeChild(carregar);
        abrirProjeto();
        sessionStorage.setItem("abrirProjetoSalvo", "false");
    }
    else if (sessionStorage.getItem("criarNovoProjeto") === "true") {
        document.body.removeChild(carregar);
        contentJanelaCriarProjeto.style.display = "flex";
        sessionStorage.setItem("criarNovoProjeto", "false");
    }
    else { carregamento(); }
    function carregamento() {
        const logoCarregamento = document.getElementById("logoCarregamento");
        logoCarregamento.style.transition = "opacity 1.5s linear";
        setTimeout(function () {
            logoCarregamento.style.opacity = "1";
            setTimeout(() => {
                const posLogo = logoBlack.getBoundingClientRect();
                logoCarregamento.style.transition = "width 500ms ease-out, height 500ms ease-out, opacity 500ms ease-out, top 500ms ease-out, left 500ms ease-out";
                logoCarregamento.style.height = "50px";
                logoCarregamento.style.width = "90px";
                logoCarregamento.style.opacity = "0.75";
                logoCarregamento.style.left = posLogo.left + 45 + "px";
                logoCarregamento.style.top = posLogo.top + 25 + "px";
                setTimeout(() => {
                    carregar.style.opacity = "0";
                    setTimeout(() => {
                        document.body.removeChild(carregar);
                    }, 1200);
                }, 350);
            }, 1550);
        }, 150);
    }
}

function pegarPosicaoMouse(elemento, e) {
    const pos = elemento.getBoundingClientRect();
    return { x: e.clientX - pos.left, y: e.clientY - pos.top }
}

function throttle(func, limit) {
    let inThrottle
    return function () {
        const args = arguments
        const context = this
        if (!inThrottle) {
            func.apply(context, args)
            inThrottle = true
            setTimeout(() => inThrottle = false, limit)
        }
    }
}