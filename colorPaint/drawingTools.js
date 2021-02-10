import {
    getImage, preventDefaultAction, throttle, setStyle, getMousePosition, logarithm, getElement,
    getDistanceCoordinates, createEventEmitterToObservers, createCopyCanvas, createElement,
} from "../js/utils.js";

const toolConstructor = (name = "", properties = false) =>
    ({ btt: getElement(name), name, properties: properties ? properties : false });

export default function drawingToolsObject({ project, screen, contentTelas, janelaPrincipal, notification }) {
    const observers = createEventEmitterToObservers(["toolUsed", "drawInLayer", "setColor"]);
    const elCursor = getElement("cursorFerramenta");
    const mousePosition = {
        txtCursorPosition: getElement("txtPosicaoCursor"),
        x: 0, y: 0, update: e => {
            const { x, y } = getMousePosition(screen, e);
            mousePosition.x = +(((project.resolution.width / screen.offsetWidth) * x).toFixed(1));
            mousePosition.y = +(((project.resolution.height / screen.offsetHeight) * y).toFixed(1));
            mousePosition.txtCursorPosition.value = Math.ceil(mousePosition.x) + ", " + Math.ceil(mousePosition.y);
        }
    };
    const strokeCoordinates = {
        x: [], y: [], length: 0,
        add() {
            this.x.push(mousePosition.x);
            this.y.push(mousePosition.y);
            this.length++;
        },
        clear() {
            this.x.clear();
            this.y.clear();
            this.length = 0;
        },
        onlyStartEnd() {
            this.x = [this.x.first, this.x.last];
            this.y = [this.y.first, this.y.last];
            this.length = 2;
            return { start: { x: this.x.first, y: this.y.first }, end: { x: this.x.last, y: this.y.last } };
        },
        onlyFirst() {
            this.x = [this.x.first];
            this.y = [this.y.first];
            this.length = 1;
        },
    }
    let colorSelectionWindowOpened = false;
    const drawingTools = {
        tools: {
            brush: toolConstructor("brush", { size: 5, opacity: 1, hardness: 1 }),
            line: toolConstructor("line", { size: 5, opacity: 1, hardness: 1 }),
            rectangle: toolConstructor("rectangle", { size: 5, opacity: 1, hardness: 1 }),
            ellipse: toolConstructor("ellipse", { size: 5, opacity: 1, hardness: 1 }),
            eraser: toolConstructor("eraser", { size: 50, opacity: 1, hardness: 1 }),
            curve: toolConstructor("curve", { size: 5, opacity: 1, hardness: 1 }),
            paintBucket: toolConstructor("paintBucket", { opacity: 1 }),
            blur: toolConstructor("blur", { size: 30, force: 0.2, hardness: 0.7 }),
            smudge: toolConstructor("smudge", { size: 30, force: 0.2, hardness: 0.7 }),
            eyeDropper: toolConstructor("eyeDropper")
        },
        colorPlanes: [{ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 }], planeInUse: 1,
        selectedTool: { name: "brush", size: 5, opacity: 1, hardness: 1, color: { r: 0, g: 0, b: 0 } },
        toolFunctionName: "brush", previousToolName: "brush", painting: false,
        propertiesBar: {
            size: {
                property: getElement("propriedadeTamanho"), contentBar: getElement("contentBarraTamanho"),
                bar: getElement("barraTamanho"), txt: getElement("txtTamanhoFerramenta")
            },
            opacity: {
                property: getElement("propriedadeOpacidade"), contentBar: getElement("contentBarraOpacidade"),
                bar: getElement("barraOpacidade"), txt: getElement("txtOpacidadeFerramenta")
            },
            hardness: {
                property: getElement("propriedadeDureza"), contentBar: getElement("contentBarraDureza"),
                bar: getElement("barraDureza"), txt: getElement("txtDurezaFerramenta")
            },
            force: {
                property: getElement("propriedadeForca"), contentBar: getElement("contentBarraForca"),
                bar: getElement("barraForca"), txt: getElement("txtForcaFerramenta")
            }
        },
        setupLine: (x, y, targetX, targetY) => {
            const deltaX = targetX - x;
            const deltaY = targetY - y;
            const deltaRow = Math.abs(deltaX);
            const deltaCol = Math.abs(deltaY);
            const counter = Math.max(deltaCol, deltaRow);
            const axis = counter === deltaCol ? 1 : 0;
            return {
                position: [x, y],
                delta: [deltaX, deltaY],
                deltaPerp: [deltaRow, deltaCol],
                inc: [Math.sign(deltaX), Math.sign(deltaY)],
                accum: Math.floor(counter / 2),
                counter: counter,
                endPnt: counter,
                axis: axis,
            };
        },
        advanceLine: line => {
            line.counter--;
            if (line.counter <= 0) { return false; }
            const axis = line.axis;
            const perp = 1 - axis;
            line.accum += line.deltaPerp[perp];
            if (line.accum >= line.endPnt) {
                line.accum -= line.endPnt;
                line.position[perp] += line.inc[perp];
            }
            line.position[axis] += line.inc[axis];
            return true;
        },
        createFeatherGradient: (brush, radius) => {
            const innerRadius = Math.min(radius * drawingTools.selectedTool.hardness, radius - 1);
            const gradient = brush.createRadialGradient(radius, radius, innerRadius,
                radius, radius, radius);
            gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
            return gradient;
        },

    }
    const changeToolSizeBar = (value, change = false) => {
        const res = project.resolution, maxSize = Math.ceil(getDistanceCoordinates({ x: 1, y: 1 }, { x: res.width, y: res.height })),
            width = +(drawingTools.propertiesBar.size.bar.max), expoente = logarithm(width - 50, maxSize);
        value = drawingTools.propertiesBar.size.bar.value = value >= width ? width : value;
        const size = value < 1 ? 0.5 : value <= 50 ? Math.round(value) : Math.round((value - 50) ** expoente) + 50;
        drawingTools.propertiesBar.size.txt.value = size + "px";
        drawingTools.tools[drawingTools.selectedTool.name].properties.size = drawingTools.selectedTool.size = size;
        if (change) { cursorTool.update(); }
    }
    const changeToolSize = newSize => {
        const { width, height } = project.resolution,
            expoente = logarithm(+(drawingTools.propertiesBar.size.bar.max) - 50,
                Math.ceil(getDistanceCoordinates({ x: 1, y: 1 }, { x: width, y: height }))),
            value = newSize <= 50 ? newSize : 50 + Math.pow(newSize - 50, 1 / expoente);
        changeToolSizeBar(value, true);
    }
    const changeToolOpacity = value => {
        value = value <= 0.01 ? 0.01 : value >= 1 ? 1 : value;
        const percentage = Math.round((value * 100));
        drawingTools.propertiesBar.opacity.txt.value = percentage + "%";
        drawingTools.tools[drawingTools.selectedTool.name].properties.opacity =
            drawingTools.propertiesBar.opacity.bar.value = drawingTools.selectedTool.opacity = value;
    }
    const changeToolHardness = value => {
        value = value <= 0 ? 0 : value >= 1 ? 1 : value;
        const percentage = Math.round((value * 100));
        drawingTools.propertiesBar.hardness.txt.value = percentage + "%";
        drawingTools.tools[drawingTools.selectedTool.name].properties.hardness =
            drawingTools.propertiesBar.hardness.bar.value = drawingTools.selectedTool.hardness = value;
    }
    const changeToolForce = value => {
        value = value <= 0 ? 0 : value >= 1 ? 1 : value;
        const percentage = Math.round((value * 100));
        drawingTools.propertiesBar.force.txt.value = percentage + "%";
        drawingTools.tools[drawingTools.selectedTool.name].properties.force =
            drawingTools.propertiesBar.force.bar.value = drawingTools.selectedTool.force = value;
    }
    const onInputToolPropertiesBar = (() => {
        const properties = {
            size: e => changeToolSizeBar(+((+(e.currentTarget.value)).toFixed(2))),
            opacity: e => changeToolOpacity(+((+(e.currentTarget.value)).toFixed(2))),
            hardness: e => changeToolHardness(+((+(e.currentTarget.value)).toFixed(2))),
            force: e => changeToolForce(+((+(e.currentTarget.value)).toFixed(2)))
        }
        return (propertyName, e) => properties[propertyName](e);
    })();
    const selectDrawingTool = (() => {
        const contentToolProperties = getElement("propriedadesFerramentas");
        const setSelectedToolProperties = properties => {
            if (!properties) { setStyle(contentToolProperties, { display: "none" }); }
            else {
                setStyle(contentToolProperties, { display: null });
                const { size, opacity, hardness, force } = drawingTools.propertiesBar;
                if (properties.size === undefined) { setStyle(size.property, { display: "none" }); }
                else {
                    setStyle(size.property, { display: null });
                    changeToolSize(properties.size);
                }
                if (properties.opacity === undefined) { setStyle(opacity.property, { display: "none" }); }
                else {
                    setStyle(opacity.property, { display: null });
                    changeToolOpacity(properties.opacity);
                }
                if (properties.hardness === undefined) { setStyle(hardness.property, { display: "none" }); }
                else {
                    setStyle(hardness.property, { display: null });
                    changeToolHardness(properties.hardness);
                }
                if (properties.force === undefined) { setStyle(force.property, { display: "none" }); }
                else {
                    setStyle(force.property, { display: null });
                    changeToolForce(properties.force);
                }
            }
        }
        return toolName => {
            if (colorSelectionWindowOpened || project.toolInUse) { return; }
            drawingTools.previousToolName = drawingTools.previousToolName === drawingTools.selectedTool.name ?
                drawingTools.previousToolName : drawingTools.selectedTool.name;
            drawingTools.selectedTool = {
                name: toolName, ...drawingTools.tools[toolName].properties,
                color: drawingTools.colorPlanes[drawingTools.planeInUse - 1]
            }
            drawingTools.toolFunctionName = drawingTools.selectedTool.name;
            drawingTools.tools[drawingTools.previousToolName].btt.classList
                .replace("bttFerramentasEscolhida", "bttFerramentas");
            drawingTools.tools[drawingTools.selectedTool.name].btt.classList
                .replace("bttFerramentas", "bttFerramentasEscolhida");
            setSelectedToolProperties(drawingTools.tools[toolName].properties);
            strokeCoordinates.clear();
            cursorTool.update();
            project.eventLayer.clearRect(0, 0, project.resolution.width, project.resolution.height);
        }
    })();
    const applyToolProperties = () => {
        const { size, opacity, hardness, color: { r, g, b } } = drawingTools.selectedTool;
        const maximoBlur = size / 7;
        let dureza = maximoBlur - (maximoBlur * hardness);
        if (size < 100) {
            const proporcao = ((100 - size) / 200);
            dureza += (dureza * proporcao);
        }
        project.eventLayer.clearRect(0, 0, project.resolution.width, project.resolution.height);
        project.eventLayer.lineJoin = project.eventLayer.lineCap = "round";
        project.eventLayer.filter = "blur(" + dureza + "px)";
        project.eventLayer.lineWidth = (size - (dureza * 2));
        project.eventLayer.globalAlpha = opacity;
        project.eventLayer.strokeStyle = project.eventLayer.fillStyle = "rgb(" + r + ", " + g + ", " + b + ")";
    };
    const toolsFunctions = {
        brush: (() => {
            const move = () => {
                let point1, point2;
                project.eventLayer.beginPath();
                project.eventLayer.moveTo(strokeCoordinates.x.first, strokeCoordinates.y.first);
                for (let i = 0; i < strokeCoordinates.length; i++) {
                    point1 = { x: strokeCoordinates.x[i], y: strokeCoordinates.y[i] };
                    point2 = { x: strokeCoordinates.x[i + 1], y: strokeCoordinates.y[i + 1] };
                    if (getDistanceCoordinates(point1, point2) >= 3) {
                        const midPoint = [point1.x + (point2.x - point1.x) / 2,
                        point1.y + (point2.y - point1.y) / 2];
                        project.eventLayer.quadraticCurveTo(point1.x, point1.y,
                            midPoint.first, midPoint.last);
                    } else { project.eventLayer.lineTo(point2.x, point2.y); }
                }
                project.eventLayer.lineTo(point1.x, point1.y);
                project.eventLayer.stroke();
            }
            const down = move;
            const up = () => ({ save: true, inUse: false });
            return { move, down, up }
        })(),
        eraser: (() => {
            let copyLayer = null;
            const move = () => {
                toolsFunctions.brush.move();
                const { width, height } = project.resolution;
                project.selectedLayer.layer.clearRect(0, 0, width, height);
                project.selectedLayer.layer.globalCompositeOperation = "source-over";
                project.selectedLayer.layer.drawImage(copyLayer, 0, 0, width, height);
                project.selectedLayer.layer.globalCompositeOperation = "destination-out";
                project.selectedLayer.layer.drawImage(project.eventLayer.canvas, 0, 0);
            }
            const down = () => {
                observers.notify("toolUsed", {});
                setStyle(project.eventLayer.canvas, { display: "none" });
                copyLayer = createCopyCanvas(project.selectedLayer.layer.canvas);
                move();
            }
            const up = () => {
                copyLayer = null;
                project.eventLayer.clearRect(0, 0, project.resolution.width, project.resolution.height);
                setStyle(project.eventLayer.canvas, { display: null });
                return { save: false, inUse: false };
            }
            return { move, down, up }
        })(),
        line: (() => {
            const move = () => {
                const { start, end } = strokeCoordinates.onlyStartEnd();
                project.eventLayer.beginPath();
                project.eventLayer.moveTo(start.x, start.y);
                project.eventLayer.lineTo(end.x, end.y);
                project.eventLayer.stroke();
            }
            const down = () => { }
            const up = () => ({ save: true, inUse: false });
            return { move, down, up }
        })(),
        curve: (() => {
            let clickToCurve = false;
            const move = () => {
                if (!clickToCurve) {
                    toolsFunctions.line.move();
                    return;
                }
                strokeCoordinates.x[2] = strokeCoordinates.x.pop();
                strokeCoordinates.y[2] = strokeCoordinates.y.pop();
                project.eventLayer.beginPath();
                project.eventLayer.moveTo(strokeCoordinates.x.first, strokeCoordinates.y.first);
                project.eventLayer.quadraticCurveTo(strokeCoordinates.x[2], strokeCoordinates.y[2],
                    strokeCoordinates.x[1], strokeCoordinates.y[1]);
                project.eventLayer.stroke();
            }
            const down = move;
            const up = () => {
                clickToCurve = !clickToCurve;
                return { save: !clickToCurve, inUse: clickToCurve }
            }
            return { move, down, up }
        })(),
        rectangle: (() => {
            const move = () => {
                const { start, end } = strokeCoordinates.onlyStartEnd();
                project.eventLayer.beginPath();
                project.eventLayer.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
            };
            const down = () => { }
            const up = () => ({ save: true, inUse: false });
            return { move, down, up }
        })(),
        ellipse: (() => {
            const move = () => {
                const { end, start } = strokeCoordinates.onlyStartEnd();
                const raioX = (end.x - start.x) / 2, raioY = (end.y - start.y) / 2;
                const centroEixoX = start.x + raioX, centroEixoY = start.y + raioY;
                const passoAngulo = 0.005;
                let angulo = 0;
                const voltaCompleta = Math.PI * 2 + passoAngulo;
                project.eventLayer.beginPath();
                project.eventLayer.moveTo(centroEixoX + raioX * Math.cos(angulo),
                    centroEixoY + raioY * Math.sin(angulo));
                for (; angulo < voltaCompleta; angulo += passoAngulo) {
                    project.eventLayer.lineTo(centroEixoX + raioX * Math.cos(angulo), centroEixoY + raioY * Math.sin(angulo));
                }
                project.eventLayer.stroke();
            }
            const down = () => { }
            const up = () => ({ save: true, inUse: false });
            return { move, down, up }
        })(),
        eyeDropper: (() => {
            const cursor = getElement("cursorComparaContaGotas"), info = { drawComplete: null }
            const compareColors = getElement("comparaCoresContaGotas");
            const changeCursorPosition = ({ x, y }) =>
                setStyle(cursor, { top: y - 125 + "px", left: x - 125 + "px" });
            const move = e => {
                changeCursorPosition(getMousePosition(janelaPrincipal, e));
                const pixel = info.drawComplete.getImageData(mousePosition.x, mousePosition.y, 1, 1).data;
                const newColor = !pixel[3] ? "25px solid rgba(0, 0, 0, 0)" :
                    "25px solid rgb(" + pixel[0] + ", " + pixel[1] + ", " + pixel[2] + ")";
                setStyle(compareColors, { borderTop: newColor, borderRight: newColor });
                return { r: pixel[0], g: pixel[1], b: pixel[2], a: pixel[3] }
            }
            const down = e => {
                setStyle(cursor, { display: "block" });
                const { r, g, b } = drawingTools.selectedTool.color,
                    current = "25px solid rgb(" + r + ", " + g + ", " + b + ")";
                setStyle(compareColors, { borderBottom: current, borderLeft: current });
                setStyle(screen, { imageRendering: "pixelated" });
                info.drawComplete = project.drawComplete;
                move(e);
            }
            const up = e => {
                const { r, g, b, a } = move(e);
                setStyle(cursor, { display: null });
                setStyle(screen, { imageRendering: "auto" });
                if (!a) {
                    notification.open({
                        type: "notify", timeNotify: 1500, title: "Atenção!",
                        message: "Nenhuma cor foi selecionada."
                    });
                } else { observers.notify("setColor", { plane: drawingTools.planeInUse, color: { r, g, b } }); }
                return { save: false, inUse: false };
            }
            return { move, down, up }
        })(),
        paintBucket: (() => {
            const result = { save: true, inUse: false }
            const move = () => { };
            const down = () => {
                const { width, height } = project.resolution;
                if (mousePosition.x < 0 || mousePosition.x > width || mousePosition.y < 0 || mousePosition.y > height) {
                    result.save = false;
                    return;
                }
                const camada = project.selectedLayer.layer.getImageData(0, 0, width, height);
                const clearCanvas = project.selectedLayer.layer.createImageData(width, height);
                const selectedColor = {
                    a: Math.round(drawingTools.selectedTool.opacity * 255), ...drawingTools.selectedTool.color
                }
                const pintarPixel = (pixelPos, cor) => {
                    camada.data[pixelPos] = clearCanvas.data[pixelPos] = cor.r;
                    camada.data[pixelPos + 1] = clearCanvas.data[pixelPos + 1] = cor.g;
                    camada.data[pixelPos + 2] = clearCanvas.data[pixelPos + 2] = cor.b;
                    camada.data[pixelPos + 3] = clearCanvas.data[pixelPos + 3] = cor.a;
                }
                const compararCorInicial = (pixelPos, cor) => {
                    const r = camada.data[pixelPos], g = camada.data[pixelPos + 1], b = camada.data[pixelPos + 2],
                        a = camada.data[pixelPos + 3];
                    if (clearCanvas.data[pixelPos + 3] === 0) {
                        if (cor.r === selectedColor.r && cor.g === selectedColor.g &&
                            cor.b === selectedColor.b && cor.a === 255) { return false; }
                        if (r === cor.r && g === cor.g && b === cor.b && a === cor.a) { return true; }
                        if (r === selectedColor.r && g === selectedColor.g && b === selectedColor.b && a === selectedColor.a) {
                            return false;
                        }
                    } else { return false; }
                }
                const preencher = (posClickX, posClickY, cor) => {
                    const pixelsVerificados = [[posClickX, posClickY]];
                    while (pixelsVerificados.length) {
                        let [x, y] = pixelsVerificados.pop(), posicaoPixel = (y * width + x) * 4;
                        while (y >= 0 && compararCorInicial(posicaoPixel, cor)) {
                            y -= 1;
                            posicaoPixel -= width * 4;
                        }
                        posicaoPixel += width * 4;
                        y += 1;
                        let ladoEsquerdo = false, ladoDireito = false;
                        while (y < height && compararCorInicial(posicaoPixel, cor)) {
                            pintarPixel(posicaoPixel, selectedColor);
                            y += 1;
                            if (x > 0) {
                                if (compararCorInicial(posicaoPixel - 4, cor)) {
                                    if (!ladoEsquerdo) {
                                        ladoEsquerdo = true;
                                        pixelsVerificados.push([x - 1, y]);
                                    }
                                } else if (ladoEsquerdo) { ladoEsquerdo = false; }
                            }
                            if (x < width - 1) {
                                if (compararCorInicial(posicaoPixel + 4, cor)) {
                                    if (!ladoDireito) {
                                        ladoDireito = true;
                                        pixelsVerificados.push([x + 1, y]);
                                    }
                                } else if (ladoDireito) { ladoDireito = false; }
                            }
                            posicaoPixel += width * 4;
                        }
                    }
                    project.eventLayer.putImageData(clearCanvas, 0, 0);
                }
                const pintar = (posX, posY) => {
                    const pixelPos = (posY * width + posX) * 4,
                        cor = {
                            r: camada.data[pixelPos], g: camada.data[pixelPos + 1],
                            b: camada.data[pixelPos + 2], a: camada.data[pixelPos + 3]
                        }
                    if (cor.r === selectedColor.r && cor.g === selectedColor.g &&
                        cor.b === selectedColor.b && cor.a === 255) { return false; }
                    preencher(posX, posY, cor);
                    return true;
                }
                strokeCoordinates.x.first = Math.floor(strokeCoordinates.x.pop());
                strokeCoordinates.y.first = Math.floor(strokeCoordinates.y.pop());
                result.save = pintar(strokeCoordinates.x.first, strokeCoordinates.y.first);
            }
            const up = () => result;
            return { move, down, up }
        })(),
        smudge: (() => {
            const info = { lastX: 0, lastY: 0, radius: 0, feather: null }
            const brush = createElement("canvas", { width: 20, height: 20 }).getContext("2d");
            const updateBrush = (x, y) => {
                let width = drawingTools.selectedTool.size;
                let height = width;
                let srcX = x, srcY = y;
                let dstX = 0, dstY = 0;
                brush.clearRect(0, 0, drawingTools.selectedTool.size, drawingTools.selectedTool.size);
                if (srcX < 0) {
                    width += srcX;
                    dstX -= srcX;
                    srcX = 0;
                }
                const overX = srcX + width - project.resolution.width;
                if (overX > 0) { width -= overX; }
                if (srcY < 0) {
                    dstY -= srcY;
                    height += srcY;
                    srcY = 0;
                }
                const overY = srcY + height - project.resolution.height;
                if (overY > 0) { height -= overY; }
                brush.drawImage(project.selectedLayer.layer.canvas, srcX, srcY, width, height,
                    dstX, dstY, width, height);
                brush.save();
                brush.fillStyle = info.feather;
                brush.globalCompositeOperation = 'destination-out';
                brush.fillRect(0, 0, drawingTools.selectedTool.size, drawingTools.selectedTool.size);
                brush.restore();
            }
            const down = () => {
                observers.notify("toolUsed", {});
                project.selectedLayer.layer.globalAlpha = drawingTools.selectedTool.force / 2;
                const pos = { x: strokeCoordinates.x.last, y: strokeCoordinates.y.last }
                info.radius = drawingTools.selectedTool.size / 2;
                info.lastX = pos.x - info.radius;
                info.lastY = pos.y - info.radius;
                brush.canvas.height = brush.canvas.width = drawingTools.selectedTool.size;
                info.feather = drawingTools.createFeatherGradient(brush, info.radius);
                updateBrush(info.lastX, info.lastY);
            }
            const move = () => {
                const pos = { x: strokeCoordinates.x.last - info.radius, y: strokeCoordinates.y.last - info.radius }
                const line = drawingTools.setupLine(info.lastX, info.lastY, pos.x, pos.y);
                for (let more = true; more;) {
                    more = drawingTools.advanceLine(line);
                    project.selectedLayer.layer.drawImage(brush.canvas, line.position[0], line.position[1]);
                    updateBrush(line.position[0], line.position[1]);
                }
                info.lastX = pos.x;
                info.lastY = pos.y;
            }
            const up = () => {
                project.selectedLayer.layer.globalAlpha = 1;
                return { save: false, inUse: false }
            }
            return { move, down, up }
        })(),
        blur: (() => {
            const info = { radius: 0, info: "", lastX: 0, lastY: 0, feather: null, copyLayer: null }
            const brush = createElement("canvas", { width: 20, height: 20 }).getContext("2d");
            const updateBrush = (x, y) => {
                const width = drawingTools.selectedTool.size;
                brush.clearRect(0, 0, width, width);
                brush.filter = info.filter
                brush.drawImage(project.selectedLayer.layer.canvas, x, y, width, width, 0, 0, width, width);
                brush.filter = "blur(0px)";
                brush.save();
                brush.fillStyle = info.feather;
                brush.globalCompositeOperation = 'destination-out';
                brush.fillRect(0, 0, width, width);
                brush.restore();
            }
            const down = () => {
                observers.notify("toolUsed", {});
                const { force, size } = drawingTools.selectedTool;
                brush.canvas.height = brush.canvas.width = size;
                const maximoBlur = size / 25;
                let dureza = maximoBlur * force;
                if (size < 100) {
                    const proporcao = ((100 - size) / 180);
                    dureza += (dureza * proporcao);
                }
                info.filter = "blur(" + dureza + "px)";
                info.radius = drawingTools.selectedTool.size / 2;
                info.feather = drawingTools.createFeatherGradient(brush, info.radius);
                info.lastX = Math.round(strokeCoordinates.x.last - info.radius);
                info.lastY = Math.round(strokeCoordinates.y.last - info.radius);
            }
            const move = () => {
                const point1 = { x: Math.round(strokeCoordinates.x.last - info.radius), y: Math.round(strokeCoordinates.y.last - info.radius) }
                const line = drawingTools.setupLine(info.lastX, info.lastY, point1.x, point1.y);
                for (let more = true; more;) {
                    updateBrush(line.position[0], line.position[1]);
                    project.selectedLayer.layer.drawImage(brush.canvas, line.position[0], line.position[1]);
                    more = drawingTools.advanceLine(line);
                }
                info.lastX = point1.x;
                info.lastY = point1.y;
            }
            const up = () => ({ save: false, inUse: false });
            return { move, down, up }
        })(),
        moveScreen: (() => {
            let info = null;
            const down = e => {
                info = { startCoordinate: getMousePosition(contentTelas, e), scroolTop: contentTelas.scrollTop, scrollLeft: contentTelas.scrollLeft };
                const style = { cursor: "grabbing" }
                setStyle(contentTelas, style);
                setStyle(elCursor, style);
            }
            const move = e => {
                const { x, y } = getMousePosition(contentTelas, e);
                contentTelas.scrollLeft = info.scrollLeft + info.startCoordinate.x - x;
                contentTelas.scrollTop = info.scroolTop + info.startCoordinate.y - y;
            }
            const up = () => {
                info = null;
                const style = { cursor: "grab" }
                setStyle(contentTelas, style);
                setStyle(elCursor, style);
                strokeCoordinates.clear();
                return { save: false, inUse: true };
            }
            return { move, down, up }
        })(),
        infoChangeTool: { coordinate: { x: 0, y: 0 }, opacity: 0, size: 0, hardness: 0 },
        changeToolSize: (() => {
            const down = e => {
                toolsFunctions.infoChangeTool.coordinate = getMousePosition(janelaPrincipal, e);
                toolsFunctions.infoChangeTool.size = drawingTools.selectedTool.size;
                toolsFunctions.brush.down();
            }
            const move = e => {
                const start = toolsFunctions.infoChangeTool.coordinate, end = getMousePosition(janelaPrincipal, e);
                const distance = end.x - start.x < 0 ? -getDistanceCoordinates(start, end) :
                    getDistanceCoordinates(start, end);
                changeToolSize(toolsFunctions.infoChangeTool.size + Math.round(distance), false);
                applyToolProperties();
                strokeCoordinates.onlyFirst();
                toolsFunctions.brush.down();
            }
            const up = () => {
                project.eventLayer.clearRect(0, 0, project.resolution.width, project.resolution.height);
                selectDrawingTool(drawingTools.selectedTool.name);
                return { save: false, inUse: false };
            }
            return { down, move, up }
        })(),
        changeToolOpacity: (() => {
            const down = e => {
                toolsFunctions.infoChangeTool.coordinate = getMousePosition(janelaPrincipal, e);
                toolsFunctions.infoChangeTool.opacity = drawingTools.selectedTool.opacity;
                toolsFunctions.brush.down();
            }
            const move = e => {
                const start = toolsFunctions.infoChangeTool.coordinate, end = getMousePosition(janelaPrincipal, e);
                const distance = end.x - start.x < 0 ? -getDistanceCoordinates(start, end) :
                    getDistanceCoordinates(start, end);
                changeToolOpacity(+((toolsFunctions.infoChangeTool.opacity + ((distance * 0.01) / 2.5)).toFixed(2)), false);
                applyToolProperties();
                strokeCoordinates.onlyFirst();
                toolsFunctions.brush.down();
            }
            const up = () => {
                project.eventLayer.clearRect(0, 0, project.resolution.width, project.resolution.height);
                selectDrawingTool(drawingTools.selectedTool.name);
                return { save: false, inUse: false };
            }
            return { move, down, up }
        })(),
        changeToolOpacity: (() => {
            const down = e => {
                toolsFunctions.infoChangeTool.coordinate = getMousePosition(janelaPrincipal, e);
                toolsFunctions.infoChangeTool.hardness = drawingTools.selectedTool.hardness;
                toolsFunctions.brush.down();
            }
            const move = e => {
                const start = toolsFunctions.infoChangeTool.coordinate, end = getMousePosition(janelaPrincipal, e);
                const distance = end.x - start.x < 0 ? -getDistanceCoordinates(start, end) :
                    getDistanceCoordinates(start, end);
                changeToolHardness(+((toolsFunctions.infoChangeTool.hardness + ((distance * 0.01) / 2.5)).toFixed(2)), false);
                applyToolProperties();
                strokeCoordinates.onlyFirst();
                toolsFunctions.brush.down();
            }
            const up = () => {
                project.eventLayer.clearRect(0, 0, project.resolution.width, project.resolution.height);
                selectDrawingTool(drawingTools.selectedTool.name);
                return { save: false, inUse: false };
            }
            return { move, down, up }
        })(),
    }
    const functionsMouseMove = {
        arrayFunctions: [mousePosition.update],
        onMouseMove: throttle(e => {
            for (const func of functionsMouseMove.arrayFunctions) { func(e) }
        }, 12),
        add(func) {
            for (let i = 0; i < this.arrayFunctions.length; i++) {
                if (this.arrayFunctions[i] === func) { return; }
            }
            this.arrayFunctions.push(func);
        },
        remove(func) {
            for (let i = 0; i < this.arrayFunctions.length; i++) {
                if (this.arrayFunctions[i] === func) { this.arrayFunctions.splice(i, 1); }
            }
        }
    }
    const cursorTool = {
        mode: "default", position: { x: 0, y: 0 }, halfSize: 0, contentTelasInfo: contentTelas.getBoundingClientRect(),
        setSize: size => {
            if (size < 13) {
                elCursor.classList.remove("bordaCursor");
                setStyle(elCursor, { backgroundImage: "url('/colorPaint/imagens/cursor/crossHair.png')" });
            } else {
                elCursor.classList.add("bordaCursor");
                cursorTool.halfSize = size / 2;
                setStyle(elCursor, {
                    width: size + "px", height: size + "px", backgroundImage: size < 200 ? "none" : "",
                });
            }
            cursorTool.currentSetPosition(cursorTool.position);
        },
        setPositionNoPainting({ x, y }) {
            this.position.x = x;
            this.position.y = y;
            setStyle(elCursor, { top: y - this.halfSize + "px", left: x - this.halfSize + "px" });
            const { left, top, width, height } = cursorTool.contentTelasInfo;
            if (x < left || x > left + width || y < top || y > top + height) {
                setStyle(elCursor, { display: "none" });
            }
        },
        setPositionPainting({ x, y }) {
            this.position.x = x;
            this.position.y = y;
            setStyle(elCursor, { top: y - this.halfSize + "px", left: x - this.halfSize + "px" });
        },
        currentSetPosition: null,
        changeMode: (() => {
            const onMouseMove = e => cursorTool.currentSetPosition(getMousePosition(janelaPrincipal, e))
            const onMouseEnter = e => {
                setStyle(elCursor, { display: "block" });
                onMouseMove(e);
            }
            return {
                simple: () => {
                    contentTelas.removeEventListener("mouseenter", onMouseEnter);
                    functionsMouseMove.remove(onMouseMove);
                },
                default: () => {
                    contentTelas.addEventListener("mouseenter", onMouseEnter);
                    functionsMouseMove.add(onMouseMove);
                }
            }
        })(),
        invisibleCursor: () => setStyle(elCursor, { display: "none" }),
        onClickBttChangeMode: e => {
            cursorTool.mode = cursorTool.mode === "simple" ? "default" : "simple";
            Array.from(e.currentTarget.getElementsByTagName("span")).first.innerText =
                cursorTool.mode === "simple" ? "Simples" : "Padrão";
            cursorTool.changeMode[cursorTool.mode]();
            cursorTool.update();
        },
        update: () => {
            setStyle(contentTelas, { cursor: "none" });
            const size = drawingTools.selectedTool.size * (screen.offsetWidth / project.resolution.width);
            if (cursorTool.mode === "default") {
                elCursor.classList.remove("bordaCursor");
                setStyle(elCursor, { width: "500px", height: "500px", backgroundImage: "none", cursor: "none" });
                cursorTool.halfSize = 250;
                if (drawingTools.toolFunctionName === "eyeDropper") {
                    setStyle(elCursor, { cursor: "url('./colorPaint/imagens/cursor/cursorContaGotas.png') 0 20, pointer" });
                    return;
                } else if (drawingTools.toolFunctionName === "paintBucket") {
                    setStyle(elCursor, { cursor: "url('./colorPaint/imagens/cursor/cursorBaldeDeTinta.png') 0 0, pointer" });
                    return;
                } else if (drawingTools.toolFunctionName === "moveScreen") {
                    setStyle(elCursor, { cursor: "grab" });
                    return;
                }
                cursorTool.setSize(size);
            } else {
                if (drawingTools.toolFunctionName === "eyeDropper") {
                    setStyle(contentTelas, { cursor: "url('./colorPaint/imagens/cursor/cursorContaGotas.png') 0 20, pointer" });
                    return;
                } else if (drawingTools.toolFunctionName === "paintBucket") {
                    setStyle(contentTelas, { cursor: "url('./colorPaint/imagens/cursor/cursorBaldeDeTinta.png') 0 0, pointer" });
                    return;
                } else if (drawingTools.toolFunctionName === "moveScreen") {
                    setStyle(contentTelas, { cursor: "grab" });
                    return;
                }
                setStyle(contentTelas, {
                    cursor: size < 20 ? "url('./colorPaint/imagens/cursor/crossHair.png') 12.5 12.5 , pointer" :
                        "url('./colorPaint/imagens/cursor/circle.png') 10 10 , pointer"
                });
            }
        }
    }

    const onMouseDown = (() => {
        const onMouseMove = e => {
            strokeCoordinates.add();
            project.eventLayer.clearRect(0, 0, project.resolution.width, project.resolution.height);
            toolsFunctions[drawingTools.toolFunctionName].move(e);
        }
        const onMouseUp = e => {
            project.selectedLayer.layer.globalCompositeOperation = "source-over";
            const { save, inUse } = toolsFunctions[drawingTools.toolFunctionName].up(e);
            if (!inUse) {
                if (save) { observers.notify("toolUsed"); }
                else { observers.notify("drawInLayer", project.selectedLayer); }
                strokeCoordinates.clear();
                project.eventLayer.clearRect(0, 0, project.resolution.width, project.resolution.height);
            }
            project.toolInUse = inUse;
            drawingTools.painting = false;
            cursorTool.currentSetPosition = cursorTool.setPositionNoPainting;
            functionsMouseMove.remove(onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        }
        const mouseDown = e => {
            if (!project.selectedLayer.visible || drawingTools.painting) { return; }
            if (!project.toolInUse) {
                drawingTools.planeInUse = e.button < 1 ? 1 : e.button > 2 ? 1 : e.button;
                drawingTools.selectedTool.color = drawingTools.colorPlanes[drawingTools.planeInUse - 1];
            }
            drawingTools.painting = true;
            cursorTool.currentSetPosition = cursorTool.setPositionPainting;
            applyToolProperties();
            strokeCoordinates.add();
            if (drawingTools.selectedTool.size <= 1) {
                strokeCoordinates.x.first = +(Math.floor(strokeCoordinates.x.first) + ".5");
                strokeCoordinates.y.first = +(Math.floor(strokeCoordinates.y.first) + ".5");
            }
            toolsFunctions[drawingTools.toolFunctionName].down(e);
            project.toolInUse = true;
            functionsMouseMove.add(onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
        }
        return mouseDown;
    })();
    const onHotKeys = (() => {
        const info = { spacePressed: false, ctrlPressed: false, shiftPressed: false }
        const keyDown = {
            Space: () => {
                if (info.spacePressed) { return; }
                project.toolInUse = info.spacePressed = true;
                drawingTools.toolFunctionName = "moveScreen";
                cursorTool.update();
            },
            Backslash: () => changeToolSize(drawingTools.selectedTool.size - 1),
            BracketRight: () =>
                changeToolSize(drawingTools.selectedTool.size === 0.5 ? 1 : drawingTools.selectedTool.size + 1),
            Ctrl: () => {
                if (info.ctrlPressed) { return; }
                info.ctrlPressed = true;
                selectDrawingTool("eyeDropper");
            },
            Shift: e => {
                if (info.shiftPressed) { return; }
                info.shiftPressed = true;
                selectDrawingTool(drawingTools.selectedTool.name);
            }
        }
        const keyUp = {
            Ctrl: () => {
                info.ctrlPressed = false;
                selectDrawingTool(drawingTools.previousToolName);
                cursorTool.update();
            },
            Space: () => {
                project.toolInUse = info.spacePressed = false;
                selectDrawingTool(drawingTools.selectedTool.name);
                cursorTool.update();
            },
            Shift: () => {
                selectDrawingTool(drawingTools.selectedTool.name);
            }
        }
        const withShift = {
            KeyA: () => drawingTools.toolFunctionName = "changeToolSize",
            KeyS: () => drawingTools.toolFunctionName = "changeToolOpacity",
            KeyD: () => drawingTools.toolFunctionName = "changeToolHardness",
        }
        return ({ pressed, e }) => {
            let fn = null;
            // = pressed ? keyDown[e.code] : keyUp[e.code];
            if (e.shiftKey) {
                keyDown.Shift();
                fn = withShift[e.code];
            } else { keyUp.Shift(); }

            if (e.ctrlKey) { keyDown.Ctrl(); }
            else { keyUp.Ctrl(); }

            if (!fn) { return; }
            preventDefaultAction(e);
            fn(e);
        }
    })();
    const onZoom = () => {
        cursorTool.contentTelasInfo = contentTelas.getBoundingClientRect();
        cursorTool.update();
    };
    const onColorChanged = ({ plane, color }) => { drawingTools.colorPlanes[plane - 1] = color; }
    const onOpenColorSelectionWindow = open => {
        colorSelectionWindowOpened = false;
        if (open) { selectDrawingTool("eyeDropper"); }
        else { selectDrawingTool(drawingTools.previousToolName); }
        colorSelectionWindowOpened = open;
    }
    (function addEventsToElements() {
        contentTelas.addEventListener("contextmenu", preventDefaultAction);
        elCursor.addEventListener("contextmenu", preventDefaultAction);
        contentTelas.addEventListener("mousedown", onMouseDown);
        elCursor.addEventListener("mousedown", onMouseDown);
        document.addEventListener("mousemove", functionsMouseMove.onMouseMove);
        janelaPrincipal.addEventListener("mouseleave", cursorTool.invisibleCursor);
        cursorTool.currentSetPosition = cursorTool.setPositionNoPainting;
        getElement("bttModoCursor").addEventListener("mousedown", cursorTool.onClickBttChangeMode);
        cursorTool.changeMode.default();
        getElement("bttMostrarAlteracaoPincel").addEventListener("mousedown", e => {
            // showDashSample = !showDashSample;
            // Array.from(e.currentTarget.getElementsByTagName("span")).first.innerText = showDashSample ? "Sim" : "Não";
        });

        for (const prop in drawingTools.propertiesBar) {
            const { property, contentBar, bar } = drawingTools.propertiesBar[prop];
            property.addEventListener("mouseover", () => {
                if (project.toolInUse) { return; }
                setStyle(contentBar, { height: "33px" });
            });
            property.addEventListener("mouseleave", () => {
                if (project.toolInUse) { return; }
                setStyle(contentBar, { height: null });
                cursorTool.update();
            });
            property.addEventListener("mouseup", () => {
                if (project.toolInUse) { return; }
                project.eventLayer.clearRect(0, 0, project.resolution.width, project.resolution.height);
            });
            bar.addEventListener("input", e => onInputToolPropertiesBar(prop, e));
        }
        for (const toolName in drawingTools.tools) {
            drawingTools.tools[toolName].btt.addEventListener("mousedown", selectDrawingTool.bind(null, toolName));
        }
    })();
    selectDrawingTool("brush");
    return { onZoom, onHotKeys, onOpenColorSelectionWindow, onColorChanged, addObservers: observers.add }
}