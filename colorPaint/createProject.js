function projectObject() {
    return {
        properties: {
            name: null,
            resolution: { width: null, height: null, proportion: null },
            background: null,
            numberLayers: 0
        },
        drawComplete: document.getElementById("desenho").getContext("2d"),
        eventLayer: document.getElementById("pintar").getContext("2d"),
        arrayLayers: [],
        cursorInBttLook: false,
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
                }
                else { el.style.backgroundColor = "rgba(0, 0, 0, 0)"; }
            }
            const nomeProjeto = (arrayProperties[0].value).replace(/ /g, "-"),
                larguraProjeto = parseInt(arrayProperties[1].value),
                alturaProjeto = parseInt(arrayProperties[2].value),
                valueCor = parseInt(arrayProperties[3].value),
                numeroCamadas = parseInt(arrayProperties[4].value);

            if (larguraProjeto > 2560 || larguraProjeto < 1) {
                campoInvalido(arrayProperties[1]);
                return;
            }
            else if (alturaProjeto > 1440 || alturaProjeto < 1) {
                campoInvalido(arrayProperties[2]);
                return;
            }
            else if (valueCor > 4 || valueCor < 1) {
                campoInvalido(arrayProperties[3]);
                return;
            }
            else if (numeroCamadas > 5 || numeroCamadas < 1) {
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
            this.ajustarPreview();
            this.drawComplete.canvas.width = this.properties.resolution.width;
            this.drawComplete.canvas.height = this.properties.resolution.height;
            this.eventLayer.canvas.width = this.properties.resolution.width;
            this.eventLayer.canvas.height = this.properties.resolution.height;
            txtResolucao.value = this.properties.resolution.width + ", " + this.properties.resolution.height;
            while (this.properties.numberLayers > this.arrayLayers.length) { this.createElements(color); }
            document.getElementById("nomeDoProjeto").innerText = this.properties.name;
            document.getElementById("propriedadeOpacidadeCamada").style.display = "flex";
            this.clickIconLayer(0);
            projetoCriado = true;
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
            }
            else {
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
            }
            else {
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
        ajustarPreview() {
            const proporcaoEspaco = 256 / 150, contentTelaPreview = previewFunctions.contentTelaPreview;
            if (this.properties.resolution.proportion >= proporcaoEspaco) {
                const novaAltura = (256 / this.properties.resolution.proportion);
                contentTelaPreview.style.width = "256px";
                contentTelaPreview.style.height = novaAltura + "px";
            }
            else {
                const novaLargura = (150 * this.properties.resolution.proportion);
                contentTelaPreview.style.width = novaLargura + "px";
                contentTelaPreview.style.height = "150px";
            }
            previewFunctions.ctxTelaPreview.canvas.width = Math.round(contentTelaPreview.offsetWidth * 1.5);
            previewFunctions.ctxTelaPreview.canvas.height = Math.round(contentTelaPreview.offsetHeight * 1.5);
        }
    }
}