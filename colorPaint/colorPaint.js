function colorPaint() {
    const corSelecionada = document.getElementById('corSelecionada');
    const barraeEspectroCor = document.getElementById("barraeEspectroCor");
    const contentBarraeEspectroCor = document.getElementById("contentBarraeEspectroCor");
    let ctxBarra = barraeEspectroCor.getContext("2d");
    const widthBarra = barraeEspectroCor.width,
        heightBarra = barraeEspectroCor.height;
    const cursorBarra = document.getElementById("cursorBarra");

    const gradienteCor = document.getElementById("gradienteCor");
    let ctxGradiente = gradienteCor.getContext("2d");
    const widthGradiente = gradienteCor.width,
        heightGradiente = gradienteCor.height;
    const cursorGradiente = document.getElementById("cursorGradiente");

    const codRGB = document.getElementById("codRGB");

    let corPuraVarrer = { R: 255, G: 0, B: 0 };

    preencheBarraEspectro();
    preencheGradiente();

    let corParaachar;

    codRGB.addEventListener("keyup", function (e) {
        corParaachar = this.value;
        encontrarCorDoCodigoNoGradiente(corParaachar);
    });

    let clickBarra = false;


    barraeEspectroCor.addEventListener("click", moverCursorBarraMouse)

    contentBarraeEspectroCor.addEventListener("mousedown", function () {
        clickBarra = true;
        // moverCursorBarraMouse();
    })

    contentBarraeEspectroCor.addEventListener("mouseup", function () {
        clickBarra = false;
    })

    barraeEspectroCor.addEventListener("mousemove", moverCursorBarraMouse);

    function moverCursorBarraMouse(e) {
        if (clickBarra === true) {
            let mouseX
            if (e.offsetX) {
                mouseX = e.offsetX;
                mouseY = e.offsetY;
            } else if (e.layerX) {
                mouseX = e.layerX;
            }
            let data = ctxBarra.getImageData((mouseX * 3), mouseY, 1, 1).data;
            let codCor = {R: data[0], G: data[1], B: data[2]};
            encontrarCorDoCodigoNaBarra(codCor);
        };
    }

    function encontrarCorDoCodigoNoGradiente(cod) {
        let codColor = cod.split(",") || cod.split(", ");//Separa os  números da string do código RGB num array.
        for (let i = 0; i < codColor.length; i++) {
            codColor[i] = parseInt(codColor[i]);//Converte as STRINGS dos números em INT.
        }

        if (codColor[0] <= 255 && codColor[1] <= 255 && codColor[2] <= 255 && codColor.length === 3) {//Antes de procurar verifica se o código RGB está correto.
            let conteudoGradiente = ctxGradiente.getImageData(0, 0, widthGradiente, heightGradiente);
            let data = conteudoGradiente.data;
            let achouacor = false;
            for (let i = 0; i < data.length; i += 4) {//Verifica a cor de pixel a pixel do canvas (gradienteCor) para comparar com o cod.
                let R = data[i], G = data[i + 1], B = data[i + 2];

                if (R === codColor[0] && G === codColor[1] && B === codColor[2]) {//Verifica se as cores são iguais.
                    let x = i / 4 % widthGradiente, y = (i / 4 - x) / widthGradiente;//Calcula a coordenada do pixel daquela cor.
                    let codPixel = R + ", " + G + ", " + B;//
                    moverCursorGradiente((x / 2) - 9, (y / 2) - 10, codPixel);
                    encontrarCorDoCodigoNaBarra(corPuraVarrer);
                    i = data.length;
                    achouacor = true;
                }
                
            }
            if (achouacor === false) {
                varrerCoresPuras(corPuraVarrer);
                preencheGradiente();
                encontrarCorDoCodigoNoGradiente(corParaachar);
            }
            conteudoGradiente = null;
            data = null;
        }
    }

    function varrerCoresPuras(cor) {
        if (cor.R === 255 && cor.G >= 0 && cor.G < 255 && cor.B === 0) {
            corPuraVarrer.G += 1;
        }
        else if (cor.R > 0 && cor.R <= 255 && cor.G === 255 && cor.B === 0) {
            corPuraVarrer.R -= 1;
        }
        else if (cor.R === 0 && cor.G === 255 && cor.B >= 0 && cor.B < 255) {
            corPuraVarrer.B += 1;
        }
        else if (cor.R === 0 && cor.G <= 255 && cor.G > 0 && cor.B === 255) {
            corPuraVarrer.G -= 1;
        }
        else if (cor.R >= 0 && cor.R < 255 && cor.G === 0 && cor.B === 255) {
            corPuraVarrer.R += 1;
        }
        else if (cor.R === 255 && cor.G === 0 && cor.B <= 255 && cor.B > 0) {
            corPuraVarrer.B -= 1;
        }
    }

    function encontrarCorDoCodigoNaBarra(cod) {
        // let codColor = cod.split(",") || cod.split(", ");//Separa os  números da string do código RGB num array.
        // for (let i = 0; i < codColor.length; i++) {
        //     codColor[i] = parseInt(codColor[i]);//Converte as STRINGS dos números em INT.
        // }
        if (cod.R <= 255 && cod.G <= 255 && cod.B <= 255) {//Antes de procurar verifica se o código RGB está correto.
            let conteudoBarra = ctxBarra.getImageData(0, 0, widthBarra, 1);
            let data = conteudoBarra.data;
            for (let i = 0; i < data.length; i += 4) {//Verifica a cor de pixel a pixel do canvas (gradienteCor) para comparar com o cod.
                let R = data[i], G = data[i + 1], B = data[i + 2];
                if (R === cod.R && G === cod.G && B === cod.B) {//Verifica se as cores são iguais.
                    let x = i / 4 % widthBarra;//Calcula a coordenada do pixel daquela cor.
                    let codPixel = {R: R, G: G, B: B};//
                    moverCursorBarra(x / 3, codPixel);
                    i = data.length;
                }
            }
        }
    }

    function moverCursorGradiente(x, y, cod) {
        let corSelecionadaGradiente = "rgb(" + cod + ")"
        cursorGradiente.style.left = x + "px";
        cursorGradiente.style.top = y + "px";
        cursorGradiente.style.backgroundColor = corSelecionadaGradiente;
        corSelecionada.style.backgroundColor = corSelecionadaGradiente;
    }

    function moverCursorBarra(x, cor) {
        corPuraVarrer = cor;
        cursorBarra.style.left = x + "px";
        cursorBarra.style.backgroundColor = "rgb(" + corPuraVarrer.R + ", "+ corPuraVarrer.G + ", " + corPuraVarrer.B + ")";
        preencheGradiente();
    }

    function preencheBarraEspectro() {
        ctxBarra.rect(0, 0, widthBarra, heightBarra);
        let gradiente = ctxBarra.createLinearGradient(0, 0, widthBarra, 0);

        gradiente.addColorStop(0, "rgb(255, 0, 0)");
        gradiente.addColorStop(0.16666666666666666667, "rgb(255, 255, 0)");
        gradiente.addColorStop(0.33333333333333333334, "rgb(0, 255, 0)");
        gradiente.addColorStop(0.50000000000000000001, "rgb(0, 255, 255)");
        gradiente.addColorStop(0.66666666666666666668, "rgb(0, 0, 255)");
        gradiente.addColorStop(0.83333333333333333335, "rgb(255, 0, 255)");
        gradiente.addColorStop(1, "rgb(255, 0, 0)");
        ctxBarra.fillStyle = gradiente;
        ctxBarra.fill();
    }

    function preencheGradiente() {
        ctxGradiente.clearRect(0, 0, widthGradiente, heightGradiente);
        ctxGradiente.fillStyle = "rgb(" + corPuraVarrer.R + ", "+ corPuraVarrer.G + ", " + corPuraVarrer.B + ")";
        ctxGradiente.fillRect(0, 0, widthGradiente, heightGradiente);

        let gradienteBranco = ctxBarra.createLinearGradient(0, 0, widthGradiente, 0);
        gradienteBranco.addColorStop(0, "rgba(255, 255, 255, 1)");
        gradienteBranco.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctxGradiente.fillStyle = gradienteBranco;
        ctxGradiente.fillRect(0, 0, widthGradiente, heightGradiente);

        let gradientePreto = ctxBarra.createLinearGradient(0, 0, 0, heightGradiente);
        gradientePreto.addColorStop(0, "rgba(0, 0, 0, 0)");
        gradientePreto.addColorStop(1, "rgba(0, 0, 0, 1)");
        ctxGradiente.fillStyle = gradientePreto;
        ctxGradiente.fillRect(0, 0, widthGradiente, heightGradiente);
        ctxGradiente.closePath();

        let conteudoGradiente = ctxGradiente.getImageData((cursorGradiente.offsetLeft + 9) * 2, (cursorGradiente.offsetTop + 10) * 2, 1, 1);
        let data = conteudoGradiente.data;
        let cor = data[0] + ", " + data[1] + ", " + data[2];
        cursorGradiente.style.backgroundColor = "rgb(" + cor + ")";
        corSelecionada.style.backgroundColor = "rgb(" + cor + ")";
    }

    // while(corPuraVarrer.R != 255 || corPuraVarrer.G != 0 || corPuraVarrer.B != 0 ){
    //     varrerCoresPuras(corPuraVarrer);
    //     console.log(corPuraVarrer.R + ", " + corPuraVarrer.G + ", " + corPuraVarrer.B);
    // }
    
}

