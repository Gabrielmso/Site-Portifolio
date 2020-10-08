import { setStyle, getElement, createElement } from "../js/geral.js";


export default function selectImageObject() {
    const D = {}, content = getElement("contentSelecionarImagem"),
        bttSelectImage = getElement("bttSelecionarImagem"),
        validExtentions = ["png", "jpg", "jpeg", "bmp"],
        animationGradient = (() => {
            const minDeg = 130, maxDeg = 220;
            let deg = 130, step = 4.8, animation;
            const updateGradient = () => {
                deg = deg > maxDeg ? maxDeg : deg < minDeg ? minDeg : deg;
                setStyle(content, {
                    backgroundImage: "linear-gradient(" + deg + "deg, rgb(200, 50, 9) -10%, rgba(17, 1, 50) 90%)"
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
        concludeLoadImage = async file => {
            animationGradient(true);
            await new Promise((resolve) => setTimeout(resolve, 200));
            const reader = new FileReader();
            reader.onload = e => D.loadImageToCanvas(e.currentTarget.result)
            reader.readAsDataURL(file)
        },
        imageValidation = file => {
            if (!file) { return; }
            const extention = file.name.split('.').pop().toLowerCase();
            const imageValid = validExtentions.includes(extention) && file.type.includes("image");
            if (imageValid) { concludeLoadImage(file); }
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
        dragEnterFile = () => animationGradient(true),
        dragLeaveFile = () => animationGradient(false),
        dropFileToLoad = e => imageValidation(e.dataTransfer.files[0]);

    bttSelectImage.addEventListener("mousedown", bttClickToSelectImage);
    content.addEventListener("dragenter", dragEnterFile);
    content.addEventListener("dragleave", dragLeaveFile);
    content.addEventListener("drop", dropFileToLoad);
    return {
        addDependencies(dependencies) {
            for (const prop in dependencies) { D[prop] = dependencies[prop]; }
        }
    }
}