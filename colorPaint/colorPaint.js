mudarMenu = false; //impede que o menu mude de estilo.
let janelaSelecionarCorVisivel = false;//Saber se a janela de seleção de cor está "aberta".
let corPrincipal, corSecundaria, corPrincipalOuSecundaria;
let corEscolhidaPrincipal = { R: 0, G: 0, B: 0 };//Armazena a cor escolhida do primeiro plano.
let corEscolhidaSecudaria = { R: 255, G: 255, B: 255 };//Armazena a cor escolhida no segundo plano.
let arrayCoresSalvas = [];//Armazena objetos cuja as propriedades possuem as informações sobre as cores salvas.
let arrayCamadas = [];//Armazena objetos cuja as propriedades possuem as informações sobre as camadas, como os elementos canvas, icones, etc.
let arrayTelasCamadas = [];//Armazena objetos cuja as propriedades possuem o contexto 2d das camadas, se elas são visíveis, a opacidade das camadas.
let arrayIconesCamadas = [];//Armazena o contexto 2d dos icones das camadas.
let telaPreview;//Armazena o canvas que será utilizado como preview do projeto.
let ctxTelaPreview;//Armazena o contexto 2d do preview.
let resolucaoProjeto = { largura: 0, altura: 0 };//Armazena a resolução que o usuário escolheu para o projeto.
let proporcaoProjeto = 0;//Armazena a relação entre largura e altura do projeto para ajustar os icones.
let contentTelas;//Elemento onde ficará a "tela" para desenhar.
let camadaSelecionada = 0;//Armazena a posição do arrayTelasCamadas com a camada selecionada.
let telasCanvas;//Elemento onde ficarão os canvas "camadas".
let desenho;//Armazena o canvas que receberá o "desenho completo".
let ctxDesenho;//Armazena o contexto 2d de "desenho".
let corFundo;//Div de fundo que receberá a cor de fundo escolhida para o projeto.
let pintar;//Armazena o canvas onde ocorrerá os "eventos" de pintura.
let ctxPintar;//Armazena o contexto 2d de "pintar".
let OpacidadeCorFerramenta = 100;//Armazena o valor da opacidade da cor de O a 100.
let projetoCriado = false;//Saber se existe projeto já criado.
let nomeDoProjeto;//Armazena o nome do projeto.
let txtCorEscolhida;//Recebe a string da cor do primeiro plano no formato RGB para informar ao usuário.
let txtResolucao;//Recebe a string da resolução que o usuário escolheu para o projeto para informar ao usuário.
let txtPosicaoCursor;
let janelaSeleciona;//Recebe toda a função "janelaSeletorDeCor".
let zoomTelasCanvas;//Armazena o quanto de zoom tem na "TelasCanvas".
let MouseNoBttVer = false;
let coordenadaClick = [];
let arrayVoltarAlteracoes = [];//Armazena as 20 últimas alterações no desenho. Comando Ctrl + Z.
let arrayAvancarAlteracoes = [];//Armazena as alterações que foram "voltadas". Comando Ctrl + Y.
function colorPaint() {
    const contentJanelaCriarProjeto = document.getElementById("contentJanelaCriarProjeto");
    const janelaPrincipal = document.getElementById("janelaPrincipal");
    const contentTools = document.getElementById("contentTools");
    const barraLateralEsquerda = document.getElementById("barraLateralEsquerda");
    const barraLateralDireita = document.getElementById("barraLateralDireita");
    const corAtual = document.getElementById("corAtual");
    contentTelas = document.getElementById("contentTelas");
    telasCanvas = document.getElementById("telasCanvas");
    corFundo = document.getElementById("corFundo");
    corPrincipal = document.getElementById("corPrincipal");
    corSecundaria = document.getElementById("corSecundaria");
    txtCorEscolhida = document.getElementById("txtCorEscolhida");
    txtResolucao = document.getElementById("txtResolucao");
    txtPosicaoCursor = document.getElementById("txtPosicaoCursor");
    pintar = document.getElementById("pintar");
    ctxPintar = pintar.getContext("2d");
    desenho = document.getElementById("desenho");
    ctxDesenho = desenho.getContext("2d");
    telaPreview = document.getElementById("telaPreview");
    ctxTelaPreview = telaPreview.getContext("2d");
    janelaSeleciona = new janelaSeletorDeCor(corEscolhidaPrincipal);
    let posicaoMouseX;
    let posicaoMouseY;
    let pintando = false;
    let ctrlPressionado = false;
    let ferramentaSelecionada = 1;
    let arrayFerramentas = [{ ferramenta: document.getElementById("pincel"), nome: "Pincel", id: 1 },
    { ferramenta: document.getElementById("borracha"), nome: "Borracha", id: 2 },]

    menuPadrao();
    ajustarContents();
    txtCorEscolhida.value = "rgb(" + corEscolhidaPrincipal.R + ", " + corEscolhidaPrincipal.G + ", " + corEscolhidaPrincipal.B + ")";

    for (let i = 0; i < arrayFerramentas.length; i++) {
        arrayFerramentas[i].ferramenta.addEventListener("click", function () {
            if (janelaSelecionarCorVisivel === false) {
                ferramentaSelecionada = arrayFerramentas[i].id;
                this.classList.remove("bttFerramentas");
                this.classList.add("bttFerramentasEscolhida");
                for (let e = 0; e < arrayFerramentas.length; e++) {
                    if (e != i) {
                        arrayFerramentas[e].ferramenta.classList.remove("bttFerramentasEscolhida");
                        arrayFerramentas[e].ferramenta.classList.add("bttFerramentas");
                    }
                }
            }
        });
    }

    document.getElementById("bttCriarNovoProjeto").addEventListener("click", function () {
        if (projetoCriado === false) {
            if (janelaSelecionarCorVisivel === false) {
                contentJanelaCriarProjeto.style.display = "flex";
            }
        }
        else {
            window.location.reload();
        }
    });

    corPrincipal.addEventListener("click", function () {
        if (janelaSelecionarCorVisivel === true) {
            janelaSeleciona.procurarCor(corEscolhidaPrincipal);
        }
        else {
            corPrincipalOuSecundaria = 1;
            corAtual.style.backgroundColor = "rgb(" + corEscolhidaPrincipal.R + ", " + corEscolhidaPrincipal.G + ", " + corEscolhidaPrincipal.B + ")";
            abrirJanelaSelecionarCor();
            janelaSeleciona.procurarCor(corEscolhidaPrincipal);
        }
    });

    corSecundaria.addEventListener("click", function () {
        if (janelaSelecionarCorVisivel === true) {
            janelaSeleciona.procurarCor(corEscolhidaSecudaria);
        }
        else {
            corPrincipalOuSecundaria = 2;
            corAtual.style.backgroundColor = "rgb(" + corEscolhidaSecudaria.R + ", " + corEscolhidaSecudaria.G + ", " + corEscolhidaSecudaria.B + ")";
            abrirJanelaSelecionarCor();
            janelaSeleciona.procurarCor(corEscolhidaSecudaria);
        }
    });

    document.getElementById("bttCoresPrincipais").addEventListener("mousedown", function () {//Coloca preto na corPrincipalEcolhida e branco na corSecundariaEscolhida.
        if (janelaSelecionarCorVisivel === false) {
            corEscolhidaPrincipal = { R: 0, G: 0, B: 0 };
            corEscolhidaSecudaria = { R: 255, G: 255, B: 255 };
            corPrincipal.style.backgroundColor = "rgb(" + corEscolhidaPrincipal.R + ", " + corEscolhidaPrincipal.G + ", " + corEscolhidaPrincipal.B + ")";
            corSecundaria.style.backgroundColor = "rgb(" + corEscolhidaSecudaria.R + ", " + corEscolhidaSecudaria.G + ", " + corEscolhidaSecudaria.B + ")";
            txtCorEscolhida.value = "rgb(" + corEscolhidaPrincipal.R + ", " + corEscolhidaPrincipal.G + ", " + corEscolhidaPrincipal.B + ")";
        }
    });

    document.getElementById("bttCriarprojeto").addEventListener("click", function () {
        criarProjeto();
        if (projetoCriado === true) {
            contentJanelaCriarProjeto.style.display = "none";
            txtResolucao.value = resolucaoProjeto.largura + ", " + resolucaoProjeto.altura;
        }
    });

    document.getElementById("bttCancelaCriarprojetor").addEventListener("click", function () {
        contentJanelaCriarProjeto.style.display = "none";
    });

    telasCanvas.addEventListener("mousemove", function () {
        txtPosicaoCursor.value = ((Math.floor(posicaoMouseX)) + 1) + ", " + ((Math.floor(posicaoMouseY)) + 1);
    });

    telasCanvas.addEventListener("mouseleave", function () {
        txtPosicaoCursor.value = "";
    });

    document.getElementById("bttAlternaCor").addEventListener("mousedown", function () {//Alterna entre a corPrincipalEcolhida e a corSecundariaEscolhida.
        if (janelaSelecionarCorVisivel === false) {
            corPrincipal.style.backgroundColor = "rgb(" + corEscolhidaSecudaria.R + ", " + corEscolhidaSecudaria.G + ", " + corEscolhidaSecudaria.B + ")";
            corSecundaria.style.backgroundColor = "rgb(" + corEscolhidaPrincipal.R + ", " + corEscolhidaPrincipal.G + ", " + corEscolhidaPrincipal.B + ")";
            let cor = corEscolhidaPrincipal;
            corEscolhidaPrincipal = corEscolhidaSecudaria;
            corEscolhidaSecudaria = cor;
            txtCorEscolhida.value = "rgb(" + corEscolhidaPrincipal.R + ", " + corEscolhidaPrincipal.G + ", " + corEscolhidaPrincipal.B + ")";
        }
    });

    telasCanvas.addEventListener("mousedown", function (e) {
        if (arrayTelasCamadas[camadaSelecionada].visivel === true) {
            pintando = true;
            guardarAlteracoes();
            if (ferramentaSelecionada === 1) {//Pincel.
                coordenadaClick.push({ x: posicaoMouseX, y: posicaoMouseY });
                ctxPintar.lineWidth = 7;
                ctxPintar.globalAlpha = 0.85;
                ctxPintar.strokeStyle = "rgb(" + corEscolhidaPrincipal.R + ", " + corEscolhidaPrincipal.G + ", " + corEscolhidaPrincipal.B + ")";
                ctxPintar.lineJoin = ctxPintar.lineCap = "round";
                ctxPintar.beginPath();
                ferramentaPincel(posicaoMouseX, posicaoMouseY);
            }
            else if (ferramentaSelecionada === 2) {//Borracha.    
                arrayTelasCamadas[camadaSelecionada].ctx.beginPath();
                arrayTelasCamadas[camadaSelecionada].ctx.lineCap = "square";
                arrayTelasCamadas[camadaSelecionada].ctx.lineJoin = "round"
                ferramentaBorrarra(arrayTelasCamadas[camadaSelecionada].ctx, posicaoMouseX, posicaoMouseY, 7, 0.4);
            }
        }
    });

    document.addEventListener("mousemove", function (e) {//Pegar a posição do mouse em relação ao "telaCanvas" e enquanto o mousse estiver pressionado executar a função referente a ferramenta escolhida.
        let pos = telasCanvas.getBoundingClientRect();
        let posMouseXTela = e.clientX - pos.left;
        let posMouseYTela = e.clientY - pos.top;
        posicaoMouseX = (resolucaoProjeto.largura / telasCanvas.offsetWidth) * posMouseXTela;
        posicaoMouseY = (resolucaoProjeto.altura / telasCanvas.offsetHeight) * posMouseYTela;
        if (pintando === true) {
            if (ferramentaSelecionada === 1) {//Pincel.
                ferramentaPincel(posicaoMouseX, posicaoMouseY);
            }
            else if (ferramentaSelecionada === 2) {//Borracha.
                arrayTelasCamadas[camadaSelecionada].ctx.lineCap = "round";
                arrayTelasCamadas[camadaSelecionada].ctx.lineJoin = "round";
                ferramentaBorrarra(arrayTelasCamadas[camadaSelecionada].ctx, posicaoMouseX, posicaoMouseY, 7, 0.4);
            }
        }
    });

    document.getElementById("bttZoomMais").addEventListener("click", function () {//Aumentar o zoom no projeto.
        zoomNoProjeto(true, 1.25);
    });

    document.getElementById("bttZoomMenos").addEventListener("click", function () {//Diminuir o zoom no projeto.
        if (telasCanvas.offsetWidth >= 25) {
            zoomNoProjeto(false, 1.25);
        }
    });

    document.addEventListener("mouseup", function () {
        if (pintando === true) {
            pintando = false;
            desenharNaCamada();
            DesenhoCompleto();
        }
        coordenadaClick = [];
    });

    telasCanvas.addEventListener("mouseup", function () {
        if (pintando === true) {
            pintando = false;
            desenharNaCamada();
            DesenhoCompleto();
        }
    });

    document.addEventListener("keydown", function (e) {//Criar teclas de atalho.
        if (projetoCriado === true) {
            if (ctrlPressionado === true) {
                if (e.code === "Digit0" || e.keyCode === 48) {
                    e.preventDefault();
                    AjustarnavisualizacaoTelasCanvas();
                }
                else if (e.code === "Digit1" || e.keyCode === 49) {
                    e.preventDefault();
                    zoomNoProjeto("porcentagem", 100);
                }
                else if (e.code === "Minus" || e.keyCode === 189) {
                    e.preventDefault();
                    zoomNoProjeto(false, 1.25);
                }
                else if (e.code === "Equal" || e.keyCode === 187) {
                    e.preventDefault();
                    zoomNoProjeto(true, 1.25);
                }
                else if (e.code === "KeyZ" || e.keyCode === 90) {
                    e.preventDefault();
                    voltarAlteracao();
                }
                else if (e.code === "KeyY" || e.keyCode === 89) {
                    e.preventDefault();
                    avancarAlteracao();
                }

            }
        }
        if (e.code === "ControlRight" || e.code === "ControlLeft" || e.keyCode === 17) {
            ctrlPressionado = true;
        }
    });

    document.addEventListener("keyup", function (e) {
        if (e.code === "ControlRight" || e.code === "ControlLeft") {
            ctrlPressionado = false;
        }
    });

    window.addEventListener("resize", function () {
        ajustarContents();
        ajustarTelasCanvas();
        menuPadrao();
        setTimeout(function () {
            ajustarContents();
            menuPadrao();
        }, 120);
    });

    window.addEventListener("scroll", function () {
        menuPadrao();
        setTimeout(function () {
            menuPadrao();
        }, 120);
    });

    function menuPadrao() {
        menu.classList.remove("iniciomenu");
        menu.classList.add("mudamenu");
        logoBlack.classList.remove("iniciologoBlack");
        logoBlack.classList.add("mudalogoBlack");
        iconesetablack.classList.remove("inicioiconeblack");
        iconesetablack.classList.add("mudaiconeblack");
        iconemenublack.classList.remove("inicioiconeblack");
        iconemenublack.classList.add("mudaiconeblack");
        for (let i = 0; i < arrayop.length; i++) {
            arrayop[i].classList.remove("inicioopcoes");
            arrayop[i].classList.add("mudaopcoes");
        }
    }

    function ajustarContents() {
        contentTools.style.height = janelaPrincipal.offsetHeight - 90 + "px";
        contentTelas.style.width = contentTools.offsetWidth - barraLateralEsquerda.offsetWidth - barraLateralDireita.offsetWidth - 1 + "px";
        contentTelas.style.height = contentTools.style.height;
    }
}
// ==========================================================================================================================================================================================================================================

