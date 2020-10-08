import { getImage } from "../js/geral.js"

export default function loadImageToCanvasObject() {



    const renderImageInCanvas = () => {
        console.log("OOIIIII")
    },
        load = (dataUrlImage) => getImage(dataUrlImage, (e) => renderImageInCanvas(e.currentTarget));
    return load;
}