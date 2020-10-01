import { preventDefaultAction, setStyle, getElement } from "../js/geral.js";

export default function projectObject() {
    const D = {}, status = { created: false };
    return {
        get created() { return status.created },
        properties: {
            name: null, resolution: { width: null, height: null, proportion: null },
            background: null, numberLayers: 0
        },
        selectedColors: {
            firstPlane: { r: 0, g: 0, b: 0 }, backgroundPlane: { r: 255, g: 255, b: 255 },
            saved: { selected: -1, colors: [] },
            txtFirstPlane: getElement("txtCorEscolhida"),
            set(plane, color) {
                const apply = {
                    color1: (rgb) => {
                        this.firstPlane = rgb;
                        this.txtFirstPlane.value = D.corPrincipal.style.backgroundColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
                    },
                    color2: (rgb) => {
                        this.backgroundPlane = rgb;
                        D.corSecundaria.style.backgroundColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
                    }
                }
                plane = plane < 1 ? 1 : plane > 2 ? 1 : plane;
                apply["color" + plane](color);
            },
            get(plane) {
                plane = plane < 1 ? 1 : plane > 2 ? 1 : plane;
                return plane === 1 ? this.firstPlane : this.backgroundPlane;
            },
            deselectAllSavedColor() {
                if (this.saved.selected === -1) { return; }
                this.saved.colors[this.saved.selected].el.style.boxShadow = "";
                this.saved.selected = -1;
            },
            selectSavedColor(numColor, plane) {
                this.deselectAllSavedColor();
                this.saved.selected = numColor;
                this.saved.colors[this.saved.selected].el.style.boxShadow = "0px 0px 4px rgb(255, 255, 255)";
                this.set(plane, this.saved.colors[numColor].rgb);
            }
        },
        screen: getElement("telasCanvas"),
        drawComplete: getElement("desenho").getContext("2d"),
        selectedLayer: 0, previousLayer: 0, arrayLayers: [], cursorInBttLook: false,
        layerSampleWindow: {
            window: getElement("janelaDeAmostraDaCamada"), ctx: getElement("canvasAmostraDacamada").getContext("2d"),
            timeTransition: 160,
            adjustSize({ width, height }) {
                this.ctx.canvas.width = width * 2;
                this.ctx.canvas.height = height * 2;
                setStyle(this.ctx.canvas, { width: this.ctx.canvas.width + "px", height: this.ctx.canvas.height + "px" });
            },
            open(layer, icon) {
                const { top, height } = icon.getBoundingClientRect();
                setStyle(this.window, { display: "block", top: top - (this.ctx.canvas.height + 20 - height) + "px" });
                this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
                this.ctx.drawImage(layer, 0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
                setTimeout(() => setStyle(this.window, { opacity: "1" }), 7);
            },
            close() {
                setStyle(this.window, { opacity: null });
                setTimeout(() => setStyle(this.window, { display: null }), this.timeTransition);
            },
        },
        layerOpacityBar: {
            content: getElement("contentBarraOpacidadeCamada"),
            bar: getElement("barraOpacidadeCamada"),
            mousedown: false,
        },
        addEventsToElements() {
            this.selectedColors.set(1, this.selectedColors.get(1));
            this.layerOpacityBar.bar.addEventListener("input", (e) => { this.changeOpacityLayer(+((+(e.currentTarget.value)).toFixed(2))) });
            getElement("bttRemoverCorSalva").addEventListener("mousedown", () => this.removeColor());
        },
        saveColor(colorToSave) {
            const indexColor = this.selectedColors.saved.colors.length;
            if (indexColor === 0) { getElement("bttRemoverCorSalva").style.display = "block"; }
            for (let i = 0; i < indexColor; i++) {
                const color = this.selectedColors.saved.colors[i].rgb;
                if (color.r === colorToSave.r && color.g === colorToSave.g && color.b === colorToSave.b) {
                    D.notification.open({ name: "notify", time: 1500 }, { title: "Atenção!", text: "Essa cor já está salva." });
                    return;
                }
            }
            const styleColor = "rgb(" + colorToSave.r + ", " + colorToSave.g + ", " + colorToSave.b + ")";
            const savedColorEl = document.createElement("div");
            savedColorEl.setAttribute("title", styleColor);
            savedColorEl.setAttribute("class", "corSalva cursor");
            savedColorEl.setAttribute("style", "background-color: " + styleColor + ";");
            this.selectedColors.saved.colors.push({ el: savedColorEl, rgb: colorToSave });
            getElement("coresSalvas").appendChild(savedColorEl);
            this.selectedColors.saved.colors[indexColor].el.addEventListener("mousedown", (e) => {
                if (!D.colorSelectionWindow.opened) { this.selectedColors.selectSavedColor(indexColor, e.button); }
                else { D.colorSelectionWindow.currentColor = this.selectedColors.saved.colors[indexColor].rgb; }
            });
            this.selectedColors.saved.colors[indexColor].el.addEventListener("contextmenu", preventDefaultAction);
        },
        removeColor() {
            if (!D.colorSelectionWindow.opened && this.selectedColors.saved.selected > -1) {
                this.selectedColors.saved.colors.splice(this.selectedColors.saved.selected, 1)[0].el.remove();
                this.selectedColors.saved.selected = -1;
                const resave = this.selectedColors.saved.colors;
                this.selectedColors.saved.colors = [];
                for (let i = 0; i < resave.length; i++) {
                    resave[i].el.remove();
                    this.saveColor(resave[i].rgb);
                }
                if (this.selectedColors.saved.colors.length === 0) { getElement("bttRemoverCorSalva").style.display = "none"; }
            }
        },
        zoom(zoom, centralize, value) {
            if (!status.created) { return; }
            const previousWidth = this.screen.offsetWidth, { width, proportion } = this.properties.resolution;
            let larguraAtual = zoom === "porcentagem" ? width * value / 100 : zoom ? previousWidth * value : previousWidth / value;
            larguraAtual = larguraAtual <= 25 ? 25 : larguraAtual >= width * 32 ? width * 32 : larguraAtual;
            const alturaAtual = (larguraAtual / proportion), { offsetWidth, offsetHeight } = D.contentTelas
            this.screen.style.width = larguraAtual + "px";
            this.screen.style.height = alturaAtual + "px";
            this.screen.style.left = larguraAtual >= (offsetWidth - 12) ? "6px" : (offsetWidth / 2) - (larguraAtual / 2) + "px";
            this.screen.style.top = alturaAtual >= (offsetHeight - 12) ? "6px" : (offsetHeight / 2) - (alturaAtual / 2) + "px";
            if (centralize) {
                D.contentTelas.scrollTop = ((alturaAtual / 2) + 12) - (offsetHeight / 2);
                D.contentTelas.scrollLeft = ((larguraAtual / 2) + 12) - (offsetWidth / 2);
            }
            D.txtPorcentagemZoom.value = ((larguraAtual * 100) / width).toFixed(2).replace(".", ",") + "%";
            D.previewFunctions.changeMoverScrollSizeZoom();
            D.drawingTools.changeCursorTool();
        },
        adjustInVisualizationScreen() {
            const { width, height, proportion } = this.properties.resolution, maxWidth = D.contentTelas.offsetWidth - 12,
                maxHeight = D.contentTelas.offsetHeight - 12, proportionContent = maxWidth / maxHeight,
                zoomAdjusted = proportion >= proportionContent ? +(((maxWidth * 100) / width).toFixed(2)) : +(((maxHeight * 100) / height).toFixed(2));
            this.zoom("porcentagem", false, zoomAdjusted);
        },
        adjustScreen() {
            const maxWidth = D.contentTelas.offsetWidth - 12, maxHeight = D.contentTelas.offsetHeight - 12;
            if (this.properties.resolution.width >= maxWidth || this.properties.resolution.height >= maxHeight) {
                this.adjustInVisualizationScreen();
            } else { this.zoom("porcentagem", false, 100); }
        },
        changeOpacityLayer(value) {
            this.arrayLayers[this.selectedLayer].txtOpacity.value = Math.floor((value * 100)) + "%";
            this.arrayLayers[this.selectedLayer].ctx.canvas.style.opacity = this.arrayLayers[this.selectedLayer].opacity = value;
            this.drawInPreview(this.arrayLayers[this.selectedLayer]);
        },
        create(name, resolution, background, numberLayers) {
            const corFundo = getElement("corFundo"), fundoPreview = getElement("fundoPreview"),
                txtResolucao = getElement("txtResolucao");
            this.properties.name = name;
            this.properties.resolution = { width: resolution.width, height: resolution.height, proportion: resolution.width / resolution.height };
            this.properties.background = background;
            this.properties.numberLayers = numberLayers;
            let color = false;
            if (this.properties.background != false) {
                color = "rgb(" + this.properties.background.r + ", " + this.properties.background.g + ", " + this.properties.background.b + ")"
                fundoPreview.style.backgroundColor = corFundo.style.backgroundColor = color;
            } else {
                corFundo.style.backgroundImage = "url('colorPaint/imagens/fundoTela/transparente.png')";
                fundoPreview.style.backgroundImage = "url('colorPaint/imagens/fundoTela/transparenteMiniatura.png')";
            }
            this.drawComplete.canvas.width = this.properties.resolution.width;
            this.drawComplete.canvas.height = this.properties.resolution.height;
            D.drawingTools.eventLayer.canvas.width = this.properties.resolution.width;
            D.drawingTools.eventLayer.canvas.height = this.properties.resolution.height;
            txtResolucao.value = this.properties.resolution.width + ", " + this.properties.resolution.height;
            while (this.properties.numberLayers > this.arrayLayers.length) { this.createElements(color); }
            getElement("nomeDoProjeto").innerText = this.properties.name;
            this.layerOpacityBar.content.style.display = "flex";
            status.created = true;
            this.adjustScreen();
            D.drawingTools.addEventsToElements();
            D.previewFunctions.addEventsToElements();
            D.undoRedoChange.addEventsToElements();
            D.hotKeys.addEventsToElements();
            this.layerSampleWindow.adjustSize(D.previewFunctions.adjustPreview(this.properties.resolution.proportion));
            setTimeout(() => this.clickIconLayer(0), 3);
        },
        createElements(color) {
            const num = this.arrayLayers.length + 1;
            // ============= CRIA O ICONE DA CAMADA ==================
            const contentIconeCamadas = getElement("contentIconeCamadas");
            const idicone = "camadaIcone" + num;
            const iconeCamada = document.createElement("div");
            iconeCamada.setAttribute("data-id", idicone);
            iconeCamada.setAttribute("class", "camadas");
            if (num === 1) { contentIconeCamadas.appendChild(iconeCamada); }
            else {
                const idElAnterior = "camadaIcone" + (num - 1);
                contentIconeCamadas.insertBefore(iconeCamada, getElement(idElAnterior));
            }
            contentIconeCamadas.scrollTop = contentIconeCamadas.scrollHeight;
            const bttVisivel = document.createElement("div");
            const idBttVisivel = "visivel" + num;
            bttVisivel.setAttribute("data-id", idBttVisivel);
            bttVisivel.setAttribute("class", "iconVer cursor");
            iconeCamada.appendChild(bttVisivel);
            const info = document.createElement("label");
            const idNome = "nomeCamada" + num;
            const nomeCamada = document.createElement("span");
            nomeCamada.setAttribute("data-id", idNome);
            nomeCamada.innerHTML = "Camada " + num;
            const br = document.createElement("br");
            const txtOpacidade = document.createElement("span");
            txtOpacidade.innerHTML = "Opacidade: ";
            const idPocentagem = "porcent" + num;
            const txtPorcentagem = document.createElement("input");
            txtPorcentagem.setAttribute("type", "text");
            txtPorcentagem.setAttribute("data-id", idPocentagem);
            txtPorcentagem.setAttribute("readOnly", "true");
            txtPorcentagem.setAttribute("class", "opacidadeCamada");
            txtPorcentagem.setAttribute("value", "100%");
            info.appendChild(nomeCamada);
            info.appendChild(br);
            info.appendChild(txtOpacidade);
            info.appendChild(txtPorcentagem);
            iconeCamada.appendChild(info);
            const contentMiniIcon = document.createElement("div");
            contentMiniIcon.setAttribute("class", "contentIcon");
            iconeCamada.appendChild(contentMiniIcon);
            const idIconTela = "iconTela" + num;
            const iconTela = document.createElement("canvas");
            iconTela.setAttribute("data-id", idIconTela);
            let styleIconTela, proportioIcon = 80 / 60;
            if (this.properties.resolution.proportion >= proportioIcon) {
                const iconAltura = Math.round(80 / this.properties.resolution.proportion);
                styleIconTela = "width: 80px; height: " + iconAltura + "px; ";
            } else {
                const iconLargura = Math.round(60 * this.properties.resolution.proportion);
                styleIconTela = "width: " + iconLargura + "px; height: 60px; ";
            }
            if (color != false) { styleIconTela = styleIconTela + "background-color: " + color; }
            else { styleIconTela = styleIconTela + "background-image: url('colorPaint/imagens/fundoTela/transparenteMiniatura.png')"; }
            iconTela.setAttribute("style", styleIconTela);
            iconTela.setAttribute("class", "iconTela");
            contentMiniIcon.appendChild(iconTela);
            iconTela.width = Math.round(iconTela.offsetWidth * 1.6);
            iconTela.height = Math.round(iconTela.offsetHeight * 1.6);
            const sobrePor = document.createElement("div");
            contentMiniIcon.appendChild(sobrePor);
            // ====================================== CRIA A CAMADA ========================================
            const idCamada = "telaCamada" + num;
            const camadaStyle = "z-index: " + (num * 2) + ";";
            const elCamada = document.createElement("canvas");
            elCamada.setAttribute("data-id", idCamada);
            elCamada.setAttribute("class", "telaCanvas");
            elCamada.setAttribute("style", camadaStyle);
            elCamada.setAttribute("height", this.properties.resolution.height);
            elCamada.setAttribute("width", this.properties.resolution.width);
            this.screen.appendChild(elCamada);
            // ================================== CRIA O PREVIEW DA CAMADA ====================================
            const idPreviewCamada = "camadaPreview" + num;
            const previewLayer = D.previewFunctions.createPreviewLayer(idPreviewCamada, camadaStyle);
            if (getElement(idicone) != null && getElement(idBttVisivel) != null &&
                getElement(idNome) != null && getElement(idPocentagem) != null &&
                getElement(idIconTela) != null && getElement(idCamada) != null &&
                getElement(idPreviewCamada) != null) {
                const objCamada = {
                    name: nomeCamada, ctx: elCamada.getContext("2d"), icon: iconeCamada,
                    previewLayer: previewLayer.getContext("2d"), miniature: iconTela.getContext("2d"),
                    bttLook: bttVisivel, txtOpacity: txtPorcentagem, opacity: 1, visible: true, cursorInIcon: false
                };
                this.arrayLayers[num - 1] = objCamada;
                this.arrayLayers[num - 1].icon.addEventListener("mousedown", () => this.clickIconLayer(num - 1));
                this.arrayLayers[num - 1].icon.addEventListener("mouseenter", () => this.showLayerSample(num - 1));
                this.arrayLayers[num - 1].icon.addEventListener("mouseleave", () => this.closeLayerSample(num - 1));
                this.arrayLayers[num - 1].bttLook.addEventListener("mousedown", () => this.clickBttLook(num - 1));
                this.arrayLayers[num - 1].bttLook.addEventListener("mouseover", () => this.cursorInBttLook = true);
                this.arrayLayers[num - 1].bttLook.addEventListener("mouseleave", () => this.cursorInBttLook = false);
            }
        },
        clickBttLook(numLayer) {
            this.arrayLayers[numLayer].visible = !this.arrayLayers[numLayer].visible;
            this.cursorInBttLook = false;
            if (this.arrayLayers[numLayer].visible) {
                this.arrayLayers[numLayer].ctx.canvas.style.display = "block";
                this.arrayLayers[numLayer].previewLayer.canvas.style.display = "block";
                this.arrayLayers[numLayer].bttLook.classList.replace("iconNaoVer", "iconVer");
                this.clickIconLayer(numLayer);
            } else {
                this.arrayLayers[numLayer].ctx.canvas.style.display = "none";
                this.arrayLayers[numLayer].previewLayer.canvas.style.display = "none";
                this.arrayLayers[numLayer].bttLook.classList.replace("iconVer", "iconNaoVer");
                this.arrayLayers[numLayer].icon.classList.replace("camadaSelecionada", "camadas");
                for (let i = 0; i < this.properties.numberLayers; i++) {
                    if (i != numLayer && numLayer === this.selectedLayer && this.arrayLayers[i].visible) {
                        this.clickIconLayer(i);
                        i = this.properties.numberLayers;
                    }
                }
            }
            this.cursorInBttLook = true;
        },
        clickIconLayer(numLayer) {
            if (this.cursorInBttLook || !this.arrayLayers[numLayer].visible) { return; }
            this.previousLayer = this.previousLayer === this.selectedLayer ? this.previousLayer : this.selectedLayer;
            this.selectedLayer = numLayer;
            D.drawingTools.eventLayer.canvas.style.zIndex = ((numLayer + 1) * 2) + 1;
            this.arrayLayers[this.previousLayer].icon.classList.replace("camadaSelecionada", "camadas");
            this.arrayLayers[this.selectedLayer].icon.classList.replace("camadas", "camadaSelecionada");
            this.layerOpacityBar.bar.value = this.arrayLayers[this.selectedLayer].opacity;
            D.drawingTools.currentLayer = this.arrayLayers[this.selectedLayer].ctx;
        },
        showLayerSample(numLayer) {
            this.arrayLayers[numLayer].cursorInIcon = true;
            setTimeout(() => {
                if (this.cursorInBttLook || !this.arrayLayers[numLayer].cursorInIcon) { return; }
                this.layerSampleWindow.open(this.arrayLayers[numLayer].ctx.canvas, this.arrayLayers[numLayer].icon);
            }, 850)
        },
        closeLayerSample(numLayer) {
            this.arrayLayers[numLayer].cursorInIcon = false;
            this.layerSampleWindow.close();
        },
        createDrawComplete() {
            this.drawComplete.clearRect(0, 0, this.properties.resolution.width, this.properties.resolution.height);
            if (this.properties.background != false) {
                this.drawComplete.globalAlpha = 1;
                this.drawComplete.fillStyle = "rgb(" + this.properties.background.r + ", " + this.properties.background.g + ", " + this.properties.background.b + ")";
                this.drawComplete.fillRect(0, 0, this.properties.resolution.width, this.properties.resolution.height);
            }
            for (let i = 0; i < this.properties.numberLayers; i++) {
                if (this.arrayLayers[i].visible) {
                    this.drawComplete.globalAlpha = this.arrayLayers[i].opacity;
                    this.drawComplete.drawImage(this.arrayLayers[i].ctx.canvas, 0, 0, this.properties.resolution.width, this.properties.resolution.height);
                };
            }
        },
        drawInLayer() {
            D.undoRedoChange.saveChanges();
            this.arrayLayers[this.selectedLayer].ctx.drawImage(D.drawingTools.eventLayer.canvas, 0, 0, this.properties.resolution.width, this.properties.resolution.height);
            D.drawingTools.eventLayer.clearRect(0, 0, this.properties.resolution.width, this.properties.resolution.height);
            this.drawInPreview(this.arrayLayers[this.selectedLayer]);
        },
        drawInPreview(layer) {
            const camadaPreview = layer.previewLayer;
            camadaPreview.clearRect(0, 0, camadaPreview.canvas.width, camadaPreview.canvas.height);
            camadaPreview.globalAlpha = layer.opacity;
            camadaPreview.drawImage(layer.ctx.canvas, 0, 0, camadaPreview.canvas.width, camadaPreview.canvas.height);
            this.drawInIcon(layer);
        },
        drawInIcon(layer) {
            const miniatura = layer.miniature;
            miniatura.clearRect(0, 0, miniatura.canvas.width, miniatura.canvas.height);
            miniatura.drawImage(layer.previewLayer.canvas, 0, 0, miniatura.canvas.width, miniatura.canvas.height);
        },
        saveDraw() {
            if (!this.notifyAnyCreatedProjects()) { return; }
            this.createDrawComplete();
            const dataURLtoBlob = (dataURL) => {
                const BASE64_MARKER = ";base64,", base64Index = dataURL.indexOf(BASE64_MARKER) + BASE64_MARKER.length,
                    base64 = dataURL.substring(base64Index), raw = window.atob(base64), rawLength = raw.length;
                let array = new Uint8Array(rawLength);
                for (let i = 0; i < rawLength; i++) { array[i] = raw.charCodeAt(i); }
                return new Blob([array], { type: "image/png" });
            }, blob = dataURLtoBlob(this.drawComplete.canvas.toDataURL("image/png")),
                url = URL.createObjectURL(blob), salvarImagem = document.createElement("a");
            salvarImagem.setAttribute("download", this.properties.name + ".png");
            salvarImagem.setAttribute("href", url);
            salvarImagem.click();
        },
        saveProject() {
            if (!this.notifyAnyCreatedProjects()) { return; }
            const dadosCamadas = [], coresSalvasProjeto = [];
            for (let i = 0; i < this.properties.numberLayers; i++) {
                dadosCamadas[i] = {
                    imgDataCamada: this.arrayLayers[i].ctx.canvas.toDataURL("imagem/png"),
                    opacidade: this.arrayLayers[i].opacity, visivel: this.arrayLayers[i].visible,
                };
            }
            for (let i = 0; i < this.selectedColors.saved.colors.length; i++) { coresSalvasProjeto[i] = this.selectedColors.saved.colors[i].rgb; }
            const objProjeto = {
                nomeProjeto: this.properties.name, resolucaoDoProjeto: this.properties.resolution,
                corDeFundo: this.properties.background, coresSalvas: coresSalvasProjeto,
                grid: D.createGridWindow.gridProperties,
                numeroDeCamadas: this.properties.numberLayers, camadas: dadosCamadas
            }
            const data = encode(JSON.stringify(objProjeto)), blob = new Blob([data], { type: "application/octet-stream;charset=utf-8" }),
                url = URL.createObjectURL(blob), link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", this.properties.name + ".gm");
            link.click();
            function encode(s) {
                let out = [];
                for (let i = 0; i < s.length; i++) { out[i] = s.charCodeAt(i); }
                return new Uint8Array(out);
            }
        },
        loadProject(file) {
            const createSavedProject = (objProjeto) => {
                this.create(objProjeto.nomeProjeto, objProjeto.resolucaoDoProjeto, objProjeto.corDeFundo, objProjeto.numeroDeCamadas);
                for (let i = 0; i < this.properties.numberLayers; i++) {
                    const opacidade = objProjeto.camadas[i].opacidade;
                    this.arrayLayers[i].txtOpacity.value = Math.round(opacidade * 100) + "%";
                    this.arrayLayers[i].opacity = opacidade;
                    this.arrayLayers[i].ctx.canvas.style.opacity = opacidade;
                    const imgData = new Image();
                    imgData.src = objProjeto.camadas[i].imgDataCamada;
                    imgData.onload = () => {
                        this.arrayLayers[i].ctx.drawImage(imgData, 0, 0);
                        const larguraMiniatura = this.arrayLayers[i].miniature.canvas.width, alturaMiniatura = this.arrayLayers[i].miniature.canvas.height;
                        this.arrayLayers[i].previewLayer.globalAlpha = this.arrayLayers[i].opacity;
                        this.arrayLayers[i].previewLayer.drawImage(this.arrayLayers[i].ctx.canvas, 0, 0, this.arrayLayers[i].previewLayer.canvas.width, this.arrayLayers[i].previewLayer.canvas.height);
                        this.arrayLayers[i].miniature.drawImage(this.arrayLayers[i].previewLayer.canvas, 0, 0, larguraMiniatura, alturaMiniatura);
                        if (!objProjeto.camadas[i].visivel) { this.clickBttLook(i); };
                    }
                }
                for (let i = 0; i < objProjeto.coresSalvas.length; i++) { this.saveColor(objProjeto.coresSalvas[i]); }
                D.createGridWindow.createGrid = objProjeto.grid;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.currentTarget.result === "") {
                    D.notification.open({ name: "notify", time: 2000 },
                        { title: "Erro!", text: "Este arquivo não possui projeto salvo." });
                } else { createSavedProject(JSON.parse(e.currentTarget.result)); }
            };
            reader.readAsText(file, "ISO-8859-1");
        },
        notifyAnyCreatedProjects() {
            if (!status.created) {
                D.notification.open({ name: "notify", time: 1500 },
                    { title: "Atenção!", text: "Nenhum projeto foi criado." });
            }
            return status.created;
        },
        addDependencies(dependencies) {
            for (const prop in dependencies) { D[prop] = dependencies[prop]; }
        }
    }
}