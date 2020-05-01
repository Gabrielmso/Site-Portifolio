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
            },
            wheel(e) {
                const velocity = 7;
                if (!hotKeys.shiftPressed) {
                    if (e.deltaY < 0) { contentTelas.scrollTop -= contentTelas.offsetHeight / velocity; }
                    else { contentTelas.scrollTop += contentTelas.offsetHeight / velocity; }
                } else {
                    if (e.deltaY < 0) { contentTelas.scrollLeft -= contentTelas.offsetWidth / velocity; }
                    else { contentTelas.scrollLeft += contentTelas.offsetWidth / velocity; }
                }
            }
        },
        selectedTool: 0,
        previousTool: null,
        clickToCurve: false,
        txtPositionCursor: document.getElementById("txtPosicaoCursor"),
        mousePosition: { x: 0, y: 0 },//Armazena as coordenadas atuais do mouse em relação a resolução do projeto.
        strokeCoordinates: { x: [], y: [] },//Armazena as coordenadas do uso das ferramentas.
        painting: false,//Saber se o mouse está pressionado na "contentTelas".        
        toolProperties: {
            elements: [{ property: document.getElementById("propriedadeTamanho"), contentBar: document.getElementById("contentBarraTamanho") },
            { property: document.getElementById("propriedadeOpacidade"), contentBar: document.getElementById("contentBarraOpacidade") },
            { property: document.getElementById("propriedadeDureza"), contentBar: document.getElementById("contentBarraDureza") }],
            size: 5, opacity: 1, hardness: 1, color: { r: 0, g: 0, b: 0 }
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
        addEventsToElements() {
            contentTelas.addEventListener("contextmenu", (e) => e.preventDefault());
            this.cursorTool.cursor.addEventListener("contextmenu", (e) => e.preventDefault());
            contentTelas.addEventListener("mousedown", (e) => this.mouseDownEventDrawing(e));
            contentTelas.addEventListener("mousemove", () => this.txtPositionCursor.value = Math.ceil(this.mousePosition.x) + ", " + Math.ceil(this.mousePosition.y));
            contentTelas.addEventListener("mouseleave", () => { if (!this.cursorTool.show) { this.txtPositionCursor.value = "" } });
            this.cursorTool.cursor.addEventListener("mousedown", (e) => this.mouseDownEventDrawing(e));
            document.addEventListener("mousemove", throttle((e) => this.mouseMoveEventDrawing(e), 8));
            document.addEventListener("mouseup", (e) => this.mouseUpEventDrawing(e));
            this.cursorTool.cursor.addEventListener("wheel", (e) => this.cursorTool.wheel(e));
            this.toolOpacityBar.bar.addEventListener("mousedown", (e) => this.mouseDownToolOpacityBar(e));
            this.toolSizeBar.bar.addEventListener("mousedown", (e) => this.mouseDownToolSizeBar(e));
            this.toolHardnessBar.bar.addEventListener("mousedown", (e) => this.mouseDownToolHardnessBar(e));
            for (let i = 0; i < this.toolProperties.elements.length; i++) {
                let el = this.toolProperties.elements[i];
                el.property.addEventListener("mouseenter", () => {
                    if (!this.painting) { el.contentBar.style.height = "36px"; }
                });
                el.property.addEventListener("mouseleave", () => el.contentBar.style.height = "0px");
            }
            for (let i = 0; i < this.arrayTools.length; i++) {
                this.arrayTools[i].tool.addEventListener("click", () => {
                    if (!janelaSelecionarCorVisivel) { this.selectDrawingTool(i); }
                });
            }
        },
        getCursorPosition(e) {
            const mouse = pegarPosicaoMouse(telasCanvas, e);
            this.mousePosition.x = parseFloat(((project.properties.resolution.width / telasCanvas.offsetWidth) * mouse.x).toFixed(1));
            this.mousePosition.y = parseFloat(((project.properties.resolution.height / telasCanvas.offsetHeight) * mouse.y).toFixed(1));
            if (this.cursorTool.show) {
                const posX = e.pageX - this.cursorTool.halfSize + document.body.scrollLeft,
                    posY = e.pageY - this.cursorTool.halfSize + document.body.scrollTop;
                this.cursorTool.changeCursorPosition(posX, posY);
                this.txtPositionCursor.value = Math.ceil(this.mousePosition.x) + ", " + Math.ceil(this.mousePosition.y);
                if (!this.painting) {
                    const contentPosition = contentTelas.getBoundingClientRect();
                    if (e.pageX < contentPosition.left || e.pageX > contentPosition.left + contentPosition.width ||
                        e.pageY < contentPosition.top || e.pageY > contentPosition.top + contentPosition.height) {
                        this.cursorTool.cursor.style.display = "none";
                        this.txtPositionCursor.value = "";
                    } else if (!hotKeys.spacePressed) { this.cursorTool.cursor.style.display = "block"; }
                }
            }
        },
        mouseDownEventDrawing(e) {
            if (!project.created || hotKeys.spacePressed || this.painting) { return; }
            if (project.arrayLayers[project.selectedLayer].visible) {
                if (e.button === 0) { this.toolProperties.color = project.selectedColors.primary; }
                else if (e.button === 2) { this.toolProperties.color = project.selectedColors.secondary; }
                else { return; }
                this.painting = true;
                this.applyToolChanges();
                project.eventLayer.beginPath();
                project.eventLayer.lineJoin = project.eventLayer.lineCap = "round";
                project.arrayLayers[project.selectedLayer].ctx.globalCompositeOperation = "source-over";
                if (this.selectedTool < 4) {
                    this.strokeCoordinates.x[0] = this.mousePosition.x;
                    this.strokeCoordinates.y[0] = this.mousePosition.y;
                    this[this.arrayTools[this.selectedTool].name](this.mousePosition.x, this.mousePosition.y);
                } else if (this.selectedTool === 4) {//Borracha. 
                    this.strokeCoordinates.x[0] = this.mousePosition.x;
                    this.strokeCoordinates.y[0] = this.mousePosition.y;
                    project.arrayLayers[project.selectedLayer].ctx.globalCompositeOperation = "destination-out";
                    project.eventLayer.strokeStyle = "rgba(255, 0, 0, " + this.toolProperties.opacity + ")";
                    this.brush(this.mousePosition.x, this.mousePosition.y);
                } else if (this.selectedTool === 5) {//Curva;
                    if (this.clickToCurve === false) {
                        this.strokeCoordinates.x[0] = this.mousePosition.x;
                        this.strokeCoordinates.y[0] = this.mousePosition.y;
                    }
                    this.curve(this.mousePosition.x, this.mousePosition.y, this.clickToCurve);
                } else if (this.selectedTool === 6) {//Conta-gotas.
                    this.arrayTools[this.selectedTool].cursor.eyeDropper.style.display = "block";
                    const corAtual = "25px solid rgb(" + project.selectedColors.primary.r + ", " + project.selectedColors.primary.g + ", " + project.selectedColors.primary.b + ")";
                    this.arrayTools[this.selectedTool].cursor.compareColors.style.borderLeft = corAtual;
                    this.arrayTools[this.selectedTool].cursor.compareColors.style.borderBottom = corAtual;
                    const mousePos = pegarPosicaoMouse(janelaPrincipal, e);
                    this.eyeDropper(mousePos.x, mousePos.y, this.mousePosition.x, this.mousePosition.y, true);
                } else if (this.selectedTool === 7) {//Balde de tinta.
                    if (this.mousePosition.x >= 0 && this.mousePosition.x <= project.properties.resolution.width && this.mousePosition.y >= 0 && this.mousePosition.y <= project.properties.resolution.height) {
                        const cor = { R: this.toolProperties.color.r, G: this.toolProperties.color.g, B: this.toolProperties.color.b, A: Math.round(this.toolProperties.opacity * 255) };
                        this.paintBucket(this.mousePosition.x, this.mousePosition.y, project.arrayLayers[project.selectedLayer].ctx, cor);
                    }
                }
                if (this.cursorTool.show) { janelaPrincipal.style.cursor = "none"; }
            }
        },
        mouseUpEventDrawing(e) {
            if (this.painting) {
                this.painting = false;
                if (this.selectedTool === 6) {//Conta-gotas.  
                    const mousePos = pegarPosicaoMouse(janelaPrincipal, e);
                    this.eyeDropper(mousePos.x, mousePos.y, this.mousePosition.x, this.mousePosition.y, false)
                    this.arrayTools[this.selectedTool].cursor.eyeDropper.style.display = "none";
                    return;
                } else if (this.selectedTool === 5) {//Curva. 
                    this.clickToCurve = !(this.clickToCurve);
                    if (this.strokeCoordinates.x.length === 2) { return; }
                }
                this.strokeCoordinates.x = [];
                this.strokeCoordinates.y = [];
                project.drawInLayer();
                janelaPrincipal.style.cursor = "";
            }
            this.toolOpacityBar.clicked = false;
            this.toolSizeBar.clicked = false;
            this.toolHardnessBar.clicked = false;
        },
        mouseMoveEventDrawing(e) {
            this.getCursorPosition(e);
            if (this.painting) {
                const lastIndex = this.strokeCoordinates.x.length - 1;
                if (this.selectedTool < 4) {
                    if (this.strokeCoordinates.x[lastIndex] === this.mousePosition.x &&
                        this.strokeCoordinates.y[lastIndex] === this.mousePosition.y) { return; }
                    this[this.arrayTools[this.selectedTool].name](this.mousePosition.x, this.mousePosition.y);
                } else if (this.selectedTool === 4) {//Borracha. 
                    if (this.strokeCoordinates.x[lastIndex] === this.mousePosition.x &&
                        this.strokeCoordinates.y[lastIndex] === this.mousePosition.y) { return; }
                    this.brush(this.mousePosition.x, this.mousePosition.y);
                } else if (this.selectedTool === 5) {//Curva;
                    this.curve(this.mousePosition.x, this.mousePosition.y, this.clickToCurve);
                } else if (this.selectedTool === 6) {//Conta-gotas.
                    const mousePos = pegarPosicaoMouse(janelaPrincipal, e);
                    this.eyeDropper(mousePos.x, mousePos.y, this.mousePosition.x, this.mousePosition.y, true)
                }
            } else if (this.toolSizeBar.clicked) { this.changeToolSize(e); }
            else if (this.toolOpacityBar.clicked) { this.changeToolOpacity(e); }
            else if (this.toolHardnessBar.clicked) { this.changeToolHardness(e); }
        },
        mouseDownToolSizeBar(e) {
            if (this.clickToCurve) { return; }
            this.toolSizeBar.clicked = true;
            this.changeToolSize(e);
        },
        mouseDownToolOpacityBar(e) {
            if (this.clickToCurve) { return; }
            this.toolOpacityBar.clicked = true;
            this.changeToolOpacity(e);
        },
        mouseDownToolHardnessBar(e) {
            if (this.clickToCurve) { return; }
            this.toolHardnessBar.clicked = true;
            this.changeToolHardness(e);
        },
        selectDrawingTool(i) {
            project.createDrawComplete();
            this.selectedTool = this.arrayTools[i].id;
            this.arrayTools[i].tool.classList.replace("bttFerramentas", "bttFerramentasEscolhida");
            for (let e = 0; e < this.arrayTools.length; e++) {
                if (e != i) { this.arrayTools[e].tool.classList.replace("bttFerramentasEscolhida", "bttFerramentas"); }
            }
            if (this.selectedTool === 6) { document.getElementById("propriedadesFerramentas").style.display = "none"; }
            else { document.getElementById("propriedadesFerramentas").style.display = "block"; }
            this.strokeCoordinates.x = [];
            this.strokeCoordinates.y = [];
            this.clickToCurve = false;
            this.changeCursorTool();
            project.eventLayer.clearRect(0, 0, project.properties.resolution.width, project.properties.resolution.height);
        },
        changeToolSize(e) {
            let mousePos = pegarPosicaoMouse(this.toolSizeBar.bar, e), width = this.toolSizeBar.bar.offsetWidth;
            mousePos.x = Math.round(mousePos.x);
            if (mousePos.x <= 0) {
                mousePos.x = 0.5;
                this.toolSizeBar.cursor.style.left = "-7px";
            } else if (mousePos.x >= width) {
                mousePos.x = width;
                this.toolSizeBar.cursor.style.left = width - 7 + "px";;
            } else { this.toolSizeBar.cursor.style.left = mousePos.x - 7 + "px"; }
            this.toolSizeBar.txt.value = mousePos.x + "px";
            this.toolProperties.size = mousePos.x;
            this.changeCursorTool();
        },
        changeToolOpacity(e) {
            const mousePos = pegarPosicaoMouse(this.toolOpacityBar.bar, e), width = this.toolOpacityBar.bar.offsetWidth;
            let percentage = Math.round((mousePos.x * 100) / width);
            if (mousePos.x <= 1) {
                percentage = 1;
                this.toolOpacityBar.cursor.style.left = "-7px";
            } else if (mousePos.x >= width) {
                percentage = 100;
                this.toolOpacityBar.cursor.style.left = width - 7 + "px";
            } else { this.toolOpacityBar.cursor.style.left = mousePos.x - 7 + "px"; }
            this.toolOpacityBar.txt.value = percentage + "%";
            this.toolProperties.opacity = percentage / 100;
        },
        changeToolHardness(e) {
            const mousePos = pegarPosicaoMouse(this.toolHardnessBar.bar, e), width = this.toolHardnessBar.bar.offsetWidth;
            let percentage = Math.round((mousePos.x * 100) / width);
            if (mousePos.x < 1) {
                percentage = 0;
                this.toolHardnessBar.cursor.style.left = "-7px";
            } else if (mousePos.x >= width) {
                percentage = 100;
                this.toolHardnessBar.cursor.style.left = width - 7 + "px";
            } else { this.toolHardnessBar.cursor.style.left = mousePos.x - 7 + "px"; }
            this.toolHardnessBar.txt.value = percentage + "%";
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
            project.eventLayer.filter = "blur(" + dureza + "px)";
            project.eventLayer.lineWidth = (this.toolProperties.size - dureza);
            project.eventLayer.strokeStyle = "rgba(" + color.r + ", " + color.g + ", " + color.b + ", " + this.toolProperties.opacity + ")";
        },
        changeCursorTool() {
            if (this.selectedTool === 6) {
                this.cursorTool.removeCursor();
                contentTelas.style.cursor = "url('colorPaint/imagens/cursor/cursorContaGotas.png') 0 20, pointer";
                return;
            } else if (this.selectedTool === 7) {
                this.cursorTool.removeCursor();
                contentTelas.style.cursor = "url('colorPaint/imagens/cursor/cursorBaldeDeTinta.png') 0 0, pointer";
                return;
            }
            const tamanho = this.toolProperties.size * ((telasCanvas.offsetWidth) / project.properties.resolution.width);
            if (tamanho < 15) {
                this.cursorTool.removeCursor();
                contentTelas.style.cursor = "url('colorPaint/imagens/cursor/crossHair.png') 12.5 12.5, pointer";
            } else {
                const previousPosition = { x: Math.round(this.cursorTool.cursor.offsetLeft + this.cursorTool.halfSize), y: Math.round(this.cursorTool.cursor.offsetTop + this.cursorTool.halfSize) };
                this.cursorTool.showCursor();
                this.cursorTool.halfSize = tamanho / 2;
                this.cursorTool.cursor.style.width = tamanho + "px";
                this.cursorTool.cursor.style.height = tamanho + "px";
                this.cursorTool.changeCursorPosition(Math.round(previousPosition.x - this.cursorTool.halfSize), Math.round(previousPosition.y - this.cursorTool.halfSize));
                contentTelas.style.cursor = "none";
                if (tamanho > 249) { this.cursorTool.cursor.style.backgroundImage = ""; }
                else { this.cursorTool.cursor.style.backgroundImage = "none"; }
            }
        },
        brush(mouseX, mouseY) {
            this.strokeCoordinates.x.push(mouseX);
            this.strokeCoordinates.y.push(mouseY);
            project.eventLayer.clearRect(0, 0, project.properties.resolution.width, project.properties.resolution.height);
            let ponto1 = { x: this.strokeCoordinates.x[0], y: this.strokeCoordinates.y[0] };
            let ponto2 = { x: this.strokeCoordinates.x[1], y: this.strokeCoordinates.y[1] };
            project.eventLayer.beginPath();
            project.eventLayer.moveTo(ponto1.x, ponto1.y);
            for (let i = 0; i < this.strokeCoordinates.x.length; i++) {
                const midPoint = midPointBtw(ponto1, ponto2);
                project.eventLayer.quadraticCurveTo(ponto1.x, ponto1.y, midPoint.x, midPoint.y);
                ponto1 = { x: this.strokeCoordinates.x[i], y: this.strokeCoordinates.y[i] };
                ponto2 = { x: this.strokeCoordinates.x[i + 1], y: this.strokeCoordinates.y[i + 1] };
            }
            project.eventLayer.lineTo(ponto1.x, ponto1.y);
            project.eventLayer.stroke();
            function midPointBtw(ponto1, ponto2) {
                return { x: ponto1.x + (ponto2.x - ponto1.x) / 2, y: ponto1.y + (ponto2.y - ponto1.y) / 2 };
            }
        },
        line(mouseX, mouseY) {
            this.strokeCoordinates.x[1] = mouseX;
            this.strokeCoordinates.y[1] = mouseY;
            project.eventLayer.clearRect(0, 0, project.properties.resolution.width, project.properties.resolution.height);
            const pontoInicial = { x: this.strokeCoordinates.x[0], y: this.strokeCoordinates.y[0] },
                pontoFinal = { x: this.strokeCoordinates.x[1], y: this.strokeCoordinates.y[1] };
            project.eventLayer.beginPath();
            project.eventLayer.moveTo(pontoInicial.x, pontoInicial.y);
            project.eventLayer.lineTo(pontoFinal.x, pontoFinal.y);
            project.eventLayer.stroke();
        },
        rectangle(mouseX, mouseY) {
            this.strokeCoordinates.x[1] = mouseX;
            this.strokeCoordinates.y[1] = mouseY;
            project.eventLayer.clearRect(0, 0, project.properties.resolution.width, project.properties.resolution.height);
            const pontoInicial = { x: this.strokeCoordinates.x[0], y: this.strokeCoordinates.y[0] },
                pontoFinal = { x: this.strokeCoordinates.x[1], y: this.strokeCoordinates.y[1] };
            project.eventLayer.beginPath();
            project.eventLayer.strokeRect(pontoInicial.x, pontoInicial.y, pontoFinal.x - pontoInicial.x, pontoFinal.y - pontoInicial.y);
        },
        ellipse(mouseX, mouseY) {
            this.strokeCoordinates.x[1] = mouseX;
            this.strokeCoordinates.y[1] = mouseY;
            project.eventLayer.clearRect(0, 0, project.properties.resolution.width, project.properties.resolution.height);
            const pontoInicial = { x: this.strokeCoordinates.x[0], y: this.strokeCoordinates.y[0] },
                pontoFinal = { x: this.strokeCoordinates.x[1], y: this.strokeCoordinates.y[1] };
            const raioX = (pontoFinal.x - pontoInicial.x) / 2, raioY = (pontoFinal.y - pontoInicial.y) / 2;
            const centroEixoX = pontoInicial.x + raioX, centroEixoY = pontoInicial.y + raioY;
            const passoAngulo = 0.005;
            let angulo = 0;
            const voltaCompleta = Math.PI * 2 + passoAngulo;
            project.eventLayer.beginPath();
            project.eventLayer.moveTo(centroEixoX + raioX * Math.cos(angulo), centroEixoY + raioY * Math.sin(angulo));
            for (; angulo < voltaCompleta; angulo += passoAngulo) {
                project.eventLayer.lineTo(centroEixoX + raioX * Math.cos(angulo), centroEixoY + raioY * Math.sin(angulo));
            }
            project.eventLayer.stroke();
        },
        curve(mouseX, mouseY, curvar) {
            if (curvar === false) {
                this.strokeCoordinates.x[1] = mouseX;
                this.strokeCoordinates.y[1] = mouseY;
            }
            project.eventLayer.clearRect(0, 0, project.properties.resolution.width, project.properties.resolution.height);
            const pontoInicial = { x: this.strokeCoordinates.x[0], y: this.strokeCoordinates.y[0] },
                pontoFinal = { x: this.strokeCoordinates.x[1], y: this.strokeCoordinates.y[1] };
            project.eventLayer.beginPath();
            project.eventLayer.moveTo(pontoInicial.x, pontoInicial.y);
            if (curvar === true) {
                this.strokeCoordinates.x[2] = mouseX;
                this.strokeCoordinates.y[2] = mouseY;
                const pontoControle = { x: this.strokeCoordinates.x[2], y: this.strokeCoordinates.y[2] };
                project.eventLayer.quadraticCurveTo(pontoControle.x, pontoControle.y, pontoFinal.x, pontoFinal.y);
            } else { project.eventLayer.lineTo(pontoFinal.x, pontoFinal.y); }
            project.eventLayer.stroke();
        },
        eyeDropper(mouseX, mouseY, posTelaX, posTelaY, mouseMovendo) {
            const cursorEyeDropper = this.arrayTools[this.selectedTool].cursor.eyeDropper,
                X = mouseX - (cursorEyeDropper.offsetWidth / 2), Y = mouseY - (cursorEyeDropper.offsetHeight / 2);
            cursorEyeDropper.style.left = X + "px";
            cursorEyeDropper.style.top = Y + "px";
            const pixel = project.drawComplete.getImageData(posTelaX, posTelaY, 1, 1).data;
            if (mouseMovendo) {
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
            } else {
                if (pixel[3] === 0) {
                    alert("Nenhuma cor selecionada");
                    return;
                }
                if (janelaSelecionarCorVisivel) { janelaSeleciona.procurarCor({ r: pixel[0], g: pixel[1], b: pixel[2] }); }
                else {
                    project.selectedColors.primary = { r: pixel[0], g: pixel[1], b: pixel[2] };
                    this.toolProperties.color = project.selectedColors.primary;
                    const novaCor = "rgb(" + project.selectedColors.primary.r + ", " + project.selectedColors.primary.g + ", " + project.selectedColors.primary.b + ")";
                    corPrincipal.style.backgroundColor = novaCor;
                    txtCorEscolhida.value = novaCor;
                }
            }
        },
        paintBucket(mouseX, mouseY, context, selectedColor) {
            this.strokeCoordinates.x[0] = Math.round(mouseX);
            this.strokeCoordinates.y[0] = Math.round(mouseY);
            const camada = context.getImageData(0, 0, project.properties.resolution.width, project.properties.resolution.height),
                clearCanvas = context.createImageData(project.properties.resolution.width, project.properties.resolution.height);
            pintar(this.strokeCoordinates.x[0], this.strokeCoordinates.y[0]);
            function pintar(posX, posY) {
                const pixelPos = (posY * project.properties.resolution.width + posX) * 4, R = camada.data[pixelPos],
                    G = camada.data[pixelPos + 1], B = camada.data[pixelPos + 2], A = camada.data[pixelPos + 3];
                if (R === selectedColor.R && G === selectedColor.G && B === selectedColor.B && A === 255) { return; }
                preencher(posX, posY, R, G, B, A);
            }
            function preencher(posClickX, posClickY, R, G, B, A) {
                let pixelsVerificados = [[posClickX, posClickY]];
                while (pixelsVerificados.length > 0) {
                    const novaPosicao = pixelsVerificados.pop();
                    let x = novaPosicao[0], y = novaPosicao[1];
                    let posicaoPixel = (y * project.properties.resolution.width + x) * 4;
                    while (y >= 0 && compararCorInicial(posicaoPixel, R, G, B, A)) {
                        y = y - 1;
                        posicaoPixel = posicaoPixel - project.properties.resolution.width * 4;
                    }
                    pintarPixel(posicaoPixel, selectedColor.R, selectedColor.G, selectedColor.B, selectedColor.A);
                    posicaoPixel = posicaoPixel + project.properties.resolution.width * 4;
                    y = y + 1;
                    let ladoEsquerdo = false, ladoDireito = false;
                    while (y < project.properties.resolution.height - 1 && compararCorInicial(posicaoPixel, R, G, B, A)) {
                        pintarPixel(posicaoPixel, selectedColor.R, selectedColor.G, selectedColor.B, selectedColor.A);
                        y = y + 1;
                        if (x > 0) {
                            if (compararCorInicial(posicaoPixel - 4, R, G, B, A) === true) {
                                if (!ladoEsquerdo) {
                                    ladoEsquerdo = true;
                                    pixelsVerificados.push([x - 1, y]);
                                }
                            } else {
                                pintarPixel(posicaoPixel - 4, selectedColor.R, selectedColor.G, selectedColor.B, selectedColor.A);
                                if (ladoEsquerdo) { ladoEsquerdo = false; }
                            }
                        }
                        if (x < project.properties.resolution.width - 1) {
                            if (compararCorInicial(posicaoPixel + 4, R, G, B, A) === true) {
                                if (!ladoDireito) {
                                    ladoDireito = true;
                                    pixelsVerificados.push([x + 1, y]);
                                }
                            } else {
                                pintarPixel(posicaoPixel + 4, selectedColor.R, selectedColor.G, selectedColor.B, selectedColor.A);
                                if (ladoDireito) { ladoDireito = false; }
                            }
                        }
                        posicaoPixel = posicaoPixel + project.properties.resolution.width * 4;
                    }
                    pintarPixel(posicaoPixel, selectedColor.R, selectedColor.G, selectedColor.B, selectedColor.A);
                }
                project.eventLayer.putImageData(clearCanvas, 0, 0);
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