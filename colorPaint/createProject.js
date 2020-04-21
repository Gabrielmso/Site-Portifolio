function validarPropriedades() {
    const arrayPropriedades = [document.getElementById("txtNomeProjeto"),
    document.getElementById("txtLarguraProjeto"),
    document.getElementById("txtAlturaProjeto"),
    document.getElementById("corDeFundoProjeto"),
    document.getElementById("numeroCamadasProjeto")];
    for (let i = 0; i < arrayPropriedades.length; i++) {
        const el = arrayPropriedades[i];
        if (el.value === "") {
            campoInvalido(el);
            return;
        }
        else { el.style.backgroundColor = "rgba(0, 0, 0, 0)"; }
    }
    const nomeProjeto = (arrayPropriedades[0].value).replace(/ /g, "-"),
        larguraProjeto = parseInt(arrayPropriedades[1].value),
        alturaProjeto = parseInt(arrayPropriedades[2].value),
        valueCor = parseInt(arrayPropriedades[3].value),
        numeroCamadas = parseInt(arrayPropriedades[4].value);

    if (larguraProjeto > 2560 || larguraProjeto < 1) {
        campoInvalido(arrayPropriedades[1]);
        return;
    }
    else if (alturaProjeto > 1440 || alturaProjeto < 1) {
        campoInvalido(arrayPropriedades[2]);
        return;
    }
    else if (valueCor > 4 || valueCor < 1) {
        campoInvalido(arrayPropriedades[3]);
        return;
    }
    else if (numeroCamadas > 5 || numeroCamadas < 1) {
        campoInvalido(arrayPropriedades[4]);
        return;
    }
    let cor;
    if (valueCor === 1) { cor = { R: 255, G: 255, B: 255 }; }
    else if (valueCor === 2) { cor = { R: 0, G: 0, B: 0 }; }
    else if (valueCor === 3) { cor = false; }
    else { cor = corEscolhidaPrincipal; }
    for (let i = 0; i < arrayPropriedades.length; i++) { arrayPropriedades[i].style.backgroundColor = "rgb(37, 37, 37)"; }
    criarProjeto(nomeProjeto, { largura: larguraProjeto, altura: alturaProjeto }, cor, numeroCamadas);
    function campoInvalido(campo) {
        campo.focus();
        campo.style.backgroundColor = "rgba(255, 0, 0, 0.25)";
    }
}

function criarProjeto(nome, resolucao, corPlanoDeFundo, numeroCamadas) {
    const corFundo = document.getElementById("corFundo"), fundoPreview = document.getElementById("fundoPreview"),
        txtResolucao = document.getElementById("txtResolucao");
    projeto.nome = nome;
    projeto.resolucao.altura = resolucao.altura;
    projeto.resolucao.largura = resolucao.largura;
    projeto.resolucao.proporcao = resolucao.largura / resolucao.altura;
    projeto.numeroCamadas = numeroCamadas;
    projeto.corFundo = corPlanoDeFundo;
    let cor = false;
    if (projeto.corFundo != false) {
        cor = "rgb(" + projeto.corFundo.R + ", " + projeto.corFundo.G + ", " + projeto.corFundo.B + ")"
        corFundo.style.backgroundColor = cor;
        fundoPreview.style.backgroundColor = cor;
    } else {
        corFundo.style.backgroundImage = "url('colorPaint/imagens/fundoTela/transparente.png')";
        fundoPreview.style.backgroundImage = "url('colorPaint/imagens/fundoTela/transparenteMiniatura.png')";
    }
    ajustarTelasCanvas();
    ajustarPreview();
    ctxDesenho.canvas.width = projeto.resolucao.largura;
    ctxDesenho.canvas.height = projeto.resolucao.altura;
    ctxPintar.canvas.width = projeto.resolucao.largura;
    ctxPintar.canvas.height = projeto.resolucao.altura;
    txtResolucao.value = projeto.resolucao.largura + ", " + projeto.resolucao.altura;
    while (projeto.numeroCamadas > arrayCamadas.length) { criarElementos(cor, projeto.resolucao); }
    document.getElementById("nomeDoProjeto").innerText = projeto.nome;
    document.getElementById("propriedadeOpacidadeCamada").style.display = "flex";
    clickIconeCamada.call(arrayCamadas[0].icone);
    projetoCriado = true;
}

