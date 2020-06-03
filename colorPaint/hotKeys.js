function hotKeysObject() {
    return {
        ctrlPressed: false,
        spacePressed: false,
        shiftPressed: false,
        infoMoveDrawWithSpace: { startCoordinate: null, scroolTop: null, scrollLeft: null },
        addEventsToElements() {
            document.addEventListener("keydown", (e) => this.keyDownEvent(e));
            document.addEventListener("keyup", (e) => this.keyUpEvent(e));
            document.addEventListener("mouseup", (e) => this.mouseUpMoveDraw(e));
            project.screen.addEventListener("mousedown", (e) => this.mouseDownMoveDraw(e));
        },
        keyDownEvent(e) {
            if (drawingTools.painting) { e.preventDefault(); return; }
            if (this.ctrlPressed) {//Teclas de atalho com o ctrl.
                const keyFunction = this.hotKeysWithCtrl[e.code];
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
                this.infoMoveDrawWithSpace = { startCoordinate: null, scroolTop: null, scrollLeft: null };
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
                drawingTools.selectDrawingTool(drawingTools.arrayTools.length - 1);//Muda para a ferramenta conta gotas.
            }
        },
        keyUpControl() {
            this.ctrlPressed = false;
            if (drawingTools.previousTool === 0 && drawingTools.selectedTool === drawingTools.arrayTools.length - 1) {
                drawingTools.cursorTool.eyeDropper.cursor.style.display = "none";
                drawingTools.selectDrawingTool(0);//Volta para a ferramenta pincel.                
            }
        },
        keyDownSpace() {
            if (!this.spacePressed) {
                this.spacePressed = true;
                project.screen.style.cursor = "grab";
                drawingTools.cursorTool.cursor.style.display = "none";
            }
        },
        keyUpSpace() {
            this.spacePressed = false;
            document.removeEventListener("mousemove", hotKeys.mouseMoveMoveDraw);
            project.screen.style.cursor = "";
            if (drawingTools.cursorTool.show) { drawingTools.cursorTool.cursor.style.display = "block"; }
        },
        moveDrawWithSpace(mousePosition) {
            const newScrollLeft = this.infoMoveDrawWithSpace.scrollLeft + this.infoMoveDrawWithSpace.startCoordinate.x - mousePosition.x;
            const newScrollTop = this.infoMoveDrawWithSpace.scroolTop + this.infoMoveDrawWithSpace.startCoordinate.y - mousePosition.y;
            contentTelas.scrollLeft = newScrollLeft;
            contentTelas.scrollTop = newScrollTop;
        },
        mouseDownMoveDraw(e) {
            if (this.spacePressed) {
                document.addEventListener("mousemove", hotKeys.mouseMoveMoveDraw);
                this.infoMoveDrawWithSpace = { startCoordinate: getMousePosition(contentTelas, e), scroolTop: contentTelas.scrollTop, scrollLeft: contentTelas.scrollLeft };
                e.currentTarget.style.cursor = "grabbing";
            }
        },
        mouseMoveMoveDraw(e) {
            hotKeys.moveDrawWithSpace(getMousePosition(contentTelas, e));
        },
        mouseUpMoveDraw(e) {
            if (this.spacePressed) {
                document.removeEventListener("mousemove", hotKeys.mouseMoveMoveDraw);
                this.infoMoveDrawWithSpace = { startCoordinate: null, scroolTop: null, scrollLeft: null };
                project.screen.style.cursor = "grab";
            }
        },
        changeToolSizeHotKey(increase) {
            let pos = drawingTools.toolSizeBar.cursor.offsetLeft + 7;
            if (increase === true) { pos += 1; } //Aumenta o tamanho da ferramenta.
            else { pos -= 1; }//Diminui o tamanho da ferramenta.
            drawingTools.applyToolSize(pos)
        },
        hotKeysWithCtrl: {
            Digit0() {
                project.adjustInVisualizationScreen();
            },
            Digit1() {
                project.zoom("porcentagem", true, 100);
            },
            Minus() {
                project.zoom(false, true, 1.25);
            },
            Equal() {
                project.zoom(true, true, 1.25);
            },
            KeyZ() {
                undoRedoChange.undoChange();
            },
            KeyY() {
                undoRedoChange.redoChange();
            },
        },
    }
}