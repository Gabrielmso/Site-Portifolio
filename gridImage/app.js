export default function appObject() {
    const D = {}, canvas = {};




    return {
        set canvasImage(ctx) { canvas.image = ctx; },
        set canvasGrid(ctx) { canvas.grid = ctx; },
        addDependencies(dependencies) {
            for (const prop in dependencies) { D[prop] = dependencies[prop]; }
        }
    }
}