function criarElementos(cor, resolucao) {
    const num = arrayCamadas.length + 1;
    // ============= CRIA O ICONE DA CAMADA ==================
    const contentIconeCamadas = document.getElementById("contentIconeCamadas");
    const idicone = "camadaIcone" + num;
    const iconeCamada = document.createElement("div");
    iconeCamada.setAttribute("id", idicone);
    iconeCamada.setAttribute("class", "camadas");

    if (num === 1) { contentIconeCamadas.appendChild(iconeCamada); }
    else {
        const idElAnterior = "camadaIcone" + (num - 1);
        const elAnterior = document.getElementById(idElAnterior);
        contentIconeCamadas.insertBefore(iconeCamada, elAnterior);
    }
    contentIconeCamadas.scrollTop = contentIconeCamadas.scrollHeight;

    const bttVisivel = document.createElement("div");
    const idBttVisivel = "visivel" + num;
    bttVisivel.setAttribute("id", idBttVisivel);
    bttVisivel.setAttribute("class", "iconVer cursor");
    iconeCamada.appendChild(bttVisivel);

    const info = document.createElement("label");
    const idNome = "nomeCamada" + num;
    const nomeCamada = document.createElement("span");
    nomeCamada.setAttribute("id", idNome);
    nomeCamada.innerHTML = "Camada " + num;
    const br = document.createElement("br");
    const txtOpacidade = document.createElement("span");
    txtOpacidade.innerHTML = "Opacidade: ";
    const idPocentagem = "porcent" + num;
    const txtPorcentagem = document.createElement("input");
    txtPorcentagem.setAttribute("type", "text");
    txtPorcentagem.setAttribute("id", idPocentagem);
    txtPorcentagem.setAttribute("readOnly", "true");
    txtPorcentagem.setAttribute("class", "opacidadeCamada");
    txtPorcentagem.setAttribute("value", "100%");

    info.appendChild(nomeCamada);
    info.appendChild(br);
    info.appendChild(txtOpacidade);
    info.appendChild(txtPorcentagem);
    iconeCamada.appendChild(info);

    const contentMiniIcon = document.createElement("div");
    contentMiniIcon.setAttribute("class", "contentIcon");
    iconeCamada.appendChild(contentMiniIcon);

    const idIconTela = "iconTela" + num;
    const iconTela = document.createElement("canvas");
    iconTela.setAttribute("id", idIconTela);
    let styleIconTela;

    if (projeto.resolucao.proporcao >= 1) {
        const iconAltura = Math.round(80 / projeto.resolucao.proporcao);
        styleIconTela = "width: 80px; height: " + iconAltura + "px; ";
    }
    else {
        const iconLargura = Math.round(80 * projeto.resolucao.proporcao);
        styleIconTela = "width: " + iconLargura + "px; height: 80px; ";
    }

    if (cor != false) { styleIconTela = styleIconTela + "background-color: " + cor; }
    else { styleIconTela = styleIconTela + "background-image: url('colorPaint/imagens/fundoTela/transparenteMiniatura.png')"; }

    iconTela.setAttribute("style", styleIconTela);
    iconTela.setAttribute("class", "iconTela");
    contentMiniIcon.appendChild(iconTela);
    iconTela.width = Math.round(iconTela.offsetWidth * 1.6);
    iconTela.height = Math.round(iconTela.offsetHeight * 1.6);

    const sobrePor = document.createElement("div");
    contentMiniIcon.appendChild(sobrePor);

    // ============== CRIA A CAMADA ================
    const idCamada = "telaCamada" + num;
    const camadaStyle = "z-index: " + (num * 2) + ";";
    const elCamada = document.createElement("canvas");
    elCamada.setAttribute("id", idCamada);
    elCamada.setAttribute("class", "telaCanvas");
    elCamada.setAttribute("style", camadaStyle);
    elCamada.setAttribute("height", resolucao.altura);
    elCamada.setAttribute("width", resolucao.largura);
    telasCanvas.appendChild(elCamada);

    // ============== CRIA O PREVIEW DA CAMADA ================
    const idPreviewCamada = "camadaPreview" + num;
    const elPreviewCamada = document.createElement("canvas");
    elPreviewCamada.setAttribute("id", idPreviewCamada);
    elPreviewCamada.setAttribute("class", "preview");
    elPreviewCamada.setAttribute("style", camadaStyle);
    elPreviewCamada.setAttribute("height", Math.round(previewFunctions.ctxTelaPreview.canvas.height));
    elPreviewCamada.setAttribute("width", Math.round(previewFunctions.ctxTelaPreview.canvas.width));
    previewFunctions.contentTelaPreview.appendChild(elPreviewCamada);

    if (document.getElementById(idicone) != null && document.getElementById(idBttVisivel) != null &&
        document.getElementById(idNome) != null && document.getElementById(idPocentagem) != null &&
        document.getElementById(idIconTela) != null && document.getElementById(idCamada) != null &&
        document.getElementById(idPreviewCamada) != null) {
        const objCamada = {
            nome: nomeCamada,
            ctx: elCamada.getContext("2d"),
            icone: iconeCamada,
            ctxCamadaPreview: elPreviewCamada.getContext("2d"),
            ctxMiniatura: iconTela.getContext("2d"),
            bttVer: bttVisivel,
            porcentagemOpa: txtPorcentagem,
            opacidade: 1,
            visivel: true
        };
        arrayCamadas.push(objCamada);
        arrayCamadas[num - 1].icone.addEventListener("click", clickIconeCamada);
        arrayCamadas[num - 1].bttVer.addEventListener("mousedown", clickCamadaVisivel);
        arrayCamadas[num - 1].bttVer.addEventListener("mouseenter", mouseSobre);
        arrayCamadas[num - 1].bttVer.addEventListener("mouseleave", mouseFora);
    }
}

