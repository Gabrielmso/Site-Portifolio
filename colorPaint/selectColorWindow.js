let janelaSelecionarCorVisivel = false;//Saber se a janela de seleção de cor está "aberta".

function janelaSeletorDeCor() {
    let corEscolhida = { R: 0, G: 0, B: 0 }; //Armazena a cor selecionada com o cursor "cursorGradiente";
    const coresSalvas = document.getElementById("coresSalvas"),
        janelaSelecionarCor = document.getElementById("janelaSelecionarCor"),
        bttRemoverCorSalva = document.getElementById("bttRemoverCorSalva"),
        corSelecionada = document.getElementById("corSelecionada"),//div que receberá a cor selecionada.
        barraeEspectroCor = document.getElementById("barraeEspectroCor"),//Canvas que receberá o espectro de cores.
        cursorBarra = document.getElementById("cursorBarra"),//Cursor que fica na "barraeEspectroCor".
        gradienteCor = document.getElementById("gradienteCor"),//Canvas que receberá o gradiente de cores da cor seleciona pelo cursor que fica na "barraeEspectroCor".
        cursorGradiente = document.getElementById("cursorGradiente"),//Cursor que fica na "gradienteCor".
        codRGB = document.getElementById("codRGB"),
        codHEX = document.getElementById("codHEX"),
        widthBarra = barraeEspectroCor.width, heightBarra = barraeEspectroCor.height,//Altura e largura do canvas "barraeEspectroCor" (Resolução).
        widthGradiente = gradienteCor.width, heightGradiente = gradienteCor.height,//Altura e largura do canvas "gradienteCor" (Resolução).
        ctxBarra = barraeEspectroCor.getContext("2d"),
        ctxGradiente = gradienteCor.getContext("2d");

    let hsvBarra = { H: 0, S: 100, V: 100 },
        corParaAchar = {},//Armazena a cor a ser encontrada no formato RGB que foi digitada no "codRGB".
        clickBarra = false,//Saber se o click do mouse foi ou está pressionado em cima do "barraeEspectroCor".
        clickGradiente = false,//Saber se o click do mouse foi ou está pressionado em cima do "gradienteCor".
        clickMoverJanela = false,
        posMouseMoverJanela = { x: 0, y: 0 },//Armazena a posição do do mouse quando foi clicado para mover a janela.
        posMouseJanela = { x: 0, y: 0 };//Armazena a posição do mouse na "janelaSelecionarCor";    


    this.procurarCor = (color) => {
        hsvBarra = rgbToHsv(color); //Converte a cor digitada de RGB para HSV.
        encontrarCorDoCodigoNoGradiente(hsvBarra.S, hsvBarra.V);
    }

    const bttCorSalva = (e) => {//O que ocorre quando clicamos numa cor salva.
        const txtId = e.target.getAttribute("id");
        const id = parseInt(txtId.substring(3, 7));
        if (janelaSelecionarCorVisivel === false) {
            arrayCoresSalvas[id].selecionado = true;
            arrayCoresSalvas[id].elemento.style.boxShadow = "0px 0px 4px rgb(255, 255, 255)";
            corEscolhidaPrincipal = arrayCoresSalvas[id].cor;
            drawingTools.toolProperties.color = corEscolhidaPrincipal;
            corPrincipal.style.backgroundColor = "rgb(" + corEscolhidaPrincipal.R + ", " + corEscolhidaPrincipal.G + ", " + corEscolhidaPrincipal.B + ")";
            txtCorEscolhida.value = "rgb(" + corEscolhidaPrincipal.R + ", " + corEscolhidaPrincipal.G + ", " + corEscolhidaPrincipal.B + ")";
            for (let i = 0; i < arrayCoresSalvas.length; i++) {
                if (i != id) {
                    arrayCoresSalvas[i].selecionado = false;
                    arrayCoresSalvas[i].elemento.style.boxShadow = "";
                }
            }
        }
        else { this.procurarCor(arrayCoresSalvas[id].cor); }
    }

    this.salvarCor = (corParaSalvar) => {
        let corJaSalva = false;
        bttRemoverCorSalva.style.display = "block";
        for (let i = 0; i < arrayCoresSalvas.length; i++) {
            const cor = arrayCoresSalvas[i].cor;
            if (cor.R === corParaSalvar.R && cor.G === corParaSalvar.G && cor.B === corParaSalvar.B) {
                corJaSalva = true;
                alert("Essa cor já está salva!");
            }
        }
        if (corJaSalva === false) {
            const cor = "background-color: rgb(" + corParaSalvar.R + ", " + corParaSalvar.G + ", " + corParaSalvar.B + ");";
            const id = "cor" + (arrayCoresSalvas.length);
            const corSalva = document.createElement("div");
            corSalva.setAttribute("id", id);
            corSalva.setAttribute("class", "corSalva cursor");
            corSalva.setAttribute("style", cor);
            const infoCorSalva = {
                id: arrayCoresSalvas.length,
                elemento: corSalva,
                cor: { R: corParaSalvar.R, G: corParaSalvar.G, B: corParaSalvar.B },
                selecionado: false
            }
            arrayCoresSalvas.push(infoCorSalva);
            coresSalvas.appendChild(corSalva);
            arrayCoresSalvas[arrayCoresSalvas.length - 1].elemento.addEventListener("click", bttCorSalva);
        }
    }

    this.abrir = (cor) => {
        drawingTools.previousTool = drawingTools.selectedTool;
        drawingTools.arrayTools[6].tool.click();//Mudar para a ferramenta Conta-gotas.
        janelaSelecionarCor.style.display = "block";
        janelaSelecionarCorVisivel = true;
        this.procurarCor(cor);
    }

    this.fechar = () => {
        janelaSelecionarCor.style.display = "none";
        janelaSelecionarCorVisivel = false;
        drawingTools.arrayTools[drawingTools.previousTool].tool.click();//Voltar para a ferramenta selecionada antes de abrir a "janelaSelecionarCor".
    }

    preencheBarraEspectro();

    cursorBarra.addEventListener("mousedown", () => clickBarra = true);

    barraeEspectroCor.addEventListener("mousedown", () => clickBarra = true);

    cursorGradiente.addEventListener("mousedown", () => clickGradiente = true);

    gradienteCor.addEventListener("mousedown", () => clickGradiente = true);

    janelaSelecionarCor.addEventListener("mousedown", (e) => {
        if (posMouseJanela.y < 10 && clickBarra === false && clickGradiente === false ||
            posMouseJanela.x < 10 || posMouseJanela.x > 540 && clickBarra === false && clickGradiente === false) {
            clickMoverJanela = true;
            posMouseMoverJanela = posMouseJanela;
        }
        moverCursores(e);
    });

    janelaSelecionarCor.addEventListener("mousemove", moverCursores);

    function moverCursores(e) {//Calcula a posição do mouse na "janelaSelecionarCor"
        const posMouse = pegarPosicaoMouse(janelaSelecionarCor, e);
        posMouseJanela = posMouse;
        if (clickGradiente === true) { moverCursor2(posMouseJanela.x, posMouseJanela.y); }
        else if (clickBarra === true) {
            if (posMouseJanela.x > 540) { moverCursorBarra(540 - 10); }
            else if (posMouseJanela.x < 10) { moverCursorBarra(0); }
            else { moverCursorBarra(posMouseJanela.x - 10); }
        }
    }

    function moverCursorBarra(x) {
        cursorBarra.style.left = x + "px";
        let H = ((x * 360) / barraeEspectroCor.offsetWidth), cor;
        if (H === 360) { H = 0; }
        hsvBarra = { H: H, S: 100, V: 100 };
        cor = hsvToRgb(H, 100, 100);
        cursorBarra.style.backgroundColor = "rgb(" + cor.R + ", " + cor.G + ", " + cor.B + ")";
        preencheGradiente(cor);
    }

    function preencheGradiente(cor) {
        ctxGradiente.clearRect(0, 0, widthGradiente, heightGradiente);
        ctxGradiente.fillStyle = "rgb(" + cor.R + ", " + cor.G + ", " + cor.B + ")";
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
        calcularCorPosiCursorGradiente();
    }

    function moverCursorGradiente(x, y) {
        cursorGradiente.style.left = x + "px";
        cursorGradiente.style.top = y + "px";
        calcularCorPosiCursorGradiente();
    }

    function calcularCorPosiCursorGradiente() {
        let S = ((cursorGradiente.offsetLeft + 10) * 100) / gradienteCor.offsetWidth;
        let V = 100 - ((cursorGradiente.offsetTop + 10) * 100) / gradienteCor.offsetHeight;
        if (S == 0) { S = 0.02; }
        if (V == 0) { V = 0.02; }
        const cor = hsvToRgb(hsvBarra.H, S, V);
        const stringCorRGB = "rgb(" + cor.R + ", " + cor.G + ", " + cor.B + ")";
        cursorGradiente.style.backgroundColor = stringCorRGB;
        corSelecionada.style.backgroundColor = stringCorRGB;
        codHEX.value = rgbTohex(cor);
        codRGB.value = cor.R + ", " + cor.G + ", " + cor.B;
        corEscolhida = cor;
    }

    codRGB.addEventListener("keyup", (e) => {
        let codCorAchar = e.target.value;
        codCorAchar = codCorAchar.split(",") || codCorAchar.split(", ");
        for (let i = 0; i < codCorAchar.length; i++) { codCorAchar[i] = parseInt(codCorAchar[i]); }
        if (codCorAchar.length === 3) {
            if (codCorAchar[0] <= 255 && codCorAchar[1] <= 255 && codCorAchar[2] <= 255) {
                corParaAchar = { R: codCorAchar[0], G: codCorAchar[1], B: codCorAchar[2] }
                this.procurarCor(corParaAchar);
            }
        }
    });

    codHEX.addEventListener("keyup", (e) => {
        let codCorHEX = e.target.value;
        if (codCorHEX.indexOf("#") === -1) { codCorHEX = "#" + codCorHEX; }
        let codCorAchar = hexToRgb(codCorHEX);
        if (codCorAchar != null) {
            if (codCorAchar[0] <= 255 && codCorAchar[1] <= 255 && codCorAchar[2] <= 255) {
                corParaAchar = { R: codCorAchar[0], G: codCorAchar[1], B: codCorAchar[2] };
                this.procurarCor(corParaAchar);
            }
        }
    });

    document.addEventListener("mouseup", () => {
        clickBarra = false;
        clickGradiente = false;
        clickMoverJanela = false;
    });

    document.getElementById("bttOkSelecionaCor").addEventListener("click", () => {
        if (corPrincipalOuSecundaria === 1) {
            corEscolhidaPrincipal = corEscolhida;
            drawingTools.toolProperties.color = corEscolhidaPrincipal
            corPrincipal.style.backgroundColor = "rgb(" + corEscolhida.R + ", " + corEscolhida.G + ", " + corEscolhida.B + ")";
        }
        else if (corPrincipalOuSecundaria === 2) {
            corEscolhidaSecudaria = corEscolhida;
            corSecundaria.style.backgroundColor = "rgb(" + corEscolhida.R + ", " + corEscolhida.G + ", " + corEscolhida.B + ")";
        }
        txtCorEscolhida.value = "rgb(" + corEscolhidaPrincipal.R + ", " + corEscolhidaPrincipal.G + ", " + corEscolhidaPrincipal.B + ")";
        this.fechar();
        for (let i = 0; i < arrayCoresSalvas.length; i++) {
            arrayCoresSalvas[i].selecionado = false;
            arrayCoresSalvas[i].elemento.style.boxShadow = "";
        }
    });

    document.getElementById("bttSalvarCor").addEventListener("click", () => this.salvarCor(corEscolhida));

    bttRemoverCorSalva.addEventListener("click", () => {
        if (janelaSelecionarCorVisivel === false) {
            let novoArray = [];
            for (let i = 0; i < arrayCoresSalvas.length; i++) {
                arrayCoresSalvas[i].elemento.removeEventListener("click", bttCorSalva);
                if (arrayCoresSalvas[i].selecionado === true) { coresSalvas.removeChild(arrayCoresSalvas[i].elemento); }
                else { novoArray.push(arrayCoresSalvas[i]); }
            }
            arrayCoresSalvas = novoArray;
            for (let i = 0; i < arrayCoresSalvas.length; i++) {
                const id = "cor" + (i);
                arrayCoresSalvas[i].id = i;
                arrayCoresSalvas.selecionado = false;
                arrayCoresSalvas[i].elemento.setAttribute("id", id);
                arrayCoresSalvas[i].elemento.addEventListener("click", bttCorSalva);
            }
            if (arrayCoresSalvas.length === 0) { bttRemoverCorSalva.style.display = "none"; }
        }
    });

    document.getElementById("bttCancelarSelecionaCor").addEventListener("click", () => this.fechar());

    function moverCursor2(X, Y) {
        if (X <= 540 && X >= 110 && Y <= 265 && Y >= 10) { moverCursorGradiente(X - 120, Y - 20); }
        else if (X > 540 && Y < 10) { moverCursorGradiente(540 - 120, 10 - 20); }
        else if (X > 540 && Y < 265) { moverCursorGradiente(540 - 120, Y - 20); }
        else if (X > 540 && Y >= 265) { moverCursorGradiente(540 - 120, 265 - 20); }
        else if (X <= 540 && X >= 110 && Y >= 265) { moverCursorGradiente(X - 120, 265 - 20); }
        else if (X < 110 && Y >= 265) { moverCursorGradiente(110 - 120, 265 - 20); }
        else if (X < 110 && Y < 265 && Y > 10) { moverCursorGradiente(110 - 120, Y - 20); }
        else if (X < 110 && Y <= 10) { moverCursorGradiente(110 - 120, 10 - 20); }
        else if (X <= 540 && X >= 110 && Y <= 10) { moverCursorGradiente(X - 120, 10 - 20); }
    }

    colorPaintContent.addEventListener("mousemove", (e) => {
        if (clickMoverJanela === true && clickBarra === false && clickGradiente === false) {
            const posMouse = pegarPosicaoMouse(colorPaintContent, e);
            moverjanelaSelecionarCorNaPagina(posMouse.x, posMouse.y);
        }
    });

    function moverjanelaSelecionarCorNaPagina(x, y) {
        const novaPosicaoXJanela = x - posMouseMoverJanela.x, novaPosicaoYJanela = y - posMouseMoverJanela.y,
            limiteDireita = x + (janelaSelecionarCor.offsetWidth - posMouseMoverJanela.x), limiteEsquerda = x - (posMouseMoverJanela.x),
            limiteCima = y - (posMouseMoverJanela.y), limiteBaixo = y + (janelaSelecionarCor.offsetHeight - posMouseMoverJanela.y);
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

    function calcularPosiDaCorCursorBarra(h) {
        const posx = (barraeEspectroCor.offsetWidth / 360) * h;
        const cor = hsvToRgb(h, 100, 100);
        cursorBarra.style.backgroundColor = "rgb(" + cor.R + ", " + cor.G + ", " + cor.B + ")";
        moverCursorBarra(posx);
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
}

//================================================================================================================================
function hexToRgb(hex) {
    const resul = hex.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
    if (resul) { return resul.slice(1, 4).map(function (x) { return parseInt(x, 16); }); }
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