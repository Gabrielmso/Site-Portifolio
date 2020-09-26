import { getMousePosition, elementById } from "../js/geral.js";

export default function createGridWindowObject() {
    const D = {}, gridProperties = {
        screen: elementById("grid"), size: 80, position: { x: 0, y: 0 }, visible: false,
    }, previousVisualization = { scrollX: 0, scrollY: 0, zoom: 0 },
        contentWindow = elementById("contentJanelaMenuGrid"),
        window = elementById("janelaMenuGrid"), insideWindow = {
            barMoveWindow: elementById("barraMoverJanelaMenuGrid"),
            inputs: {
                size: elementById("txtTamanhoGrid"), horizontalPosition: elementById("txtPosicaoHorizontalGrid"),
                verticalPosition: elementById("txtPosicaoVerticalGrid"),
            },
            buttons: { ok: elementById("bttOkGrid"), cancel: elementById("bttcancelarGrid") },
        }, mousePositionMoveWindow = {
            x: 0, y: 0, update({ x, y }) {
                this.x = x;
                this.y = y
            }, get() { return { x: this.x, y: this.y } }
        }, createGrid = (properties, create) => {
            const screen = gridProperties.screen, size = gridProperties.size = properties.size,
                pos = gridProperties.position = properties.position,
                numDeQuadrados = (Math.trunc((D.project.properties.resolution.width / size) + 2.1)) * (Math.trunc((D.project.properties.resolution.height / size) + 2.1));
            if (numDeQuadrados > 5700) {
                D.notification.open({ name: "notify", time: 1400 },
                    { title: "Atenção!", text: "Aumente o tamanho da grade." });
                return;
            } else if (numDeQuadrados > 1100) {
                D.notification.open({ name: "notify", time: 1400 }, {
                    title: "Atenção!",
                    text: "O tamanho da grade está muito baixo, isso pode acarretar problemas de performance!"
                });
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
                const larguraTela = (D.project.properties.resolution.width + (size * 2)),
                    alturaTela = (D.project.properties.resolution.height + (size * 2));
                const larguraQuadrado = ((size / larguraTela) * 100), alturaQuadrado = ((size / alturaTela) * 100);
                const styleQuadrado = "width: " + larguraQuadrado + "%; height: " + alturaQuadrado + "%;";
                screen.style.top = (-100 * ((size - position.y) / D.project.properties.resolution.height)) + "%";
                screen.style.left = (-100 * ((size - position.x) / D.project.properties.resolution.width)) + "%";
                screen.style.width = ((larguraTela / D.project.properties.resolution.width) * 100) + "%";
                screen.style.height = ((alturaTela / D.project.properties.resolution.height) * 100) + "%";
                for (let i = 0; i < numDeQuadrados; i++) {
                    const quadrado = document.createElement("div");
                    quadrado.setAttribute("class", "quadrado");
                    quadrado.innerHTML = "<div></div>";
                    quadrado.setAttribute("style", styleQuadrado);
                    screen.appendChild(quadrado);
                }
            }
            gridProperties.visible = create;
        }, applyPreviousVisualization = () => {
            D.project.zoom("porcentagem", false, previousVisualization.zoom);
            D.contentTelas.scrollTop = previousVisualization.scrollY;
            D.contentTelas.scrollLeft = previousVisualization.scrollX;
        }, addEventsToElements = () => {
            insideWindow.inputs.size.addEventListener("change", inputSizeChange);
            insideWindow.inputs.horizontalPosition.addEventListener("change", inputHorizontalPositionChange);
            insideWindow.inputs.verticalPosition.addEventListener("change", inputVerticalPositionChange);
            insideWindow.buttons.ok.addEventListener("mousedown", close);
            insideWindow.buttons.cancel.addEventListener("mousedown", bttCancelMouseDown);
            insideWindow.barMoveWindow.addEventListener("mousedown", mouseDownEventMoveWindow);
        }, removeEventsToElements = () => {
            insideWindow.buttons.ok.removeEventListener("mousedown", close);
            insideWindow.buttons.cancel.removeEventListener("mousedown", bttCancelMouseDown);
            insideWindow.inputs.size.removeEventListener("change", inputSizeChange);
            insideWindow.inputs.horizontalPosition.removeEventListener("change", inputHorizontalPositionChange);
            insideWindow.inputs.verticalPosition.removeEventListener("change", inputVerticalPositionChange);
            insideWindow.barMoveWindow.removeEventListener("mousedown", mouseDownEventMoveWindow);
        }, close = () => {
            removeEventsToElements();
            contentWindow.style.display = "none";
            applyPreviousVisualization();
        }, moveWindow = (mousePosition) => {
            window.style.transform = "none";
            const { x, y } = mousePositionMoveWindow.get();
            let newPositionX = mousePosition.x - x, newPositionY = mousePosition.y - y;
            if (newPositionX < 0) { newPositionX = 0; }
            else if (newPositionX + window.offsetWidth > contentWindow.offsetWidth) {
                newPositionX = contentWindow.offsetWidth - window.offsetWidth;
            }
            if (newPositionY < 50) { newPositionY = 50 }
            else if (newPositionY + window.offsetHeight > contentWindow.offsetHeight) {
                newPositionY = contentWindow.offsetHeight - window.offsetHeight;
            }
            window.style.left = newPositionX + "px";
            window.style.top = newPositionY + "px";
        }, mouseDownEventMoveWindow = (e) => {
            mousePositionMoveWindow.update(getMousePosition(e.currentTarget, e));
            contentWindow.addEventListener("mousemove", mouseMoveEventMoveWindow);
            contentWindow.addEventListener("mouseup", mouseUpEventMoveWindow);
        }, mouseMoveEventMoveWindow = (e) => moveWindow(getMousePosition(contentWindow, e)),
        mouseUpEventMoveWindow = () => {
            contentWindow.removeEventListener("mousemove", mouseMoveEventMoveWindow);
            contentWindow.removeEventListener("mouseup", mouseUpEventMoveWindow);
        }, inputSizeChange = (e) => {
            const num = parseInt(e.currentTarget.value);
            if (!isNaN(num) && num > 0) {
                gridProperties.size = num;
                createGrid(gridProperties, true);
            }
        }, inputHorizontalPositionChange = (e) => {
            const num = parseInt(e.currentTarget.value);
            if (!isNaN(num)) {
                gridProperties.position.x = num;
                createGrid(gridProperties, true);
            }
        }, inputVerticalPositionChange = (e) => {
            const num = parseInt(e.currentTarget.value);
            if (!isNaN(num)) {
                gridProperties.position.y = num;
                createGrid(gridProperties, true);
            }
        }, bttCancelMouseDown = () => {
            createGrid(gridProperties, false);
            close();
        };

    return {
        set createGrid({ size, position, visible }) { createGrid({ size, position }, visible) },
        get gridProperties() {
            const { size, position, visible } = gridProperties;
            return { size, position, visible };
        },
        open() {
            if (!D.project.notifyAnyCreatedProjects()) { return; }
            previousVisualization.scrollX = D.contentTelas.scrollLeft;
            previousVisualization.scrollY = D.contentTelas.scrollTop;
            previousVisualization.zoom = parseFloat(((D.txtPorcentagemZoom.value).replace("%", "")).replace(",", "."));
            insideWindow.inputs.size.value = gridProperties.size;
            insideWindow.inputs.horizontalPosition.value = gridProperties.position.x;
            insideWindow.inputs.verticalPosition.value = gridProperties.position.y;
            contentWindow.style.display = "block";
            addEventsToElements();
            D.project.adjustInVisualizationScreen();
            if (!gridProperties.visible) { createGrid(gridProperties, true); }
        },
        addDependencies(dependencies) {
            for (const prop in dependencies) { D[prop] = dependencies[prop]; }
        }
    }
}