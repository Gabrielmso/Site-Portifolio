import {
    getImage, preventDefaultAction, throttle, setStyle,
    getMousePosition, logarithm, getDistanceCoordinates
} from "../js/geral.js";

export default function drawingToolsObject() {
    const D = {}, tools = {
        brush: { btt: document.getElementById("pincel"), prop: { s: 5, o: 1, h: 1 } },
        line: { btt: document.getElementById("linha"), prop: { s: 5, o: 1, h: 1 } },
        rectangle: { btt: document.getElementById("retangulo"), prop: { s: 5, o: 1, h: 1 } },
        ellipse: { btt: document.getElementById("elipse"), prop: { s: 5, o: 1, h: 1 } },
        eraser: { btt: document.getElementById("borracha"), prop: { s: 50, o: 1, h: 1 } },
        curve: { btt: document.getElementById("curva"), prop: { s: 5, o: 1, h: 1 } },
        paintBucket: { btt: document.getElementById("baldeDeTinta") },
        blur: { btt: document.getElementById("desfoque"), prop: { s: 30, o: 0.7, h: 0.8 } },
        smudge: { btt: document.getElementById("borrar"), prop: { s: 30, o: 0.7, h: 0.8 } },
        eyeDropper: { btt: document.getElementById("contaGotas") }
    }, mousePosition = {
        x: 0, y: 0, update(newX, newY) {
            this.x = newX;
            this.y = newY;
        }
    }, strokeCoordinates = {
        x: [], y: [], length: 0,
        add() {
            if (this.x.last === mousePosition.x && this.y.last === mousePosition.y) { return; }
            this.x.push(mousePosition.x);
            this.y.push(mousePosition.y);
            this.length++;
            if (D.hotKeys.shiftPressed) {
                const deltaX = strokeCoordinates.x.last - strokeCoordinates.x.first,
                    deltaY = strokeCoordinates.y.last - strokeCoordinates.y.first;
                if (D.hotKeys.infoTraceUsedShift.sizeX < Math.abs(deltaX)) { D.hotKeys.infoTraceUsedShift.sizeX = Math.abs(deltaX); }
                if (D.hotKeys.infoTraceUsedShift.sizeY < Math.abs(deltaY)) { D.hotKeys.infoTraceUsedShift.sizeY = Math.abs(deltaY); }
                if (D.drawingTools.selectedTool === "rectangle" || D.drawingTools.selectedTool === "ellipse") {
                    if (Math.abs(deltaX) >= Math.abs(deltaY)) {
                        if (deltaX < 0 && deltaY < 0 || deltaX > 0 && deltaY > 0) {
                            strokeCoordinates.y.last = strokeCoordinates.y.first + (deltaX);
                        } else if (deltaX < 0 && deltaY > 0 || deltaX > 0 && deltaY < 0) {
                            strokeCoordinates.y.last = strokeCoordinates.y.first - (deltaX);
                        }
                    } else {
                        if (deltaY < 0 && deltaX < 0 || deltaY > 0 && deltaX > 0) {
                            strokeCoordinates.x.last = strokeCoordinates.x.first + (deltaY);
                        } else if (deltaY < 0 && deltaX > 0 || deltaY > 0 && deltaX < 0) {
                            strokeCoordinates.x.last = strokeCoordinates.x.first - (deltaY);
                        }
                    }
                } else if (D.hotKeys.infoTraceUsedShift.sizeX >= D.hotKeys.infoTraceUsedShift.sizeY) {
                    for (let i = 0; i <= this.length; i++) { strokeCoordinates.y[i] = strokeCoordinates.y.first; }
                } else {
                    for (let i = 0; i <= this.length; i++) { strokeCoordinates.x[i] = strokeCoordinates.x.first; }
                }
            }
        },
        onlyStartEnd() {
            this.x = [this.x.first, this.x.last];
            this.y = [this.y.first, this.y.last];
            this.length = 2;
            return { start: { x: this.x[0], y: this.y[0] }, end: { x: this.x[1], y: this.y[1] } };
        },
        onlyFirst() {
            this.x = [this.x.first];
            this.y = [this.y.first];
            this.length = 1;
        },
        center() {
            const { offsetHeight, offsetWidth } = D.contentTelas, midWidth = offsetWidth / 2, midHeight = offsetHeight / 2;
            this.x = [(D.project.properties.resolution.width / D.project.screen.offsetWidth) * ((midWidth - D.project.screen.offsetLeft) + D.contentTelas.scrollLeft)];
            this.y = [(D.project.properties.resolution.height / D.project.screen.offsetHeight) * ((midHeight - D.project.screen.offsetTop) + D.contentTelas.scrollTop)];
            this.length = 1;
        },
        clear() {
            this.x.clear();
            this.y.clear();
            this.length = 0;
        }
    }, cursorTool = {
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
            if (size < 13) {
                this.cursor.classList.remove("bordaCursor");
                setStyle(this.cursor, {
                    width: "26px", height: "26px",
                    backgroundImage: "url('/colorPaint/imagens/cursor/crossHair.png')",
                });
                this.halfSize = 13;
            } else {
                this.cursor.classList.add("bordaCursor");
                this.halfSize = size / 2;
                setStyle(this.cursor, {
                    width: size + "px", height: size + "px", backgroundImage: size < 200 ? "none" : "",
                });
            }
            this.changeCursorPosition(this.position);
        },
        changeCursorPosition({ x, y }) {
            this.position.x = x;
            this.position.y = y;
            setStyle(this.cursor, { top: y - this.halfSize + "px", left: x - this.halfSize + "px" });
        },
        changeEyeDropperPosition({ x, y }) {
            setStyle(this.eyeDropper.cursor, { top: y - 125 + "px", left: x - 125 + "px" });
        },
        invisibleCursor() {
            this.visible = false;
            setStyle(this.cursor, { display: "none" });
        },
        visibleCursor() {
            this.visible = true;
        },
        wheel({ deltaY }) {
            if (!D.hotKeys.shiftPressed) {
                D.contentTelas.scrollTop += deltaY < 0 ? -D.contentTelas.offsetHeight / 7 : D.contentTelas.offsetHeight / 7;
            } else { D.contentTelas.scrollLeft += deltaY < 0 ? -D.contentTelas.offsetWidth / 7 : D.contentTelas.offsetWidth / 7; }
        },
    }
    let showDashSample = true;
    return {
        eventLayer: document.getElementById("pintar").getContext("2d"),
        get mousePosition() { return { x: mousePosition.x, y: mousePosition.y } },
        invisibleCursor: () => cursorTool.invisibleCursor(),
        currentLayer: null, selectedTool: "brush", mouseFunctionName: "brush", previousTool: "brush",
        clickToCurve: false, txtPositionCursor: document.getElementById("txtPosicaoCursor"),
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
            D.contentTelas.addEventListener("contextmenu", preventDefaultAction);
            D.janelaPrincipal.addEventListener("mouseleave", () => {
                if (!this.painting) { cursorTool.invisibleCursor(); }
            });
            D.janelaPrincipal.addEventListener("mouseenter", () => this.changeCursorTool());
            cursorTool.cursor.addEventListener("contextmenu", preventDefaultAction);
            D.contentTelas.addEventListener("mousedown", (e) => this.mouseDownEventDrawing(e));
            D.contentTelas.addEventListener("mousemove", () => this.txtPositionCursor.value = Math.ceil(mousePosition.x) + ", " + Math.ceil(mousePosition.y));
            D.contentTelas.addEventListener("mouseleave", () => { if (!cursorTool.visible) { this.txtPositionCursor.value = "" } });
            cursorTool.cursor.addEventListener("mousedown", (e) => this.mouseDownEventDrawing(e));
            D.janelaPrincipal.addEventListener("mousemove", throttle((e) => this.mouseMoveEventDrawing(e), 12));
            D.janelaPrincipal.addEventListener("mouseup", (e) => this.mouseUpEventDrawing(e));
            cursorTool.cursor.addEventListener("wheel", (e) => cursorTool.wheel(e), { passive: true });
            this.toolOpacityBar.bar.addEventListener("input", (e) => this.mouseDownToolOpacityBar(e));
            this.toolSizeBar.bar.addEventListener("input", (e) => this.mouseDownToolSizeBar(e));
            this.toolHardnessBar.bar.addEventListener("input", (e) => this.mouseDownToolHardnessBar(e));
            for (let i = 0; i < this.toolProperties.elements.length; i++) {
                let el = this.toolProperties.elements[i];
                el.property.addEventListener("mouseover", () => {
                    if (!this.painting && !this.clickToCurve && tools[this.selectedTool].prop) {
                        setStyle(el.contentBar, { height: "33px" });
                        cursorTool.invisibleCursor();
                    }
                });
                el.property.addEventListener("mouseleave", () => {
                    setStyle(el.contentBar, { height: null });
                    this.changeCursorTool();
                });
                el.property.addEventListener("mouseup", () => {
                    cursorTool.invisibleCursor();
                    this.eventLayer.clearRect(0, 0, D.project.properties.resolution.width, D.project.properties.resolution.height);
                });
            }
            for (const prop in tools) {
                tools[prop].btt.addEventListener("mousedown", () => this.selectDrawingTool(prop));
            }
        },
        getCursorPosition(e) {
            const { x, y } = getMousePosition(D.project.screen, e);
            mousePosition.update(+(((D.project.properties.resolution.width / D.project.screen.offsetWidth) * x).toFixed(1)),
                +(((D.project.properties.resolution.height / D.project.screen.offsetHeight) * y).toFixed(1)));
            if (cursorTool.visible) {
                this.txtPositionCursor.value = Math.ceil(mousePosition.x) + ", " + Math.ceil(mousePosition.y);
                if (!this.painting) {
                    const { left, top, width, height } = D.contentTelas.getBoundingClientRect();
                    if (e.pageX < left || e.pageX > left + width || e.pageY < top || e.pageY > top + height) {
                        setStyle(cursorTool.cursor, { display: "none" });
                        this.txtPositionCursor.value = "";
                    } else { setStyle(cursorTool.cursor, { display: "block" }); }
                }
                cursorTool.changeCursorPosition(getMousePosition(D.janelaPrincipal, e));
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
        selectDrawingTool(toolName) {
            if (D.colorSelectionWindow.opened) { return; }
            this.previousTool = this.previousTool === this.selectedTool ? this.previousTool : this.selectedTool;
            this.selectedTool = this.mouseFunctionName = toolName;
            this.setToolSelectedToolProperties(this.selectedTool);
            strokeCoordinates.clear();
            this.toolProperties.brushCanvas = this.toolProperties.brushForm = null;
            this.painting = this.clickToCurve = false;
            tools[this.previousTool].btt.classList.replace("bttFerramentasEscolhida", "bttFerramentas");
            tools[this.selectedTool].btt.classList.replace("bttFerramentas", "bttFerramentasEscolhida");
            this.changeCursorTool();
            this.eventLayer.clearRect(0, 0, D.project.properties.resolution.width, D.project.properties.resolution.height);
        },
        setToolSelectedToolProperties(toolName) {
            if (!(tools[toolName].prop)) { return; }
            this.changeToolSize(tools[toolName].prop.s);
            this.changeToolOpacity(tools[toolName].prop.o, false);
            this.changeToolHardness(tools[toolName].prop.h, false);
        },
        changeToolSize(newSize) {
            const res = D.project.properties.resolution,
                expoente = logarithm(+(this.toolSizeBar.bar.max) - 50, res.proportion > 1 ? res.width : res.height),
                value = newSize <= 50 ? newSize : 50 + Math.pow(newSize - 50, 1 / expoente);
            this.changeToolSizeBar(value, false);
        },
        changeToolSizeBar(value, show) {
            if (!(tools[this.selectedTool].prop)) { return; }
            const res = D.project.properties.resolution, maxSize = res.proportion > 1 ? res.width : res.height,
                width = +(this.toolSizeBar.bar.max), expoente = logarithm(width - 50, maxSize);
            value = this.toolSizeBar.bar.value = value >= width ? width : value;
            const size = value < 1 ? 0.5 : value <= 50 ? Math.round(value) : Math.round((value - 50) ** expoente) + 50;
            this.toolSizeBar.txt.value = size + "px";
            tools[this.selectedTool].prop.s = this.toolProperties.size = size;
            if (show) { this.showDashSample(); }
            else { this.changeCursorTool(); }
        },
        changeToolOpacity(value, show) {
            if (!(tools[this.selectedTool].prop)) { return; }
            value = value <= 0.01 ? 0.01 : value >= 1 ? 1 : value;
            const percentage = Math.round((value * 100));
            this.toolOpacityBar.txt.value = percentage + "%";
            this.toolOpacityBar.bar.value = tools[this.selectedTool].prop.o = this.toolProperties.opacity = +(value);
            if (show) { this.showDashSample(); }
        },
        changeToolHardness(value, show) {
            if (!(tools[this.selectedTool].prop)) { return; }
            value = value <= 0 ? 0 : value >= 1 ? 1 : value;
            const percentage = Math.round((value * 100));
            this.toolHardnessBar.txt.value = percentage + "%";
            this.toolHardnessBar.bar.value = tools[this.selectedTool].prop.h = this.toolProperties.hardness = +(value);
            if (show) { this.showDashSample(); }
        },
        applyToolChanges() {
            const maximoBlur = this.toolProperties.size / 6.2, color = this.toolProperties.color;
            let dureza = maximoBlur - (maximoBlur * this.toolProperties.hardness);
            if (this.toolProperties.size < 100) {
                const proporcao = ((100 - this.toolProperties.size) / 180);
                dureza += (dureza * proporcao);
            }
            this.eventLayer.clearRect(0, 0, D.project.properties.resolution.width, D.project.properties.resolution.height);
            this.eventLayer.lineJoin = this.eventLayer.lineCap = "round";
            this.eventLayer.filter = "blur(" + dureza + "px)";
            this.eventLayer.lineWidth = (this.toolProperties.size - dureza);
            this.eventLayer.strokeStyle = this.eventLayer.fillStyle = "rgba(" + color.r + ", " + color.g + ", " + color.b + ", " + this.toolProperties.opacity + ")";
        },
        showDashSample() {
            if (!showDashSample) { return; }
            this.changeCursorTool();
            this.applyToolChanges();
            this.eventLayer.strokeStyle = "rgba(0, 0, 255, " + this.toolProperties.opacity + ")";
            strokeCoordinates.center();
            this.brush("down");
            strokeCoordinates.clear();
        },
        changeCursorTool() {
            setStyle(cursorTool.eyeDropper.cursor, { display: null });
            setStyle(D.contentTelas, { cursor: "" });
            if (this.selectedTool === "eyeDropper") {
                setStyle(D.contentTelas, { cursor: "url('" + cursorTool.imgsCursor.eyeDropper.src + "') 0 20, pointer" });
                cursorTool.invisibleCursor();
                return;
            } else if (this.selectedTool === "paintBucket") {
                setStyle(D.contentTelas, { cursor: "url('" + cursorTool.imgsCursor.paintBucket.src + "') 0 20, pointer" });
                cursorTool.invisibleCursor();
                return;
            }
            const size = this.toolProperties.size * ((D.project.screen.offsetWidth) / D.project.properties.resolution.width);
            if (cursorTool.show) {
                cursorTool.visibleCursor();
                setStyle(D.contentTelas, { cursor: "none" });
                cursorTool.changeSize(size);
            } else {
                cursorTool.invisibleCursor();
                setStyle(D.contentTelas, {
                    cursor: size < 20 ? "url('" + cursorTool.imgsCursor.crossHair.src + "') 12.5 12.5 , pointer" :
                        "url('" + cursorTool.imgsCursor.circle.src + "') 10 10 , pointer"
                });
            }
        },
        mouseDownEventDrawing(e) {
            preventDefaultAction(e);
            if (!D.project.arrayLayers[D.project.selectedLayer].visible || this.painting) { return; }
            this.bttMouseUsed = e.button;
            this.toolProperties.color = D.project.selectedColors.get(this.bttMouseUsed);
            if (this.bttMouseUsed === 1) { this.selectDrawingTool("eraser"); }
            this.painting = true;
            strokeCoordinates.add();
            this.applyToolChanges();
            this.currentLayer.globalCompositeOperation = "source-over";
            if (cursorTool.show) { setStyle(D.janelaPrincipal, { cursor: "none" }); }
            this[this.mouseFunctionName]("down", e);
        },
        mouseMoveEventDrawing(e) {
            this.getCursorPosition(e);
            if (this.painting) {
                strokeCoordinates.add();
                this.eventLayer.clearRect(0, 0, D.project.properties.resolution.width, D.project.properties.resolution.height);
                this[this.mouseFunctionName]("move", e);
            } else if (this.clickPropertieBar) {
                const { width, height, left, top } = D.contentTelas.getBoundingClientRect(), midWidth = width / 2, midHeight = height / 2
                cursorTool.changeCursorPosition({ x: left + midWidth, y: top + midHeight });
            }
        },
        mouseUpEventDrawing(e) {
            setStyle(D.janelaPrincipal, { cursor: "" });
            if (this.painting) {
                this.painting = false;
                if (!this.completeToolUsage(e)) { return; };
                strokeCoordinates.clear();
                switch (this.selectedTool) {
                    case "eraser": case "blur": case "smudge":
                        D.project.drawInPreview(D.project.arrayLayers[D.project.selectedLayer]);
                        break;
                    default:
                        D.project.drawInLayer();
                }
                if (this.bttMouseUsed === 1) { this.selectDrawingTool(this.previousTool) }
                this.currentLayer.globalCompositeOperation = "source-over";
            }
            this.bttMouseUsed = this.clickPropertieBar = false;
        },
        completeToolUsage(e) {
            switch (this.mouseFunctionName) {
                case "curve":
                    this.clickToCurve = !this.clickToCurve;
                    if (strokeCoordinates.x.length === 2) { return false; }
                    return true;
                case "moveScreen": case "eyeDropper": case "changeToolSizeCursor":
                case "changeToolOpacityCursor": case "changeToolHardnessCursor":
                    this[this.mouseFunctionName]("up", e);
                    return false;
                default:
                    return true;
            }
        },
        brush(eventName) {
            let point1, point2;
            this.eventLayer.beginPath();
            this.eventLayer.moveTo(strokeCoordinates.x[0], strokeCoordinates.y[0]);
            for (let i = 0; i < strokeCoordinates.length; i++) {
                point1 = { x: strokeCoordinates.x[i], y: strokeCoordinates.y[i] };
                point2 = { x: strokeCoordinates.x[i + 1], y: strokeCoordinates.y[i + 1] };
                if (getDistanceCoordinates(point1, point2) >= 3) {
                    const midPoint = { x: point1.x + (point2.x - point1.x) / 2, y: point1.y + (point2.y - point1.y) / 2 };
                    this.eventLayer.quadraticCurveTo(point1.x, point1.y, midPoint.x, midPoint.y);
                } else { this.eventLayer.lineTo(point2.x, point2.y); }
            }
            this.eventLayer.lineTo(point1.x, point1.y);
            this.eventLayer.stroke();
        },
        eraser(eventName) {
            if (eventName === "down") {
                D.undoRedoChange.saveChanges();
                this.eventLayer.strokeStyle = "rgba(0, 0, 0, " + this.toolProperties.opacity + ")";
            }
            this.brush(eventName);
            this.currentLayer.clearRect(0, 0, D.project.properties.resolution.width, D.project.properties.resolution.height);
            this.currentLayer.globalCompositeOperation = "source-over";
            this.currentLayer.drawImage(D.undoRedoChange.lastChange, 0, 0, D.project.properties.resolution.width, D.project.properties.resolution.height);
            this.currentLayer.globalCompositeOperation = "destination-out";
            this.currentLayer.drawImage(this.eventLayer.canvas, 0, 0);
            this.eventLayer.clearRect(0, 0, D.project.properties.resolution.width, D.project.properties.resolution.height);
        },
        line(eventName) {
            if (eventName === "down") { return; }
            const point = strokeCoordinates.onlyStartEnd();
            this.eventLayer.beginPath();
            this.eventLayer.moveTo(point.start.x, point.start.y);
            this.eventLayer.lineTo(point.end.x, point.end.y);
            this.eventLayer.stroke();
        },
        curve(eventName) {
            if (!this.clickToCurve) { this.line(eventName); }
            else {
                strokeCoordinates.x[2] = strokeCoordinates.x.pop();
                strokeCoordinates.y[2] = strokeCoordinates.y.pop();
                this.eventLayer.beginPath();
                this.eventLayer.moveTo(strokeCoordinates.x[0], strokeCoordinates.y[0]);
                this.eventLayer.quadraticCurveTo(strokeCoordinates.x[2], strokeCoordinates.y[2],
                    strokeCoordinates.x[1], strokeCoordinates.y[1]);
                this.eventLayer.stroke();
            }
        },
        rectangle(eventName) {
            if (eventName === "down") { return; }
            const point = strokeCoordinates.onlyStartEnd();
            this.eventLayer.beginPath();
            this.eventLayer.strokeRect(point.start.x, point.start.y, point.end.x - point.start.x, point.end.y - point.start.y);
        },
        ellipse(eventName) {
            if (eventName === "down") { return; }
            const point = strokeCoordinates.onlyStartEnd();
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
        eyeDropper(eventName, e) {
            const cursorEyeDropper = cursorTool.eyeDropper.cursor, compareColors = cursorTool.eyeDropper.compareColors;
            if (eventName === "down") {
                setStyle(cursorEyeDropper, { display: "block" });
                const { r, g, b } = this.toolProperties.color, current = `25px solid rgb( ${r}, ${g}, ${b})`;
                setStyle(compareColors, { borderBottom: current, borderLeft: current });
                D.project.createDrawComplete();
                setStyle(D.project.screen, { imageRendering: "pixelated" });
            }
            cursorTool.changeEyeDropperPosition(getMousePosition(D.janelaPrincipal, e));
            const pixel = D.project.drawComplete.getImageData(mousePosition.x, mousePosition.y, 1, 1).data,
                newColor = pixel[3] === 0 ? "25px solid rgba(0, 0, 0, 0)" : `25px solid rgb( ${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
            setStyle(compareColors, { borderTop: newColor, borderRight: newColor });
            if (eventName === "up") {
                strokeCoordinates.clear();
                setStyle(cursorEyeDropper, { display: null });
                setStyle(D.project.screen, { imageRendering: "auto" });
                if (pixel[3] === 0) {
                    D.notification.open({ name: "notify", time: 1500 }, {
                        title: "Atenção!", text: "Nenhuma cor foi selecionada."
                    });
                    return;
                }
                if (D.colorSelectionWindow.opened) { D.colorSelectionWindow.currentColor = { r: pixel[0], g: pixel[1], b: pixel[2] }; }
                else { D.project.selectedColors.set(this.bttMouseUsed, { r: pixel[0], g: pixel[1], b: pixel[2] }); }
            }
        },
        smudge(eventName) {
            if (eventName === "down") {
                D.undoRedoChange.saveChanges();
                this.start(strokeCoordinates.x.last, strokeCoordinates.y.last);
                return;
            }
            this.updateSmudge(strokeCoordinates.x[strokeCoordinates.length - 2], strokeCoordinates.y[strokeCoordinates.length - 2],
                strokeCoordinates.x.last, strokeCoordinates.y.last);
        },
        blur(eventName) {
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
            if (eventName === "down") {
                D.undoRedoChange.saveChanges();
                this.toolProperties.brushCanvas = document.createElement("canvas").getContext("2d");
                this.toolProperties.brushCanvas.canvas.width = this.toolProperties.brushCanvas.canvas.height = this.toolProperties.size;
                this.toolProperties.halfSize = this.toolProperties.size / 2;
                this.toolProperties.filter = "blur(" + ((0.1 * this.toolProperties.halfSize) * this.toolProperties.opacity).toFixed(2) + "px)";
                this.toolProperties.brushForm = this.setBrushForm();
                return;
            }
            const pos = {
                x: strokeCoordinates.x.last - this.toolProperties.halfSize,
                y: strokeCoordinates.y.last - this.toolProperties.halfSize
            };
            setBlurBlush(this.toolProperties.brushCanvas, pos.x, pos.y);
        },
        paintBucket(eventName) {
            if (eventName === "move" || mousePosition.x < 0 || mousePosition.x > D.project.properties.resolution.width ||
                mousePosition.y < 0 || mousePosition.y > D.project.properties.resolution.height) {
                this.painting = false;
                return;
            }
            const camada = this.currentLayer.getImageData(0, 0, D.project.properties.resolution.width, D.project.properties.resolution.height),
                clearCanvas = this.currentLayer.createImageData(D.project.properties.resolution.width, D.project.properties.resolution.height),
                selectedColor = {
                    r: this.toolProperties.color.r, g: this.toolProperties.color.g,
                    b: this.toolProperties.color.b, a: Math.round(this.toolProperties.opacity * 255)
                },
                preencher = (posClickX, posClickY, cor) => {
                    let pixelsVerificados = [[posClickX, posClickY]];
                    while (pixelsVerificados.length > 0) {
                        const novaPosicao = pixelsVerificados.pop();
                        let x = novaPosicao[0], y = novaPosicao[1];
                        let posicaoPixel = (y * D.project.properties.resolution.width + x) * 4;
                        while (y >= 0 && compararCorInicial(posicaoPixel, cor)) {
                            y -= 1;
                            posicaoPixel -= D.project.properties.resolution.width * 4;
                        }
                        pintarPixel(posicaoPixel, selectedColor);
                        posicaoPixel += D.project.properties.resolution.width * 4;
                        y += 1;
                        let ladoEsquerdo = false, ladoDireito = false;
                        while (y < D.project.properties.resolution.height - 1 && compararCorInicial(posicaoPixel, cor)) {
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
                            if (x < D.project.properties.resolution.width - 1) {
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
                            posicaoPixel += D.project.properties.resolution.width * 4;
                        }
                        pintarPixel(posicaoPixel, selectedColor);
                    }
                    this.eventLayer.putImageData(clearCanvas, 0, 0);
                },
                pintar = (posX, posY) => {
                    const pixelPos = (posY * D.project.properties.resolution.width + posX) * 4,
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
            strokeCoordinates.x[0] = Math.floor(strokeCoordinates.x.pop());
            strokeCoordinates.y[0] = Math.floor(strokeCoordinates.y.pop());
            pintar(strokeCoordinates.x[0], strokeCoordinates.y[0]);
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
        moveScreen(eventName, e) {
            const eventFunction = {
                down: () => {
                    this.infoMoveScreenWithSpace = { startCoordinate: getMousePosition(D.contentTelas, e), scroolTop: D.contentTelas.scrollTop, scrollLeft: D.contentTelas.scrollLeft };
                    const style = { cursor: "grabbing" }
                    setStyle(D.janelaPrincipal, style);
                    setStyle(D.contentTelas, style);
                },
                move: () => {
                    const { x, y } = getMousePosition(D.contentTelas, e);
                    D.contentTelas.scrollLeft = this.infoMoveScreenWithSpace.scrollLeft + this.infoMoveScreenWithSpace.startCoordinate.x - x;
                    D.contentTelas.scrollTop = this.infoMoveScreenWithSpace.scroolTop + this.infoMoveScreenWithSpace.startCoordinate.y - y;
                },
                up: () => {
                    this.infoMoveScreenWithSpace = { startCoordinate: null, scroolTop: null, scrollLeft: null };
                    setStyle(D.contentTelas, { cursor: "grab" });
                }
            }
            eventFunction[eventName]();
        },
        changeToolSizeCursor(eventName, e) {
            const eventFunction = {
                down: () => {
                    cursorTool.visible = false;
                    D.hotKeys.infoShifth = this.toolProperties.size;
                    this.brush("down");
                },
                move: () => {
                    const { start, end } = strokeCoordinates.onlyStartEnd(),
                        distance = end.x - start.x < 0 ? -getDistanceCoordinates(start, end) : getDistanceCoordinates(start, end);
                    this.changeToolSize(D.hotKeys.infoShifth + distance);
                    cursorTool.visible = false;
                    this.applyToolChanges();
                    strokeCoordinates.onlyFirst();
                    this.brush("down");
                },
                up: () => this.defaultFunctionChangeToolPropertieCursor(),
            };
            eventFunction[eventName]();
        },
        changeToolOpacityCursor(eventName, e) {
            const eventFunction = {
                down: () => {
                    cursorTool.visible = false;
                    D.hotKeys.infoShift = {
                        startCoordinate: getMousePosition(D.janelaPrincipal, e),
                        beforeValue: +(this.toolOpacityBar.bar.value)
                    }
                    this.brush("down");
                },
                move: () => {
                    const start = D.hotKeys.infoShift.startCoordinate, end = getMousePosition(D.janelaPrincipal, e),
                        distance = end.x - start.x < 0 ? -getDistanceCoordinates(start, end) : getDistanceCoordinates(start, end);
                    this.changeToolOpacity(+((D.hotKeys.infoShift.beforeValue + ((distance * 0.01) / 2.5)).toFixed(2)), false);
                    this.applyToolChanges();
                    strokeCoordinates.onlyFirst();
                    this.brush("down");
                },
                up: () => this.defaultFunctionChangeToolPropertieCursor()
            };
            eventFunction[eventName]();
        },
        changeToolHardnessCursor(eventName, e) {
            const eventFunction = {
                down: () => {
                    cursorTool.visible = false;
                    D.hotKeys.infoShift = {
                        startCoordinate: getMousePosition(D.janelaPrincipal, e),
                        beforeValue: +(this.toolHardnessBar.bar.value)
                    }
                    this.brush("down");
                },
                move: () => {
                    const start = D.hotKeys.infoShift.startCoordinate, end = getMousePosition(D.janelaPrincipal, e),
                        distance = end.x - start.x < 0 ? -getDistanceCoordinates(start, end) : getDistanceCoordinates(start, end);
                    this.changeToolHardness(+((D.hotKeys.infoShift.beforeValue + ((distance * 0.01) / 2.5)).toFixed(2)), false);
                    this.applyToolChanges();
                    strokeCoordinates.onlyFirst();
                    this.brush("down");
                },
                up: () => this.defaultFunctionChangeToolPropertieCursor()
            };
            eventFunction[eventName]();
        },
        defaultFunctionChangeToolPropertieCursor() {
            this.selectDrawingTool(this.selectedTool);
            D.hotKeys.infoShifth = null;
        },
        changeCursorMode(e) {
            cursorTool.show = !cursorTool.show;
            e.currentTarget.getElementsByTagName("span")[0].innerText = cursorTool.show ? "Padrão" : "Simples";
            this.changeCursorTool();
        },
        changeShowDashSample(e) {
            showDashSample = !showDashSample;
            e.currentTarget.getElementsByTagName("span")[0].innerText = showDashSample ? "Sim" : "Não";
        },
        addDependencies(dependencies) {
            for (const prop in dependencies) { D[prop] = dependencies[prop]; }
        }
    }
}