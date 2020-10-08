import { setStyle } from "../js/geral.js";
import loadTopoMenu from "../topoMenu/topoMenu.js";
import selectImageObject from "./selectImage.js";

let topoMenu;
function loadApp() {
    const selectImage = selectImageObject();
    




    topoMenu.logo.addEventListener("click", () => {
        window.location.href = "./";
    });
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