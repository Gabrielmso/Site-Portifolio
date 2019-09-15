let janelaSelecionarCorVisivel = false;
let corPrincipal, corSecundaria, corPrincipalOuSecundaria;
let corEscolhidaPrincipal = { R: 0, G: 0, B: 0 };
let corEscolhidaSecudaria = { R: 255, G: 255, B: 255 };
let arrayCoresSalvas = [];
let janelaSeleciona;

function colorPaint() {
    const corAtual = document.getElementById("corAtual");
    corPrincipal = document.getElementById("corPrincipal");
    corSecundaria = document.getElementById("corSecundaria");
    janelaSeleciona = new janelaSeletorDeCor(corEscolhidaPrincipal);

    corPrincipal.addEventListener("click", function () {
        if (janelaSelecionarCorVisivel === true) {
            janelaSeleciona.procurarCor(corEscolhidaPrincipal);
        }
        else {
            corPrincipalOuSecundaria = 1;
            corAtual.style.backgroundColor = "rgb(" + corEscolhidaPrincipal.R + ", " + corEscolhidaPrincipal.G + ", " + corEscolhidaPrincipal.B + ")";
            janelaSelecionarCor.style.display = "block";
            janelaSelecionarCorVisivel = true;
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
            janelaSelecionarCor.style.display = "block";
            janelaSelecionarCorVisivel = true;
            janelaSeleciona.procurarCor(corEscolhidaSecudaria);
        }
    });
}

function janelaSeletorDeCor(corAtual) {
    let corEscolhida = { R: 0, G: 0, B: 0 }; //Armazena a cor selecionada com o cursor "cursorGradiente";
    const coresSalvas = document.getElementById("coresSalvas");
    const colorPaintContent = document.getElementById("colorPaintContent");
    const janelaSelecionarCor = document.getElementById("janelaSelecionarCor");
    const bttOk = document.getElementById("bttOk");
    const bttSalvarCor = document.getElementById("bttSalvarCor");
    const bttRemoverCorSalva = document.getElementById("bttRemoverCorSalva");;
    const bttCancelar = document.getElementById("bttCancelar");

    const corSelecionada = document.getElementById("corSelecionada");//div que receberá a cor selecionada.

    const barraeEspectroCor = document.getElementById("barraeEspectroCor");//Canvas que receberá o espectro de cores.
    let ctxBarra = barraeEspectroCor.getContext("2d");
    const widthBarra = barraeEspectroCor.width, heightBarra = barraeEspectroCor.height;//Altura e largura do canvas "barraeEspectroCor" (Resolução).
    const cursorBarra = document.getElementById("cursorBarra");//Cursor que fica na "barraeEspectroCor".

    const gradienteCor = document.getElementById("gradienteCor");//Canvas que receberá o gradiente de cores da cor seleciona pelo cursor que fica na "barraeEspectroCor"..
    let ctxGradiente = gradienteCor.getContext("2d");
    const widthGradiente = gradienteCor.width, heightGradiente = gradienteCor.height;//Altura e largura do canvas "gradienteCor" (Resolução).
    const cursorGradiente = document.getElementById("cursorGradiente");//Cursor que fica na "gradienteCor".

    const codRGB = document.getElementById("codRGB");
    const codHEX = document.getElementById("codHEX");

    let rgbBarra = { R: 255, G: 0, B: 0 };
    let hsvBarra = { H: 0, S: 100, V: 100 };
    codRGB.value = "255, 0, 0";
    codHEX.value = "#ff0000";

    let corParaAchar = {};//Armazena a cor a ser encontrada no formato RGB que foi digitada no "codRGB".
    let clickBarra = false;//Saber se o click do mouse foi ou está pressionado em cima do "barraeEspectroCor".
    let clickGradiente = false;//Saber se o click do mouse foi ou está pressionado em cima do "gradienteCor".
    let clickMoverJanela = false;
    let posMouseMoverJanela = {};
    let posMouseSeletorCorX = 0;//Armazena a posição atual no eixo X na "janelaSelecionarCor";
    let posMouseSeletorCorY = 0;//Armazena a posição atual no eixo Y na "janelaSelecionarCor";    

    this.procurarCor = function (color) {
        hsvBarra = rgbToHsv(color); //Converte a cor digitada de RGB para HSV.
        rgbBarra = hsvToRgb(hsvBarra.H, 100, 100); //Converte a cor pura em RGB.
        encontrarCorDoCodigoNoGradiente(hsvBarra.S, hsvBarra.V);
    }

    preencheBarraEspectro();
    this.procurarCor(corAtual);

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

    colorPaintContent.addEventListener("mouseleave", function () {
        clickMoverJanela = false;
    })

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
        janelaSelecionarCor.style.display = "none";
        janelaSelecionarCorVisivel = false;
    });

    function bttCorSalva() {
        if (janelaSelecionarCorVisivel === false) {
            let txtId = this.getAttribute("id");
            id = txtId.substring(3, 7);
            id = parseInt(id);
            arrayCoresSalvas[id].selecionado = true;
            arrayCoresSalvas[id].elemento.style.border = "1px solid rgb(255, 255, 255)";
            corEscolhidaPrincipal = arrayCoresSalvas[id].cor;
            corPrincipal.style.backgroundColor = "rgb(" + corEscolhidaPrincipal.R + ", " + corEscolhidaPrincipal.G + ", " + corEscolhidaPrincipal.B + ")";

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

        if (limiteDireita < colorPaintContent.offsetWidth && limiteEsquerda > 0 && limiteCima > 62 && limiteBaixo < colorPaintContent.offsetHeight - 7) {
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
        else if (limiteEsquerda <= 0 && limiteCima <= 62) {
            janelaSelecionarCor.style.left = "0px";
            janelaSelecionarCor.style.top = "62px";
        }
        else if (limiteDireita >= colorPaintContent.offsetWidth && limiteCima <= 62) {
            janelaSelecionarCor.style.left = (colorPaintContent.offsetWidth - janelaSelecionarCor.offsetWidth) + "px";
            janelaSelecionarCor.style.top = "62px";
        }
        else if (limiteDireita >= colorPaintContent.offsetWidth) {
            janelaSelecionarCor.style.left = (colorPaintContent.offsetWidth - janelaSelecionarCor.offsetWidth) + "px";
            janelaSelecionarCor.style.top = novaPosicaoYJanela + "px";
        }
        else if (limiteEsquerda <= 0) {
            janelaSelecionarCor.style.left = "0px";
            janelaSelecionarCor.style.top = novaPosicaoYJanela + "px";
        }
        else if (limiteCima <= 62) {
            janelaSelecionarCor.style.left = novaPosicaoXJanela + "px";
            janelaSelecionarCor.style.top = "62px";
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

    function moverCursorGradiente(x, y) {
        cursorGradiente.style.left = x + "px";
        cursorGradiente.style.top = y + "px";
        calcularCorPosiCursorGradiente();
    }

    function calcularCorPosiCursorGradiente() {
        let S = (gradienteCor.offsetWidth - (gradienteCor.offsetWidth - (cursorGradiente.offsetLeft + 10))) * (100 / gradienteCor.offsetWidth);
        let V = 100 - (gradienteCor.offsetHeight - (gradienteCor.offsetHeight - (cursorGradiente.offsetTop + 10))) * (100 / gradienteCor.offsetHeight);
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
}