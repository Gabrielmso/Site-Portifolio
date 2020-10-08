import { setStyle, preventDefaultAction } from "../js/geral.js";
import loadTopoMenu from "../topoMenu/topoMenu.js";
import selectImageObject from "./selectImage.js";
import loadImageToCanvasObject from "./loadImageToCanvas.js";

let topoMenu;
function loadApp() {
    const selectImage = selectImageObject();
    const loadImageToCanvas = loadImageToCanvasObject();

    selectImage.addDependencies({ loadImageToCanvas });
    loadImageToCanvas.addDependencies({ selectImage })

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
        setStyle(topoMenu.menu, { transition: "none" });
        loadApp();
        return true;
    }
    return false;
}