import { getElement, setStyle, createElement, getMousePosition } from "../js/geral.js";

export default function settingsWindowObject() {
    const D = {},
        inputs = {
            size: getElement("txtTamanho"), lineWidth: getElement("txtEspessura"),
            position: { x: getElement("txtHorizontal"), y: getElement("txtVertical") },
            opacity: getElement("barraOpacidade")
        },
        bttSelectColor = getElement("bttSelecionarCor"),
        bttSaveImage = getElement("bttSalvarImagem"),
        moveWindow = (() => {
            const info = { mousePositionMoveWindow: { x: 0, y: 0 } },
                content = getElement("janelaConfiguracao"),
                move = e => {
                    const { x: cx, y: cy } = getMousePosition(D.appWindow, e), { x: bx, y: by } = info.mousePositionMoveWindow;
                    const top = cy - by, left = cx - bx;
                    const validateTop = top < 50 ? 50 : top + content.offsetHeight > D.appWindow.offsetHeight ?
                        D.appWindow.offsetHeight - content.offsetHeight : top;
                    const validateLeft = left < 0 ? 0 : left + content.offsetWidth > D.appWindow.offsetWidth ?
                        D.appWindow.offsetWidth - content.offsetWidth : left;
                    setStyle(content, { top: validateTop + "px", left: validateLeft + "px" });
                },
                up = () => {
                    document.removeEventListener("mousemove", move);
                    document.removeEventListener("mouseup", up);
                },
                down = e => {
                    info.mousePositionMoveWindow = getMousePosition(e.currentTarget, e);
                    document.addEventListener("mousemove", move);
                    document.addEventListener("mouseup", up);
                }
            return down;
        })(),
        update = () => {
            const { size, position, lineWidth, color, opacity } = D.canvasGrid.properties;
            inputs.size.value = size;
            inputs.lineWidth.value = lineWidth;
            inputs.position.x.value = position.x;
            inputs.position.y.value = position.y;
            inputs.opacity.value = opacity;
            setStyle(bttSelectColor, { backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})` });
        },
        saveImage = () => {
            const { name, resolution: { width, height } } = D.canvasImage.properties;
            const canvas = createElement("canvas", { width, height }).getContext("2d");
            canvas.drawImage(D.app.canvasImage.canvas, 0, 0);
            canvas.drawImage(D.app.canvasGrid.canvas, 0, 0);
            canvas.canvas.toBlob((blob) => {
                const download = createElement("a", { download: name, href: URL.createObjectURL(blob) });
                download.click();
                download.remove();
            }, "image/png", 1);
        },
        addEventsToElements = () => {
            bttSelectColor.addEventListener("mousedown", () => {
                if (D.colorSelectionWindow.isOpen) { return; }
                D.colorSelectionWindow.open(D.canvasGrid.properties.color);
            });
            inputs.size.addEventListener("input", (e) => D.canvasGrid.size = +(e.currentTarget.value));
            inputs.lineWidth.addEventListener("input", (e) => D.canvasGrid.lineWidth = +(e.currentTarget.value));
            inputs.position.x.addEventListener("input", (e) => D.canvasGrid.position = {
                x: +(e.currentTarget.value), y: +(inputs.position.y.value)
            });
            inputs.position.y.addEventListener("input", (e) => D.canvasGrid.position = {
                x: +(inputs.position.x.value), y: +(e.currentTarget.value)
            });
            inputs.opacity.addEventListener("input", (e) => D.canvasGrid.opacity = +(e.currentTarget.value));
            bttSaveImage.addEventListener("mousedown", saveImage);
            getElement("moverJanelaConfiguracao").addEventListener("mousedown", moveWindow);
        }
    return {
        init() {
            addEventsToElements();
            delete this.init;
        },
        update,
        addDependencies(dependencies) {
            for (const prop in dependencies) { D[prop] = dependencies[prop]; }
        }
    }
}