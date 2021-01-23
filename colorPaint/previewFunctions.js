import { getMousePosition, getElement, setStyle } from "../js/utils.js";

export default function previewFunctionsObject() {
    const D = {},
        contentPreview = getElement("contentPreview"),
        contentTelaPreview = getElement("contentTelaPreview"),
        ctxTelaPreview = getElement("telaPreview").getContext("2d"),
        moverScroll = getElement("moverScroll"),
        scrollEventMoveMoverScroll = () => {
            const mult = (D.contentTelas.scrollHeight - 12) / contentTelaPreview.offsetHeight;
            const mult2 = (D.contentTelas.scrollWidth - 12) / contentTelaPreview.offsetWidth;
            setStyle(moverScroll, {
                top: (D.contentTelas.scrollTop / mult) + "px",
                left: (D.contentTelas.scrollLeft / mult2) + "px"
            });
        },
        changeScrollsContentTelas = (top, left) => {
            D.contentTelas.scrollTop = top * ((D.contentTelas.scrollHeight) / contentTelaPreview.offsetHeight);
            D.contentTelas.scrollLeft = left * ((D.contentTelas.scrollWidth) / contentTelaPreview.offsetWidth);
        },
        mouseMoveMoverScroll = ({ x, y }) => {
            const midWidth = moverScroll.offsetWidth / 2, midHeight = moverScroll.offsetHeight / 2;
            let left, top;
            if (x <= midWidth) { left = 0; }
            else if (x >= contentTelaPreview.offsetWidth - (Math.floor(midWidth))) {
                left = contentTelaPreview.offsetWidth - (midWidth * 2);
            } else { left = x - (Math.floor(midWidth)); }
            if (y <= midHeight) { top = 0; }
            else if (y >= contentTelaPreview.offsetHeight - (Math.floor(midHeight))) {
                top = contentTelaPreview.offsetHeight - (midHeight * 2);
            } else { top = y - (Math.floor(midHeight)); }
            setStyle(moverScroll, { top: top + "px", left: left + "px" });
            changeScrollsContentTelas(top, left);
        },
        mouseMovePreview = e => mouseMoveMoverScroll(getMousePosition(contentTelaPreview, e)),
        mouseUpPreview = () => {
            setStyle(moverScroll, { cursor: "grab" });
            document.removeEventListener("mousemove", mouseMovePreview);
            document.removeEventListener("mouseup", mouseUpPreview);
        },
        mouseDownPreview = e => {
            setStyle(moverScroll, { cursor: "grabbing" });
            mouseMoveMoverScroll(getMousePosition(contentTelaPreview, e));
            document.addEventListener("mousemove", mouseMovePreview);
            document.addEventListener("mouseup", mouseUpPreview);
        };

    return {
        addEventsToElements() {
            D.contentTelas.addEventListener("scroll", scrollEventMoveMoverScroll);
            contentTelaPreview.addEventListener("mousedown", mouseDownPreview);
            delete this.addEventsToElements;
        },
        createPreviewLayer(id, style,) {
            const layerElement = document.createElement("canvas");
            layerElement.setAttribute("data-id", id);
            layerElement.setAttribute("class", "preview");
            layerElement.setAttribute("style", style);
            layerElement.setAttribute("height", ctxTelaPreview.canvas.height);
            layerElement.setAttribute("width", ctxTelaPreview.canvas.width);
            contentTelaPreview.appendChild(layerElement);
            return layerElement;
        },
        adjustPreview(proportion) {
            const { offsetHeight, offsetWidth } = contentPreview;
            const proportionSpace = offsetWidth / offsetHeight;
            let newHeight = offsetHeight, newWidth = Math.floor(newHeight * proportion);
            if (proportion >= proportionSpace) {
                newWidth = offsetWidth;
                newHeight = Math.floor(newWidth / proportion);
            }
            setStyle(contentTelaPreview, { width: newWidth + "px", height: newHeight + "px" });
            ctxTelaPreview.canvas.width = Math.round(newWidth * 1.5);
            ctxTelaPreview.canvas.height = Math.round(newHeight * 1.5);
            return { width: newWidth, height: newHeight };
        },
        changeMoverScrollSizeZoom() {
            const sizeTelasCanvas = { x: D.project.screen.offsetWidth, y: D.project.screen.offsetHeight },
                sizeContentTelas = { x: D.contentTelas.offsetWidth, y: D.contentTelas.offsetHeight },
                sizeContentTelaPreview = { x: contentTelaPreview.offsetWidth, y: contentTelaPreview.offsetHeight };
            if (sizeTelasCanvas.x <= (sizeContentTelas.x - 10) && sizeTelasCanvas.y <= (sizeContentTelas.y - 10)) {
                setStyle(moverScroll, { display: null });
                return;
            }
            let newWidth = sizeContentTelaPreview.x + "px", newHeight = sizeContentTelaPreview.y + "px";
            if (sizeTelasCanvas.x > (sizeContentTelas.x - 10)) {
                const proportionX = (sizeContentTelas.x - 6) / (sizeTelasCanvas.x + 12);
                newWidth = Math.floor(sizeContentTelaPreview.x * proportionX) + "px";
            }
            if (sizeTelasCanvas.y > (sizeContentTelas.y - 10)) {
                const proportionY = (sizeContentTelas.y - 6) / (sizeTelasCanvas.y + 12);
                newHeight = Math.floor(sizeContentTelaPreview.y * proportionY) + "px";
            }
            setStyle(moverScroll, { display: "block", width: newWidth, height: newHeight });
        },
        addDependencies(dependencies) {
            for (const prop in dependencies) { D[prop] = dependencies[prop]; }
        }
    }
}