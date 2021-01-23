import { setStyle, getImage, createElement } from "../js/utils.js"

export default function canvasImageObject(screen) {
    const observers = [], imageProperties = { ctx: null, name: "", width: 0, height: 0, proportion: 0 },
        notifyCanvasImageCreated = async canvas => {
            for (const observer of observers) { await observer(canvas); }
        },
        fadeTransition = (() => {
            const time = 370;
            let content = null;
            const fadeIn = () => new Promise((resolve) => {
                if (content) { resolve(); }
                content = createElement("div", { class: "fadetransition" });
                document.body.appendChild(content);
                setTimeout(() => {
                    setStyle(content, { opacity: "1" });
                    setTimeout(resolve, time);
                }, 18);
            }), fadeOut = () => new Promise((resolve) => {
                if (!content) { resolve(); }
                setStyle(content, { opacity: null });
                setTimeout(() => {
                    content.remove();
                    content = null;
                    resolve();
                }, time);
            });
            return { in: fadeIn, out: fadeOut }
        })(),
        renderImageInCanvas = async image => {
            await fadeTransition.in();
            const { width, height } = imageProperties;
            const canvas = createElement("canvas", { class: "canvas canvasImage", width, height })
                .getContext("2d");
            canvas.drawImage(image, 0, 0, width, height);
            screen.appendChild(canvas.canvas);
            imageProperties.ctx = canvas;
            await notifyCanvasImageCreated(imageProperties);
            fadeTransition.out();
        },
        load = (imageFile, nameFile) => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = ev => getImage(ev.currentTarget.result, async e => {
                    imageProperties.name = nameFile + "-GRID.png";
                    const { naturalWidth: width, naturalHeight: height } = e.currentTarget;
                    imageProperties.width = width;
                    imageProperties.height = height;
                    imageProperties.proportion = width / height;
                    await renderImageInCanvas(e.currentTarget);
                    resolve();
                });
                reader.readAsDataURL(imageFile);
            });
        };
    return {
        async init(imageFile, nameFile) {
            if (!screen) {
                console.log("canvasImageObject incompleted!");
                return;
            }
            await load(imageFile, nameFile);
        },
        addObservers(newObservers) {
            for (const observer of newObservers) { observers.push(observer); }
        }
    };
}