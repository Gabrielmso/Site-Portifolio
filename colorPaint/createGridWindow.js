function createGridWindowObject() {
    return {
        gridProprieties: {
            screen: document.getElementById("grid"),
            size: 80,
            position: { x: 0, y: 0 },
            visible: false,
        },
        previousVisualization: { scrollX: 0, scrollY: 0, zoom: 0 },
        contentWindow: document.getElementById("contentJanelaMenuGrid"),
        inputs: {
            size: document.getElementById("txtTamanhoGrid"),
            horizontalPosition: document.getElementById("txtPosicaoHorizontalGrid"),
            verticalPosition: document.getElementById("txtPosicaoVerticalGrid"),
        },
        buttons: {
            ok: document.getElementById("bttOkGrid"),
            cancel: document.getElementById("bttcancelarGrid")
        },
        addEventsToElements() {
            this.inputs.size.addEventListener("change", (e) => {
                const num = parseInt(e.target.value);
                if (!isNaN(num) && num > 0) {
                    this.gridProprieties.size = num;
                    this.createGrid(true);
                }
            });
            this.inputs.horizontalPosition.addEventListener("change", (e) => {
                const num = parseInt(e.target.value);
                if (!isNaN(num)) {
                    this.gridProprieties.position.x = num;
                    this.createGrid(true);
                }
            });
            this.inputs.verticalPosition.addEventListener("change", (e) => {
                const num = parseInt(e.target.value);
                if (!isNaN(num)) {
                    this.gridProprieties.position.y = num;
                    this.createGrid(true);
                }
            });

            this.buttons.ok.addEventListener("mousedown", () => this.close());
            this.buttons.cancel.addEventListener("mousedown", () => {
                this.createGrid(false);
                this.close();
            });
        },
        open() {
            if (project.created) {
                this.previousVisualization = {
                    scrollX: contentTelas.scrollLeft, scrollY: contentTelas.scrollTop,
                    zoom: parseFloat(((txtPorcentagemZoom.value).replace("%", "")).replace(",", "."))
                };
                this.inputs.size.value = this.gridProprieties.size;
                this.inputs.horizontalPosition.value = this.gridProprieties.position.x;
                this.inputs.verticalPosition.value = this.gridProprieties.position.y;
                this.contentWindow.style.display = "block";
                this.addEventsToElements();
                ajustarNaVisualizacaoTelasCanvas();
                if (!this.gridProprieties.visible) { this.createGrid(true); }
            }
            else { alert("Nenhum projeto criado!"); }
        },
        close() {
            const bttOk = this.buttons.ok.cloneNode(true), bttCancel = this.buttons.cancel.cloneNode(true),
                txtSize = this.inputs.size.cloneNode(true), txtPositionHorizontal = this.inputs.horizontalPosition.cloneNode(true),
                txtPositionVertical = this.inputs.verticalPosition.cloneNode(true);
            this.buttons.ok.parentNode.insertBefore(bttOk, this.buttons.ok);
            this.buttons.ok.remove();
            this.buttons.ok = bttOk;
            this.buttons.cancel.parentNode.insertBefore(bttCancel, this.buttons.cancel);
            this.buttons.cancel.remove();
            this.buttons.cancel = bttCancel;
            this.inputs.size.parentNode.insertBefore(txtSize, this.inputs.size);
            this.inputs.size.remove();
            this.inputs.size = txtSize;
            this.inputs.horizontalPosition.parentNode.insertBefore(txtPositionHorizontal, this.inputs.horizontalPosition);
            this.inputs.horizontalPosition.remove();
            this.inputs.horizontalPosition = txtPositionHorizontal;
            this.inputs.verticalPosition.parentNode.insertBefore(txtPositionVertical, this.inputs.verticalPosition);
            this.inputs.verticalPosition.remove();
            this.inputs.verticalPosition = txtPositionVertical;
            this.contentWindow.style.display = "none";
            this.adjustPreviousVisualization();
        },
        createGrid(create) {
            const screen = this.gridProprieties.screen, size = this.gridProprieties.size, pos = this.gridProprieties.position,
                numDeQuadrados = (Math.trunc((project.properties.resolution.width / size) + 2.099)) * (Math.trunc((project.properties.resolution.height / size) + 2.099));
            if (numDeQuadrados > 5700) {
                alert("Aumente o tamanho da grade!");
                return;
            } else if (numDeQuadrados > 1100) { alert("O tamanho da grade está muito baixo, isso pode acarretar problemas de performance!"); }
            let el = screen.firstElementChild;
            while (el != null) {
                el.remove();
                el = screen.firstElementChild;
            }
            if (create) {
                const position = {
                    x: (((pos.x / size) - (Math.trunc(pos.x / size))) * size), y: (((pos.y / size) - (Math.trunc(pos.y / size))) * size)
                }
                if (position.x < 0) { position.x += size };
                if (position.y < 0) { position.y += size };
                const larguraTela = (project.properties.resolution.width + (size * 2.1)),
                    alturaTela = (project.properties.resolution.height + (size * 2.1));
                const larguraQuadrado = ((size / larguraTela) * 100), alturaQuadrado = ((size / alturaTela) * 100);
                const styleQuadrado = "width: " + larguraQuadrado + "%; height: " + alturaQuadrado + "%;";
                screen.style.top = (-100 * ((size - position.y) / project.properties.resolution.height)) + "%";
                screen.style.left = (-100 * ((size - position.x) / project.properties.resolution.width)) + "%";
                screen.style.width = ((larguraTela / project.properties.resolution.width) * 100) + "%";
                screen.style.height = ((alturaTela / project.properties.resolution.height) * 100) + "%";
                for (let i = 0; i < numDeQuadrados; i++) {
                    const quadrado = document.createElement("div");
                    quadrado.setAttribute("class", "quadrado");
                    quadrado.setAttribute("style", styleQuadrado);
                    screen.appendChild(quadrado);
                }
            }
            this.gridProprieties.visible = create;
        },
        adjustPreviousVisualization() {
            project.zoom("porcentagem", false, this.previousVisualization.zoom);
            contentTelas.scrollTop = this.previousVisualization.scrollY;
            contentTelas.scrollLeft = this.previousVisualization.scrollX;
        }
    }
}