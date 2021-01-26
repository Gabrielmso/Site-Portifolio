import { addMethodsGlobalObjects } from "../js/addMethodsGlobalObjects.js";
import { preventDefaultAction, getMousePosition, getElement, setStyle, openWindowBackgroundBlur } from "../js/utils.js";
import loadTopoMenu from "../topoMenu/topoMenu.js";
import createProjectWindowObject from "./createProjectWindow.js";
import projectObject from "./project.js";
import drawingToolsObject from "./drawingTools.js";
import previewFunctionsObject from "./previewFunctions.js";
import undoRedoChangeObject from "./undoRedoChange.js";
import hotKeysObject from "./hotKeys.js";
import createGridWindowObject from "./createGridWindow.js";
import colorSelectionWindowObject from "./colorSelectionWindow.js";
import notificationsObject from "./notifications.js";

let topoMenu;
function loadApp() {
    const createProjectWindow = createProjectWindowObject(),
        project = projectObject(),
        drawingTools = drawingToolsObject(),
        previewFunctions = previewFunctionsObject(),
        undoRedoChange = undoRedoChangeObject(),
        hotKeys = hotKeysObject(),
        createGridWindow = createGridWindowObject(),
        colorSelectionWindow = colorSelectionWindowObject(),
        notification = notificationsObject();

    const contentTelas = getElement("contentTelas"),
        corPrincipal = getElement("corPrincipal"),
        corSecundaria = getElement("corSecundaria"),
        txtPorcentagemZoom = getElement("txtPorcentagemZoom"),
        janelaPrincipal = getElement("colorPaintContent");

    createProjectWindow.addDependencies({ project, notification, openWindowBackgroundBlur });
    project.addDependencies({
        corPrincipal, corSecundaria, drawingTools, previewFunctions,
        hotKeys, createGridWindow, colorSelectionWindow, notification,
        contentTelas, txtPorcentagemZoom, undoRedoChange, janelaPrincipal
    });
    colorSelectionWindow.addDependencies({ project, drawingTools, janelaPrincipal });
    drawingTools.addDependencies({
        project, undoRedoChange, hotKeys, colorSelectionWindow,
        notification, janelaPrincipal, contentTelas, drawingTools
    });
    previewFunctions.addDependencies({ project, previewFunctions, contentTelas });
    undoRedoChange.addDependencies({ project, drawingTools });
    hotKeys.addDependencies({ project, drawingTools, undoRedoChange, contentTelas });
    createGridWindow.addDependencies({ project, notification, contentTelas, txtPorcentagemZoom });

    project.addEventsToElements();

    getElement("bttCriarNovoProjeto").addEventListener("mousedown", () => createProjectWindow.open("create"));
    getElement("bttCriarGrade").addEventListener("mousedown", () => createGridWindow.open());
    getElement("bttModoCursor").addEventListener("mousedown", e => drawingTools.changeCursorMode(e));
    getElement("bttMostrarAlteracaoPincel").addEventListener("mousedown", e => drawingTools.changeShowDashSample(e));
    getElement("bttSalvarDesenho").addEventListener("mousedown", () => project.saveDraw());
    getElement("bttSalvarProjeto").addEventListener("mousedown", () => project.saveProject());
    getElement("bttcarregarProjeto").addEventListener("mousedown", () => createProjectWindow.open("load"));

    corPrincipal.addEventListener("mousedown", () => {
        if (colorSelectionWindow.opened) { colorSelectionWindow.currentColor = project.selectedColors.firstPlane; }
        else { colorSelectionWindow.open(1); }
    });

    corSecundaria.addEventListener("mousedown", () => {
        if (colorSelectionWindow.opened) { colorSelectionWindow.currentColor = project.selectedColors.backgroundPlane; }
        else { colorSelectionWindow.open(2); }
    });

    getElement("bttCoresPrincipais").addEventListener("mousedown", () => {
        if (!colorSelectionWindow.opened) {
            project.selectedColors.set(1, { r: 0, g: 0, b: 0 });
            project.selectedColors.set(2, { r: 255, g: 255, b: 255 });
        }
    });

    getElement("bttAlternaCor").addEventListener("mousedown", () => {
        if (!colorSelectionWindow.opened) {
            const color = { ...project.selectedColors.get(1) };
            project.selectedColors.set(1, project.selectedColors.get(2));
            project.selectedColors.set(2, color);
        }
    });

    getElement("bttZoomMais").addEventListener("mousedown", () => project.zoom(true, true, 1.25));
    getElement("bttZoomMenos").addEventListener("mousedown", () => project.zoom(false, true, 1.25));

    txtPorcentagemZoom.addEventListener("keyup", e => {
        if (e.code === "Enter") {
            const valor = parseFloat(((e.currentTarget.value).replace("%", "")).replace(",", "."));
            if (!isNaN(valor) && valor >= 1) { project.zoom("porcentagem", true, valor); }
        }
    });
    const content = getElement("contentJanelaAtalhos");
    content.addEventListener("mousedown", (e) => {
        if (e.target === content) { openWindowBackgroundBlur(content, false) }
    })
    getElement("bttAtalhos").addEventListener("mousedown", openWindowBackgroundBlur.bind(null, content, true));


    janelaPrincipal.addEventListener("wheel", e => {//Zoom com o scroll do mouse.
        if (!hotKeys.ctrlPressed) { return; }
        preventDefaultAction(e);
        if (e.deltaY < 0) { project.zoom(true, false, 1.10); }
        else { project.zoom(false, false, 1.10); }
        const posContentTelas = getMousePosition(contentTelas, e);
        const proporcaoPosY = drawingTools.mousePosition.y / project.properties.resolution.height;
        const proporcaoPosX = drawingTools.mousePosition.x / project.properties.resolution.width;
        contentTelas.scrollTop = (contentTelas.scrollHeight * proporcaoPosY) - posContentTelas.y;
        contentTelas.scrollLeft = (contentTelas.scrollWidth * proporcaoPosX) - posContentTelas.x;
    });

    document.addEventListener("dragover", preventDefaultAction);
    document.addEventListener("dragenter", preventDefaultAction);
    document.addEventListener("drop", preventDefaultAction);

    window.addEventListener("resize", () => {
        if (project.created) { previewFunctions.changeMoverScrollSizeZoom(); };
    });

    document.addEventListener("keydown", e => {
        if (e.code === "F5" && project.created) {
            preventDefaultAction(e);
            return false;
        }
    });

    function criarOuAbrirProjeto() {
        const carregar = getElement("carregamento"),
            loadMode = sessionStorage.getItem("loadMode"),
            fadeOut = () => {
                setStyle(carregar, { opacity: "0" })
                setTimeout(() => carregar.remove(), 700);
            },
            carregamento = () => {
                const logoCarregamento = getElement("logoCarregamento");
                setStyle(logoCarregamento, { transition: "opacity 1.5s linear" })
                setTimeout(() => {
                    setStyle(logoCarregamento, { opacity: "1" });
                    setTimeout(() => {
                        const { left, top } = topoMenu.logo.getBoundingClientRect();
                        setStyle(logoCarregamento, {
                            transition: "width 500ms ease-out, height 500ms ease-out, opacity 500ms ease-out, top 500ms ease-out, left 500ms ease-out",
                            width: "90px", height: "50px", opacity: "0.75",
                            left: left + 45 + "px", top: top + 25 + "px"
                        });
                        setTimeout(fadeOut, 350);
                    }, 1550);
                }, 150);
            }

        if (loadMode) {
            createProjectWindow.open(loadMode);
            sessionStorage.removeItem("loadMode");
            fadeOut();
        } else { carregamento(); }
    }
    criarOuAbrirProjeto();
}

addMethodsGlobalObjects();

export default async function colorPaint() {
    topoMenu = await loadTopoMenu();
    if (topoMenu) {
        topoMenu.changeTheme(false);
        topoMenu.changeMenu = false;
        setStyle(topoMenu.menu, { transition: "none" });
        loadApp();
        return true;
    }
    return false;
}