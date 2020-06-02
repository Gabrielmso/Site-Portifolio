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
            { tool: document.getElementById("desfoque"), name: "blur" },
            { tool: document.getElementById("borrar"), name: "smudge" },
            { tool: document.getElementById("contaGotas"), name: "eyeDropper", }
        ],
        cursorTool: {
            cursor: document.getElementById("cursorFerramenta"),
            show: true,
            visible: false,
            halfSize: 20,
            eyeDropper: {
                cursor: document.getElementById("cursorComparaContaGotas"), compareColors: document.getElementById("comparaCoresContaGotas"),
                halfSize: 125, position: null
            },
            changeCursorPosition(left, top) {
                this.cursor.style.top = top - this.halfSize + "px";
                this.cursor.style.left = left - this.halfSize + "px";
            },
            invisibleCursor() {
                this.visible = false;
                this.cursor.style.display = "none";
            },
            visibleCursor() {
                this.visible = true;
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
        currentLayer: null,
        selectedTool: 0,
        previousTool: null,
        clickToCurve: false,
        txtPositionCursor: document.getElementById("txtPosicaoCursor"),
        mousePosition: { x: 0, y: 0 },
        strokeCoordinates: { x: [], y: [] },
        painting: false,
        toolProperties: {
            elements: [{ property: document.getElementById("propriedadeTamanho"), contentBar: document.getElementById("contentBarraTamanho") },
            { property: document.getElementById("propriedadeOpacidade"), contentBar: document.getElementById("contentBarraOpacidade") },
            { property: document.getElementById("propriedadeDureza"), contentBar: document.getElementById("contentBarraDureza") }],
            size: 5, opacity: 1, hardness: 1, color: { r: 0, g: 0, b: 0 }, brushCanvas: null, brushForm: null, halfSize: null,
            filter: null,
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
                if (!this.painting) { this.cursorTool.invisibleCursor(); }
            });
            janelaPrincipal.addEventListener("mouseenter", () => this.changeCursorTool());
            this.cursorTool.cursor.addEventListener("contextmenu", (e) => e.preventDefault());
            contentTelas.addEventListener("mousedown", (e) => this.mouseDownEventDrawing(e));
            contentTelas.addEventListener("mousemove", () => this.txtPositionCursor.value = Math.ceil(this.mousePosition.x) + ", " + Math.ceil(this.mousePosition.y));
            contentTelas.addEventListener("mouseleave", () => { if (!this.cursorTool.visible) { this.txtPositionCursor.value = "" } });
            this.cursorTool.cursor.addEventListener("mousedown", (e) => this.mouseDownEventDrawing(e));
            document.addEventListener("mousemove", throttle((e) => this.mouseMoveEventDrawing(e), 12));
            document.addEventListener("mouseup", (e) => this.mouseUpEventDrawing(e));
            this.cursorTool.cursor.addEventListener("wheel", (e) => this.cursorTool.wheel(e));
            this.toolOpacityBar.bar.addEventListener("mousedown", (e) => this.mouseDownToolOpacityBar(e));
            this.toolSizeBar.bar.addEventListener("mousedown", (e) => this.mouseDownToolSizeBar(e));
            this.toolHardnessBar.bar.addEventListener("mousedown", (e) => this.mouseDownToolHardnessBar(e));
            for (let i = 0; i < this.toolProperties.elements.length; i++) {
                let el = this.toolProperties.elements[i];
                el.property.addEventListener("mouseenter", () => {
                    if (!this.painting && !this.clickToCurve) { el.contentBar.style.height = "36px"; }
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
            if (this.cursorTool.visible) {
                this.txtPositionCursor.value = Math.ceil(this.mousePosition.x) + ", " + Math.ceil(this.mousePosition.y);
                if (!this.painting) {
                    const contentPosition = contentTelas.getBoundingClientRect();
                    if (e.pageX < contentPosition.left || e.pageX > contentPosition.left + contentPosition.width ||
                        e.pageY < contentPosition.top || e.pageY > contentPosition.top + contentPosition.height) {
                        this.cursorTool.cursor.style.display = "none";
                        this.txtPositionCursor.value = "";
                    } else if (!hotKeys.spacePressed) {
                        this.cursorTool.cursor.style.display = "block";
                    }
                }
                const posX = e.pageX + document.body.scrollLeft, posY = e.pageY + document.body.scrollTop;
                this.cursorTool.changeCursorPosition(posX, posY);
            } else if (this.selectedTool === this.arrayTools.length - 1) {
                this.cursorTool.eyeDropper.position = {
                    x: e.pageX + document.body.scrollLeft, y: posY = e.pageY + document.body.scrollTop
                };
            }
        },
        storeStrokeCoordinates() {
            const lastIndex = this.strokeCoordinates.x.length - 1;
            if (this.strokeCoordinates.x[lastIndex] === this.mousePosition.x &&
                this.strokeCoordinates.y[lastIndex] === this.mousePosition.y) { return; }
            this.strokeCoordinates.x.push(this.mousePosition.x);
            this.strokeCoordinates.y.push(this.mousePosition.y);
        },
        getStartEndStrokeCoordinates() {
            this.strokeCoordinates = {
                x: [this.strokeCoordinates.x[0], this.strokeCoordinates.x.pop()],
                y: [this.strokeCoordinates.y[0], this.strokeCoordinates.y.pop()]
            };
            return {
                start: { x: this.strokeCoordinates.x[0], y: this.strokeCoordinates.y[0] },
                end: { x: this.strokeCoordinates.x[1], y: this.strokeCoordinates.y[1] }
            };
        },
        mouseDownEventDrawing(e) {
            if (!project.arrayLayers[project.selectedLayer].visible || hotKeys.spacePressed || this.painting) { return; }
            if (e.button === 0) { this.toolProperties.color = project.selectedColors.primary; }
            else if (e.button === 2) { this.toolProperties.color = project.selectedColors.secondary; }
            else { return; }
            this.painting = true;
            this.storeStrokeCoordinates();
            this.applyToolChanges();
            project.eventLayer.clearRect(0, 0, project.properties.resolution.width, project.properties.resolution.height);
            project.eventLayer.lineJoin = project.eventLayer.lineCap = "round";
            this.currentLayer.globalCompositeOperation = "source-over";
            this[this.arrayTools[this.selectedTool].name](false);
            if (this.cursorTool.visible) { janelaPrincipal.style.cursor = "none"; }
        },
        mouseMoveEventDrawing(e) {
            this.getCursorPosition(e);
            if (this.painting) {
                this.storeStrokeCoordinates();
                project.eventLayer.clearRect(0, 0, project.properties.resolution.width, project.properties.resolution.height);
                this[this.arrayTools[this.selectedTool].name](true);
            } else if (this.toolSizeBar.clicked) { this.changeToolSize(e); }
            else if (this.toolOpacityBar.clicked) { this.changeToolOpacity(e); }
            else if (this.toolHardnessBar.clicked) { this.changeToolHardness(e); }
        },
        mouseUpEventDrawing(e) {
            if (this.painting) {
                this.painting = false;
                janelaPrincipal.style.cursor = "";
                if (this.selectedTool === this.arrayTools.length - 1) {//Conta-gotas.  
                    this.eyeDropper("mouseup");
                    return;
                } else if (this.selectedTool === 5) {//Curva. 
                    this.clickToCurve = !this.clickToCurve;
                    if (this.strokeCoordinates.x.length === 2) { return; }
                }
                // console.log(JSON.stringify(this.strokeCoordinates));
                this.strokeCoordinates = { x: [], y: [] };
                if (this.selectedTool != 4 && this.selectedTool != 7 && this.selectedTool != 8) { project.drawInLayer(); }
                else { project.drawInPreview(project.arrayLayers[project.selectedLayer]); }
            }
            this.toolSizeBar.clicked = this.toolOpacityBar.clicked = this.toolHardnessBar.clicked = false;
        },
        mouseDownToolSizeBar(e) {
            this.toolSizeBar.clicked = true;
            this.changeToolSize(e);
        },
        mouseDownToolOpacityBar(e) {
            this.toolOpacityBar.clicked = true;
            this.changeToolOpacity(e);
        },
        mouseDownToolHardnessBar(e) {
            this.toolHardnessBar.clicked = true;
            this.changeToolHardness(e);
        },
        selectDrawingTool(i) {
            if (colorSelectionWindow.opened) { return; }
            this.previousTool = this.selectedTool;
            this.selectedTool = i;
            this.strokeCoordinates = { x: [], y: [] };
            this.toolProperties.brushCanvas = this.toolProperties.brushCanvas = null;
            this.painting = this.clickToCurve = false;
            this.arrayTools[this.previousTool].tool.classList.replace("bttFerramentasEscolhida", "bttFerramentas");
            this.arrayTools[this.selectedTool].tool.classList.replace("bttFerramentas", "bttFerramentasEscolhida");
            this.changeCursorTool();
            project.eventLayer.canvas.style.opacity = this.selectedTool === 4 ? "0" : "";
            project.eventLayer.clearRect(0, 0, project.properties.resolution.width, project.properties.resolution.height);
        },
        changeToolSize(e) {
            this.applyToolSize(Math.round(getMousePosition(this.toolSizeBar.bar, e).x));
        },
        applyToolSize(pos) {
            const res = project.properties.resolution, maxSize = res.proportion > 1 ? res.width : res.height,
                width = this.toolSizeBar.bar.offsetWidth, left = pos <= 0 ? 0.5 : pos >= width ? width : pos,
                size = left <= 50 ? left : Math.floor((((maxSize * ((left - 13) / (width - 13))) / 100) * ((100 * (left - 50)) / (width - 50))) + 50);
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
            this.toolProperties.opacity = +((percentage / 100).toFixed(2));
            this.toolOpacityBar.cursor.style.left = mousePos.x - 7 + "px";
        },
        changeToolHardness(e) {
            const mousePos = getMousePosition(this.toolHardnessBar.bar, e), width = this.toolHardnessBar.bar.offsetWidth;
            mousePos.x = mousePos.x <= 0 ? 0 : mousePos.x >= width ? width : mousePos.x;
            const percentage = Math.ceil((mousePos.x * 100) / width);
            this.toolHardnessBar.txt.value = percentage + "%";
            this.toolProperties.hardness = +((percentage / 100).toFixed(2));
            this.toolHardnessBar.cursor.style.left = mousePos.x - 7 + "px";
        },
        applyToolChanges() {
            const maximoBlur = this.toolProperties.size / 6.2, color = this.toolProperties.color;
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
            if (this.selectedTool === this.arrayTools.length - 1) {
                contentTelas.style.cursor = "url('/colorPaint/imagens/cursor/cursorContaGotas.png') 0 20, pointer";
                this.cursorTool.invisibleCursor();
                return;
            } else if (this.selectedTool === 6) {
                contentTelas.style.cursor = "url('/colorPaint/imagens/cursor/cursorBaldeDeTinta.png') 0 0, pointer";
                this.cursorTool.invisibleCursor();
                return;
            }
            const size = this.toolProperties.size * ((project.screen.offsetWidth) / project.properties.resolution.width);
            if (this.cursorTool.show) {
                this.cursorTool.visibleCursor();
                contentTelas.style.cursor = "none";
                const previousPosition = { x: Math.round(this.cursorTool.cursor.offsetLeft + this.cursorTool.halfSize), y: Math.round(this.cursorTool.cursor.offsetTop + this.cursorTool.halfSize) };
                if (size < 15) {
                    this.cursorTool.cursor.classList.remove("bordaCursor");
                    this.cursorTool.cursor.style.backgroundImage = "url('/colorPaint/imagens/cursor/crossHair.png')";
                    this.cursorTool.cursor.style.width = this.cursorTool.cursor.style.height = "52px";
                    this.cursorTool.halfSize = 26;
                } else {
                    this.cursorTool.cursor.classList.add("bordaCursor");
                    this.cursorTool.halfSize = size / 2;
                    this.cursorTool.cursor.style.width = this.cursorTool.cursor.style.height = size + "px";
                    this.cursorTool.cursor.style.backgroundImage = size <= 150 ? "none" : "";
                }
                this.cursorTool.changeCursorPosition(previousPosition.x, previousPosition.y);
            } else {
                this.cursorTool.invisibleCursor();
                contentTelas.style.cursor = size < 20 ? "url('/colorPaint/imagens/cursor/crossHair.png') 12.5 12.5 , pointer" :
                    "url('/colorPaint/imagens/cursor/circle.png') 10 10 , pointer";
            }
        },
        brush(move) {
            let point1 = { x: this.strokeCoordinates.x[0], y: this.strokeCoordinates.y[0] },
                point2 = { x: this.strokeCoordinates.x[1], y: this.strokeCoordinates.y[1] };
            project.eventLayer.beginPath();
            project.eventLayer.moveTo(point1.x, point1.y);
            for (let i = 0; i < this.strokeCoordinates.x.length; i++) {
                let dis = { x: (point2.x - point1.x) ** 2, y: (point2.y - point1.y) ** 2 };
                if (((dis.x + dis.y) ** 0.5) > 3) {
                    const midPoint = midPointBtw(point1, point2);
                    project.eventLayer.quadraticCurveTo(point1.x, point1.y, midPoint.x, midPoint.y);
                } else { project.eventLayer.lineTo(point2.x, point2.y); }
                point1 = { x: this.strokeCoordinates.x[i], y: this.strokeCoordinates.y[i] };
                point2 = { x: this.strokeCoordinates.x[i + 1], y: this.strokeCoordinates.y[i + 1] };
            }
            project.eventLayer.lineTo(point1.x, point1.y);
            project.eventLayer.stroke();
            function midPointBtw(point1, point2) {
                return { x: point1.x + (point2.x - point1.x) / 2, y: point1.y + (point2.y - point1.y) / 2 };
            }
        },
        eraser(move) {
            if (!move) {
                undoRedoChange.saveChanges();
                this.toolProperties.brushCanvas = document.createElement("canvas").getContext("2d");
                this.toolProperties.brushCanvas.canvas.width = project.properties.resolution.width;
                this.toolProperties.brushCanvas.canvas.height = project.properties.resolution.height;
                this.toolProperties.brushCanvas.drawImage(this.currentLayer.canvas, 0, 0);
                project.eventLayer.strokeStyle = "rgba(0, 0, 0, " + this.toolProperties.opacity + ")";
            }
            this.brush(move);
            this.currentLayer.clearRect(0, 0, project.properties.resolution.width, project.properties.resolution.height);
            this.currentLayer.globalCompositeOperation = "source-over";
            this.currentLayer.drawImage(this.toolProperties.brushCanvas.canvas, 0, 0, project.properties.resolution.width, project.properties.resolution.height);
            this.currentLayer.globalCompositeOperation = "destination-out";
            this.currentLayer.drawImage(project.eventLayer.canvas, 0, 0);
        },
        line(move) {
            if (!move) { return; }
            const point = this.getStartEndStrokeCoordinates();
            project.eventLayer.beginPath();
            project.eventLayer.moveTo(point.start.x, point.start.y);
            project.eventLayer.lineTo(point.end.x, point.end.y);
            project.eventLayer.stroke();
        },
        curve(move) {
            if (!this.clickToCurve) { this.line(move); }
            else {
                this.strokeCoordinates.x[2] = this.strokeCoordinates.x.pop();
                this.strokeCoordinates.y[2] = this.strokeCoordinates.y.pop();
                project.eventLayer.beginPath();
                project.eventLayer.moveTo(this.strokeCoordinates.x[0], this.strokeCoordinates.y[0]);
                project.eventLayer.quadraticCurveTo(this.strokeCoordinates.x[2], this.strokeCoordinates.y[2],
                    this.strokeCoordinates.x[1], this.strokeCoordinates.y[1]);
                project.eventLayer.stroke();
            }
        },
        rectangle(move) {
            if (!move) { return; }
            const point = this.getStartEndStrokeCoordinates();
            project.eventLayer.beginPath();
            project.eventLayer.strokeRect(point.start.x, point.start.y, point.end.x - point.start.x, point.end.y - point.start.y);
        },
        ellipse(move) {
            if (!move) { return; }
            const point = this.getStartEndStrokeCoordinates();
            const raioX = (point.end.x - point.start.x) / 2, raioY = (point.end.y - point.start.y) / 2;
            const centroEixoX = point.start.x + raioX, centroEixoY = point.start.y + raioY;
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
        eyeDropper(move) {
            const cursorEyeDropper = this.cursorTool.eyeDropper.cursor, compareColors = this.cursorTool.eyeDropper.compareColors;
            if (!move) {
                cursorEyeDropper.style.display = "block";
                const corAtual = "25px solid rgb(" + project.selectedColors.primary.r + ", " + project.selectedColors.primary.g + ", " + project.selectedColors.primary.b + ")";
                compareColors.style.borderBottom = compareColors.style.borderLeft = corAtual;
                project.createDrawComplete();
                project.screen.style.imageRendering = "pixelated";
            }
            this.cursorTool.eyeDropper.cursor.style.top = this.cursorTool.eyeDropper.position.y - this.cursorTool.eyeDropper.halfSize + "px";
            this.cursorTool.eyeDropper.cursor.style.left = this.cursorTool.eyeDropper.position.x - this.cursorTool.eyeDropper.halfSize + "px";
            const lastIndex = this.strokeCoordinates.x.length - 1;
            const pixel = project.drawComplete.getImageData(this.strokeCoordinates.x[lastIndex], this.strokeCoordinates.y[lastIndex], 1, 1).data;
            let novaCor = pixel[3] === 0 ? "25px solid rgba(0, 0, 0, 0)" : "25px solid rgb(" + pixel[0] + ", " + pixel[1] + ", " + pixel[2] + ")";
            compareColors.style.borderTop = compareColors.style.borderRight = novaCor;
            if (move === "mouseup") {
                this.strokeCoordinates = { x: [], y: [] };
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
        smudge(move) {
            const lastIndex = this.strokeCoordinates.x.length - 1;
            if (!move) {
                undoRedoChange.saveChanges();
                this.start(this.strokeCoordinates.x[lastIndex], this.strokeCoordinates.y[lastIndex]);
                return;
            }
            this.updateSmudge(this.strokeCoordinates.x[lastIndex - 1], this.strokeCoordinates.y[lastIndex - 1],
                this.strokeCoordinates.x[lastIndex], this.strokeCoordinates.y[lastIndex]);
        },
        blur(move) {
            const lastIndex = this.strokeCoordinates.x.length - 1;
            const setBlurBlush = (brush, x, y) => {
                const size = this.toolProperties.size;
                brush.globalCompositeOperation = "source-over";
                brush.clearRect(0, 0, size, size);
                brush.filter = this.toolProperties.filter;
                brush.drawImage(this.currentLayer.canvas, x, y, size, size, 0, 0, size, size);
                brush.filter = "blur(0px)";
                brush.save();
                brush.fillStyle = this.toolProperties.brushForm;
                brush.globalCompositeOperation = "destination-out";
                brush.translate(this.toolProperties.halfSize, this.toolProperties.halfSize);
                brush.fillRect(-this.toolProperties.halfSize, -this.toolProperties.halfSize, size, size);
                brush.restore();
                this.currentLayer.drawImage(this.toolProperties.brushCanvas.canvas, x, y);
            }
            if (!move) {
                undoRedoChange.saveChanges();
                this.toolProperties.brushCanvas = document.createElement("canvas").getContext("2d");
                this.toolProperties.brushCanvas.canvas.width = this.toolProperties.brushCanvas.canvas.height = this.toolProperties.size;
                this.toolProperties.halfSize = this.toolProperties.size / 2;
                this.toolProperties.filter = "blur(" + ((0.1 * this.toolProperties.halfSize) * this.toolProperties.opacity).toFixed(2) + "px)";
                this.toolProperties.brushForm = this.setBrushForm();
                return;
            }
            const pos = {
                x: this.strokeCoordinates.x[lastIndex] - this.toolProperties.halfSize,
                y: this.strokeCoordinates.y[lastIndex] - this.toolProperties.halfSize
            };
            setBlurBlush(this.toolProperties.brushCanvas, pos.x, pos.y);
        },
        paintBucket(move) {
            if (move || this.mousePosition.x < 0 || this.mousePosition.x > project.properties.resolution.width ||
                this.mousePosition.y < 0 || this.mousePosition.y > project.properties.resolution.height) {
                this.painting = false;
                return;
            }
            const camada = this.currentLayer.getImageData(0, 0, project.properties.resolution.width, project.properties.resolution.height),
                clearCanvas = this.currentLayer.createImageData(project.properties.resolution.width, project.properties.resolution.height),
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
            this.strokeCoordinates.x[0] = Math.floor(this.strokeCoordinates.x.shift());
            this.strokeCoordinates.y[0] = Math.floor(this.strokeCoordinates.y.shift());
            pintar(this.strokeCoordinates.x[0], this.strokeCoordinates.y[0]);
        },
        setBrushBackground(x, y) {
            const size = this.toolProperties.size, pos = {
                x: x - this.toolProperties.halfSize, y: y - this.toolProperties.halfSize
            },
                ctx = this.toolProperties.brushCanvas;
            ctx.clearRect(0, 0, size, size);
            ctx.filter = "blur(" + (this.toolProperties.size / 6.2) - ((this.toolProperties.size / 6.2) * this.toolProperties.hardness) + "px)";
            ctx.drawImage(this.currentLayer.canvas, pos.x, pos.y, size, size, 0, 0, size, size);
            this.feather(ctx);
        },
        setBrushForm() {
            let innerRadius = Math.min(this.toolProperties.halfSize * this.toolProperties.hardness,
                this.toolProperties.halfSize - 1);
            innerRadius = innerRadius < 1 ? 1 : innerRadius;
            const gradient = this.toolProperties.brushCanvas.createRadialGradient(
                0, 0, innerRadius, 0, 0, this.toolProperties.halfSize);
            gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
            return gradient;
        },
        feather(ctx) {
            ctx.save();
            ctx.fillStyle = this.toolProperties.brushForm;
            ctx.globalCompositeOperation = 'destination-out';
            const { width, height } = ctx.canvas;
            ctx.translate(width / 2, height / 2);
            ctx.fillRect(-width / 2, -height / 2, width, height);
            ctx.restore();
        },
        start(x, y) {
            this.toolProperties.brushCanvas = document.createElement("canvas").getContext("2d");
            this.toolProperties.brushCanvas.canvas.width = this.toolProperties.brushCanvas.canvas.height = this.toolProperties.size;
            this.toolProperties.halfSize = this.toolProperties.size / 2;
            this.toolProperties.brushForm = this.setBrushForm();
            this.setBrushBackground(x, y);
        },
        updateSmudge(x, y, endX, endY) {
            const line = setupLine();
            for (let more = true; more;) {
                this.currentLayer.globalAlpha = +((0.7 * this.toolProperties.opacity * line.u).toFixed(2));
                this.currentLayer.drawImage(this.toolProperties.brushCanvas.canvas,
                    line.pos[0] - this.toolProperties.halfSize,
                    line.pos[1] - this.toolProperties.halfSize);
                this.setBrushBackground(line.pos[0], line.pos[1]);
                more = nextPosLine(line);
            }
            this.currentLayer.globalAlpha = 1;
            function nextPosLine(line) {
                --line.counter;
                line.u = 1 - line.counter / line.endPnt;
                if (line.counter <= 0) { return false; }
                let posX = line.pos[0], posy = line.pos[1];
                line.pos = [posX + line.plus[0], posy + line.plus[1]]
                return true;
            }
            function setupLine() {
                const deltaX = endX - x, deltaY = endY - y;
                const counter = +(((deltaX ** 2) + (deltaY ** 2)) ** 0.5).toFixed(2);
                return {
                    pos: [x, y], plus: [deltaX / counter, deltaY / counter],
                    counter: counter, endPnt: counter, u: 0,
                };
            };
        },
        updateBlur(x, y, endX, endY) {
            const line = setupLine();
            for (let more = true; more;) {
                this.currentLayer.drawImage(this.toolProperties.brushCanvas.canvas,
                    line.pos[0] - this.toolProperties.halfSize,
                    line.pos[1] - this.toolProperties.halfSize);
                this.setBrushBackground(line.pos[0], line.pos[1]);
                more = nextPosLine(line);
            }
            this.currentLayer.globalAlpha = 1;
            function nextPosLine(line) {
                --line.counter;
                line.u = 1 - line.counter / line.endPnt;
                if (line.counter <= 0) { return false; }
                return true;
            }
            function setupLine() {
                const deltaX = endX - x, deltaY = endY - y;
                const counter = +(((deltaX ** 2) + (deltaY ** 2)) ** 0.5).toFixed(2);
                return { pos: [x, y], counter: counter, endPnt: counter, u: 0 };
            };
        },
    }
}