function undoRedoChangeObject() {
    return {
        buttons: { undo: document.getElementById("bttDesfazer"), redo: document.getElementById("bttRefazer") },
        changes: { undone: [], redone: [] },
        addEventsToElements() {
            this.buttons.redo.addEventListener("mousedown", () => this.redoChange());
            this.buttons.undo.addEventListener("mousedown", () => this.undoChange());
        },
        saveChanges() {
            const objAlteracao = {
                numLayer: project.selectedLayer,
                change: project.arrayLayers[project.selectedLayer].ctx.getImageData(0, 0, project.properties.resolution.width, project.properties.resolution.height)
            };
            this.changes.undone.push(objAlteracao);
            if (this.changes.undone.length > 20) { this.changes.undone.shift(); }
            if (this.changes.redone.length > 0 || this.changes.undone.length === 1) {
                this.buttons.undo.classList.add("bttHover");
                this.buttons.undo.classList.add("cursor");
                this.buttons.undo.style.opacity = "1";
                this.buttons.redo.classList.remove("bttHover");
                this.buttons.redo.classList.remove("cursor");
                this.buttons.redo.style.opacity = "0.5";
            }
            this.changes.redone = [];
        },
        undoChange() {
            if (drawingTools.clickToCurve) {
                const backPreviousTool = drawingTools.previousTool;
                drawingTools.selectDrawingTool(5);
                drawingTools.previousTool = backPreviousTool;
                return;
            }
            if (this.changes.undone.length > 0) {
                const ultimoIndice = this.changes.undone.length - 1,
                    camada = this.changes.undone[ultimoIndice].numLayer,
                    imagemCamada = this.changes.undone[ultimoIndice].change,
                    objAlteracao = {
                        numLayer: camada,
                        change: project.arrayLayers[camada].ctx.getImageData(0, 0, project.properties.resolution.width, project.properties.resolution.height)
                    };
                if (project.selectedLayer != camada) { project.clickIconLayer(camada); }
                if (!project.arrayLayers[camada].visible) {
                    project.clickBttLook(camada);
                    return;
                }
                this.changes.redone.push(objAlteracao);
                project.arrayLayers[camada].ctx.putImageData(imagemCamada, 0, 0);
                this.changes.undone.pop();
                if (this.changes.undone.length === 0) {
                    this.buttons.undo.classList.remove("bttHover");
                    this.buttons.undo.classList.remove("cursor");
                    this.buttons.undo.style.opacity = "0.5";
                }
                if (this.changes.redone.length === 1) {
                    this.buttons.redo.classList.add("bttHover");
                    this.buttons.redo.classList.add("cursor");
                    this.buttons.redo.style.opacity = "1";
                }
                project.drawInPreview(project.arrayLayers[camada]);
            }
        },
        redoChange() {
            if (this.changes.redone.length > 0) {
                if (drawingTools.clickToCurve) {
                    const backPreviousTool = drawingTools.previousTool;
                    drawingTools.selectDrawingTool(5);
                    drawingTools.previousTool = backPreviousTool;
                }
                const ultimoIndice = this.changes.redone.length - 1,
                    camada = this.changes.redone[ultimoIndice].numLayer,
                    imagemCamada = this.changes.redone[ultimoIndice].change,
                    objAlteracao = {
                        numLayer: camada,
                        change: project.arrayLayers[camada].ctx.getImageData(0, 0, project.properties.resolution.width, project.properties.resolution.height)
                    };
                if (project.selectedLayer != camada) { project.clickIconLayer(camada); }
                this.changes.undone.push(objAlteracao);
                project.arrayLayers[camada].ctx.putImageData(imagemCamada, 0, 0);
                this.changes.redone.pop();
                if (this.changes.undone.length === 1) {
                    this.buttons.undo.classList.add("bttHover");
                    this.buttons.undo.classList.add("cursor");
                    this.buttons.undo.style.opacity = "1";
                }
                if (this.changes.redone.length === 0) {
                    this.buttons.redo.classList.remove("bttHover");
                    this.buttons.redo.classList.remove("cursor");
                    this.buttons.redo.style.opacity = "0.5";
                }
                project.drawInPreview(project.arrayLayers[camada]);
            }
        }
    }
}