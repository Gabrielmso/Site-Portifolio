export default function createGridObject() {
    const D = {}, properties = { size: 50, color: null, position: null },
        renderGrid = () => {

        },
        createGrid = () => {

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
        init() {
            createGrid();
            delete this.createGrid;
        },
        addDependencies(dependencies) {
            for (const prop in dependencies) { D[prop] = dependencies[prop]; }
        }
    }
}