import { getElement, setStyle, createElement, getMousePosition } from "../js/utils.js";

export default function settingsWindowGridObject(contentWindow) {
    const observers = [], canvas = {},
        inputs = {
            size: getElement("txtTamanho"), lineWidth: getElement("txtEspessura"),
            positionX: getElement("txtHorizontal"), positionY: getElement("txtVertical"),
            opacity: getElement("barraOpacidade")
        },
        bttSelectColor = getElement("bttSelecionarCor"),
        bttSaveImage = getElement("bttSalvarImagem"),
        notifyOpenColorSelectionWindow = async (color) => {
            for (const observer of observers) { await observer(color); }
        },
        moveWindow = (() => {
            let mousePositionMoveWindow = { x: 0, y: 0 };
            const content = getElement("janelaConfiguracao"),
                move = e => {
                    const { x, y } = getMousePosition(contentWindow, e), { x: bx, y: by } = mousePositionMoveWindow;
                    const top = y - by, left = x - bx;
                    const validateTop = top < 50 ? 50 : top + content.offsetHeight > contentWindow.offsetHeight ?
                        contentWindow.offsetHeight - content.offsetHeight : top;
                    const validateLeft = left < 0 ? 0 : left + content.offsetWidth > contentWindow.offsetWidth ?
                        contentWindow.offsetWidth - content.offsetWidth : left;
                    setStyle(content, { top: validateTop + "px", left: validateLeft + "px" });
                }, up = () => {
                    document.removeEventListener("mousemove", move);
                    document.removeEventListener("mouseup", up);
                }, down = e => {
                    mousePositionMoveWindow = getMousePosition(e.currentTarget, e);
                    document.addEventListener("mousemove", move);
                    document.addEventListener("mouseup", up);
                }
            return down;
        })(),
        renderGrid = () => {
            const { width, height } = canvas.image,
                { ctx, size, color, position, opacity, lineWidth } = canvas.grid;
            ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
            ctx.globalAlpha = opacity;
            const line = lineWidth < 1 ? 1 : parseInt(lineWidth);
            const pos = {
                x: Math.round(((position.x / size) - (Math.trunc(position.x / size))) * size),
                y: Math.round(((position.y / size) - (Math.trunc(position.y / size))) * size)
            }
            ctx.clearRect(0, 0, width, height);
            for (let i = pos.y; i <= height; i += size) { ctx.fillRect(0, i, width, line); }
            for (let i = pos.x; i <= width; i += size) { ctx.fillRect(i, 0, line, height); }
        },
        changeGridConfiguration = () => {
            const { color } = canvas.grid;
            canvas.grid.size = +(inputs.size.value);
            canvas.grid.position.x = +(inputs.positionX.value);
            canvas.grid.position.y = +(inputs.positionY.value);
            canvas.grid.lineWidth = +(inputs.lineWidth.value);
            canvas.grid.opacity = +(inputs.opacity.value);
            setStyle(bttSelectColor, { backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})` });
            renderGrid();
        },
        updateInputs = () => {
            const { size, position, lineWidth, color, opacity } = canvas.grid;
            inputs.size.value = size;
            inputs.lineWidth.value = lineWidth;
            inputs.positionX.value = position.x;
            inputs.positionY.value = position.y;
            inputs.opacity.value = opacity;
            setStyle(bttSelectColor, { backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})` });
        },
        saveImage = () => {
            const { name, width, height } = canvas.image;
            const imageGrid = createElement("canvas", { width, height }).getContext("2d");
            imageGrid.drawImage(canvas.image.ctx.canvas, 0, 0);
            imageGrid.drawImage(canvas.grid.ctx.canvas, 0, 0);
            imageGrid.canvas.toBlob(blob => {
                const download = createElement("a", { download: name, href: URL.createObjectURL(blob) });
                download.click();
                download.remove();
            }, "image/png", 1);
        },
        addEventsToElements = () => {
            bttSelectColor.addEventListener("mousedown", () => notifyOpenColorSelectionWindow(canvas.grid.color));
            inputs.size.addEventListener("input", changeGridConfiguration);
            inputs.lineWidth.addEventListener("input", changeGridConfiguration);
            inputs.positionX.addEventListener("input", changeGridConfiguration);
            inputs.positionY.addEventListener("input", changeGridConfiguration);
            inputs.opacity.addEventListener("input", changeGridConfiguration);
            bttSaveImage.addEventListener("mousedown", saveImage);
            getElement("moverJanelaConfiguracao").addEventListener("mousedown", moveWindow);
        }
    return {
        async init({ image, grid }) {
            canvas.image = image;
            canvas.grid = grid;
            addEventsToElements();
            updateInputs();
            renderGrid();
        },
        setColorGrid({ r, g, b }) {
            canvas.grid.color = { r, g, b };
            changeGridConfiguration();
        },
        addObservers(newObservers) {
            for (const observer of newObservers) { observers.push(observer); }
        }
    }
}