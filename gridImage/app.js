import { getMousePosition, preventDefaultAction, setStyle } from "../js/utils.js";

export default function appObject(contentScreen, screen) {
    const status = { zoom: 0, isClick: false }, canvas = {},
        mousePosition = {
            x: 0, y: 0, update({ x, y }) {
                this.x = x;
                this.y = y;
            }
        },
        zoom = (type, center, value) => {
            const previousWidth = screen.offsetWidth,
                { width, proportion } = canvas.image,
                { offsetWidth, offsetHeight } = contentScreen,
                typeZoom = {
                    percentage: () => (width * value) / 100,
                    zoomIn: () => previousWidth * value,
                    zoomOut: () => previousWidth / value,
                }
            let newWidth = typeZoom[type]();
            newWidth = newWidth <= 50 ? 50 : newWidth >= width * 8 ? width * 8 : newWidth;
            let newHeight = (newWidth / proportion);
            const left = (newWidth > offsetWidth - 100 ? 50 : (offsetWidth / 2) - (newWidth / 2)) + "px";
            const top = (newHeight > offsetHeight - 100 ? 50 : 25 + ((offsetHeight / 2) - (newHeight / 2))) + "px";
            setStyle(screen, { width: newWidth + "px", height: newHeight + "px", left, top });
            if (center) {
                contentScreen.scrollTop = ((contentScreen.scrollHeight / 2)) - ((offsetHeight + 50) / 2);
                contentScreen.scrollLeft = ((contentScreen.scrollWidth / 2)) - (offsetWidth / 2);
            }
            if (width > newWidth) { setStyle(screen, { imageRendering: "auto" }); }
            else { setStyle(screen, { imageRendering: "pixelated" }); }
            status.zoom = (100 * newWidth) / width;
        },
        adjustInVisualizationScreen = () => {
            const { width, height, proportion } = canvas.image, maxWidth = contentScreen.offsetWidth,
                maxHeight = contentScreen.offsetHeight - 50, proportionContent = maxWidth / maxHeight,
                zoomAdjusted = proportion >= proportionContent ? (maxWidth * 100) / width : (maxHeight * 100) / height;
            zoom("percentage", true, zoomAdjusted);
        },
        moveScreen = (() => {
            const infoMoveScreen = { mousePosition: { x: 0, y: 0 }, scrollsValues: { h: 0, w: 0 } },
                typesEventName = {
                    down: ({ x, y }) => {
                        status.isClick = true;
                        infoMoveScreen.mousePosition = { x, y };
                        infoMoveScreen.scrollsValues.h = contentScreen.scrollTop;
                        infoMoveScreen.scrollsValues.w = contentScreen.scrollLeft;
                        setStyle(screen, { cursor: "grabbing" });
                    },
                    move: ({ x, y }) => {
                        const { x: bx, y: by } = infoMoveScreen.mousePosition;
                        contentScreen.scrollTop = infoMoveScreen.scrollsValues.h + by - y;
                        contentScreen.scrollLeft = infoMoveScreen.scrollsValues.w + bx - x;
                    },
                    up: () => {
                        status.isClick = false;
                        setStyle(screen, { cursor: null });
                    }
                }
            return (eventName, e) => typesEventName[eventName](getMousePosition(contentScreen, e));
        })(),
        addEventsToElements = () => {
            contentScreen.addEventListener("mousedown", e => moveScreen("down", e));
            document.addEventListener("mouseup", e => moveScreen("up", e));
            document.addEventListener("mouseleave", e => moveScreen("up", e));
            document.addEventListener("mousemove", e => {
                const { x, y } = getMousePosition(screen, e);
                const { width, height } = canvas.image;
                mousePosition.update({
                    x: parseInt((width / screen.offsetWidth) * x), y: parseInt((height / screen.offsetHeight) * y)
                });
                if (status.isClick) { moveScreen("move", e) };
            });
            document.addEventListener("wheel", e => {
                preventDefaultAction(e);
                if (e.deltaY < 0) { zoom("zoomIn", false, 1.055); }
                else { zoom("zoomOut", false, 1.055); }
                const posContentTelas = getMousePosition(contentScreen, e);
                const { width, height } = canvas.image;
                const proporcaoPosY = mousePosition.y / height, proporcaoPosX = mousePosition.x / width;
                contentScreen.scrollTop = parseInt((contentScreen.scrollHeight * proporcaoPosY) - posContentTelas.y);
                contentScreen.scrollLeft = parseInt((contentScreen.scrollWidth * proporcaoPosX) - posContentTelas.x);
            }, { passive: false });
            window.addEventListener("resize", () => zoom("percentage", true, status.zoom));
        }
    return {
        async init({ image, grid }) {
            if (!image || !grid) { console.log("appObject incompleted!"); }
            canvas.image = image;
            canvas.grid = grid;
            adjustInVisualizationScreen();
            addEventsToElements();
        },
    }
}