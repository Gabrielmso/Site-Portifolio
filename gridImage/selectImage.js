import { setStyle, getElement, createElement } from "../js/geral.js";


export default function selectImageObject() {
    let dragEnterElement;
    const D = {}, content = getElement("contentSelecionarImagem"),
        bttSelectImage = getElement("bttSelecionarImagem"),
        validExtentions = ["png", "jpg", "jpeg", "bmp"],
        animationGradient = (() => {
            const minDeg = 130, maxDeg = 220, gradiente = getElement("gradiente");
            let deg = 130, step = 4.8, animation;
            const updateGradient = () => {
                deg = deg > maxDeg ? maxDeg : deg < minDeg ? minDeg : deg;
                setStyle(gradiente, {
                    backgroundImage: "linear-gradient(" + deg + "deg, rgb(200, 50, 10) -10%, rgba(15, 0, 50) 90%)"
                });
            },
                stop = () => cancelAnimationFrame(animation),
                progress = () => {
                    if (deg >= maxDeg) { return; }
                    deg += step;
                    updateGradient();
                    animation = requestAnimationFrame(progress);
                },
                regress = () => {
                    if (deg <= minDeg) { return; }
                    deg -= step;
                    updateGradient();
                    animation = requestAnimationFrame(regress);
                }
            return (make) => {
                stop();
                if (make) { progress() }
                else { regress(); }
            }
        })(),
        conclude = async (file, name) => {
            animationGradient(true);
            await new Promise((resolve) => setTimeout(resolve, 90));
            bttSelectImage.removeEventListener("mousedown", bttClickToSelectImage);
            content.removeEventListener("dragenter", dragEnterFile);
            content.removeEventListener("dragleave", dragLeaveFile);
            content.removeEventListener("drop", dropFileToLoad);
            D.loadImageToCanvas.load(file, name);
        },
        imageValidation = file => {
            if (!file) {
                animationGradient(false);
                return;
            }
            const [name, extention] = file.name.split('.');
            const extentionLowerCase = extention.toLowerCase();
            const validName = name != "";
            const imageValid = validExtentions.includes(extentionLowerCase) && file.type.includes("image");
            if (imageValid && validName) { conclude(file, name); }
            else { animationGradient(false); }
        },
        bttClickToSelectImage = () => {
            const inputFile = createElement("input", {
                type: "file",
                accept: ".png, .jpg, .jpeg, .bmp"
            });
            inputFile.addEventListener("change", (e) => imageValidation(e.currentTarget.files[0]));
            inputFile.click();
        },
        dragEnterFile = e => {
            dragEnterElement = e.target;
            animationGradient(true)
        },
        dragLeaveFile = e => {
            if (dragEnterElement === e.target) { animationGradient(false); }
        },
        dropFileToLoad = e => imageValidation(e.dataTransfer.files[0]);

    bttSelectImage.addEventListener("mousedown", bttClickToSelectImage);
    content.addEventListener("dragenter", dragEnterFile);
    content.addEventListener("dragleave", dragLeaveFile);
    content.addEventListener("drop", dropFileToLoad);
    return {
        finish() {
            content.remove();
            for (const prop in this) { delete this[prop]; }
        },
        addDependencies(dependencies) {
            for (const prop in dependencies) { D[prop] = dependencies[prop]; }
        }
    }
}