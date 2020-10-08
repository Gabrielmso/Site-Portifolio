import { getElement, createElement } from "../js/geral.js";


export default function selectImageObject() {
    const D = {}, content = getElement("contentSelecionarImagem"),
        validExtentions = ["png", "jpg", "jpeg", "bmp"],
        animationGradient = () => {

        },
        concludeLoadImage = (file) => {
            animationGradient()
        },
        imageValidation = (file) => {
            if (!file) { return; }
            const extention = file.name.split('.').pop().toLowerCase();
            const imageValid = () => validExtentions.includes(extention) && file.type.includes("image");
            if (imageValid) { concludeLoadImage(file); }
        },
        bttClickToSelectImage = () => {
            const inputFile = createElement("input", {
                type: "file",
                accept: ".png, .jpg, .jpeg, .bmp"
            });
            inputFile.addEventListener("change", (e) => imageValidation(e.currentTarget.files[0]));
            inputFile.click();
        }

    getElement("bttSelecionarImagem").addEventListener("mousedown", bttClickToSelectImage)
}