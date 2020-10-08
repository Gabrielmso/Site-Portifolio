import { setStyle, getImage, createElement } from "../js/geral.js"

export default function loadImageToCanvasObject() {
    const D = {}, imageProperties = { name: "", resolution: { width: 0, height: 0 } },
        fadeTransition = (() => {
            const time = 370;
            let content = null;
            const fadeIn = () => {
                return new Promise((resolve) => {
                    if (content) { resolve(); }
                    content = createElement("div", { class: "fadetransition" });
                    document.body.appendChild(content);
                    setTimeout(() => {
                        setStyle(content, { opacity: "1" });
                        setTimeout(resolve, time)
                    }, 18);
                });
            },
                fadeOut = () => {
                    return new Promise((resolve) => {
                        if (!content) { resolve(); }
                        setStyle(content, { opacity: null });
                        setTimeout(() => {
                            content.remove();
                            content = null;
                            resolve();
                        }, time);
                    });
                }
            return { in: fadeIn, out: fadeOut }
        })(),
        renderImageInCanvas = async image => {
            await fadeTransition.in();
            const { width, height } = imageProperties.resolution;
            const canvas = createElement("canvas", { class: "canvas canvasImage", width, height })
                .getContext("2d");
            canvas.drawImage(image, 0, 0, width, height);
            D.screen.appendChild(canvas.canvas);
            D.selectImage.finish();
            D.app.canvasImage = canvas;
            D.createGrid.init();
        },
        load = (imageFile, nameFile) => {
            const reader = new FileReader();
            reader.onload = ev =>
                getImage(ev.currentTarget.result, e => {
                    imageProperties.name = nameFile + "-GRID.png";
                    imageProperties.resolution.width = e.currentTarget.naturalWidth;
                    imageProperties.resolution.height = e.currentTarget.naturalHeight;
                    renderImageInCanvas(e.currentTarget);
                });
            reader.readAsDataURL(imageFile);
        };
    return {
        get imageProperties() { return imageProperties; },
        load(imageFile, nameFile) {
            load(imageFile, nameFile);
            delete this.load;
        },
        async finish() {
            await fadeTransition.out();
            delete this.addDependencies;
            delete this.finish;
        },
        addDependencies(dependencies) {
            for (const prop in dependencies) { D[prop] = dependencies[prop]; }
        }
    };
}