function clickIconeCamada() {
    if (MouseNoBttVer === false) {
        const txtId = this.getAttribute("id"),
            id = parseInt(txtId.substring(11, 15)),
            indiceArrayCamadas = id - 1;
        for (let i = 0; i < projeto.numeroCamadas; i++) {
            if (i === indiceArrayCamadas) {
                camadaSelecionada = i;
                ctxPintar.canvas.style.zIndex = (id * 2) + 1;
                this.classList.add("camadaSelecionada");
                this.classList.remove("camadas");
            }
            else {
                arrayCamadas[i].icone.classList.add("camadas");
                arrayCamadas[i].icone.classList.remove("camadaSelecionada");
            }
        }
        const opacidade = arrayCamadas[camadaSelecionada].opacidade,
            posCursorOpacidadeCamada = (200 * opacidade) - 7;
        cursorOpacidadeCamada.style.left = posCursorOpacidadeCamada + "px";
    }
}

function clickCamadaVisivel() {
    const txtId = this.getAttribute("id"),
        id = parseInt(txtId.substring(7, 11)),
        indiceArrayCamadas = id - 1;
    if (arrayCamadas[indiceArrayCamadas].visivel) {
        arrayCamadas[indiceArrayCamadas].ctx.canvas.style.display = "none";
        this.classList.replace("iconVer", "iconNaoVer");
    }
    else {
        arrayCamadas[indiceArrayCamadas].ctx.canvas.style.display = "block";
        this.classList.replace("iconNaoVer", "iconVer");
    }
    arrayCamadas[indiceArrayCamadas].visivel = !arrayCamadas[indiceArrayCamadas].visivel;
    desenhoNoPreviewEIcone(arrayCamadas[indiceArrayCamadas]);
}

function mouseSobre() {
    MouseNoBttVer = true;
}

function mouseFora() {
    MouseNoBttVer = false;
}

function ajustarPreview() {
    const proporcaoEspaco = 256 / 150, contentTelaPreview = previewFunctions.contentTelaPreview;
    if (projeto.resolucao.proporcao >= proporcaoEspaco) {
        const novaAltura = (256 / projeto.resolucao.proporcao);
        contentTelaPreview.style.width = "256px";
        contentTelaPreview.style.height = novaAltura + "px";
    }
    else {
        const novaLargura = (150 * projeto.resolucao.proporcao);
        contentTelaPreview.style.width = novaLargura + "px";
        contentTelaPreview.style.height = "150px";
    }
    previewFunctions.ctxTelaPreview.canvas.width = Math.round(contentTelaPreview.offsetWidth * 1.5);
    previewFunctions.ctxTelaPreview.canvas.height = Math.round(contentTelaPreview.offsetHeight * 1.5);
}