function previewFunctionsObject() {
    return {
        contentTelaPreview: document.getElementById("contentTelaPreview"),
        ctxTelaPreview: document.getElementById("telaPreview").getContext("2d"),
        moverScroll: document.getElementById("moverScroll"),
        moverScrollPreview: false,//Saber se o mouse está pressionado na "contentTelaPreview".
        addEventsToElements() {
            contentTelas.addEventListener("scroll", (e) => this.scrollContentTelas(e));
            this.contentTelaPreview.addEventListener("mousedown", (e) => this.mouseDownPreview(e));
            document.addEventListener("mouseup", (e) => this.mouseUpPreview(e));
            document.getElementById("janelaPreview").addEventListener("mousemove", (e) => this.mouseMovePreview(e));
        },
        mouseDownPreview(e) {
            if (!projetoCriado) { return };
            this.moverScrollPreview = true;
            this.moverScroll.style.cursor = "grabbing";
            const mousePos = pegarPosicaoMouse(this.contentTelaPreview, e);
            this.mouseMoveMoverScroll(mousePos.x, mousePos.y);
        },
        mouseUpPreview(e) {
            this.moverScrollPreview = false;
            this.moverScroll.style.cursor = "grab";
        },
        mouseMovePreview(e) {
            if (this.moverScrollPreview === false) { return; }
            const mousePos = pegarPosicaoMouse(previewFunctions.contentTelaPreview, e);
            this.mouseMoveMoverScroll(mousePos.x, mousePos.y);
        },
        scrollContentTelas() {
            const mult = (contentTelas.scrollHeight - 12) / (this.contentTelaPreview.offsetHeight);
            const mult2 = (contentTelas.scrollWidth - 12) / (this.contentTelaPreview.offsetWidth);
            moverScroll.style.top = (contentTelas.scrollTop / mult) + "px";
            moverScroll.style.left = (contentTelas.scrollLeft / mult2) + "px";
        },
        changeMoverScrollSizeZoom() {//De acordo com o zoom que é dado muda o tamanho do "moverScroll".
            const tamanhoTelasCanvas = { x: telasCanvas.offsetWidth, y: telasCanvas.offsetHeight },
                tamanhoContentTelas = { x: contentTelas.offsetWidth, y: contentTelas.offsetHeight },
                tamanhoContentTelaPreview = { x: previewFunctions.contentTelaPreview.offsetWidth, y: previewFunctions.contentTelaPreview.offsetHeight };
            if (tamanhoTelasCanvas.x <= (tamanhoContentTelas.x - 10) && tamanhoTelasCanvas.y <= (tamanhoContentTelas.y - 10)) {
                this.moverScroll.style.display = "none";
            } else if (tamanhoTelasCanvas.x > (tamanhoContentTelas.x - 10) && tamanhoTelasCanvas.y > (tamanhoContentTelas.y - 10)) {
                const proporcaoTamanhoX = (tamanhoContentTelas.x - 10) / (tamanhoTelasCanvas.x + 12),
                    proporcaoTamanhoY = (tamanhoContentTelas.y - 10) / (tamanhoTelasCanvas.y + 12);
                this.moverScroll.style.display = "block";
                this.moverScroll.style.width = Math.floor(tamanhoContentTelaPreview.x * proporcaoTamanhoX) + "px";
                this.moverScroll.style.height = Math.floor(tamanhoContentTelaPreview.y * proporcaoTamanhoY) + "px";
            } else if (tamanhoTelasCanvas.x > (tamanhoContentTelas.x - 10)) {
                const proporcaoTamanhoX = (tamanhoContentTelas.x - 10) / (tamanhoTelasCanvas.x + 12);
                this.moverScroll.style.display = "block";
                this.moverScroll.style.width = Math.floor(tamanhoContentTelaPreview.x * proporcaoTamanhoX) + "px";
                this.moverScroll.style.height = tamanhoContentTelaPreview.y + "px";
            } else if (tamanhoTelasCanvas.y > (tamanhoContentTelas.y - 10)) {
                const proporcaoTamanhoY = (tamanhoContentTelas.y - 10) / (tamanhoTelasCanvas.y + 12);
                this.moverScroll.style.display = "block";
                this.moverScroll.style.width = tamanhoContentTelaPreview.x + "px";
                this.moverScroll.style.height = Math.floor(tamanhoContentTelaPreview.y * proporcaoTamanhoY) + "px";;
            }
        },
        mouseMoveMoverScroll(mouseX, mouseY) {//Mover o "moverScroll" com o mouse.
            const metadeLargura = this.moverScroll.offsetWidth / 2, metadeAltura = this.moverScroll.offsetHeight / 2,
                contentTelaPreview = previewFunctions.contentTelaPreview;
            if (mouseX <= metadeLargura) { this.moverScroll.style.left = "0px"; }
            else if (mouseX >= contentTelaPreview.offsetWidth - metadeLargura) {
                this.moverScroll.style.left = contentTelaPreview.offsetWidth - (metadeLargura * 2) + "px";
            } else { this.moverScroll.style.left = mouseX - (Math.floor(metadeLargura)) + "px"; }
            if (mouseY <= metadeAltura) { this.moverScroll.style.top = "0px"; }
            else if (mouseY >= contentTelaPreview.offsetHeight - (Math.floor(metadeAltura))) {
                this.moverScroll.style.top = contentTelaPreview.offsetHeight - (metadeAltura * 2) + "px";
            } else { this.moverScroll.style.top = mouseY - (Math.floor(metadeAltura)) + "px"; }
            this.changeScrollsContentTelas(this.moverScroll.offsetTop, this.moverScroll.offsetLeft);
        },
        changeScrollsContentTelas(topPos, leftPos) {//Mudar o valor dos Scroll's do contentTelas movendo o "moverScroll".
            const mult = (contentTelas.scrollWidth) / (this.contentTelaPreview.offsetWidth);
            contentTelas.scrollTop = (topPos * mult);
            contentTelas.scrollLeft = (leftPos * mult);
        }
    }
}