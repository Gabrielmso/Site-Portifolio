let janelaSelecionarCorVisivel = false;//Saber se a janela de seleção de cor está "aberta".

function janelaSeletorDeCor() {
    let corEscolhida = { r: 0, g: 0, b: 0 }; //Armazena a cor selecionada com o cursor "cursorGradiente";
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

    let hsvBarra = { h: 0, s: 100, v: 100 },
        corParaAchar = {},//Armazena a cor a ser encontrada no formato RGB que foi digitada no "codRGB".
        clickBarra = false,//Saber se o click do mouse foi ou está pressionado em cima do "barraeEspectroCor".
        clickGradiente = false,//Saber se o click do mouse foi ou está pressionado em cima do "gradienteCor".
        clickMoverJanela = false,
        posMouseMoverJanela = { x: 0, y: 0 },//Armazena a posição do do mouse quando foi clicado para mover a janela.
        posMouseJanela = { x: 0, y: 0 };//Armazena a posição do mouse na "janelaSelecionarCor";    


    this.procurarCor = (color) => {
        hsvBarra = rgbToHsv(color); //Converte a cor digitada de RGB para HSV.
        encontrarCorDoCodigoNoGradiente(hsvBarra.s, hsvBarra.v);
    }

    const bttCorSalva = (e) => {//O que ocorre quando clicamos numa cor salva.
        const txtId = e.target.getAttribute("id");
        const id = parseInt(txtId.substring(3, 7));
        if (janelaSelecionarCorVisivel === false) {
            project.savedColors[id].selecionado = true;
            project.savedColors[id].elemento.style.boxShadow = "0px 0px 4px rgb(255, 255, 255)";
            project.selectedColors.primary = project.savedColors[id].cor;
            drawingTools.toolProperties.color = project.selectedColors.primary;
            corPrincipal.style.backgroundColor = "rgb(" + project.selectedColors.primary.r + ", " + project.selectedColors.primary.g + ", " + project.selectedColors.primary.b + ")";
            txtCorEscolhida.value = "rgb(" + project.selectedColors.primary.r + ", " + project.selectedColors.primary.g + ", " + project.selectedColors.primary.g + ")";
            for (let i = 0; i < project.savedColors.length; i++) {
                if (i != id) {
                    project.savedColors[i].selecionado = false;
                    project.savedColors[i].elemento.style.boxShadow = "";
                }
            }
        }
        else { this.procurarCor(project.savedColors[id].cor); }
    }

    this.salvarCor = (corParaSalvar) => {
        let corJaSalva = false;
        bttRemoverCorSalva.style.display = "block";
        for (let i = 0; i < project.savedColors.length; i++) {
            const cor = project.savedColors[i].cor;
            if (cor.r === corParaSalvar.r && cor.g === corParaSalvar.g && cor.b === corParaSalvar.b) {
                corJaSalva = true;
                alert("Essa cor já está salva!");
            }
        }
        if (corJaSalva === false) {
            const cor = "background-color: rgb(" + corParaSalvar.r + ", " + corParaSalvar.g + ", " + corParaSalvar.b + ");";
            const id = "cor" + (project.savedColors.length);
            const corSalva = document.createElement("div");
            corSalva.setAttribute("id", id);
            corSalva.setAttribute("class", "corSalva cursor");
            corSalva.setAttribute("style", cor);
            const infoCorSalva = {
                id: project.savedColors.length,
                elemento: corSalva,
                cor: { r: corParaSalvar.r, g: corParaSalvar.g, b: corParaSalvar.b },
                selecionado: false
            }
            project.savedColors.push(infoCorSalva);
            coresSalvas.appendChild(corSalva);
            project.savedColors[project.savedColors.length - 1].elemento.addEventListener("click", bttCorSalva);
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
        hsvBarra = { h: H, s: 100, v: 100 };
        cor = hsvToRgb(H, 100, 100);
        cursorBarra.style.backgroundColor = "rgb(" + cor.r + ", " + cor.g + ", " + cor.b + ")";
        preencheGradiente(cor);
    }

    function preencheGradiente(cor) {
        ctxGradiente.clearRect(0, 0, widthGradiente, heightGradiente);
        ctxGradiente.fillStyle = "rgb(" + cor.r + ", " + cor.g + ", " + cor.b + ")";
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
        const cor = hsvToRgb(hsvBarra.h, S, V);
        const stringCorRGB = "rgb(" + cor.r + ", " + cor.g + ", " + cor.b + ")";
        cursorGradiente.style.backgroundColor = stringCorRGB;
        corSelecionada.style.backgroundColor = stringCorRGB;
        codHEX.value = rgbTohex(cor);
        codRGB.value = cor.r + ", " + cor.g + ", " + cor.b;
        corEscolhida = cor;
    }

    codRGB.addEventListener("keyup", (e) => {
        let codCorAchar = e.target.value;
        codCorAchar = codCorAchar.split(",") || codCorAchar.split(", ");
        for (let i = 0; i < codCorAchar.length; i++) { codCorAchar[i] = parseInt(codCorAchar[i]); }
        if (codCorAchar.length === 3) {
            if (codCorAchar[0] <= 255 && codCorAchar[1] <= 255 && codCorAchar[2] <= 255) {
                corParaAchar = { r: codCorAchar[0], g: codCorAchar[1], b: codCorAchar[2] }
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
                corParaAchar = { r: codCorAchar[0], g: codCorAchar[1], b: codCorAchar[2] };
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
            project.selectedColors.primary = corEscolhida;
            drawingTools.toolProperties.color = project.selectedColors.primary
            corPrincipal.style.backgroundColor = "rgb(" + corEscolhida.r + ", " + corEscolhida.g + ", " + corEscolhida.b + ")";
        }
        else if (corPrincipalOuSecundaria === 2) {
            project.selectedColors.secondary = corEscolhida;
            corSecundaria.style.backgroundColor = "rgb(" + corEscolhida.r + ", " + corEscolhida.g + ", " + corEscolhida.b + ")";
        }
        txtCorEscolhida.value = "rgb(" + project.selectedColors.primary.r + ", " + project.selectedColors.primary.g + ", " + project.selectedColors.primary.b + ")";
        this.fechar();
        for (let i = 0; i < project.savedColors.length; i++) {
            project.savedColors[i].selecionado = false;
            project.savedColors[i].elemento.style.boxShadow = "";
        }
    });

    document.getElementById("bttSalvarCor").addEventListener("click", () => this.salvarCor(corEscolhida));

    bttRemoverCorSalva.addEventListener("click", () => {
        if (janelaSelecionarCorVisivel === false) {
            let novoArray = [];
            for (let i = 0; i < project.savedColors.length; i++) {
                project.savedColors[i].elemento.removeEventListener("click", bttCorSalva);
                if (project.savedColors[i].selecionado === true) { coresSalvas.removeChild(project.savedColors[i].elemento); }
                else { novoArray.push(project.savedColors[i]); }
            }
            project.savedColors = novoArray;
            for (let i = 0; i < project.savedColors.length; i++) {
                const id = "cor" + (i);
                project.savedColors[i].id = i;
                project.savedColors.selecionado = false;
                project.savedColors[i].elemento.setAttribute("id", id);
                project.savedColors[i].elemento.addEventListener("click", bttCorSalva);
            }
            if (project.savedColors.length === 0) { bttRemoverCorSalva.style.display = "none"; }
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
        calcularPosiDaCorCursorBarra(hsvBarra.h);
    }

    function calcularPosiDaCorCursorBarra(h) {
        const posx = (barraeEspectroCor.offsetWidth / 360) * h;
        const cor = hsvToRgb(h, 100, 100);
        cursorBarra.style.backgroundColor = "rgb(" + cor.r + ", " + cor.g + ", " + cor.b + ")";
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
    const rgb = cor.b | (cor.g << 8) | (cor.r << 16);
    return '#' + (0x1000000 + rgb).toString(16).slice(1)
}

function rgbToHsv(cor) {
    let rabs, gabs, babs, rr, gg, bb, h, v, diff, diffc, percentRoundFn;
    rabs = cor.r / 255;
    gabs = cor.g / 255;
    babs = cor.b / 255;
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
        h: (h * 360),
        s: percentRoundFn(s * 100),
        v: percentRoundFn(v * 100)
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
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

document.addEventListener("keydown", function (e) {
    if (e.code === "F5" && project.created) {
        e.preventDefault();
        return false;
    }
});