function ferramentaPincel(mouseX, mouseY) {
    coordenadaClick.push({ x: mouseX, y: mouseY });
    ctxPintar.clearRect(0, 0, resolucaoProjeto.largura, resolucaoProjeto.altura);
    let ponto1 = coordenadaClick[0];
    let ponto2 = coordenadaClick[1];
    ctxPintar.beginPath();
    ctxPintar.moveTo(ponto1.x, ponto1.y);
    for (let i = 0; i < coordenadaClick.length; i++) {
        let midPoint = midPointBtw(ponto1, ponto2);
        ctxPintar.quadraticCurveTo(ponto1.x, ponto1.y, midPoint.x, midPoint.y);
        ponto1 = coordenadaClick[i];
        ponto2 = coordenadaClick[i + 1];
    }
    ctxPintar.lineTo(ponto1.x, ponto1.y);
    ctxPintar.stroke();

    function midPointBtw(ponto1, ponto2) {
        return {
            x: ponto1.x + (ponto2.x - ponto1.x) / 2,
            y: ponto1.y + (ponto2.y - ponto1.y) / 2
        };
    }
}

function ferramentaBorrarra(contexto, mouseX, mouseY, tamanho, opacidade) {
    contexto.globalCompositeOperation = "destination-out";
    contexto.strokeStyle = "rgb(0, 0, 0)";
    contexto.lineWidth = tamanho;
    contexto.lineTo(mouseX, mouseY);
    contexto.stroke();
    contexto.globalCompositeOperation = "source-over";
}

