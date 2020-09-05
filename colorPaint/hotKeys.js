function hotKeysObject() {
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
            if (drawingTools.painting) { e.preventDefault(); return; }
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
            if (drawingTools.selectedTool === 0) {
                drawingTools.selectDrawingTool(drawingTools.arrayTools.length - 1);//Muda para a ferramenta conta gotas.
            }
        },
        keyUpControl() {
            this.ctrlPressed = false;
            if (drawingTools.previousTool === 0 && drawingTools.mouseFunctionName === "eyeDropper") {
                drawingTools.selectDrawingTool(0);//Volta para a ferramenta pincel.                
            }
        },
        keyDownSpace() {
            contentTelas.style.cursor = "grab";
            drawingTools.mouseFunctionName = "moveScreen";
            drawingTools.cursorTool.invisibleCursor();
        },
        keyUpSpace() {
            drawingTools.moveScreen("mouseup");
            drawingTools.selectDrawingTool(drawingTools.selectedTool);
        },
        keyDownShift() {
            this.shiftPressed = true;
        },
        keyUpShift() {
            this.infoTraceUsedShift = { sizeX: 0, sizeY: 0 };
            this.shiftPressed = false;
            drawingTools.selectDrawingTool(drawingTools.selectedTool);
        },
        changeToolSizeHotKey(increase) {
            const value = increase ? +(drawingTools.toolSizeBar.bar.value) + 0.01 : +(drawingTools.toolSizeBar.bar.value) - 0.01;
            drawingTools.changeToolSize(value);
        },
        hotKeysWithShift: {
            KeyA: () => drawingTools.mouseFunctionName = "changeToolSizeCursor",
            KeyS: () => drawingTools.mouseFunctionName = "changeToolOpacityCursor",
            KeyD: () => drawingTools.mouseFunctionName = "changeToolHardnessCursor"
        },
        hotKeysWithCtrl: {
            Digit0: () => project.adjustInVisualizationScreen(),
            Digit1: () => project.zoom("porcentagem", true, 100),
            Minus: () => project.zoom(false, true, 1.25),
            Equal: () => project.zoom(true, true, 1.25),
            KeyZ: () => undoRedoChange.undoChange(),
            KeyY: () => undoRedoChange.redoChange(),
        },
    }
}