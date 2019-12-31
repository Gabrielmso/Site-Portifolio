function drawingTools() {
    return {
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
            mudarAparenciaCursor();
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
        brush(mouseX, mouseY) {
            coordenadaClick.push({ x: mouseX, y: mouseY });
            ctxPintar.clearRect(0, 0, projeto.resolucao.largura, projeto.resolucao.altura);
            let ponto1 = coordenadaClick[0], ponto2 = coordenadaClick[1];
            ctxPintar.beginPath();
            ctxPintar.moveTo(ponto1.x, ponto1.y);
            for (let i = 0; i < coordenadaClick.length; i++) {
                const midPoint = midPointBtw(ponto1, ponto2);
                ctxPintar.quadraticCurveTo(ponto1.x, ponto1.y, midPoint.x, midPoint.y);
                ponto1 = coordenadaClick[i];
                ponto2 = coordenadaClick[i + 1];
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
            coordenadaClick[1] = { x: mouseX, y: mouseY };
            ctxPintar.clearRect(0, 0, projeto.resolucao.largura, projeto.resolucao.altura);
            const pontoInicial = coordenadaClick[0], pontoFinal = coordenadaClick[1];
            ctxPintar.beginPath();
            ctxPintar.moveTo(pontoInicial.x, pontoInicial.y);
            ctxPintar.lineTo(pontoFinal.x, pontoFinal.y);
            ctxPintar.stroke();
        },
        rectangle(mouseX, mouseY) {
            ctxPintar.clearRect(0, 0, projeto.resolucao.largura, projeto.resolucao.altura);
            const pontoInicial = coordenadaClick[0], pontoFinal = { x: mouseX, y: mouseY };
            ctxPintar.beginPath();
            ctxPintar.strokeRect(pontoInicial.x, pontoInicial.y, pontoFinal.x - pontoInicial.x, pontoFinal.y - pontoInicial.y);
        },
        ellipse(mouseX, mouseY) {
            ctxPintar.clearRect(0, 0, projeto.resolucao.largura, projeto.resolucao.altura);
            const pontoInicial = coordenadaClick[0], pontoFinal = { x: mouseX, y: mouseY };
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
                coordenadaClick[1] = { x: mouseX, y: mouseY };
            }
            ctxPintar.clearRect(0, 0, projeto.resolucao.largura, projeto.resolucao.altura);
            const pontoInicial = coordenadaClick[0], pontoFinal = coordenadaClick[1];
            ctxPintar.beginPath();
            ctxPintar.moveTo(pontoInicial.x, pontoInicial.y);
            if (curvar === true) {
                const pontoControle = coordenadaClick[2] = { x: mouseX, y: mouseY };
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
        paintBucket(mouseX, mouseY, context, cor) {
            const corSelecionada = cor,
                camada = context.getImageData(0, 0, projeto.resolucao.largura, projeto.resolucao.altura),
                canvasEvent = ctxPintar.getImageData(0, 0, projeto.resolucao.largura, projeto.resolucao.altura);

            pintar(Math.round(mouseX), Math.round(mouseY));
            function pintar(posX, posY) {
                const pixelPos = (posY * projeto.resolucao.largura + posX) * 4,
                    r = camada.data[pixelPos],
                    g = camada.data[pixelPos + 1],
                    b = camada.data[pixelPos + 2],
                    a = camada.data[pixelPos + 3];
                if (r === corSelecionada.r && g === corSelecionada.g && b === corSelecionada.b && a === 255) {
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
                    pintarPixel(posicaoPixel, corSelecionada.r, corSelecionada.g, corSelecionada.b, corSelecionada.a);
                    posicaoPixel = posicaoPixel + projeto.resolucao.largura * 4;
                    y = y + 1;
                    let ladoEsquerdo = false, ladoDireito = false;
                    while (y <= projeto.resolucao.altura && compararCorInicial(posicaoPixel, R, G, B, A)) {
                        pintarPixel(posicaoPixel, corSelecionada.r, corSelecionada.g, corSelecionada.b, corSelecionada.a);
                        y = y + 1;
                        if (x > 0) {
                            if (compararCorInicial(posicaoPixel - 4, R, G, B, A) === true) {
                                if (ladoEsquerdo === false) {
                                    ladoEsquerdo = true;
                                    pixelsVerificados.push([x - 1, y]);
                                }
                            }
                            else {
                                pintarPixel(posicaoPixel - 4, corSelecionada.r, corSelecionada.g, corSelecionada.b, corSelecionada.a);
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
                                pintarPixel(posicaoPixel + 4, corSelecionada.r, corSelecionada.g, corSelecionada.b, corSelecionada.a);
                                if (ladoDireito === true) {
                                    ladoDireito = false;
                                }
                            }
                        }
                        posicaoPixel = posicaoPixel + projeto.resolucao.largura * 4;
                    }
                    pintarPixel(posicaoPixel, corSelecionada.r, corSelecionada.g, corSelecionada.b, corSelecionada.a);
                }
                ctxPintar.putImageData(canvasEvent, 0, 0);
            }

            function compararCorInicial(pixelPos, clickR, clickG, clickB, clickA) {
                const r = camada.data[pixelPos],
                    g = camada.data[pixelPos + 1],
                    b = camada.data[pixelPos + 2],
                    a = camada.data[pixelPos + 3];

                if (canvasEvent.data[pixelPos + 3] === 0) {
                    if (clickR === corSelecionada.r && clickG === corSelecionada.g && clickB === corSelecionada.b && clickA === 255) {
                        return false;
                    }
                    if (r === clickR && g === clickG && b === clickB && a === clickA) {
                        return true;
                    }
                    if (r === corSelecionada.r && g === corSelecionada.g && b === corSelecionada.b && a === corSelecionada.a) {
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
        },
    }
}
