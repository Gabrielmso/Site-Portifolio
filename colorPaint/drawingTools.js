function drawingToolsObject() {
    return {
        arrayTools: [
            { tool: document.getElementById("pincel"), name: "brush", id: 0 },
            { tool: document.getElementById("linha"), name: "line", id: 1 },
            { tool: document.getElementById("retangulo"), name: "rectangle", id: 2 },
            { tool: document.getElementById("elipse"), name: "ellipse", id: 3 },
            { tool: document.getElementById("borracha"), name: "eraser", id: 4 },
            { tool: document.getElementById("curva"), name: "curve", id: 5 },
            { tool: document.getElementById("contaGotas"), name: "eyeDropper", id: 6 },
            { tool: document.getElementById("baldeDeTinta"), name: "paintBucket", id: 7 }
        ],
        selectedTool: 0,
        previousTool: null,
        clickToCurve: false,
        toolProperties: {
            size: 5, opacity: 1, hardness: 1, color: { R: 0, G: 0, B: 0 }
        },
        toolSizeBar: {
            bar: document.getElementById("barraTamanho"),
            cursor: document.getElementById("cursorTamanho"),
            txt: document.getElementById("txtTamanhoFerramenta"),
            clicked: false
        },
        toolOpacityBar: {
            bar: document.getElementById("barraOpacidade"),
            cursor: document.getElementById("cursorOpacidade"),
            txt: document.getElementById("txtOpacidadeFerramenta"),
            clicked: false
        },
        toolHardnessBar: {
            bar: document.getElementById("barraDureza"),
            cursor: document.getElementById("cursorDureza"),
            txt: document.getElementById("txtDurezaFerramenta"),
            clicked: false
        },
        selectDrawingTool(index) {
            this.selectedTool = this.arrayTools[index].id;
            this.arrayTools[index].tool.classList.remove("bttFerramentas");
            this.arrayTools[index].tool.classList.add("bttFerramentasEscolhida");
            for (let e = 0; e < this.arrayTools.length; e++) {
                if (e != index) {
                    this.arrayTools[e].tool.classList.remove("bttFerramentasEscolhida");
                    this.arrayTools[e].tool.classList.add("bttFerramentas");
                }
            }
            if (this.selectedTool === 6) {
                document.getElementById("propriedadesFerramentas").style.display = "none";
            }
            else {
                document.getElementById("propriedadesFerramentas").style.display = "block";
            }
            coordenadaClick.x = [];
            coordenadaClick.y = [];
            this.clickToCurve = false;
            this.changeCursorTool();
            ctxPintar.clearRect(0, 0, projeto.resolucao.largura, projeto.resolucao.altura);
        },
        changeToolSize(mouseEvent) {
            let mousePos = pegarPosicaoMouse(this.toolSizeBar.bar, mouseEvent);
            mousePos.X = Math.round(mousePos.X);
            if (mousePos.X <= 0) {
                mousePos.X = 0.5;
                this.toolSizeBar.cursor.style.left = "-7px";
                this.toolSizeBar.txt.value = "0.5px";
            }
            else if (mousePos.X >= 190) {
                mousePos.X = 190;
                this.toolSizeBar.cursor.style.left = "183px";
                this.toolSizeBar.txt.value = "190px";
            }
            else {
                this.toolSizeBar.cursor.style.left = mousePos.X - 7 + "px";
                this.toolSizeBar.txt.value = mousePos.X + "px";
            }
            this.toolProperties.size = mousePos.X;
            this.changeCursorTool();
        },
        changeToolOpacity(mouseEvent) {
            const mousePos = pegarPosicaoMouse(this.toolOpacityBar.bar, mouseEvent);
            let percentage = Math.round((mousePos.X * 100) / this.toolOpacityBar.bar.offsetWidth);
            if (mousePos.X <= 1) {
                percentage = 1;
                this.toolOpacityBar.cursor.style.left = "-7px";
                this.toolOpacityBar.txt.value = "1%";
            }
            else if (mousePos.X >= 190) {
                percentage = 100;
                this.toolOpacityBar.cursor.style.left = "183px";
                this.toolOpacityBar.txt.value = "100%";
            }
            else {
                this.toolOpacityBar.cursor.style.left = mousePos.X - 7 + "px";
                this.toolOpacityBar.txt.value = percentage + "%";
            }
            this.toolProperties.opacity = percentage / 100;
        },
        changeToolHardness(mouseEvent) {
            const mousePos = pegarPosicaoMouse(this.toolHardnessBar.bar, mouseEvent);
            let percentage = Math.round((mousePos.X * 100) / this.toolHardnessBar.bar.offsetWidth);
            if (mousePos.X < 1) {
                percentage = 0;
                this.toolHardnessBar.cursor.style.left = "-7px";
                this.toolHardnessBar.txt.value = "0%";
            }
            else if (mousePos.X >= 190) {
                percentage = 100;
                this.toolHardnessBar.cursor.style.left = "183px";
                this.toolHardnessBar.txt.value = "100%";
            }
            else {
                this.toolHardnessBar.cursor.style.left = mousePos.X - 7 + "px";
                this.toolHardnessBar.txt.value = percentage + "%";
            }
            this.toolProperties.hardness = percentage / 100;
        },
        applyToolChanges() {
            const maximoBlur = this.toolProperties.size / 6.2;
            const color = this.toolProperties.color;
            let dureza = maximoBlur - (maximoBlur * this.toolProperties.hardness);
            if (this.toolProperties.size < 100) {
                const proporcao = ((100 - this.toolProperties.size) / 180);
                dureza += (dureza * proporcao);
            }
            ctxPintar.filter = "blur(" + dureza + "px)";
            ctxPintar.lineWidth = (this.toolProperties.size - dureza);
            ctxPintar.strokeStyle = "rgba(" + color.R + ", " + color.G + ", " + color.B + ", " + this.toolProperties.opacity + ")";
        },
        changeCursorTool() {
            if (this.selectedTool === 6) {
                contentTelas.style.cursor = "url('colorPaint/imagens/cursor/cursorContaGotas.png') 0 20, pointer";
                return;
            };
            if (this.selectedTool === 7) {
                contentTelas.style.cursor = "url('colorPaint/imagens/cursor/cursorBaldeDeTinta.png') 0 0, pointer";
                return;
            };
            const tamanho = this.toolProperties.size * ((telasCanvas.offsetWidth) / projeto.resolucao.largura);
            if (tamanho < 20) { contentTelas.style.cursor = "url('colorPaint/imagens/cursor/crossHair.png') 12.5 12.5, pointer"; }
            else { contentTelas.style.cursor = "url('colorPaint/imagens/cursor/circle.png') 10 10, pointer"; }
        },
        brush(mouseX, mouseY) {
            coordenadaClick.x.push(mouseX);
            coordenadaClick.y.push(mouseY);
            ctxPintar.clearRect(0, 0, projeto.resolucao.largura, projeto.resolucao.altura);
            let ponto1 = { x: coordenadaClick.x[0], y: coordenadaClick.y[0] };
            let ponto2 = { x: coordenadaClick.x[1], y: coordenadaClick.y[1] };
            ctxPintar.beginPath();
            ctxPintar.moveTo(ponto1.x, ponto1.y);
            for (let i = 0; i < coordenadaClick.x.length; i++) {
                const midPoint = midPointBtw(ponto1, ponto2);
                ctxPintar.quadraticCurveTo(ponto1.x, ponto1.y, midPoint.x, midPoint.y);
                ponto1 = { x: coordenadaClick.x[i], y: coordenadaClick.y[i] };
                ponto2 = { x: coordenadaClick.x[i + 1], y: coordenadaClick.y[i + 1] };
            }
            ctxPintar.lineTo(ponto1.x, ponto1.y);
            ctxPintar.stroke();

            function midPointBtw(ponto1, ponto2) {
                return {
                    x: ponto1.x + (ponto2.x - ponto1.x) / 2,
                    y: ponto1.y + (ponto2.y - ponto1.y) / 2
                };
            }
        },
        line(mouseX, mouseY) {
            coordenadaClick.x[1] = mouseX;
            coordenadaClick.y[1] = mouseY;
            ctxPintar.clearRect(0, 0, projeto.resolucao.largura, projeto.resolucao.altura);
            const pontoInicial = { x: coordenadaClick.x[0], y: coordenadaClick.y[0] },
                pontoFinal = { x: coordenadaClick.x[1], y: coordenadaClick.y[1] };
            ctxPintar.beginPath();
            ctxPintar.moveTo(pontoInicial.x, pontoInicial.y);
            ctxPintar.lineTo(pontoFinal.x, pontoFinal.y);
            ctxPintar.stroke();
        },
        rectangle(mouseX, mouseY) {
            coordenadaClick.x[1] = mouseX;
            coordenadaClick.y[1] = mouseY;
            ctxPintar.clearRect(0, 0, projeto.resolucao.largura, projeto.resolucao.altura);
            const pontoInicial = { x: coordenadaClick.x[0], y: coordenadaClick.y[0] },
                pontoFinal = { x: coordenadaClick.x[1], y: coordenadaClick.y[1] };
            ctxPintar.beginPath();
            ctxPintar.strokeRect(pontoInicial.x, pontoInicial.y, pontoFinal.x - pontoInicial.x, pontoFinal.y - pontoInicial.y);
        },
        ellipse(mouseX, mouseY) {
            coordenadaClick.x[1] = mouseX;
            coordenadaClick.y[1] = mouseY;
            ctxPintar.clearRect(0, 0, projeto.resolucao.largura, projeto.resolucao.altura);
            const pontoInicial = { x: coordenadaClick.x[0], y: coordenadaClick.y[0] },
                pontoFinal = { x: coordenadaClick.x[1], y: coordenadaClick.y[1] };
            const raioX = (pontoFinal.x - pontoInicial.x) / 2, raioY = (pontoFinal.y - pontoInicial.y) / 2;
            const centroEixoX = pontoInicial.x + raioX, centroEixoY = pontoInicial.y + raioY;
            const passoAngulo = 0.005;
            let angulo = 0;
            const voltaCompleta = Math.PI * 2 + passoAngulo;
            ctxPintar.beginPath();
            ctxPintar.moveTo(centroEixoX + raioX * Math.cos(angulo), centroEixoY + raioY * Math.sin(angulo));
            for (; angulo < voltaCompleta; angulo += passoAngulo) {
                ctxPintar.lineTo(centroEixoX + raioX * Math.cos(angulo), centroEixoY + raioY * Math.sin(angulo));
            }
            ctxPintar.stroke();
        },
        curve(mouseX, mouseY, curvar) {
            if (curvar === false) {
                coordenadaClick.x[1] = mouseX;
                coordenadaClick.y[1] = mouseY;
            }
            ctxPintar.clearRect(0, 0, projeto.resolucao.largura, projeto.resolucao.altura);
            const pontoInicial = { x: coordenadaClick.x[0], y: coordenadaClick.y[0] },
                pontoFinal = { x: coordenadaClick.x[1], y: coordenadaClick.y[1] };
            ctxPintar.beginPath();
            ctxPintar.moveTo(pontoInicial.x, pontoInicial.y);
            if (curvar === true) {
                coordenadaClick.x[2] = mouseX;
                coordenadaClick.y[2] = mouseY;
                const pontoControle = { x: coordenadaClick.x[2], y: coordenadaClick.y[2] };
                ctxPintar.quadraticCurveTo(pontoControle.x, pontoControle.y, pontoFinal.x, pontoFinal.y);
            }
            else {
                ctxPintar.lineTo(pontoFinal.x, pontoFinal.y);
            }
            ctxPintar.stroke();
        },
        eyeDropper(mouseX, mouseY, posTelaX, posTelaY, mouseMovendo) {
            const X = mouseX - (cursorComparaContaGotas.offsetWidth / 2);
            const Y = mouseY - (cursorComparaContaGotas.offsetHeight / 2);
            cursorComparaContaGotas.style.left = X + "px";
            cursorComparaContaGotas.style.top = Y + "px";
            const pixel = ctxDesenho.getImageData(posTelaX, posTelaY, 1, 1).data;
            if (mouseMovendo === true) {
                if (pixel[3] === 0) {
                    const novaCor = "25px solid rgba(0, 0, 0, 0)";
                    comparaCoresContaGotas.style.borderRight = novaCor;
                    comparaCoresContaGotas.style.borderTop = novaCor;
                    return;
                }
                const novaCor = "25px solid rgb(" + pixel[0] + ", " + pixel[1] + ", " + pixel[2] + ")";
                comparaCoresContaGotas.style.borderRight = novaCor;
                comparaCoresContaGotas.style.borderTop = novaCor;
            }
            else {
                if (pixel[3] === 0) {
                    alert("Nenhuma cor selecionada");
                    return;
                }
                if (janelaSelecionarCorVisivel === true) {
                    janelaSeleciona.procurarCor({ R: pixel[0], G: pixel[1], B: pixel[2] });
                }
                else {
                    corEscolhidaPrincipal = { R: pixel[0], G: pixel[1], B: pixel[2] };
                    this.toolProperties.color = corEscolhidaPrincipal;
                    const novaCor = "rgb(" + corEscolhidaPrincipal.R + ", " + corEscolhidaPrincipal.G + ", " + corEscolhidaPrincipal.B + ")";
                    corPrincipal.style.backgroundColor = novaCor;
                    txtCorEscolhida.value = novaCor;
                }
            }
        },
        paintBucket(mouseX, mouseY, context, selectedColor) {
            coordenadaClick.x[0] = Math.round(mouseX);
            coordenadaClick.y[0] = Math.round(mouseY);
            const camada = context.getImageData(0, 0, projeto.resolucao.largura, projeto.resolucao.altura),
                canvasEvent = ctxPintar.getImageData(0, 0, projeto.resolucao.largura, projeto.resolucao.altura);
            pintar(coordenadaClick.x[0], coordenadaClick.y[0]);
            function pintar(posX, posY) {
                const pixelPos = (posY * projeto.resolucao.largura + posX) * 4,
                    r = camada.data[pixelPos],
                    g = camada.data[pixelPos + 1],
                    b = camada.data[pixelPos + 2],
                    a = camada.data[pixelPos + 3];
                if (r === selectedColor.R && g === selectedColor.G && b === selectedColor.B && a === 255) {
                    return;
                }
                preencher(posX, posY, r, g, b, a);
            }
            function preencher(posClickX, posClickY, R, G, B, A) {
                let pixelsVerificados = [[posClickX, posClickY]];
                while (pixelsVerificados.length > 0) {
                    const novaPosicao = pixelsVerificados.pop();
                    let x = novaPosicao[0], y = novaPosicao[1];
                    let posicaoPixel = (y * projeto.resolucao.largura + x) * 4;
                    while (y >= 0 && compararCorInicial(posicaoPixel, R, G, B, A)) {
                        y = y - 1;
                        posicaoPixel = posicaoPixel - projeto.resolucao.largura * 4;
                    }
                    pintarPixel(posicaoPixel, selectedColor.R, selectedColor.G, selectedColor.B, selectedColor.A);
                    posicaoPixel = posicaoPixel + projeto.resolucao.largura * 4;
                    y = y + 1;
                    let ladoEsquerdo = false, ladoDireito = false;
                    while (y <= projeto.resolucao.altura && compararCorInicial(posicaoPixel, R, G, B, A)) {
                        pintarPixel(posicaoPixel, selectedColor.R, selectedColor.G, selectedColor.B, selectedColor.A);
                        y = y + 1;
                        if (x > 0) {
                            if (compararCorInicial(posicaoPixel - 4, R, G, B, A) === true) {
                                if (ladoEsquerdo === false) {
                                    ladoEsquerdo = true;
                                    pixelsVerificados.push([x - 1, y]);
                                }
                            }
                            else {
                                pintarPixel(posicaoPixel - 4, selectedColor.R, selectedColor.G, selectedColor.B, selectedColor.A);
                                if (ladoEsquerdo === true) {
                                    ladoEsquerdo = false;
                                }
                            }
                        }
                        if (x < projeto.resolucao.largura) {
                            if (compararCorInicial(posicaoPixel + 4, R, G, B, A) === true) {
                                if (ladoDireito === false) {
                                    ladoDireito = true;
                                    pixelsVerificados.push([x + 1, y]);
                                }
                            }
                            else {
                                pintarPixel(posicaoPixel + 4, selectedColor.R, selectedColor.G, selectedColor.B, selectedColor.A);
                                if (ladoDireito === true) {
                                    ladoDireito = false;
                                }
                            }
                        }
                        posicaoPixel = posicaoPixel + projeto.resolucao.largura * 4;
                    }
                    pintarPixel(posicaoPixel, selectedColor.R, selectedColor.G, selectedColor.B, selectedColor.A);
                }
                ctxPintar.putImageData(canvasEvent, 0, 0);
            }
            function compararCorInicial(pixelPos, clickR, clickG, clickB, clickA) {
                const r = camada.data[pixelPos],
                    g = camada.data[pixelPos + 1],
                    b = camada.data[pixelPos + 2],
                    a = camada.data[pixelPos + 3];

                if (canvasEvent.data[pixelPos + 3] === 0) {
                    if (clickR === selectedColor.R && clickG === selectedColor.G && clickB === selectedColor.B && clickA === 255) {
                        return false;
                    }
                    if (r === clickR && g === clickG && b === clickB && a === clickA) {
                        return true;
                    }
                    if (r === selectedColor.R && g === selectedColor.G && b === selectedColor.B && a === selectedColor.A) {
                        return false;
                    }
                }
                else {
                    return false;
                }
            }
            function pintarPixel(pixelPos, R, G, B, A) {
                canvasEvent.data[pixelPos] = R;
                canvasEvent.data[pixelPos + 1] = G;
                canvasEvent.data[pixelPos + 2] = B;
                canvasEvent.data[pixelPos + 3] = A;

                camada.data[pixelPos] = R;
                camada.data[pixelPos + 1] = G;
                camada.data[pixelPos + 2] = B;
                camada.data[pixelPos + 3] = A;
            }
        }
    }
}