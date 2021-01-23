import { getMousePosition, getElement, setStyle } from "../js/utils.js";

export default function createGridWindowObject() {
    const D = {},
        gridProperties = {
            screen: getElement("grid"), size: 80, position: { x: 0, y: 0 }, visible: false,
        },
        previousVisualization = { scrollX: 0, scrollY: 0, zoom: 0 },
        contentWindow = getElement("contentJanelaMenuGrid"), insideWindow = {
            barMoveWindow: getElement("barraMoverJanelaMenuGrid"),
            inputs: {
                size: getElement("txtTamanhoGrid"), horizontalPosition: getElement("txtPosicaoHorizontalGrid"),
                verticalPosition: getElement("txtPosicaoVerticalGrid"),
            },
            buttons: { ok: getElement("bttOkGrid"), cancel: getElement("bttcancelarGrid") },
        },
        createGrid = (properties, create) => {
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
                setStyle(screen, {
                    top: (-100 * ((size - position.y) / D.project.properties.resolution.height)) + "%",
                    left: (-100 * ((size - position.x) / D.project.properties.resolution.width)) + "%",
                    width: ((larguraTela / D.project.properties.resolution.width) * 100) + "%",
                    height: ((alturaTela / D.project.properties.resolution.height) * 100) + "%"
                });
                const quadrado = document.createElement("div");
                quadrado.setAttribute("class", "quadrado");
                quadrado.innerHTML = "<div></div>";
                quadrado.setAttribute("style", styleQuadrado);
                for (let i = 0; i < numDeQuadrados; i++) { screen.appendChild(quadrado.cloneNode(true)); }
            }
            gridProperties.visible = create;
        },
        applyPreviousVisualization = () => {
            D.project.zoom("porcentagem", false, previousVisualization.zoom);
            D.contentTelas.scrollTop = previousVisualization.scrollY;
            D.contentTelas.scrollLeft = previousVisualization.scrollX;
        },
        moveWindow = (() => {
            let mousePositionMoveWindow = { x: 0, y: 0, };
            const window = getElement("janelaMenuGrid"),
                move = e => {
                    e.stopPropagation();
                    const { x, y } = getMousePosition(contentWindow, e), { x: bx, y: by } = mousePositionMoveWindow;
                    const left = x - bx, top = y - by;
                    const validateLeft = left < 0 ? 0 : left + window.offsetWidth > contentWindow.offsetWidth ?
                        contentWindow.offsetWidth - window.offsetWidth : left;
                    const validateTop = top < 50 ? 50 : top + window.offsetHeight > contentWindow.offsetHeight ?
                        contentWindow.offsetHeight - window.offsetHeight : top;
                    setStyle(window, { transform: "none", left: validateLeft + "px", top: validateTop + "px" });
                },
                up = () => {
                    contentWindow.removeEventListener("mousemove", move);
                    contentWindow.removeEventListener("mouseup", up);
                },
                down = e => {
                    mousePositionMoveWindow = getMousePosition(e.currentTarget, e);
                    contentWindow.addEventListener("mousemove", move);
                    contentWindow.addEventListener("mouseup", up);
                }
            return down;
        })(),
        addEventsToElements = () => {
            insideWindow.inputs.size.addEventListener("change", inputSizeChange);
            insideWindow.inputs.horizontalPosition.addEventListener("change", inputHorizontalPositionChange);
            insideWindow.inputs.verticalPosition.addEventListener("change", inputVerticalPositionChange);
            insideWindow.buttons.ok.addEventListener("mousedown", close);
            insideWindow.buttons.cancel.addEventListener("mousedown", bttCancelMouseDown);
            insideWindow.barMoveWindow.addEventListener("mousedown", moveWindow);
        },
        removeEventsToElements = () => {
            insideWindow.buttons.ok.removeEventListener("mousedown", close);
            insideWindow.buttons.cancel.removeEventListener("mousedown", bttCancelMouseDown);
            insideWindow.inputs.size.removeEventListener("change", inputSizeChange);
            insideWindow.inputs.horizontalPosition.removeEventListener("change", inputHorizontalPositionChange);
            insideWindow.inputs.verticalPosition.removeEventListener("change", inputVerticalPositionChange);
            insideWindow.barMoveWindow.removeEventListener("mousedown", moveWindow);
        },
        close = () => {
            removeEventsToElements();
            setStyle(contentWindow, { display: null });
            applyPreviousVisualization();
        },
        inputSizeChange = e => {
            const num = parseInt(e.currentTarget.value);
            if (!isNaN(num) && num > 0) {
                gridProperties.size = num;
                createGrid(gridProperties, true);
            }
        },
        inputHorizontalPositionChange = e => {
            const num = parseInt(e.currentTarget.value);
            if (!isNaN(num)) {
                gridProperties.position.x = num;
                createGrid(gridProperties, true);
            }
        },
        inputVerticalPositionChange = e => {
            const num = parseInt(e.currentTarget.value);
            if (!isNaN(num)) {
                gridProperties.position.y = num;
                createGrid(gridProperties, true);
            }
        },
        bttCancelMouseDown = () => {
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
            setStyle(contentWindow, { display: "block" });
            addEventsToElements();
            D.project.adjustInVisualizationScreen();
            if (!gridProperties.visible) { createGrid(gridProperties, true); }
        },
        addDependencies(dependencies) {
            for (const prop in dependencies) { D[prop] = dependencies[prop]; }
        }
    }
}