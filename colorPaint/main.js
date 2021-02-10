import { addMethodsGlobalObjects } from "../js/addMethodsGlobalObjects.js";
import {
    preventDefaultAction, getMousePosition, getElement, setStyle, delay, openWindowBackgroundBlur
} from "../js/utils.js";
import loadTopoMenu from "../topoMenu/topoMenu.js";
import appObject from "./app.js";

const onLoadMain = async () => {
    (await loadTopoMenu(false, 2)).logoClick(() => window.location.href = "./");
    addMethodsGlobalObjects();
    
    appObject();

    {//Abrir e Fechar a janela de Atalhos.
        const content = getElement("contentJanelaAtalhos");
        content.addEventListener("mousedown", (e) => {
            if (e.target === content) { openWindowBackgroundBlur(content, false) }
        })
        getElement("bttAtalhos").addEventListener("mousedown", openWindowBackgroundBlur.bind(null, content, true));
    }

    document.addEventListener("dragover", preventDefaultAction);
    document.addEventListener("dragenter", preventDefaultAction);
    document.addEventListener("drop", preventDefaultAction);
}

window.onload = onLoadMain;