// let project, createGridWindow, notification, contentTelas, txtPorcentagemZoom;
function createGridWindowObject() {
    const observers = {};
    return {
        gridProprieties: { screen: document.getElementById("grid"), size: 80, position: { x: 0, y: 0 }, visible: false, },
        previousVisualization: { scrollX: 0, scrollY: 0, zoom: 0 },
        contentWindow: document.getElementById("contentJanelaMenuGrid"),
        window: document.getElementById("janelaMenuGrid"),
        barMoveWindow: document.getElementById("barraMoverJanelaMenuGrid"),
        mousePositionMoveWindow: null,
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
                const num = parseInt(e.currentTarget.value);
                if (!isNaN(num) && num > 0) {
                    this.gridProprieties.size = num;
                    this.createGrid(true);
                }
            });
            this.inputs.horizontalPosition.addEventListener("change", (e) => {
                const num = parseInt(e.currentTarget.value);
                if (!isNaN(num)) {
                    this.gridProprieties.position.x = num;
                    this.createGrid(true);
                }
            });
            this.inputs.verticalPosition.addEventListener("change", (e) => {
                const num = parseInt(e.currentTarget.value);
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
            this.barMoveWindow.addEventListener("mousedown", (e) => this.moveWindow(getMousePosition(e.currentTarget, e), false));
        },
        open() {
            if (observers.project.created) {
                this.previousVisualization = {
                    scrollX: observers.contentTelas.scrollLeft, scrollY: observers.contentTelas.scrollTop,
                    zoom: parseFloat(((observers.txtPorcentagemZoom.value).replace("%", "")).replace(",", "."))
                };
                this.inputs.size.value = this.gridProprieties.size;
                this.inputs.horizontalPosition.value = this.gridProprieties.position.x;
                this.inputs.verticalPosition.value = this.gridProprieties.position.y;
                this.contentWindow.style.display = "block";
                this.addEventsToElements();
                observers.project.adjustInVisualizationScreen();
                if (!this.gridProprieties.visible) { this.createGrid(true); }
            }
            else {
                observers.notification.open({ title: "Atenção!", text: "Crie um novo projeto para visualizar a grade." },
                    { name: "notify", time: 2000 }, null);
            }
        },
        close() {
            this.buttons.ok = cloneReplaceElement(this.buttons.ok);
            this.buttons.cancel = cloneReplaceElement(this.buttons.cancel);
            this.inputs.size = cloneReplaceElement(this.inputs.size);
            this.inputs.horizontalPosition = cloneReplaceElement(this.inputs.horizontalPosition);
            this.inputs.verticalPosition = cloneReplaceElement(this.inputs.verticalPosition);
            this.barMoveWindow = cloneReplaceElement(this.barMoveWindow);
            this.contentWindow.style.display = "none";
            this.applyPreviousVisualization();
        },
        createGrid(create) {
            const screen = this.gridProprieties.screen, size = this.gridProprieties.size, pos = this.gridProprieties.position,
                numDeQuadrados = (Math.trunc((observers.project.properties.resolution.width / size) + 2.1)) * (Math.trunc((observers.project.properties.resolution.height / size) + 2.1));
            if (numDeQuadrados > 5700) {
                observers.notification.open({
                    title: "Atenção!",
                    text: "Aumente o tamanho da grade."
                }, { name: "notify", time: 1400 }, null);
                return;
            } else if (numDeQuadrados > 1100) {
                observers.notification.open({
                    title: "Atenção!",
                    text: "O tamanho da grade está muito baixo, isso pode acarretar problemas de performance!"
                }, { name: "notify", time: 2600 }, null);
            }
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
                const larguraTela = (observers.project.properties.resolution.width + (size * 2)),
                    alturaTela = (observers.project.properties.resolution.height + (size * 2));
                const larguraQuadrado = ((size / larguraTela) * 100), alturaQuadrado = ((size / alturaTela) * 100);
                const styleQuadrado = "width: " + larguraQuadrado + "%; height: " + alturaQuadrado + "%;";
                screen.style.top = (-100 * ((size - position.y) / observers.project.properties.resolution.height)) + "%";
                screen.style.left = (-100 * ((size - position.x) / observers.project.properties.resolution.width)) + "%";
                screen.style.width = ((larguraTela / observers.project.properties.resolution.width) * 100) + "%";
                screen.style.height = ((alturaTela / observers.project.properties.resolution.height) * 100) + "%";
                for (let i = 0; i < numDeQuadrados; i++) {
                    const quadrado = document.createElement("div");
                    quadrado.setAttribute("class", "quadrado");
                    quadrado.innerHTML = "<div></div>";
                    quadrado.setAttribute("style", styleQuadrado);
                    screen.appendChild(quadrado);
                }
            }
            this.gridProprieties.visible = create;
        },
        applyPreviousVisualization() {
            observers.project.zoom("porcentagem", false, this.previousVisualization.zoom);
            observers.contentTelas.scrollTop = this.previousVisualization.scrollY;
            observers.contentTelas.scrollLeft = this.previousVisualization.scrollX;
        },
        moveWindow(mousePosition, move) {
            if (move) {
                this.window.style.transform = "none";
                let newPositionX = mousePosition.x - this.mousePositionMoveWindow.x,
                    newPositionY = mousePosition.y - this.mousePositionMoveWindow.y;
                if (newPositionX < 0) { newPositionX = 0; }
                else if (newPositionX + this.window.offsetWidth > this.contentWindow.offsetWidth) {
                    newPositionX = this.contentWindow.offsetWidth - this.window.offsetWidth;
                }
                if (newPositionY < 50) { newPositionY = 50 }
                else if (newPositionY + this.window.offsetHeight > this.contentWindow.offsetHeight) {
                    newPositionY = this.contentWindow.offsetHeight - this.window.offsetHeight;
                }
                this.window.style.left = newPositionX + "px";
                this.window.style.top = newPositionY + "px";
            } else {
                this.mousePositionMoveWindow = mousePosition;
                this.contentWindow.addEventListener("mousemove", observers.createGridWindow.mouseMoveEvent);
                this.contentWindow.addEventListener("mouseup", createGridWindow.mouseUpEvent);
            }
        },
        mouseMoveEvent(e) {
            observers.createGridWindow.moveWindow(getMousePosition(observers.createGridWindow.contentWindow, e), true);
        },
        mouseUpEvent() {
            observers.createGridWindow.contentWindow.removeEventListener("mousemove", createGridWindow.mouseMoveEvent);
            observers.createGridWindow.contentWindow.addEventListener("mouseup", observers.createGridWindow.mouseUpEvent);
            observers.createGridWindow.mousePositionMoveWindow = null;
        },
        addObserver(newobservers) {
            for (const prop in newobservers) { observers[prop] = newobservers[prop]; }
        }
    }
}