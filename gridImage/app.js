import { getMousePosition, preventDefaultAction, setStyle } from "../js/geral.js";

export default function appObject() {
    const D = {}, status = { isLoad: false, zoom: 0, isClick: false }, canvas = {},
        mousePosition = {
            x: 0, y: 0, update({ x, y }) {
                this.x = x;
                this.y = y;
            }
        },
        zoom = (type, center, value) => {
            const previousWidth = D.screen.offsetWidth,
                { width, proportion } = D.canvasImage.properties.resolution,
                { offsetWidth, offsetHeight } = D.contentScreen,
                typeZoom = {
                    percentage: () => (width * value) / 100,
                    zoomIn: () => previousWidth * value,
                    zoomOut: () => previousWidth / value,
                }
            let newWidth = typeZoom[type]();
            newWidth = newWidth <= 50 ? 50 : newWidth >= width * 8 ? width * 8 : newWidth;
            let newHeight = (newWidth / proportion)
            D.screen.style.width = newWidth + "px";
            D.screen.style.height = newHeight + "px";
            const left = newWidth > offsetWidth - 100 ? 50 : (offsetWidth / 2) - (newWidth / 2);
            const top = newHeight > offsetHeight - 100 ? 50 : 25 + ((offsetHeight / 2) - (newHeight / 2));
            D.screen.style.left = left + "px";
            D.screen.style.top = top + "px";
            if (center) {
                D.contentScreen.scrollTop = ((D.contentScreen.scrollHeight / 2)) - ((offsetHeight + 50) / 2);
                D.contentScreen.scrollLeft = ((D.contentScreen.scrollWidth / 2)) - (offsetWidth / 2);
            }
            if (width > newWidth) { setStyle(D.screen, { imageRendering: "auto" }); }
            else { setStyle(D.screen, { imageRendering: "pixelated" }); }
            status.zoom = (100 * newWidth) / width;
        },
        adjustInVisualizationScreen = () => {
            const { width, height, proportion } = D.canvasImage.properties.resolution, maxWidth = D.contentScreen.offsetWidth,
                maxHeight = D.contentScreen.offsetHeight - 50, proportionContent = maxWidth / maxHeight,
                zoomAdjusted = proportion >= proportionContent ? (maxWidth * 100) / width : (maxHeight * 100) / height;
            zoom("percentage", true, zoomAdjusted);
        },
        moveScreen = (() => {
            const infoMoveScreen = { mousePosition: { x: 0, y: 0 }, scrollsValues: { h: 0, w: 0 } },
                typesEventName = {
                    down: ({ x, y }) => {
                        status.isClick = true;
                        infoMoveScreen.mousePosition = { x, y };
                        infoMoveScreen.scrollsValues.h = D.contentScreen.scrollTop;
                        infoMoveScreen.scrollsValues.w = D.contentScreen.scrollLeft;
                        setStyle(D.screen, { cursor: "grabbing" });
                    },
                    move: ({ x, y }) => {
                        const { x: bx, y: by } = infoMoveScreen.mousePosition;
                        D.contentScreen.scrollTop = infoMoveScreen.scrollsValues.h + by - y;
                        D.contentScreen.scrollLeft = infoMoveScreen.scrollsValues.w + bx - x;
                    },
                    up: () => {
                        status.isClick = false;
                        setStyle(D.screen, { cursor: null });
                    }
                }
            return (eventName, e) => typesEventName[eventName](getMousePosition(D.contentScreen, e));
        })(),
        addEventsToElements = () => {
            D.contentScreen.addEventListener("mousedown", e => moveScreen("down", e));
            document.addEventListener("mouseup", e => moveScreen("up", e));
            document.addEventListener("mouseleave", e => moveScreen("up", e));
            document.addEventListener("mousemove", e => {
                const { x, y } = getMousePosition(D.screen, e);
                const { width, height } = D.canvasImage.properties.resolution;
                mousePosition.update({
                    x: parseInt((width / D.screen.offsetWidth) * x), y: parseInt((height / D.screen.offsetHeight) * y)
                });
                if (status.isClick) { moveScreen("move", e) };
            });
            document.addEventListener("wheel", e => {
                preventDefaultAction(e);
                if (e.deltaY < 0) { zoom("zoomIn", false, 1.055); }
                else { zoom("zoomOut", false, 1.055); }
                const posContentTelas = getMousePosition(D.contentScreen, e);
                const { width, height } = D.canvasImage.properties.resolution;
                const proporcaoPosY = mousePosition.y / height, proporcaoPosX = mousePosition.x / width;
                D.contentScreen.scrollTop = parseInt((D.contentScreen.scrollHeight * proporcaoPosY) - posContentTelas.y);
                D.contentScreen.scrollLeft = parseInt((D.contentScreen.scrollWidth * proporcaoPosX) - posContentTelas.x);
            }, { passive: false });

            window.addEventListener("resize", () => {
                zoom("percentage", true, status.zoom)
            })
        }
    return {
        get isLoad() { return status.isLoad },
        set canvasImage(ctx) { canvas.image = ctx; },
        get canvasImage() { return canvas.image },
        set canvasGrid(ctx) { canvas.grid = ctx; },
        get canvasGrid() { return canvas.grid; },
        async init() {
            status.isLoad = true;
            adjustInVisualizationScreen();
            addEventsToElements();
            D.settingsWindow.init();
            await D.canvasImage.finish();
            delete this.init;
        },
        addDependencies(dependencies) {
            for (const prop in dependencies) { D[prop] = dependencies[prop]; }
        }
    }
}