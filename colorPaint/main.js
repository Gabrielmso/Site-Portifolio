import { addMethodsGlobalObjects } from "../js/addMethodsGlobalObjects.js";
import { preventDefaultAction } from "../js/utils.js";
import loadTopoMenu from "../topoMenu/topoMenu.js";
import appObject from "./app.js";

const onLoadMain = async () => {
    (await loadTopoMenu(false, 2)).logoClick(() => window.location.href = "./");
    addMethodsGlobalObjects();

    appObject();

    document.addEventListener("dragover", preventDefaultAction);
    document.addEventListener("dragenter", preventDefaultAction);
    document.addEventListener("drop", preventDefaultAction);
}

window.onload = onLoadMain;