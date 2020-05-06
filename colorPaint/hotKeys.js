function hotKeysObject() {
    return {
        ctrlPressed: false,
        spacePressed: false,
        shiftPressed: false,
        infoMoveDrawWithSpace: { move: false, startCoordinate: null, scroolTop: null, scrollLeft: null },
        addEventsToElements() {
            document.addEventListener("keydown", (e) => this.keyDownEvent(e));
            document.addEventListener("keyup", (e) => this.keyUpEvent(e));
            document.addEventListener("mouseup", (e) => this.mouseUpMoveDraw(e));
            project.screen.addEventListener("mousedown", (e) => this.mouseDownMoveDraw(e));
            document.addEventListener("mousemove", (e) => this.mouseMoveMoveDraw(e));
        },
        keyDownEvent(e) {
            if (!project.created) { return; }
            if (drawingTools.painting) { e.preventDefault(); return; }
            if (this.ctrlPressed) {//Teclas de atalho com o ctrl.
                const keyFunction = this.keyDown[e.code];
                if (keyFunction) {
                    e.preventDefault();
                    drawingTools.clickToCurve = false;
                    keyFunction();
                }
            }
            else {
                if (e.code === "BracketRight") {//Aumentar o tamanho da ferramenta.
                    this.changeToolSizeHotKey(true);
                } else if (e.code === "Backslash") {//Diminuir o tamanho da ferramenta.
                    this.changeToolSizeHotKey(false);
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
                this.infoMoveDrawWithSpace = { move: false, startCoordinate: null, scroolTop: null, scrollLeft: null };
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
                drawingTools.selectDrawingTool(6);//Muda para a ferramenta conta gotas.
            }
        },
        keyUpControl() {
            this.ctrlPressed = false;
            if (drawingTools.previousTool === 0 && drawingTools.selectedTool === 6) {
                drawingTools.arrayTools[drawingTools.selectedTool].cursor.eyeDropper.style.display = "none";
                drawingTools.selectDrawingTool(0);//Volta para a ferramenta pincel.                
            }
        },
        keyDownSpace() {
            if (this.spacePressed === false) {
                this.spacePressed = true;
                project.screen.style.cursor = "grab";
                drawingTools.cursorTool.cursor.style.display = "none";
            }
        },
        keyUpSpace() {
            this.spacePressed = false;
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
                this.infoMoveDrawWithSpace = { move: true, startCoordinate: getMousePosition(contentTelas, e), scroolTop: contentTelas.scrollTop, scrollLeft: contentTelas.scrollLeft };
                e.currentTarget.style.cursor = "grabbing";
            }
        },
        mouseMoveMoveDraw(e) {
            if (this.infoMoveDrawWithSpace.move) { this.moveDrawWithSpace(getMousePosition(contentTelas, e)); }
        },
        mouseUpMoveDraw(e) {
            if (this.spacePressed) {
                this.infoMoveDrawWithSpace = { move: false, startCoordinate: null, scroolTop: null, scrollLeft: null };
                project.screen.style.cursor = "grab";
            }
        },
        changeToolSizeHotKey(increase) {
            if (increase === true) {//Aumenta o tamanho da ferramenta.
                if (drawingTools.toolProperties.size === 0.5) {
                    drawingTools.toolProperties.size = 1;
                    drawingTools.toolSizeBar.cursor.style.left = 1 - 7 + "px";
                } else if (drawingTools.toolProperties.size < 15) {
                    drawingTools.toolProperties.size += 1;
                    drawingTools.toolSizeBar.cursor.style.left = drawingTools.toolProperties.size - 7 + "px";
                } else if (drawingTools.toolProperties.size >= 15 && drawingTools.toolProperties.size <= 245) {
                    drawingTools.toolProperties.size += 5;
                    drawingTools.toolSizeBar.cursor.style.left = drawingTools.toolProperties.size - 7 + "px";
                } else if (drawingTools.toolProperties.size > 245) {
                    drawingTools.toolProperties.size = 250;
                    drawingTools.toolSizeBar.cursor.style.left = drawingTools.toolProperties.size - 7 + "px";
                }
            } else {//Diminui o tamanho da ferramenta.
                if (drawingTools.toolProperties.size <= 250 && drawingTools.toolProperties.size > 15) {
                    drawingTools.toolProperties.size -= 5;
                    drawingTools.toolSizeBar.cursor.style.left = drawingTools.toolProperties.size - 7 + "px";
                } else if (drawingTools.toolProperties.size <= 15 && drawingTools.toolProperties.size > 1) {
                    drawingTools.toolProperties.size -= 1;
                    drawingTools.toolSizeBar.cursor.style.left = drawingTools.toolProperties.size - 7 + "px";
                } else if (drawingTools.toolProperties.size === 1) {
                    drawingTools.toolProperties.size = 0.5;
                    drawingTools.toolSizeBar.cursor.style.left = "-7px"
                }
            }
            drawingTools.toolSizeBar.txt.value = drawingTools.toolProperties.size + "px";
            drawingTools.changeCursorTool();
        },
        keyDown: {
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
                undoRedoChange.redoChange();;
            },
        },
    }
}