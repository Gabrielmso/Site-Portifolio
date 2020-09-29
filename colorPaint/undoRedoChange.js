import { elementById, cloneElement } from "../js/geral.js";

export default function undoRedoChangeObject() {
    const D = {}, changeLimit = 20,
        changes = { undone: [], redone: [] },
        buttons = { undo: elementById("bttDesfazer"), redo: elementById("bttRefazer") },
        createCopyLayer = layer => {
            const ctxCanvas = cloneElement(layer).getContext("2d");
            ctxCanvas.drawImage(layer, 0, 0);
            return ctxCanvas.canvas;
        },
        enableButtons = () => {
            if (changes.undone.length) { buttons.undo.classList.replace("semAlteracoes", "comAlteracoes"); }
            else { buttons.undo.classList.replace("comAlteracoes", "semAlteracoes"); }
            if (changes.redone.length) { buttons.redo.classList.replace("semAlteracoes", "comAlteracoes"); }
            else { buttons.redo.classList.replace("comAlteracoes", "semAlteracoes"); }
        },
        applyChange = ({ numLayer, change }) => {
            const { width, height } = D.project.properties.resolution;
            D.drawingTools.eventLayer.clearRect(0, 0, width, height);
            D.project.arrayLayers[numLayer].ctx.clearRect(0, 0, width, height);
            D.project.arrayLayers[numLayer].ctx.drawImage(change, 0, 0);
        },
        undoChange = () => {
            if (D.drawingTools.clickToCurve) {
                D.drawingTools.selectDrawingTool("curve");
                return;
            }
            if (changes.undone.length) {
                const { numLayer, change } = changes.undone.pop();
                D.project.clickIconLayer(numLayer);
                if (!D.project.arrayLayers[numLayer].visible) {
                    D.project.clickBttLook(numLayer);
                    return;
                }
                changes.redone.push({ numLayer: numLayer, change: createCopyLayer(D.project.arrayLayers[numLayer].ctx.canvas) });
                applyChange({ numLayer, change });
                enableButtons();
                D.project.drawInPreview(D.project.arrayLayers[numLayer]);
            }
        },
        redoChange = () => {
            if (changes.redone.length) {
                if (D.drawingTools.clickToCurve) { D.drawingTools.selectDrawingTool("curve"); }
                const { numLayer, change } = changes.redone.pop();
                D.project.clickIconLayer(numLayer);
                changes.undone.push({ numLayer: numLayer, change: createCopyLayer(D.project.arrayLayers[numLayer].ctx.canvas) });
                applyChange({ numLayer, change });
                enableButtons();
                D.project.drawInPreview(D.project.arrayLayers[numLayer]);
            }
        },
        saveChanges = () => {
            if (changes.undone.length > changeLimit) { changes.undone.shift(); }
            changes.undone.push({ numLayer: D.project.selectedLayer, change: createCopyLayer(D.drawingTools.currentLayer.canvas) });
            changes.redone.clear();
            enableButtons();
        }

    return {
        get lastChange() { return changes.undone.last.change; },
        addEventsToElements() {
            buttons.redo.addEventListener("mousedown", redoChange);
            buttons.undo.addEventListener("mousedown", undoChange);
        },
        saveChanges,
        undoChange,
        redoChange,
        addDependencies(dependencies) {
            for (const prop in dependencies) { D[prop] = dependencies[prop]; }
        }
    }
}