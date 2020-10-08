import { getImage } from "../js/geral.js"

export default function loadImageToCanvasObject() {



    const renderImageInCanvas = (image) => {
        alert("Ainda está em desenvolvimento, volte em breve!");
        window.location.reload();
    }

    return dataUrlImage => getImage(dataUrlImage, e => renderImageInCanvas(e.currentTarget));
}