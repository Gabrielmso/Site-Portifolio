mudarMenu = false; //impede que o menu mude de estilo.
let nomeDoProjeto;//Armazena o nome do projeto.
let janelaSelecionarCorVisivel = false;//Saber se a janela de seleção de cor está "aberta".
let corPrincipal, corSecundaria, corPrincipalOuSecundaria;
let corEscolhidaPrincipal = { R: 0, G: 0, B: 0 };//Armazena a cor escolhida do primeiro plano.
let corEscolhidaSecudaria = { R: 255, G: 255, B: 255 };//Armazena a cor escolhida no segundo plano.
let arrayVoltarAlteracoes = [];//Armazena as 20 últimas alterações no desenho. Comando Ctrl + Z.
let arrayAvancarAlteracoes = [];//Armazena as alterações que foram "voltadas". Comando Ctrl + Y.
let arrayCoresSalvas = [];//Armazena objetos cuja as propriedades possuem as informações sobre as cores salvas.
let arrayCamadas = [];//Armazena objetos cuja as propriedades possuem as informações sobre as camadas, como os elementos canvas, icones, etc.
let arrayFerramentas = [];//Armazena os elementos que selecionam as ferramentas.
let cursorComparaContaGotas;//Div que aparece acompanhando o cursor quando a ferramenta for a conta-gotas.
let comparaCoresContaGotas;//Div que fica dentro da "cursorComparaContaGotas" cuja a cor das bordas comparam as cores selecionadas.
let ferramentaSelecionada = 1;//Saber qual ferramenta está selecionada.
let ferramentaAnterior;//Armazena a ferramenta que estava selecionada antes de "abrir" a "janelaSelecionarCor".
let contentTelas;//Elemento onde ficará a "tela" para desenhar.
let telasCanvas;//Elemento onde ficarão os canvas "camadas".
let contentTelaPreview;//Div que contém o "telaPreview" e o "moverScroll".
let telaPreview;//Armazena o canvas que será utilizado como preview do projeto.
let ctxTelaPreview;//Armazena o contexto 2d do preview.
let moverScroll;//Div que será usada para mover os scrolls do "contentTelas".
let resolucaoProjeto = { largura: 0, altura: 0 };//Armazena a resolução que o usuário escolheu para o projeto.
let proporcaoProjeto = 0;//Armazena a relação entre largura e altura do projeto para ajustar os icones.
let camadaSelecionada = 0;//Armazena a posição do arrayTelasCamadas com a camada selecionada.
let desenho;//Armazena o canvas que receberá o "desenho completo".
let ctxDesenho;//Armazena o contexto 2d de "desenho".
let corDeFundoEscolhida;//Armazena a cor de fundo escolhida para o projeto.
let corFundo;//Div de fundo que receberá a cor de fundo escolhida para o projeto.
let pintar;//Armazena o canvas onde ocorrerá os "eventos" de pintura.
let ctxPintar;//Armazena o contexto 2d de "pintar".
let tamanhoFerramenta = 5;//Armazena a espessura do traço das ferramentas em pixels.
let opacidadeFerramenta = 1;//Armazena o valor da opacidade da cor de O a 1.
let durezaFerramenta = 1;
let projetoCriado = false;//Saber se existe projeto já criado.
let txtCorEscolhida;//Recebe a string da cor do primeiro plano no formato RGB para informar ao usuário.
let txtResolucao;//Recebe a string da resolução que o usuário escolheu para o projeto para informar ao usuário.
let txtPosicaoCursor;//Recebe a string com a posição do cursor no eixo X e Y sobre a "telasCanvas".
let txtPorcentagemZoom;
let janelaSeleciona;//Recebe toda a função "janelaSeletorDeCor".
let MouseNoBttVer = false;//Saber se o mouse está sobre os botões que deixam as camadas invisíveis ou visíveis.
let coordenadaClick = [];//Armazena as coordenadas do cursor do mouse desde quando o mesmo é pressionado e movimentado enquanto pressionado.
let cursorOpacidadeCamada;
function colorPaint() {
    const contentJanelaCriarProjeto = document.getElementById("contentJanelaCriarProjeto");
    const contentJanelaAtalhos = document.getElementById("contentJanelaAtalhos");
    const janelaPrincipal = document.getElementById("janelaPrincipal");
    const contentTools = document.getElementById("contentTools");
    const barraLateralEsquerda = document.getElementById("barraLateralEsquerda");
    const barraLateralDireita = document.getElementById("barraLateralDireita");
    const corAtual = document.getElementById("corAtual");
    const txtTamanhoFerramenta = document.getElementById("txtTamanhoFerramenta");
    const barraOpacidade = document.getElementById("barraOpacidade");
    const cursorOpacidade = document.getElementById("cursorOpacidade");
    const barraTamanho = document.getElementById("barraTamanho");
    const cursorTamanho = document.getElementById("cursorTamanho");
    const barraDureza = document.getElementById("barraDureza");
    const cursorDureza = document.getElementById("cursorDureza");
    const barraOpacidadeCamada = document.getElementById("barraOpacidadeCamada");
    const bttRefazer = document.getElementById("bttRefazer");
    const bttDesfazer = document.getElementById("bttDesfazer");
    const contentCentro = document.getElementById("contentCentro");
    const propriedadesFerramentas = document.getElementById("propriedadesFerramentas");
    const arrayPropriedadesFerramentas = [
        { propriedade: document.getElementById("propriedadeTamanho"), barra: document.getElementById("contentBarraTamanho") },
        { propriedade: document.getElementById("propriedadeOpacidade"), barra: document.getElementById("contentBarraOpacidade") },
        { propriedade: document.getElementById("propriedadeDureza"), barra: document.getElementById("contentBarraDureza") }];
    cursorOpacidadeCamada = document.getElementById("cursorOpacidadeCamada");
    contentTelas = document.getElementById("contentTelas");
    telasCanvas = document.getElementById("telasCanvas");
    corFundo = document.getElementById("corFundo");
    cursorComparaContaGotas = document.getElementById("cursorComparaContaGotas");
    comparaCoresContaGotas = document.getElementById("comparaCoresContaGotas");
    corPrincipal = document.getElementById("corPrincipal");
    corSecundaria = document.getElementById("corSecundaria");
    txtCorEscolhida = document.getElementById("txtCorEscolhida");
    txtResolucao = document.getElementById("txtResolucao");
    txtPosicaoCursor = document.getElementById("txtPosicaoCursor");
    txtPorcentagemZoom = document.getElementById("txtPorcentagemZoom");
    pintar = document.getElementById("pintar");
    ctxPintar = pintar.getContext("2d");
    desenho = document.getElementById("desenho");
    ctxDesenho = desenho.getContext("2d");
    contentTelaPreview = document.getElementById("contentTelaPreview");
    telaPreview = document.getElementById("telaPreview");
    ctxTelaPreview = telaPreview.getContext("2d");
    moverScroll = document.getElementById("moverScroll");
    janelaSeleciona = new janelaSeletorDeCor(corEscolhidaPrincipal);
    let posicaoMouseX, posicaoMouseY;//Armazena a posição do mouse no tela canvas em relação a resolução do projeto.
    let mudarTamanhoFerramenta = false;//Saber se o mouse está pressionado na "barraTamanho".
    let mudarOpacidadeFerramenta = false;//Saber se o mouse está pressionado na "barraOpacidade". 
    let mudarDurezaFerramenta = false;//Saber se o mouse está pressionado na "barraDureza". 
    let mudarOpacidadeCamada = false;//Saber se o mouse está pressionado na "barraOpacidadeCamada". 
    let moverScrollPreview = false;//Saber se o mouse está pressionado na "contentTelaPreview".
    let pintando = false;//Saber se o mouse está pressionado na "contentTelas".
    let ctrlPressionado = false;//Saber se os Ctrl's estão pressionados.
    let clickCurva = false;//Saber o momento de curvar a linha feita com a ferramenta Curva.
    arrayFerramentas = [{ ferramenta: document.getElementById("pincel"), nome: "Pincel", id: 1 },//Armazena as ferramentas.
    { ferramenta: document.getElementById("borracha"), nome: "Borracha", id: 2 },
    { ferramenta: document.getElementById("contaGotas"), nome: "Conta-gotas", id: 3 },
    { ferramenta: document.getElementById("linha"), nome: "Linha", id: 4 },
    { ferramenta: document.getElementById("curva"), nome: "Curva", id: 5 },
    { ferramenta: document.getElementById("retangulo"), nome: "Retângulo", id: 6 },
    { ferramenta: document.getElementById("baldeDeTinta"), nome: "Balde de tinta", id: 7 },
    { ferramenta: document.getElementById("elipse"), nome: "Elipse", id: 8 }];

    menuPadrao();
    ajustarContents();
    criarOuAbrirProjeto();
    

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
                if(ferramentaSelecionada === 3 || ferramentaSelecionada === 7){
                    propriedadesFerramentas.style.display = "none";
                }
                else{
                    propriedadesFerramentas.style.display = "block";
                }
                coordenadaClick = [];
                clickCurva = false;
                mudarAparenciaCursor();
                ctxPintar.clearRect(0, 0, resolucaoProjeto.largura, resolucaoProjeto.altura);
            }
        });
    }

    arrayFerramentas[2].ferramenta.addEventListener("click", function () {//Criar o desenho completo para selecionar a cor.
        if (projetoCriado === true) {
            desenhoCompleto();
        };
    });

    for (let i = 0; i < arrayPropriedadesFerramentas.length; i++) {
        arrayPropriedadesFerramentas[i].propriedade.addEventListener("mouseenter", function () {
            if (pintando === false) { arrayPropriedadesFerramentas[i].barra.style.height = "36px"; }
        })
        arrayPropriedadesFerramentas[i].propriedade.addEventListener("mouseleave", function () {
            arrayPropriedadesFerramentas[i].barra.style.height = "0px";
        })
    }

    document.getElementById("bttCriarNovoProjeto").addEventListener("click", function () {
        if (projetoCriado === false) {
            if (janelaSelecionarCorVisivel === false) {
                contentJanelaCriarProjeto.style.display = "flex";
            }
        }
        else {
            if (confirm("Todo o progresso não salvo será perdido, deseja continuar?") === true) {
                sessionStorage.setItem("criarNovoProjeto", "true");
                window.location.reload();
            }
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

    document.getElementById("bttAlternaCor").addEventListener("mousedown", function () {//Alterna entre a corPrincipalEcolhida e a corSecundariaEscolhida.
        if (janelaSelecionarCorVisivel === false) {
            corPrincipal.style.backgroundColor = "rgb(" + corEscolhidaSecudaria.R + ", " + corEscolhidaSecudaria.G + ", " + corEscolhidaSecudaria.B + ")";
            corSecundaria.style.backgroundColor = "rgb(" + corEscolhidaPrincipal.R + ", " + corEscolhidaPrincipal.G + ", " + corEscolhidaPrincipal.B + ")";
            const cor = corEscolhidaPrincipal;
            corEscolhidaPrincipal = corEscolhidaSecudaria;
            corEscolhidaSecudaria = cor;
            txtCorEscolhida.value = "rgb(" + corEscolhidaPrincipal.R + ", " + corEscolhidaPrincipal.G + ", " + corEscolhidaPrincipal.B + ")";
        }
    });

    bttRefazer.addEventListener("click", function () {
        avancarAlteracao();
    })

    bttDesfazer.addEventListener("click", function () {
        voltarAlteracao();
    })

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

    document.getElementById("bttSalvarDesenho").addEventListener("click", function () {
        if (projetoCriado === true) {
            salvarDesenho();
        }
        else {
            alert("Nenhum projeto criado!");
        }
    });

    document.getElementById("bttSalvarProjeto").addEventListener("click", function () {
        if (projetoCriado === true) {
            salvarProjeto();
        }
        else {
            alert("Nenhum projeto criado!");
        }
    });

    document.getElementById("bttAbrirProjeto").addEventListener("click", function () {
        if (projetoCriado === true) {
            if (confirm("Todo o progresso não salvo será perdido, deseja continuar?") === true) {
                sessionStorage.setItem("abrirProjetoSalvo", "true");
                window.location.reload();
            }
        }
        else {
            abrirProjeto();
        }
    })

    telasCanvas.addEventListener("mousemove", function () {
        txtPosicaoCursor.value = ((Math.floor(posicaoMouseX)) + 1) + ", " + ((Math.floor(posicaoMouseY)) + 1);
    });

    telasCanvas.addEventListener("mouseleave", function () {
        txtPosicaoCursor.value = "";
    });

    barraOpacidade.addEventListener("mousedown", function (e) {
        if (clickCurva === true) { return };
        mudarOpacidadeFerramenta = true;
        calculaOpacidadeFerramenta(e);
    })

    barraTamanho.addEventListener("mousedown", function (e) {
        if (clickCurva === true) { return };
        mudarTamanhoFerramenta = true;
        calculaTamanhoFerramenta(e);
    })

    barraDureza.addEventListener("mousedown", function (e) {
        if (clickCurva === true) { return };
        mudarDurezaFerramenta = true;
        calculaDurezaFerramenta(e);
    })

    barraOpacidadeCamada.addEventListener("mousedown", function (e) {
        mudarOpacidadeCamada = true;
        calculaOpacidadeCamada(e);
    })

    contentTelas.addEventListener("mousedown", function (e) {
        if (!projetoCriado) { return };
        if (arrayCamadas[camadaSelecionada].visivel === true) {
            pintando = true;
            if (clickCurva === false && ferramentaSelecionada != 3) {
                guardarAlteracoes();
            }
            arrayCamadas[camadaSelecionada].ctx.globalCompositeOperation = "source-over";
            const blur = calculaBlur();
            ctxPintar.filter = "blur(" + blur + "px)"
            ctxPintar.lineWidth = (tamanhoFerramenta - blur);
            ctxPintar.strokeStyle = "rgba(" + corEscolhidaPrincipal.R + ", " + corEscolhidaPrincipal.G + ", " + corEscolhidaPrincipal.B + ", " + opacidadeFerramenta + ")";
            if (ferramentaSelecionada === 1) {//Pincel.
                coordenadaClick.push({ x: posicaoMouseX, y: posicaoMouseY });
                if (tamanhoFerramenta > 1) {
                    ctxPintar.lineJoin = ctxPintar.lineCap = "round";
                }
                else {
                    ctxPintar.lineCap = "butt";
                }
                ctxPintar.beginPath();
                ferramentaPincel(posicaoMouseX, posicaoMouseY);
            }
            else if (ferramentaSelecionada === 2) {//Borracha.                  
                coordenadaClick.push({ x: posicaoMouseX, y: posicaoMouseY });
                arrayCamadas[camadaSelecionada].ctx.globalCompositeOperation = "destination-out";
                ctxPintar.lineJoin = "round";
                ctxPintar.lineCap = "square";
                ctxPintar.strokeStyle = "rgba(255, 0, 0, " + opacidadeFerramenta + ")";
                ctxPintar.beginPath();
                ferramentaPincel(posicaoMouseX, posicaoMouseY);
            }
            else if (ferramentaSelecionada === 3) {//Conta-gotas.
                cursorComparaContaGotas.style.display = "block";
                const corAtual = "25px solid rgb(" + corEscolhidaPrincipal.R + ", " + corEscolhidaPrincipal.G + ", " + corEscolhidaPrincipal.B + ")";
                comparaCoresContaGotas.style.borderLeft = corAtual;
                comparaCoresContaGotas.style.borderBottom = corAtual;
                const mousePos = pegarPosicaoMouse(janelaPrincipal, e);
                ferramentaContaGotas(mousePos.X, mousePos.Y, posicaoMouseX, posicaoMouseY, true);
            }
            else if (ferramentaSelecionada === 4) {//Linha.
                coordenadaClick[0] = { x: posicaoMouseX, y: posicaoMouseY };
                ctxPintar.lineJoin = ctxPintar.lineCap = "round";
                ferramentaLinha(posicaoMouseX, posicaoMouseY);
            }
            else if (ferramentaSelecionada === 5) {//Curva.
                ctxPintar.lineJoin = ctxPintar.lineCap = "round";
                if (clickCurva === false) {
                    coordenadaClick[0] = { x: posicaoMouseX, y: posicaoMouseY };
                    ferramentaCurva(posicaoMouseX, posicaoMouseY, false);
                }
                else {
                    ferramentaCurva(posicaoMouseX, posicaoMouseY, true);
                }
            }
            else if (ferramentaSelecionada === 6) {//Retângulo.
                coordenadaClick[0] = { x: posicaoMouseX, y: posicaoMouseY };
                ctxPintar.lineJoin = "miter";
                ferramentaRetangulo(posicaoMouseX, posicaoMouseY);
            }
            else if (ferramentaSelecionada === 7) {//Balde de tinta.
                if (posicaoMouseX >= 0 && posicaoMouseX <= resolucaoProjeto.largura && posicaoMouseY >= 0 && posicaoMouseY <= resolucaoProjeto.altura) {
                    const cor = { r: corEscolhidaPrincipal.R, g: corEscolhidaPrincipal.G, b: corEscolhidaPrincipal.B, a: Math.round(opacidadeFerramenta * 255) };
                    ferramentaBaldeDeTinta(posicaoMouseX, posicaoMouseY, arrayCamadas[camadaSelecionada].ctx, cor);
                }
            }
            else if (ferramentaSelecionada === 8) {//Elipse.
                coordenadaClick[0] = { x: posicaoMouseX, y: posicaoMouseY };
                ctxPintar.lineJoin = "round";
                ferramentaElipse(posicaoMouseX, posicaoMouseY);
            }
        }
    });

    document.addEventListener("mousemove", function (e) {//Pegar a posição do mouse em relação ao "telaCanvas" e enquanto o mousse estiver pressionado executar a função referente a ferramenta escolhida.
        const mouse = pegarPosicaoMouse(telasCanvas, e);
        posicaoMouseX = (resolucaoProjeto.largura / telasCanvas.offsetWidth) * mouse.X;
        posicaoMouseY = (resolucaoProjeto.altura / telasCanvas.offsetHeight) * mouse.Y;
        if (pintando === true) {
            if (ferramentaSelecionada === 1) {//Pincel.
                ferramentaPincel(posicaoMouseX, posicaoMouseY);
            }
            else if (ferramentaSelecionada === 2) {//Borracha.
                ctxPintar.lineCap = "round";
                ctxPintar.lineJoin = "round";
                ferramentaPincel(posicaoMouseX, posicaoMouseY);
            }
            else if (ferramentaSelecionada === 3) {//Conta-gotas.
                const mousePos = pegarPosicaoMouse(janelaPrincipal, e);
                ferramentaContaGotas(mousePos.X, mousePos.Y, posicaoMouseX, posicaoMouseY, true);
            }
            else if (ferramentaSelecionada === 4) {//Linha.
                ferramentaLinha(posicaoMouseX, posicaoMouseY);
            }
            else if (ferramentaSelecionada === 5) {//Curva.
                if (clickCurva === false) {
                    ferramentaCurva(posicaoMouseX, posicaoMouseY, false);
                }
                else {
                    ferramentaCurva(posicaoMouseX, posicaoMouseY, true);
                }
            }
            else if (ferramentaSelecionada === 6) {//Retângulo.
                ferramentaRetangulo(posicaoMouseX, posicaoMouseY);
            }
            else if (ferramentaSelecionada === 8) {//Elipse.
                ferramentaElipse(posicaoMouseX, posicaoMouseY);
            }
        }
        else if (mudarTamanhoFerramenta === true) {
            calculaTamanhoFerramenta(e);
        }
        else if (mudarOpacidadeFerramenta === true) {
            calculaOpacidadeFerramenta(e);
        }
        else if (mudarDurezaFerramenta === true) {
            calculaDurezaFerramenta(e);
        }
        else if (mudarOpacidadeCamada === true) {
            calculaOpacidadeCamada(e);
        }
        else if (moverScrollPreview === true) {
            const mousePos = pegarPosicaoMouse(contentTelaPreview, e);
            moverScrollNaTelaPreview(mousePos.X, mousePos.Y);
        }
    });

    document.getElementById("bttZoomMais").addEventListener("click", function () {//Aumentar o zoom no projeto.
        zoomNoProjeto(true, true, 1.25);
    });

    document.getElementById("bttZoomMenos").addEventListener("click", function () {//Diminuir o zoom no projeto.
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
        if (pintando === true) {
            pintando = false;
            if (ferramentaSelecionada != 5) {
                coordenadaClick = [];
                desenharNaCamada();
                desenhoNoPreviewEIcone();
            }
            else if (coordenadaClick.length === 3) {
                coordenadaClick = [];
                desenharNaCamada();
                desenhoNoPreviewEIcone();
            }
            if (ferramentaSelecionada === 3) {//Conta-gotas.  
                const mousePos = pegarPosicaoMouse(janelaPrincipal, e);
                ferramentaContaGotas(mousePos.X, mousePos.Y, posicaoMouseX, posicaoMouseY, false);
                cursorComparaContaGotas.style.display = "none";
            }
            else if (ferramentaSelecionada === 5) {//Curva. 
                if (clickCurva === false) {
                    clickCurva = true;
                }
                else {
                    clickCurva = false;
                }
            }
        }
        mudarOpacidadeFerramenta = false;
        mudarTamanhoFerramenta = false;
        mudarDurezaFerramenta = false;
        if (mudarOpacidadeCamada === true) {
            desenhoNoPreviewEIcone();
            mudarOpacidadeCamada = false;
        }
        moverScrollPreview = false;
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
                    zoomNoProjeto("porcentagem", true, 100);
                }
                else if (e.code === "Minus" || e.keyCode === 189) {
                    e.preventDefault();
                    zoomNoProjeto(false, true, 1.25);
                }
                else if (e.code === "Equal" || e.keyCode === 187) {
                    e.preventDefault();
                    zoomNoProjeto(true, true, 1.25);
                }
                else if (e.code === "KeyZ" || e.keyCode === 90) {
                    e.preventDefault();
                    clickCurva = false;
                    voltarAlteracao();
                }
                else if (e.code === "KeyY" || e.keyCode === 89) {
                    e.preventDefault();
                    avancarAlteracao();
                }
            }
        }
        if (e.code === "ControlRight" || e.code === "ControlLeft" || e.keyCode === 17) {
            e.preventDefault();
            ctrlPressionado = true;
            if (ferramentaSelecionada === 1) {
                ferramentaAnterior = 1;
                arrayFerramentas[2].ferramenta.click();
            }
        }
        else if (e.code === "BracketRight") {//Aumentar o tamanho da ferramenta.
            alterarTamanhoFerramenta(true);
        }
        else if (e.code === "Backslash") {//Diminuir o tamanho da ferramenta.
            alterarTamanhoFerramenta(false);
        }
    });

    document.addEventListener("keyup", function (e) {
        if (e.code === "ControlRight" || e.code === "ControlLeft" || e.keyCode === 17) {
            e.preventDefault();
            ctrlPressionado = false;
            if (ferramentaAnterior === 1 && ferramentaSelecionada === 3) {
                arrayFerramentas[0].ferramenta.click();
                cursorComparaContaGotas.style.display = "none";
            }
        }
    });

    janelaPrincipal.addEventListener("wheel", function (e) {//Zoom com o scroll do mouse.
        if (ctrlPressionado === true && projetoCriado === true) {
            e.preventDefault();
            if (e.deltaY < 0) {
                zoomNoProjeto(true, false, 1.075, e);
            }
            else {
                zoomNoProjeto(false, false, 1.075, e);
            }
            const posContentTelas = pegarPosicaoMouse(contentTelas, e);
            const proporcaoPosY = posicaoMouseY / resolucaoProjeto.altura;
            const proporcaoPosX = posicaoMouseX / resolucaoProjeto.largura;
            contentTelas.scrollTop = (contentTelas.scrollHeight * proporcaoPosY) - (posContentTelas.Y) - 5;
            contentTelas.scrollLeft = (contentTelas.scrollWidth * proporcaoPosX) - (posContentTelas.X) - 5;
            contentTelasMoverScroll(contentTelas.scrollTop, contentTelas.scrollLeft);
        }
    });

    contentTelas.addEventListener("scroll", function (e) {
        contentTelasMoverScroll(contentTelas.scrollTop, contentTelas.scrollLeft);
    });

    contentTelaPreview.addEventListener("mousedown", function (e) {
        if (!projetoCriado) { return };
        moverScrollPreview = true;
        const mousePos = pegarPosicaoMouse(this, e);
        moverScrollNaTelaPreview(mousePos.X, mousePos.Y);
    });

    window.addEventListener("resize", function () {
        ajustarContents();
        tamanhoMoverScroll();
        contentTelasMoverScroll(contentTelas.scrollTop, contentTelas.scrollLeft);
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

    function calculaOpacidadeCamada(e) {
        const mouse = pegarPosicaoMouse(barraOpacidadeCamada, e);
        let porcentagem = Math.round((mouse.X * 100) / barraOpacidadeCamada.offsetWidth);
        if (mouse.X <= 1) {
            porcentagem = 1;
            cursorOpacidadeCamada.style.left = "-7px";
            arrayCamadas[camadaSelecionada].porcentagemOpa.value = "1%";
        }
        else if (mouse.X >= 200) {
            porcentagem = 100;
            cursorOpacidadeCamada.style.left = "193px";
            arrayCamadas[camadaSelecionada].porcentagemOpa.value = "100%";
        }
        else {
            cursorOpacidadeCamada.style.left = mouse.X - 7 + "px";
            arrayCamadas[camadaSelecionada].porcentagemOpa.value = porcentagem + "%";
        }
        let opacidade = porcentagem / 100;
        arrayCamadas[camadaSelecionada].opacidade = opacidade;
        pintar.style.opacity = opacidade;
        arrayCamadas[camadaSelecionada].camada.style.opacity = opacidade;
    }

    function calculaTamanhoFerramenta(e) {
        let mouse = pegarPosicaoMouse(barraTamanho, e);
        mouse.X = Math.round(mouse.X);

        if (mouse.X <= 0) {
            mouse.X = 0.49;
            cursorTamanho.style.left = "-7px";
            txtTamanhoFerramenta.value = "0.5px";
        }
        else if (mouse.X >= 190) {
            mouse.X = 190;
            cursorTamanho.style.left = "183px";
            txtTamanhoFerramenta.value = "190px";
        }
        else {
            cursorTamanho.style.left = mouse.X - 7 + "px";
            if (mouse.X === 1) {
                mouse.X = 0.97;
                txtTamanhoFerramenta.value = "1px";
            }
            else {
                txtTamanhoFerramenta.value = mouse.X + "px";
            }
        }
        tamanhoFerramenta = mouse.X;
        mudarAparenciaCursor();
    }

    function alterarTamanhoFerramenta(aumentar) {
        if (aumentar === true) {
            if (tamanhoFerramenta === 0.49) {
                tamanhoFerramenta = 0.97;
                cursorTamanho.style.left = 1 - 7 + "px";
                txtTamanhoFerramenta.value = "1px";
            }
            else if (tamanhoFerramenta === 0.97) {
                tamanhoFerramenta = 2;
                txtTamanhoFerramenta.value = "2px";
                cursorTamanho.style.left = 2 - 7 + "px";
            }
            else if (tamanhoFerramenta < 15) {
                tamanhoFerramenta = tamanhoFerramenta + 1;
                txtTamanhoFerramenta.value = tamanhoFerramenta + "px";
                cursorTamanho.style.left = tamanhoFerramenta - 7 + "px";
            }
            else if (tamanhoFerramenta >= 15 && tamanhoFerramenta <= 185) {
                tamanhoFerramenta = tamanhoFerramenta + 5;
                txtTamanhoFerramenta.value = tamanhoFerramenta + "px";
                cursorTamanho.style.left = tamanhoFerramenta - 7 + "px";
            }
            else if (tamanhoFerramenta > 190) {
                tamanhoFerramenta = 190;
                txtTamanhoFerramenta.value = tamanhoFerramenta + "px";
                cursorTamanho.style.left = tamanhoFerramenta - 7 + "px";
            }
        }
        else {
            if (tamanhoFerramenta <= 190 && tamanhoFerramenta > 15) {
                tamanhoFerramenta = tamanhoFerramenta - 5;
                cursorTamanho.style.left = tamanhoFerramenta - 7 + "px";
                txtTamanhoFerramenta.value = tamanhoFerramenta + "px";
            }
            else if (tamanhoFerramenta <= 15 && tamanhoFerramenta > 2) {
                tamanhoFerramenta = tamanhoFerramenta - 1;
                txtTamanhoFerramenta.value = tamanhoFerramenta + "px";
                cursorTamanho.style.left = tamanhoFerramenta - 7 + "px";
            }
            else if (tamanhoFerramenta === 2) {
                tamanhoFerramenta = 0.97;
                cursorTamanho.style.left = 1 - 7 + "px";
                txtTamanhoFerramenta.value = "1px";
            }
            else if (tamanhoFerramenta === 0.97) {
                tamanhoFerramenta = 0.49;
                cursorTamanho.style.left = "-7px"
                txtTamanhoFerramenta.value = "0.5px";
            }
            else if (tamanhoFerramenta === 0.49) {
                tamanhoFerramenta = 0.49;
                cursorTamanho.style.left = "-7px"
                txtTamanhoFerramenta.value = "0.5px";
            }
        }
        mudarAparenciaCursor();
    }

    function calculaOpacidadeFerramenta(e) {
        const txtOpacidadeFerramenta = document.getElementById("txtOpacidadeFerramenta");
        const mouse = pegarPosicaoMouse(barraOpacidade, e);
        let porcentagem = Math.round((mouse.X * 100) / barraOpacidade.offsetWidth);
        if (mouse.X <= 1) {
            porcentagem = 1;
            cursorOpacidade.style.left = "-7px";
            txtOpacidadeFerramenta.value = "1%";
        }
        else if (mouse.X >= 190) {
            porcentagem = 100;
            cursorOpacidade.style.left = "183px";
            txtOpacidadeFerramenta.value = "100%";
        }
        else {
            cursorOpacidade.style.left = mouse.X - 7 + "px";
            txtOpacidadeFerramenta.value = porcentagem + "%";
        }
        opacidadeFerramenta = porcentagem / 100;
    }

    function calculaDurezaFerramenta(e) {
        const txtDurezaFerramenta = document.getElementById("txtDurezaFerramenta");
        const mouse = pegarPosicaoMouse(barraDureza, e);
        let porcentagem = Math.round((mouse.X * 100) / barraDureza.offsetWidth);
        if (mouse.X < 1) {
            porcentagem = 0;
            cursorDureza.style.left = "-7px";
            txtDurezaFerramenta.value = "0%";
        }
        else if (mouse.X >= 190) {
            porcentagem = 100;
            cursorDureza.style.left = "183px";
            txtDurezaFerramenta.value = "100%";
        }
        else {
            cursorDureza.style.left = mouse.X - 7 + "px";
            txtDurezaFerramenta.value = porcentagem + "%";
        }
        durezaFerramenta = porcentagem / 100;
    }

    function calculaBlur() {
        const maximoBlur = tamanhoFerramenta / 6.2;
        let dureza = maximoBlur - (maximoBlur * durezaFerramenta);
        if (tamanhoFerramenta < 100) {
            const proporcao = ((100 - tamanhoFerramenta) / 180);
            dureza += (dureza * proporcao);
        }
        return parseFloat((dureza).toFixed(2));
    }

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
        contentTools.style.height = (janelaPrincipal.offsetHeight - 90) + "px";
        contentCentro.style.width = contentTools.offsetWidth - barraLateralEsquerda.offsetWidth - barraLateralDireita.offsetWidth - 0.1 + "px";
        contentCentro.style.height = contentTools.style.height;
        contentTelas.style.height = (contentCentro.offsetHeight - 15) + "px";
    }

    function guardarAlteracoes() {
        const objAlteracao = { camadaAlterada: camadaSelecionada, alteracao: arrayCamadas[camadaSelecionada].ctx.getImageData(0, 0, resolucaoProjeto.largura, resolucaoProjeto.altura) };
        arrayVoltarAlteracoes.push(objAlteracao);
        if (arrayVoltarAlteracoes.length > 20) {
            arrayVoltarAlteracoes.shift();
        }
        if (arrayAvancarAlteracoes.length > 0 || arrayVoltarAlteracoes.length === 1) {
            bttDesfazer.classList.add("bttHover");
            bttDesfazer.classList.add("cursor");
            bttDesfazer.style.opacity = "1";
            bttRefazer.classList.remove("bttHover");
            bttRefazer.classList.remove("cursor");
            bttRefazer.style.opacity = "0.5";
        }
        arrayAvancarAlteracoes = [];
    }

    function voltarAlteracao() {
        if (arrayVoltarAlteracoes.length > 0 && pintando === false) {
            const ultimoIndice = arrayVoltarAlteracoes.length - 1,
                camada = arrayVoltarAlteracoes[ultimoIndice].camadaAlterada,
                imagemCamada = arrayVoltarAlteracoes[ultimoIndice].alteracao,
                objAlteracao = { camadaAlterada: camada, visivel: arrayCamadas[camada].visivel, alteracao: arrayCamadas[camada].ctx.getImageData(0, 0, resolucaoProjeto.largura, resolucaoProjeto.altura) };
            if (camadaSelecionada != camada) {
                clickIconeCamada.call(arrayCamadas[camada].icone);
            }
            if (arrayCamadas[camada].visivel === false) {
                clickCamadaVisivel.call(arrayCamadas[camada].bttVer);
                return;
            }
            arrayAvancarAlteracoes.push(objAlteracao);
            arrayCamadas[camada].ctx.clearRect(0, 0, resolucaoProjeto.largura, resolucaoProjeto.altura);
            arrayCamadas[camada].ctx.putImageData(imagemCamada, 0, 0);
            arrayVoltarAlteracoes.pop();
            if (arrayVoltarAlteracoes.length === 0) {
                bttDesfazer.classList.remove("bttHover");
                bttDesfazer.classList.remove("cursor");
                bttDesfazer.style.opacity = "0.5";
            }
            if (arrayAvancarAlteracoes.length === 1) {
                bttRefazer.classList.add("bttHover");
                bttRefazer.classList.add("cursor");
                bttRefazer.style.opacity = "1";
            }
            desenhoNoPreviewEIcone();
            desenhoCompleto();
        }
    }

    function avancarAlteracao() {
        if (arrayAvancarAlteracoes.length > 0 && pintando === false) {
            const ultimoIndice = arrayAvancarAlteracoes.length - 1,
                camada = arrayAvancarAlteracoes[ultimoIndice].camadaAlterada,
                imagemCamada = arrayAvancarAlteracoes[ultimoIndice].alteracao,
                objAlteracao = { camadaAlterada: camada, visivel: arrayCamadas[camada].visivel, alteracao: arrayCamadas[camada].ctx.getImageData(0, 0, resolucaoProjeto.largura, resolucaoProjeto.altura) };
            if (camadaSelecionada != camada) {
                clickIconeCamada.call(arrayCamadas[camada].icone);
            }
            arrayVoltarAlteracoes.push(objAlteracao);
            arrayCamadas[camada].ctx.clearRect(0, 0, resolucaoProjeto.largura, resolucaoProjeto.altura);
            arrayCamadas[camada].ctx.putImageData(imagemCamada, 0, 0);
            arrayAvancarAlteracoes.pop();
            if (arrayVoltarAlteracoes.length === 1) {
                bttDesfazer.classList.add("bttHover");
                bttDesfazer.classList.add("cursor");
                bttDesfazer.style.opacity = "1";
            }
            if (arrayAvancarAlteracoes.length === 0) {
                bttRefazer.classList.remove("bttHover");
                bttRefazer.classList.remove("cursor");
                bttRefazer.style.opacity = "0.5";
            }
            desenhoNoPreviewEIcone();
            desenhoCompleto();
        }
    }
}
// ==========================================================================================================================================================================================================================================

