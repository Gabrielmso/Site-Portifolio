import { setStyle, preventDefaultAction, getElement } from "../js/geral.js";
import loadTopoMenu from "../topoMenu/topoMenu.js";
import selectImageObject from "./selectImage.js";
import canvasImageObject from "./canvasImage.js";
import canvasGridObject from "./canvasGrid.js";
import colorSelectionWindowObject from "./colorSelectionWindow.js";
import appObject from "./app.js";

let topoMenu;
function loadApp() {
    const selectImage = selectImageObject();
    const canvasImage = canvasImageObject();
    const canvasGrid = canvasGridObject();
    const colorSelectionWindow = colorSelectionWindowObject();
    const app = appObject();

    const appWindow = getElement("janelaapp");
    const contentScreen = getElement("contentTela");
    const screen = getElement("tela");


    selectImage.addDependencies({ canvasImage });
    canvasImage.addDependencies({ selectImage, screen, canvasGrid, app });
    canvasGrid.addDependencies({ canvasImage, app, screen });
    app.addDependencies({ canvasImage, screen, contentScreen });
    colorSelectionWindow.addDependencies({ appWindow, canvasGrid });

    topoMenu.logo.addEventListener("click", () => {
        window.location.href = "./";
    });
    document.addEventListener("dragover", preventDefaultAction);
    document.addEventListener("dragenter", preventDefaultAction);
    document.addEventListener("drop", preventDefaultAction);
}

export default async function gridImage() {
    topoMenu = await loadTopoMenu();
    if (topoMenu) {
        topoMenu.changeTheme(false);
        topoMenu.changeMenu = false;
        setStyle(topoMenu.menu, { transition: "none", "backdrop-filter": "blur(4px)" });
        loadApp();
        return true;
    }
    return false;
}