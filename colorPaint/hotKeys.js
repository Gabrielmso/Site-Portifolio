export default function hotKeysObject() {
    const observers = {};
    return {
        ctrlPressed: false, shiftPressed: false,
        infoMoveDrawWithSpace: { startCoordinate: null, scroolTop: null, scrollLeft: null },
        infoTraceUsedShift: { sizeX: 0, sizeY: 0 },
        infoShift: null,
        addEventsToElements() {
            document.addEventListener("keydown", (e) => this.keyDownEvent(e));
            document.addEventListener("keyup", (e) => this.keyUpEvent(e));
        },
        keyDownEvent(e) {
            if (observers.drawingTools.painting) { e.preventDefault(); return; }
            if (this.ctrlPressed) {//Teclas de atalho com o ctrl.
                const keyFunction = this.hotKeysWithCtrl[e.code];
                if (keyFunction) {
                    e.preventDefault();
                    keyFunction();
                }
            } else if (this.shiftPressed) {
                const keyFunction = this.hotKeysWithShift[e.code];
                if (keyFunction) {
                    e.preventDefault();
                    keyFunction();
                }
            } else {
                if (e.code === "BracketRight") { this.changeToolSizeHotKey(true); }//Aumentar o tamanho da ferramenta.
                else if (e.code === "Backslash") { this.changeToolSizeHotKey(false); }//Diminuir o tamanho da ferramenta.
            }
            if (e.code === "ControlRight" || e.code === "ControlLeft" || e.keyCode === 17) {
                e.preventDefault();
                this.keyDownControl();
            }
            if (e.code === "Space") {
                e.preventDefault();
                this.keyDownSpace();
            }
            if (e.code === "ShiftLeft") {
                e.preventDefault();
                this.keyDownShift();
            }
        },
        keyUpEvent(e) {
            if (e.code === "ControlRight" || e.code === "ControlLeft" || e.keyCode === 17) {
                e.preventDefault();
                this.keyUpControl();
            }
            if (e.code === "Space") {
                e.preventDefault();
                this.infoMoveDrawWithSpace = { startCoordinate: null, scroolTop: null, scrollLeft: null };
                this.keyUpSpace();
            }
            if (e.code === "ShiftLeft") {
                e.preventDefault();
                this.keyUpShift();
            }
        },
        keyDownControl() {
            this.ctrlPressed = true;
            if (observers.drawingTools.selectedTool === 0) {
                observers.drawingTools.selectDrawingTool(observers.drawingTools.arrayTools.length - 1);//Muda para a ferramenta conta gotas.
            }
        },
        keyUpControl() {
            this.ctrlPressed = false;
            if (observers.drawingTools.previousTool === 0 && observers.drawingTools.mouseFunctionName === "eyeDropper") {
                observers.drawingTools.selectDrawingTool(0);//Volta para a ferramenta pincel.                
            }
        },
        keyDownSpace() {
            observers.contentTelas.style.cursor = "grab";
            observers.drawingTools.mouseFunctionName = "moveScreen";
            observers.drawingTools.cursorTool.invisibleCursor();
        },
        keyUpSpace() {
            observers.drawingTools.moveScreen("mouseup");
            observers.drawingTools.selectDrawingTool(observers.drawingTools.selectedTool);
        },
        keyDownShift() {
            this.shiftPressed = true;
        },
        keyUpShift() {
            this.infoTraceUsedShift = { sizeX: 0, sizeY: 0 };
            this.shiftPressed = false;
            observers.drawingTools.selectDrawingTool(observers.drawingTools.selectedTool);
        },
        changeToolSizeHotKey(increase) {
            const value = increase ? observers.drawingTools.toolProperties.size + 1.01 : observers.drawingTools.toolProperties.size - 0.9;
            observers.drawingTools.changeToolSize(value);
        },
        hotKeysWithShift: {
            KeyA: () => observers.drawingTools.mouseFunctionName = "changeToolSizeCursor",
            KeyS: () => observers.drawingTools.mouseFunctionName = "changeToolOpacityCursor",
            KeyD: () => observers.drawingTools.mouseFunctionName = "changeToolHardnessCursor"
        },
        hotKeysWithCtrl: {
            Digit0: () => observers.project.adjustInVisualizationScreen(),
            Digit1: () => observers.project.zoom("porcentagem", true, 100),
            Minus: () => observers.project.zoom(false, true, 1.25),
            Equal: () => observers.project.zoom(true, true, 1.25),
            KeyZ: () => observers.undoRedoChange.undoChange(),
            KeyY: () => observers.undoRedoChange.redoChange(),
        },
        addObserver(newobservers) {
            for (const prop in newobservers) { observers[prop] = newobservers[prop]; }
        }
    }
}