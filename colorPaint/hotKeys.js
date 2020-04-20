function hotKeysObject() {
    return {
        ctrlPressed: false,
        spacePressed: false,
        shiftPressed: false,
        addEventsToElements() {
            document.addEventListener("keydown", (e) => this.keyDownEvent(e));
            document.addEventListener("keyup", (e) => this.keyUpEvent(e));
        },
        keyDownEvent(e) {
            if (projetoCriado === false) { return; }
            if (drawingTools.painting === true) { e.preventDefault(); return; }
            if (this.ctrlPressed === true) {//Teclas de atalho com o ctrl.
                const keyFunction = this.keyDown[e.code];
                if (keyFunction) {
                    e.preventDefault();
                    drawingTools.clickToCurve = false;
                    keyFunction();
                }
            }
            else {
                if (e.code === "BracketRight") {//Aumentar o tamanho da ferramenta.
                    drawingTools.changeToolSizeHotKey(true);
                }
                else if (e.code === "Backslash") {//Diminuir o tamanho da ferramenta.
                    drawingTools.changeToolSizeHotKey(false);
                }
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
                this.shiftPressed = true;
            }
        },
        keyUpEvent(e) {
            if (e.code === "ControlRight" || e.code === "ControlLeft" || e.keyCode === 17) {
                e.preventDefault();
                this.keyUpControl();
            }
            if (e.code === "Space") {
                e.preventDefault();
                moverDesenhoEspaco.mover = false;
                this.keyUpSpace();
            }
            if (e.code === "ShiftLeft") {
                e.preventDefault();
                this.shiftPressed = false;
            }
        },
        keyDownControl() {
            this.ctrlPressed = true;
            if (drawingTools.selectedTool === 0) {
                drawingTools.previousTool = 0;
                drawingTools.arrayTools[6].tool.click();//Muda para a ferramenta conta gotas.
            }
        },
        keyUpControl() {
            this.ctrlPressed = false;
            if (drawingTools.previousTool === 0 && drawingTools.selectedTool === 6) {
                drawingTools.arrayTools[drawingTools.selectedTool].cursor.eyeDropper.style.display = "none";
                drawingTools.arrayTools[0].tool.click();//Volta para a ferramenta pincel.                
                drawingTools.previousTool = null;
            }
        },
        keyDownSpace() {
            if (this.spacePressed === false) {
                this.spacePressed = true;
                telasCanvas.style.cursor = "grab";
                drawingTools.cursorTool.cursor.style.display = "none";
            }
        },
        keyUpSpace() {
            this.spacePressed = false;
            telasCanvas.style.cursor = "";
            if (drawingTools.cursorTool.show) { drawingTools.cursorTool.cursor.style.display = "block"; }
        },
        keyDown: {
            Digit0() {
                ajustarNaVisualizacaoTelasCanvas();
            },
            Digit1() {
                zoomNoProjeto("porcentagem", true, 100);
            },
            Minus() {
                zoomNoProjeto(false, true, 1.25);
            },
            Equal() {
                zoomNoProjeto(true, true, 1.25);
            },
            KeyZ() {
                undoRedoChange.undoChange();
            },
            KeyY() {
                undoRedoChange.redoChange();;
            },
        },
    }
}