mudarMenu = false;
const grid = {//Propriedades do grid e da visualização do projeto antes de criar o grid, e saber se está visível.
    tela: null, tamanho: 80, posicao: { x: 0, y: 0 }, visivel: false, visualizacaoAnterior: { scrollX: 0, scrollY: 0, zoom: 0 }
};
let corPrincipal, corSecundaria, corPrincipalOuSecundaria;
let corEscolhidaPrincipal = { R: 0, G: 0, B: 0 };//Armazena a cor escolhida do primeiro plano.
let corEscolhidaSecudaria = { R: 255, G: 255, B: 255 };//Armazena a cor escolhida no segundo plano.
let project, drawingTools, undoRedoChange, hotKeys, previewFunctions;
let arrayCoresSalvas = [];//Armazena objetos cuja as propriedades possuem as informações sobre as cores salvas.
let janelaPrincipal;
let contentTelas;//Elemento onde ficará a "tela" para desenhar.
let telasCanvas;//Elemento onde ficarão os canvas "camadas".
let camadaSelecionada = 0;//Armazena a posição do arrayTelasCamadas com a camada selecionada.
let projetoCriado = false;//Saber se um projeto foi criado.
let txtCorEscolhida;//Recebe a string da cor do primeiro plano no formato RGB para informar ao usuário.
let txtPorcentagemZoom;//Recebe a string com a porcentagem de zoom no "telasCanvas".
let janelaSeleciona;//Recebe toda a função "janelaSeletorDeCor".
function colorPaint() {
    drawingTools = drawingToolsObject();
    project = projectObject();
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
    const contentCentro = document.getElementById("contentCentro");
    janelaPrincipal = document.getElementById("janelaPrincipal");
    contentTelas = document.getElementById("contentTelas");
    telasCanvas = document.getElementById("telasCanvas");
    corPrincipal = document.getElementById("corPrincipal");
    corSecundaria = document.getElementById("corSecundaria");
    txtCorEscolhida = document.getElementById("txtCorEscolhida");
    txtPorcentagemZoom = document.getElementById("txtPorcentagemZoom");
    grid.tela = document.getElementById("grid");
    janelaSeleciona = new janelaSeletorDeCor();

    menuPadrao();
    ajustarContents();
    criarOuAbrirProjeto();
    txtCorEscolhida.value = "rgb(" + corEscolhidaPrincipal.R + ", " + corEscolhidaPrincipal.G + ", " + corEscolhidaPrincipal.B + ")";

    project.addEventsToElements();
    drawingTools.addEventsToElements();
    previewFunctions.addEventsToElements();
    undoRedoChange.addEventsToElements();
    hotKeys.addEventsToElements();

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
        project.validateProperties();
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

    document.getElementById("bttZoomMais").addEventListener("click", function () {//Aumentar o zoom no projeto.
        if (projetoCriado === false) { return; };
        zoomNoProjeto(true, true, 1.25);
    });

    document.getElementById("bttZoomMenos").addEventListener("click", function () {//Diminuir o zoom no projeto.
        if (projetoCriado === false) { return; };
        if (telasCanvas.offsetWidth >= 25) { zoomNoProjeto(false, true, 1.25); }
    });

    txtPorcentagemZoom.addEventListener("keyup", function (e) {
        if (e.code === "Enter" || e.keyCode === 13) {
            const valor = parseFloat(((this.value).replace("%", "")).replace(",", "."));
            if (isNaN(valor) === false && valor >= 1) { zoomNoProjeto("porcentagem", true, valor); }
        }
    });

    document.getElementById("bttAtalhos").addEventListener("click", () => contentJanelaAtalhos.style.display = "flex");
    document.getElementById("bttOkAtalhos").addEventListener("click", () => contentJanelaAtalhos.style.display = "none");

    document.getElementById("colorPaintContent").addEventListener("wheel", function (e) {//Zoom com o scroll do mouse.
        if (hotKeys.ctrlPressed === true && projetoCriado === true) {
            e.preventDefault();
            if (e.deltaY < 0) { zoomNoProjeto(true, false, 1.11, e); }
            else { zoomNoProjeto(false, false, 1.11, e); }
            const posContentTelas = pegarPosicaoMouse(contentTelas, e);
            const proporcaoPosY = drawingTools.mousePosition.y / project.properties.resolution.height;
            const proporcaoPosX = drawingTools.mousePosition.x / project.properties.resolution.width;
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
// ==========================================================================================================================================================================================================================================

function criarGrid(tela, tamanho, posicao, criar) {
    const numDeQuadrados = (Math.trunc((project.properties.resolution.width / tamanho) + 2.099)) * (Math.trunc((project.properties.resolution.height / tamanho) + 2.099));
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
        const larguraTela = (project.properties.resolution.width + (tamanho * 2.1)),
            alturaTela = (project.properties.resolution.height + (tamanho * 2.1));
        const larguraQuadrado = ((tamanho / larguraTela) * 100), alturaQuadrado = ((tamanho / alturaTela) * 100);
        const styleQuadrado = "width: " + larguraQuadrado + "%; height: " + alturaQuadrado + "%;";
        tela.style.top = (-100 * ((tamanho - pos.y) / project.properties.resolution.height)) + "%";
        tela.style.left = (-100 * ((tamanho - pos.x) / project.properties.resolution.width)) + "%";
        tela.style.width = ((larguraTela / project.properties.resolution.width) * 100) + "%";
        tela.style.height = ((alturaTela / project.properties.resolution.height) * 100) + "%";
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

function desenharNaCamada(layer) {
    undoRedoChange.saveChanges(layer.ctx);
    layer.ctx.drawImage(project.eventLayer.canvas, 0, 0, project.properties.resolution.width, project.properties.resolution.height);
    project.eventLayer.clearRect(0, 0, project.properties.resolution.width, project.properties.resolution.height);
}

function desenhoNoPreviewEIcone(layer) {
    const camadaPreview = layer.previewLayer,
        miniatura = layer.miniature;
    camadaPreview.clearRect(0, 0, camadaPreview.canvas.width, camadaPreview.canvas.height);
    miniatura.clearRect(0, 0, miniatura.canvas.width, miniatura.canvas.height);
    camadaPreview.globalAlpha = layer.opacity;
    camadaPreview.drawImage(layer.ctx.canvas, 0, 0, camadaPreview.canvas.width, camadaPreview.canvas.height);
    miniatura.drawImage(camadaPreview.canvas, 0, 0, miniatura.canvas.width, miniatura.canvas.height);
}

function desenhoCompleto() {
    project.drawComplete.clearRect(0, 0, project.properties.resolution.width, project.properties.resolution.height);
    if (project.properties.background != false) {
        project.drawComplete.globalAlpha = 1;
        project.drawComplete.fillStyle = "rgb(" + project.properties.background.r + ", " + project.properties.background.g + ", " + project.properties.background.b + ")";
        project.drawComplete.fillRect(0, 0, project.properties.resolution.width, project.properties.resolution.height);
    }
    for (let i = 0; i < project.properties.numberLayers; i++) {
        if (project.arrayLayers[i].visible) {
            const opacidadeCamada = project.arrayLayers[i].opacity;
            project.drawComplete.beginPath();
            project.drawComplete.globalAlpha = opacidadeCamada;
            project.drawComplete.drawImage(project.arrayLayers[i].ctx.canvas, 0, 0, project.properties.resolution.width, project.properties.resolution.height);
            project.drawComplete.closePath();
        };
    }
}
// ==========================================================================================================================================================================================================================================

function ajustarTelasCanvas() {
    const larguraMax = contentTelas.offsetWidth - 12, alturaMax = contentTelas.offsetHeight - 12;
    if (project.properties.resolution.width >= larguraMax || project.properties.resolution.height >= alturaMax) {
        ajustarNaVisualizacaoTelasCanvas();
    }
    else { zoomNoProjeto("porcentagem", false, 100); }
}

function ajustarNaVisualizacaoTelasCanvas() {
    const larguraMax = contentTelas.offsetWidth - 12, alturaMax = contentTelas.offsetHeight - 12,
        proporcaoContent = larguraMax / alturaMax;
    let larguraTelasCanvas;
    if (project.properties.resolution.proportion >= proporcaoContent) {
        let novaAltura = larguraMax / project.properties.resolution.proportion;
        telasCanvas.style.width = larguraMax + "px";
        telasCanvas.style.height = novaAltura + "px";
        telasCanvas.style.top = ((alturaMax + 12) / 2) - (novaAltura / 2) + "px";
        telasCanvas.style.left = "6px";
        larguraTelasCanvas = larguraMax;
    }
    else {
        let novaLargura = alturaMax * project.properties.resolution.proportion;
        telasCanvas.style.width = novaLargura + "px";
        telasCanvas.style.height = alturaMax + "px";
        telasCanvas.style.top = "6px";
        telasCanvas.style.left = ((larguraMax + 12) / 2) - (novaLargura / 2) + "px";
        larguraTelasCanvas = novaLargura;
    }
    let zoomTelasCanvas = ((larguraTelasCanvas * 100) / project.properties.resolution.width).toFixed(2);
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
        larguraAtual = project.properties.resolution.width * (quanto / 100);
        alturaAtual = (larguraAtual / project.properties.resolution.proportion);
    }
    else if (zoom === true) {
        larguraAtual = (larguraAnterior * quanto);
        alturaAtual = (larguraAtual / project.properties.resolution.proportion);
    }
    else if (zoom === false) {
        larguraAtual = (larguraAnterior / quanto);
        alturaAtual = (larguraAtual / project.properties.resolution.proportion);
    }
    telasCanvas.style.width = larguraAtual + "px";
    telasCanvas.style.height = alturaAtual + "px";
    if (larguraAtual >= (contentTelas.offsetWidth - 12)) { telasCanvas.style.left = "6px"; }
    else { telasCanvas.style.left = (contentTelas.offsetWidth / 2) - (larguraAtual / 2) + "px"; }
    if (alturaAtual >= (contentTelas.offsetHeight - 12)) { telasCanvas.style.top = "6px"; }
    else { telasCanvas.style.top = (contentTelas.offsetHeight / 2) - (alturaAtual / 2) + "px"; }
    if (centralizar === true) {
        contentTelas.scrollTop = ((alturaAtual / 2) + 12) - (contentTelas.offsetHeight / 2);
        contentTelas.scrollLeft = ((larguraAtual / 2) + 12) - (contentTelas.offsetWidth / 2);
    }
    txtPorcentagemZoom.value = ((larguraAtual * 100) / project.properties.resolution.width).toFixed(2).replace(".", ",") + "%";
    previewFunctions.changeMoverScrollSizeZoom();
    drawingTools.changeCursorTool();
}
// ==========================================================================================================================================================================================================================================

function criarOuAbrirProjeto() {
    const carregar = document.getElementById("carregamento");
    if (sessionStorage.getItem("abrirProjetoSalvo") === "true") {
        document.body.removeChild(carregar);
        project.openProject();
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