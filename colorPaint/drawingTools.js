import { getImage, preventDefaultAction, throttle, getMousePosition } from "../js/geral.js";

export default function drawingToolsObject() {
    const observers = {}
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
            cursor: document.getElementById("cursorFerramenta"), show: true, visible: false, halfSize: 20, position: { x: 0, y: 0 },
            imgsCursor: {
                paintBucket: getImage("/colorPaint/imagens/cursor/cursorBaldeDeTinta.png"),
                eyeDropper: getImage("/colorPaint/imagens/cursor/cursorContaGotas.png"),
                crossHair: getImage("/colorPaint/imagens/cursor/crossHair.png"),
                centerCrossHair: getImage("/colorPaint/imagens/cursor/centerCrossHair.png"),
                circle: getImage("/colorPaint/imagens/cursor/circle.png")
            },
            eyeDropper: {
                cursor: document.getElementById("cursorComparaContaGotas"), compareColors: document.getElementById("comparaCoresContaGotas"),
                position: null
            },
            changeSize(size) {
                if (size < 15) {
                    this.cursor.classList.remove("bordaCursor");
                    this.cursor.style.backgroundImage = "url('/colorPaint/imagens/cursor/crossHair.png')";
                    this.cursor.style.width = this.cursor.style.height = "26px";
                    this.halfSize = 13;
                } else {
                    this.cursor.classList.add("bordaCursor");
                    this.halfSize = size / 2;
                    this.cursor.style.width = this.cursor.style.height = size + "px";
                    this.cursor.style.backgroundImage = size <= 150 ? "none" : "";
                }
                this.changeCursorPosition(this.position);
            },
            changeCursorPosition(pos) {
                this.position = pos;
                this.cursor.style.top = this.position.y - this.halfSize + "px";
                this.cursor.style.left = this.position.x - this.halfSize + "px";
            },
            changeEyeDropperPosition(pos) {
                this.eyeDropper.cursor.style.top = pos.y - 125 + "px";
                this.eyeDropper.cursor.style.left = pos.x - 125 + "px";
            },
            invisibleCursor() {
                this.visible = false;
                this.cursor.style.display = "none";
            },
            visibleCursor() {
                this.visible = true;
            },
            wheel(e) {
                if (!observers.hotKeys.shiftPressed) {
                    observers.contentTelas.scrollTop += e.deltaY < 0 ? -observers.contentTelas.offsetHeight / 7 : observers.contentTelas.offsetHeight / 7;
                } else { observers.contentTelas.scrollLeft += e.deltaY < 0 ? -observers.contentTelas.offsetWidth / 7 : observers.contentTelas.offsetWidth / 7; }
            }
        },
        eventLayer: document.getElementById("pintar").getContext("2d"),
        currentLayer: null, selectedTool: 0, mouseFunctionName: "brush", previousTool: 0, clickToCurve: false,
        showChangesCursor: true, txtPositionCursor: document.getElementById("txtPosicaoCursor"),
        mousePosition: { x: 0, y: 0 }, strokeCoordinates: { x: [], y: [] },
        infoMoveScreenWithSpace: { startCoordinate: null, scroolTop: null, scrollLeft: null },
        painting: false, bttMouseUsed: false, clickPropertieBar: false,
        toolProperties: {
            elements: [{ property: document.getElementById("propriedadeTamanho"), contentBar: document.getElementById("contentBarraTamanho") },
            { property: document.getElementById("propriedadeOpacidade"), contentBar: document.getElementById("contentBarraOpacidade") },
            { property: document.getElementById("propriedadeDureza"), contentBar: document.getElementById("contentBarraDureza") }],
            size: 5, opacity: 1, hardness: 1, color: { r: 0, g: 0, b: 0 }, brushCanvas: null, brushForm: null, halfSize: null,
            filter: null,
        },
        toolSizeBar: {
            bar: document.getElementById("barraTamanho"),
            txt: document.getElementById("txtTamanhoFerramenta"),
        },
        toolOpacityBar: {
            bar: document.getElementById("barraOpacidade"),
            txt: document.getElementById("txtOpacidadeFerramenta"),
        },
        toolHardnessBar: {
            bar: document.getElementById("barraDureza"),
            txt: document.getElementById("txtDurezaFerramenta"),
        },
        addEventsToElements() {
            observers.contentTelas.addEventListener("contextmenu", preventDefaultAction);
            observers.janelaPrincipal.addEventListener("mouseleave", () => {
                if (!this.painting) { this.cursorTool.invisibleCursor(); }
            });
            observers.janelaPrincipal.addEventListener("mouseenter", () => this.changeCursorTool());
            this.cursorTool.cursor.addEventListener("contextmenu", preventDefaultAction);
            observers.contentTelas.addEventListener("mousedown", (e) => this.mouseDownEventDrawing(e));
            observers.contentTelas.addEventListener("mousemove", () => this.txtPositionCursor.value = Math.ceil(this.mousePosition.x) + ", " + Math.ceil(this.mousePosition.y));
            observers.contentTelas.addEventListener("mouseleave", () => { if (!this.cursorTool.visible) { this.txtPositionCursor.value = "" } });
            this.cursorTool.cursor.addEventListener("mousedown", (e) => this.mouseDownEventDrawing(e));
            document.addEventListener("mousemove", throttle((e) => this.mouseMoveEventDrawing(e), 12));
            document.addEventListener("mouseup", (e) => this.mouseUpEventDrawing(e));
            this.cursorTool.cursor.addEventListener("wheel", (e) => this.cursorTool.wheel(e), { passive: true });
            this.toolOpacityBar.bar.addEventListener("input", (e) => this.mouseDownToolOpacityBar(e));
            this.toolSizeBar.bar.addEventListener("input", (e) => this.mouseDownToolSizeBar(e));
            this.toolHardnessBar.bar.addEventListener("input", (e) => this.mouseDownToolHardnessBar(e));
            for (let i = 0; i < this.toolProperties.elements.length; i++) {
                let el = this.toolProperties.elements[i];
                el.property.addEventListener("mouseover", () => {
                    if (!this.painting && !this.clickToCurve) {
                        el.contentBar.style.height = "36px";
                        this.cursorTool.invisibleCursor();
                    }
                });
                el.property.addEventListener("mouseleave", () => {
                    el.contentBar.style.height = "0px";
                    this.changeCursorTool();
                });
                el.property.addEventListener("mouseup", () => {
                    this.cursorTool.invisibleCursor();
                    this.eventLayer.clearRect(0, 0, observers.project.properties.resolution.width, observers.project.properties.resolution.height);
                });
            }
            for (let i = 0; i < this.arrayTools.length; i++) {
                this.arrayTools[i].tool.addEventListener("mousedown", () => this.selectDrawingTool(i));
            }
        },
        getCursorPosition(e) {
            const mouse = getMousePosition(observers.project.screen, e);
            this.mousePosition.x = +(((observers.project.properties.resolution.width / observers.project.screen.offsetWidth) * mouse.x).toFixed(1));
            this.mousePosition.y = +(((observers.project.properties.resolution.height / observers.project.screen.offsetHeight) * mouse.y).toFixed(1));
            if (this.cursorTool.visible) {
                this.txtPositionCursor.value = Math.ceil(this.mousePosition.x) + ", " + Math.ceil(this.mousePosition.y);
                if (!this.painting) {
                    const { left, top, width, height } = observers.contentTelas.getBoundingClientRect();
                    if (e.pageX < left || e.pageX > left + width || e.pageY < top || e.pageY > top + height) {
                        this.cursorTool.cursor.style.display = "none";
                        this.txtPositionCursor.value = "";
                    } else { this.cursorTool.cursor.style.display = "block"; }
                }
                this.cursorTool.changeCursorPosition(getMousePosition(observers.janelaPrincipal, e));
            }
        },
        storeStrokeCoordinates() {
            let lastIndex = this.strokeCoordinates.x.length - 1;
            if (this.strokeCoordinates.x[lastIndex] === this.mousePosition.x &&
                this.strokeCoordinates.y[lastIndex] === this.mousePosition.y) { return; }
            this.strokeCoordinates.x.push(this.mousePosition.x);
            this.strokeCoordinates.y.push(this.mousePosition.y);
            if (observers.hotKeys.shiftPressed) {
                lastIndex++;
                const deltaX = this.strokeCoordinates.x[lastIndex] - this.strokeCoordinates.x[0],
                    deltaY = this.strokeCoordinates.y[lastIndex] - this.strokeCoordinates.y[0];
                if (observers.hotKeys.infoTraceUsedShift.sizeX < Math.abs(deltaX)) { observers.hotKeys.infoTraceUsedShift.sizeX = Math.abs(deltaX); }
                if (observers.hotKeys.infoTraceUsedShift.sizeY < Math.abs(deltaY)) { observers.hotKeys.infoTraceUsedShift.sizeY = Math.abs(deltaY); }
                if (this.selectedTool === 2 || this.selectedTool === 3) {
                    if (Math.abs(deltaX) >= Math.abs(deltaY)) {
                        if (deltaX < 0 && deltaY < 0 || deltaX > 0 && deltaY > 0) {
                            this.strokeCoordinates.y[lastIndex] = this.strokeCoordinates.y[0] + (deltaX);
                        } else if (deltaX < 0 && deltaY > 0 || deltaX > 0 && deltaY < 0) {
                            this.strokeCoordinates.y[lastIndex] = this.strokeCoordinates.y[0] - (deltaX);
                        }
                    } else {
                        if (deltaY < 0 && deltaX < 0 || deltaY > 0 && deltaX > 0) {
                            this.strokeCoordinates.x[lastIndex] = this.strokeCoordinates.x[0] + (deltaY);
                        } else if (deltaY < 0 && deltaX > 0 || deltaY > 0 && deltaX < 0) {
                            this.strokeCoordinates.x[lastIndex] = this.strokeCoordinates.x[0] - (deltaY);
                        }
                    }
                } else if (observers.hotKeys.infoTraceUsedShift.sizeX >= observers.hotKeys.infoTraceUsedShift.sizeY) {
                    for (let i = 0; i <= lastIndex; i++) { this.strokeCoordinates.y[i] = this.strokeCoordinates.y[0]; }
                } else {
                    for (let i = 0; i <= lastIndex; i++) { this.strokeCoordinates.x[i] = this.strokeCoordinates.x[0]; }
                }
            }
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
        getDistanceCoordinates: (point1, point2) => ((point2.x - point1.x) ** 2 + (point2.y - point1.y) ** 2) ** 0.5,
        mouseDownEventDrawing(e) {
            preventDefaultAction(e);
            if (!observers.project.arrayLayers[observers.project.selectedLayer].visible || this.painting) { return; }
            this.bttMouseUsed = e.button;
            this.toolProperties.color = observers.project.selectedColors.get(this.bttMouseUsed);
            if (this.bttMouseUsed === 1) { this.selectDrawingTool(4); }
            this.painting = true;
            this.storeStrokeCoordinates();
            this.applyToolChanges();
            this.currentLayer.globalCompositeOperation = "source-over";
            this[this.mouseFunctionName](false, e);
            if (this.cursorTool.show) { observers.janelaPrincipal.style.cursor = "none"; }
        },
        mouseMoveEventDrawing(e) {
            this.getCursorPosition(e);
            if (this.painting) {
                this.storeStrokeCoordinates();
                this.eventLayer.clearRect(0, 0, observers.project.properties.resolution.width, observers.project.properties.resolution.height);
                this[this.mouseFunctionName](true, e);
            } else if (this.clickPropertieBar) {
                const { width, height, left, top } = observers.contentTelas.getBoundingClientRect(), midWidth = width / 2, midHeight = height / 2
                this.cursorTool.changeCursorPosition({ x: left + midWidth, y: top + midHeight });
            }
        },
        mouseUpEventDrawing(e) {
            if (this.painting) {
                this.painting = false;
                observers.janelaPrincipal.style.cursor = "";
                if (!this.completeToolUsage(e)) { return; };
                this.strokeCoordinates = { x: [], y: [] };
                if (this.selectedTool != 4 && this.selectedTool != 7 && this.selectedTool != 8) { observers.project.drawInLayer(); }
                else { observers.project.drawInPreview(observers.project.arrayLayers[observers.project.selectedLayer]); }
                if (this.bttMouseUsed === 1) { this.selectDrawingTool(this.previousTool) }
                this.currentLayer.globalCompositeOperation = "source-over";
            }
            this.bttMouseUsed = this.clickPropertieBar = false;
        },
        completeToolUsage(e) {
            switch (this.mouseFunctionName) {
                case "curve":
                    this.clickToCurve = !this.clickToCurve;
                    if (this.strokeCoordinates.x.length === 2) { return false; }
                    return true;
                case "moveScreen": case "eyeDropper": case "changeToolSizeCursor":
                case "changeToolOpacityCursor": case "changeToolHardnessCursor":
                    this[this.mouseFunctionName]("mouseup", e);
                    return false;
                default:
                    return true;
            }
        },
        mouseDownToolSizeBar(e) {
            this.clickPropertieBar = true;
            this.changeToolSizeBar(+((+(e.currentTarget.value)).toFixed(2)), true);
        },
        mouseDownToolOpacityBar(e) {
            this.clickPropertieBar = true;
            this.changeToolOpacity(+((+(e.currentTarget.value)).toFixed(2)), true);
        },
        mouseDownToolHardnessBar(e) {
            this.clickPropertieBar = true;
            this.changeToolHardness(+((+(e.currentTarget.value)).toFixed(2)), true);
        },
        selectDrawingTool(i) {
            if (observers.colorSelectionWindow.opened) { return; }
            this.previousTool = this.previousTool === this.selectedTool ? this.previousTool : this.selectedTool;
            this.selectedTool = i;
            this.mouseFunctionName = this.arrayTools[this.selectedTool].name;
            this.strokeCoordinates = { x: [], y: [] };
            this.toolProperties.brushCanvas = this.toolProperties.brushForm = null;
            this.painting = this.clickToCurve = false;
            this.arrayTools[this.previousTool].tool.classList.replace("bttFerramentasEscolhida", "bttFerramentas");
            this.arrayTools[this.selectedTool].tool.classList.replace("bttFerramentas", "bttFerramentasEscolhida");
            this.changeCursorTool();
            this.eventLayer.clearRect(0, 0, observers.project.properties.resolution.width, observers.project.properties.resolution.height);
        },
        changeToolSizeBar(value, show) {
            const res = observers.project.properties.resolution, maxSize = res.proportion > 1 ? res.width : res.height,
                width = +(this.toolSizeBar.bar.max), expoente = log(width - 50, maxSize);
            value = this.toolSizeBar.bar.value = value >= width ? width : value;
            const size = value < 1 ? 0.5 : value <= 50 ? Math.floor(value) : Math.floor((value - 50) ** expoente) + 50;
            this.toolSizeBar.txt.value = size + "px";
            this.toolProperties.size = size;
            if (show) { this.showChangeTool(); }
            else { this.changeCursorTool(); }
        },
        changeToolSize(newSize) {
            const res = observers.project.properties.resolution,
                expoente = log(+(this.toolSizeBar.bar.max) - 50, res.proportion > 1 ? res.width : res.height),
                value = newSize <= 50 ? newSize : 50 + Math.pow(newSize - 50, 1 / expoente);
            this.changeToolSizeBar(value, false)
        },
        changeToolOpacity(value, show) {
            value = value <= 0.01 ? 0.01 : value >= 1 ? 1 : value;
            const percentage = Math.round((value * 100));
            this.toolOpacityBar.txt.value = percentage + "%";
            this.toolOpacityBar.bar.value = this.toolProperties.opacity = +(value);
            if (show) { this.showChangeTool(); }
        },
        changeToolHardness(value, show) {
            value = value <= 0 ? 0 : value >= 1 ? 1 : value;
            const percentage = Math.round((value * 100));
            this.toolHardnessBar.txt.value = percentage + "%";
            this.toolHardnessBar.bar.value = this.toolProperties.hardness = +(value);
            if (show) { this.showChangeTool(); }
        },
        applyToolChanges() {
            const maximoBlur = this.toolProperties.size / 6.2, color = this.toolProperties.color;
            let dureza = maximoBlur - (maximoBlur * this.toolProperties.hardness);
            if (this.toolProperties.size < 100) {
                const proporcao = ((100 - this.toolProperties.size) / 180);
                dureza += (dureza * proporcao);
            }
            this.eventLayer.clearRect(0, 0, observers.project.properties.resolution.width, observers.project.properties.resolution.height);
            this.eventLayer.lineJoin = this.eventLayer.lineCap = "round";
            this.eventLayer.filter = "blur(" + dureza + "px)";
            this.eventLayer.lineWidth = (this.toolProperties.size - dureza);
            this.eventLayer.strokeStyle = this.eventLayer.fillStyle = "rgba(" + color.r + ", " + color.g + ", " + color.b + ", " + this.toolProperties.opacity + ")";
        },
        showChangeTool() {
            if (!this.showChangesCursor) { return; }
            const { width, height } = observers.contentTelas.getBoundingClientRect(), midWidth = width / 2, midHeight = height / 2
            this.changeCursorTool();
            this.strokeCoordinates = {
                x: [(observers.project.properties.resolution.width / observers.project.screen.offsetWidth) * ((midWidth - observers.project.screen.offsetLeft) + contentTelas.scrollLeft)],
                y: [(observers.project.properties.resolution.height / observers.project.screen.offsetHeight) * ((midHeight - observers.project.screen.offsetTop) + contentTelas.scrollTop)]
            }
            this.applyToolChanges();
            this.eventLayer.strokeStyle = "rgba(0, 0, 255, " + this.toolProperties.opacity + ")";
            this.brush(false);
            this.strokeCoordinates = { x: [], y: [] }
        },
        changeCursorTool() {
            this.cursorTool.eyeDropper.cursor.style.display = "none";
            observers.contentTelas.style.cursor = "";
            if (this.selectedTool === this.arrayTools.length - 1) {
                observers.contentTelas.style.cursor = "url('" + this.cursorTool.imgsCursor.eyeDropper.src + "') 0 20, pointer";
                this.cursorTool.invisibleCursor();
                return;
            } else if (this.selectedTool === 6) {
                observers.contentTelas.style.cursor = "url('" + this.cursorTool.imgsCursor.paintBucket.src + "') 0 0, pointer";
                this.cursorTool.invisibleCursor();
                return;
            }
            const size = this.toolProperties.size * ((observers.project.screen.offsetWidth) / observers.project.properties.resolution.width);
            if (this.cursorTool.show) {
                this.cursorTool.visibleCursor();
                observers.contentTelas.style.cursor = "none";
                this.cursorTool.changeSize(size);
            } else {
                this.cursorTool.invisibleCursor();
                observers.contentTelas.style.cursor = size < 20 ? "url('" + this.cursorTool.imgsCursor.crossHair.src + "') 12.5 12.5 , pointer" :
                    "url('" + this.cursorTool.imgsCursor.circle.src + "') 10 10 , pointer";
            }
        },
        brush(move) {
            let point1, point2;
            this.eventLayer.beginPath();
            this.eventLayer.moveTo(this.strokeCoordinates.x[0], this.strokeCoordinates.y[0]);
            for (let i = 0, n = this.strokeCoordinates.x.length; i < n; i++) {
                point1 = { x: this.strokeCoordinates.x[i], y: this.strokeCoordinates.y[i] };
                point2 = { x: this.strokeCoordinates.x[i + 1], y: this.strokeCoordinates.y[i + 1] };
                if (this.getDistanceCoordinates(point1, point2) >= 3) {
                    const midPoint = { x: point1.x + (point2.x - point1.x) / 2, y: point1.y + (point2.y - point1.y) / 2 };
                    this.eventLayer.quadraticCurveTo(point1.x, point1.y, midPoint.x, midPoint.y);
                } else { this.eventLayer.lineTo(point2.x, point2.y); }
            }
            this.eventLayer.lineTo(point1.x, point1.y);
            this.eventLayer.stroke();
        },
        eraser(move) {
            if (!move) {
                observers.undoRedoChange.saveChanges();
                this.toolProperties.brushCanvas = observers.undoRedoChange.createCopyLayer(this.currentLayer.canvas);
                this.eventLayer.strokeStyle = "rgba(0, 0, 0, " + this.toolProperties.opacity + ")";
            }
            this.brush(move);
            this.currentLayer.clearRect(0, 0, observers.project.properties.resolution.width, observers.project.properties.resolution.height);
            this.currentLayer.globalCompositeOperation = "source-over";
            this.currentLayer.drawImage(this.toolProperties.brushCanvas.canvas, 0, 0, observers.project.properties.resolution.width, observers.project.properties.resolution.height);
            this.currentLayer.globalCompositeOperation = "destination-out";
            this.currentLayer.drawImage(this.eventLayer.canvas, 0, 0);
            this.eventLayer.clearRect(0, 0, observers.project.properties.resolution.width, observers.project.properties.resolution.height)
        },
        line(move) {
            if (!move) { return; }
            const point = this.getStartEndStrokeCoordinates();
            this.eventLayer.beginPath();
            this.eventLayer.moveTo(point.start.x, point.start.y);
            this.eventLayer.lineTo(point.end.x, point.end.y);
            this.eventLayer.stroke();
        },
        curve(move) {
            if (!this.clickToCurve) { this.line(move); }
            else {
                this.strokeCoordinates.x[2] = this.strokeCoordinates.x.pop();
                this.strokeCoordinates.y[2] = this.strokeCoordinates.y.pop();
                this.eventLayer.beginPath();
                this.eventLayer.moveTo(this.strokeCoordinates.x[0], this.strokeCoordinates.y[0]);
                this.eventLayer.quadraticCurveTo(this.strokeCoordinates.x[2], this.strokeCoordinates.y[2],
                    this.strokeCoordinates.x[1], this.strokeCoordinates.y[1]);
                this.eventLayer.stroke();
            }
        },
        rectangle(move) {
            if (!move) { return; }
            const point = this.getStartEndStrokeCoordinates();
            this.eventLayer.beginPath();
            this.eventLayer.strokeRect(point.start.x, point.start.y, point.end.x - point.start.x, point.end.y - point.start.y);
        },
        ellipse(move) {
            if (!move) { return; }
            const point = this.getStartEndStrokeCoordinates();
            const raioX = (point.end.x - point.start.x) / 2, raioY = (point.end.y - point.start.y) / 2;
            const centroEixoX = point.start.x + raioX, centroEixoY = point.start.y + raioY;
            const passoAngulo = 0.005;
            let angulo = 0;
            const voltaCompleta = Math.PI * 2 + passoAngulo;
            this.eventLayer.beginPath();
            this.eventLayer.moveTo(centroEixoX + raioX * Math.cos(angulo), centroEixoY + raioY * Math.sin(angulo));
            for (; angulo < voltaCompleta; angulo += passoAngulo) {
                this.eventLayer.lineTo(centroEixoX + raioX * Math.cos(angulo), centroEixoY + raioY * Math.sin(angulo));
            }
            this.eventLayer.stroke();
        },
        eyeDropper(move, e) {
            const cursorEyeDropper = this.cursorTool.eyeDropper.cursor, compareColors = this.cursorTool.eyeDropper.compareColors;
            if (!move) {
                cursorEyeDropper.style.display = "block";
                const color = this.toolProperties.color, current = "25px solid rgb(" + color.r + ", " + color.g + ", " + color.b + ")";
                compareColors.style.borderBottom = compareColors.style.borderLeft = current;
                observers.project.createDrawComplete();
                observers.project.screen.style.imageRendering = "pixelated";
            }
            this.cursorTool.changeEyeDropperPosition(getMousePosition(observers.janelaPrincipal, e));
            const pixel = observers.project.drawComplete.getImageData(this.mousePosition.x, this.mousePosition.y, 1, 1).data,
                newColor = pixel[3] === 0 ? "25px solid rgba(0, 0, 0, 0)" : "25px solid rgb(" + pixel[0] + ", " + pixel[1] + ", " + pixel[2] + ")";
            compareColors.style.borderTop = compareColors.style.borderRight = newColor;
            if (move === "mouseup") {
                this.strokeCoordinates = { x: [], y: [] };
                cursorEyeDropper.style.display = "none";
                observers.project.screen.style.imageRendering = "auto";
                if (pixel[3] === 0) {
                    observers.notification.open({
                        title: "Atenção!", text: "Nenhuma cor foi selecionada."
                    }, { name: "notify", time: 1500 }, null);
                    return;
                }
                if (observers.colorSelectionWindow.opened) { observers.colorSelectionWindow.findColor({ r: pixel[0], g: pixel[1], b: pixel[2] }); }
                else { observers.project.selectedColors.set(this.bttMouseUsed, { r: pixel[0], g: pixel[1], b: pixel[2] }); }
            }
        },
        smudge(move) {
            const lastIndex = this.strokeCoordinates.x.length - 1;
            if (!move) {
                observers.undoRedoChange.saveChanges();
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
                observers.undoRedoChange.saveChanges();
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
            if (move || this.mousePosition.x < 0 || this.mousePosition.x > observers.project.properties.resolution.width ||
                this.mousePosition.y < 0 || this.mousePosition.y > observers.project.properties.resolution.height) {
                this.painting = false;
                return;
            }
            const camada = this.currentLayer.getImageData(0, 0, observers.project.properties.resolution.width, observers.project.properties.resolution.height),
                clearCanvas = this.currentLayer.createImageData(observers.project.properties.resolution.width, observers.project.properties.resolution.height),
                selectedColor = {
                    r: this.toolProperties.color.r, g: this.toolProperties.color.g,
                    b: this.toolProperties.color.b, a: Math.round(this.toolProperties.opacity * 255)
                },
                preencher = (posClickX, posClickY, cor) => {
                    let pixelsVerificados = [[posClickX, posClickY]];
                    while (pixelsVerificados.length > 0) {
                        const novaPosicao = pixelsVerificados.pop();
                        let x = novaPosicao[0], y = novaPosicao[1];
                        let posicaoPixel = (y * observers.project.properties.resolution.width + x) * 4;
                        while (y >= 0 && compararCorInicial(posicaoPixel, cor)) {
                            y -= 1;
                            posicaoPixel -= observers.project.properties.resolution.width * 4;
                        }
                        pintarPixel(posicaoPixel, selectedColor);
                        posicaoPixel += observers.project.properties.resolution.width * 4;
                        y += 1;
                        let ladoEsquerdo = false, ladoDireito = false;
                        while (y < observers.project.properties.resolution.height - 1 && compararCorInicial(posicaoPixel, cor)) {
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
                            if (x < observers.project.properties.resolution.width - 1) {
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
                            posicaoPixel += observers.project.properties.resolution.width * 4;
                        }
                        pintarPixel(posicaoPixel, selectedColor);
                    }
                    this.eventLayer.putImageData(clearCanvas, 0, 0);
                },
                pintar = (posX, posY) => {
                    const pixelPos = (posY * observers.project.properties.resolution.width + posX) * 4,
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
            this.strokeCoordinates.x[0] = Math.floor(this.strokeCoordinates.x.pop());
            this.strokeCoordinates.y[0] = Math.floor(this.strokeCoordinates.y.pop());
            pintar(this.strokeCoordinates.x[0], this.strokeCoordinates.y[0]);
        },
        setBrushBackground(x, y) {
            const size = this.toolProperties.size, pos = { x: x - this.toolProperties.halfSize, y: y - this.toolProperties.halfSize },
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
                const counter = +((((deltaX ** 2) + (deltaY ** 2)) ** 0.5).toFixed(2));
                return {
                    pos: [x, y], plus: [deltaX / counter, deltaY / counter],
                    counter: counter, endPnt: counter, u: 0,
                };
            };
        },
        moveScreen(move, e) {
            if (!move) {
                this.infoMoveScreenWithSpace = { startCoordinate: getMousePosition(observers.contentTelas, e), scroolTop: observers.contentTelas.scrollTop, scrollLeft: observers.contentTelas.scrollLeft };
                observers.contentTelas.style.cursor = "grabbing";
                return;
            } else if (move === "mouseup") {
                this.infoMoveScreenWithSpace = { startCoordinate: null, scroolTop: null, scrollLeft: null };
                contentTelas.style.cursor = "grab";
                return;
            }
            const mousePosition = getMousePosition(observers.contentTelas, e);
            observers.contentTelas.scrollLeft = this.infoMoveScreenWithSpace.scrollLeft + this.infoMoveScreenWithSpace.startCoordinate.x - mousePosition.x;
            observers.contentTelas.scrollTop = this.infoMoveScreenWithSpace.scroolTop + this.infoMoveScreenWithSpace.startCoordinate.y - mousePosition.y;
        },
        changeToolSizeCursor(move, e) {
            if (!move) {
                this.cursorTool.visible = false;
                observers.hotKeys.infoShifth = this.toolProperties.size;
                this.brush(false);
                return;
            } else if (move === "mouseup") {
                this.strokeCoordinates = { x: [], y: [] };
                this.selectDrawingTool(this.selectedTool);
                observers.hotKeys.infoShifth = null;
                return;
            }
            const { start, end } = this.getStartEndStrokeCoordinates(),
                distance = end.x - start.x < 0 ? -this.getDistanceCoordinates(start, end) : this.getDistanceCoordinates(start, end);
            this.changeToolSize(observers.hotKeys.infoShifth + distance);
            this.cursorTool.visible = false;
            this.applyToolChanges();
            this.strokeCoordinates = { x: [this.strokeCoordinates.x[0]], y: [this.strokeCoordinates.y[0]] };
            this.brush(false);
        },
        changeToolOpacityCursor(move, e) {
            if (!move) {
                this.cursorTool.visible = false;
                observers.hotKeys.infoShift = {
                    startCoordinate: getMousePosition(observers.janelaPrincipal, e),
                    beforeValue: +(this.toolOpacityBar.bar.value)
                }
                this.brush(false);
                return;
            } else if (move === "mouseup") {
                this.strokeCoordinates = { x: [], y: [] };
                this.selectDrawingTool(this.selectedTool);
                observers.hotKeys.infoShifth = null;
                return;
            }
            const start = observers.hotKeys.infoShift.startCoordinate, end = getMousePosition(observers.janelaPrincipal, e),
                distance = end.x - start.x < 0 ? -this.getDistanceCoordinates(start, end) : this.getDistanceCoordinates(start, end);
            this.changeToolOpacity(+((observers.hotKeys.infoShift.beforeValue + ((distance * 0.01) / 2.5)).toFixed(2)), false);
            this.applyToolChanges();
            this.strokeCoordinates = { x: [this.strokeCoordinates.x[0]], y: [this.strokeCoordinates.y[0]] };
            this.brush(false);
        },
        changeToolHardnessCursor(move, e) {
            if (!move) {
                this.cursorTool.visible = false;
                observers.hotKeys.infoShift = {
                    startCoordinate: getMousePosition(observers.janelaPrincipal, e),
                    beforeValue: +(this.toolHardnessBar.bar.value)
                }
                this.brush(false);
                return;
            } else if (move === "mouseup") {
                this.strokeCoordinates = { x: [], y: [] };
                this.selectDrawingTool(this.selectedTool);
                observers.hotKeys.infoShifth = null;
                return;
            }
            const start = observers.hotKeys.infoShift.startCoordinate, end = getMousePosition(observers.janelaPrincipal, e),
                distance = end.x - start.x < 0 ? -this.getDistanceCoordinates(start, end) : this.getDistanceCoordinates(start, end);
            this.changeToolHardness(+((observers.hotKeys.infoShift.beforeValue + ((distance * 0.01) / 2.5)).toFixed(2)), false);
            this.applyToolChanges();
            this.strokeCoordinates = { x: [this.strokeCoordinates.x[0]], y: [this.strokeCoordinates.y[0]] };
            this.brush(false);
        },
        addObserver(newobservers) {
            for (const prop in newobservers) { observers[prop] = newobservers[prop]; }
        }
    }
}

function log(base, log) { return Math.log(log) / Math.log(base); }