import { getElement, createCopyCanvas, createEventEmitterToObservers, preventDefaultAction } from "../js/utils.js";

export default function undoRedoChangeObject({ project }) {
    const observers = createEventEmitterToObservers(["restoreChange"]);
    const changeLimit = 20;
    const changes = { undone: [], redone: [] }
    const buttons = { undo: getElement("bttDesfazer"), redo: getElement("bttRefazer") };
    const enableButtons = () => {
        if (changes.undone.length) { buttons.undo.classList.replace("semAlteracoes", "comAlteracoes"); }
        else { buttons.undo.classList.replace("comAlteracoes", "semAlteracoes"); }
        if (changes.redone.length) { buttons.redo.classList.replace("semAlteracoes", "comAlteracoes"); }
        else { buttons.redo.classList.replace("comAlteracoes", "semAlteracoes"); }
    }
    const undoChange = () => {
        if (!changes.undone.length || project.toolInUse) { return; }
        const { layerChanged, change } = changes.undone.pop();
        changes.redone.push({ layerChanged, change: createCopyCanvas(layerChanged.layer.canvas) });
        observers.notify("restoreChange", { layerChanged, change });
        enableButtons();
    }
    const redoChange = () => {
        if (!changes.redone.length || project.toolInUse) { return; }
        const { layerChanged, change } = changes.redone.pop();
        changes.undone.push({ layerChanged, change: createCopyCanvas(layerChanged.layer.canvas) });
        observers.notify("restoreChange", { layerChanged, change });
        enableButtons();
    }
    const saveChanges = () => {
        if (changes.undone.length === changeLimit) { changes.undone.shift(); }
        changes.undone.push({ layerChanged: project.selectedLayer, change: createCopyCanvas(project.selectedLayer.layer.canvas) });
        changes.redone.clear();
        enableButtons();
    }
    const onHotKeys = (() => {
        const withCtrl = { KeyZ: undoChange, KeyY: redoChange }
        return ({ pressed, e }) => {
            if (!pressed) { return }
            const fn = e.ctrlKey ? withCtrl[e.code] : false;
            if (!fn) { return; }
            preventDefaultAction(e);
            fn();
        }
    })();
    buttons.redo.addEventListener("mousedown", redoChange);
    buttons.undo.addEventListener("mousedown", undoChange);
    return {
        get lastChange() { return changes.undone.last.change; }, onHotKeys,
        saveChanges, undoChange, redoChange, addObservers: observers.add
    }
}