function desenharNaCamada() {
    // let opacidade = (OpacidadeCorFerramenta / 100);
    // arrayTelasCamadas[camadaSelecionada].ctx.globalAlpha = opacidade;
    arrayTelasCamadas[camadaSelecionada].ctx.drawImage(ctxPintar.canvas, 0, 0, resolucaoProjeto.largura, resolucaoProjeto.altura);
    ctxPintar.clearRect(0, 0, resolucaoProjeto.largura, resolucaoProjeto.altura);
}

function DesenhoCompleto() {
    ctxTelaPreview.clearRect(0, 0, ctxTelaPreview.canvas.width, ctxTelaPreview.canvas.height);
    ctxDesenho.clearRect(0, 0, resolucaoProjeto.largura, resolucaoProjeto.altura);
    for (let i = 0; i < arrayTelasCamadas.length; i++) {
        if (arrayTelasCamadas[i].visivel === true) {
            let opacidadeCamada = (arrayTelasCamadas[i].opacidade / 100);
            ctxTelaPreview.beginPath();
            ctxTelaPreview.globalAlpha = opacidadeCamada;
            ctxTelaPreview.drawImage(arrayTelasCamadas[i].ctx.canvas, 0, 0, ctxTelaPreview.canvas.width, ctxTelaPreview.canvas.height);
            ctxTelaPreview.closePath();

            ctxDesenho.beginPath();
            ctxDesenho.globalAlpha = opacidadeCamada;
            ctxDesenho.drawImage(arrayTelasCamadas[i].ctx.canvas, 0, 0, resolucaoProjeto.largura, resolucaoProjeto.altura);
            ctxDesenho.closePath();
        };
    }
    arrayIconesCamadas[camadaSelecionada].clearRect(0, 0, arrayIconesCamadas[camadaSelecionada].canvas.width, arrayIconesCamadas[camadaSelecionada].canvas.height);
    arrayIconesCamadas[camadaSelecionada].drawImage(arrayTelasCamadas[camadaSelecionada].ctx.canvas, 0, 0, arrayIconesCamadas[camadaSelecionada].canvas.width, arrayIconesCamadas[camadaSelecionada].canvas.height);
}
// ==========================================================================================================================================================================================================================================

function guardarAlteracoes() {
    let objAlteracao = { camadaAlterada: camadaSelecionada, alteracao: arrayTelasCamadas[camadaSelecionada].ctx.getImageData(0, 0, resolucaoProjeto.largura, resolucaoProjeto.altura) };
    arrayVoltarAlteracoes.push(objAlteracao);
    arrayAvancarAlteracoes = [];
    if (arrayVoltarAlteracoes.length > 20) {
        arrayVoltarAlteracoes.shift();
    }
}

function voltarAlteracao() {
    if (arrayVoltarAlteracoes.length > 0) {
        let ultimoIndice = arrayVoltarAlteracoes.length - 1;
        let camada = arrayVoltarAlteracoes[ultimoIndice].camadaAlterada;
        let imagemCamada = arrayVoltarAlteracoes[ultimoIndice].alteracao;
        let objAlteracao = { camadaAlterada: camada, visivel: arrayTelasCamadas[camada].visivel, alteracao: arrayTelasCamadas[camada].ctx.getImageData(0, 0, resolucaoProjeto.largura, resolucaoProjeto.altura) };
        if (camadaSelecionada != camada) {
            clickIconeCamada.call(arrayCamadas[camada].icone);
        }
        if (arrayTelasCamadas[camada].visivel === false) {
            clickCamadaVisivel.call(arrayCamadas[camada].bttVer);
            return;
        }
        arrayAvancarAlteracoes.push(objAlteracao);
        arrayTelasCamadas[camada].ctx.clearRect(0, 0, resolucaoProjeto.largura, resolucaoProjeto.altura);
        arrayTelasCamadas[camada].ctx.putImageData(imagemCamada, 0, 0);
        arrayVoltarAlteracoes.pop();
        DesenhoCompleto();
    }
}

function avancarAlteracao() {
    if (arrayAvancarAlteracoes.length > 0) {
        let ultimoIndice = arrayAvancarAlteracoes.length - 1;
        let camada = arrayAvancarAlteracoes[ultimoIndice].camadaAlterada;
        let imagemCamada = arrayAvancarAlteracoes[ultimoIndice].alteracao;
        let objAlteracao = { camadaAlterada: camada, visivel: arrayTelasCamadas[camada].visivel, alteracao: arrayTelasCamadas[camada].ctx.getImageData(0, 0, resolucaoProjeto.largura, resolucaoProjeto.altura) };
        if (camadaSelecionada != camada) {
            clickIconeCamada.call(arrayCamadas[camada].icone);
        }
        arrayVoltarAlteracoes.push(objAlteracao);
        arrayTelasCamadas[camada].ctx.clearRect(0, 0, resolucaoProjeto.largura, resolucaoProjeto.altura);
        arrayTelasCamadas[camada].ctx.putImageData(imagemCamada, 0, 0);
        arrayAvancarAlteracoes.pop();
        DesenhoCompleto();
    }
}

// ==========================================================================================================================================================================================================================================

function criarProjeto() {
    let arrayPropriedades = [document.getElementById("txtNomeProjeto"),
    document.getElementById("txtLarguraProjeto"),
    document.getElementById("txtAlturaProjeto"),
    document.getElementById("corDeFundoProjeto"),
    document.getElementById("numeroCamadasProjeto")];

    if (validarPropriedades()) {
        for (let i = 0; i < arrayPropriedades.length; i++) {
            let el = arrayPropriedades[i];
            el.style.backgroundColor = "rgb(37, 37, 37)";
        }
        let corDeFundo;
        nomeDoProjeto = (arrayPropriedades[0].value).replace(" ", "-");
        let resolucaoTela = { largura: parseInt(arrayPropriedades[1].value), altura: parseInt(arrayPropriedades[2].value) };
        resolucaoProjeto = resolucaoTela;
        proporcaoProjeto = resolucaoProjeto.largura / resolucaoProjeto.altura;
        let numCamadas = parseInt(arrayPropriedades[4].value);
        let cor;
        if (arrayPropriedades[3].value === "1") {
            corDeFundo = { R: 255, G: 255, B: 255 };
            cor = "rgb(" + corDeFundo.R + ", " + corDeFundo.G + ", " + corDeFundo.B + ")";
        }
        else if (arrayPropriedades[3].value === "2") {
            corDeFundo = { R: 0, G: 0, B: 0 };
            cor = "rgb(" + corDeFundo.R + ", " + corDeFundo.G + ", " + corDeFundo.B + ")";
        }
        else if (arrayPropriedades[3].value === "3") {
            corDeFundo = false;
            cor = false;
        }
        else if (arrayPropriedades[3].value === "4") {
            corDeFundo = corEscolhidaPrincipal;
            cor = "rgb(" + corDeFundo.R + ", " + corDeFundo.G + ", " + corDeFundo.B + ")";
        }
        while (numCamadas > arrayCamadas.length) {
            criarCamada(cor, resolucaoTela);
        }
        ajustarTelasCanvas();
        camadaSelecionada = 0;
        arrayCamadas[0].icone.classList.add("camadaSalecionada");
        arrayCamadas[0].icone.classList.remove("camadas");
        if (corDeFundo != false) {
            corFundo.style.backgroundColor = cor;
        }
        desenho.width = resolucaoProjeto.largura;
        desenho.height = resolucaoProjeto.altura;
        pintar.width = resolucaoProjeto.largura;
        pintar.height = resolucaoProjeto.altura;
        ajustarPreview(cor);
        projetoCriado = true;
    }

    function validarPropriedades() {
        for (let i = 0; i < arrayPropriedades.length; i++) {
            let el = arrayPropriedades[i];
            if (el.value === "") {
                el.focus();
                el.style.backgroundColor = "rgba(255, 0, 0, 0.25)"
                return false;
            }
            else {
                el.style.backgroundColor = "rgba(0, 0, 0, 0)"
            }
        }
        if (parseInt(arrayPropriedades[1].value) > 2560 || parseInt(arrayPropriedades[1].value) < 1) {
            arrayPropriedades[1].focus();
            arrayPropriedades[1].style.backgroundColor = "rgba(255, 0, 0, 0.25)";
            return false;
        }
        else if (parseInt(arrayPropriedades[2].value) > 1440 || parseInt(arrayPropriedades[2].value) < 1) {
            arrayPropriedades[2].focus();
            arrayPropriedades[2].style.backgroundColor = "rgba(255, 0, 0, 0.25)";
            return false;
        }
        else if (parseInt(arrayPropriedades[3].value) > 4 || parseInt(arrayPropriedades[3].value) < 1) {
            arrayPropriedades[3].focus();
            arrayPropriedades[3].style.backgroundColor = "rgba(255, 0, 0, 0.25)";
            return false;
        }
        else if (parseInt(arrayPropriedades[4].value) > 5 || parseInt(arrayPropriedades[4].value) < 1) {
            arrayPropriedades[4].focus();
            arrayPropriedades[4].style.backgroundColor = "rgba(255, 0, 0, 0.25)";
            return false;
        }
        return true;
    }
}
// ==========================================================================================================================================================================================================================================

