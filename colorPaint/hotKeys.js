export default function hotKeysObject() {
    const D = {};
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
            if (D.drawingTools.painting) { e.preventDefault(); return; }
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
            if (e.code === "ControlRight" || e.code === "ControlLeft") {
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
            if (D.drawingTools.selectedTool === "brush") {
                D.drawingTools.selectDrawingTool("eyeDropper");//Muda para a ferramenta conta gotas.
            }
        },
        keyUpControl() {
            this.ctrlPressed = false;
            if (D.drawingTools.previousTool === "brush" && D.drawingTools.mouseFunctionName === "eyeDropper") {
                D.drawingTools.selectDrawingTool("brush");//Volta para a ferramenta pincel.                
            }
        },
        keyDownSpace() {
            D.contentTelas.style.cursor = "grab";
            D.drawingTools.mouseFunctionName = "moveScreen";
            D.drawingTools.invisibleCursor();
        },
        keyUpSpace() {
            D.drawingTools.moveScreen("up");
            D.drawingTools.selectDrawingTool(D.drawingTools.selectedTool);
        },
        keyDownShift() {
            this.shiftPressed = true;
        },
        keyUpShift() {
            this.infoTraceUsedShift = { sizeX: 0, sizeY: 0 };
            this.shiftPressed = false;
            D.drawingTools.selectDrawingTool(D.drawingTools.selectedTool);
        },
        changeToolSizeHotKey(increase) {
            const value = increase ? D.drawingTools.toolProperties.size + 1.01 : D.drawingTools.toolProperties.size - 0.9;
            D.drawingTools.changeToolSize(value);
        },
        hotKeysWithShift: {
            KeyA: () => D.drawingTools.mouseFunctionName = "changeToolSizeCursor",
            KeyS: () => D.drawingTools.mouseFunctionName = "changeToolOpacityCursor",
            KeyD: () => D.drawingTools.mouseFunctionName = "changeToolHardnessCursor"
        },
        hotKeysWithCtrl: {
            Digit0: () => D.project.adjustInVisualizationScreen(),
            Digit1: () => D.project.zoom("porcentagem", true, 100),
            Minus: () => D.project.zoom(false, true, 1.25),
            Equal: () => D.project.zoom(true, true, 1.25),
            KeyZ: () => D.undoRedoChange.undoChange(),
            KeyY: () => D.undoRedoChange.redoChange(),
        },
        addDependencies(dependencies) {
            for (const prop in dependencies) { D[prop] = dependencies[prop]; }
        }
    }
}