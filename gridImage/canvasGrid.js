import { createElement } from "../js/geral.js";

export default function canvasGridObject(screen) {
    const observers = [], canvas = {
        grid: {
            ctx: null,
            size: 80,
            color: { r: 0, g: 0, b: 0 },
            opacity: 1,
            lineWidth: 1,
            position: { x: 0, y: 0 }
        }
    },
        notifyCanvasGridCreated = async canvas => {
            for (const observer of observers) { await observer(canvas); }
        },
        createGrid = async imageProperties => {
            const { width, height } = imageProperties;
            const newCanvas = createElement("canvas", { class: "canvas canvasGrid", width, height })
                .getContext("2d");
            screen.appendChild(newCanvas.canvas);
            canvas.grid.size = Math.floor(width / 10);
            canvas.grid.ctx = newCanvas;
            await notifyCanvasGridCreated({ image: imageProperties, grid: canvas.grid });
        }
    return {
        async init(imageProperties) { await createGrid(imageProperties); },
        addObservers(newObservers) { for (const observer of newObservers) { observers.push(observer); } }
    }
}