function criarCamada(cor, resolucao) {
    let num = arrayCamadas.length + 1;
    // ============= CRIA O ICONE DA CAMADA ==================
    const contentIconeCamadas = document.getElementById("contentIconeCamadas");
    let idicone = "camadaIcone" + num;
    let iconeCamada = document.createElement("div");
    iconeCamada.setAttribute("id", idicone);
    iconeCamada.setAttribute("class", "camadas");

    if (num === 1) {
        contentIconeCamadas.appendChild(iconeCamada);
    }
    else {
        let idElAnterior = "camadaIcone" + (num - 1);
        const elAnterior = document.getElementById(idElAnterior);
        contentIconeCamadas.insertBefore(iconeCamada, elAnterior);
    }
    contentIconeCamadas.scrollTop = contentIconeCamadas.scrollHeight;

    let bttVisivel = document.createElement("div");
    let idBttVisivel = "visivel" + num;
    bttVisivel.setAttribute("id", idBttVisivel);
    bttVisivel.setAttribute("class", "iconVer cursor");
    iconeCamada.appendChild(bttVisivel);

    let info = document.createElement("label");
    let idNome = "nomeCamada" + num;
    let nomeCamada = document.createElement("span");
    nomeCamada.setAttribute("id", idNome);
    nomeCamada.innerHTML = "Camada " + num;
    let br = document.createElement("br");
    let txtOpacidade = document.createElement("span");
    txtOpacidade.innerHTML = "Opacidade: ";
    let idPocentagem = "porcent" + num;
    let txtPorcentagem = document.createElement("span");
    txtPorcentagem.setAttribute("id", idPocentagem);
    txtPorcentagem.innerHTML = "100";
    let simbolo = document.createElement("span");
    simbolo.innerHTML = "%";

    info.appendChild(nomeCamada);
    info.appendChild(br);
    info.appendChild(txtOpacidade);
    info.appendChild(txtPorcentagem);
    info.appendChild(simbolo);
    iconeCamada.appendChild(info);

    let contentMiniIcon = document.createElement("div");
    contentMiniIcon.setAttribute("class", "contentIcon");
    iconeCamada.appendChild(contentMiniIcon);

    let idIconTela = "iconTela" + num;
    let iconTela = document.createElement("canvas");
    iconTela.setAttribute("id", idIconTela);
    let styleIconTela;

    if (proporcaoProjeto >= 1) {
        let iconAltura = Math.round(80 / proporcaoProjeto);
        styleIconTela = "width: 80px; height: " + iconAltura + "px; ";
    }
    else {
        let iconLargura = Math.round(80 * proporcaoProjeto);
        styleIconTela = "width: " + iconLargura + "px; height: 80px; ";
    }

    if (cor != false) {
        styleIconTela = styleIconTela + "background-color: " + cor;
    }
    else {
        styleIconTela = styleIconTela + "background-image: url('/colorPaint/imagens/fundoTela/transparenteMiniatura.png')";
    }

    iconTela.setAttribute("style", styleIconTela);
    iconTela.setAttribute("class", "iconTela");
    contentMiniIcon.appendChild(iconTela);
    iconTela.width = iconTela.offsetWidth;
    iconTela.height = iconTela.offsetHeight;

    let sobrePor = document.createElement("div");
    contentMiniIcon.appendChild(sobrePor);

    // ============== CRIA A CAMADA ================
    let idCamada = "telaCamada" + num;
    let camadaStyle = "z-index: " + (num * 2) + ";";
    let elCamada = document.createElement("canvas");
    elCamada.setAttribute("id", idCamada);
    elCamada.setAttribute("class", "telaCanvas");
    elCamada.setAttribute("style", camadaStyle);
    elCamada.setAttribute("height", resolucao.altura);
    elCamada.setAttribute("width", resolucao.largura);
    telasCanvas.appendChild(elCamada);

    if (document.getElementById(idicone) != null &&
        document.getElementById(idBttVisivel) != null &&
        document.getElementById(idNome) != null &&
        document.getElementById(idPocentagem) != null &&
        document.getElementById(idIconTela) != null &&
        document.getElementById(idCamada) != null) {
        let objCamada = {
            id: num,
            nome: nomeCamada,
            camada: elCamada,
            icone: iconeCamada,
            miniatura: iconTela,
            bttVer: bttVisivel,
            porcentagemOpa: txtPorcentagem,
        };

        arrayCamadas.push(objCamada);
        arrayCamadas[arrayCamadas.length - 1].icone.addEventListener("click", clickIconeCamada);
        arrayCamadas[arrayCamadas.length - 1].bttVer.addEventListener("mousedown", clickCamadaVisivel);
        arrayCamadas[arrayCamadas.length - 1].bttVer.addEventListener("mouseenter", mouseSobre);
        arrayCamadas[arrayCamadas.length - 1].bttVer.addEventListener("mouseleave", mouseFora);

        let objTela = {
            id: num,
            ctx: arrayCamadas[arrayCamadas.length - 1].camada.getContext("2d"),
            opacidade: 100,
            visivel: true
        }
        arrayTelasCamadas.push(objTela);
        arrayIconesCamadas.push(arrayCamadas[arrayCamadas.length - 1].miniatura.getContext("2d"));
    }
}
// ==========================================================================================================================================================================================================================================

function clickIconeCamada() {
    if (MouseNoBttVer === false) {
        let txtId = this.getAttribute("id");
        id = txtId.substring(11, 15);
        id = parseInt(id);
        let indiceArrayCamadas = id - 1;
        for (let i = 0; i < arrayCamadas.length; i++) {
            if (i === indiceArrayCamadas) {
                camadaSelecionada = i;
                pintar.style.zIndex = (id * 2) + 1;
                this.classList.add("camadaSalecionada");
                this.classList.remove("camadas");
            }
            else {
                arrayCamadas[i].icone.classList.add("camadas");
                arrayCamadas[i].icone.classList.remove("camadaSalecionada");
            }
        }
    }
}
// ==========================================================================================================================================================================================================================================

function clickCamadaVisivel() {
    let txtId = this.getAttribute("id");
    id = txtId.substring(7, 11);
    id = parseInt(id);
    let indiceArrayCamadas = id - 1;
    let visible = arrayTelasCamadas[indiceArrayCamadas].visivel;
    if (visible === true) {
        arrayTelasCamadas[indiceArrayCamadas].visivel = false;
        arrayCamadas[indiceArrayCamadas].camada.style.display = "none";
        this.classList.add("iconNaoVer");
        this.classList.remove("iconVer");
    }
    else {
        arrayTelasCamadas[indiceArrayCamadas].visivel = true;
        arrayCamadas[indiceArrayCamadas].camada.style.display = "block";
        this.classList.add("iconVer");
        this.classList.remove("iconNaoVer");
    }
    DesenhoCompleto();
}

