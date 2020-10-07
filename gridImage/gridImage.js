import { setStyle } from "../js/geral.js";
import loadTopoMenu from "../topoMenu/topoMenu.js";

let topoMenu;
function loadApp() {
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