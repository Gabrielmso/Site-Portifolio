import { setStyle, getElement, createElement } from "../js/geral.js";


export default function selectImageObject() {
    let dragEnterElement;
    const observers = [], content = getElement("contentSelecionarImagem"),
        bttSelectImage = getElement("bttSelecionarImagem"),
        validExtentions = ["png", "jpg", "jpeg", "bmp"],
        notifyImageSelected = async (file, name) => {
            for (const observer of observers) { await observer(file, name); }
        },
        animationGradient = (() => {
            const minDeg = 130, maxDeg = 220, gradiente = getElement("gradiente");
            let deg = 130, step = 4.7, animation;
            const updateGradient = () => {
                deg = deg > maxDeg ? maxDeg : deg < minDeg ? minDeg : deg;
                setStyle(gradiente, {
                    backgroundImage: "linear-gradient(" + deg + "deg, rgb(200, 50, 10) -10%, rgb(15, 0, 50) 90%)"
                });
            }, stop = () => cancelAnimationFrame(animation),
                progress = () => {
                    return new Promise((resolve) => (function making() {
                        if (deg >= maxDeg) { resolve(); }
                        deg += step;
                        updateGradient();
                        animation = requestAnimationFrame(making);
                    })());
                }, regress = () => {
                    return new Promise((resolve) => (function making() {
                        if (deg <= minDeg) { resolve(); }
                        deg -= step;
                        updateGradient();
                        animation = requestAnimationFrame(making);
                    })());
                }
            return async (make) => {
                stop();
                if (make) { await progress(); }
                else { await regress(); }
            }
        })(),
        conclude = async (file, name) => {
            await animationGradient(true);
            bttSelectImage.removeEventListener("mousedown", bttClickToSelectImage);
            content.removeEventListener("dragenter", dragEnterFile);
            content.removeEventListener("dragleave", dragLeaveFile);
            content.removeEventListener("drop", dropFileToLoad);
            await notifyImageSelected(file, name);
            content.remove();
        },
        imageValidation = file => {
            if (!file) {
                animationGradient(false);
                return;
            }
            const nameFile = file.name.split('.');
            const extention = nameFile.pop().toLowerCase();
            const name = nameFile.join("_");
            const validName = name != "";
            const imageValid = validExtentions.includes(extention) && file.type.includes("image");
            if (imageValid && validName) { conclude(file, name); }
            else { animationGradient(false); }
        },
        bttClickToSelectImage = () => {
            const inputFile = createElement("input", { type: "file", accept: ".png, .jpg, .jpeg, .bmp" });
            inputFile.addEventListener("change", (e) => imageValidation(e.currentTarget.files[0]));
            inputFile.click();
        },
        dragEnterFile = e => {
            dragEnterElement = e.target;
            animationGradient(true)
        },
        dragLeaveFile = e => { if (dragEnterElement === e.target) { animationGradient(false); } },
        dropFileToLoad = e => imageValidation(e.dataTransfer.files[0]);

    bttSelectImage.addEventListener("mousedown", bttClickToSelectImage);
    content.addEventListener("dragenter", dragEnterFile);
    content.addEventListener("dragleave", dragLeaveFile);
    content.addEventListener("drop", dropFileToLoad);
    return {
        addObservers(newObservers) {
            for (const observer of newObservers) { observers.push(observer); }
        }
    }
}