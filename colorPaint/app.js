import {
    preventDefaultAction, setStyle, getElement, createElement, getImage,
    createEventEmitterToObservers, cloneElement, delay, openWindowBackgroundBlur
} from "../js/utils.js";
import hotKeysObject from "./hotKeys.js";
import drawingToolsObject from "./drawingTools.js";
import undoRedoChangeObject from "./undoRedoChange.js";
import previewFunctionsObject from "./previewFunctions.js";
import colorsAppObject from "./colorsApp.js";
import notificationObject from "../notifications/notifications.js";
import createProjectWindowObject from "./createProjectWindow.js";
import createGridWindowObject from "./createGridWindow.js";

export default function appObject() {
    const observers = createEventEmitterToObservers(["zoom", "readyProject", "drawingChanged"]);
    const project = {
        name: null, resolution: { width: 0, height: 0, proportion: 0 },
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
        const alturaAtual = (larguraAtual / proportion), { offsetWidth, offsetHeight } = contentTelas
        screen.style.width = larguraAtual + "px";
        screen.style.height = alturaAtual + "px";
        screen.style.left = larguraAtual >= (offsetWidth - 12) ? "6px" : (offsetWidth / 2) - (larguraAtual / 2) + "px";
        screen.style.top = alturaAtual >= (offsetHeight - 12) ? "6px" : (offsetHeight / 2) - (alturaAtual / 2) + "px";
        if (centralize) {
            contentTelas.scrollTop = ((alturaAtual / 2) + 12) - (offsetHeight / 2);
            contentTelas.scrollLeft = ((larguraAtual / 2) + 12) - (offsetWidth / 2);
        }
        project.zoom = ((larguraAtual * 100) / width);
        txtPorcentagemZoom.value = project.zoom.toFixed(2).replace(".", ",") + "%";
        observers.notify("zoom", project.zoom);
    }
    const adjustInVisualizationScreen = () => {
        const { width, height, proportion } = project.resolution, maxWidth = contentTelas.offsetWidth - 12,
            maxHeight = contentTelas.offsetHeight - 12, proportionContent = maxWidth / maxHeight,
            zoomAdjusted = proportion >= proportionContent ? +(((maxWidth * 100) / width).toFixed(2)) : +(((maxHeight * 100) / height).toFixed(2));
        zoom("porcentagem", false, zoomAdjusted);
    }
    const createGridWindow = createGridWindowObject({ notification, project, contentTelas, adjustInVisualizationScreen, zoom });
    const adjustScreen = () => {
        const maxWidth = contentTelas.offsetWidth - 12, maxHeight = contentTelas.offsetHeight - 12;
        if (project.resolution.width >= maxWidth || project.resolution.height >= maxHeight) {
            adjustInVisualizationScreen();
        } else { zoom("porcentagem", false, 100); }
    }
    const setBackgroundColorProject = color => {
        const style = { background: color ? "rgb(" + color.r + ", " + color.g + ", " + color.b + ")" : null }
        setStyle(screen, style);
        setStyle(contentTelasPreview, style);
        for (const { canvasIcon: { canvas } } of project.layers) { setStyle(canvas, style); }
    }
    const changeOpacitySelectedLayer = value => {
        if (!project.selectedLayer.visible || project.toolInUse) { return; }
        value = value < 0.01 ? 0.01 : value > 1 ? 1 : value;
        project.selectedLayer.txtOpacity.value = Math.floor((value * 100)) + "%";
        setStyle(project.selectedLayer.layer.canvas, { opacity: value });
        setStyle(project.selectedLayer.layerPreview.canvas, { opacity: value });
        project.selectedLayer.opacity = value;
    }
    const selectLayer = numLayer => {
        if (!project.layers[numLayer].visible || project.toolInUse) { return; }
        project.selectedLayer = project.layers[numLayer];
        project.selectedLayer.icon.classList.replace("iconeCamada", "iconeCamadaSelecionada");
        for (let i = 0; i < project.numLayers; i++) {
            if (i !== numLayer) {
                project.layers[i].icon.classList.replace("iconeCamadaSelecionada", "iconeCamada");
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
            project.layers[numLayer].bttLook.classList.replace("iconNaoVer", "iconVer");
            selectLayer(numLayer);
        } else {
            setStyle(project.layers[numLayer].layer.canvas, { display: "none" });
            setStyle(project.layers[numLayer].layerPreview.canvas, { display: "none" });
            project.layers[numLayer].bttLook.classList.replace("iconVer", "iconNaoVer");
            project.layers[numLayer].icon.classList.replace("iconeCamadaSelecionada", "iconeCamada");
            for (let i = 0; i < project.numLayers; i++) {
                if (i != numLayer && project.layers[numLayer] === project.selectedLayer && project.layers[i].visible) {
                    selectLayer(i);
                    break;
                }
            }
        }
    }
    const drawInIcon = layer => {
        const { width, height } = layer.canvasIcon.canvas
        layer.canvasIcon.clearRect(0, 0, width, height);
        layer.canvasIcon.globalAlpha = layer.opacity;
        layer.canvasIcon.drawImage(layer.layerPreview.canvas, 0, 0, width, height);
    }
    const drawInPreview = layer => {
        const { width, height } = layer.layerPreview.canvas
        layer.layerPreview.clearRect(0, 0, width, height);
        layer.layerPreview.drawImage(layer.layer.canvas, 0, 0, width, height);
        drawInIcon(layer);
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
        const layerSampleWindow = {
            window: getElement("janelaDeAmostraDaCamada"), timeTransition: 160,
            screen: getElement("canvasAmostraDacamada").getContext("2d"),
            adjustSize({ width, height }) {
                this.screen.canvas.width = Math.floor(width * 2.3);
                this.screen.canvas.height = Math.floor(height * 2.3);
                setStyle(this.screen.canvas, {
                    width: this.screen.canvas.width + "px", height: this.screen.canvas.height + "px"
                });
            },
            open(layer, icon) {
                const { top, height } = icon.getBoundingClientRect();
                setStyle(this.window, {
                    display: "block", top: top - (this.screen.canvas.height + 20 - height) + "px"
                });
                this.screen.clearRect(0, 0, this.screen.canvas.width, this.screen.canvas.height);
                this.screen.drawImage(layer, 0, 0, this.screen.canvas.width, this.screen.canvas.height);
                setTimeout(() => setStyle(this.window, { opacity: "1" }), 10);
            },
            close() {
                setStyle(this.window, { opacity: null });
                setTimeout(() => setStyle(this.window, { display: null }), this.timeTransition);
            },
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
            const contentIconLayers = getElement("contentIconeCamadas"), proportionMaxSpace = 80 / 60;
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
                const styleSizeCanvasIcon = "width: " + width + "px; height: " + height + "px; ";

                contentIconLayers.insertAdjacentHTML("afterbegin",
                    `<div data-id="${idIcon}" class="iconeCamada">
                            <div data-id="${idBttLook}" class="iconVer cursor"></div>
                            <label>
                                <span data-id="${idTxtNameLayer}">Camada ${numLayer}</span><br>
                                <span>Opacidade: </span>
                                <input type="text" data-id="${idTxtOpacity}" readonly="true" class="opacidadeCamada" value="100%">
                            </label>
                            <div class="contentIcon">
                                <canvas data-id="${idCanvasIcon}" style="${styleSizeCanvasIcon}" class="iconTela" width="${width * 2}" height="${height * 2}"></canvas>
                                <div></div>
                            </div>
                        </div>`);
                contentIconLayers.scrollTop = contentIconLayers.scrollHeight;
                const icon = getElement(idIcon), bttLook = getElement(idBttLook),
                    txtLayerName = getElement(idTxtNameLayer), txtOpacity = getElement(idTxtOpacity),
                    canvasIcon = getElement(idCanvasIcon);
                return { icon, bttLook, txtLayerName, txtOpacity, canvasIcon: canvasIcon ? canvasIcon.getContext("2d") : null }
            }
        })();
        const createLayer = numLayer => {
            const style = "z-index: " + (numLayer * 2) + ";";
            const { height, width } = project.resolution;
            const layer = createElement("canvas", {
                "data-id": "telaCamada" + numLayer, class: "telaCanvas", style, height, width
            });
            screen.appendChild(layer);
            return layer.getContext("2d");
        }
        const getNumLayerByMouseInIcon = elIcon => {
            for (let i = 0; i < project.numLayers; i++) {
                if (elIcon === project.layers[i].icon) { return i; }
            }
        }
        const showLayerSample = e => {
            const numLayer = getNumLayerByMouseInIcon(e.currentTarget);
            project.layers[numLayer].cursorInIcon = true;
            idIntervalToShowLayerSample = setTimeout(() => {
                if (mouseInBttLook || !project.layers[numLayer].cursorInIcon) { return; }
                layerSampleWindow.open(project.layers[numLayer].layer.canvas, project.layers[numLayer].icon);
            }, 750)
        }
        const closeLayerSample = e => {
            const numLayer = getNumLayerByMouseInIcon(e.currentTarget);
            clearTimeout(idIntervalToShowLayerSample);
            project.layers[numLayer].cursorInIcon = false;
            layerSampleWindow.close();
        }
        const onMouseLeaveBttLook = () => mouseInBttLook = false;
        const onMouseEnterBttLook = () => mouseInBttLook = true;
        const onClickBttLook = e => {
            const bttLook = e.currentTarget;
            for (let i = 0; i < project.numLayers; i++) {
                if (bttLook === project.layers[i].bttLook) {
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
        return () => {
            const numLayer = project.layers.length + 1;
            const layer = createLayer(numLayer);
            const newIcon = createIconLayer(numLayer);
            const layerPreview = createLayerPreview(numLayer);
            const objLayer = {
                ...newIcon, layer, layerPreview, opacity: 1, visible: true, cursorInIcon: false
            }
            for (const prop in objLayer) { if (objLayer[prop] === null) { return false; } }
            objLayer.bttLook.addEventListener("mouseenter", onMouseEnterBttLook);
            objLayer.bttLook.addEventListener("mousedown", onClickBttLook);
            objLayer.bttLook.addEventListener("mouseleave", onMouseLeaveBttLook);
            objLayer.icon.addEventListener("mouseenter", showLayerSample);
            objLayer.icon.addEventListener("mousedown", onClickIcon);
            objLayer.icon.addEventListener("mouseleave", closeLayerSample);
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
    }
    const loadProject = file => {
        const createSavedProject = objProjeto => {
            createProject(objProjeto);
            for (let i = 0; i < project.numLayers; i++) {
                const { data, opacity, visible } = objProjeto.layersData[i];
                selectLayer(i);
                changeOpacitySelectedLayer(opacity);
                getImage(data, e => {
                    drawInLayer(project.layers[i], e.currentTarget);
                    if (!visible) { setLayerVisibility(i); };
                });
            }
            selectLayer(0);
            for (let i = 0; i < objProjeto.savedColors.length; i++) { colors.save(objProjeto.savedColors[i]); }
            createGridWindow.createGrid = objProjeto.grid;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.currentTarget.result === "") {
                notification.open({
                    type: "notify", timeNotify: 2000, title: "Erro!",
                    message: "Este arquivo não possui projeto salvo."
                });
            } else { createSavedProject(JSON.parse(e.currentTarget.result)); }
        };
        reader.readAsText(file, "utf-8");
    }
    const saveProject = () => {
        const dadosCamadas = [], coresSalvasProjeto = [];
        for (let i = 0; i < project.numLayers; i++) {
            const { layer, visible, opacity } = project.layers[i];
            dadosCamadas[i] = { data: layer.canvas.toDataURL("imagem/png"), opacity, visible };
        }
        const savedColors = colors.savedColors;
        for (let i = 0; i < savedColors.length; i++) { coresSalvasProjeto[i] = savedColors[i].rgb; }
        const objProjeto = {
            name: project.name, resolution: project.resolution,
            background: project.background, savedColors: coresSalvasProjeto,
            grid: createGridWindow.gridProperties,
            numLayers: project.numLayers, layersData: dadosCamadas
        }
        const json = JSON.stringify(objProjeto), a = createElement("a", {
            download: project.name + ".gm", href: URL.createObjectURL(new Blob([json], { type: "application/json" }))
        });
        a.click();
        a.remove();
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
    const readyProject = () => {
        const hotKeys = hotKeysObject();
        const drawingTools = drawingToolsObject({ project, screen, contentTelas, janelaPrincipal, notification, zoom });
        const previewFunctions = previewFunctionsObject({ project, contentTelasPreview, contentTelas, screen });
        const undoRedoChange = undoRedoChangeObject({ project });

        observers.add("zoom", [previewFunctions.onZoom, drawingTools.onZoom]);
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

        setStyle(layerOpacityBar.content, { display: "flex" });

        layerOpacityBar.bar.addEventListener("input", e =>
            changeOpacitySelectedLayer(+((+(e.currentTarget.value)).toFixed(2))));
        window.addEventListener("resize", adjustInVisualizationScreen);
    }
    const onCreateProject = (() => {
        const modeFunction = { create: createProject, load: loadProject }
        return ({ mode, obj }) => {
            const fn = modeFunction[mode];
            if (!fn) { return; }
            fn(obj);
            readyProject();
        }
    })();

    getElement("bttCriarNovoProjeto").addEventListener("mousedown", createProjectWindow.open.bind(null, "create"));
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