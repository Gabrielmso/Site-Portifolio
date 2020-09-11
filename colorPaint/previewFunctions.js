import { getMousePosition } from "../js/geral.js";

export default function previewFunctionsObject() {
    const observers = {};
    return {
        contentTelaPreview: document.getElementById("contentTelaPreview"),
        ctxTelaPreview: document.getElementById("telaPreview").getContext("2d"),
        moverScroll: document.getElementById("moverScroll"),
        moverScrollPreview: false,//Saber se o mouse está pressionado na "contentTelaPreview".
        addEventsToElements() {
            observers.contentTelas.addEventListener("scroll", (e) => this.scrollContentTelas(e));
            this.contentTelaPreview.addEventListener("mousedown", (e) => this.mouseDownPreview(e));
            document.getElementById("janelaPreview").addEventListener("mousemove", (e) => this.mouseMovePreview(e));
        },
        mouseDownPreview(e) {
            this.moverScrollPreview = true;
            this.moverScroll.style.cursor = "grabbing";
            this.mouseMoveMoverScroll(getMousePosition(this.contentTelaPreview, e));
            document.addEventListener("mouseup", observers.previewFunctions.mouseUpPreview);
        },
        mouseUpPreview(e) {
            observers.previewFunctions.moverScrollPreview = false;
            observers.previewFunctions.moverScroll.style.cursor = "grab";
            document.removeEventListener("mouseup", observers.previewFunctions.mouseUpPreview);
        },
        mouseMovePreview(e) {
            if (!this.moverScrollPreview) { return; }
            this.mouseMoveMoverScroll(getMousePosition(this.contentTelaPreview, e));
        },
        scrollContentTelas() {
            const mult = (observers.contentTelas.scrollHeight - 12) / this.contentTelaPreview.offsetHeight;
            const mult2 = (observers.contentTelas.scrollWidth - 12) / this.contentTelaPreview.offsetWidth;
            moverScroll.style.top = (observers.contentTelas.scrollTop / mult) + "px";
            moverScroll.style.left = (observers.contentTelas.scrollLeft / mult2) + "px";
        },
        adjustPreview(proportion) {
            const proporcaoEspaco = 256 / 150;
            if (proportion >= proporcaoEspaco) {
                const novaAltura = (256 / proportion);
                this.contentTelaPreview.style.width = "256px";
                this.contentTelaPreview.style.height = novaAltura + "px";
            } else {
                const novaLargura = (150 * proportion);
                this.contentTelaPreview.style.width = novaLargura + "px";
                this.contentTelaPreview.style.height = "150px";
            }
            this.ctxTelaPreview.canvas.width = Math.round(this.contentTelaPreview.offsetWidth * 1.5);
            this.ctxTelaPreview.canvas.height = Math.round(this.contentTelaPreview.offsetHeight * 1.5);
        },
        changeMoverScrollSizeZoom() {//De acordo com o zoom que é dado muda o tamanho do "moverScroll".
            const tamanhoTelasCanvas = { x: observers.project.screen.offsetWidth, y: observers.project.screen.offsetHeight },
                tamanhoContentTelas = { x: observers.contentTelas.offsetWidth, y: observers.contentTelas.offsetHeight },
                tamanhoContentTelaPreview = { x: this.contentTelaPreview.offsetWidth, y: this.contentTelaPreview.offsetHeight };
            this.moverScroll.style.display = "block";
            if (tamanhoTelasCanvas.x <= (tamanhoContentTelas.x - 10) && tamanhoTelasCanvas.y <= (tamanhoContentTelas.y - 10)) {
                this.moverScroll.style.display = "none";
            }
            if (tamanhoTelasCanvas.x > (tamanhoContentTelas.x - 10)) {
                const proporcaoTamanhoX = (tamanhoContentTelas.x - 6) / (tamanhoTelasCanvas.x + 12);
                this.moverScroll.style.width = Math.floor(tamanhoContentTelaPreview.x * proporcaoTamanhoX) + "px";
            } else { this.moverScroll.style.width = tamanhoContentTelaPreview.x + "px"; }
            if (tamanhoTelasCanvas.y > (tamanhoContentTelas.y - 10)) {
                const proporcaoTamanhoY = (tamanhoContentTelas.y - 6) / (tamanhoTelasCanvas.y + 12);
                this.moverScroll.style.height = Math.floor(tamanhoContentTelaPreview.y * proporcaoTamanhoY) + "px";
            } else { this.moverScroll.style.height = tamanhoContentTelaPreview.y + "px"; }
        },
        mouseMoveMoverScroll(mousePos) {//Mover o "moverScroll" com o mouse.
            const metadeLargura = this.moverScroll.offsetWidth / 2, metadeAltura = this.moverScroll.offsetHeight / 2,
                contentTelaPreview = this.contentTelaPreview;
            let left, top;
            if (mousePos.x <= metadeLargura) { left = 0; }
            else if (mousePos.x >= contentTelaPreview.offsetWidth - (Math.floor(metadeLargura))) {
                left = contentTelaPreview.offsetWidth - (metadeLargura * 2);
            } else { left = mousePos.x - (Math.floor(metadeLargura)); }
            if (mousePos.y <= metadeAltura) { top = 0; }
            else if (mousePos.y >= contentTelaPreview.offsetHeight - (Math.floor(metadeAltura))) {
                top = contentTelaPreview.offsetHeight - (metadeAltura * 2);
            } else { top = mousePos.y - (Math.floor(metadeAltura)); }
            this.moverScroll.style.top = top + "px";
            this.moverScroll.style.left = left + "px";
            this.changeScrollsContentTelas(top, left);
        },
        changeScrollsContentTelas(top, left) {//Mudar o valor dos Scroll's do contentTelas movendo o "moverScroll". 
            observers.contentTelas.scrollTop = top * ((observers.contentTelas.scrollHeight) / this.contentTelaPreview.offsetHeight);
            observers.contentTelas.scrollLeft = left * ((observers.contentTelas.scrollWidth) / this.contentTelaPreview.offsetWidth);
        },
        addObserver(newobservers) {
            for (const prop in newobservers) { observers[prop] = newobservers[prop]; }
        }
    }
}