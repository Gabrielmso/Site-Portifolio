function colorPaint() {
    const corSelecionada = document.getElementById('corSelecionada');
    const barraeEspectroCor = document.getElementById("barraeEspectroCor");
    let ctxBarra = barraeEspectroCor.getContext("2d");
    const widthBarra = barraeEspectroCor.width,
        heightBarra = barraeEspectroCor.height;

    const gradienteCor = document.getElementById("gradienteCor");
    let ctxGradiente = gradienteCor.getContext("2d");
    const widthGradiente = gradienteCor.width,
        heightGradiente = gradienteCor.height;
    let corSelecionadaBarra = "rgb(255, 0, 0)";
    preencheBarraEspectro();
    preencheGradiente();

    function encontrarCordoCodigo() {
        let conteudoGradiente = ctxGradiente.getImageData(0, 0, widthGradiente, heightGradiente);
        let data = conteudoGradiente.data;
        let cod = "50, 9, 9";

        for (let i = 0; i < data.length; i += 4) {
            let codpixel = data[i] + ", " + data[i + 1] + ", " + data[i + 2];
            if (cod === codpixel) {
                corSelecionada.style.backgroundColor = "rgb(" + codpixel + ")";
                var x = i / 4 % widthGradiente, y = (i / 4 - x) / widthGradiente;
                document.getElementById('codHex').value = x + "," + y;
                i = data.length;
            } else if (i === data.length) {

            }

        }
    }

    encontrarCordoCodigo();

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
        ctxGradiente.fillStyle = corSelecionadaBarra;
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
    }
}