function mouseSobre() {
    MouseNoBttVer = true;
}

function mouseFora() {
    MouseNoBttVer = false;
}
// ==========================================================================================================================================================================================================================================

function ajustarTelasCanvas() {
    let larguraMax = contentTelas.offsetWidth - 10;
    let alturaMax = contentTelas.offsetHeight - 10;

    if (resolucaoProjeto.largura > larguraMax && resolucaoProjeto.altura > alturaMax) {
        AjustarnavisualizacaoTelasCanvas();
    }
    else if (resolucaoProjeto.largura > larguraMax) {
        let novaAltura = larguraMax / proporcaoProjeto;
        telasCanvas.style.width = larguraMax + "px";
        telasCanvas.style.height = novaAltura + "px";
        telasCanvas.style.top = alturaMax / 2 - novaAltura / 2 + "px"
        telasCanvas.style.left = "5px";
    }
    else if (resolucaoProjeto.altura > alturaMax) {
        let novaLargura = alturaMax * proporcaoProjeto;
        telasCanvas.style.width = novaLargura + "px";
        telasCanvas.style.height = alturaMax + "px";
        telasCanvas.style.top = "5px";
        telasCanvas.style.left = larguraMax / 2 - novaLargura / 2 + "px";
    }
    else {
        telasCanvas.style.width = resolucaoProjeto.largura + "px";
        telasCanvas.style.height = resolucaoProjeto.altura + "px";
        telasCanvas.style.top = alturaMax / 2 - resolucaoProjeto.altura / 2 + "px";
        telasCanvas.style.left = larguraMax / 2 - resolucaoProjeto.largura / 2 + "px";
    }
    zoomTelasCanvas = telasCanvas.offsetWidth / resolucaoProjeto.largura;
}

function AjustarnavisualizacaoTelasCanvas() {
    let larguraMax = contentTelas.offsetWidth - 10;
    let alturaMax = contentTelas.offsetHeight - 10;
    let proporcaoContent = larguraMax / alturaMax;
    let larguraTelasCanvas;
    if (proporcaoProjeto >= proporcaoContent) {
        let novaAltura = larguraMax / proporcaoProjeto;
        telasCanvas.style.width = larguraMax + "px";
        telasCanvas.style.height = novaAltura + "px";
        telasCanvas.style.top = alturaMax / 2 - novaAltura / 2 + "px";
        telasCanvas.style.left = "5px";
        larguraTelasCanvas = larguraMax;
    }
    else {
        let novaLargura = alturaMax * proporcaoProjeto;
        telasCanvas.style.width = novaLargura + "px";
        telasCanvas.style.height = alturaMax + "px";
        telasCanvas.style.top = "5px";
        telasCanvas.style.left = larguraMax / 2 - novaLargura / 2 + "px";
        larguraTelasCanvas = novaLargura;
    }
    zoomTelasCanvas = larguraTelasCanvas / resolucaoProjeto.largura;
}
// ==========================================================================================================================================================================================================================================

function ajustarPreview(cor) {
    document.getElementById("bttsZoomPreview").style.display = "block";
    let proporcaoEspaco = 256 / 150;
    if (proporcaoProjeto >= proporcaoEspaco) {
        let novaAltura = Math.round(256 / proporcaoProjeto);
        telaPreview.style.width = "256px";
        telaPreview.style.height = novaAltura + "px";
    }
    else {
        let novaLargura = Math.round(150 * proporcaoProjeto);
        telaPreview.style.width = novaLargura + "px";
        telaPreview.style.height = "150px";
    }
    if (cor != false) {
        telaPreview.style.backgroundColor = cor;
    }
    else {
        telaPreview.style.backgroundImage = "url('/colorPaint/imagens/fundoTela/transparenteMiniatura.png')";
    }
    telaPreview.width = telaPreview.offsetWidth;
    telaPreview.height = telaPreview.offsetHeight;
}
// ==========================================================================================================================================================================================================================================

function zoomNoProjeto(zoom, quanto) {
    let larguraAnterior = telasCanvas.offsetWidth;
    let larguraAtual;
    let alturaAtual;

    if (zoom === "porcentagem") {
        larguraAtual = resolucaoProjeto.largura * (quanto / 100);
        alturaAtual = larguraAtual / proporcaoProjeto;
        telasCanvas.style.width = larguraAtual + "px";
        telasCanvas.style.height = alturaAtual + "px";
    }
    else if (zoom === true) {
        larguraAtual = larguraAnterior * quanto;
        alturaAtual = larguraAtual / proporcaoProjeto;
        telasCanvas.style.width = larguraAtual + "px";
        telasCanvas.style.height = alturaAtual + "px";
    }
    else if (zoom === false) {
        larguraAtual = larguraAnterior / quanto;
        alturaAtual = larguraAtual / proporcaoProjeto;
        telasCanvas.style.width = larguraAtual + "px";
        telasCanvas.style.height = alturaAtual + "px";
    }

    if (larguraAtual >= (contentTelas.offsetWidth - 10)) {
        telasCanvas.style.left = "5px";
    }
    else {
        telasCanvas.style.left = (contentTelas.offsetWidth / 2) - (larguraAtual / 2) + "px";
    }
    if (alturaAtual >= (contentTelas.offsetHeight - 10)) {
        telasCanvas.style.top = "5px";
    }
    else {
        telasCanvas.style.top = (contentTelas.offsetHeight / 2) - (alturaAtual / 2) + "px";
    }

    contentTelas.scrollTop = ((alturaAtual / 2) + 10) - (contentTelas.offsetHeight / 2);
    contentTelas.scrollLeft = ((larguraAtual / 2) + 10) - (contentTelas.offsetWidth / 2);

    zoomTelasCanvas = ((larguraAtual * 100) / resolucaoProjeto.largura).toFixed(2);
    zoomTelasCanvas = zoomTelasCanvas.replace(".", ",");
    zoomTelasCanvas = zoomTelasCanvas + "%";
}
// ==========================================================================================================================================================================================================================================

