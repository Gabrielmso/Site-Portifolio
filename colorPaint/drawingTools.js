import {
    getImage, preventDefaultAction, throttle, setStyle, getMousePosition, logarithm, getElement,
    getDistanceCoordinates, createEventEmitterToObservers,
} from "../js/utils.js";
import toolsFunctionsObject from "./toolsFuntions.js";

const toolConstructor = (name = "", properties = false) =>
    ({ btt: getElement(name), name, properties: properties ? properties : false });

export default function drawingToolsObject({ project, screen, contentTelas, janelaPrincipal, notification, zoom }) {
    const observers = createEventEmitterToObservers(["toolUsed", "drawInLayer", "setColor"]);
    const elCursor = getElement("cursorFerramenta");
    const mousePosition = {
        txtCursorPosition: getElement("txtPosicaoCursor"), x: 0, y: 0, update: e => {
            const { x, y } = getMousePosition(screen, e);
            mousePosition.x = +(((project.resolution.width / screen.offsetWidth) * x).toFixed(1));
            mousePosition.y = +(((project.resolution.height / screen.offsetHeight) * y).toFixed(1));
            mousePosition.txtCursorPosition.value = Math.ceil(mousePosition.x) + ", " + Math.ceil(mousePosition.y);
        }
    };
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
        toolFunctionName: "brush", previousToolName: "brush", painting: false, showDashSample: true,
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
    const strokeCoordinates = {
        x: [], y: [], length: 0, infoShift: { sizeX: 0, sizeY: 0 },
        add: () => {
            strokeCoordinates.x.push(mousePosition.x);
            strokeCoordinates.y.push(mousePosition.y);
            strokeCoordinates.length++;
        },
        addShiftPressed: () => {
            strokeCoordinates.add();
            const deltaX = strokeCoordinates.x.last - strokeCoordinates.x.first,
                deltaY = strokeCoordinates.y.last - strokeCoordinates.y.first;
            if (strokeCoordinates.infoShift.sizeX < Math.abs(deltaX)) { strokeCoordinates.infoShift.sizeX = Math.abs(deltaX); }
            if (strokeCoordinates.infoShift.sizeY < Math.abs(deltaY)) { strokeCoordinates.infoShift.sizeY = Math.abs(deltaY); }
            if (["rectangle", "ellipse"].includes(drawingTools.selectedTool.name)) {
                if (Math.abs(deltaX) >= Math.abs(deltaY)) {
                    if (deltaX < 0 && deltaY < 0 || deltaX > 0 && deltaY > 0) {
                        strokeCoordinates.y.last = strokeCoordinates.y.first + deltaX;
                    } else if (deltaX < 0 && deltaY > 0 || deltaX > 0 && deltaY < 0) {
                        strokeCoordinates.y.last = strokeCoordinates.y.first - deltaX;
                    }
                } else {
                    if (deltaY < 0 && deltaX < 0 || deltaY > 0 && deltaX > 0) {
                        strokeCoordinates.x.last = strokeCoordinates.x.first + deltaY;
                    } else if (deltaY < 0 && deltaX > 0 || deltaY > 0 && deltaX < 0) {
                        strokeCoordinates.x.last = strokeCoordinates.x.first - deltaY;
                    }
                }
            } else if (strokeCoordinates.infoShift.sizeX >= strokeCoordinates.infoShift.sizeY) {
                for (let i = 0; i <= strokeCoordinates.length; i++) { strokeCoordinates.y[i] = strokeCoordinates.y.first; }
            } else {
                for (let i = 0; i <= strokeCoordinates.length; i++) { strokeCoordinates.x[i] = strokeCoordinates.x.first; }
            }
        },
        currentAdd: null,
        clear() {
            strokeCoordinates.x.clear();
            strokeCoordinates.y.clear();
            strokeCoordinates.infoShift.sizeX = 0;
            strokeCoordinates.infoShift.sizeY = 0;
            strokeCoordinates.length = 0;
        },
        onlyStartEnd() {
            strokeCoordinates.x = [strokeCoordinates.x.first, strokeCoordinates.x.last];
            strokeCoordinates.y = [strokeCoordinates.y.first, strokeCoordinates.y.last];
            strokeCoordinates.length = 2;
            return {
                start: { x: strokeCoordinates.x.first, y: strokeCoordinates.y.first },
                end: { x: strokeCoordinates.x.last, y: strokeCoordinates.y.last }
            };
        },
        onlyFirst() {
            strokeCoordinates.x = [strokeCoordinates.x.first];
            strokeCoordinates.y = [strokeCoordinates.y.first];
            strokeCoordinates.length = 1;
        },
        center() {
            const { offsetHeight, offsetWidth } = contentTelas, midWidth = offsetWidth / 2, midHeight = offsetHeight / 2;
            strokeCoordinates.x = [(project.resolution.width / screen.offsetWidth) * ((midWidth - screen.offsetLeft) + contentTelas.scrollLeft)];
            strokeCoordinates.y = [(project.resolution.height / screen.offsetHeight) * ((midHeight - screen.offsetTop) + contentTelas.scrollTop)];
            strokeCoordinates.length = 1;
        }
    }
    const functionsMouseMove = (() => {
        const arrayFunctions = [mousePosition.update];
        const onMouseMove = throttle(e => { for (const func of arrayFunctions) { func(e); } }, 12);
        document.addEventListener("mousemove", onMouseMove);
        return {
            add(func) {
                if (!arrayFunctions.includes(func)) { arrayFunctions.push(func); }
            },
            remove(func) {
                for (let i = 0; i < arrayFunctions.length; i++) {
                    if (arrayFunctions[i] === func) { arrayFunctions.splice(i, 1); }
                }
            }
        }
    })();
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
                    width: size + "px", height: size + "px", backgroundImage: size < 250 ? "none" : "",
                });
            }
            cursorTool.currentSetPosition(cursorTool.position);
        },
        setPositionNoPainting({ x, y }) {
            this.position.x = x;
            this.position.y = y;
            setStyle(elCursor, { top: y - this.halfSize + "px", left: x - this.halfSize + "px" });
            const { left, top, width, height } = cursorTool.contentTelasInfo;
            if (x < left || x > left + width || y < top || y > top + height) { cursorTool.invisibleCursor(); }
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
        visibleCursor: () => setStyle(elCursor, { display: "block" }),
        onClickBttChangeMode: e => {
            cursorTool.mode = cursorTool.mode === "simple" ? "default" : "simple";
            Array.from(e.currentTarget.getElementsByTagName("span")).first.innerText =
                cursorTool.mode === "simple" ? "Simples" : "Padrão";
            cursorTool.changeMode[cursorTool.mode]();
            cursorTool.update();
        },
        update: (() => {
            const paintBucket = getImage("./colorPaint/imagens/cursor/cursorBaldeDeTinta.png");
            const eyeDropper = getImage("./colorPaint/imagens/cursor/cursorContaGotas.png");
            const crossHair = getImage("./colorPaint/imagens/cursor/crossHair.png");
            const circle = getImage("./colorPaint/imagens/cursor/circle.png");
            return () => {
                setStyle(contentTelas, { cursor: "none" });
                const size = drawingTools.selectedTool.size * (screen.offsetWidth / project.resolution.width);
                if (cursorTool.mode === "default") {
                    elCursor.classList.remove("bordaCursor");
                    setStyle(elCursor, { width: "500px", height: "500px", backgroundImage: "none", cursor: "none" });
                    cursorTool.halfSize = 250;
                    if (drawingTools.toolFunctionName === "eyeDropper") {
                        setStyle(elCursor, { cursor: "url('" + eyeDropper.src + "') 0 20, pointer" });
                        return;
                    } else if (drawingTools.toolFunctionName === "paintBucket") {
                        setStyle(elCursor, { cursor: "url('" + paintBucket.src + "') 0 0, pointer" });
                        return;
                    } else if (drawingTools.toolFunctionName === "moveScreen") {
                        setStyle(elCursor, { cursor: "grab" });
                        return;
                    }
                    cursorTool.setSize(size);
                } else {
                    if (drawingTools.toolFunctionName === "eyeDropper") {
                        setStyle(contentTelas, { cursor: "url('" + eyeDropper.src + "') 0 20, pointer" });
                        return;
                    } else if (drawingTools.toolFunctionName === "paintBucket") {
                        setStyle(contentTelas, { cursor: "url('" + paintBucket.src + "') 0 0, pointer" });
                        return;
                    } else if (drawingTools.toolFunctionName === "moveScreen") {
                        setStyle(contentTelas, { cursor: "grab" });
                        return;
                    }
                    setStyle(contentTelas, {
                        cursor: size < 20 ? "url('" + crossHair.src + "') 12.5 12.5 , pointer" :
                            "url('" + circle.src + "') 10 10 , pointer"
                    });
                }
            }
        })(),
        center() {
            if (cursorTool.mode === "simple") { return; }
            const { width, height, left, top } = cursorTool.contentTelasInfo;
            cursorTool.setPositionPainting({ x: left + (width / 2), y: top + (height / 2) });
        },
        onWheelWithShift({ deltaY }) { contentTelas.scrollLeft += deltaY < 0 ? -contentTelas.offsetWidth / 9 : contentTelas.offsetWidth / 9; },
        onWheelNoShift({ deltaY }) { contentTelas.scrollTop += deltaY < 0 ? -contentTelas.offsetHeight / 9 : contentTelas.offsetHeight / 9; },
        currentOnWheel: null,
    }
    const changeToolSizeBar = (value, change = false) => {
        if (drawingTools.selectedTool.size === undefined) { return; }
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
        if (drawingTools.selectedTool.opacity === undefined) { return; }
        value = value <= 0.01 ? 0.01 : value >= 1 ? 1 : value;
        const percentage = Math.round((value * 100));
        drawingTools.propertiesBar.opacity.txt.value = percentage + "%";
        drawingTools.tools[drawingTools.selectedTool.name].properties.opacity =
            drawingTools.propertiesBar.opacity.bar.value = drawingTools.selectedTool.opacity = value;
    }
    const changeToolHardness = value => {
        if (drawingTools.selectedTool.hardness === undefined) { return; }
        value = value <= 0 ? 0 : value >= 1 ? 1 : value;
        const percentage = Math.round((value * 100));
        drawingTools.propertiesBar.hardness.txt.value = percentage + "%";
        drawingTools.tools[drawingTools.selectedTool.name].properties.hardness =
            drawingTools.propertiesBar.hardness.bar.value = drawingTools.selectedTool.hardness = value;
    }
    const changeToolForce = value => {
        if (drawingTools.selectedTool.force === undefined) { return; }
        value = value <= 0 ? 0 : value >= 1 ? 1 : value;
        const percentage = Math.round((value * 100));
        drawingTools.propertiesBar.force.txt.value = percentage + "%";
        drawingTools.tools[drawingTools.selectedTool.name].properties.force =
            drawingTools.propertiesBar.force.bar.value = drawingTools.selectedTool.force = value;
    }
    const selectDrawingTool = (() => {
        const setSelectedToolProperties = properties => {
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
        dureza = dureza < 0.06 ? 0 : dureza;
        project.eventLayer.clearRect(0, 0, project.resolution.width, project.resolution.height);
        project.eventLayer.lineJoin = project.eventLayer.lineCap = "round";
        project.eventLayer.filter = "blur(" + dureza + "px)";
        project.eventLayer.lineWidth = (size - (dureza * 2));
        project.eventLayer.globalAlpha = opacity;
        project.eventLayer.strokeStyle = project.eventLayer.fillStyle = "rgb(" + r + ", " + g + ", " + b + ")";
    };
    const toolsFunctions = toolsFunctionsObject({
        project, drawingTools, screen, contentTelas, janelaPrincipal, elCursor, notification,
        strokeCoordinates, observers, mousePosition, selectDrawingTool, changeToolSize, changeToolOpacity,
        changeToolHardness, applyToolProperties
    });
    const showDashSample = () => {
        if (!drawingTools.showDashSample) { return; }
        cursorTool.update();
        applyToolProperties();
        project.eventLayer.strokeStyle = "rgb(0, 0, 255)";
        strokeCoordinates.center();
        toolsFunctions.brush.down();
        strokeCoordinates.clear();
    }
    const onInputToolPropertiesBar = (() => {
        const properties = {
            size: e => changeToolSizeBar(+((+(e.currentTarget.value)).toFixed(2))),
            opacity: e => changeToolOpacity(+((+(e.currentTarget.value)).toFixed(2))),
            hardness: e => changeToolHardness(+((+(e.currentTarget.value)).toFixed(2))),
            force: e => changeToolForce(+((+(e.currentTarget.value)).toFixed(2)))
        }
        return (propertyName, e) => {
            properties[propertyName](e);
            showDashSample();
        };
    })();
    const onMouseDown = (() => {
        const onMouseMove = e => {
            strokeCoordinates.currentAdd();
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
            strokeCoordinates.currentAdd();
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
        const onWheelZoom = e => {
            preventDefaultAction(e);
            if (e.deltaY < 0) { zoom(true, false, 1.10); }
            else { zoom(false, false, 1.10); }
            const { x, y } = getMousePosition(contentTelas, e);
            const proporcaoPosY = mousePosition.y / project.resolution.height;
            const proporcaoPosX = mousePosition.x / project.resolution.width;
            contentTelas.scrollTop = (contentTelas.scrollHeight * proporcaoPosY) - y;
            contentTelas.scrollLeft = (contentTelas.scrollWidth * proporcaoPosX) - x;
        }
        const ctrlDown = () => {
            if (info.ctrlPressed) { return; }
            info.ctrlPressed = true;
            selectDrawingTool("eyeDropper");
            janelaPrincipal.addEventListener("wheel", onWheelZoom);
        }
        const ctrlUp = () => {
            info.ctrlPressed = false;
            selectDrawingTool(drawingTools.previousToolName);
            cursorTool.update();
            janelaPrincipal.removeEventListener("wheel", onWheelZoom);
        }
        const shiftDown = () => {
            if (info.shiftPressed) { return; }
            info.shiftPressed = true;
            strokeCoordinates.currentAdd = strokeCoordinates.addShiftPressed;
            cursorTool.currentOnWheel = cursorTool.onWheelWithShift;
        };
        const shiftUp = () => {
            project.toolInUse = info.shiftPressed = false;
            selectDrawingTool(drawingTools.selectedTool.name);
            strokeCoordinates.currentAdd = strokeCoordinates.add;
            cursorTool.currentOnWheel = cursorTool.onWheelNoShift;
        }
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
            ControlLeft: ctrlDown, ControlRight: ctrlDown, ShiftLeft: shiftDown, ShiftRight: shiftDown,
            Shift: e => {
                if (info.shiftPressed) { return; }
                info.shiftPressed = true;
                selectDrawingTool(drawingTools.selectedTool.name);
            },
            KeyA: () => drawingTools.toolFunctionName = "changeToolSize",
            KeyS: () => drawingTools.toolFunctionName = "changeToolOpacity",
            KeyD: () => drawingTools.toolFunctionName = "changeToolHardness",
        }
        const keyUp = {
            ControlLeft: ctrlUp, ControlRight: ctrlUp, ShiftLeft: shiftUp, ShiftRight: shiftUp,
            KeyA: shiftUp, KeyS: shiftUp, KeyD: shiftUp,
            Space: () => {
                project.toolInUse = info.spacePressed = false;
                selectDrawingTool(drawingTools.selectedTool.name);
                cursorTool.update();
            },
        }
        return ({ pressed, e }) => {
            let fn = pressed ? keyDown[e.code] : keyUp[e.code];
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
        janelaPrincipal.addEventListener("mouseleave", cursorTool.invisibleCursor);
        elCursor.addEventListener("wheel", e => cursorTool.currentOnWheel(e), { passive: true });
        contentTelas.addEventListener("wheel", e => cursorTool.currentOnWheel(e), { passive: true });
        cursorTool.currentSetPosition = cursorTool.setPositionNoPainting;
        cursorTool.currentOnWheel = cursorTool.onWheelNoShift;
        strokeCoordinates.currentAdd = strokeCoordinates.add;
        getElement("bttModoCursor").addEventListener("mousedown", cursorTool.onClickBttChangeMode);
        cursorTool.changeMode.default();
        getElement("bttMostrarAlteracaoPincel").addEventListener("mousedown", e => {
            drawingTools.showDashSample = !drawingTools.showDashSample;
            Array.from(e.currentTarget.getElementsByTagName("span")).first.innerText =
                drawingTools.showDashSample ? "Ativado" : "Desativado";
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