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

    let corParaAchar = {};
    let hsvBarra = { H: 0, S: 100, V: 100 };

    preencheBarraEspectro();
    preencheGradiente();


    codRGB.addEventListener("keyup", function (e) {
        let codCorAchar = this.value;
        codCorAchar = codCorAchar.split(",") || codCorAchar.split(", ");
        for (let i = 0; i < codCorAchar.length; i++) {
            codCorAchar[i] = parseInt(codCorAchar[i]);//Converte as STRINGS em INT.
        }
        if (codCorAchar.length === 3) {
            if (codCorAchar[0] <= 255 && codCorAchar[1] <= 255 && codCorAchar[2] <= 255) {
                corParaAchar = { R: codCorAchar[0], G: codCorAchar[1], B: codCorAchar[2] }
                hsvBarra = rgbToHsv(corParaAchar);
                corPuraVarrer = hsvToRgb(hsvBarra.H, 100, 100);
                encontrarCorDoCodigoNoGradiente(hsvBarra.S, hsvBarra.V);
            }
        }
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
            let codCor = { R: data[0], G: data[1], B: data[2] };
            hsvBarra = rgbToHsv(codCor);
            encontrarCorDoCodigoNaBarra(codCor);
        };
    }

    function encontrarCorDoCodigoNoGradiente(s, v) {
        preencheGradiente();
        let posx = (gradienteCor.offsetWidth / 100) * s;
        let posy = gradienteCor.offsetHeight - ((gradienteCor.offsetHeight / 100) * v);
        moverCursorGradiente(posx - 10, posy - 10, corParaAchar);
        encontrarCorDoCodigoNaBarra(corPuraVarrer);
    }

    function encontrarCorDoCodigoNaBarra(cod) {
        let conteudoBarra = ctxBarra.getImageData(0, 0, widthBarra, 1);
        let data = conteudoBarra.data;
        for (let i = 0; i < data.length; i += 4) {//Verifica a cor de pixel a pixel do canvas (gradienteCor) para comparar com o cod.
            let R = data[i], G = data[i + 1], B = data[i + 2];
            if (R === cod.R && G === cod.G && B === cod.B) {//Verifica se as cores são iguais.
                let x = i / 4 % widthBarra;//Calcula a coordenada do pixel daquela cor.
                let codPixel = { R: R, G: G, B: B };//
                moverCursorBarra(x / 3, codPixel);
                i = data.length;
            }
        }
    }

    function moverCursorGradiente(x, y, cod) {
        let corSelecionadaGradiente = "rgb(" + cod.R + ", " + cod.G + ", " + cod.B + ")"
        cursorGradiente.style.left = x + "px";
        cursorGradiente.style.top = y + "px";
        cursorGradiente.style.backgroundColor = corSelecionadaGradiente;
        corSelecionada.style.backgroundColor = corSelecionadaGradiente;
    }

    function moverCursorBarra(x, cor) {
        corPuraVarrer = cor;
        cursorBarra.style.left = x + "px";
        cursorBarra.style.backgroundColor = "rgb(" + corPuraVarrer.R + ", " + corPuraVarrer.G + ", " + corPuraVarrer.B + ")";
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
        ctxGradiente.fillStyle = "rgb(" + corPuraVarrer.R + ", " + corPuraVarrer.G + ", " + corPuraVarrer.B + ")";
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

        let S = (gradienteCor.offsetWidth - (gradienteCor.offsetWidth - (cursorGradiente.offsetLeft + 10))) * (100 / gradienteCor.offsetWidth);
        let V = 100 - (gradienteCor.offsetHeight - (gradienteCor.offsetHeight - (cursorGradiente.offsetTop + 10))) * (100 / gradienteCor.offsetHeight);
        if(S == 0){
            S = 0.1;
        }
        if(V == 0){
            V = 0.1;
        }
        let cor = hsvToRgb(hsvBarra.H, S, V);
        cursorGradiente.style.backgroundColor = "rgb(" + cor.R + ", " + cor.G + ", " + cor.B + ")";
        corSelecionada.style.backgroundColor = "rgb(" + cor.R + ", " + cor.G + ", " + cor.B + ")";
        codRGB.value = cor.R + ", " + cor.G + ", " + cor.B;
    }

    function rgbToHsv(cor) {
        let rabs, gabs, babs, rr, gg, bb, h, v, diff, diffc, percentRoundFn;
        rabs = cor.R / 255;
        gabs = cor.G / 255;
        babs = cor.B / 255;
        v = Math.max(rabs, gabs, babs),
            diff = v - Math.min(rabs, gabs, babs);
        diffc = c => (v - c) / 6 / diff + 1 / 2;
        percentRoundFn = num => (num * 100) / 100;
        if (diff == 0) {
            h = s = 0;
        } else {
            s = diff / v;
            rr = diffc(rabs);
            gg = diffc(gabs);
            bb = diffc(babs);

            if (rabs === v) {
                h = bb - gg;
            } else if (gabs === v) {
                h = (1 / 3) + rr - bb;
            } else if (babs === v) {
                h = (2 / 3) + gg - rr;
            }
            if (h < 0) {
                h += 1;
            } else if (h > 1) {
                h -= 1;
            }
        }
        return {
            H: (h * 360),
            S: percentRoundFn(s * 100),
            V: percentRoundFn(v * 100)
        };
    }

    function hsvToRgb(h, s, v) {
        var r, g, b;
        var i;
        var f, p, q, t;

        h = Math.max(0, Math.min(360, h));
        s = Math.max(0, Math.min(100, s));
        v = Math.max(0, Math.min(100, v));

        s /= 100;
        v /= 100;

        if (s == 0) {
            // Achromatic (grey)
            r = g = b = v;
            return [
                Math.round(r * 255),
                Math.round(g * 255),
                Math.round(b * 255)
            ];
        }

        h /= 60; // sector 0 to 5
        i = Math.floor(h);
        f = h - i; // factorial part of h
        p = v * (1 - s);
        q = v * (1 - s * f);
        t = v * (1 - s * (1 - f));

        switch (i) {
            case 0:
                r = v;
                g = t;
                b = p;
                break;
            case 1:
                r = q;
                g = v;
                b = p;
                break;
            case 2:
                r = p;
                g = v;
                b = t;
                break;
            case 3:
                r = p;
                g = q;
                b = v;
                break;
            case 4:
                r = t;
                g = p;
                b = v;
                break;
            case 5:
                r = v;
                g = p;
                b = q;
        }
        return {
            R: Math.round(r * 255),
            G: Math.round(g * 255),
            B: Math.round(b * 255)
        };
    }
}

