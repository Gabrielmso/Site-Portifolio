function projectObject() {
    return {
        properties: {
            name: null,
            resolution: { width: null, height: null, proportion: null },
            background: null,
            numberLayers: 0
        },
        layerOpacityBar: {
            content: document.getElementById("contentBarraOpacidadeCamada"),
            bar: document.getElementById("barraOpacidadeCamada"),
            cursor: document.getElementById("cursorOpacidadeCamada"),
            mousedown: false,
        },
        drawComplete: document.getElementById("desenho").getContext("2d"),
        eventLayer: document.getElementById("pintar").getContext("2d"),
        arrayLayers: [],
        cursorInBttLook: false,
        addEventsToElements() {
            this.layerOpacityBar.content.addEventListener("mousemove", (e) => this.changeOpacityLayer(e));
            this.layerOpacityBar.bar.addEventListener("mousedown", (e) => {
                this.layerOpacityBar.mousedown = true;
                this.changeOpacityLayer(e);
            });
            this.layerOpacityBar.content.addEventListener("mouseup", () => this.applyOpacityLayer());
            this.layerOpacityBar.content.addEventListener("mouseleave", () => this.applyOpacityLayer());

            document.getElementById("bttSalvarDesenho").addEventListener("mousedown", () => {
                if (projetoCriado) { this.saveImage(); }
                else { alert("Nenhum projeto criado!"); }
            });
            document.getElementById("bttSalvarProjeto").addEventListener("mousedown", () => {
                if (projetoCriado) { this.saveProject(); }
                else { alert("Nenhum projeto criado!"); }
            });
            document.getElementById("bttAbrirProjeto").addEventListener("mousedown", () => {
                if (projetoCriado) {
                    if (confirm("Todo o progresso não salvo será perdido, deseja continuar?")) {
                        sessionStorage.setItem("abrirProjetoSalvo", "true");
                        window.location.reload();
                    }
                } else { this.openProject(); }
            });
        },
        applyOpacityLayer() {
            if (!this.layerOpacityBar.mousedown) { return; }
            this.layerOpacityBar.mousedown = false;
            desenhoNoPreviewEIcone(this.arrayLayers[camadaSelecionada]);
        },
        changeOpacityLayer(e) {
            if (!this.layerOpacityBar.mousedown) { return; }
            const mouse = pegarPosicaoMouse(this.layerOpacityBar.bar, e);
            let porcentagem = Math.round((mouse.x * 100) / this.layerOpacityBar.bar.offsetWidth);
            if (mouse.x <= 1) {
                porcentagem = 1;
                cursorOpacidadeCamada.style.left = "-7px";
                this.arrayLayers[camadaSelecionada].txtOpacity.value = "1%";
            } else if (mouse.x >= 200) {
                porcentagem = 100;
                cursorOpacidadeCamada.style.left = "193px";
                this.arrayLayers[camadaSelecionada].txtOpacity.value = "100%";
            } else {
                cursorOpacidadeCamada.style.left = mouse.x - 7 + "px";
                this.arrayLayers[camadaSelecionada].txtOpacity.value = porcentagem + "%";
            }
            let opacidade = porcentagem / 100;
            this.arrayLayers[camadaSelecionada].opacity = opacidade;
            this.arrayLayers[camadaSelecionada].ctx.canvas.style.opacity = opacidade;
        },
        validateProperties() {
            const arrayProperties = [document.getElementById("txtNomeProjeto"),
            document.getElementById("txtLarguraProjeto"),
            document.getElementById("txtAlturaProjeto"),
            document.getElementById("corDeFundoProjeto"),
            document.getElementById("numeroCamadasProjeto")];
            for (let i = 0; i < arrayProperties.length; i++) {
                const el = arrayProperties[i];
                if (el.value === "") {
                    campoInvalido(el);
                    return;
                } else { el.style.backgroundColor = "rgba(0, 0, 0, 0)"; }
            }
            const nomeProjeto = (arrayProperties[0].value).replace(/ /g, "-"),
                larguraProjeto = parseInt(arrayProperties[1].value),
                alturaProjeto = parseInt(arrayProperties[2].value),
                valueCor = parseInt(arrayProperties[3].value),
                numeroCamadas = parseInt(arrayProperties[4].value);

            if (larguraProjeto > 2560 || larguraProjeto < 1) {
                campoInvalido(arrayProperties[1]);
                return;
            } else if (alturaProjeto > 1440 || alturaProjeto < 1) {
                campoInvalido(arrayProperties[2]);
                return;
            } else if (valueCor > 4 || valueCor < 1) {
                campoInvalido(arrayProperties[3]);
                return;
            } else if (numeroCamadas > 5 || numeroCamadas < 1) {
                campoInvalido(arrayProperties[4]);
                return;
            }
            let color;
            if (valueCor === 1) { color = { r: 255, g: 255, b: 255 }; }
            else if (valueCor === 2) { color = { r: 0, g: 0, b: 0 }; }
            else if (valueCor === 3) { color = false; }
            else { color = corEscolhidaPrincipal; }
            for (let i = 0; i < arrayProperties.length; i++) { arrayProperties[i].style.backgroundColor = "rgb(37, 37, 37)"; }
            this.create(nomeProjeto, { width: larguraProjeto, height: alturaProjeto }, color, numeroCamadas);
            function campoInvalido(campo) {
                campo.focus();
                campo.style.backgroundColor = "rgba(255, 0, 0, 0.25)";
            }
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
                corFundo.style.backgroundColor = color;
                fundoPreview.style.backgroundColor = color;
            } else {
                corFundo.style.backgroundImage = "url('colorPaint/imagens/fundoTela/transparente.png')";
                fundoPreview.style.backgroundImage = "url('colorPaint/imagens/fundoTela/transparenteMiniatura.png')";
            }
            ajustarTelasCanvas();
            previewFunctions.adjustPreview(this.properties.resolution.proportion);
            this.drawComplete.canvas.width = this.properties.resolution.width;
            this.drawComplete.canvas.height = this.properties.resolution.height;
            this.eventLayer.canvas.width = this.properties.resolution.width;
            this.eventLayer.canvas.height = this.properties.resolution.height;
            txtResolucao.value = this.properties.resolution.width + ", " + this.properties.resolution.height;
            while (this.properties.numberLayers > this.arrayLayers.length) { this.createElements(color); }
            document.getElementById("nomeDoProjeto").innerText = this.properties.name;
            this.layerOpacityBar.content.style.display = "flex";
            projetoCriado = true;
            setTimeout(() => this.clickIconLayer(0), 5);
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
            telasCanvas.appendChild(elCamada);

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
                    name: nomeCamada,
                    ctx: elCamada.getContext("2d"),
                    icon: iconeCamada,
                    previewLayer: elPreviewCamada.getContext("2d"),
                    miniature: iconTela.getContext("2d"),
                    bttLook: bttVisivel,
                    txtOpacity: txtPorcentagem,
                    opacity: 1,
                    visible: true
                };
                this.arrayLayers[num - 1] = objCamada;
                this.arrayLayers[num - 1].icon.addEventListener("mousedown", () => this.clickIconLayer(num - 1));
                this.arrayLayers[num - 1].bttLook.addEventListener("mousedown", () => this.clickBttLook(num - 1));
                this.arrayLayers[num - 1].bttLook.addEventListener("mouseenter", () => this.cursorInBttLook = true);
                this.arrayLayers[num - 1].bttLook.addEventListener("mouseleave", () => this.cursorInBttLook = false);
            }
        },
        clickBttLook(num) {
            if (this.arrayLayers[num].visible) {
                this.arrayLayers[num].ctx.canvas.style.display = "none";
                this.arrayLayers[num].previewLayer.canvas.style.display = "none";
                this.arrayLayers[num].bttLook.classList.replace("iconVer", "iconNaoVer");
            } else {
                this.arrayLayers[num].ctx.canvas.style.display = "block";
                this.arrayLayers[num].previewLayer.canvas.style.display = "block";
                this.arrayLayers[num].bttLook.classList.replace("iconNaoVer", "iconVer");
            }
            this.arrayLayers[num].visible = !this.arrayLayers[num].visible;
            desenhoNoPreviewEIcone(this.arrayLayers[num]);
        },
        clickIconLayer(num) {
            if (!this.cursorInBttLook) {
                for (let i = 0; i < this.properties.numberLayers; i++) {
                    if (i === num) {
                        camadaSelecionada = num;
                        this.eventLayer.canvas.style.zIndex = ((num + 1) * 2) + 1;
                        this.arrayLayers[i].icon.classList.replace("camadas", "camadaSelecionada");
                    }
                    else { this.arrayLayers[i].icon.classList.replace("camadaSelecionada", "camadas"); }
                }
                const opacidade = this.arrayLayers[camadaSelecionada].opacity;
                cursorOpacidadeCamada.style.left = (200 * opacidade) - 7 + "px";
            }
        },
        saveImage() {
            desenhoCompleto();
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
                    opacidade: this.arrayLayers[i].opacity,
                    visivel: this.arrayLayers[i].visible,
                };
            }
            for (let i = 0; i < arrayCoresSalvas.length; i++) { coresSalvasProjeto[i] = arrayCoresSalvas[i].cor; }
            const objProjeto = {
                nomeProjeto: this.properties.name,
                resolucaoDoProjeto: this.properties.resolution,
                corDeFundo: this.properties.background,
                coresSalvas: coresSalvasProjeto,
                grid: { tamanho: grid.tamanho, posicao: grid.posicao, visivel: grid.visivel, },
                numeroDeCamadas: this.properties.numberLayers,
                camadas: dadosCamadas
            }
            const data = encode(JSON.stringify(objProjeto));
            const blob = new Blob([data], { type: "application/octet-stream;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", this.properties.name + ".gm");
            link.click();
            function encode(s) {
                let out = [];
                for (let i = 0; i < s.length; i++) { out[i] = s.charCodeAt(i); }
                return new Uint8Array(out);
            }
        },
        openProject() {
            const input = document.createElement("input");
            input.setAttribute("type", "file");
            input.addEventListener("change", (e) => {
                const arquivo = e.target.files[0];
                const reader = new FileReader();
                reader.onload = () => {
                    if (reader.result === "") { alert("Este arquivo não possui projeto salvo!"); }
                    else { this.loadProject(reader.result); }
                };
                if (!arquivo) { alert("Erro ao carregar projeto, tente novamente!"); }
                else {
                    const extencao = arquivo.name.split('.').pop().toLowerCase();
                    if (extencao === "gm") { reader.readAsText(arquivo, "ISO-8859-1"); }
                    else { alert("Arquivo selecionado inválido!"); }
                }
            }, false);
            input.click();
        },
        loadProject(projetoJSON) {
            const objProjeto = JSON.parse(projetoJSON);
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
            for (let i = 0; i < objProjeto.coresSalvas.length; i++) { janelaSeleciona.salvarCor(objProjeto.coresSalvas[i]); }
            grid.tamanho = objProjeto.grid.tamanho;
            grid.posicao = objProjeto.grid.posicao;
            if (objProjeto.grid.visivel === true) { criarGrid(grid.tela, grid.tamanho, grid.posicao, true); }
        }
    }
}
