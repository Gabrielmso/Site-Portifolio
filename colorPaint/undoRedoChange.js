export default function undoRedoChangeObject() {
    const observers = {};
    return {
        buttons: { undo: document.getElementById("bttDesfazer"), redo: document.getElementById("bttRefazer") },
        changes: { undone: [], redone: [] },
        addEventsToElements() {
            this.buttons.redo.addEventListener("mousedown", () => this.redoChange());
            this.buttons.undo.addEventListener("mousedown", () => this.undoChange());
        },
        createCopyLayer(layer) {
            const ctxCanvas = document.createElement("canvas").getContext("2d");
            ctxCanvas.canvas.width = observers.project.properties.resolution.width;
            ctxCanvas.canvas.height = observers.project.properties.resolution.height;
            ctxCanvas.drawImage(layer, 0, 0);
            return ctxCanvas;
        },
        saveChanges() {
            this.changes.undone.push({ numLayer: observers.project.selectedLayer, change: this.createCopyLayer(observers.drawingTools.currentLayer.canvas) });
            if (this.changes.undone.length > 20) { this.changes.undone.shift(); }
            if (this.changes.redone.length > 0 || this.changes.undone.length === 1) {
                this.buttons.undo.classList.add("bttHover");
                this.buttons.undo.classList.add("cursor");
                this.buttons.undo.style.opacity = "1";
                this.buttons.redo.classList.remove("bttHover");
                this.buttons.redo.classList.remove("cursor");
                this.buttons.redo.style.opacity = "0.5";
            }
            this.changes.redone = [];
        },
        undoChange() {
            if (observers.drawingTools.clickToCurve) {
                observers.drawingTools.selectDrawingTool(5);
                return;
            }
            if (this.changes.undone.length > 0) {
                const ultimoIndice = this.changes.undone.length - 1, camada = this.changes.undone[ultimoIndice].numLayer;
                if (observers.project.selectedLayer != camada) { observers.project.clickIconLayer(camada); }
                if (!observers.project.arrayLayers[camada].visible) {
                    observers.project.clickBttLook(camada);
                    return;
                }
                this.changes.redone.push({ numLayer: camada, change: this.createCopyLayer(observers.project.arrayLayers[camada].ctx.canvas) });
                observers.drawingTools.eventLayer.clearRect(0, 0, observers.project.properties.resolution.width, observers.project.properties.resolution.height);
                observers.project.arrayLayers[camada].ctx.clearRect(0, 0, observers.project.properties.resolution.width, observers.project.properties.resolution.height);
                observers.project.arrayLayers[camada].ctx.drawImage(this.changes.undone[ultimoIndice].change.canvas, 0, 0);
                this.changes.undone.pop();
                if (this.changes.undone.length === 0) {
                    this.buttons.undo.classList.remove("bttHover");
                    this.buttons.undo.classList.remove("cursor");
                    this.buttons.undo.style.opacity = "0.5";
                }
                if (this.changes.redone.length === 1) {
                    this.buttons.redo.classList.add("bttHover");
                    this.buttons.redo.classList.add("cursor");
                    this.buttons.redo.style.opacity = "1";
                }
                observers.project.drawInPreview(observers.project.arrayLayers[camada]);
            }
        },
        redoChange() {
            if (this.changes.redone.length > 0) {
                if (observers.drawingTools.clickToCurve) { observers.drawingTools.selectDrawingTool(5); }
                const ultimoIndice = this.changes.redone.length - 1, camada = this.changes.redone[ultimoIndice].numLayer;
                if (observers.project.selectedLayer != camada) { observers.project.clickIconLayer(camada); }
                this.changes.undone.push({ numLayer: camada, change: this.createCopyLayer(observers.project.arrayLayers[camada].ctx.canvas) });
                observers.drawingTools.eventLayer.clearRect(0, 0, observers.project.properties.resolution.width, observers.project.properties.resolution.height);
                observers.project.arrayLayers[camada].ctx.clearRect(0, 0, observers.project.properties.resolution.width, observers.project.properties.resolution.height);
                observers.project.arrayLayers[camada].ctx.drawImage(this.changes.redone[ultimoIndice].change.canvas, 0, 0);
                this.changes.redone.pop();
                if (this.changes.undone.length === 1) {
                    this.buttons.undo.classList.add("bttHover");
                    this.buttons.undo.classList.add("cursor");
                    this.buttons.undo.style.opacity = "1";
                }
                if (this.changes.redone.length === 0) {
                    this.buttons.redo.classList.remove("bttHover");
                    this.buttons.redo.classList.remove("cursor");
                    this.buttons.redo.style.opacity = "0.5";
                }
                observers.project.drawInPreview(observers.project.arrayLayers[camada]);
            }
        },
        addObserver(newobservers) {
            for (const prop in newobservers) { observers[prop] = newobservers[prop]; }
        }
    }
}