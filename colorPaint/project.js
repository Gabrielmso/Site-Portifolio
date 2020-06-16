function projectObject() {
    return {
        properties: {
            name: null,
            resolution: { width: null, height: null, proportion: null },
            background: null,
            numberLayers: 0
        },
        selectedColors: {
            firstPlane: { r: 0, g: 0, b: 0 }, backgroundPlane: { r: 255, g: 255, b: 255 },
            txtFirstPlane: document.getElementById("txtCorEscolhida"),
            set(plane, color) {
                const apply = {
                    color1(rgb) {
                        this.firstPlane = rgb;
                        this.txtFirstPlane.value = corPrincipal.style.backgroundColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
                    },
                    color2(rgb) {
                        this.backgroundPlane = rgb;
                        corSecundaria.style.backgroundColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
                    }
                }
                plane = plane < 1 ? 1 : plane > 2 ? 1 : plane;
                apply["color" + plane].call(this, color);
            },
            get(plane) {
                plane = plane < 1 ? 1 : plane > 2 ? 1 : plane;
                return plane === 1 ? this.firstPlane : this.backgroundPlane;
            }
        },
        contentSavedColors: document.getElementById("coresSalvas"),
        savedColors: [],
        created: false,
        drawComplete: document.getElementById("desenho").getContext("2d"),
        screen: document.getElementById("telasCanvas"),
        selectedLayer: 0,
        arrayLayers: [],
        cursorInBttLook: false,
        layerOpacityBar: {
            content: document.getElementById("contentBarraOpacidadeCamada"),
            bar: document.getElementById("barraOpacidadeCamada"),
            cursor: document.getElementById("cursorOpacidadeCamada"),
            mousedown: false,
        },
        addEventsToElements() {
            this.selectedColors.set(1, this.selectedColors.get(1));
            this.layerOpacityBar.content.addEventListener("mousemove", (e) => this.changeOpacityLayer(e));
            this.layerOpacityBar.bar.addEventListener("mousedown", (e) => {
                this.layerOpacityBar.mousedown = true;
                this.changeOpacityLayer(e);
            });
            this.layerOpacityBar.content.addEventListener("mouseup", () => this.applyOpacityLayer());
            this.layerOpacityBar.content.addEventListener("mouseleave", () => this.applyOpacityLayer());
            document.getElementById("bttRemoverCorSalva").addEventListener("mousedown", () => this.removeColor());
        },
        saveColor(colorToSave) {
            let savedColor = false, numSavedColor = this.savedColors.length;
            if (numSavedColor === 0) { document.getElementById("bttRemoverCorSalva").style.display = "block"; }
            for (let i = 0; i < numSavedColor; i++) {
                const color = this.savedColors[i].color;
                if (color.r === colorToSave.r && color.g === colorToSave.g && color.b === colorToSave.b) {
                    savedColor = true;
                    notification.open({ title: "Atenção!", text: "Essa cor já está salva." }, { name: "notify", time: 1500 }, null);
                }
            }
            if (!savedColor) {
                const styleColor = "background-color: rgb(" + colorToSave.r + ", " + colorToSave.g + ", " + colorToSave.b + ");";
                const id = "cor" + (numSavedColor), savedColorEl = document.createElement("div");
                savedColorEl.setAttribute("id", id);
                savedColorEl.setAttribute("class", "corSalva cursor");
                savedColorEl.setAttribute("style", styleColor);
                const savedColorObject = { id: numSavedColor, element: savedColorEl, color: colorToSave, selected: false }
                this.savedColors.push(savedColorObject);
                this.contentSavedColors.appendChild(savedColorEl);
                this.savedColors[numSavedColor].element.addEventListener("mousedown", (e) => {
                    if (!colorSelectionWindow.opened) {
                        this.savedColors[numSavedColor].selected = true;
                        this.savedColors[numSavedColor].element.style.boxShadow = "0px 0px 4px rgb(255, 255, 255)";
                        this.selectedColors.set(e.button, this.savedColors[numSavedColor].color);
                        for (let i = 0; i < this.savedColors.length; i++) {
                            if (i != numSavedColor) {
                                this.savedColors[i].selected = false;
                                this.savedColors[i].element.style.boxShadow = "";
                            }
                        }
                    } else { colorSelectionWindow.findColor(this.savedColors[numSavedColor].color); }
                });
                this.savedColors[numSavedColor].element.addEventListener("contextmenu", preventDefaultAction);
            }
        },
        removeColor() {
            if (!colorSelectionWindow.opened) {
                let colorsToSave = [];
                for (let i = 0; i < this.savedColors.length; i++) {
                    if (!this.savedColors[i].selected) { colorsToSave.push(this.savedColors[i].color); }
                    this.savedColors[i].element.remove();
                }
                this.savedColors = [];
                for (let i = 0; i < colorsToSave.length; i++) { this.saveColor(colorsToSave[i]); }
                if (this.savedColors.length === 0) { document.getElementById("bttRemoverCorSalva").style.display = "none"; }
            }
        },
        zoom(zoom, centralize, value) {
            if (!this.created) { return; }
            const previousWidth = this.screen.offsetWidth, { width, proportion } = this.properties.resolution;
            let larguraAtual = zoom === "porcentagem" ? width * value / 100 : zoom ? previousWidth * value : previousWidth / value;
            larguraAtual = larguraAtual <= 25 ? 25 : larguraAtual >= width * 32 ? width * 32 : larguraAtual;
            const alturaAtual = (larguraAtual / proportion), { offsetWidth, offsetHeight } = contentTelas
            this.screen.style.width = larguraAtual + "px";
            this.screen.style.height = alturaAtual + "px";
            this.screen.style.left = larguraAtual >= (offsetWidth - 12) ? "6px" : (offsetWidth / 2) - (larguraAtual / 2) + "px";
            this.screen.style.top = alturaAtual >= (offsetHeight - 12) ? "6px" : (offsetHeight / 2) - (alturaAtual / 2) + "px";
            if (centralize) {
                contentTelas.scrollTop = ((alturaAtual / 2) + 12) - (offsetHeight / 2);
                contentTelas.scrollLeft = ((larguraAtual / 2) + 12) - (offsetWidth / 2);
            }
            txtPorcentagemZoom.value = ((larguraAtual * 100) / width).toFixed(2).replace(".", ",") + "%";
            previewFunctions.changeMoverScrollSizeZoom();
            drawingTools.changeCursorTool();
        },
        adjustInVisualizationScreen() {
            const { width, height, proportion } = this.properties.resolution, maxWidth = contentTelas.offsetWidth - 12,
                maxHeight = contentTelas.offsetHeight - 12, proportionContent = maxWidth / maxHeight,
                zoomAdjusted = proportion >= proportionContent ? +(((maxWidth * 100) / width).toFixed(2)) : +(((maxHeight * 100) / height).toFixed(2));
            this.zoom("porcentagem", false, zoomAdjusted);
        },
        adjustScreen() {
            const maxWidth = contentTelas.offsetWidth - 12, maxHeight = contentTelas.offsetHeight - 12;
            if (this.properties.resolution.width >= maxWidth || this.properties.resolution.height >= maxHeight) {
                this.adjustInVisualizationScreen();
            } else { this.zoom("porcentagem", false, 100); }
        },
        applyOpacityLayer() {
            if (!this.layerOpacityBar.mousedown) { return; }
            this.layerOpacityBar.mousedown = false;
            this.drawInPreview(this.arrayLayers[this.selectedLayer]);
        },
        changeOpacityLayer(e) {
            if (!this.layerOpacityBar.mousedown) { return; }
            const mouse = getMousePosition(this.layerOpacityBar.bar, e).x;
            let porcentagem = Math.round((mouse * 100) / this.layerOpacityBar.bar.offsetWidth);
            if (mouse <= 1) {
                porcentagem = 1;
                cursorOpacidadeCamada.style.left = "-7px";
            } else if (mouse >= 200) {
                porcentagem = 100;
                cursorOpacidadeCamada.style.left = "193px";
            } else { cursorOpacidadeCamada.style.left = mouse - 7 + "px"; }
            this.arrayLayers[this.selectedLayer].txtOpacity.value = porcentagem + "%";
            let opacidade = porcentagem / 100;
            this.arrayLayers[this.selectedLayer].opacity = opacidade;
            this.arrayLayers[this.selectedLayer].ctx.canvas.style.opacity = opacidade;
        },
        create(name, resolution, background, numberLayers) {
            const corFundo = document.getElementById("corFundo"), fundoPreview = document.getElementById("fundoPreview"),
                txtResolucao = document.getElementById("txtResolucao");
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
            drawingTools.eventLayer.canvas.width = this.properties.resolution.width;
            drawingTools.eventLayer.canvas.height = this.properties.resolution.height;
            txtResolucao.value = this.properties.resolution.width + ", " + this.properties.resolution.height;
            while (this.properties.numberLayers > this.arrayLayers.length) { this.createElements(color); }
            document.getElementById("nomeDoProjeto").innerText = this.properties.name;
            this.layerOpacityBar.content.style.display = "flex";
            this.created = true;
            this.adjustScreen();
            previewFunctions.adjustPreview(this.properties.resolution.proportion);
            drawingTools.addEventsToElements();
            previewFunctions.addEventsToElements();
            undoRedoChange.addEventsToElements();
            hotKeys.addEventsToElements();
            setTimeout(() => this.clickIconLayer(0), 3);
        },
        createElements(color) {
            const num = this.arrayLayers.length + 1;
            // ============= CRIA O ICONE DA CAMADA ==================
            const contentIconeCamadas = document.getElementById("contentIconeCamadas");
            const idicone = "camadaIcone" + num;
            const iconeCamada = document.createElement("div");
            iconeCamada.setAttribute("id", idicone);
            iconeCamada.setAttribute("class", "camadas");
            if (num === 1) { contentIconeCamadas.appendChild(iconeCamada); }
            else {
                const idElAnterior = "camadaIcone" + (num - 1);
                const elAnterior = document.getElementById(idElAnterior);
                contentIconeCamadas.insertBefore(iconeCamada, elAnterior);
            }
            contentIconeCamadas.scrollTop = contentIconeCamadas.scrollHeight;
            const bttVisivel = document.createElement("div");
            const idBttVisivel = "visivel" + num;
            bttVisivel.setAttribute("id", idBttVisivel);
            bttVisivel.setAttribute("class", "iconVer cursor");
            iconeCamada.appendChild(bttVisivel);
            const info = document.createElement("label");
            const idNome = "nomeCamada" + num;
            const nomeCamada = document.createElement("span");
            nomeCamada.setAttribute("id", idNome);
            nomeCamada.innerHTML = "Camada " + num;
            const br = document.createElement("br");
            const txtOpacidade = document.createElement("span");
            txtOpacidade.innerHTML = "Opacidade: ";
            const idPocentagem = "porcent" + num;
            const txtPorcentagem = document.createElement("input");
            txtPorcentagem.setAttribute("type", "text");
            txtPorcentagem.setAttribute("id", idPocentagem);
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
            iconTela.setAttribute("id", idIconTela);
            let styleIconTela;
            if (this.properties.resolution.proportion >= 1) {
                const iconAltura = Math.round(80 / this.properties.resolution.proportion);
                styleIconTela = "width: 80px; height: " + iconAltura + "px; ";
            } else {
                const iconLargura = Math.round(80 * this.properties.resolution.proportion);
                styleIconTela = "width: " + iconLargura + "px; height: 80px; ";
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
            elCamada.setAttribute("id", idCamada);
            elCamada.setAttribute("class", "telaCanvas");
            elCamada.setAttribute("style", camadaStyle);
            elCamada.setAttribute("height", this.properties.resolution.height);
            elCamada.setAttribute("width", this.properties.resolution.width);
            this.screen.appendChild(elCamada);
            // ================================== CRIA O PREVIEW DA CAMADA ====================================
            const idPreviewCamada = "camadaPreview" + num;
            const elPreviewCamada = document.createElement("canvas");
            elPreviewCamada.setAttribute("id", idPreviewCamada);
            elPreviewCamada.setAttribute("class", "preview");
            elPreviewCamada.setAttribute("style", camadaStyle);
            elPreviewCamada.setAttribute("height", Math.round(previewFunctions.ctxTelaPreview.canvas.height));
            elPreviewCamada.setAttribute("width", Math.round(previewFunctions.ctxTelaPreview.canvas.width));
            previewFunctions.contentTelaPreview.appendChild(elPreviewCamada);
            if (document.getElementById(idicone) != null && document.getElementById(idBttVisivel) != null &&
                document.getElementById(idNome) != null && document.getElementById(idPocentagem) != null &&
                document.getElementById(idIconTela) != null && document.getElementById(idCamada) != null &&
                document.getElementById(idPreviewCamada) != null) {
                const objCamada = {
                    name: nomeCamada, ctx: elCamada.getContext("2d"), icon: iconeCamada,
                    previewLayer: elPreviewCamada.getContext("2d"), miniature: iconTela.getContext("2d"),
                    bttLook: bttVisivel, txtOpacity: txtPorcentagem, opacity: 1, visible: true
                };
                this.arrayLayers[num - 1] = objCamada;
                this.arrayLayers[num - 1].icon.addEventListener("mousedown", () => this.clickIconLayer(num - 1));
                this.arrayLayers[num - 1].bttLook.addEventListener("mousedown", () => this.clickBttLook(num - 1));
                this.arrayLayers[num - 1].bttLook.addEventListener("mouseenter", () => this.cursorInBttLook = true);
                this.arrayLayers[num - 1].bttLook.addEventListener("mouseleave", () => this.cursorInBttLook = false);
            }
        },
        clickBttLook(num) {
            this.arrayLayers[num].visible = !this.arrayLayers[num].visible;
            this.cursorInBttLook = false;
            if (this.arrayLayers[num].visible) {
                this.arrayLayers[num].ctx.canvas.style.display = "block";
                this.arrayLayers[num].previewLayer.canvas.style.display = "block";
                this.arrayLayers[num].bttLook.classList.replace("iconNaoVer", "iconVer");
                this.clickIconLayer(num);
            } else {
                this.arrayLayers[num].ctx.canvas.style.display = "none";
                this.arrayLayers[num].previewLayer.canvas.style.display = "none";
                this.arrayLayers[num].bttLook.classList.replace("iconVer", "iconNaoVer");
                this.arrayLayers[num].icon.classList.replace("camadaSelecionada", "camadas");
                for (let i = 0; i < this.properties.numberLayers; i++) {
                    if (i != num && num === this.selectedLayer && this.arrayLayers[i].visible) {
                        this.clickIconLayer(i);
                        i = this.properties.numberLayers;
                    }
                }
            }
        },
        clickIconLayer(num) {
            if (this.cursorInBttLook || !this.arrayLayers[num].visible) { return; }
            for (let i = 0; i < this.properties.numberLayers; i++) {
                if (i === num) {
                    this.selectedLayer = num;
                    drawingTools.eventLayer.canvas.style.zIndex = ((num + 1) * 2) + 1;
                    this.arrayLayers[i].icon.classList.replace("camadas", "camadaSelecionada");
                } else { this.arrayLayers[i].icon.classList.replace("camadaSelecionada", "camadas"); }
            }
            const opacidade = this.arrayLayers[this.selectedLayer].opacity;
            this.layerOpacityBar.cursor.style.left = (200 * opacidade) - 7 + "px";
            drawingTools.currentLayer = this.arrayLayers[this.selectedLayer].ctx;
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
            undoRedoChange.saveChanges();
            this.arrayLayers[this.selectedLayer].ctx.drawImage(drawingTools.eventLayer.canvas, 0, 0, this.properties.resolution.width, this.properties.resolution.height);
            drawingTools.eventLayer.clearRect(0, 0, this.properties.resolution.width, this.properties.resolution.height);
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
            this.createDrawComplete();
            const blob = dataURLtoBlob(this.drawComplete.canvas.toDataURL("image/png"));
            const url = URL.createObjectURL(blob);
            const salvarImagem = document.createElement("a");
            salvarImagem.setAttribute("download", this.properties.name + ".png");
            salvarImagem.setAttribute("href", url);
            salvarImagem.click();
            function dataURLtoBlob(dataURI) {
                const BASE64_MARKER = ";base64,", base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length,
                    base64 = dataURI.substring(base64Index), raw = window.atob(base64), rawLength = raw.length;
                let array = new Uint8Array(rawLength);
                for (i = 0; i < rawLength; i++) { array[i] = raw.charCodeAt(i); }
                const blob = new Blob([array], { type: "image/png" });
                return blob;
            }
        },
        saveProject() {
            let dadosCamadas = [], coresSalvasProjeto = [];
            for (let i = 0; i < this.properties.numberLayers; i++) {
                dadosCamadas[i] = {
                    imgDataCamada: this.arrayLayers[i].ctx.canvas.toDataURL("imagem/png"),
                    opacidade: this.arrayLayers[i].opacity, visivel: this.arrayLayers[i].visible,
                };
            }
            for (let i = 0; i < this.savedColors.length; i++) { coresSalvasProjeto[i] = this.savedColors[i].color; }
            const objProjeto = {
                nomeProjeto: this.properties.name, resolucaoDoProjeto: this.properties.resolution,
                corDeFundo: this.properties.background, coresSalvas: coresSalvasProjeto,
                grid: {
                    size: createGridWindow.gridProprieties.size, position: createGridWindow.gridProprieties.position,
                    visible: createGridWindow.gridProprieties.visible
                },
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
                createGridWindow.gridProprieties.size = objProjeto.grid.size;
                createGridWindow.gridProprieties.position = objProjeto.grid.position;
                if (objProjeto.grid.visible) { createGridWindow.createGrid(true); }
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.currentTarget.result === "") {
                    notification.open({ title: "Erro!", text: "Este arquivo não possui projeto salvo." },
                        { name: "notify", time: 2000 }, null);
                } else { createSavedProject(JSON.parse(e.currentTarget.result)); }
            };
            reader.readAsText(file, "ISO-8859-1");
        }
    }
}