function janelaSeletorDeCor(AcharCor) {
    let corEscolhida = { R: 0, G: 0, B: 0 }; //Armazena a cor selecionada com o cursor "cursorGradiente";
    const coresSalvas = document.getElementById("coresSalvas"),
        colorPaintContent = document.getElementById("colorPaintContent"),
        janelaSelecionarCor = document.getElementById("janelaSelecionarCor"),
        bttOk = document.getElementById("bttOk"),
        bttSalvarCor = document.getElementById("bttSalvarCor"),
        bttRemoverCorSalva = document.getElementById("bttRemoverCorSalva"),
        bttCancelar = document.getElementById("bttCancelar"),
        corSelecionada = document.getElementById("corSelecionada"),//div que receberá a cor selecionada.
        barraeEspectroCor = document.getElementById("barraeEspectroCor"),//Canvas que receberá o espectro de cores.
        cursorBarra = document.getElementById("cursorBarra"),//Cursor que fica na "barraeEspectroCor".
        gradienteCor = document.getElementById("gradienteCor"),//Canvas que receberá o gradiente de cores da cor seleciona pelo cursor que fica na "barraeEspectroCor".
        codRGB = document.getElementById("codRGB"),
        codHEX = document.getElementById("codHEX");

    const widthBarra = barraeEspectroCor.width, heightBarra = barraeEspectroCor.height;//Altura e largura do canvas "barraeEspectroCor" (Resolução).
    const widthGradiente = gradienteCor.width, heightGradiente = gradienteCor.height;//Altura e largura do canvas "gradienteCor" (Resolução).
    const cursorGradiente = document.getElementById("cursorGradiente");//Cursor que fica na "gradienteCor".

    let ctxBarra = barraeEspectroCor.getContext("2d");
    let ctxGradiente = gradienteCor.getContext("2d");
    let rgbBarra = { R: 255, G: 0, B: 0 };
    let hsvBarra = { H: 0, S: 100, V: 100 };
    let corParaAchar = {};//Armazena a cor a ser encontrada no formato RGB que foi digitada no "codRGB".
    let clickBarra = false;//Saber se o click do mouse foi ou está pressionado em cima do "barraeEspectroCor".
    let clickGradiente = false;//Saber se o click do mouse foi ou está pressionado em cima do "gradienteCor".
    let clickMoverJanela = false;
    let posMouseMoverJanela = {};
    let posMouseSeletorCorX = 0;//Armazena a posição atual no eixo X na "janelaSelecionarCor";
    let posMouseSeletorCorY = 0;//Armazena a posição atual no eixo Y na "janelaSelecionarCor";    
    codRGB.value = "255, 0, 0";
    codHEX.value = "#ff0000";

    this.procurarCor = function (color) {
        hsvBarra = rgbToHsv(color); //Converte a cor digitada de RGB para HSV.
        rgbBarra = hsvToRgb(hsvBarra.H, 100, 100); //Converte a cor pura em RGB.
        encontrarCorDoCodigoNoGradiente(hsvBarra.S, hsvBarra.V);
    }

    preencheBarraEspectro();
    this.procurarCor(AcharCor);

    janelaSelecionarCor.addEventListener("mousemove", pegarPosMouse);//Calcula a posição do mouse na "janelaSelecionarCor"
    function pegarPosMouse(e) {
        let coordenadas = janelaSelecionarCor.getBoundingClientRect();
        let scrollposicaoY = document.body.scrollTop || document.documentElement.scrollTop;
        let scrollposicaoX = document.body.scrollLeft || document.documentElement.scrollLeft;
        posMouseSeletorCorX = e.pageX - coordenadas.left - scrollposicaoX;
        posMouseSeletorCorY = e.pageY - coordenadas.top - scrollposicaoY;
        if (clickGradiente === true) {
            moverCursor2();
        }
        else if (clickBarra === true) {
            moverCursor1();
        }
    }

    colorPaintContent.addEventListener("mousemove", function (e) {
        if (clickMoverJanela === true && clickBarra === false && clickGradiente === false) {
            let coordenadas = colorPaintContent.getBoundingClientRect();
            let scrollposicaoY = document.body.scrollTop || document.documentElement.scrollTop;
            let scrollposicaoX = document.body.scrollLeft || document.documentElement.scrollLeft;
            let posMouseXcolorPaintContent = e.pageX - coordenadas.left - scrollposicaoX;
            let posMouseYcolorPaintContent = e.pageY - coordenadas.top - scrollposicaoY;
            moverjanelaSelecionarCorNaPagina(posMouseXcolorPaintContent, posMouseYcolorPaintContent);
        }
    });

    codRGB.addEventListener("keyup", function (e) {
        let codCorAchar = this.value;
        codCorAchar = codCorAchar.split(",") || codCorAchar.split(", ");
        for (let i = 0; i < codCorAchar.length; i++) {
            codCorAchar[i] = parseInt(codCorAchar[i]);//Converte as STRINGS em INT.
        }
        if (codCorAchar.length === 3) {
            if (codCorAchar[0] <= 255 && codCorAchar[1] <= 255 && codCorAchar[2] <= 255) {
                corParaAchar = { R: codCorAchar[0], G: codCorAchar[1], B: codCorAchar[2] }
                janelaSeleciona.procurarCor(corParaAchar);
            }
        }
    });

    codHEX.addEventListener("keyup", function (e) {
        let codCorHEX = this.value;
        if (codCorHEX.indexOf("#") === -1) {
            codCorHEX = "#" + codCorHEX;
        }
        let codCorAchar = hexToRgb(codCorHEX);
        if (codCorAchar != null) {
            if (codCorAchar[0] <= 255 && codCorAchar[1] <= 255 && codCorAchar[2] <= 255) {
                corParaAchar = { R: codCorAchar[0], G: codCorAchar[1], B: codCorAchar[2] };
                janelaSeleciona.procurarCor(corParaAchar);
            }
        }
    });

    janelaSelecionarCor.addEventListener("click", function () {
        moverCursor1();
        moverCursor2();
    });

    janelaSelecionarCor.addEventListener("mousedown", function () {
        if (posMouseSeletorCorY < 10 && clickBarra === false && clickGradiente === false) {
            clickMoverJanela = true;
            posMouseMoverJanela = { X: posMouseSeletorCorX, Y: posMouseSeletorCorY };
        }
        else if (posMouseSeletorCorX < 10 || posMouseSeletorCorX > 540 && clickBarra === false && clickGradiente === false) {
            clickMoverJanela = true;
            posMouseMoverJanela = { X: posMouseSeletorCorX, Y: posMouseSeletorCorY };
        }
    });

    cursorBarra.addEventListener("mousedown", function () {
        clickBarra = true;
    });

    barraeEspectroCor.addEventListener("mousedown", function () {
        clickBarra = true;
    });

    cursorGradiente.addEventListener("mousedown", function () {
        clickGradiente = true;
    });

    gradienteCor.addEventListener("mousedown", function () {
        clickGradiente = true;
    });

    document.addEventListener("mouseup", function () {
        clickGradiente = false;
        clickBarra = false;
        clickGradiente = false;
        clickBarra = false;
        clickMoverJanela = false;
    });

    bttOk.addEventListener("click", function (e) {
        if (corPrincipalOuSecundaria === 1) {
            corEscolhidaPrincipal = corEscolhida;
            corPrincipal.style.backgroundColor = "rgb(" + corEscolhida.R + ", " + corEscolhida.G + ", " + corEscolhida.B + ")";
        }
        else if (corPrincipalOuSecundaria === 2) {
            corEscolhidaSecudaria = corEscolhida;
            corSecundaria.style.backgroundColor = "rgb(" + corEscolhida.R + ", " + corEscolhida.G + ", " + corEscolhida.B + ")";
        }
        txtCorEscolhida.value = "rgb(" + corEscolhidaPrincipal.R + ", " + corEscolhidaPrincipal.G + ", " + corEscolhidaPrincipal.B + ")";
        janelaSelecionarCor.style.display = "none";
        janelaSelecionarCorVisivel = false;

        for (let i = 0; i < arrayCoresSalvas.length; i++) {
            arrayCoresSalvas[i].selecionado = false;
            arrayCoresSalvas[i].elemento.style.border = "none";
        }
    });

    bttSalvarCor.addEventListener("click", function () {
        let corJaSalva = false;
        bttRemoverCorSalva.style.display = "block";
        for (let i = 0; i < arrayCoresSalvas.length; i++) {
            let cor = arrayCoresSalvas[i].cor;
            if (cor.R === corEscolhida.R && cor.G === corEscolhida.G && cor.B === corEscolhida.B) {
                corJaSalva = true;
                alert("Essa cor já está salva!");
            }
        }
        if (corJaSalva === false) {
            let cor = "background-color: rgb(" + corEscolhida.R + ", " + corEscolhida.G + ", " + corEscolhida.B + ");";
            let id = "cor" + (arrayCoresSalvas.length);
            let corSalva = document.createElement("div");
            let div = document.createElement("div");
            corSalva.setAttribute("id", id);
            corSalva.setAttribute("class", "corSalva cursor");
            corSalva.setAttribute("style", cor);
            let infoCorSalva = { id: arrayCoresSalvas.length, elemento: corSalva, cor: { R: corEscolhida.R, G: corEscolhida.G, B: corEscolhida.B }, selecionado: false }
            arrayCoresSalvas.push(infoCorSalva);
            coresSalvas.appendChild(corSalva);
            corSalva.appendChild(div);
            arrayCoresSalvas[arrayCoresSalvas.length - 1].elemento.addEventListener("click", bttCorSalva);
        }
    });

    bttRemoverCorSalva.addEventListener("click", function () {
        if (janelaSelecionarCorVisivel === false) {
            let novoArray = [];
            for (let i = 0; i < arrayCoresSalvas.length; i++) {
                arrayCoresSalvas[i].elemento.removeEventListener("click", bttCorSalva);
                if (arrayCoresSalvas[i].selecionado === true) {
                    coresSalvas.removeChild(arrayCoresSalvas[i].elemento);
                }
                else {
                    novoArray.push(arrayCoresSalvas[i]);
                }
            }
            arrayCoresSalvas = novoArray;
            for (let i = 0; i < arrayCoresSalvas.length; i++) {
                let id = "cor" + (i);
                arrayCoresSalvas[i].id = i;
                arrayCoresSalvas.selecionado = false;
                arrayCoresSalvas[i].elemento.setAttribute("id", id);
                arrayCoresSalvas[i].elemento.addEventListener("click", bttCorSalva);
            };
            if (arrayCoresSalvas.length === 0) {
                bttRemoverCorSalva.style.display = "none";
            }
        }
    });

    bttCancelar.addEventListener("click", function () {
        fecharJanelaSelecionarCor();
    });

    function bttCorSalva() {//O que ocorre quando clicamos numa cor salva.
        if (janelaSelecionarCorVisivel === false) {
            let txtId = this.getAttribute("id");
            id = txtId.substring(3, 7);
            id = parseInt(id);
            arrayCoresSalvas[id].selecionado = true;
            arrayCoresSalvas[id].elemento.style.border = "1px solid rgb(255, 255, 255)";
            corEscolhidaPrincipal = arrayCoresSalvas[id].cor;
            corPrincipal.style.backgroundColor = "rgb(" + corEscolhidaPrincipal.R + ", " + corEscolhidaPrincipal.G + ", " + corEscolhidaPrincipal.B + ")";
            txtCorEscolhida.value = "rgb(" + corEscolhidaPrincipal.R + ", " + corEscolhidaPrincipal.G + ", " + corEscolhidaPrincipal.B + ")";
            for (let i = 0; i < arrayCoresSalvas.length; i++) {
                if (i != id) {
                    arrayCoresSalvas[i].selecionado = false;
                    arrayCoresSalvas[i].elemento.style.border = "none";
                }
            }
        }
    }

    function moverCursor1() {
        if (posMouseSeletorCorX <= 540 && posMouseSeletorCorX >= 10 && posMouseSeletorCorY <= 292 && posMouseSeletorCorY >= 272) {
            moverCursorBarra(posMouseSeletorCorX - 10, true);
        }
        else if (clickBarra === true) {
            if (posMouseSeletorCorX > 540 && posMouseSeletorCorY < 272) {
                moverCursorBarra(540 - 10, true);
            }
            else if (posMouseSeletorCorX > 540 && posMouseSeletorCorY < 292) {
                moverCursorBarra(540 - 10, true);
            }
            else if (posMouseSeletorCorX > 540 && posMouseSeletorCorY >= 292) {
                moverCursorBarra(540 - 10, true);
            }
            else if (posMouseSeletorCorX <= 540 && posMouseSeletorCorX >= 10 && posMouseSeletorCorY >= 292) {
                moverCursorBarra(posMouseSeletorCorX - 10, true);
            }
            else if (posMouseSeletorCorX < 10 && posMouseSeletorCorY >= 292) {
                moverCursorBarra(10 - 10, true);
            }
            else if (posMouseSeletorCorX < 10 && posMouseSeletorCorY < 292 && posMouseSeletorCorY > 272) {
                moverCursorBarra(10 - 10, true);
            }
            else if (posMouseSeletorCorX < 10 && posMouseSeletorCorY <= 272) {
                moverCursorBarra(10 - 10, true);
            }
            else if (clickBarra === true && posMouseSeletorCorX <= 540 && posMouseSeletorCorX >= 10 && posMouseSeletorCorY <= 272) {
                moverCursorBarra(posMouseSeletorCorX - 10, true);
            }
        }
    }

    function moverCursor2() {
        if (posMouseSeletorCorX <= 540 && posMouseSeletorCorX >= 110 && posMouseSeletorCorY <= 265 && posMouseSeletorCorY >= 10) {
            moverCursorGradiente(posMouseSeletorCorX - 120, posMouseSeletorCorY - 20);
        }
        else if (clickGradiente === true) {
            if (posMouseSeletorCorX > 540 && posMouseSeletorCorY < 10) {
                moverCursorGradiente(540 - 120, 10 - 20);
            }
            else if (posMouseSeletorCorX > 540 && posMouseSeletorCorY < 265) {
                moverCursorGradiente(540 - 120, posMouseSeletorCorY - 20);
            }
            else if (posMouseSeletorCorX > 540 && posMouseSeletorCorY >= 265) {
                moverCursorGradiente(540 - 120, 265 - 20);
            }
            else if (posMouseSeletorCorX <= 540 && posMouseSeletorCorX >= 110 && posMouseSeletorCorY >= 265) {
                moverCursorGradiente(posMouseSeletorCorX - 120, 265 - 20);
            }
            else if (posMouseSeletorCorX < 110 && posMouseSeletorCorY >= 265) {
                moverCursorGradiente(110 - 120, 265 - 20);
            }
            else if (posMouseSeletorCorX < 110 && posMouseSeletorCorY < 265 && posMouseSeletorCorY > 10) {
                moverCursorGradiente(110 - 120, posMouseSeletorCorY - 20);
            }
            else if (posMouseSeletorCorX < 110 && posMouseSeletorCorY <= 10) {
                moverCursorGradiente(110 - 120, 10 - 20);
            }
            else if (clickGradiente === true && posMouseSeletorCorX <= 540 && posMouseSeletorCorX >= 110 && posMouseSeletorCorY <= 10) {
                moverCursorGradiente(posMouseSeletorCorX - 120, 10 - 20);
            }
        }
    }

    function moverjanelaSelecionarCorNaPagina(x, y) {
        let novaPosicaoXJanela = x - posMouseMoverJanela.X;
        let novaPosicaoYJanela = y - posMouseMoverJanela.Y;
        let limiteDireita = x + (janelaSelecionarCor.offsetWidth - posMouseMoverJanela.X);
        let limiteEsquerda = x - (posMouseMoverJanela.X);
        let limiteCima = y - (posMouseMoverJanela.Y);
        let limiteBaixo = y + (janelaSelecionarCor.offsetHeight - posMouseMoverJanela.Y);

        if (limiteDireita < colorPaintContent.offsetWidth && limiteEsquerda > 0 && limiteCima > 50 && limiteBaixo < colorPaintContent.offsetHeight - 7) {
            janelaSelecionarCor.style.left = novaPosicaoXJanela + "px";
            janelaSelecionarCor.style.top = novaPosicaoYJanela + "px";
        }
        else if (limiteDireita >= colorPaintContent.offsetWidth && limiteBaixo >= colorPaintContent.offsetHeight - 7) {
            janelaSelecionarCor.style.left = (colorPaintContent.offsetWidth - janelaSelecionarCor.offsetWidth) + "px";
            janelaSelecionarCor.style.top = (colorPaintContent.offsetHeight - janelaSelecionarCor.offsetHeight) - 7 + "px";
        }
        else if (limiteEsquerda <= 0 && limiteBaixo >= colorPaintContent.offsetHeight - 7) {
            janelaSelecionarCor.style.left = "0px";
            janelaSelecionarCor.style.top = (colorPaintContent.offsetHeight - janelaSelecionarCor.offsetHeight) - 7 + "px";
        }
        else if (limiteEsquerda <= 0 && limiteCima <= 50) {
            janelaSelecionarCor.style.left = "0px";
            janelaSelecionarCor.style.top = "50px";
        }
        else if (limiteDireita >= colorPaintContent.offsetWidth && limiteCima <= 50) {
            janelaSelecionarCor.style.left = (colorPaintContent.offsetWidth - janelaSelecionarCor.offsetWidth) + "px";
            janelaSelecionarCor.style.top = "50px";
        }
        else if (limiteDireita >= colorPaintContent.offsetWidth) {
            janelaSelecionarCor.style.left = (colorPaintContent.offsetWidth - janelaSelecionarCor.offsetWidth) + "px";
            janelaSelecionarCor.style.top = novaPosicaoYJanela + "px";
        }
        else if (limiteEsquerda <= 0) {
            janelaSelecionarCor.style.left = "0px";
            janelaSelecionarCor.style.top = novaPosicaoYJanela + "px";
        }
        else if (limiteCima <= 50) {
            janelaSelecionarCor.style.left = novaPosicaoXJanela + "px";
            janelaSelecionarCor.style.top = "50px";
        }
        else if (limiteBaixo >= colorPaintContent.offsetHeight - 7) {
            janelaSelecionarCor.style.left = novaPosicaoXJanela + "px";
            janelaSelecionarCor.style.top = (colorPaintContent.offsetHeight - janelaSelecionarCor.offsetHeight) - 7 + "px";
        }
    }

    function encontrarCorDoCodigoNoGradiente(s, v) {
        let posx = (gradienteCor.offsetWidth / 100) * s;
        let posy = gradienteCor.offsetHeight - ((gradienteCor.offsetHeight / 100) * v);
        moverCursorGradiente(posx - 10, posy - 10);
        calcularPosiDaCorCursorBarra(hsvBarra.H);
    }

    function moverCursorBarra(x, calcularCor) {
        cursorBarra.style.left = x + "px";
        if (calcularCor === true) {
            calcularCorCursorBarra(x);
        }
        else {
            preencheGradiente();
            calcularCorPosiCursorGradiente();
        }
    }

    function calcularCorCursorBarra(x) {
        let H = ((x * 360) / barraeEspectroCor.offsetWidth);
        let cor;
        if (H === 360) {
            cursorBarra.style.backgroundColor = "rgb( 255, 0, 0)";
            rgbBarra = { R: 255, G: 0, B: 0 };
            hsvBarra = { H: 0, S: 100, V: 100 };
        } else {
            hsvBarra = { H: H, S: 100, V: 100 };
            cor = hsvToRgb(H, 100, 100);
            cursorBarra.style.backgroundColor = "rgb(" + cor.R + ", " + cor.G + ", " + cor.B + ")";
            rgbBarra = cor;
        }
        preencheGradiente();
        calcularCorPosiCursorGradiente();
    }

    function calcularPosiDaCorCursorBarra(h) {
        let posx = (barraeEspectroCor.offsetWidth / 360) * h;
        let cor = hsvToRgb(h, 100, 100);
        cursorBarra.style.backgroundColor = "rgb(" + cor.R + ", " + cor.G + ", " + cor.B + ")";
        rgbBarra = cor;
        moverCursorBarra(posx, false);
    }

    function moverCursorGradiente(x, y) {
        cursorGradiente.style.left = x + "px";
        cursorGradiente.style.top = y + "px";
        calcularCorPosiCursorGradiente();
    }

    function calcularCorPosiCursorGradiente() {
        let S = ((cursorGradiente.offsetLeft + 10) * 100) / gradienteCor.offsetWidth;
        let V = 100 - ((cursorGradiente.offsetTop + 10) * 100) / gradienteCor.offsetHeight;
        if (S == 0) {
            S = 0.02;
        }
        if (V == 0) {
            V = 0.02;
        }
        let cor = hsvToRgb(hsvBarra.H, S, V);
        let stringCorRGB = "rgb(" + cor.R + ", " + cor.G + ", " + cor.B + ")";
        cursorGradiente.style.backgroundColor = stringCorRGB;
        corSelecionada.style.backgroundColor = stringCorRGB;
        codHEX.value = rgbTohex(cor);
        codRGB.value = cor.R + ", " + cor.G + ", " + cor.B;
        corEscolhida = cor;
    }

    function preencheBarraEspectro() {
        ctxBarra.rect(0, 0, widthBarra, heightBarra);
        let gradiente = ctxBarra.createLinearGradient(0, 0, widthBarra, 0);
        gradiente.addColorStop(0, "rgb(255, 0, 0)");
        gradiente.addColorStop(0.16666666666666666667, "rgb(255, 255, 0)");
        gradiente.addColorStop(0.33333333333333333334, "rgb(0, 255, 0)");
        gradiente.addColorStop(0.50000000000000000001, "rgb(0, 255, 255)");
        gradiente.addColorStop(0.66666666666666666668, "rgb(0, 0, 255)");
        gradiente.addColorStop(0.83333333333333333335, "rgb(255, 0, 255)");
        gradiente.addColorStop(1, "rgb(255, 0, 0)");
        ctxBarra.fillStyle = gradiente;
        ctxBarra.fill();
    }

    function preencheGradiente() {
        ctxGradiente.clearRect(0, 0, widthGradiente, heightGradiente);
        ctxGradiente.fillStyle = "rgb(" + rgbBarra.R + ", " + rgbBarra.G + ", " + rgbBarra.B + ")";
        ctxGradiente.fillRect(0, 0, widthGradiente, heightGradiente);

        let gradienteBranco = ctxBarra.createLinearGradient(0, 0, widthGradiente, 0);
        gradienteBranco.addColorStop(0, "rgba(255, 255, 255, 1)");
        gradienteBranco.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctxGradiente.fillStyle = gradienteBranco;
        ctxGradiente.fillRect(0, 0, widthGradiente, heightGradiente);

        let gradientePreto = ctxBarra.createLinearGradient(0, 0, 0, heightGradiente);
        gradientePreto.addColorStop(0, "rgba(0, 0, 0, 0)");
        gradientePreto.addColorStop(1, "rgba(0, 0, 0, 1)");
        ctxGradiente.fillStyle = gradientePreto;
        ctxGradiente.fillRect(0, 0, widthGradiente, heightGradiente);
        ctxGradiente.closePath();
    }
}


