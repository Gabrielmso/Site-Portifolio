import { getMousePosition, getElement, setStyle, createElement } from "../js/utils.js";

export default function createGridWindowObject({ notification, project, contentTelas,
    adjustInVisualizationScreen, zoom }) {
    const gridProperties = { screen: getElement("grid"), size: 80, position: { x: 0, y: 0 }, opacity: 1, visible: false },
        previousVisualization = { scrollX: 0, scrollY: 0, zoom: 0 },
        contentWindow = getElement("contentJanelaMenuGrid"), insideWindow = {
            barMoveWindow: getElement("barraMoverJanelaMenuGrid"),
            inputs: {
                size: getElement("txtTamanhoGrid"), horizontalPosition: getElement("txtPosicaoHorizontalGrid"),
                verticalPosition: getElement("txtPosicaoVerticalGrid"), opacity: getElement("barraOpacidadeGrid"),
                cbxVisualizar: { content: getElement("contentCbxVisualizar"), cbx: getElement("cbxVisualizar") }
            },
            buttons: { ok: getElement("bttOkGrid"), /*cancel: getElement("bttcancelarGrid")*/ },
        },
        changeOpacity = value => {
            setStyle(gridProperties.screen, { opacity: value });
            gridProperties.opacity = insideWindow.inputs.opacity.value = value;
        },
        createGrid = (properties) => {
            const screen = gridProperties.screen, size = gridProperties.size = properties.size,
                pos = gridProperties.position = properties.position,
                numDeQuadrados = (Math.trunc((project.resolution.width / size) + 2.1)) * (Math.trunc((project.resolution.height / size) + 2.1));
            changeOpacity(properties.opacity);
            if (numDeQuadrados > 5700) {
                notification.open({
                    type: "notify", timeNotify: 1500, title: "Atenção!", message: "Aumente o tamanho da grade."
                });
                return;
            } else if (numDeQuadrados > 1100) {
                notification.open({
                    type: "notify", timeNotify: 1500, title: "Atenção!",
                    message: "O tamanho da grade está muito baixo, isso pode acarretar problemas de performance!"
                });
            }
            screen.textContent = "";
            if (properties.visible) {
                const position = {
                    x: (((pos.x / size) - (Math.trunc(pos.x / size))) * size),
                    y: (((pos.y / size) - (Math.trunc(pos.y / size))) * size)
                }
                if (position.x < 0) { position.x += size };
                if (position.y < 0) { position.y += size };
                const larguraTela = (project.resolution.width + (size * 2)),
                    alturaTela = (project.resolution.height + (size * 2));
                const larguraQuadrado = ((size / larguraTela) * 100), alturaQuadrado = ((size / alturaTela) * 100);
                const styleQuadrado = "width: " + larguraQuadrado + "%; height: " + alturaQuadrado + "%;";
                setStyle(screen, {
                    top: (-100 * ((size - position.y) / project.resolution.height)) + "%",
                    left: (-100 * ((size - position.x) / project.resolution.width)) + "%",
                    width: ((larguraTela / project.resolution.width) * 100) + "%",
                    height: ((alturaTela / project.resolution.height) * 100) + "%"
                });
                const quadrado = createElement("div", { class: "quadrado", style: styleQuadrado });
                for (let i = 0; i < numDeQuadrados; i++) { screen.appendChild(quadrado.cloneNode(true)); }
                insideWindow.inputs.cbxVisualizar.cbx.classList.replace("cbxDesmarcado", "cbxMarcado");
            } else { insideWindow.inputs.cbxVisualizar.cbx.classList.replace("cbxMarcado", "cbxDesmarcado"); }
            gridProperties.visible = properties.visible;
        },
        applyPreviousVisualization = () => {
            zoom("porcentagem", false, previousVisualization.zoom);
            contentTelas.scrollTop = previousVisualization.scrollY;
            contentTelas.scrollLeft = previousVisualization.scrollX;
        },
        moveWindow = (() => {
            let mousePositionMoveWindow = { x: 0, y: 0, };
            const window = getElement("janelaMenuGrid"),
                move = e => {
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
        onInputChangeOpacity = e => changeOpacity(+(e.currentTarget.value)),
        inputSizeChange = e => {
            const num = parseInt(e.currentTarget.value);
            if (isNaN(num) && num <= 0) { return; }
            gridProperties.size = num;
            createGrid(gridProperties);
        },
        inputHorizontalPositionChange = e => {
            const num = parseInt(e.currentTarget.value);
            if (isNaN(num)) { return; }
            gridProperties.position.x = num;
            createGrid(gridProperties);
        },
        inputVerticalPositionChange = e => {
            const num = parseInt(e.currentTarget.value);
            if (isNaN(num)) { return; }
            gridProperties.position.y = num;
            createGrid(gridProperties);
        },
        onMouseDownCbxVisualizar = e => {
            gridProperties.visible = !gridProperties.visible;
            createGrid(gridProperties);
        },
        addEventsToElements = () => {
            insideWindow.inputs.size.addEventListener("change", inputSizeChange);
            insideWindow.inputs.horizontalPosition.addEventListener("change", inputHorizontalPositionChange);
            insideWindow.inputs.verticalPosition.addEventListener("change", inputVerticalPositionChange);
            insideWindow.inputs.cbxVisualizar.content.addEventListener("mousedown", onMouseDownCbxVisualizar);
            insideWindow.buttons.ok.addEventListener("mousedown", close);
            insideWindow.barMoveWindow.addEventListener("mousedown", moveWindow);
            insideWindow.inputs.opacity.addEventListener("input", onInputChangeOpacity);
        },
        removeEventsToElements = () => {
            insideWindow.buttons.ok.removeEventListener("mousedown", close);
            insideWindow.inputs.size.removeEventListener("change", inputSizeChange);
            insideWindow.inputs.horizontalPosition.removeEventListener("change", inputHorizontalPositionChange);
            insideWindow.inputs.cbxVisualizar.content.addEventListener("mousedown", onMouseDownCbxVisualizar);
            insideWindow.inputs.verticalPosition.removeEventListener("change", inputVerticalPositionChange);
            insideWindow.barMoveWindow.removeEventListener("mousedown", moveWindow);
            insideWindow.inputs.opacity.removeEventListener("input", onInputChangeOpacity);
        },
        close = () => {
            removeEventsToElements();
            setStyle(contentWindow, { display: null });
            applyPreviousVisualization();
        }

    return {
        set createGrid({ size, position, visible, opacity }) { createGrid({ size, position, opacity, visible }) },
        get gridProperties() {
            const { size, position, visible, opacity } = gridProperties;
            return { size, position, visible, opacity };
        },
        open() {
            previousVisualization.scrollX = contentTelas.scrollLeft;
            previousVisualization.scrollY = contentTelas.scrollTop;
            previousVisualization.zoom = project.zoom;
            insideWindow.inputs.size.value = gridProperties.size;
            insideWindow.inputs.horizontalPosition.value = gridProperties.position.x;
            insideWindow.inputs.verticalPosition.value = gridProperties.position.y;
            setStyle(contentWindow, { display: "block" });
            addEventsToElements();
            adjustInVisualizationScreen();
            createGrid(gridProperties);
        }
    }
}