function undoRedoChangeObject() {
    return {
        buttons: { undo: document.getElementById("bttDesfazer"), redo: document.getElementById("bttRefazer") },
        changes: { undone: [], redone: [] },
        addEventsToElements() {
            this.buttons.redo.addEventListener("mousedown", () => this.redoChange());
            this.buttons.undo.addEventListener("mousedown", () => this.undoChange());
        },
        saveChanges(layer) {
            const objAlteracao = {
                camadaAlterada: camadaSelecionada,
                alteracao: layer.getImageData(0, 0, project.properties.resolution.width, project.properties.resolution.height)
            };
            this.changes.undone.push(objAlteracao);
            if (this.changes.undone.length > 20) {
                this.changes.undone.shift();
            }
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
            if (this.changes.undone.length > 0) {
                const ultimoIndice = this.changes.undone.length - 1,
                    camada = this.changes.undone[ultimoIndice].camadaAlterada,
                    imagemCamada = this.changes.undone[ultimoIndice].alteracao,
                    objAlteracao = { camadaAlterada: camada, visivel: project.arrayLayers[camada].visivel, alteracao: project.arrayLayers[camada].ctx.getImageData(0, 0, project.properties.resolution.width, project.properties.resolution.height) };
                if (camadaSelecionada != camada) { clickIconeCamada.call(project.arrayLayers[camada].icone); }
                if (project.arrayLayers[camada].visivel === false) {
                    clickCamadaVisivel.call(project.arrayLayers[camada].bttVer);
                    return;
                }
                this.changes.redone.push(objAlteracao);
                drawingTools.clickToCurve = false;
                project.eventLayer.clearRect(0, 0, project.properties.resolution.width, project.properties.resolution.height);
                project.arrayLayers[camada].ctx.clearRect(0, 0, project.properties.resolution.width, project.properties.resolution.height);
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
                desenhoNoPreviewEIcone(project.arrayLayers[camada]);
                desenhoCompleto();
            }
        },
        redoChange() {
            if (this.changes.redone.length > 0) {
                const ultimoIndice = this.changes.redone.length - 1,
                    camada = this.changes.redone[ultimoIndice].camadaAlterada,
                    imagemCamada = this.changes.redone[ultimoIndice].alteracao,
                    objAlteracao = { camadaAlterada: camada, visivel: project.arrayLayers[camada].visivel, alteracao: project.arrayLayers[camada].ctx.getImageData(0, 0, project.properties.resolution.width, project.properties.resolution.height) };
                if (camadaSelecionada != camada) { clickIconeCamada.call(project.arrayLayers[camada].icone); }
                this.changes.undone.push(objAlteracao);
                project.arrayLayers[camada].ctx.clearRect(0, 0, project.properties.resolution.width, project.properties.resolution.height);
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
                desenhoNoPreviewEIcone(project.arrayLayers[camada]);
                desenhoCompleto();
            }
        }
    }
}