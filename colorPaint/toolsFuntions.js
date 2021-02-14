import {
    setStyle, getMousePosition, getElement, getDistanceCoordinates, createCopyCanvas, createElement,
} from "../js/utils.js";

export default function toolsFunctionsObject({ project, drawingTools, screen, contentTelas, janelaPrincipal,
    notification, strokeCoordinates, observers, mousePosition, elCursor, selectDrawingTool, changeToolSize,
    changeToolOpacity, changeToolHardness, applyToolProperties }) {
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
        changeToolMouseUp: () => {
            project.eventLayer.clearRect(0, 0, project.resolution.width, project.resolution.height);
            selectDrawingTool(drawingTools.selectedTool.name);
            return { save: false, inUse: false };
        },
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
            const up = () => toolsFunctions.changeToolMouseUp();
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
            const up = () => toolsFunctions.changeToolMouseUp();
            return { move, down, up }
        })(),
        changeToolHardness: (() => {
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
            const up = () => toolsFunctions.changeToolMouseUp();
            return { move, down, up }
        })(),
    }
    return toolsFunctions;
}