function ferramentaPincel(mouseX, mouseY) {
    coordenadaClick.push({ x: mouseX, y: mouseY });
    ctxPintar.clearRect(0, 0, resolucaoProjeto.largura, resolucaoProjeto.altura);
    let ponto1 = coordenadaClick[0], ponto2 = coordenadaClick[1];
    ctxPintar.beginPath();
    ctxPintar.moveTo(ponto1.x, ponto1.y);
    for (let i = 0; i < coordenadaClick.length; i++) {
        const midPoint = midPointBtw(ponto1, ponto2);
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

function ferramentaBaldeDeTinta(mouseX, mouseY, context, cor) {
    const corSelecionada = cor,
        camada = context.getImageData(0, 0, resolucaoProjeto.largura, resolucaoProjeto.altura),
        canvasEvent = ctxPintar.getImageData(0, 0, resolucaoProjeto.largura, resolucaoProjeto.altura);

    pintar(Math.round(mouseX), Math.round(mouseY));
    function pintar(posX, posY) {
        const pixelPos = (posY * resolucaoProjeto.largura + posX) * 4,
            r = camada.data[pixelPos],
            g = camada.data[pixelPos + 1],
            b = camada.data[pixelPos + 2],
            a = camada.data[pixelPos + 3];
        if (r === corSelecionada.r && g === corSelecionada.g && b === corSelecionada.b && a === 255) {
            return;
        }
        preencher(posX, posY, r, g, b, a);
    }

    function preencher(posClickX, posClickY, R, G, B, A) {
        let pixelsVerificados = [[posClickX, posClickY]];
        while (pixelsVerificados.length > 0) {
            const novaPosicao = pixelsVerificados.pop();
            let x = novaPosicao[0], y = novaPosicao[1];
            let posicaoPixel = (y * resolucaoProjeto.largura + x) * 4;
            while (y >= -1 && compararCorInicial(posicaoPixel, R, G, B, A)) {
                y = y - 1;
                posicaoPixel = posicaoPixel - resolucaoProjeto.largura * 4;
            }
            pintarPixel(posicaoPixel, corSelecionada.r, corSelecionada.g, corSelecionada.b, corSelecionada.a);
            posicaoPixel = posicaoPixel + resolucaoProjeto.largura * 4;
            y = y + 1;
            let ladoEsquerdo = false, ladoDireito = false;
            while (y <= resolucaoProjeto.altura + 1 && compararCorInicial(posicaoPixel, R, G, B, A)) {
                pintarPixel(posicaoPixel, corSelecionada.r, corSelecionada.g, corSelecionada.b, corSelecionada.a);
                y = y + 1;
                if (x > 0) {
                    if (compararCorInicial(posicaoPixel - 4, R, G, B, A) === true) {
                        if (ladoEsquerdo === false) {
                            ladoEsquerdo = true;
                            pixelsVerificados.push([x - 1, y]);
                        }
                    }
                    else {
                        pintarPixel(posicaoPixel - 4, corSelecionada.r, corSelecionada.g, corSelecionada.b, corSelecionada.a);
                        if (ladoEsquerdo === true) {
                            ladoEsquerdo = false;
                        }
                    }
                }
                if (x < resolucaoProjeto.largura + 1) {
                    if (compararCorInicial(posicaoPixel + 4, R, G, B, A) === true) {
                        if (ladoDireito === false) {
                            ladoDireito = true;
                            pixelsVerificados.push([x + 1, y]);
                        }
                    }
                    else {
                        pintarPixel(posicaoPixel + 4, corSelecionada.r, corSelecionada.g, corSelecionada.b, corSelecionada.a);
                        if (ladoDireito === true) {
                            ladoDireito = false;
                        }
                    }
                }
                posicaoPixel = posicaoPixel + resolucaoProjeto.largura * 4;
            }
            pintarPixel(posicaoPixel, corSelecionada.r, corSelecionada.g, corSelecionada.b, corSelecionada.a);
        }
        ctxPintar.putImageData(canvasEvent, 0, 0);
    }

    function compararCorInicial(pixelPos, clickR, clickG, clickB, clickA) {
        const r = camada.data[pixelPos],
            g = camada.data[pixelPos + 1],
            b = camada.data[pixelPos + 2],
            a = camada.data[pixelPos + 3];

        if (canvasEvent.data[pixelPos + 3] === 0) {
            if (clickR === corSelecionada.r && clickG === corSelecionada.g && clickB === corSelecionada.b && clickA === 255) {
                return false;
            }
            if (r === clickR && g === clickG && b === clickB && a === clickA) {
                return true;
            }
            if (r === corSelecionada.r && g === corSelecionada.g && b === corSelecionada.b && a === corSelecionada.a) {
                return false;
            }
        }
        else {
            return false;
        }
    }

    function pintarPixel(pixelPos, R, G, B, A) {
        canvasEvent.data[pixelPos] = R;
        canvasEvent.data[pixelPos + 1] = G;
        canvasEvent.data[pixelPos + 2] = B;
        canvasEvent.data[pixelPos + 3] = A;

        camada.data[pixelPos] = R;
        camada.data[pixelPos + 1] = G;
        camada.data[pixelPos + 2] = B;
        camada.data[pixelPos + 3] = A;
    }
};

function ferramentaLinha(mouseX, mouseY) {
    coordenadaClick[1] = { x: mouseX, y: mouseY };
    ctxPintar.clearRect(0, 0, resolucaoProjeto.largura, resolucaoProjeto.altura);
    const pontoInicial = coordenadaClick[0], pontoFinal = coordenadaClick[1];
    ctxPintar.beginPath();
    ctxPintar.moveTo(pontoInicial.x, pontoInicial.y);
    ctxPintar.lineTo(pontoFinal.x, pontoFinal.y);
    ctxPintar.stroke();
}

function ferramentaCurva(mouseX, mouseY, curvar) {
    if (curvar === false) {
        coordenadaClick[1] = { x: mouseX, y: mouseY };
    }
    ctxPintar.clearRect(0, 0, resolucaoProjeto.largura, resolucaoProjeto.altura);
    const pontoInicial = coordenadaClick[0], pontoFinal = coordenadaClick[1];
    ctxPintar.beginPath();
    ctxPintar.moveTo(pontoInicial.x, pontoInicial.y);
    if (curvar === true) {
        const pontoControle = coordenadaClick[2] = { x: mouseX, y: mouseY };
        ctxPintar.quadraticCurveTo(pontoControle.x, pontoControle.y, pontoFinal.x, pontoFinal.y);
    }
    else {
        ctxPintar.lineTo(pontoFinal.x, pontoFinal.y);
    }
    ctxPintar.stroke();
}

function ferramentaRetangulo(mouseX, mouseY) {
    ctxPintar.clearRect(0, 0, resolucaoProjeto.largura, resolucaoProjeto.altura);
    const pontoInicial = coordenadaClick[0], pontoFinal = { x: mouseX, y: mouseY };
    ctxPintar.beginPath();
    ctxPintar.strokeRect(pontoInicial.x, pontoInicial.y, pontoFinal.x - pontoInicial.x, pontoFinal.y - pontoInicial.y);
}

function ferramentaElipse(mouseX, mouseY) {
    ctxPintar.clearRect(0, 0, resolucaoProjeto.largura, resolucaoProjeto.altura);
    const pontoInicial = coordenadaClick[0], pontoFinal = { x: mouseX, y: mouseY };
    const raioX = (pontoFinal.x - pontoInicial.x) / 2, raioY = (pontoFinal.y - pontoInicial.y) / 2;
    const centroEixoX = pontoInicial.x + raioX, centroEixoY = pontoInicial.y + raioY;
    const passoAngulo = 0.005;
    let angulo = 0;
    const voltaCompleta = Math.PI * 2 + passoAngulo;
    ctxPintar.beginPath();
    ctxPintar.moveTo(centroEixoX + raioX * Math.cos(angulo), centroEixoY + raioY * Math.sin(angulo));
    for (; angulo < voltaCompleta; angulo += passoAngulo) {
        ctxPintar.lineTo(centroEixoX + raioX * Math.cos(angulo), centroEixoY + raioY * Math.sin(angulo));
    }
    ctxPintar.stroke();
}

function ferramentaContaGotas(mouseX, mouseY, posTelaX, posTelaY, mouseMovendo) {
    const X = mouseX - (cursorComparaContaGotas.offsetWidth / 2);
    const Y = mouseY - (cursorComparaContaGotas.offsetHeight / 2);
    cursorComparaContaGotas.style.left = X + "px";
    cursorComparaContaGotas.style.top = Y + "px";
    const pixel = ctxDesenho.getImageData(posTelaX, posTelaY, 1, 1).data;
    if (mouseMovendo === true) {
        if (pixel[3] === 0) {
            const novaCor = "25px solid rgba(0, 0, 0, 0)";
            comparaCoresContaGotas.style.borderRight = novaCor;
            comparaCoresContaGotas.style.borderTop = novaCor;
            return;
        }
        const novaCor = "25px solid rgb(" + pixel[0] + ", " + pixel[1] + ", " + pixel[2] + ")";
        comparaCoresContaGotas.style.borderRight = novaCor;
        comparaCoresContaGotas.style.borderTop = novaCor;
    }
    else {
        if (pixel[3] === 0) {
            alert("Nenhuma cor selecionada");
            return;
        }
        if (janelaSelecionarCorVisivel === true) {
            janelaSeleciona.procurarCor({ R: pixel[0], G: pixel[1], B: pixel[2] });
        }
        else {
            corEscolhidaPrincipal = { R: pixel[0], G: pixel[1], B: pixel[2] };
            const novaCor = "rgb(" + corEscolhidaPrincipal.R + ", " + corEscolhidaPrincipal.G + ", " + corEscolhidaPrincipal.B + ")";
            corPrincipal.style.backgroundColor = novaCor;
            txtCorEscolhida.value = novaCor;
        }
    }
}

function mudarAparenciaCursor() {
    if (ferramentaSelecionada === 3) {
        contentTelas.style.cursor = "url('/colorPaint/imagens/cursor/cursorContaGotas.png') 0 20, pointer";
        return;
    };
    if (ferramentaSelecionada === 7) {
        contentTelas.style.cursor = "url('/colorPaint/imagens/cursor/cursorBaldeDeTinta.png') 0 0, pointer";
        return;
    };
    const tamanho = tamanhoFerramenta * ((telasCanvas.offsetWidth) / resolucaoProjeto.largura);
    if (tamanho <= 10) {
        contentTelas.style.cursor = "url('/colorPaint/imagens/cursor/crossHair.png') 12.5 12.5, pointer";
    }
    else {
        contentTelas.style.cursor = "url('/colorPaint/imagens/cursor/circle.png') 10 10, pointer";
    }
}
// ==========================================================================================================================================================================================================================================

function desenharNaCamada() {
    arrayCamadas[camadaSelecionada].ctx.drawImage(ctxPintar.canvas, 0, 0, resolucaoProjeto.largura, resolucaoProjeto.altura);
    ctxPintar.clearRect(0, 0, resolucaoProjeto.largura, resolucaoProjeto.altura);
}

function desenhoNoPreviewEIcone() {
    ctxTelaPreview.clearRect(0, 0, ctxTelaPreview.canvas.width, ctxTelaPreview.canvas.height);
    for (let i = 0; i < arrayCamadas.length; i++) {
        if (arrayCamadas[i].visivel === true) {
            const opacidadeCamada = arrayCamadas[i].opacidade;
            ctxTelaPreview.beginPath();
            ctxTelaPreview.globalAlpha = opacidadeCamada;
            ctxTelaPreview.drawImage(arrayCamadas[i].ctx.canvas, 0, 0, ctxTelaPreview.canvas.width, ctxTelaPreview.canvas.height);
            ctxTelaPreview.closePath();
        };
    }
    const larguraMiniatura = arrayCamadas[camadaSelecionada].ctxMiniatura.canvas.width, alturaMiniatura = arrayCamadas[camadaSelecionada].ctxMiniatura.canvas.height;
    arrayCamadas[camadaSelecionada].ctxMiniatura.clearRect(0, 0, larguraMiniatura, alturaMiniatura);
    arrayCamadas[camadaSelecionada].ctxMiniatura.globalAlpha = arrayCamadas[camadaSelecionada].opacidade;
    arrayCamadas[camadaSelecionada].ctxMiniatura.drawImage(arrayCamadas[camadaSelecionada].ctx.canvas, 0, 0, larguraMiniatura, alturaMiniatura);
}

function desenhoCompleto() {
    ctxDesenho.clearRect(0, 0, resolucaoProjeto.largura, resolucaoProjeto.altura);
    if (corDeFundoEscolhida != false) {
        ctxDesenho.globalAlpha = 1;
        ctxDesenho.fillStyle = "rgb(" + corDeFundoEscolhida.R + ", " + corDeFundoEscolhida.G + ", " + corDeFundoEscolhida.B + ")";
        ctxDesenho.fillRect(0, 0, resolucaoProjeto.largura, resolucaoProjeto.altura);
    }
    for (let i = 0; i < arrayCamadas.length; i++) {
        if (arrayCamadas[i].visivel === true) {
            const opacidadeCamada = arrayCamadas[i].opacidade;
            ctxDesenho.beginPath();
            ctxDesenho.globalAlpha = opacidadeCamada;
            ctxDesenho.drawImage(arrayCamadas[i].ctx.canvas, 0, 0, resolucaoProjeto.largura, resolucaoProjeto.altura);
            ctxDesenho.closePath();
        };
    }
}
// ==========================================================================================================================================================================================================================================

function criarProjeto() {
    const arrayPropriedades = [document.getElementById("txtNomeProjeto"),
    document.getElementById("txtLarguraProjeto"),
    document.getElementById("txtAlturaProjeto"),
    document.getElementById("corDeFundoProjeto"),
    document.getElementById("numeroCamadasProjeto")];

    if (validarPropriedades()) {
        for (let i = 0; i < arrayPropriedades.length; i++) {
            const el = arrayPropriedades[i];
            el.style.backgroundColor = "rgb(37, 37, 37)";
        }
        nomeDoProjeto = (arrayPropriedades[0].value).replace(" ", "-");
        document.getElementById("nomeDoProjeto").innerText = nomeDoProjeto;
        const resolucaoTela = { largura: parseInt(arrayPropriedades[1].value), altura: parseInt(arrayPropriedades[2].value) };
        resolucaoProjeto = resolucaoTela;
        proporcaoProjeto = resolucaoProjeto.largura / resolucaoProjeto.altura;
        const numCamadas = parseInt(arrayPropriedades[4].value);
        let cor;
        if (arrayPropriedades[3].value === "1") {
            corDeFundoEscolhida = { R: 255, G: 255, B: 255 };
            cor = "rgb(" + corDeFundoEscolhida.R + ", " + corDeFundoEscolhida.G + ", " + corDeFundoEscolhida.B + ")";
        }
        else if (arrayPropriedades[3].value === "2") {
            corDeFundoEscolhida = { R: 0, G: 0, B: 0 };
            cor = "rgb(" + corDeFundoEscolhida.R + ", " + corDeFundoEscolhida.G + ", " + corDeFundoEscolhida.B + ")";
        }
        else if (arrayPropriedades[3].value === "3") {
            corDeFundoEscolhida = false;
            cor = false;
        }
        else if (arrayPropriedades[3].value === "4") {
            corDeFundoEscolhida = corEscolhidaPrincipal;
            cor = "rgb(" + corDeFundoEscolhida.R + ", " + corDeFundoEscolhida.G + ", " + corDeFundoEscolhida.B + ")";
        }
        while (numCamadas > arrayCamadas.length) {
            criarCamada(cor, resolucaoTela);
        }
        ajustarTelasCanvas();
        camadaSelecionada = 0;
        arrayCamadas[0].icone.classList.add("camadaSelecionada");
        arrayCamadas[0].icone.classList.remove("camadas");
        if (corDeFundoEscolhida != false) {
            corFundo.style.backgroundColor = cor;
        }
        desenho.width = resolucaoProjeto.largura;
        desenho.height = resolucaoProjeto.altura;
        pintar.width = resolucaoProjeto.largura;
        pintar.height = resolucaoProjeto.altura;
        document.getElementById("propriedadeOpacidadeCamada").style.display = "flex";
        document.getElementById("barraInferior").style.display = "block";
        ajustarPreview(cor);
        projetoCriado = true;
    }

    function validarPropriedades() {
        for (let i = 0; i < arrayPropriedades.length; i++) {
            const el = arrayPropriedades[i];
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
    const num = arrayCamadas.length + 1;
    // ============= CRIA O ICONE DA CAMADA ==================
    const contentIconeCamadas = document.getElementById("contentIconeCamadas");
    const idicone = "camadaIcone" + num;
    const iconeCamada = document.createElement("div");
    iconeCamada.setAttribute("id", idicone);
    iconeCamada.setAttribute("class", "camadas");

    if (num === 1) {
        contentIconeCamadas.appendChild(iconeCamada);
    }
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

    if (proporcaoProjeto >= 1) {
        const iconAltura = Math.round(80 / proporcaoProjeto);
        styleIconTela = "width: 80px; height: " + iconAltura + "px; ";
    }
    else {
        const iconLargura = Math.round(80 * proporcaoProjeto);
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

    if (document.getElementById(idicone) != null &&
        document.getElementById(idBttVisivel) != null &&
        document.getElementById(idNome) != null &&
        document.getElementById(idPocentagem) != null &&
        document.getElementById(idIconTela) != null &&
        document.getElementById(idCamada) != null) {
        const objCamada = {
            nome: nomeCamada,
            camada: elCamada,
            ctx: elCamada.getContext("2d"),
            icone: iconeCamada,
            miniatura: iconTela,
            ctxMiniatura: iconTela.getContext("2d"),
            bttVer: bttVisivel,
            porcentagemOpa: txtPorcentagem,
            opacidade: 1,
            visivel: true
        };
        arrayCamadas.push(objCamada);
        arrayCamadas[arrayCamadas.length - 1].icone.addEventListener("click", clickIconeCamada);
        arrayCamadas[arrayCamadas.length - 1].bttVer.addEventListener("mousedown", clickCamadaVisivel);
        arrayCamadas[arrayCamadas.length - 1].bttVer.addEventListener("mouseenter", mouseSobre);
        arrayCamadas[arrayCamadas.length - 1].bttVer.addEventListener("mouseleave", mouseFora);
    }
}
// ==========================================================================================================================================================================================================================================

function clickIconeCamada() {
    if (MouseNoBttVer === false) {
        const txtId = this.getAttribute("id"),
            id = parseInt(txtId.substring(11, 15)),
            indiceArrayCamadas = id - 1;
        for (let i = 0; i < arrayCamadas.length; i++) {
            if (i === indiceArrayCamadas) {
                camadaSelecionada = i;
                pintar.style.zIndex = (id * 2) + 1;
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
        pintar.style.opacity = opacidade;
    }
}
// ==========================================================================================================================================================================================================================================

function clickCamadaVisivel() {
    const txtId = this.getAttribute("id"),
        id = parseInt(txtId.substring(7, 11)),
        indiceArrayCamadas = id - 1,
        visivel = arrayCamadas[indiceArrayCamadas].visivel;
    if (visivel === true) {
        arrayCamadas[indiceArrayCamadas].visivel = false;
        arrayCamadas[indiceArrayCamadas].camada.style.display = "none";
        this.classList.add("iconNaoVer");
        this.classList.remove("iconVer");
    }
    else {
        arrayCamadas[indiceArrayCamadas].visivel = true;
        arrayCamadas[indiceArrayCamadas].camada.style.display = "block";
        this.classList.add("iconVer");
        this.classList.remove("iconNaoVer");
    }
    desenhoNoPreviewEIcone();
}

function mouseSobre() {
    MouseNoBttVer = true;
}

function mouseFora() {
    MouseNoBttVer = false;
}
// ==========================================================================================================================================================================================================================================

function ajustarTelasCanvas() {
    const larguraMax = contentTelas.offsetWidth - 10, alturaMax = contentTelas.offsetHeight - 10;

    if (resolucaoProjeto.largura > larguraMax && resolucaoProjeto.altura > alturaMax) {
        AjustarnavisualizacaoTelasCanvas();
    }
    else if (resolucaoProjeto.largura > larguraMax) {
        const novaAltura = larguraMax / proporcaoProjeto;
        telasCanvas.style.width = larguraMax + "px";
        telasCanvas.style.height = novaAltura + "px";
        telasCanvas.style.top = alturaMax / 2 - novaAltura / 2 + "px"
        telasCanvas.style.left = "5px";
    }
    else if (resolucaoProjeto.altura > alturaMax) {
        const novaLargura = alturaMax * proporcaoProjeto;
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
    mudarAparenciaCursor();
}

function AjustarnavisualizacaoTelasCanvas() {
    const larguraMax = contentTelas.offsetWidth - 10, alturaMax = contentTelas.offsetHeight - 10,
        proporcaoContent = larguraMax / alturaMax;
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
    let zoomTelasCanvas = ((larguraTelasCanvas * 100) / resolucaoProjeto.largura).toFixed(1);
    zoomTelasCanvas = zoomTelasCanvas.replace(".", ",");
    txtPorcentagemZoom.value = zoomTelasCanvas + "%";
    tamanhoMoverScroll();
}
// ==========================================================================================================================================================================================================================================

function ajustarPreview(cor) {
    const proporcaoEspaco = 256 / 150;
    if (proporcaoProjeto >= proporcaoEspaco) {
        const novaAltura = (256 / proporcaoProjeto);
        contentTelaPreview.style.width = "256px";
        contentTelaPreview.style.height = novaAltura + "px";
    }
    else {
        const novaLargura = (150 * proporcaoProjeto);
        contentTelaPreview.style.width = novaLargura + "px";
        contentTelaPreview.style.height = "150px";
    }
    if (cor != false) {
        contentTelaPreview.style.backgroundColor = cor;
    }
    else {
        contentTelaPreview.style.backgroundImage = "url('/colorPaint/imagens/fundoTela/transparenteMiniatura.png')";
    }
    telaPreview.width = contentTelaPreview.offsetWidth;
    telaPreview.height = contentTelaPreview.offsetHeight;
}
// ==========================================================================================================================================================================================================================================

function zoomNoProjeto(zoom, centralizar, quanto) {
    const larguraAnterior = telasCanvas.offsetWidth;
    let larguraAtual, alturaAtual;

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

    if (centralizar === true) {
        contentTelas.scrollTop = ((alturaAtual / 2) + 10) - (contentTelas.offsetHeight / 2);
        contentTelas.scrollLeft = ((larguraAtual / 2) + 10) - (contentTelas.offsetWidth / 2);
    }

    let zoomTelasCanvas = ((larguraAtual * 100) / resolucaoProjeto.largura).toFixed(1);
    zoomTelasCanvas = zoomTelasCanvas.replace(".", ",");
    txtPorcentagemZoom.value = zoomTelasCanvas + "%";
    mudarAparenciaCursor();
    tamanhoMoverScroll();
}
// ==========================================================================================================================================================================================================================================

function tamanhoMoverScroll() {//De acordo com o zoom que é dado muda o tamanho do "moverScroll".
    const tamanhoTelasCanvas = { X: telasCanvas.offsetWidth, Y: telasCanvas.offsetHeight },
        tamanhoContentTelas = { X: contentTelas.offsetWidth, Y: contentTelas.offsetHeight },
        tamanhoContentTelaPreview = { X: contentTelaPreview.offsetWidth, Y: contentTelaPreview.offsetHeight };

    if (tamanhoTelasCanvas.X <= (tamanhoContentTelas.X - 10) && tamanhoTelasCanvas.Y <= (tamanhoContentTelas.Y - 10)) {
        moverScroll.style.display = "none";
    }
    else if (tamanhoTelasCanvas.X > (tamanhoContentTelas.X - 10) && tamanhoTelasCanvas.Y > (tamanhoContentTelas.Y - 10)) {
        const proporcaoTamanhoX = (tamanhoContentTelas.X - 10) / tamanhoTelasCanvas.X,
            proporcaoTamanhoY = (tamanhoContentTelas.Y - 10) / tamanhoTelasCanvas.Y;
        moverScroll.style.display = "block";
        moverScroll.style.width = (tamanhoContentTelaPreview.X * proporcaoTamanhoX) + "px";
        moverScroll.style.height = (tamanhoContentTelaPreview.Y * proporcaoTamanhoY) + "px";
    }
    else if (tamanhoTelasCanvas.X > (tamanhoContentTelas.X - 10)) {
        const proporcaoTamanhoX = (tamanhoContentTelas.X - 10) / tamanhoTelasCanvas.X;
        moverScroll.style.display = "block";
        moverScroll.style.width = (tamanhoContentTelaPreview.X * proporcaoTamanhoX) + "px";
        moverScroll.style.height = tamanhoContentTelaPreview.Y + "px";
    }
    else if (tamanhoTelasCanvas.Y > (tamanhoContentTelas.Y - 10)) {
        const proporcaoTamanhoY = (tamanhoContentTelas.Y - 10) / tamanhoTelasCanvas.Y;
        moverScroll.style.display = "block";
        moverScroll.style.width = tamanhoContentTelaPreview.X + "px";
        moverScroll.style.height = (tamanhoContentTelaPreview.Y * proporcaoTamanhoY) + "px";;
    }
}

function moverScrollNaTelaPreview(mouseX, mouseY) {//Mover o "moverScroll" com o mouse.
    const metadeLargura = (moverScroll.offsetWidth / 2), metadeAltura = (moverScroll.offsetHeight / 2);

    if (mouseX <= metadeLargura) {
        moverScroll.style.left = "0px";
    }
    else if (mouseX >= contentTelaPreview.offsetWidth - metadeLargura) {
        moverScroll.style.left = contentTelaPreview.offsetWidth - (metadeLargura * 2) + "px";
    }
    else {
        moverScroll.style.left = mouseX - metadeLargura + "px";
    }

    if (mouseY <= metadeAltura) {
        moverScroll.style.top = "0px";
    }
    else if (mouseY >= contentTelaPreview.offsetHeight - metadeAltura) {
        moverScroll.style.top = contentTelaPreview.offsetHeight - (metadeAltura * 2) + "px";
    }
    else {
        moverScroll.style.top = mouseY - metadeAltura + "px";
    }
    moverScrollContentTelas(moverScroll.offsetTop, moverScroll.offsetLeft);
}

function moverScrollContentTelas(topPos, leftPos) {//Mudar o valor dos Scroll's do contentTelas movendo o "moverScroll".
    const mult = (contentTelas.scrollWidth) / telaPreview.offsetWidth;
    contentTelas.scrollTop = (topPos * mult);
    contentTelas.scrollLeft = (leftPos * mult);
}

function contentTelasMoverScroll(scrollTop, scrollLeft) {//Mover o "moverScroll" quando o valor dos Scroll's do contentTelas mudar.
    const mult = (contentTelas.scrollWidth) / telaPreview.offsetWidth;
    moverScroll.style.top = (scrollTop / (mult)) + "px";
    moverScroll.style.left = (scrollLeft / (mult)) + "px";
}
// ==========================================================================================================================================================================================================================================

function salvarDesenho() {
    desenhoCompleto();
    const blob = dataURLtoBlob(ctxDesenho.canvas.toDataURL("imagem/png"));
    const url = URL.createObjectURL(blob);
    const salvarImagem = document.getElementById("salvarImagem");
    salvarImagem.setAttribute("download", nomeDoProjeto + ".png");
    salvarImagem.setAttribute("href", url);
    salvarImagem.click();
    function dataURLtoBlob(dataURI) {
        const BASE64_MARKER = ";base64,";
        const base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
        const base64 = dataURI.substring(base64Index);
        const raw = window.atob(base64);
        const rawLength = raw.length;
        let array = new Uint8Array(rawLength);
        for (i = 0; i < rawLength; i++) {
            array[i] = raw.charCodeAt(i);
        }
        const blob = new Blob([array], { type: "image/png" });
        return blob;
    }
}

function salvarProjeto() {
    let dadosCamadas = [];
    for (let i = 0; i < arrayCamadas.length; i++) {
        dadosCamadas[i] = {
            imgDataCamada: arrayCamadas[i].ctx.canvas.toDataURL("imagem/png"),
            opacidade: arrayCamadas[i].opacidade,
            visivel: arrayCamadas[i].visivel,
        };
    }
    const objProjeto = {
        nomeProjeto: nomeDoProjeto,
        resolucaoDoProjeto: resolucaoProjeto,
        corDeFundo: corDeFundoEscolhida,
        numeroDeCamadas: arrayCamadas.length,
        camadas: dadosCamadas
    }

    const data = encode(JSON.stringify(objProjeto));
    const blob = new Blob([data], { type: "application/octet-stream;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.getElementById("salvarProjeto");
    link.setAttribute("href", url);
    link.setAttribute("download", nomeDoProjeto + ".gm");
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
            if (this.result === "") {
                alert("Este arquivo não possui projeto salvo!");
            }
            else {
                carregarProjeto(this.result);
            }
        };

        if (!arquivo) {
            alert("Erro ao carregar projeto, tente novamente!");
        }
        else {
            const extencao = arquivo.name.split('.').pop().toLowerCase();
            if (extencao === "gm") {
                reader.readAsText(arquivo);
            }
            else {
                alert("Arquivo selecionado inválido!");
            }
        }
    }, false);

    function carregarProjeto(projetoJSON) {
        const objProjeto = JSON.parse(projetoJSON);
        nomeDoProjeto = objProjeto.nomeProjeto;
        document.getElementById("nomeDoProjeto").innerText = nomeDoProjeto;
        resolucaoProjeto = objProjeto.resolucaoDoProjeto;
        proporcaoProjeto = resolucaoProjeto.largura / resolucaoProjeto.altura;
        corDeFundoEscolhida = objProjeto.corDeFundo;
        const numCamadas = objProjeto.numeroDeCamadas;
        let cor;
        arrayCamadas = [];
        arrayVoltarAlteracoes = [];
        arrayAvancarAlteracoes = [];
        if (corDeFundoEscolhida === false) {
            cor = false;
        }
        else {
            cor = "rgb(" + corDeFundoEscolhida.R + ", " + corDeFundoEscolhida.G + ", " + corDeFundoEscolhida.B + ")";
        }

        while (numCamadas > arrayCamadas.length) {
            criarCamada(cor, resolucaoProjeto);
        }
        ajustarTelasCanvas();
        camadaSelecionada = 0;
        arrayCamadas[0].icone.classList.add("camadaSelecionada");
        arrayCamadas[0].icone.classList.remove("camadas");
        if (corDeFundoEscolhida != false) {
            corFundo.style.backgroundColor = cor;
        }
        desenho.width = resolucaoProjeto.largura;
        desenho.height = resolucaoProjeto.altura;
        pintar.width = resolucaoProjeto.largura;
        pintar.height = resolucaoProjeto.altura;
        document.getElementById("propriedadeOpacidadeCamada").style.display = "flex";
        document.getElementById("barraInferior").style.display = "block";
        ajustarPreview(cor);
        projetoCriado = true;
        txtResolucao.value = resolucaoProjeto.largura + ", " + resolucaoProjeto.altura;
        for (let i = 0; i < numCamadas; i++) {
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
        pintar.style.opacity = arrayCamadas[0].opacidade;
        cursorOpacidadeCamada.style.left = ((arrayCamadas[0].opacidade * 200) - 7) + "px";
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
    else {
        carregamento();
    }
    function carregamento(){
        const logoCarregamento = document.getElementById("logoCarregamento");       
        logoCarregamento.style.transition = "opacity 1.5s linear";
        setTimeout(function  () {
            logoCarregamento.style.opacity = "1";
            setTimeout(() => {
                const posLogo = logoBlack.getBoundingClientRect();
                logoCarregamento.style.transition = "width 400ms linear, height 400ms linear, opacity 400ms linear, top 400ms linear, left 400ms linear";
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
            }, 1500);
        }, 150)
    }
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

    const widthBarra = barraeEspectroCor.width, heightBarra = barraeEspectroCor.height,//Altura e largura do canvas "barraeEspectroCor" (Resolução).
        widthGradiente = gradienteCor.width, heightGradiente = gradienteCor.height,//Altura e largura do canvas "gradienteCor" (Resolução).
        cursorGradiente = document.getElementById("cursorGradiente");//Cursor que fica na "gradienteCor".

    const ctxBarra = barraeEspectroCor.getContext("2d"),
        ctxGradiente = gradienteCor.getContext("2d");
    let rgbBarra = { R: 255, G: 0, B: 0 },
        hsvBarra = { H: 0, S: 100, V: 100 };
    let corParaAchar = {};//Armazena a cor a ser encontrada no formato RGB que foi digitada no "codRGB".
    let clickBarra = false,//Saber se o click do mouse foi ou está pressionado em cima do "barraeEspectroCor".
        clickGradiente = false,//Saber se o click do mouse foi ou está pressionado em cima do "gradienteCor".
        clickMoverJanela = false;
    let posMouseMoverJanela = {};
    let posMouseSeletorCorX = 0, posMouseSeletorCorY = 0;//Armazena a posição do mouse na "janelaSelecionarCor";    
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
        const posMouse = pegarPosicaoMouse(janelaSelecionarCor, e);
        posMouseSeletorCorX = posMouse.X;
        posMouseSeletorCorY = posMouse.Y;
        if (clickGradiente === true) {
            moverCursor2();
        }
        else if (clickBarra === true) {
            moverCursor1();
        }
    }

    colorPaintContent.addEventListener("mousemove", function (e) {
        if (clickMoverJanela === true && clickBarra === false && clickGradiente === false) {
            const posMouse = pegarPosicaoMouse(colorPaintContent, e);
            moverjanelaSelecionarCorNaPagina(posMouse.X, posMouse.Y);
        }
    });

    codRGB.addEventListener("keyup", function (e) {
        let codCorAchar = this.value;
        codCorAchar = codCorAchar.split(",") || codCorAchar.split(", ");
        for (let i = 0; i < codCorAchar.length; i++) {
            codCorAchar[i] = parseInt(codCorAchar[i]);
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
        clickBarra = false;
        clickGradiente = false;
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
        fecharJanelaSelecionarCor();
        for (let i = 0; i < arrayCoresSalvas.length; i++) {
            arrayCoresSalvas[i].selecionado = false;
            arrayCoresSalvas[i].elemento.style.border = "none";
        }
    });

    bttSalvarCor.addEventListener("click", function () {
        let corJaSalva = false;
        bttRemoverCorSalva.style.display = "block";
        for (let i = 0; i < arrayCoresSalvas.length; i++) {
            const cor = arrayCoresSalvas[i].cor;
            if (cor.R === corEscolhida.R && cor.G === corEscolhida.G && cor.B === corEscolhida.B) {
                corJaSalva = true;
                alert("Essa cor já está salva!");
            }
        }
        if (corJaSalva === false) {
            const cor = "background-color: rgb(" + corEscolhida.R + ", " + corEscolhida.G + ", " + corEscolhida.B + ");";
            const id = "cor" + (arrayCoresSalvas.length);
            const corSalva = document.createElement("div");
            const div = document.createElement("div");
            corSalva.setAttribute("id", id);
            corSalva.setAttribute("class", "corSalva cursor");
            corSalva.setAttribute("style", cor);
            const infoCorSalva = { id: arrayCoresSalvas.length, elemento: corSalva, cor: { R: corEscolhida.R, G: corEscolhida.G, B: corEscolhida.B }, selecionado: false }
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
                const id = "cor" + (i);
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
            const txtId = this.getAttribute("id");
            const id = parseInt(txtId.substring(3, 7));
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
        const novaPosicaoXJanela = x - posMouseMoverJanela.X, novaPosicaoYJanela = y - posMouseMoverJanela.Y,
            limiteDireita = x + (janelaSelecionarCor.offsetWidth - posMouseMoverJanela.X), limiteEsquerda = x - (posMouseMoverJanela.X),
            limiteCima = y - (posMouseMoverJanela.Y), limiteBaixo = y + (janelaSelecionarCor.offsetHeight - posMouseMoverJanela.Y);

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
        const posx = (gradienteCor.offsetWidth / 100) * s, posy = gradienteCor.offsetHeight - ((gradienteCor.offsetHeight / 100) * v);
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
        const H = ((x * 360) / barraeEspectroCor.offsetWidth);
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
        const posx = (barraeEspectroCor.offsetWidth / 360) * h;
        const cor = hsvToRgb(h, 100, 100);
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
        const cor = hsvToRgb(hsvBarra.H, S, V);
        const stringCorRGB = "rgb(" + cor.R + ", " + cor.G + ", " + cor.B + ")";
        cursorGradiente.style.backgroundColor = stringCorRGB;
        corSelecionada.style.backgroundColor = stringCorRGB;
        codHEX.value = rgbTohex(cor);
        codRGB.value = cor.R + ", " + cor.G + ", " + cor.B;
        corEscolhida = cor;
    }

    function preencheBarraEspectro() {
        ctxBarra.rect(0, 0, widthBarra, heightBarra);
        const gradiente = ctxBarra.createLinearGradient(0, 0, widthBarra, 0);
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

        const gradienteBranco = ctxBarra.createLinearGradient(0, 0, widthGradiente, 0);
        gradienteBranco.addColorStop(0, "rgba(255, 255, 255, 1)");
        gradienteBranco.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctxGradiente.fillStyle = gradienteBranco;
        ctxGradiente.fillRect(0, 0, widthGradiente, heightGradiente);

        const gradientePreto = ctxBarra.createLinearGradient(0, 0, 0, heightGradiente);
        gradientePreto.addColorStop(0, "rgba(0, 0, 0, 0)");
        gradientePreto.addColorStop(1, "rgba(0, 0, 0, 1)");
        ctxGradiente.fillStyle = gradientePreto;
        ctxGradiente.fillRect(0, 0, widthGradiente, heightGradiente);
        ctxGradiente.closePath();
    }
}

function abrirJanelaSelecionarCor() {
    ferramentaAnterior = ferramentaSelecionada;
    arrayFerramentas[2].ferramenta.click();//Mudar para a ferramenta Conta-gotas.
    janelaSelecionarCor.style.display = "block";
    janelaSelecionarCorVisivel = true;
}

function fecharJanelaSelecionarCor() {
    janelaSelecionarCor.style.display = "none";
    janelaSelecionarCorVisivel = false;
    arrayFerramentas[ferramentaAnterior - 1].ferramenta.click();//Voltar para a ferramenta selecionada antes de abrir a "janelaSelecionarCor".
}

function pegarPosicaoMouse(elemento, e) {
    const pos = elemento.getBoundingClientRect();
    return {
        X: e.clientX - pos.left,
        Y: e.clientY - pos.top
    }
}

//================================================================================================================================
function hexToRgb(hex) {
    const resul = hex.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
    if (resul) {
        return resul.slice(1, 4).map(function (x) { return parseInt(x, 16); });
    }
    return null;
}

function rgbTohex(cor) {
    const rgb = cor.B | (cor.G << 8) | (cor.R << 16);
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
    if (s == 0) {
        r = g = b = v;
        return [
            Math.round(r * 255),
            Math.round(g * 255),
            Math.round(b * 255)
        ];
    }
    h /= 60;
    i = Math.floor(h);
    f = h - i;
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