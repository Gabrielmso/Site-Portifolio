export default function appObject() {
    const D = {}, status = { isLoad: false }, canvas = {};




    return {
        get isLoad() { return status.isLoad },
        set canvasImage(ctx) { canvas.image = ctx; },
        set canvasGrid(ctx) { canvas.grid = ctx; },
        async init() {
            status.isLoad = true;
            await D.loadImageToCanvas.finish();
            alert("Ainda está em desenvolvimento, volte em breve!");
            window.location.reload();
            delete this.init;
        },
        addDependencies(dependencies) {
            for (const prop in dependencies) { D[prop] = dependencies[prop]; }
        }
    }
}