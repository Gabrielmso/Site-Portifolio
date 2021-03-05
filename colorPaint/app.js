import {
    preventDefaultAction, setStyle, getElement, createElement, loadImage, fadeOutLoading,
    createEventEmitterToObservers, cloneElement, delay, openWindowBackgroundBlur
} from "../js/utils.js";
import HotKeys from "./hotKeys.js";
import DrawingTools from "./drawingTools.js";
import UndoRedoChange from "./undoRedoChange.js";
import ScrollsContentTelas from "./scrollsContentTelas.js";
import PreviewFunctions from "./previewFunctions.js";
import ColorsApp from "./colorsApp.js";
import Notification from "../notifications/notifications.js";
import CreateProjectWindow from "./createProjectWindow.js";
import CreateGridWindow from "./createGridWindow.js";
import CreateLayer from "./createLayer.js";

export default function App() {
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
    const notification = Notification();
    const colors = ColorsApp({ project, notification, janelaPrincipal, });
    const createProjectWindow = CreateProjectWindow({ notification, colors });
    const layerOpacityBar = {
        content: getElement("contentBarraOpacidadeCamada"), bar: getElement("barraOpacidadeCamada"),
        mousedown: false,
    }
    const layerSampleWindow = {
        window: getElement("janelaDeAmostraDaCamada"), timeTransition: 160,
        screen: getElement("canvasAmostraDacamada").getContext("2d"), arrow: getElement("setaJanelaDeAmostra"),
        maxProportion: 530 / 400, width: 0, height: 0,
        adjustSize() {
            const [width, height] = project.resolution.proportion >= this.maxProportion ?
                [530, Math.round(530 / project.resolution.proportion)] :
                [Math.round(400 * project.resolution.proportion), 400];
            this.width = width + 20;
            this.height = height + 20;
            this.screen.canvas.width = width;
            this.screen.canvas.height = height;
            setStyle(this.screen.canvas, { width: width + "px", height: height + "px" });
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
    const createGridWindow = CreateGridWindow({ notification, project, contentTelas, adjustInVisualizationScreen, zoom });
    const adjustScreen = () => {
        const maxWidth = contentTelas.offsetWidth - 7, maxHeight = contentTelas.offsetHeight - 7;
        if (project.resolution.width >= maxWidth || project.resolution.height >= maxHeight) {
            adjustInVisualizationScreen();
        } else { zoom("porcentagem", false, 100); }
    }
    const setResolutionProject = (() => {
        const setResolutionEventLayer = () => {
            project.eventLayer.canvas.width = project.resolution.width;
            project.eventLayer.canvas.height = project.resolution.height;
        }
        const setResolutionLayers = () => {
            const { width, height } = project.resolution;
            for (const { layer } of project.layers) {
                layer.canvas.width = width;
                layer.canvas.height = height;
            }
        }
        const setResolutionLayerPreview = (() => {
            const proportionMaxSpace = 256 / 150;
            return () => {
                const [width, height] = project.resolution.proportion >= proportionMaxSpace ?
                    [256, Math.round(256 / project.resolution.proportion)] :
                    [Math.round(150 * project.resolution.proportion), 150]
                for (const { layerPreview } of project.layers) {
                    layerPreview.canvas.width = width * 2;
                    layerPreview.canvas.height = height * 2;
                }
                setStyle(contentTelasPreview, { width: width + "px", height: height + "px" });
            }
        })();
        const setResolutionIcons = (() => {
            const proportionMaxSpace = 80 / 60, proportioMaxSizeMini = 100 / 75;
            return () => {
                const [width, height] = project.resolution.proportion >= proportionMaxSpace ?
                    [80, Math.round(80 / project.resolution.proportion)] :
                    [Math.round(60 * project.resolution.proportion), 60];
                const styleSizeCanvasIcon = { width: width + "px", height: height + "px" };
                const [widthMini, heightMini] = project.resolution.proportion >= proportioMaxSizeMini ?
                    [100, Math.round(100 / project.resolution.proportion)] :
                    [Math.round(75 * project.resolution.proportion), 75];
                const styleSizeCanvasIconMini = { width: widthMini + "px", height: heightMini + "px" };
                for (const { canvasIcons: [icon, iconMini] } of project.layers) {
                    setStyle(icon.canvas, styleSizeCanvasIcon);
                    icon.canvas.width = width * 2;
                    icon.canvas.height = height * 2;
                    setStyle(iconMini.canvas, styleSizeCanvasIconMini);
                    iconMini.canvas.width = widthMini * 2;
                    iconMini.canvas.height = heightMini * 2;
                }
            }
        })();
        const txtResolution = getElement("txtResolucao");
        return (width, height) => {
            project.resolution = { width, height, proportion: (width / height) };
            setResolutionEventLayer();
            setResolutionLayers();
            setResolutionLayerPreview();
            setResolutionIcons();
            layerSampleWindow.adjustSize();
            txtResolution.value = width + ", " + height;
        }
    })();
    const setBackgroundColorProject = color => {
        const style = { background: color ? "rgb(" + color.r + ", " + color.g + ", " + color.b + ")" : null }
        setStyle(screen, style);
        setStyle(contentTelasPreview, style);
        for (const { canvasIcons } of project.layers) {
            for (const { canvas } of canvasIcons) { setStyle(canvas.parentElement, style) }
        }
        project.background = color;
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
    const createNewLayer = CreateLayer({
        project, selectLayer, setLayerVisibility, screen, contentTelasPreview, layerSampleWindow
    });
    const createProject = ({ name, resolution: { width, height }, background, numLayers }) => {
        txtProjectName.innerText = project.name = name;
        project.numLayers = numLayers;
        while (project.numLayers > project.layers.length) {
            const objLayer = createNewLayer();
            if (objLayer) { project.layers.push(objLayer); }
        }
        setResolutionProject(width, height);
        setBackgroundColorProject(background);
        adjustScreen();
        selectLayer(0);
        return true;
    }
    const loadProject = async objProjeto => {
        const erro = () => notification.open({
            type: "notify", timeNotify: 4000, title: "Erro!", message: "Não foi possível carregar o projeto!"
        });
        const arrayLayerDrawings = [];
        for (let i = 0; i < objProjeto.numLayers; i++) {
            const layerDrawing = await loadImage("data:image/png;base64," + objProjeto.layersData[i].data);
            if (!layerDrawing) { erro(); return false; }
            arrayLayerDrawings.push(layerDrawing);
        }
        createProject(objProjeto);
        for (let i = 0; i < project.numLayers; i++) {
            const { opacity, visible } = objProjeto.layersData[i];
            selectLayer(i);
            changeOpacitySelectedLayer(opacity);
            drawInLayer(project.layers[i], arrayLayerDrawings[i]);
            if (!visible) { setLayerVisibility(i); };
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
            name: project.name, resolution: { width: project.resolution.width, height: project.resolution.height },
            background: project.background, savedColors: coresSalvasProjeto,
            grid: createGridWindow.gridProperties, numLayers: project.numLayers, layersData: dadosCamadas
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
    const replaceBttCreateNewProject = () => {
        const bttCreateProject = getElement("bttNovoProjeto");
        setStyle(bttCreateProject, { display: null });
        bttCreateProject.addEventListener("mousedown", createProjectWindow.open.bind(null, "create"));
    }
    const readyProject = () => {
        replaceBttCreateNewProject();
        const hotKeys = HotKeys();
        const drawingTools = DrawingTools({ project, screen, contentTelas, janelaPrincipal, notification, zoom });
        const scrollsContentTelas = ScrollsContentTelas({ contentTelas, screen });
        const previewFunctions = PreviewFunctions({ project, contentTelasPreview, contentTelas });
        const undoRedoChange = UndoRedoChange({ project });

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
        observers.notify("readyProject");
    }
    const onCreateProject = (() => {
        const modeFunction = { create: createProject, load: loadProject }
        return async ({ mode, obj }) => {
            const fn = modeFunction[mode];
            if (fn && await fn(obj)) { readyProject(); }
        }
    })();

    createProjectWindow.addObservers("createProject", [onCreateProject]);
    observers.add("readyProject", [createProjectWindow.onReadyProject]);

    {//Abrir e Fechar a janela de Atalhos.
        const content = getElement("contentJanelaAtalhos");
        content.addEventListener("mousedown", (e) => {
            if (e.target === content) { openWindowBackgroundBlur(content, false); }
        });
        getElement("bttAtalhos").addEventListener("mousedown", openWindowBackgroundBlur.bind(null, content, true));
    }

    {
        const loadMode = sessionStorage.getItem("loadMode"),
            carregamento = async () => {
                setStyle(getElement("circle"), { opacity: "0" });
                await delay(300);
                const logoCarregamento = getElement("logoCarregamento");
                setStyle(logoCarregamento, { transition: "opacity 1s ease-in-out", opacity: "1" });
                await delay(1000);
                const { left, top } = getElement("bttLogoMenu").getBoundingClientRect();
                setStyle(logoCarregamento, {
                    transition: "width 400ms ease-in-out, height 400ms ease-in-out, opacity 400ms ease-in-out, top 400ms ease-in-out, left 400ms ease-in-out",
                    width: "100px", height: "50px", opacity: "0.8",
                    left: (left + 50) + "px", top: (top + 25) + "px"
                });
                await delay(450);
                fadeOutLoading();
            }
        if (loadMode) {
            createProjectWindow.open(loadMode);
            sessionStorage.removeItem("loadMode");
            fadeOutLoading();
        } else { carregamento(); }
    }
}