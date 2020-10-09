import { createElement } from "../js/geral.js";

export default function canvasGridObject() {
    const D = {}, properties = {
        size: 50,
        color: { r: 0, g: 0, b: 0 }, opacity: 1,
        position: { x: 0, y: 0 }
    },
        renderGrid = () => {
            if (!D.app.isLoad) { return; }
        },
        createGrid = () => {
            if (D.app.isLoad) { return; }
            const { width, height } = D.canvasImage.properties.resolution;
            const canvas = createElement("canvas", { class: "canvas canvasGrid", width, height })
                .getContext("2d");
            D.screen.appendChild(canvas.canvas);
            D.app.canvasGrid = canvas;
            D.app.init();
        }
    return {
        set size(num) {
            properties.size = num < 1 ? 1 : num;
            renderGrid();
        },
        set position({ x, y }) {
            properties.position = { x, y };
            renderGrid();
        },
        set color({ r, g, b }) {
            properties.color = { r, g, b };
            renderGrid();
        },
        set opacity(num) {
            properties.opacity = num;
            renderGrid();
        },
        init() {
            createGrid();
            delete this.init;
        },
        addDependencies(dependencies) {
            for (const prop in dependencies) { D[prop] = dependencies[prop]; }
        }
    }
}