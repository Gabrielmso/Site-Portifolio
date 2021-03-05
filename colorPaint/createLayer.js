import { setStyle, getElement, createElement } from "../js/utils.js";

export default function CreateLayer({ project, selectLayer, setLayerVisibility, screen, contentTelasPreview,
    layerSampleWindow }) {
    let mouseInBttLook = false, idIntervalToShowLayerSample = 0;
    const contentIconLayers = getElement("contentIconeCamadas"), contentMiniIconLayers = getElement("barraLateralMini");
    const changeOrderLayers = (from, to) => {
        if (!project.layers.move(from, to)) { return; }
        const [icon, iconMini] = project.layers[to].icons;
        contentIconLayers.insertBefore(icon, to > 0 ? project.layers[to - 1].icons.first : null);
        contentMiniIconLayers.insertBefore(iconMini, to > 0 ? project.layers[to - 1].icons.last : null);
        for (let i = 1; i <= project.numLayers; i++) {
            const { layer, layerPreview } = project.layers[i - 1];
            setStyle(layer.canvas, { zIndex: (i * 2) });
            setStyle(layerPreview.canvas, { zIndex: (i * 2) });
        }
        selectLayer(to);
    }
    const createLayerPreview = numLayer => {
        const layerPreview = createElement("canvas", { class: "preview" });
        contentTelasPreview.appendChild(layerPreview);
        setStyle(layerPreview, { zIndex: (numLayer * 2) });
        return layerPreview.getContext("2d");
    };
    const createIconLayer = numLayer => {
        const makeId = id => id + numLayer;
        const idIcon = makeId("camadaIcone");
        const idBttLook = makeId("visivel");
        const idTxtNameLayer = makeId("nomeCamada");
        const idTxtOpacity = makeId("txtOpacidade");
        const idCanvasIcon = makeId("canvasIcone");

        contentIconLayers.insertAdjacentHTML("afterbegin",
            `<div data-id="${idIcon}" class="iconeCamada" draggable="true">
                    <div data-id="${idBttLook}" class="iconVer visivel cursor"></div>
                    <label>
                        <span data-id="${idTxtNameLayer}">Camada ${numLayer}</span><br>
                        <span>Opacidade: </span>
                        <input type="text" data-id="${idTxtOpacity}" readonly="true" class="opacidadeCamada" value="100%">
                    </label>
                    <div class="contentIcon">
                        <div><canvas data-id="${idCanvasIcon}" class="iconTela"></canvas></div>
                    </div>
                </div>`);
        contentIconLayers.scrollTop = contentIconLayers.scrollHeight;

        const idIconMini = makeId("camadaIconeMini");
        const idBttLookMini = makeId("visivelMini");
        const idCanvasIconMini = makeId("canvasIconeMini");
        contentMiniIconLayers.insertAdjacentHTML("afterbegin",
            `<div data-id="${idIconMini}" class="iconeCamadaMini" draggable="true">
                    <div data-id="${idBttLookMini}" class="iconVerMini visivel cursor"></div>
                    <canvas data-id="${idCanvasIconMini}"></canvas>
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
    };
    const createLayer = numLayer => {
        const layer = createElement("canvas", { class: "telaCanvas" });
        screen.appendChild(layer);
        setStyle(layer, { zIndex: (numLayer * 2) });
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
        }, 650)
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
}