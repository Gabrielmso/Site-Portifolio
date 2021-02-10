import { getMousePosition, getElement, setStyle } from "../js/utils.js";

export default function previewFunctionsObject({ project, contentTelasPreview, contentTelas, screen }) {
    const moverScroll = getElement("moverScroll");
    const scrollEventMoveMoverScroll = () => {
        const mult = (contentTelas.scrollHeight - 12) / contentTelasPreview.offsetHeight;
        const mult2 = (contentTelas.scrollWidth - 12) / contentTelasPreview.offsetWidth;
        setStyle(moverScroll, {
            top: (contentTelas.scrollTop / mult) + "px", left: (contentTelas.scrollLeft / mult2) + "px"
        });
    }
    const changeScrollsContentTelas = (top, left) => {
        contentTelas.scrollTop = top * ((contentTelas.scrollHeight) / contentTelasPreview.offsetHeight);
        contentTelas.scrollLeft = left * ((contentTelas.scrollWidth) / contentTelasPreview.offsetWidth);
    }
    const mouseMoveMoverScroll = ({ x, y }) => {
        const midWidth = moverScroll.offsetWidth / 2, midHeight = moverScroll.offsetHeight / 2;
        let left, top;
        if (x <= midWidth) { left = 0; }
        else if (x >= contentTelasPreview.offsetWidth - (Math.floor(midWidth))) {
            left = contentTelasPreview.offsetWidth - (midWidth * 2);
        } else { left = x - (Math.floor(midWidth)); }
        if (y <= midHeight) { top = 0; }
        else if (y >= contentTelasPreview.offsetHeight - (Math.floor(midHeight))) {
            top = contentTelasPreview.offsetHeight - (midHeight * 2);
        } else { top = y - (Math.floor(midHeight)); }
        setStyle(moverScroll, { top: top + "px", left: left + "px" });
        changeScrollsContentTelas(top, left);
    }
    const mouseMovePreview = e => mouseMoveMoverScroll(getMousePosition(contentTelasPreview, e));
    const mouseUpPreview = () => {
        setStyle(moverScroll, { cursor: "grab" });
        document.removeEventListener("mousemove", mouseMovePreview);
        document.removeEventListener("mouseup", mouseUpPreview);
    }
    const mouseDownPreview = e => {
        if (project.toolInUse) { return; }
        setStyle(moverScroll, { cursor: "grabbing" });
        mouseMoveMoverScroll(getMousePosition(contentTelasPreview, e));
        document.addEventListener("mousemove", mouseMovePreview);
        document.addEventListener("mouseup", mouseUpPreview);
    }
    const changeMoverScrollSizeZoom = () => {
        const sizeTelasCanvas = { x: screen.offsetWidth, y: screen.offsetHeight },
            sizeContentTelas = { x: contentTelas.offsetWidth, y: contentTelas.offsetHeight },
            sizeContentTelaPreview = { x: contentTelasPreview.offsetWidth, y: contentTelasPreview.offsetHeight };
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
    }
    const onZoom = changeMoverScrollSizeZoom;

    contentTelas.addEventListener("scroll", scrollEventMoveMoverScroll);
    contentTelasPreview.addEventListener("mousedown", mouseDownPreview);

    return { onZoom }
}