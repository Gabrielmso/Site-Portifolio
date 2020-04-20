function drawingToolsObject() {
    return {
        arrayTools: [
            { tool: document.getElementById("pincel"), name: "brush", id: 0 },
            { tool: document.getElementById("linha"), name: "line", id: 1 },
            { tool: document.getElementById("retangulo"), name: "rectangle", id: 2 },
            { tool: document.getElementById("elipse"), name: "ellipse", id: 3 },
            { tool: document.getElementById("borracha"), name: "eraser", id: 4 },
            { tool: document.getElementById("curva"), name: "curve", id: 5 },
            {
                tool: document.getElementById("contaGotas"), name: "eyeDropper", id: 6,
                cursor: {
                    eyeDropper: document.getElementById("cursorComparaContaGotas"),
                    compareColors: document.getElementById("comparaCoresContaGotas")
                }
            },
            { tool: document.getElementById("baldeDeTinta"), name: "paintBucket", id: 7 }
        ],
        cursorTool: {
            cursor: document.getElementById("cursorFerramenta"),
            show: false,
            halfSize: 20,
            changeCursorPosition(left, top) {
                this.cursor.style.top = top + "px";
                this.cursor.style.left = left + "px";
            },
            showCursor() {
                this.show = true;
            },
            removeCursor() {
                this.show = false;
                this.cursor.style.display = "none";
            }
        },
        selectedTool: 0,
        previousTool: null,
        clickToCurve: false,
        mousePosition: { x: 0, y: 0 },//Armazena as coordenadas atuais do mouse em relação a resolução do projeto.
        strokeCoordinates: { x: [], y: [] },//Armazena as coordenadas do uso das ferramentas.
        painting: false,//Saber se o mouse está pressionado na "contentTelas".
        toolProperties: {
            elements: [{ property: document.getElementById("propriedadeTamanho"), contentBar: document.getElementById("contentBarraTamanho") },
            { property: document.getElementById("propriedadeOpacidade"), contentBar: document.getElementById("contentBarraOpacidade") },
            { property: document.getElementById("propriedadeDureza"), contentBar: document.getElementById("contentBarraDureza") }],
            size: 5, opacity: 1, hardness: 1, color: { R: 0, G: 0, B: 0 }
        },
        toolSizeBar: {
            bar: document.getElementById("barraTamanho"),
            cursor: document.getElementById("cursorTamanho"),
            txt: document.getElementById("txtTamanhoFerramenta"),
            clicked: false
        },
        toolOpacityBar: {
            bar: document.getElementById("barraOpacidade"),
            cursor: document.getElementById("cursorOpacidade"),
            txt: document.getElementById("txtOpacidadeFerramenta"),
            clicked: false
        },
        toolHardnessBar: {
            bar: document.getElementById("barraDureza"),
            cursor: document.getElementById("cursorDureza"),
            txt: document.getElementById("txtDurezaFerramenta"),
            clicked: false
        },
        getCursorPosition(e) {
            if (this.cursorTool.show) {
                const telaPosition = telasCanvas.getBoundingClientRect(), mouse = pegarPosicaoMouse(janelaPrincipal, e),
                    posX = mouse.x - this.cursorTool.halfSize, posY = mouse.y - this.cursorTool.halfSize;
                this.cursorTool.changeCursorPosition(posX, posY);
                this.mousePosition.x = parseFloat(((projeto.resolucao.largura / telasCanvas.offsetWidth) * (mouse.x - telaPosition.left - document.body.scrollLeft)).toFixed(1));
                this.mousePosition.y = parseFloat(((projeto.resolucao.altura / telasCanvas.offsetHeight) * (mouse.y - telaPosition.top - document.body.scrollTop)).toFixed(1));
                if (!this.painting) {
                    const contentPosition = contentTelas.getBoundingClientRect();
                    if (mouse.x < contentPosition.left || mouse.x > contentPosition.left + contentPosition.width ||
                        mouse.y < contentPosition.top || mouse.y > contentPosition.top + contentPosition.height) {
                        this.cursorTool.cursor.style.display = "none";
                    }
                    else if (!hotKeys.spacePressed) { this.cursorTool.cursor.style.display = "block"; }
                }
            } else {
                const mouse = pegarPosicaoMouse(telasCanvas, e)
                this.mousePosition.x = parseFloat(((projeto.resolucao.largura / telasCanvas.offsetWidth) * mouse.x).toFixed(1));
                this.mousePosition.y = parseFloat(((projeto.resolucao.altura / telasCanvas.offsetHeight) * mouse.y).toFixed(1));
            }
        },
        addEventsToElements() {
            contentTelas.addEventListener("mousedown", (e) => this.mouseDownEventDrawing(e));
            this.cursorTool.cursor.addEventListener("mousedown", (e) => this.mouseDownEventDrawing(e));
            document.addEventListener("mousemove", (e) => this.getCursorPosition(e));
            document.addEventListener("mousemove", throttle((e) => this.mouseMoveEventDrawing(e), 8));
            document.addEventListener("mouseup", (e) => this.mouseUpEventDrawing(e));
            this.toolOpacityBar.bar.addEventListener("mousedown", (e) => this.mouseDownToolOpacityBar(e));
            this.toolSizeBar.bar.addEventListener("mousedown", (e) => this.mouseDownToolSizeBar(e));
            this.toolHardnessBar.bar.addEventListener("mousedown", (e) => this.mouseDownToolHardnessBar(e));
            for (let i = 0; i < this.toolProperties.elements.length; i++) {
                let el = this.toolProperties.elements[i];
                el.property.addEventListener("mouseenter", () => {
                    if (this.painting === false) { el.contentBar.style.height = "36px"; }
                });
                el.property.addEventListener("mouseleave", () => el.contentBar.style.height = "0px");
            }
            for (let i = 0; i < this.arrayTools.length; i++) {
                this.arrayTools[i].tool.addEventListener("click", () => {
                    if (janelaSelecionarCorVisivel === false) { this.selectDrawingTool(i); }
                });
            }
            this.arrayTools[6].tool.addEventListener("click", () => desenhoCompleto());
        },
        mouseDownEventDrawing(e) {
            if (projetoCriado === false || hotKeys.spacePressed === true) { return; }
            if (arrayCamadas[camadaSelecionada].visivel === true) {
                this.painting = true;
                this.applyToolChanges();
                ctxPintar.beginPath();
                arrayCamadas[camadaSelecionada].ctx.globalCompositeOperation = "source-over";
                if (this.selectedTool < 4) {
                    this.strokeCoordinates.x[0] = this.mousePosition.x;
                    this.strokeCoordinates.y[0] = this.mousePosition.y;
                    ctxPintar.lineJoin = ctxPintar.lineCap = "round";
                    this[this.arrayTools[this.selectedTool].name](this.mousePosition.x, this.mousePosition.y);
                }
                else if (this.selectedTool === 4) {//Borracha. 
                    this.strokeCoordinates.x[0] = this.mousePosition.x;
                    this.strokeCoordinates.y[0] = this.mousePosition.y;
                    arrayCamadas[camadaSelecionada].ctx.globalCompositeOperation = "destination-out";
                    ctxPintar.strokeStyle = "rgba(255, 0, 0, " + this.toolProperties.opacity + ")";
                    this.brush(this.mousePosition.x, this.mousePosition.y);
                }
                else if (this.selectedTool === 5) {//Curva;
                    ctxPintar.lineJoin = ctxPintar.lineCap = "round";
                    if (this.clickToCurve === false) {
                        this.strokeCoordinates.x[0] = this.mousePosition.x;
                        this.strokeCoordinates.y[0] = this.mousePosition.y;
                    }
                    this.curve(this.mousePosition.x, this.mousePosition.y, this.clickToCurve);
                }
                else if (this.selectedTool === 6) {//Conta-gotas.
                    this.arrayTools[this.selectedTool].cursor.eyeDropper.style.display = "block";
                    const corAtual = "25px solid rgb(" + corEscolhidaPrincipal.R + ", " + corEscolhidaPrincipal.G + ", " + corEscolhidaPrincipal.B + ")";
                    this.arrayTools[this.selectedTool].cursor.compareColors.style.borderLeft = corAtual;
                    this.arrayTools[this.selectedTool].cursor.compareColors.style.borderBottom = corAtual;
                    const mousePos = pegarPosicaoMouse(janelaPrincipal, e);
                    this.eyeDropper(mousePos.x, mousePos.y, this.mousePosition.x, this.mousePosition.y, true);
                }
                else if (this.selectedTool === 7) {//Balde de tinta.
                    if (this.mousePosition.x >= 0 && this.mousePosition.x <= projeto.resolucao.largura && this.mousePosition.y >= 0 && this.mousePosition.y <= projeto.resolucao.altura) {
                        const cor = { R: corEscolhidaPrincipal.R, G: corEscolhidaPrincipal.G, B: corEscolhidaPrincipal.B, A: Math.round(this.toolProperties.opacity * 255) };
                        this.paintBucket(this.mousePosition.x, this.mousePosition.y, arrayCamadas[camadaSelecionada].ctx, cor);
                    }
                }
            }
        },
        mouseUpEventDrawing(e) {
            if (this.painting === true) {
                this.painting = false;
                if (this.selectedTool === 6) {//Conta-gotas.  
                    const mousePos = pegarPosicaoMouse(janelaPrincipal, e);
                    this.eyeDropper(mousePos.x, mousePos.y, this.mousePosition.x, this.mousePosition.y, false)
                    this.arrayTools[this.selectedTool].cursor.eyeDropper.style.display = "none";
                    return;
                }
                else if (this.selectedTool === 5) {//Curva. 
                    this.clickToCurve = !(this.clickToCurve);
                    if (this.strokeCoordinates.x.length === 2) { return; }
                }
                this.strokeCoordinates.x = [];
                this.strokeCoordinates.y = [];
                desenharNaCamada();
                desenhoNoPreviewEIcone();
            }
            this.toolOpacityBar.clicked = false;
            this.toolSizeBar.clicked = false;
            this.toolHardnessBar.clicked = false;
        },
        mouseMoveEventDrawing(e) {
            if (this.painting) {
                const lastIndex = this.strokeCoordinates.x.length - 1;
                if (this.selectedTool < 4) {
                    if (this.strokeCoordinates.x[lastIndex] === this.mousePosition.x &&
                        this.strokeCoordinates.y[lastIndex] === this.mousePosition.y) { return; }
                    this[this.arrayTools[this.selectedTool].name](this.mousePosition.x, this.mousePosition.y);
                }
                else if (this.selectedTool === 4) {//Borracha. 
                    if (this.strokeCoordinates.x[lastIndex] === this.mousePosition.x &&
                        this.strokeCoordinates.y[lastIndex] === this.mousePosition.y) { return; }
                    this.brush(this.mousePosition.x, this.mousePosition.y);
                }
                else if (this.selectedTool === 5) {//Curva;
                    this.curve(this.mousePosition.x, this.mousePosition.y, this.clickToCurve);
                }
                else if (this.selectedTool === 6) {//Conta-gotas.
                    const mousePos = pegarPosicaoMouse(janelaPrincipal, e);
                    this.eyeDropper(mousePos.x, mousePos.y, this.mousePosition.x, this.mousePosition.y, true)
                }
            }
            else if (this.toolSizeBar.clicked) { this.changeToolSize(e); }
            else if (this.toolOpacityBar.clicked) { this.changeToolOpacity(e); }
            else if (this.toolHardnessBar.clicked) { this.changeToolHardness(e); }
        },
        changeToolSizeHotKey(increase) {
            if (increase === true) {//Aumenta o tamanho da ferramenta.
                if (this.toolProperties.size === 0.5) {
                    this.toolProperties.size = 1;
                    this.toolSizeBar.cursor.style.left = 1 - 7 + "px";
                    this.toolSizeBar.txt.value = "1px";
                } else if (this.toolProperties.size < 15) {
                    this.toolProperties.size = this.toolProperties.size + 1;
                    this.toolSizeBar.txt.value = this.toolProperties.size + "px";
                    this.toolSizeBar.cursor.style.left = this.toolProperties.size - 7 + "px";
                } else if (this.toolProperties.size >= 15 && this.toolProperties.size <= 245) {
                    this.toolProperties.size = this.toolProperties.size + 5;
                    this.toolSizeBar.txt.value = this.toolProperties.size + "px";
                    this.toolSizeBar.cursor.style.left = this.toolProperties.size - 7 + "px";
                } else if (this.toolProperties.size > 245) {
                    this.toolProperties.size = 250;
                    this.toolSizeBar.txt.value = this.toolProperties.size + "px";
                    this.toolSizeBar.cursor.style.left = this.toolProperties.size - 7 + "px";
                }
            } else {//Diminui o tamanho da ferramenta.
                if (this.toolProperties.size <= 250 && this.toolProperties.size > 15) {
                    this.toolProperties.size = this.toolProperties.size - 5;
                    this.toolSizeBar.cursor.style.left = this.toolProperties.size - 7 + "px";
                    this.toolSizeBar.txt.value = this.toolProperties.size + "px";
                } else if (this.toolProperties.size <= 15 && this.toolProperties.size > 1) {
                    this.toolProperties.size = this.toolProperties.size - 1;
                    this.toolSizeBar.txt.value = this.toolProperties.size + "px";
                    this.toolSizeBar.cursor.style.left = this.toolProperties.size - 7 + "px";
                } else if (this.toolProperties.size === 1) {
                    this.toolProperties.size = 0.5;
                    this.toolSizeBar.cursor.style.left = "-7px"
                    this.toolSizeBar.txt.value = "0.5px";
                }
            }
            this.changeCursorTool();
        },
        mouseDownToolSizeBar(e) {
            if (this.clickToCurve === true) { return; }
            this.toolSizeBar.clicked = true;
            this.changeToolSize(e);
        },
        mouseDownToolOpacityBar(e) {
            if (this.clickToCurve === true) { return; }
            this.toolOpacityBar.clicked = true;
            this.changeToolOpacity(e);
        },
        mouseDownToolHardnessBar(e) {
            if (this.clickToCurve === true) { return; }
            this.toolHardnessBar.clicked = true;
            this.changeToolHardness(e);
        },
        selectDrawingTool(index) {
            this.selectedTool = this.arrayTools[index].id;
            this.arrayTools[index].tool.classList.remove("bttFerramentas");
            this.arrayTools[index].tool.classList.add("bttFerramentasEscolhida");
            for (let e = 0; e < this.arrayTools.length; e++) {
                if (e != index) {
                    this.arrayTools[e].tool.classList.remove("bttFerramentasEscolhida");
                    this.arrayTools[e].tool.classList.add("bttFerramentas");
                }
            }
            if (this.selectedTool === 6) { document.getElementById("propriedadesFerramentas").style.display = "none"; }
            else { document.getElementById("propriedadesFerramentas").style.display = "block"; }
            this.strokeCoordinates.x = [];
            this.strokeCoordinates.y = [];
            this.clickToCurve = false;
            this.changeCursorTool();
            ctxPintar.clearRect(0, 0, projeto.resolucao.largura, projeto.resolucao.altura);
        },
        changeToolSize(e) {
            let mousePos = pegarPosicaoMouse(this.toolSizeBar.bar, e), width = this.toolSizeBar.bar.offsetWidth;
            mousePos.x = Math.round(mousePos.x);
            if (mousePos.x <= 0) {
                mousePos.x = 0.5;
                this.toolSizeBar.cursor.style.left = "-7px";
                this.toolSizeBar.txt.value = "0.5px";
            }
            else if (mousePos.x >= width) {
                mousePos.x = width;
                this.toolSizeBar.cursor.style.left = width - 7 + "px";;
                this.toolSizeBar.txt.value = width + "px";
            }
            else {
                this.toolSizeBar.cursor.style.left = mousePos.x - 7 + "px";
                this.toolSizeBar.txt.value = mousePos.x + "px";
            }
            this.toolProperties.size = mousePos.x;
            this.changeCursorTool();
        },
        changeToolOpacity(e) {
            const mousePos = pegarPosicaoMouse(this.toolOpacityBar.bar, e), width = this.toolOpacityBar.bar.offsetWidth;
            let percentage = Math.round((mousePos.x * 100) / width);
            if (mousePos.x <= 1) {
                percentage = 1;
                this.toolOpacityBar.cursor.style.left = "-7px";
                this.toolOpacityBar.txt.value = "1%";
            }
            else if (mousePos.x >= width) {
                percentage = 100;
                this.toolOpacityBar.cursor.style.left = width - 7 + "px";
                this.toolOpacityBar.txt.value = "100%";
            }
            else {
                this.toolOpacityBar.cursor.style.left = mousePos.x - 7 + "px";
                this.toolOpacityBar.txt.value = percentage + "%";
            }
            this.toolProperties.opacity = percentage / 100;
        },
        changeToolHardness(e) {
            const mousePos = pegarPosicaoMouse(this.toolHardnessBar.bar, e), width = this.toolHardnessBar.bar.offsetWidth;
            let percentage = Math.round((mousePos.x * 100) / width);
            if (mousePos.x < 1) {
                percentage = 0;
                this.toolHardnessBar.cursor.style.left = "-7px";
                this.toolHardnessBar.txt.value = "0%";
            }
            else if (mousePos.x >= width) {
                percentage = 100;
                this.toolHardnessBar.cursor.style.left = width - 7 + "px";
                this.toolHardnessBar.txt.value = "100%";
            }
            else {
                this.toolHardnessBar.cursor.style.left = mousePos.x - 7 + "px";
                this.toolHardnessBar.txt.value = percentage + "%";
            }
            this.toolProperties.hardness = percentage / 100;
        },
        applyToolChanges() {
            const maximoBlur = this.toolProperties.size / 6.2;
            const color = this.toolProperties.color;
            let dureza = maximoBlur - (maximoBlur * this.toolProperties.hardness);
            if (this.toolProperties.size < 100) {
                const proporcao = ((100 - this.toolProperties.size) / 180);
                dureza += (dureza * proporcao);
            }
            ctxPintar.filter = "blur(" + dureza + "px)";
            ctxPintar.lineWidth = (this.toolProperties.size - dureza);
            ctxPintar.strokeStyle = "rgba(" + color.R + ", " + color.G + ", " + color.B + ", " + this.toolProperties.opacity + ")";
        },
        changeCursorTool() {
            if (this.selectedTool === 6) {
                this.cursorTool.removeCursor();
                contentTelas.style.cursor = "url('colorPaint/imagens/cursor/cursorContaGotas.png') 0 20, pointer";
                return;
            };
            if (this.selectedTool === 7) {
                this.cursorTool.removeCursor();
                contentTelas.style.cursor = "url('colorPaint/imagens/cursor/cursorBaldeDeTinta.png') 0 0, pointer";
                return;
            };
            const tamanho = this.toolProperties.size * ((telasCanvas.offsetWidth) / projeto.resolucao.largura);
            if (tamanho < 20) {
                this.cursorTool.removeCursor();
                contentTelas.style.cursor = "url('colorPaint/imagens/cursor/crossHair.png') 12.5 12.5, pointer";
            } else {
                const halfSizePrevious = this.cursorTool.halfSize;
                this.cursorTool.showCursor();
                this.cursorTool.halfSize = tamanho / 2;
                this.cursorTool.cursor.style.width = tamanho + "px";
                this.cursorTool.cursor.style.height = tamanho + "px";
                this.cursorTool.changeCursorPosition(this.cursorTool.cursor.offsetLeft + Math.floor(halfSizePrevious - this.cursorTool.halfSize), this.cursorTool.cursor.offsetTop + Math.floor(halfSizePrevious - this.cursorTool.halfSize));
            }
        },
        brush(mouseX, mouseY) {
            this.strokeCoordinates.x.push(mouseX);
            this.strokeCoordinates.y.push(mouseY);
            ctxPintar.clearRect(0, 0, projeto.resolucao.largura, projeto.resolucao.altura);
            let ponto1 = { x: this.strokeCoordinates.x[0], y: this.strokeCoordinates.y[0] };
            let ponto2 = { x: this.strokeCoordinates.x[1], y: this.strokeCoordinates.y[1] };
            ctxPintar.beginPath();
            ctxPintar.moveTo(ponto1.x, ponto1.y);
            for (let i = 0; i < this.strokeCoordinates.x.length; i++) {
                const midPoint = midPointBtw(ponto1, ponto2);
                ctxPintar.quadraticCurveTo(ponto1.x, ponto1.y, midPoint.x, midPoint.y);
                ponto1 = { x: this.strokeCoordinates.x[i], y: this.strokeCoordinates.y[i] };
                ponto2 = { x: this.strokeCoordinates.x[i + 1], y: this.strokeCoordinates.y[i + 1] };
            }
            ctxPintar.lineTo(ponto1.x, ponto1.y);
            ctxPintar.stroke();
            function midPointBtw(ponto1, ponto2) {
                return { x: ponto1.x + (ponto2.x - ponto1.x) / 2, y: ponto1.y + (ponto2.y - ponto1.y) / 2 };
            }
        },
        line(mouseX, mouseY) {
            this.strokeCoordinates.x[1] = mouseX;
            this.strokeCoordinates.y[1] = mouseY;
            ctxPintar.clearRect(0, 0, projeto.resolucao.largura, projeto.resolucao.altura);
            const pontoInicial = { x: this.strokeCoordinates.x[0], y: this.strokeCoordinates.y[0] },
                pontoFinal = { x: this.strokeCoordinates.x[1], y: this.strokeCoordinates.y[1] };
            ctxPintar.beginPath();
            ctxPintar.moveTo(pontoInicial.x, pontoInicial.y);
            ctxPintar.lineTo(pontoFinal.x, pontoFinal.y);
            ctxPintar.stroke();
        },
        rectangle(mouseX, mouseY) {
            this.strokeCoordinates.x[1] = mouseX;
            this.strokeCoordinates.y[1] = mouseY;
            ctxPintar.clearRect(0, 0, projeto.resolucao.largura, projeto.resolucao.altura);
            const pontoInicial = { x: this.strokeCoordinates.x[0], y: this.strokeCoordinates.y[0] },
                pontoFinal = { x: this.strokeCoordinates.x[1], y: this.strokeCoordinates.y[1] };
            ctxPintar.beginPath();
            ctxPintar.strokeRect(pontoInicial.x, pontoInicial.y, pontoFinal.x - pontoInicial.x, pontoFinal.y - pontoInicial.y);
        },
        ellipse(mouseX, mouseY) {
            this.strokeCoordinates.x[1] = mouseX;
            this.strokeCoordinates.y[1] = mouseY;
            ctxPintar.clearRect(0, 0, projeto.resolucao.largura, projeto.resolucao.altura);
            const pontoInicial = { x: this.strokeCoordinates.x[0], y: this.strokeCoordinates.y[0] },
                pontoFinal = { x: this.strokeCoordinates.x[1], y: this.strokeCoordinates.y[1] };
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
        },
        curve(mouseX, mouseY, curvar) {
            if (curvar === false) {
                this.strokeCoordinates.x[1] = mouseX;
                this.strokeCoordinates.y[1] = mouseY;
            }
            ctxPintar.clearRect(0, 0, projeto.resolucao.largura, projeto.resolucao.altura);
            const pontoInicial = { x: this.strokeCoordinates.x[0], y: this.strokeCoordinates.y[0] },
                pontoFinal = { x: this.strokeCoordinates.x[1], y: this.strokeCoordinates.y[1] };
            ctxPintar.beginPath();
            ctxPintar.moveTo(pontoInicial.x, pontoInicial.y);
            if (curvar === true) {
                this.strokeCoordinates.x[2] = mouseX;
                this.strokeCoordinates.y[2] = mouseY;
                const pontoControle = { x: this.strokeCoordinates.x[2], y: this.strokeCoordinates.y[2] };
                ctxPintar.quadraticCurveTo(pontoControle.x, pontoControle.y, pontoFinal.x, pontoFinal.y);
            }
            else {
                ctxPintar.lineTo(pontoFinal.x, pontoFinal.y);
            }
            ctxPintar.stroke();
        },
        eyeDropper(mouseX, mouseY, posTelaX, posTelaY, mouseMovendo) {
            const cursorEyeDropper = this.arrayTools[this.selectedTool].cursor.eyeDropper,
                X = mouseX - (cursorEyeDropper.offsetWidth / 2), Y = mouseY - (cursorEyeDropper.offsetHeight / 2);
            cursorEyeDropper.style.left = X + "px";
            cursorEyeDropper.style.top = Y + "px";
            const pixel = ctxDesenho.getImageData(posTelaX, posTelaY, 1, 1).data;
            if (mouseMovendo === true) {
                const compareColors = this.arrayTools[this.selectedTool].cursor.compareColors;
                if (pixel[3] === 0) {
                    const novaCor = "25px solid rgba(0, 0, 0, 0)";
                    compareColors.style.borderRight = novaCor;
                    compareColors.style.borderTop = novaCor;
                    return;
                }
                const novaCor = "25px solid rgb(" + pixel[0] + ", " + pixel[1] + ", " + pixel[2] + ")";
                compareColors.style.borderRight = novaCor;
                compareColors.style.borderTop = novaCor;
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
                    this.toolProperties.color = corEscolhidaPrincipal;
                    const novaCor = "rgb(" + corEscolhidaPrincipal.R + ", " + corEscolhidaPrincipal.G + ", " + corEscolhidaPrincipal.B + ")";
                    corPrincipal.style.backgroundColor = novaCor;
                    txtCorEscolhida.value = novaCor;
                }
            }
        },
        paintBucket(mouseX, mouseY, context, selectedColor) {
            this.strokeCoordinates.x[0] = Math.round(mouseX);
            this.strokeCoordinates.y[0] = Math.round(mouseY);
            const camada = context.getImageData(0, 0, projeto.resolucao.largura, projeto.resolucao.altura),
                clearCanvas = context.createImageData(projeto.resolucao.largura, projeto.resolucao.altura);
            pintar(this.strokeCoordinates.x[0], this.strokeCoordinates.y[0]);
            function pintar(posX, posY) {
                const pixelPos = (posY * projeto.resolucao.largura + posX) * 4, R = camada.data[pixelPos],
                    G = camada.data[pixelPos + 1], B = camada.data[pixelPos + 2], A = camada.data[pixelPos + 3];
                if (R === selectedColor.R && G === selectedColor.G && B === selectedColor.B && A === 255) { return; }
                preencher(posX, posY, R, G, B, A);
            }
            function preencher(posClickX, posClickY, R, G, B, A) {
                let pixelsVerificados = [[posClickX, posClickY]];
                while (pixelsVerificados.length > 0) {
                    const novaPosicao = pixelsVerificados.pop();
                    let x = novaPosicao[0], y = novaPosicao[1];
                    let posicaoPixel = (y * projeto.resolucao.largura + x) * 4;
                    while (y >= 0 && compararCorInicial(posicaoPixel, R, G, B, A)) {
                        y = y - 1;
                        posicaoPixel = posicaoPixel - projeto.resolucao.largura * 4;
                    }
                    pintarPixel(posicaoPixel, selectedColor.R, selectedColor.G, selectedColor.B, selectedColor.A);
                    posicaoPixel = posicaoPixel + projeto.resolucao.largura * 4;
                    y = y + 1;
                    let ladoEsquerdo = false, ladoDireito = false;
                    while (y < projeto.resolucao.altura - 1 && compararCorInicial(posicaoPixel, R, G, B, A)) {
                        pintarPixel(posicaoPixel, selectedColor.R, selectedColor.G, selectedColor.B, selectedColor.A);
                        y = y + 1;
                        if (x > 0) {
                            if (compararCorInicial(posicaoPixel - 4, R, G, B, A) === true) {
                                if (ladoEsquerdo === false) {
                                    ladoEsquerdo = true;
                                    pixelsVerificados.push([x - 1, y]);
                                }
                            }
                            else {
                                pintarPixel(posicaoPixel - 4, selectedColor.R, selectedColor.G, selectedColor.B, selectedColor.A);
                                if (ladoEsquerdo === true) {
                                    ladoEsquerdo = false;
                                }
                            }
                        }
                        if (x < projeto.resolucao.largura - 1) {
                            if (compararCorInicial(posicaoPixel + 4, R, G, B, A) === true) {
                                if (ladoDireito === false) {
                                    ladoDireito = true;
                                    pixelsVerificados.push([x + 1, y]);
                                }
                            }
                            else {
                                pintarPixel(posicaoPixel + 4, selectedColor.R, selectedColor.G, selectedColor.B, selectedColor.A);
                                if (ladoDireito === true) { ladoDireito = false; }
                            }
                        }
                        posicaoPixel = posicaoPixel + projeto.resolucao.largura * 4;
                    }
                    pintarPixel(posicaoPixel, selectedColor.R, selectedColor.G, selectedColor.B, selectedColor.A);
                }
                ctxPintar.putImageData(clearCanvas, 0, 0);
            }
            function compararCorInicial(pixelPos, clickR, clickG, clickB, clickA) {
                const r = camada.data[pixelPos], g = camada.data[pixelPos + 1], b = camada.data[pixelPos + 2],
                    a = camada.data[pixelPos + 3];

                if (clearCanvas.data[pixelPos + 3] === 0) {
                    if (clickR === selectedColor.R && clickG === selectedColor.G && clickB === selectedColor.B && clickA === 255) {
                        return false;
                    }
                    if (r === clickR && g === clickG && b === clickB && a === clickA) { return true; }
                    if (r === selectedColor.R && g === selectedColor.G && b === selectedColor.B && a === selectedColor.A) {
                        return false;
                    }
                } else { return false; }
            }
            function pintarPixel(pixelPos, R, G, B, A) {
                clearCanvas.data[pixelPos] = R;
                clearCanvas.data[pixelPos + 1] = G;
                clearCanvas.data[pixelPos + 2] = B;
                clearCanvas.data[pixelPos + 3] = A;

                camada.data[pixelPos] = R;
                camada.data[pixelPos + 1] = G;
                camada.data[pixelPos + 2] = B;
                camada.data[pixelPos + 3] = A;
            }
        }
    }
}