function abrirJanelaSelecionarCor() {
    janelaSelecionarCor.style.display = "block";
    janelaSelecionarCorVisivel = true;
}

function fecharJanelaSelecionarCor() {
    janelaSelecionarCor.style.display = "none";
    janelaSelecionarCorVisivel = false;
}

//================================================================================================================================
function hexToRgb(hex) {
    let resul;
    resul = hex.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
    if (resul) {
        return resul.slice(1, 4).map(function (x) { return parseInt(x, 16); });
    }
    return null;
}

function rgbTohex(cor) {
    let rgb = cor.B | (cor.G << 8) | (cor.R << 16);
    return '#' + (0x1000000 + rgb).toString(16).slice(1)
}

function rgbToHsv(cor) {
    let rabs, gabs, babs, rr, gg, bb, h, v, diff, diffc, percentRoundFn;
    rabs = cor.R / 255;
    gabs = cor.G / 255;
    babs = cor.B / 255;
    v = Math.max(rabs, gabs, babs),
        diff = v - Math.min(rabs, gabs, babs);
    diffc = c => (v - c) / 6 / diff + 1 / 2;
    percentRoundFn = num => (num * 100) / 100;
    if (diff == 0) {
        h = s = 0;
    } else {
        s = diff / v;
        rr = diffc(rabs);
        gg = diffc(gabs);
        bb = diffc(babs);

        if (rabs === v) {
            h = bb - gg;
        } else if (gabs === v) {
            h = (1 / 3) + rr - bb;
        } else if (babs === v) {
            h = (2 / 3) + gg - rr;
        }
        if (h < 0) {
            h += 1;
        } else if (h > 1) {
            h -= 1;
        }
    }
    return {
        H: (h * 360),
        S: percentRoundFn(s * 100),
        V: percentRoundFn(v * 100)
    };
}

