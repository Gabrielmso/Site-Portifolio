function drawingToolsObject() {
    return {
        arrayTools: [
            { tool: document.getElementById("pincel"), name: "brush" },
            { tool: document.getElementById("linha"), name: "line" },
            { tool: document.getElementById("retangulo"), name: "rectangle" },
            { tool: document.getElementById("elipse"), name: "ellipse" },
            { tool: document.getElementById("borracha"), name: "eraser" },
            { tool: document.getElementById("curva"), name: "curve" },
            { tool: document.getElementById("baldeDeTinta"), name: "paintBucket" },
            {
                tool: document.getElementById("contaGotas"), name: "eyeDropper",
                cursor: {
                    eyeDropper: document.getElementById("cursorComparaContaGotas"),
                    compareColors: document.getElementById("comparaCoresContaGotas")
                }
            }
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
            janelaPrincipal.addEventListener("mouseleave", () => {
                if (!this.painting) { this.cursorTool.removeCursor(); }
            });
            janelaPrincipal.addEventListener("mouseenter", () => this.changeCursorTool());
            this.cursorTool.cursor.addEventListener("contextmenu", (e) => e.preventDefault());
            contentTelas.addEventListener("mousedown", (e) => this.mouseDownEventDrawing(e));
            contentTelas.addEventListener("mousemove", () => this.txtPositionCursor.value = Math.ceil(this.mousePosition.x) + ", " + Math.ceil(this.mousePosition.y));
            contentTelas.addEventListener("mouseleave", () => { if (!this.cursorTool.show) { this.txtPositionCursor.value = "" } });
            this.cursorTool.cursor.addEventListener("mousedown", (e) => this.mouseDownEventDrawing(e));
            document.addEventListener("mousemove", throttle((e) => this.mouseMoveEventDrawing(e), 11));
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
                this.arrayTools[i].tool.addEventListener("mousedown", () => this.selectDrawingTool(i));
            }
        },
        getCursorPosition(e) {
            const mouse = getMousePosition(project.screen, e);
            this.mousePosition.x = +((project.properties.resolution.width / project.screen.offsetWidth) * mouse.x).toFixed(1);
            this.mousePosition.y = +((project.properties.resolution.height / project.screen.offsetHeight) * mouse.y).toFixed(1);
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
            if (!project.arrayLayers[project.selectedLayer].visible || hotKeys.spacePressed || this.painting) { return; }
            if (e.button === 0) { this.toolProperties.color = project.selectedColors.primary; }
            else if (e.button === 2) { this.toolProperties.color = project.selectedColors.secondary; }
            else { return; }
            this.painting = true;
            this.applyToolChanges();
            project.eventLayer.clearRect(0, 0, project.properties.resolution.width, project.properties.resolution.height);
            project.eventLayer.beginPath();
            project.eventLayer.lineJoin = project.eventLayer.lineCap = "round";
            project.arrayLayers[project.selectedLayer].ctx.globalCompositeOperation = "source-over";
            if (this.selectedTool < 7) { this[this.arrayTools[this.selectedTool].name](this.mousePosition); }
            else if (this.selectedTool === 7) {//Conta-gotas.
                this.eyeDropper(getMousePosition(janelaPrincipal, e), this.mousePosition, true);
            }
            if (this.cursorTool.show) { janelaPrincipal.style.cursor = "none"; }
        },
        mouseUpEventDrawing(e) {
            if (this.painting) {
                this.painting = false;
                if (this.selectedTool === 7) {//Conta-gotas.  
                    this.eyeDropper(getMousePosition(janelaPrincipal, e), this.mousePosition, false);
                    return;
                } else if (this.selectedTool === 5) {//Curva. 
                    this.clickToCurve = !this.clickToCurve;
                    if (this.strokeCoordinates.x.length === 2) { return; }
                }
                this.strokeCoordinates = { x: [], y: [] };
                if (this.selectedTool != 4) {
                    undoRedoChange.saveChanges();
                    project.drawInLayer();
                } else { project.drawInPreview(project.arrayLayers[project.selectedLayer]); }//Borracha
                janelaPrincipal.style.cursor = "";
            }
            this.toolSizeBar.clicked = this.toolOpacityBar.clicked = this.toolHardnessBar.clicked = false;
        },
        mouseMoveEventDrawing(e) {
            this.getCursorPosition(e);
            if (this.painting) {
                const lastIndex = this.strokeCoordinates.x.length - 1;
                if (this.strokeCoordinates.x[lastIndex] === this.mousePosition.x &&
                    this.strokeCoordinates.y[lastIndex] === this.mousePosition.y) { return; }
                project.eventLayer.clearRect(0, 0, project.properties.resolution.width, project.properties.resolution.height);
                if (this.selectedTool < 7) { this[this.arrayTools[this.selectedTool].name](this.mousePosition); }
                else if (this.selectedTool === 7) {//Conta-gotas.                   
                    this.eyeDropper(getMousePosition(janelaPrincipal, e), this.mousePosition, true)
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
            if (colorSelectionWindow.opened) { return; }
            this.previousTool = this.selectedTool;
            this.selectedTool = i;
            this.strokeCoordinates = { x: [], y: [] };
            this.painting = this.clickToCurve = false;
            this.arrayTools[this.previousTool].tool.classList.replace("bttFerramentasEscolhida", "bttFerramentas");
            this.arrayTools[this.selectedTool].tool.classList.replace("bttFerramentas", "bttFerramentasEscolhida");
            this.changeCursorTool();
            project.eventLayer.canvas.style.opacity = this.selectedTool === 4 ? "0" : "";
            project.eventLayer.clearRect(0, 0, project.properties.resolution.width, project.properties.resolution.height);
        },
        changeToolSize(e) {
            const mousePos = getMousePosition(this.toolSizeBar.bar, e);
            this.applyToolSize(Math.round(mousePos.x))
        },
        applyToolSize(pos) {
            const res = project.properties.resolution, maxSize = res.proportion > 1 ? res.width : res.height,
                width = this.toolSizeBar.bar.offsetWidth, left = pos <= 0 ? 0.5 : pos >= width ? width : pos,
                size = left <= 50 ? left : Math.floor(((maxSize / 100) * ((100 * (left - 50)) / (width - 50))) + 50);
            this.toolSizeBar.cursor.style.left = Math.floor(left - 7) + "px";
            this.toolSizeBar.txt.value = size + "px";
            this.toolProperties.size = size;
            this.changeCursorTool();
        },
        changeToolOpacity(e) {
            const mousePos = getMousePosition(this.toolOpacityBar.bar, e), width = this.toolOpacityBar.bar.offsetWidth;
            mousePos.x = mousePos.x <= 1 ? 1 : mousePos.x >= width ? width : mousePos.x;
            const percentage = Math.ceil((mousePos.x * 100) / width);
            this.toolOpacityBar.txt.value = percentage + "%";
            this.toolProperties.opacity = percentage / 100;
            this.toolOpacityBar.cursor.style.left = mousePos.x - 7 + "px";
        },
        changeToolHardness(e) {
            const mousePos = getMousePosition(this.toolHardnessBar.bar, e), width = this.toolHardnessBar.bar.offsetWidth;
            mousePos.x = mousePos.x <= 0 ? 0 : mousePos.x >= width ? width : mousePos.x;
            const percentage = Math.ceil((mousePos.x * 100) / width);
            this.toolHardnessBar.txt.value = percentage + "%";
            this.toolProperties.hardness = percentage / 100;
            this.toolHardnessBar.cursor.style.left = mousePos.x - 7 + "px";
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
            if (this.selectedTool === 7) {
                contentTelas.style.cursor = "url('colorPaint/imagens/cursor/cursorContaGotas.png') 0 20, pointer";
                this.cursorTool.removeCursor();
                return;
            } else if (this.selectedTool === 6) {
                contentTelas.style.cursor = "url('colorPaint/imagens/cursor/cursorBaldeDeTinta.png') 0 0, pointer";
                this.cursorTool.removeCursor();
                return;
            }
            const size = this.toolProperties.size * ((project.screen.offsetWidth) / project.properties.resolution.width);
            if (size < 15) {
                contentTelas.style.cursor = "url('colorPaint/imagens/cursor/crossHair.png') 12.5 12.5, pointer";
                this.cursorTool.removeCursor();
            } else {
                const previousPosition = { x: Math.round(this.cursorTool.cursor.offsetLeft + this.cursorTool.halfSize), y: Math.round(this.cursorTool.cursor.offsetTop + this.cursorTool.halfSize) };
                this.cursorTool.showCursor();
                this.cursorTool.halfSize = size / 2;
                this.cursorTool.cursor.style.width = size + "px";
                this.cursorTool.cursor.style.height = size + "px";
                this.cursorTool.changeCursorPosition(Math.round(previousPosition.x - this.cursorTool.halfSize), Math.round(previousPosition.y - this.cursorTool.halfSize));
                contentTelas.style.cursor = "none";
                if (size > 180) { this.cursorTool.cursor.style.backgroundImage = ""; }
                else { this.cursorTool.cursor.style.backgroundImage = "none"; }
            }
        },
        brush(mousePos) {
            this.strokeCoordinates.x.push(mousePos.x);
            this.strokeCoordinates.y.push(mousePos.y);
            let ponto1 = { x: this.strokeCoordinates.x[0], y: this.strokeCoordinates.y[0] },
                ponto2 = { x: this.strokeCoordinates.x[1], y: this.strokeCoordinates.y[1] };
            project.eventLayer.beginPath();
            project.eventLayer.moveTo(ponto1.x, ponto1.y);
            for (let i = 0; i < this.strokeCoordinates.x.length; i++) {
                let dis = { x: (ponto2.x - ponto1.x) ** 2, y: (ponto2.y - ponto1.y) ** 2 };
                if (((dis.x + dis.y) ** 0.5) > 3) {
                    const midPoint = midPointBtw(ponto1, ponto2);
                    project.eventLayer.quadraticCurveTo(ponto1.x, ponto1.y, midPoint.x, midPoint.y);
                } else { project.eventLayer.lineTo(ponto2.x, ponto2.y); }
                ponto1 = { x: this.strokeCoordinates.x[i], y: this.strokeCoordinates.y[i] };
                ponto2 = { x: this.strokeCoordinates.x[i + 1], y: this.strokeCoordinates.y[i + 1] };
            }
            project.eventLayer.lineTo(ponto1.x, ponto1.y);
            project.eventLayer.stroke();
            function midPointBtw(ponto1, ponto2) {
                return { x: ponto1.x + (ponto2.x - ponto1.x) / 2, y: ponto1.y + (ponto2.y - ponto1.y) / 2 };
            }
        },
        eraser(mousePos) {
            if (this.strokeCoordinates.x.length === 0) {
                undoRedoChange.saveChanges();
                project.eventLayer.strokeStyle = "rgba(0, 0, 0, " + this.toolProperties.opacity + ")";
                project.arrayLayers[project.selectedLayer].ctx.globalCompositeOperation = "destination-out";
            }
            const imageData = undoRedoChange.changes.undone[undoRedoChange.changes.undone.length - 1].change;
            this.brush(mousePos);
            project.arrayLayers[project.selectedLayer].ctx.putImageData(imageData, 0, 0);
            project.arrayLayers[project.selectedLayer].ctx.drawImage(project.eventLayer.canvas, 0, 0, project.properties.resolution.width, project.properties.resolution.height);
        },
        line(mousePos) {
            if (this.strokeCoordinates.x.length === 0) {
                this.strokeCoordinates.x[0] = mousePos.x;
                this.strokeCoordinates.y[0] = mousePos.y;
            } else {
                this.strokeCoordinates.x[1] = mousePos.x;
                this.strokeCoordinates.y[1] = mousePos.y;
            }
            const startPoint = { x: this.strokeCoordinates.x[0], y: this.strokeCoordinates.y[0] },
                endPoint = { x: this.strokeCoordinates.x[1], y: this.strokeCoordinates.y[1] };
            project.eventLayer.beginPath();
            project.eventLayer.moveTo(startPoint.x, startPoint.y);
            project.eventLayer.lineTo(endPoint.x, endPoint.y);
            project.eventLayer.stroke();
        },
        rectangle(mousePos) {
            if (this.strokeCoordinates.x.length === 0) {
                this.strokeCoordinates.x[0] = mousePos.x;
                this.strokeCoordinates.y[0] = mousePos.y;
            } else {
                this.strokeCoordinates.x[1] = mousePos.x;
                this.strokeCoordinates.y[1] = mousePos.y;
            }
            const startPoint = { x: this.strokeCoordinates.x[0], y: this.strokeCoordinates.y[0] },
                endPoint = { x: this.strokeCoordinates.x[1], y: this.strokeCoordinates.y[1] };
            project.eventLayer.beginPath();
            project.eventLayer.strokeRect(startPoint.x, startPoint.y, endPoint.x - startPoint.x, endPoint.y - startPoint.y);
        },
        ellipse(mousePos) {
            if (this.strokeCoordinates.x.length === 0) {
                this.strokeCoordinates.x[0] = mousePos.x;
                this.strokeCoordinates.y[0] = mousePos.y;
            } else {
                this.strokeCoordinates.x[1] = mousePos.x;
                this.strokeCoordinates.y[1] = mousePos.y;
            }
            const startPoint = { x: this.strokeCoordinates.x[0], y: this.strokeCoordinates.y[0] },
                endPoint = { x: this.strokeCoordinates.x[1], y: this.strokeCoordinates.y[1] };
            const raioX = (endPoint.x - startPoint.x) / 2, raioY = (endPoint.y - startPoint.y) / 2;
            const centroEixoX = startPoint.x + raioX, centroEixoY = startPoint.y + raioY;
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
        curve(mousePos) {
            if (!this.clickToCurve) {
                if (this.strokeCoordinates.x.length === 0) {
                    this.strokeCoordinates.x[0] = mousePos.x;
                    this.strokeCoordinates.y[0] = mousePos.y;
                } else {
                    this.strokeCoordinates.x[1] = mousePos.x;
                    this.strokeCoordinates.y[1] = mousePos.y;
                }
            }
            const startPoint = { x: this.strokeCoordinates.x[0], y: this.strokeCoordinates.y[0] },
                endPoint = { x: this.strokeCoordinates.x[1], y: this.strokeCoordinates.y[1] };
            project.eventLayer.beginPath();
            project.eventLayer.moveTo(startPoint.x, startPoint.y);
            if (this.clickToCurve) {
                this.strokeCoordinates.x[2] = mousePos.x;
                this.strokeCoordinates.y[2] = mousePos.y;
                const curvePoint = { x: this.strokeCoordinates.x[2], y: this.strokeCoordinates.y[2] };
                project.eventLayer.quadraticCurveTo(curvePoint.x, curvePoint.y, endPoint.x, endPoint.y);
            } else { project.eventLayer.lineTo(endPoint.x, endPoint.y); }
            project.eventLayer.stroke();
        },
        eyeDropper(cursorPos, mousePos, move) {
            const cursorEyeDropper = this.arrayTools[this.selectedTool].cursor.eyeDropper,
                compareColors = this.arrayTools[this.selectedTool].cursor.compareColors;
            if (cursorEyeDropper.style.display === "none") {
                cursorEyeDropper.style.display = "block";
                const corAtual = "25px solid rgb(" + project.selectedColors.primary.r + ", " + project.selectedColors.primary.g + ", " + project.selectedColors.primary.b + ")";
                compareColors.style.borderBottom = compareColors.style.borderLeft = corAtual;
                project.createDrawComplete();
                project.screen.style.imageRendering = "pixelated";
            }
            cursorEyeDropper.style.left = cursorPos.x - (cursorEyeDropper.offsetWidth / 2) + "px";
            cursorEyeDropper.style.top = cursorPos.y - (cursorEyeDropper.offsetHeight / 2) + "px";
            const pixel = project.drawComplete.getImageData(mousePos.x, mousePos.y, 1, 1).data;
            if (move) {
                let novaCor = "25px solid rgb(" + pixel[0] + ", " + pixel[1] + ", " + pixel[2] + ")";
                if (pixel[3] === 0) { novaCor = "25px solid rgba(0, 0, 0, 0)"; }
                compareColors.style.borderTop = compareColors.style.borderRight = novaCor;
            } else {
                cursorEyeDropper.style.display = "none";
                project.screen.style.imageRendering = "auto";
                if (pixel[3] === 0) {
                    notification.open({
                        title: "Atenção!", text: "Nenhuma cor foi selecionada."
                    }, { name: "notify", time: 1500 }, null);
                    return;
                }
                if (colorSelectionWindow.opened) { colorSelectionWindow.findColor({ r: pixel[0], g: pixel[1], b: pixel[2] }); }
                else {
                    project.selectedColors.primary = { r: pixel[0], g: pixel[1], b: pixel[2] };
                    const novaCor = "rgb(" + pixel[0] + ", " + pixel[1] + ", " + pixel[2] + ")";
                    txtCorEscolhida.value = corPrincipal.style.backgroundColor = novaCor;
                }
            }
        },
        paintBucket(mousePos) {
            if (this.mousePosition.x < 0 || this.mousePosition.x > project.properties.resolution.width ||
                this.mousePosition.y < 0 || this.mousePosition.y > project.properties.resolution.height) {
                this.painting = false;
                return;
            }
            this.strokeCoordinates.x[0] = Math.floor(mousePos.x);
            this.strokeCoordinates.y[0] = Math.floor(mousePos.y);
            const context = project.arrayLayers[project.selectedLayer].ctx,
                camada = context.getImageData(0, 0, project.properties.resolution.width, project.properties.resolution.height),
                clearCanvas = context.createImageData(project.properties.resolution.width, project.properties.resolution.height),
                selectedColor = {
                    r: this.toolProperties.color.r, g: this.toolProperties.color.g,
                    b: this.toolProperties.color.b, a: Math.round(this.toolProperties.opacity * 255)
                };
            const pintar = (posX, posY) => {
                const pixelPos = (posY * project.properties.resolution.width + posX) * 4,
                    cor = {
                        r: camada.data[pixelPos], g: camada.data[pixelPos + 1],
                        b: camada.data[pixelPos + 2], a: camada.data[pixelPos + 3]
                    }
                if (cor.r === selectedColor.r && cor.g === selectedColor.g &&
                    cor.b === selectedColor.b && cor.a === 255) {
                    this.painting = false;
                    return;
                }
                preencher(posX, posY, cor);
            }
            function preencher(posClickX, posClickY, cor) {
                let pixelsVerificados = [[posClickX, posClickY]];
                while (pixelsVerificados.length > 0) {
                    const novaPosicao = pixelsVerificados.pop();
                    let x = novaPosicao[0], y = novaPosicao[1];
                    let posicaoPixel = (y * project.properties.resolution.width + x) * 4;
                    while (y >= 0 && compararCorInicial(posicaoPixel, cor)) {
                        y -= 1;
                        posicaoPixel -= project.properties.resolution.width * 4;
                    }
                    pintarPixel(posicaoPixel, selectedColor);
                    posicaoPixel += project.properties.resolution.width * 4;
                    y += 1;
                    let ladoEsquerdo = false, ladoDireito = false;
                    while (y < project.properties.resolution.height - 1 && compararCorInicial(posicaoPixel, cor)) {
                        pintarPixel(posicaoPixel, selectedColor);
                        y += 1;
                        if (x > 0) {
                            if (compararCorInicial(posicaoPixel - 4, cor) === true) {
                                if (!ladoEsquerdo) {
                                    ladoEsquerdo = true;
                                    pixelsVerificados.push([x - 1, y]);
                                }
                            } else {
                                pintarPixel(posicaoPixel - 4, selectedColor);
                                if (ladoEsquerdo) { ladoEsquerdo = false; }
                            }
                        }
                        if (x < project.properties.resolution.width - 1) {
                            if (compararCorInicial(posicaoPixel + 4, cor) === true) {
                                if (!ladoDireito) {
                                    ladoDireito = true;
                                    pixelsVerificados.push([x + 1, y]);
                                }
                            } else {
                                pintarPixel(posicaoPixel + 4, selectedColor);
                                if (ladoDireito) { ladoDireito = false; }
                            }
                        }
                        posicaoPixel += project.properties.resolution.width * 4;
                    }
                    pintarPixel(posicaoPixel, selectedColor);
                }
                project.eventLayer.putImageData(clearCanvas, 0, 0);
            }
            function compararCorInicial(pixelPos, cor) {
                const r = camada.data[pixelPos], g = camada.data[pixelPos + 1], b = camada.data[pixelPos + 2],
                    a = camada.data[pixelPos + 3];
                if (clearCanvas.data[pixelPos + 3] === 0) {
                    if (cor.r === selectedColor.r && cor.g === selectedColor.g &&
                        cor.b === selectedColor.b && cor.a === 255) {
                        return false;
                    }
                    if (r === cor.r && g === cor.g && b === cor.b && a === cor.a) { return true; }
                    if (r === selectedColor.r && g === selectedColor.g && b === selectedColor.b && a === selectedColor.a) {
                        return false;
                    }
                } else { return false; }
            }
            function pintarPixel(pixelPos, cor) {
                camada.data[pixelPos] = clearCanvas.data[pixelPos] = cor.r;
                camada.data[pixelPos + 1] = clearCanvas.data[pixelPos + 1] = cor.g;
                camada.data[pixelPos + 2] = clearCanvas.data[pixelPos + 2] = cor.b;
                camada.data[pixelPos + 3] = clearCanvas.data[pixelPos + 3] = cor.a;
            }
            pintar(this.strokeCoordinates.x[0], this.strokeCoordinates.y[0]);
        }
    }
}