function hotKeysObject() {
    return {
        ctrlPressed: false,
        spacePressed: false,
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
            }
        },
        keyUpSpace() {
            this.spacePressed = false;
            telasCanvas.style.cursor = "";
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