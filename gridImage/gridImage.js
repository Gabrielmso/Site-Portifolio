import { setStyle, preventDefaultAction, getElement } from "../js/utils.js";
import loadTopoMenu from "../topoMenu/topoMenu.js";
import selectImageObject from "./selectImage.js";
import canvasImageObject from "./canvasImage.js";
import canvasGridObject from "./canvasGrid.js";
import colorSelectionWindowObject from "./colorSelectionWindow.js";
import appObject from "./app.js";
import settingsWindowGridObject from "./settingsWindowGrid.js";

let topoMenu;
function loadApp() {
    const appWindow = getElement("janelaapp");
    const contentScreen = getElement("contentTela");
    const screen = getElement("tela");

    const app = appObject(contentScreen, screen);
    const selectImage = selectImageObject();
    const canvasImage = canvasImageObject(screen);
    const canvasGrid = canvasGridObject(screen);
    const settingsWindowGrid = settingsWindowGridObject(appWindow);
    const colorSelectionWindow = colorSelectionWindowObject(appWindow);

    selectImage.addObservers([canvasImage.init]);
    canvasImage.addObservers([canvasGrid.init]);
    canvasGrid.addObservers([app.init, settingsWindowGrid.init]);
    settingsWindowGrid.addObservers([colorSelectionWindow.open]);
    colorSelectionWindow.addObservers([settingsWindowGrid.setColorGrid]);

    topoMenu.logo.addEventListener("click", () => window.location.href = "./");
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