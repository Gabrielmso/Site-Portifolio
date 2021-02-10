import { setStyle, createEventEmitterToObservers } from "../js/utils.js";

export default function hotKeysObject() {
    const observers = createEventEmitterToObservers(["hotKey"]);
    const keyDownEvent = e => observers.notify("hotKey", { pressed: true, e })
    const keyUpEvent = e => observers.notify("hotKey", { pressed: false, e })

    document.addEventListener("keydown", keyDownEvent);
    document.addEventListener("keyup", keyUpEvent);

    document.addEventListener("keydown", e => {
        if (e.code === "F5") { preventDefaultAction(e); }
    });
    // hotKeysWithShift = {
    //     KeyA: () => D.drawingTools.mouseFunctionName = "changeToolSizeCursor",
    //     KeyS: () => D.drawingTools.mouseFunctionName = "changeToolOpacityCursor",
    //     KeyD: () => D.drawingTools.mouseFunctionName = "changeToolHardnessCursor"
    // },
    // keyDownEvent = e => {
    //     if (D.drawingTools.painting) { e.preventDefault(); return; }
    //     if (status.ctrlPressed) {
    //         const keyFunction = hotKeysWithCtrl[e.code];
    //         if (!keyFunction) { return; }
    //         e.preventDefault();
    //         keyFunction();
    //     } else if (status.shiftPressed) {
    //         const keyFunction = hotKeysWithShift[e.code];
    //         if (!keyFunction) { return; }
    //         e.preventDefault();
    //         keyFunction();
    //     }
    //     const keyFunction = keyCodeEventKeyDown[e.code];
    //     if (keyFunction) {
    //         e.preventDefault();
    //         keyFunction();
    //     }
    //     const mainKeysFunction = mainKeysEventKeyDown[e.key];
    //     if (mainKeysFunction) {
    //         e.preventDefault()
    //         mainKeysFunction();
    //     }
    // },
    // keyUpEvent = e => {
    //     const mainKeysFunction = mainKeysEventKeyUp[e.key];
    //     if (mainKeysFunction) {
    //         e.preventDefault();
    //         mainKeysFunction();
    //         return;
    //     }
    //     const keyCodeFunction = keyCodeEventKeyUp[e.code];
    //     if (keyCodeFunction) {
    //         e.preventDefault();
    //         keyCodeFunction();
    //     }
    // };
    return { addObservers: observers.add }
}