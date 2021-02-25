import {
    preventDefaultAction, setStyle, getElement, createElement, getImage,
    createEventEmitterToObservers, cloneElement, delay, openWindowBackgroundBlur
} from "../js/utils.js";
import hotKeysObject from "./hotKeys.js";
import drawingToolsObject from "./drawingTools.js";
import undoRedoChangeObject from "./undoRedoChange.js";
import scrollsContentTelasObject from "./scrollsContentTelas.js";
import previewFunctionsObject from "./previewFunctions.js";
import colorsAppObject from "./colorsApp.js";
import notificationObject from "../notifications/notifications.js";
import createProjectWindowObject from "./createProjectWindow.js";
import createGridWindowObject from "./createGridWindow.js";

export default function appObject() {
    const observers = createEventEmitterToObservers(["zoom", "readyProject", "drawingChanged"]);
    const project = {
        name: null, resolution: { width: 0, height: 0, proportion: 0 }, barRightMode: "default",
        background: false, numLayers: 0, layers: [], previousLayer: null, selectedLayer: null,
        zoom: 100, eventLayer: getElement("pintar").getContext("2d"), toolInUse: false,
        get drawComplete() {
            const ctxCanvas = cloneElement(project.eventLayer.canvas).getContext("2d");
            const { width, height } = project.resolution;
            if (project.background) {
                ctxCanvas.globalAlpha = 1;
                ctxCanvas.fillStyle = "rgb(" + project.background.r + ", " + project.background.g + ", " + project.background.b + ")";
                ctxCanvas.fillRect(0, 0, width, height);
            }
            for (const { layer, visible, opacity } of project.layers) {
                if (!visible) { continue; }
                ctxCanvas.globalAlpha = opacity;
                ctxCanvas.drawImage(layer.canvas, 0, 0, width, height);
            }
            return ctxCanvas;
        }
    }
    const txtPorcentagemZoom = getElement("txtPorcentagemZoom");
    const barRight = getElement("barraLateralDireita");
    const janelaPrincipal = getElement("colorPaintContent");
    const contentTelas = getElement("contentTelas");
    const screen = getElement("telasCanvas");
    const contentTelasPreview = getElement("contentTelaPreview");
    const txtProjectName = getElement("nomeDoProjeto");
    const notification = notificationObject();
    const colors = colorsAppObject({ project, notification, janelaPrincipal, });
    const createProjectWindow = createProjectWindowObject({ notification, colors });
    const layerOpacityBar = {
        content: getElement("contentBarraOpacidadeCamada"),
        bar: getElement("barraOpacidadeCamada"), mousedown: false,
    }
    const zoom = (zoom, centralize, value) => {
        if (project.toolInUse) { return; }
        const previousWidth = screen.offsetWidth, { width, proportion } = project.resolution;
        let larguraAtual = zoom === "porcentagem" ? width * value / 100 : zoom ? previousWidth * value : previousWidth / value;
        larguraAtual = larguraAtual <= 25 ? 25 : larguraAtual >= width * 32 ? width * 32 : larguraAtual;
        const alturaAtual = (larguraAtual / proportion);
        setStyle(screen, { width: larguraAtual + "px", height: alturaAtual + "px" });
        const { offsetHeight, offsetWidth } = contentTelas;
        const [scrollHeight, scrollWidth] = [screen.offsetHeight + 12, screen.offsetWidth + 12];
        setStyle(screen, scrollWidth > offsetWidth ? { left: "0px", marginBottom: "0px" } :
            { left: (((offsetWidth - 6) / 2) - (larguraAtual / 2)) + "px", marginBottom: null });
        setStyle(screen, scrollHeight > offsetHeight ? { top: "0px", marginRight: "6px" } :
            { top: (((offsetHeight - 6) / 2) - (alturaAtual / 2)) + "px", marginRight: null });
        if (centralize) {
            contentTelas.scrollTop = (scrollHeight / 2) - (offsetHeight / 2);
            contentTelas.scrollLeft = (scrollWidth / 2) - (offsetWidth / 2);
        }
        project.zoom = ((larguraAtual * 100) / width);
        txtPorcentagemZoom.value = project.zoom.toFixed(2).replace(".", ",") + "%";
        observers.notify("zoom", project.zoom);
    }
    const adjustInVisualizationScreen = () => {
        const { width, height, proportion } = project.resolution, maxWidth = contentTelas.offsetWidth - 7,
            maxHeight = contentTelas.offsetHeight - 7, proportionContent = maxWidth / maxHeight,
            zoomAdjusted = proportion >= proportionContent ? +(((maxWidth * 100) / width).toFixed(2)) : +(((maxHeight * 100) / height).toFixed(2));
        zoom("porcentagem", false, zoomAdjusted);
    }
    const createGridWindow = createGridWindowObject({ notification, project, contentTelas, adjustInVisualizationScreen, zoom });
    const adjustScreen = () => {
        const maxWidth = contentTelas.offsetWidth - 7, maxHeight = contentTelas.offsetHeight - 7;
        if (project.resolution.width >= maxWidth || project.resolution.height >= maxHeight) {
            adjustInVisualizationScreen();
        } else { zoom("porcentagem", false, 100); }
    }
    const setBackgroundColorProject = color => {
        const style = { background: color ? "rgb(" + color.r + ", " + color.g + ", " + color.b + ")" : null }
        setStyle(screen, style);
        setStyle(contentTelasPreview, style);
        for (const { canvasIcons } of project.layers) {
            for (const { canvas } of canvasIcons) { setStyle(canvas.parentElement, style) }
        }
    }
    const changeOpacitySelectedLayer = value => {
        if (!project.selectedLayer.visible || project.toolInUse) { return; }
        value = value < 0.01 ? 0.01 : value > 1 ? 1 : value;
        project.selectedLayer.txtOpacity.value = Math.floor((value * 100)) + "%";
        setStyle(project.selectedLayer.layer.canvas, { opacity: value });
        setStyle(project.selectedLayer.layerPreview.canvas, { opacity: value });
        for (const canvasIcon of project.selectedLayer.canvasIcons) {
            setStyle(canvasIcon.canvas, { opacity: value });
        }
        project.selectedLayer.opacity = value;
    }
    const selectLayer = numLayer => {
        if (!project.layers[numLayer].visible || project.toolInUse) { return; }
        project.selectedLayer = project.layers[numLayer];
        project.selectedLayer.icons.first.classList.add("camadaSelecionada");
        project.selectedLayer.icons.last.classList.add("camadaSelecionadaMini");
        for (let i = 0; i < project.numLayers; i++) {
            if (i !== numLayer) {
                project.layers[i].icons.first.classList.remove("camadaSelecionada");
                project.layers[i].icons.last.classList.remove("camadaSelecionadaMini");
            }
        }
        setStyle(project.eventLayer.canvas, { zIndex: ((numLayer + 1) * 2) + 1 });
        layerOpacityBar.bar.value = project.selectedLayer.opacity;
    }
    const setLayerVisibility = numLayer => {
        if (project.toolInUse) { return; }
        project.layers[numLayer].visible = !project.layers[numLayer].visible;
        if (project.layers[numLayer].visible) {
            setStyle(project.layers[numLayer].layer.canvas, { display: "block" });
            setStyle(project.layers[numLayer].layerPreview.canvas, { display: "block" });
            for (const bttLook of project.layers[numLayer].bttsLook) {
                bttLook.classList.replace("invisivel", "visivel");
            }
            selectLayer(numLayer);
        } else {
            setStyle(project.layers[numLayer].layer.canvas, { display: "none" });
            setStyle(project.layers[numLayer].layerPreview.canvas, { display: "none" });
            for (const bttLook of project.layers[numLayer].bttsLook) {
                bttLook.classList.replace("visivel", "invisivel");
            }
            project.layers[numLayer].icons.first.classList.remove("camadaSelecionada");
            project.layers[numLayer].icons.last.classList.remove("camadaSelecionadaMini");
            for (let i = 0; i < project.numLayers; i++) {
                if (i != numLayer && project.layers[numLayer] === project.selectedLayer && project.layers[i].visible) {
                    selectLayer(i);
                    break;
                }
            }
        }
    }
    const drawInIcons = layer => {
        for (const canvasIcon of layer.canvasIcons) {
            const { width, height } = canvasIcon.canvas
            canvasIcon.clearRect(0, 0, width, height);
            canvasIcon.drawImage(layer.layerPreview.canvas, 0, 0, width, height);
        }
    }
    const drawInPreview = layer => {
        const { width, height } = layer.layerPreview.canvas
        layer.layerPreview.clearRect(0, 0, width, height);
        layer.layerPreview.drawImage(layer.layer.canvas, 0, 0, width, height);
        drawInIcons(layer);
    }
    const drawInLayer = (layer, draw) => {
        const { width, height } = project.resolution;
        layer.layer.drawImage(draw, 0, 0, width, height);
        drawInPreview(layer);
    }
    const drawInSelectedLayer = () => drawInLayer(project.selectedLayer, project.eventLayer.canvas);
    const applyToolChange = () => {
        observers.notify("drawingChanged");
        drawInSelectedLayer();
    }
    const onRestoreChange = ({ layerChanged, change }) => {
        for (let i = 0; i < project.numLayers; i++) {
            if (layerChanged === project.layers[i]) {
                selectLayer(i);
                if (!layerChanged.visible) { setLayerVisibility(i) }
                layerChanged.layer.clearRect(0, 0, project.resolution.width, project.resolution.height);
                layerChanged.layer.drawImage(change, 0, 0, project.resolution.width, project.resolution.height);
                drawInPreview(layerChanged);
                break;
            }
        }
    }
    const createNewLayer = (() => {
        let mouseInBttLook = false, idIntervalToShowLayerSample = 0;
        const contentIconLayers = getElement("contentIconeCamadas"), contentMiniIconLayers = getElement("barraLateralMini");
        const layerSampleWindow = {
            window: getElement("janelaDeAmostraDaCamada"), timeTransition: 160,
            screen: getElement("canvasAmostraDacamada").getContext("2d"),
            arrow: getElement("setaJanelaDeAmostra"),
            width: 0, height: 0,
            adjustSize({ width, height }) {
                this.width = (Math.floor(width * 2.1)) + 20;
                this.height = (Math.floor(height * 2.1)) + 20;
                this.screen.canvas.width = this.width * 2;
                this.screen.canvas.height = this.height * 2;
                setStyle(this.screen.canvas, { width: (this.width - 20) + "px", height: (this.height - 20) + "px" });
            },
            open(layer, icon) {
                const { top, left, height } = icon.getBoundingClientRect();
                const { top: topBar } = barRight.getBoundingClientRect();
                let topWindow = (top - (this.height - height));
                topWindow = topWindow < topBar ? topBar : topWindow;
                setStyle(this.arrow, { top: (-14 + top - topWindow + (height / 2)) + "px" });
                setStyle(this.window, {
                    display: "block", top: topWindow + "px", left: (left - (this.width + 13)) + "px"
                });
                this.screen.clearRect(0, 0, this.screen.canvas.width, this.screen.canvas.height);
                this.screen.drawImage(layer, 0, 0, this.screen.canvas.width, this.screen.canvas.height);
                setTimeout(() => setStyle(this.window, { opacity: "1" }), 5);
            },
            close() {
                setStyle(this.window, { opacity: null });
                setTimeout(() => setStyle(this.window, { display: null }), this.timeTransition);
            },
        }
        const changeOrderLayers = (from, to) => {
            project.layers.move(from, to);
            contentMiniIconLayers.textContent = contentIconLayers.textContent = "";
            for (let i = 1; i <= project.numLayers; i++) {
                const { layer, layerPreview, icons: [icon, iconMini] } = project.layers[i - 1];
                setStyle(layer.canvas, { zIndex: (i * 2) });
                setStyle(layerPreview.canvas, { zIndex: (i * 2) });
                contentIconLayers.insertBefore(icon, contentIconLayers.firstElementChild);
                contentMiniIconLayers.insertBefore(iconMini, contentMiniIconLayers.firstElementChild);
            }
            selectLayer(to);
        }
        const createLayerPreview = (() => {
            const proportionMaxSpace = 256 / 150;
            return numLayer => {
                const { width, height } = project.resolution.proportion >= proportionMaxSpace ?
                    { width: 256, height: Math.round(256 / project.resolution.proportion) } :
                    { width: Math.round(150 * project.resolution.proportion), height: 150 }

                const style = "z-index: " + (numLayer * 2) + "; width: " + width + "px; height: " + height + "px; ";
                const layerPreview = createElement("canvas", {
                    "data-id": "previewLayer" + numLayer,
                    class: "preview", style, width: Math.round(width * 2), height: Math.round(height * 2)
                });
                contentTelasPreview.appendChild(layerPreview);
                setStyle(contentTelasPreview, { width: width + "px", height: height + "px" });
                layerSampleWindow.adjustSize({ width, height });
                return layerPreview.getContext("2d");
            }
        })();
        const createIconLayer = (() => {
            const proportionMaxSpace = 80 / 60, proportioMaxSizeMini = 100 / 75;
            return numLayer => {
                const makeId = id => id + numLayer;
                const idIcon = makeId("camadaIcone");
                const idBttLook = makeId("visivel");
                const idTxtNameLayer = makeId("nomeCamada");
                const idTxtOpacity = makeId("txtOpacidade");
                const idCanvasIcon = makeId("canvasIcone");
                const { width, height } = project.resolution.proportion >= proportionMaxSpace ?
                    { width: 80, height: Math.round(80 / project.resolution.proportion) } :
                    { width: Math.round(60 * project.resolution.proportion), height: 60 };
                const styleSizeCanvasIcon = "width: " + width + "px; height: " + height + "px;";
                contentIconLayers.insertAdjacentHTML("afterbegin",
                    `<div data-id="${idIcon}" class="iconeCamada" draggable="true">
                        <div data-id="${idBttLook}" class="iconVer visivel cursor"></div>
                        <label>
                            <span data-id="${idTxtNameLayer}">Camada ${numLayer}</span><br>
                            <span>Opacidade: </span>
                            <input type="text" data-id="${idTxtOpacity}" readonly="true" class="opacidadeCamada" value="100%">
                        </label>
                        <div class="contentIcon">
                            <div>
                                <canvas data-id="${idCanvasIcon}" style="${styleSizeCanvasIcon}" class="iconTela" 
                                width="${width * 2}" height="${height * 2}"></canvas>
                            </div>
                        </div>
                    </div>`);
                contentIconLayers.scrollTop = contentIconLayers.scrollHeight;

                const { widthMini, heightMini } = project.resolution.proportion >= proportioMaxSizeMini ?
                    { widthMini: 100, heightMini: Math.round(100 / project.resolution.proportion) } :
                    { widthMini: Math.round(75 * project.resolution.proportion), heightMini: 75 };
                const idIconMini = makeId("camadaIconeMini");
                const idBttLookMini = makeId("visivelMini");
                const idCanvasIconMini = makeId("canvasIconeMini");
                const styleSizeCanvasIconMini = "width: " + widthMini + "px; height: " + heightMini + "px;";
                contentMiniIconLayers.insertAdjacentHTML("afterbegin",
                    `<div data-id="${idIconMini}" class="iconeCamadaMini" draggable="true">
                        <div data-id="${idBttLookMini}" class="iconVerMini visivel cursor"></div>
                        <canvas data-id="${idCanvasIconMini}" style="${styleSizeCanvasIconMini}"
                        width="${widthMini * 2}" height="${heightMini * 2}"></canvas>
                    </div>`);
                contentMiniIconLayers.scrollTop = contentMiniIconLayers.scrollHeight;

                const icon = getElement(idIcon), iconMini = getElement(idIconMini),
                    bttLook = getElement(idBttLook), bttLookMini = getElement(idBttLookMini),
                    canvasIcon = getElement(idCanvasIcon), canvasIconMini = getElement(idCanvasIconMini),
                    txtLayerName = getElement(idTxtNameLayer), txtOpacity = getElement(idTxtOpacity);

                return {
                    icons: icon && iconMini ? [icon, iconMini] : null,
                    bttsLook: bttLook && bttLookMini ? [bttLook, bttLookMini] : null,
                    canvasIcons: canvasIcon && canvasIconMini ? [canvasIcon.getContext("2d"),
                    canvasIconMini.getContext("2d")] : null, txtLayerName, txtOpacity,
                }
            }
        })();
        const createLayer = numLayer => {
            const style = "z-index: " + (numLayer * 2) + ";";
            const { height, width } = project.resolution;
            const layer = createElement("canvas", {
                "data-id": ("telaCamada" + numLayer), class: "telaCanvas", style, height, width
            });
            screen.appendChild(layer);
            return layer.getContext("2d");
        }
        const getNumLayerByMouseInIcon = elIcon => {
            for (let i = 0; i < project.numLayers; i++) {
                if (project.layers[i].icons.includes(elIcon)) { return i; }
            }
            return -1;
        }
        const showLayerSample = e => {
            const el = e.currentTarget;
            const numLayer = getNumLayerByMouseInIcon(el);
            project.layers[numLayer].cursorInIcon = true;
            idIntervalToShowLayerSample = setTimeout(() => {
                if (mouseInBttLook || !project.layers[numLayer].cursorInIcon) { return; }
                layerSampleWindow.open(project.layers[numLayer].layer.canvas, el);
            }, 750)
        }
        const closeLayerSample = e => {
            clearTimeout(idIntervalToShowLayerSample);
            const numLayer = getNumLayerByMouseInIcon(e.currentTarget);
            project.layers[numLayer].cursorInIcon = false;
            layerSampleWindow.close();
        }
        const onMouseLeaveBttLook = () => mouseInBttLook = false;
        const onMouseEnterBttLook = () => mouseInBttLook = true;
        const onClickBttLook = e => {
            const bttLook = e.currentTarget;
            for (let i = 0; i < project.numLayers; i++) {
                if (project.layers[i].bttsLook.includes(bttLook)) {
                    setLayerVisibility(i);
                    break;
                }
            }
            e.stopPropagation();
        };
        const onClickIcon = e => {
            selectLayer(getNumLayerByMouseInIcon(e.currentTarget));
            e.stopPropagation();
        }
        const onDoubleClickIcon = e => {
            const numLayer = getNumLayerByMouseInIcon(e.currentTarget)
            if (project.layers[numLayer].visible || mouseInBttLook) { return; }
            notification.open({
                type: "notify", timeNotify: 2000, title: "Aviso!",
                message: "Não é possível selecionar uma camada invisível."
            });
        }
        const onDropIcon = e => {
            const txt = e.dataTransfer.getData("text/plain");
            if (!txt.includes("layer")) { return; }
            const numFrom = +(txt.replace("layer", ""));
            const numTo = getNumLayerByMouseInIcon(e.currentTarget);
            if (isNaN(numFrom) || numFrom < 0 || numTo < 0 || numFrom > project.numLayers ||
                numTo > project.numLayers || numFrom === numTo) { return; }
            changeOrderLayers(numFrom, numTo);
        }
        const onDragStartIcon = e => {
            closeLayerSample(e);
            e.dataTransfer.dropEffect = e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", ("layer" + getNumLayerByMouseInIcon(e.currentTarget)));
        }
        return () => {
            const numLayer = project.layers.length + 1;
            const layer = createLayer(numLayer);
            const newIcon = createIconLayer(numLayer);
            const layerPreview = createLayerPreview(numLayer);
            const objLayer = { ...newIcon, layer, layerPreview, opacity: 1, visible: true, cursorInIcon: false }
            for (const prop in objLayer) { if (objLayer[prop] === null) { return false; } }
            for (const bttLook of objLayer.bttsLook) {
                bttLook.addEventListener("mouseenter", onMouseEnterBttLook);
                bttLook.addEventListener("mousedown", onClickBttLook);
                bttLook.addEventListener("mouseleave", onMouseLeaveBttLook);
            }
            for (const icon of objLayer.icons) {
                icon.addEventListener("mouseenter", showLayerSample);
                icon.addEventListener("mousedown", onClickIcon);
                icon.addEventListener("dblclick", onDoubleClickIcon);
                icon.addEventListener("mouseleave", closeLayerSample);
                icon.addEventListener("dragstart", onDragStartIcon);
                icon.addEventListener("drop", onDropIcon);
            }
            return objLayer;
        };
    })();
    const createProject = ({ name, resolution: { width, height }, background, numLayers }) => {
        txtProjectName.innerText = project.name = name;
        project.resolution = { width, height, proportion: (width / height) };
        project.background = background;
        project.numLayers = numLayers;
        while (project.numLayers > project.layers.length) {
            const objLayer = createNewLayer();
            if (objLayer) { project.layers.push(objLayer); }
        }
        setBackgroundColorProject(background);
        adjustScreen();
        project.eventLayer.canvas.width = width;
        project.eventLayer.canvas.height = height;
        getElement("txtResolucao").value = width + ", " + height;
        selectLayer(0);
        return true;
    }
    const loadProject = objProjeto => {
        const erro = () => notification.open({
            type: "notify", timeNotify: 4000, title: "Erro!",
            message: "Não foi possível carregar o projeto!"
        });
        const arrayPropertiesNames =
            ["name", "resolution", "background", "savedColors", "grid", "numLayers", "layersData"];
        for (const propName of arrayPropertiesNames) {
            if (!objProjeto[propName]) {
                erro();
                return false;
            }
        }
        createProject(objProjeto);
        for (let i = 0; i < project.numLayers; i++) {
            const { data, opacity, visible } = objProjeto.layersData[i];
            if ([data, opacity, visible].includes(undefined)) { erro(); return false; }
            selectLayer(i);
            changeOpacitySelectedLayer(opacity);
            getImage("data:image/png;base64," + data, e => {
                drawInLayer(project.layers[i], e.currentTarget);
                if (!visible) { setLayerVisibility(i); };
            });
        }
        selectLayer(0);
        for (let i = 0; i < objProjeto.savedColors.length; i++) { colors.save(objProjeto.savedColors[i]); }
        createGridWindow.createGrid = objProjeto.grid;
        return true;
    }
    const saveProject = () => {
        const dadosCamadas = [], coresSalvasProjeto = [];
        for (let i = 0; i < project.numLayers; i++) {
            const { layer, visible, opacity } = project.layers[i];
            dadosCamadas[i] = {
                data: layer.canvas.toDataURL("imagem/png").replace("data:image/png;base64,", ""),
                opacity, visible
            };
        }
        const savedColors = colors.savedColors;
        for (let i = 0; i < savedColors.length; i++) { coresSalvasProjeto[i] = savedColors[i].rgb; }
        const objProjeto = {
            name: project.name, resolution: project.resolution,
            background: project.background, savedColors: coresSalvasProjeto,
            grid: createGridWindow.gridProperties,
            numLayers: project.numLayers, layersData: dadosCamadas
        }
        const url = URL.createObjectURL(new Blob([JSON.stringify(objProjeto)], { type: "application/json" }));
        const a = createElement("a", { download: project.name + ".gm", href: url });
        a.click();
        URL.revokeObjectURL(url);
    }
    const saveDraw = () => project.drawComplete.canvas.toBlob(b => {
        const a = createElement("a", { download: project.name + ".png", href: URL.createObjectURL(b) });
        a.click();
        a.remove();
    }, "image/png", 1);
    const onHotKeys = (() => {
        const withCtrl = {
            Digit0: adjustInVisualizationScreen,
            Digit1: zoom.bind(null, "porcentagem", true, 100),
            Minus: zoom.bind(null, false, true, 1.25),
            Equal: zoom.bind(null, true, true, 1.25),
        }
        return ({ pressed, e }) => {
            if (!pressed) { return }
            const fn = e.ctrlKey ? withCtrl[e.code] : false;
            if (!fn) { return; }
            preventDefaultAction(e);
            fn();
        }
    })();
    const barSimple = getElement("barraLateralMini");
    const barDefault = getElement("barraLateralCompleta");
    const onMouseDownBttSwitchBarRight = e => {
        const modeDefault = (project.barRightMode === "default");
        project.barRightMode = modeDefault ? "simple" : "default";
        e.currentTarget.innerHTML = !modeDefault ? "&#9658" : "&#9668";
        setStyle(barSimple, { display: !modeDefault ? "none" : "block" });
        setStyle(barDefault, { display: !modeDefault ? "block" : "none" });
        setTimeout(() => {
            zoom("porcentagem", false, project.zoom);
            contentTelas.scrollTop = contentTelas.scrollTop - 1;
            contentTelas.scrollTop = contentTelas.scrollTop + 1;
        }, 5);
    }
    const bttSwitchBarRight = getElement("bttAlternarBarraLateralDireita");
    const onCLickCreateProject = createProjectWindow.open.bind(null, "create");
    const bttCreateNewProject = getElement("bttCriarNovoProjeto");
    const replaceBttCreateNewProject = () => {
        bttCreateNewProject.remove();
        const bttCreateProject = getElement("bttNovoProjeto");
        setStyle(bttCreateProject, { display: null });
        bttCreateProject.addEventListener("mousedown", onCLickCreateProject);
    }
    const readyProject = () => {
        replaceBttCreateNewProject();
        const hotKeys = hotKeysObject();
        const drawingTools = drawingToolsObject({ project, screen, contentTelas, janelaPrincipal, notification, zoom });
        const scrollsContentTelas = scrollsContentTelasObject({ contentTelas, screen });
        const previewFunctions = previewFunctionsObject({ project, contentTelasPreview, contentTelas });
        const undoRedoChange = undoRedoChangeObject({ project });

        observers.add("zoom", [previewFunctions.onZoom, drawingTools.onZoom, scrollsContentTelas.onZoom]);
        observers.add("drawingChanged", [undoRedoChange.saveChanges]);

        hotKeys.addObservers("hotKey", [onHotKeys, drawingTools.onHotKeys, undoRedoChange.onHotKeys]);

        undoRedoChange.addObservers("restoreChange", [onRestoreChange]);

        colors.addObservers("openColorSelectionWindow", [drawingTools.onOpenColorSelectionWindow]);
        colors.addObservers("colorChanged", [drawingTools.onColorChanged]);

        drawingTools.addObservers("setColor", [colors.setColor]);
        drawingTools.addObservers("toolUsed", [applyToolChange]);
        drawingTools.addObservers("drawInLayer", [drawInSelectedLayer]);

        txtPorcentagemZoom.addEventListener("keyup", e => {
            if (e.code !== "Enter") { return }
            const valor = parseFloat(((e.currentTarget.value).replace("%", "")).replace(",", "."));
            if (!isNaN(valor) && valor >= 1) { zoom("porcentagem", true, valor); }
        });

        for (let i = 1; i <= 2; i++) { drawingTools.onColorChanged({ plane: i, color: colors.get(i) }); }
        getElement("bttZoomMais").addEventListener("mousedown", zoom.bind(null, true, true, 1.25));
        getElement("bttZoomMenos").addEventListener("mousedown", zoom.bind(null, false, true, 1.25));

        getElement("bttSalvarDesenho").addEventListener("mousedown", saveDraw);
        getElement("bttSalvarProjeto").addEventListener("mousedown", saveProject);

        getElement("bttCriarGrade").addEventListener("mousedown", createGridWindow.open);

        bttSwitchBarRight.addEventListener("mousedown", onMouseDownBttSwitchBarRight);
        setStyle(layerOpacityBar.content, { display: "flex" });

        layerOpacityBar.bar.addEventListener("input", e =>
            changeOpacitySelectedLayer(+((+(e.currentTarget.value)).toFixed(2))));
        window.addEventListener("resize", () => zoom("porcentagem", false, project.zoom));
        window.addEventListener("beforeunload", e => {
            preventDefaultAction(e);
            e.returnValue = 'Tem certeza que quer sair da página?';
        });
    }
    const onCreateProject = (() => {
        const modeFunction = { create: createProject, load: loadProject }
        return ({ mode, obj }) => {
            const fn = modeFunction[mode];
            if (fn && fn(obj)) { readyProject(); }
        }
    })();

    bttCreateNewProject.addEventListener("mousedown", onCLickCreateProject);
    getElement("bttCarregarProjeto").addEventListener("mousedown", createProjectWindow.open.bind(null, "load"));
    createProjectWindow.addObservers("createProject", [onCreateProject]);

    {//Abrir e Fechar a janela de Atalhos.
        const content = getElement("contentJanelaAtalhos");
        content.addEventListener("mousedown", (e) => {
            if (e.target === content) { openWindowBackgroundBlur(content, false) }
        })
        getElement("bttAtalhos").addEventListener("mousedown", openWindowBackgroundBlur
            .bind(null, content, true));
    }

    {
        const carregar = getElement("carregamento"),
            loadMode = sessionStorage.getItem("loadMode"),
            fadeOut = async () => {
                setStyle(carregar, { opacity: "0" });
                await delay(700);
                carregar.remove();
            },
            carregamento = async () => {
                const logoCarregamento = getElement("logoCarregamento");
                setStyle(logoCarregamento, { transition: "opacity 1.5s linear" });
                await delay(200);
                setStyle(logoCarregamento, { opacity: "1" });
                await delay(1500);
                const { left, top } = getElement("logoBlack").getBoundingClientRect();
                setStyle(logoCarregamento, {
                    transition: "width 500ms ease-out, height 500ms ease-out, opacity 500ms ease-out, top 500ms ease-out, left 500ms ease-out",
                    width: "90px", height: "50px", opacity: "0.75",
                    left: left + 45 + "px", top: top + 25 + "px"
                });
                await delay(350);
                fadeOut();
            }
        if (loadMode) {
            createProjectWindow.open(loadMode);
            sessionStorage.removeItem("loadMode");
            fadeOut();
        } else { carregamento(); }
    }
}