import { setStyle } from "../js/geral.js";

export default function hotKeysObject() {
    const D = {}, status = { ctrlPressed: false, shiftPressed: false },
        changeToolSizeHotKey = (increase) => {
            const value = increase ? D.drawingTools.toolProperties.size + 1 : D.drawingTools.toolProperties.size - 0.9;
            D.drawingTools.changeToolSize(value);
        },
        hotKeysWithShift = {
            KeyA: () => D.drawingTools.mouseFunctionName = "changeToolSizeCursor",
            KeyS: () => D.drawingTools.mouseFunctionName = "changeToolOpacityCursor",
            KeyD: () => D.drawingTools.mouseFunctionName = "changeToolHardnessCursor"
        },
        hotKeysWithCtrl = {
            Digit0: () => D.project.adjustInVisualizationScreen(),
            Digit1: () => D.project.zoom("porcentagem", true, 100),
            Minus: () => D.project.zoom(false, true, 1.25),
            Equal: () => D.project.zoom(true, true, 1.25),
            KeyZ: () => D.undoRedoChange.undoChange(),
            KeyY: () => D.undoRedoChange.redoChange(),
        },
        mainKeysEventKeyDown = {
            Shift: () => status.shiftPressed = true,
            Control: () => {
                status.ctrlPressed = true;
                if (D.drawingTools.selectedTool === "brush") {
                    D.drawingTools.selectDrawingTool("eyeDropper");
                }
            }
        },
        mainKeysEventKeyUp = {
            Shift: () => {
                status.shiftPressed = false;
                D.drawingTools.selectDrawingTool(D.drawingTools.selectedTool);
            },
            Control: () => {
                status.ctrlPressed = false;
                if (D.drawingTools.previousTool === "brush" && D.drawingTools.mouseFunctionName === "eyeDropper") {
                    D.drawingTools.selectDrawingTool("brush");
                }
            }
        },
        keyCodeEventKeyDown = {
            BracketRight: () => changeToolSizeHotKey(true),
            Backslash: () => changeToolSizeHotKey(false),
            Space: () => {
                setStyle(D.contentTelas, { cursor: "grab" });
                D.drawingTools.mouseFunctionName = "moveScreen";
                D.drawingTools.invisibleCursor();
            }
        },
        keyCodeEventKeyUp = {
            Space: () => {
                D.drawingTools.moveScreen("up");
                D.drawingTools.selectDrawingTool(D.drawingTools.selectedTool);
            }
        },
        keyDownEvent = (e) => {
            if (D.drawingTools.painting) { e.preventDefault(); return; }
            if (status.ctrlPressed) {
                const keyFunction = hotKeysWithCtrl[e.code];
                if (keyFunction) {
                    e.preventDefault();
                    keyFunction();
                }
            } else if (status.shiftPressed) {
                const keyFunction = hotKeysWithShift[e.code];
                if (keyFunction) {
                    e.preventDefault();
                    keyFunction();
                }
            } else {
                const keyFunction = keyCodeEventKeyDown[e.code];
                if (keyFunction) {
                    e.preventDefault();
                    keyFunction();
                }
            }
            const mainKeysFunction = mainKeysEventKeyDown[e.key];
            if (mainKeysFunction) {
                e.preventDefault()
                mainKeysFunction();
            }
        },
        keyUpEvent = (e) => {
            const mainKeysFunction = mainKeysEventKeyUp[e.key];
            if (mainKeysFunction) {
                e.preventDefault();
                mainKeysFunction();
                return;
            }
            const keyCodeFunction = keyCodeEventKeyUp[e.code];
            if (keyCodeFunction) {
                e.preventDefault();
                keyCodeFunction();
            }
        };
    return {
        get ctrlPressed() { return status.ctrlPressed },
        get shiftPressed() { return status.shiftPressed },
        addEventsToElements() {
            document.addEventListener("keydown", keyDownEvent);
            document.addEventListener("keyup", keyUpEvent);
            delete this.addEventsToElements;
        },
        addDependencies(dependencies) {
            for (const prop in dependencies) { D[prop] = dependencies[prop]; }
        }
    }
}