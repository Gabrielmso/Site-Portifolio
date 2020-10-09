import { getMousePosition, preventDefaultAction, setStyle } from "../js/geral.js";

export default function appObject() {
    const D = {}, status = { isLoad: false, zoom: 0, isClick: false }, canvas = {},
        mousePosition = {
            x: 0, y: 0, update({ x, y }) {
                this.x = x;
                this.y = y;
            }
        },
        infoMoveScreen = { mousePosition: { x: 0, y: 0 }, scrollsValues: { h: 0, w: 0 } },
        zoom = (type, center, value) => {
            const previousWidth = D.screen.offsetWidth,
                { width, proportion } = D.canvasImage.properties.resolution,
                { offsetWidth, offsetHeight } = D.appWindow,
                typeZoom = {
                    percentage: () => (width * value) / 100,
                    zoomIn: () => previousWidth * value,
                    zoomOut: () => previousWidth / value,
                }
            let newWidth = typeZoom[type]();
            newWidth = newWidth <= 25 ? 25 : newWidth >= width * 8 ? width * 8 : newWidth;
            let newHeight = (newWidth / proportion)
            D.screen.style.width = newWidth + "px";
            D.screen.style.height = newHeight + "px";
            D.screen.style.left = newWidth >= offsetWidth ? "0px" : (offsetWidth / 2) - (newWidth / 2) + "px";
            D.screen.style.top = newHeight <= offsetHeight - 50 ? (((offsetHeight - 50) / 2) - (newHeight / 2)) + 50 + "px"
                : newHeight <= offsetHeight + 50 ? 50 - ((((offsetHeight - 50) / 2) - (newHeight / 2)) - ((offsetHeight - 50) - newHeight)) + "px" : "0px";
            if (center) {
                D.appWindow.scrollTop = ((newHeight / 2)) - ((offsetHeight + 50) / 2);
                D.appWindow.scrollLeft = ((newWidth / 2)) - (offsetWidth / 2);
            }

            if (width > newWidth) { setStyle(D.screen, { imageRendering: "auto" }); }
            else { setStyle(D.screen, { imageRendering: "pixelated" }); }
            status.zoom = (100 * newWidth) / width;
        },
        adjustInVisualizationScreen = () => {
            const { width, height, proportion } = D.canvasImage.properties.resolution, maxWidth = D.appWindow.offsetWidth,
                maxHeight = D.appWindow.offsetHeight - 50, proportionContent = maxWidth / maxHeight,
                zoomAdjusted = proportion >= proportionContent ? (maxWidth * 100) / width : (maxHeight * 100) / height;
            zoom("percentage", false, zoomAdjusted);
        },
        moveScreen = (eventName, e) => {
            const { x, y } = getMousePosition(D.appWindow, e);
            const typesEventName = {
                down: () => {
                    status.isClick = true;
                    infoMoveScreen.mousePosition = { x, y };
                    infoMoveScreen.scrollsValues.h = D.appWindow.scrollTop;
                    infoMoveScreen.scrollsValues.w = D.appWindow.scrollLeft;
                    setStyle(D.appWindow, { cursor: "grabbing" });
                },
                move: () => {
                    const { x: bx, y: by } = infoMoveScreen.mousePosition;
                    D.appWindow.scrollTop = infoMoveScreen.scrollsValues.h + by - y;
                    D.appWindow.scrollLeft = infoMoveScreen.scrollsValues.w + bx - x;
                },
                up: () => {
                    status.isClick = false
                    setStyle(D.appWindow, { cursor: null });
                }
            }
            typesEventName[eventName]();
        },
        addEventsToElements = () => {
            D.appWindow.addEventListener("mousedown", e => moveScreen("down", e));
            D.appWindow.addEventListener("mouseup", e => moveScreen("up", e));
            document.addEventListener("mousemove", e => {
                const { x, y } = getMousePosition(D.screen, e);
                const { width, height } = D.canvasImage.properties.resolution;
                mousePosition.update({
                    x: parseInt((width / D.screen.offsetWidth) * x), y: parseInt((height / D.screen.offsetHeight) * y)
                });
                if (status.isClick) { moveScreen("move", e) };
            });
            D.appWindow.addEventListener("wheel", e => {
                preventDefaultAction(e);
                if (e.deltaY < 0) { zoom("zoomIn", false, 1.055); }
                else { zoom("zoomOut", false, 1.055); }
                const posContentTelas = getMousePosition(D.appWindow, e);
                const { width, height } = D.canvasImage.properties.resolution;
                const proporcaoPosY = mousePosition.y / height, proporcaoPosX = mousePosition.x / width;
                D.appWindow.scrollTop = parseInt((D.appWindow.scrollHeight * proporcaoPosY) - posContentTelas.y);
                D.appWindow.scrollLeft = parseInt((D.appWindow.scrollWidth * proporcaoPosX) - posContentTelas.x);
            });

            window.addEventListener("resize", () => {
                zoom("percentage", true, status.zoom)
            })
        }
    return {
        get isLoad() { return status.isLoad },
        set canvasImage(ctx) { canvas.image = ctx; },
        set canvasGrid(ctx) { canvas.grid = ctx; },
        async init() {
            status.isLoad = true;
            adjustInVisualizationScreen();
            addEventsToElements();
            await D.canvasImage.finish();
            // alert("Ainda está em desenvolvimento, volte em breve!");
            // window.location.reload();
            delete this.init;
        },
        addDependencies(dependencies) {
            for (const prop in dependencies) { D[prop] = dependencies[prop]; }
        }
    }
}