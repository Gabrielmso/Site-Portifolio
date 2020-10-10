import { createElement } from "../js/geral.js";

export default function canvasGridObject() {
    const D = {}, properties = {
        size: 80,
        color: { r: 255, g: 255, b: 0 },
        opacity: 1,
        lineWidth: 1,
        position: { x: 0, y: 0 }
    },
        renderGrid = () => {
            const ctx = D.app.canvasGrid, { width, height } = D.canvasImage.properties.resolution,
                { size, color, position, opacity, lineWidth } = properties;
            ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
            ctx.globalAlpha = opacity < 0.01 ? 0.01 : opacity > 1 ? 1 : opacity;
            const line = lineWidth < 1 ? 1 : parseInt(lineWidth);
            const pos = {
                x: Math.round(((position.x / size) - (Math.trunc(position.x / size))) * size),
                y: Math.round(((position.y / size) - (Math.trunc(position.y / size))) * size)
            }
            for (let i = pos.y; i <= height; i += size) { ctx.fillRect(0, i, width, line); }
            for (let i = pos.x; i <= width; i += size) { ctx.fillRect(i, 0, line, height); }
        },
        createGrid = () => {
            if (D.app.isLoad) { return; }
            const { width, height } = D.canvasImage.properties.resolution;
            const canvas = createElement("canvas", { class: "canvas canvasGrid", width, height })
                .getContext("2d");
            D.screen.appendChild(canvas.canvas);
            D.app.canvasGrid = canvas;
            properties.size = Math.floor(width / 10);
            renderGrid();
            D.app.init();
        }
    return {
        get properties() { return properties },
        set size(num) {
            properties.size = num < 1 ? 1 : Math.round(num);
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
        set lineWidth(num) {
            properties.lineWidth = num;
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