function hsvToRgb(h, s, v) {
    let r, g, b;
    let i;
    let f, p, q, t;

    h = Math.max(0, Math.min(360, h));
    s = Math.max(0, Math.min(100, s));
    v = Math.max(0, Math.min(100, v));

    s = s / 100;
    v = v / 100;

    if (s == 0) {//Cinza
        r = g = b = v;
        return [
            Math.round(r * 255),
            Math.round(g * 255),
            Math.round(b * 255)
        ];
    }

    h /= 60; // sector 0 to 5
    i = Math.floor(h);
    f = h - i; // factorial part of h
    p = v * (1 - s);
    q = v * (1 - s * f);
    t = v * (1 - s * (1 - f));

    switch (i) {
        case 0:
            r = v;
            g = t;
            b = p;
            break;
        case 1:
            r = q;
            g = v;
            b = p;
            break;
        case 2:
            r = p;
            g = v;
            b = t;
            break;
        case 3:
            r = p;
            g = q;
            b = v;
            break;
        case 4:
            r = t;
            g = p;
            b = v;
            break;
        case 5:
            r = v;
            g = p;
            b = q;
    }
    return {
        R: Math.round(r * 255),
        G: Math.round(g * 255),
        B: Math.round(b * 255)
    };
}

document.addEventListener("keydown", function (e) {
    if (e.code === "F5" && projetoCriado === true) {
        e.preventDefault();
        return false;
    }
});