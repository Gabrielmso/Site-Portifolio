let abrirFundosComparacao;
let arrayfundos = [];
let abrirFundoComparacao = [];
let arrayFundosComparacao = [];
let fecharFundosComparacao = [];
let imgsComparacao = [];
let numslide = 0; //Armazena o numero do slide mostrado. 
let fundoCompararVisible = false;
let imgvisivel = false; //Usar para alternar a opacidade das imagens que serão comparadas entre 0 e 1;
function traduSilent() {
    let largurajanela = window.innerWidth;
    let alturajanela = window.innerHeight;
    let proporcao = largurajanela / alturajanela;
    const proporcao16por9 = 16 / 9;
    const proporcao4por3 = 4 / 3;
    arrayfundos = [document.getElementById("fundo1"), //Armazenar todos os "slides" em ordem.
    document.getElementById("fundo1blur"),
    document.getElementById("fundo2blur"),
    document.getElementById("fundo3blur"),
    document.getElementById("fundo4blur"),
    document.getElementById("fundo5blur"),
    document.getElementById("fundo6blur"),
    document.getElementById("fundo7blur")];
    abrirFundoComparacao = [document.getElementById("compararthereareviolent"),
    document.getElementById("omedodesangue"),
    document.getElementById("compararMapaAntigaSilent"),
    document.getElementById("compararFolhasCaderno"),
    document.getElementById("compararChavesEclipse"),
    document.getElementById("compararEscola")];
    arrayFundosComparacao = [document.getElementById("fundocomparacao"),
    document.getElementById("fundocomparacg"),
    document.getElementById("fundoantigasilenthill"),
    document.getElementById("fundocomparafolhas"),
    document.getElementById("fundochavesparaoeclipse"),
    document.getElementById("fundomapaescola")];
    fecharFundosComparacao = [document.getElementById("fecharfundo1"),
    document.getElementById("fecharcomparacg"),
    document.getElementById("fecharantigasilenthill"),
    document.getElementById("fecharfolhas"),
    document.getElementById("fecharchavesparaoeclipse"),
    document.getElementById("fecharfundoescola")];
    imgsComparacao = [document.getElementById("imgviolentastrad"),
    document.getElementById("imgantigasilenthill"),
    document.getElementById("imgparaescola"),
    document.getElementById("imgcasadecachorro"),
    document.getElementById("imgchavesparaoeclipse"),
    document.getElementById("imgescolap"),
    document.getElementById("imgescola1a"),
    document.getElementById("imgescola2a"),
    document.getElementById("imgescolat")];
    const contents = document.getElementsByClassName("content"),//Armazena todas as divs que possuem conteúdo.
        imgviolentasorig = document.getElementById("imgviolentasorig"),
        imgverjap = document.getElementById("imgverjap"),
        imgverlimp = document.getElementById("imgverlimp"),
        imgjap = document.getElementById("imgjap"),
        imglimp = document.getElementById("imglimp"),
        slides = document.getElementsByClassName("slides"),
        telaslide = document.getElementsByClassName("telaslide"),
        gifcgintrovert = document.getElementById("gifcgintrovert"),
        gifcgintrohori = document.getElementById("gifcgintrohori"),
        imgoldsilenthill = document.getElementById("imgoldsilenthill"),
        imgkeysforeclipse = document.getElementById("imgkeysforeclipse"),
        fundoverjapelimp = document.getElementById("fundoverjapelimp"),
        bttverdetalhes = document.getElementById("bttverdetalhes"),
        titulo = document.getElementById("titulo"),
        bttdownload = document.getElementById("bttdownload"),
        traprogress = document.getElementById("traprogress"),
        info = document.getElementById("info");
    let carregamentopagina = setTimeout(carregamento, 900);
    const tempotransicao = 730; //Armazena o tempo de transição dos "slides" em milisegundos.
    let styletransicao = "height " + tempotransicao + "ms ease-in-out";//Armazena a configuração da transição dos slides. 
    let tmp;
    let contentsVisible = true;//Indica se as divs com o conteúdo está visível.
    let alturafundo = alturajanela + "px";
    for (let i = 0; i < arrayfundos.length; i++) {
        if (i != 1) {
            arrayfundos[i].style.height = alturafundo;
        }
    }

    ajustarelementos();

    window.addEventListener("resize", function () {
        largurajanela = window.innerWidth;
        alturajanela = window.innerHeight;
        if (largurajanela <= 650) {
            traprogress.style.marginTop = "13px";
        }
        else {
            traprogress.style.marginTop = "0px";
        }
        ajustarelementos();
        ajustarimgscomparacao();
        mudarmenu();
    });

    for (let i = 0; i < arrayFundosComparacao.length; i++) {//Adiciona o evento click aos elementos que "abrem" e aos que "fecham" as div's usadas parar comparar as imagens. 
        abrirFundoComparacao[i].addEventListener("click", function () {
            $(arrayFundosComparacao[i]).fadeIn(700);
            document.removeEventListener("keydown", mudarslide);
            clickImgComparar();
        });
        fecharFundosComparacao[i].addEventListener("click", function () {
            $(arrayFundosComparacao[i]).fadeOut(300);
            document.addEventListener("keydown", mudarslide);
            clickFecharComparacao();
        });
    }

    for (let i = 0; i < imgsComparacao.length; i++) {
        imgsComparacao[i].addEventListener("click", function () {
            clickComparaImagens(this);
        });
    }

    imgverjap.addEventListener("click", function () {//Visualizar a div para ver a versão japonesa da imagem "There are violent and disturbing imagens in this game".
        imglimp.style.opacity = "0";
        $(fundoverjapelimp).fadeIn(400);
        clickImgComparar();
        document.removeEventListener("keydown", mudarslide);//Remove a função "mudarslide" do evento "keydown" do document.
    });

    imgverlimp.addEventListener("click", function () {//Visualizar a div para ver a imagem "There are violent and disturbing imagens in this game" sem texto.
        imglimp.style.opacity = "1";
        $(fundoverjapelimp).fadeIn(400);
        clickImgComparar();
        document.removeEventListener("keydown", mudarslide);//Remove a função "mudarslide" do evento "keydown" do document.
    });

    imgjap.addEventListener("click", function () {
        $(fundoverjapelimp).fadeOut(400);
        clickFecharComparacao();
        document.addEventListener("keydown", mudarslide);//Adiciona novamente a função "mudarslide" ao evento "keydown" do document.
    });

    function carregamento() {//Faz os elementos do primeiro "slide" aparecerem e após isso permite trocar de slide.
        arrayfundos[1].style.opacity = "1";
        info.style.display = "block";
        traprogress.style.display = "block";

        tmp = setInterval(brilhotitulo, 1200);

        setTimeout(function () {//Fazer a "traprogress" e a "info" aparecerem.
            traprogress.style.opacity = "1";
            if (largurajanela <= 650) {
                traprogress.style.marginTop = "13px";
            }
            else {
                traprogress.style.marginTop = "0px";
            }
            info.style.opacity = "1";
            info.style.marginTop = "0px";

            setTimeout(function () {
                traprogress.style.webkitTransition = "none";
                traprogress.style.trasition = "none";
                info.style.webkitTransition = "none";
                info.style.trasition = "none";
            }, 600);
            bttdownload.style.display = "block";

            setTimeout(function () {//Fazer o "bttdownload" aparecer.
                bttdownload.style.opacity = "1";
                bttverdetalhes.style.display = "block";
                bttverdetalhes.style.webkitTransition = "opacity 1.6s linear";
                bttverdetalhes.style.transition = "opacity 1.6s linear";

                setTimeout(function () {//Fazer o "bttverdetalhes" aparecer.
                    bttverdetalhes.style.opacity = "1";

                    bttverdetalhes.addEventListener("click", mudarslidebttverdetalhes);//Passar para o próximo "slide".
                    document.addEventListener("keydown", mudarslide);//usar os direcionais cima e baixo e as teclas "W" e "S" para mudar de "slide".
                    document.addEventListener("keydown", abrirFundosComparacao);
                    document.addEventListener("keydown", mostrarimgFundo);
                    setTimeout(function () {
                        bttverdetalhes.style.webkitTransition = "";
                        bttverdetalhes.style.transition = "";
                    }, 1610);
                }, 1000);
            }, 900);
        }, 1500);
    };

    function brilhotitulo() {//Fazer o título brilhar somente quando estiver no "slide" 0.
        if (numslide === 0) {
            if (titulo.classList.contains("brilho") === true) {
                titulo.classList.remove("brilho");
            }
            else {
                titulo.classList.add("brilho");
            }
        }
    }

    function ajustarimgscomparacao() {//Ajustar o tamanho das imagens que serão comparadas com base na constante "proporcao4por3" e centralizá-las na tela.      
        if ((largurajanela / alturajanela) > proporcao4por3) {
            imgviolentasorig.style.height = "97%";
            imgviolentasorig.style.width = imgviolentasorig.offsetHeight * proporcao4por3 + "px";
            imgoldsilenthill.style.height = "97%";
            imgoldsilenthill.style.width = imgoldsilenthill.offsetHeight * proporcao4por3 + "px";
            imgkeysforeclipse.style.height = "97%";
            imgkeysforeclipse.style.width = imgkeysforeclipse.offsetHeight * proporcao4por3 + "px";
            imgjap.style.height = "80%";
            imgjap.style.width = imgjap.offsetHeight * proporcao4por3 + "px";

            gifcgintrohori.style.display = "none";
            gifcgintrovert.style.display = "block";
            if ((largurajanela / alturajanela) > (2 * proporcao4por3)) {
                fecharFundosComparacao[1].style.height = "97%";
                fecharFundosComparacao[1].style.width = fecharFundosComparacao[1].offsetHeight * (proporcao4por3 * 2) + "px";
            }
            else {
                fecharFundosComparacao[1].style.width = "97%";
                fecharFundosComparacao[1].style.height = fecharFundosComparacao[1].offsetWidth / (proporcao4por3 * 2) + "px";
            }
        }
        else {
            imgviolentasorig.style.width = "100%";
            imgviolentasorig.style.height = imgviolentasorig.offsetWidth / proporcao4por3 + "px";
            imgoldsilenthill.style.width = "100%";
            imgoldsilenthill.style.height = imgoldsilenthill.offsetWidth / proporcao4por3 + "px";
            imgkeysforeclipse.style.width = "100%";
            imgkeysforeclipse.style.height = imgkeysforeclipse.offsetWidth / proporcao4por3 + "px";
            imgjap.style.width = "85%";
            imgjap.style.height = imgjap.offsetWidth / proporcao4por3 + "px";

            gifcgintrovert.style.display = "none";
            gifcgintrohori.style.display = "block";
            if ((largurajanela / alturajanela) > (proporcao4por3 / 2)) {
                fecharFundosComparacao[1].style.height = "97%";
                fecharFundosComparacao[1].style.width = fecharFundosComparacao[1].offsetHeight * (proporcao4por3 / 2) + "px";
            }
            else {
                fecharFundosComparacao[1].style.width = "97%";
                fecharFundosComparacao[1].style.height = fecharFundosComparacao[1].offsetWidth / (proporcao4por3 / 2) + "px";
            }
        }

        for (let i = 0; i < telaslide.length; i++) {
            telaslide[i].style.height = (alturajanela - 72) + "px";
        }

        for (let i = 0; i < slides.length; i++) {
            if ((telaslide[i].offsetWidth / telaslide[i].offsetHeight) > proporcao4por3) {
                slides[i].style.height = "98%";
                slides[i].style.width = slides[i].offsetHeight * proporcao4por3 + "px";
            }
            else {
                slides[i].style.width = "98%";
                slides[i].style.height = slides[i].offsetWidth / proporcao4por3 + "px";
            }
        }
    }

    function ajustarelementos() {//fazer o background-image ficar sempre ajustado a janela do nevegador e as div's "fundo terem a mesma altura e largura que a janela do nevegador.
        bttverdetalhes.style.left = (largurajanela / 2) - 30 + "px";
        proporcao = largurajanela / alturajanela;
        let backgroundsize, backgroundpositionx, backgroundpositiony;
        if (proporcao <= proporcao16por9) {
            let novalargura = alturajanela * proporcao16por9;
            backgroundsize = novalargura + "px " + alturajanela + "px";
            backgroundpositionx = -1 * ((novalargura / 2) - (largurajanela / 2)) + "px";
            backgroundpositiony = "0px";
            for (let i = 0; i < arrayfundos.length; i++) {
                arrayfundos[i].style.backgroundSize = backgroundsize;
                arrayfundos[i].style.backgroundPositionX = backgroundpositionx;
                arrayfundos[i].style.backgroundPositionY = backgroundpositiony;
            }
        }
        else {
            let novaAltura = largurajanela / proporcao16por9;
            backgroundsize = largurajanela + "px " + novaAltura + "px";
            backgroundpositionx = "0px";
            backgroundpositiony = -1 * ((novaAltura / 2) - (alturajanela / 2)) + "px";
            for (let i = 0; i < arrayfundos.length; i++) {
                arrayfundos[i].style.backgroundSize = backgroundsize;
                arrayfundos[i].style.backgroundPositionX = backgroundpositionx;
                arrayfundos[i].style.backgroundPositionY = backgroundpositiony;
            }
        }
        let alturafundo = alturajanela + "px";
        for (let i = numslide; i < arrayfundos.length; i++) {
            if (i != 1) {
                arrayfundos[i].style.height = alturafundo;
            }
        }

        alturafundo = alturajanela + "px";
        arrayfundos[numslide].style.height = alturafundo;
        if (largurajanela > alturajanela) {
            for (let i = 0; i < abrirFundoComparacao.length; i++) {
                abrirFundoComparacao[i].style.width = "55%";
            }
        }
        else {
            for (let i = 0; i < abrirFundoComparacao.length; i++) {
                abrirFundoComparacao[i].style.width = "90%";
            }
        }
    };

    logoBlack.addEventListener("click", function () { //Ao clicar na "logoBlack" voltar ao primeiro "slide".    
        if (numslide > 0) {
            voltaPrimeiroSlide();
        }
        else {
            window.location.href = "index.html";
        }
    })

    function slideDown(slide) {//Função que volta para o "slide" anterior.
        if (numslide === arrayfundos.length - 1) {
            $(bttverdetalhes).fadeIn("slow");
        }
        bttverdetalhes.removeEventListener("click", mudarslidebttverdetalhes);//Remove a função "mudarslidebttverdetalhes" do evento "click" do "bttverdetalhes" para evitar que a função seja executada novamente antes que a transição dos "slides" seja concluída.
        document.removeEventListener("keydown", mudarslide);//Remove a função "mudarslide" do evento "keydown" do document para evitar que as teclas para voltar os "slides" sejam pressionadas antes que a transição dos "slides" tenha sido concluída.  
        let slideanterior = slide - 1;//Armazena o número do slide anterior que irá aparecer.
        if (slide === 2) {//Se estiver no "slide" 2 ignorar o "slide" 1 passando para o "slide" 0.
            arrayfundos[1].style.overflow = "hidden";//Evita que barra de rolagem apareça e que o conteúdo do "slide 1" apareça para fora do "slide" na transição dos "slides".  
            slideanterior = 0;//O "slide" anterior do "slide" 2 é o "slide" 0.
            numslide = 1;//Deixa o número do "slide" igual a 1 para quando subtrair ficar igual a 0.
            tmp = setInterval(brilhotitulo, 1200);//Faz o título voltar a "brilhar" quando voltar ao "slide" 0.
        }
        else {
            arrayfundos[slideanterior].style.overflow = "hidden";//Evita que barra de rolagem apareça e que o conteúdo do "slide" anterior apareça para fora do "slide" na transição dos "slides". 
        }
        numslide--;//Subtrai 1 do número do slide. 
        //----------------Cria a trasição de altura do "slide" anterior-----------------
        arrayfundos[slideanterior].style.webkitTransition = styletransicao;
        arrayfundos[slideanterior].style.transition = styletransicao;
        //------------------------------------------------------------------------------
        arrayfundos[slide].style.overflow = "hidden";//Evita que barra de rolagem apareça e que o conteúdo do "slide" atual apareça para fora do "slide" na transição dos "slides". 
        arrayfundos[slideanterior].style.height = alturajanela + "px";//Muda a altura do slide anterior para ficar igual a altura da jenela.

        setTimeout(function () {//Espera a transição de altura do slide ocorrer.
            if (slide === 2) {//Permite que a barra de rolagem apareça depois da transição do "slide" se necessário. retira a transição de altura.
                arrayfundos[1].style.overflow = "auto";
                arrayfundos[slide].style.overflow = "auto";
                mudarmenu();//Muda o menu para o estilo de topo da página, já que o "slide" 2 volta para o "slide" 0 que seria o topo da página.
            }
            else {
                arrayfundos[slideanterior].style.overflow = "auto";
                arrayfundos[slide].style.overflow = "auto";
            }
            //---------------Retira a transição de altura do "slide" anterior---------------
            arrayfundos[slideanterior].style.webkitTransition = "none";
            arrayfundos[slideanterior].style.transition = "none";
            //------------------------------------------------------------------------------
            bttverdetalhes.addEventListener("click", mudarslidebttverdetalhes);//Adiciona novamente a função "mudarslidebttverdetalhes" ao avento "click" do "bttverdetalhes" depois que a transição do "slide" tenha sido concluída para que seja possível mudar de slide novamente clicando no mesmo.
            document.addEventListener("keydown", mudarslide);//Adiciona novamente a função "mudarslide" ao evento "keydown" do document depois que a transição do "slide" tenha sido concluída para que seja possível mudar de slide novamente apertando as teclas..
        }, tempotransicao + 20);
    }

    function slideUp(slide) {//Função que passa para o próximo "slide".
        document.removeEventListener("keydown", mudarslide);//Remove a função "mudarslide" do evento "keydown" do document para evitar que as teclas para passar os "slides" sejam pressionadas antes que o slide apareça por completo.
        bttverdetalhes.removeEventListener("click", mudarslidebttverdetalhes);//Remove a função "mudarslidebttverdetalhes" do evento "click" do "bttverdetalhes" para evitar que a função seja executada novamente antes que a transição dos "slides" seja concluída.
        let proximoslide = slide + 1;
        if (slide === 0) {//Se estiver no "slide" 0 ignorar o "slide" 1 passando para o "slide" 2.
            arrayfundos[1].style.overflow = "hidden";//Evita que barra de rolagem apareça e que o conteúdo do "slide 1" apareça para fora do "slide" na transição dos "slides". 
            proximoslide = 2;//O próximo "slide" do "slide" 0 é o "slide" 2.
            numslide = 1;//Deixa o número do "slide" igual a 1 para quando somar ficar igual a 2.
            clearInterval(tmp);//Faz o título parar de "brilhar" quando passar do "slide" 0.
        }
        else {
            arrayfundos[slide].style.overflow = "hidden";//Evita que barra de rolagem apareça e que o conteúdo do "slide" anterior apareça para fora do "slide" na transição dos "slides". 
        }
        numslide++;//Soma 1 do número do slide. 
        //------------------Cria a trasição de altura do "slide" atual------------------
        arrayfundos[slide].style.webkitTransition = styletransicao;
        arrayfundos[slide].style.transition = styletransicao;
        //------------------------------------------------------------------------------
        arrayfundos[proximoslide].style.overflow = "hidden";//Evita que barra de rolagem apareça e que o conteúdo do próximo "slide" apareça para fora do "slide" na transição dos "slides".
        arrayfundos[slide].style.height = "0px";//Muda a altura do "slide" atual para 0 pixels fazendo ele sumir dando lugar ao próximo "slide" 
        setTimeout(function () {//Espera a transição de altura do slide ocorrer.
            if (slide === 0) {//Permite que a barra de rolagem apareça depois da transição do "slide" se necessário. retira a transição de altura.
                arrayfundos[2].style.overflow = "auto";
                arrayfundos[1].style.overflow = "auto";
                arrayfundos[0].style.overflow = "auto";
            }
            else {
                arrayfundos[proximoslide].style.overflow = "auto";
                arrayfundos[slide].style.overflow = "auto";
            }
            //----------------Retira a transição de altura do "slide" atual-----------------
            arrayfundos[slide].style.webkitTransition = "none";
            arrayfundos[slide].style.transition = "none";
            //------------------------------------------------------------------------------
            document.addEventListener("keydown", mudarslide);//Adiciona novamente a função "mudarslide" ao evento "keydown" do document depois que a transição do "slide" tenha sido concluída para que seja possível mudar de slide novamente apertando as teclas.
            bttverdetalhes.addEventListener("click", mudarslidebttverdetalhes);//Adiciona novamente a função "mudarslidebttverdetalhes" ao avento "click" do "bttverdetalhes" depois que a transição do "slide" tenha sido concluída para que seja possível mudar de slide novamente clicando no mesmo.
            if (numslide === arrayfundos.length - 1) {
                $(bttverdetalhes).fadeOut("slow");
            }
        }, tempotransicao + 20);

        if (slide === 0) {
            mudarmenu();//Muda o menu para o estilo de saída do topo da página, já que o "slide" 0 seria o topo da página.
        }
    }

    function voltaPrimeiroSlide() {
        document.removeEventListener("keydown", mudarslide);
        tmp = setInterval(brilhotitulo, 1200);
        if (numslide === arrayfundos.length - 1) {
            $(bttverdetalhes).fadeIn("slow");
        }
        numslide = 0;//Muda para o número do primeiro "slide".
        let alturafundo = alturajanela + "px";
        for (let i = 0; i < arrayfundos.length; i++) {
            if (i != 1) {
                arrayfundos[i].style.webkitTransition = styletransicao;
                arrayfundos[i].style.transition = styletransicao;
                arrayfundos[i].style.height = alturafundo;
            }
            arrayfundos[i].style.overflow = "hidden";
        }

        setTimeout(function () {
            for (let i = 0; i < arrayfundos.length; i++) {
                if (i != 1) {
                    arrayfundos[i].style.webkitTransition = "none";
                    arrayfundos[i].style.transition = "none";
                }
                arrayfundos[i].style.overflow = "auto";
            }
            mudarmenu();
            document.addEventListener("keydown", mudarslide);
        }, tempotransicao + 20);
    }

    abrirFundosComparacao = function (e) {
        if (e.code === "Enter") {
            if (numslide >= 2) {
                abrirFundoComparacao[numslide - 2].click();
            }
        }
    }

    function mudarslide(e) {//Função que verifica se as teclas para passar os "slides" foram pressionadas.
        switch (e.code) {
            case code = "ArrowDown"://Direcional baixo.

                if (numslide < arrayfundos.length - 1) {
                    slideUp(numslide);
                }
                break;

            case code = "KeyS"://Tecla "S".

                if (numslide < arrayfundos.length - 1) {
                    slideUp(numslide);
                }
                break;

            case code = "PageDown"://Tecla "Page Down".

                if (numslide < arrayfundos.length - 1) {
                    slideUp(numslide);
                }
                break;

            case code = "ArrowUp"://Direcional cima.

                if (numslide > 0) {
                    slideDown(numslide);
                }
                break;

            case code = "KeyW"://Tecla "W".

                if (numslide > 0) {
                    slideDown(numslide);
                }
                break;

            case code = "PageUp"://Tecla "Page Up".

                if (numslide > 0) {
                    slideDown(numslide);
                }
                break;

            case code = "Home":

                if (numslide > 0) {
                    voltaPrimeiroSlide();
                }
                break;
        }
    }

    function funcoesImgComparacaoTeclado(e) {//Uso do teclado para comparar as imagems e "fechar" as div's.
        switch (e.code) {
            case code = "Space":
                if (arrayFundosComparacao[0].style.display === "block") {
                    imgsComparacao[0].click();
                }
                else if (arrayFundosComparacao[2].style.display === "block") {
                    imgsComparacao[1].click();
                }
                else if (arrayFundosComparacao[4].style.display === "block") {
                    imgsComparacao[4].click();
                }
                break;
            case code = "Escape":
                fecharFundosComparacao[numslide - 2].click();
                if (numslide === 2) {
                    imgjap.click();
                }
                break;
        }
    }

    function mudarslidebttverdetalhes() {
        if (numslide < arrayfundos.length - 1) {
            slideUp(numslide);
        }
    }

    function mudarmenu() {
        if (numslide === 0) {
            menu.classList.remove("mudamenu");
            menu.classList.add("iniciomenu");
            logoBlack.classList.remove("mudalogoBlack");
            logoBlack.classList.add("iniciologoBlack");
            iconesetablack.classList.remove("mudaiconeblack");
            iconesetablack.classList.add("inicioiconeblack");
            iconemenublack.classList.remove("mudaiconeblack");
            iconemenublack.classList.add("inicioiconeblack");
            for (let i = 0; i < arrayop.length; i++) {
                arrayop[i].classList.remove("mudaopcoes");
                arrayop[i].classList.add("inicioopcoes");
            }
        }
        else {
            menu.classList.remove("iniciomenu");
            menu.classList.add("mudamenu");
            logoBlack.classList.remove("iniciologoBlack");
            logoBlack.classList.add("mudalogoBlack");
            iconesetablack.classList.remove("inicioiconeblack");
            iconesetablack.classList.add("mudaiconeblack");
            iconemenublack.classList.remove("inicioiconeblack");
            iconemenublack.classList.add("mudaiconeblack");
            for (let i = 0; i < arrayop.length; i++) {
                arrayop[i].classList.remove("inicioopcoes");
                arrayop[i].classList.add("mudaopcoes");
            }
        }
    }

    function clickImgComparar() {//O que acontece quando o usuário clica em alguma imagem para comparar as edições.
        fadeoutcontents();
        ajustarimgscomparacao();
        fundoCompararVisible = true;
        document.removeEventListener("keydown", abrirFundosComparacao);
        setTimeout(function () {
            document.addEventListener("keydown", funcoesImgComparacaoTeclado);
        }, 600);
    }

    function clickFecharComparacao() {//O que acontece quando o usuário "fecha" alguma div de comparação.
        fadeincontents();
        for (let i = 0; i < imgsComparacao.length; i++) {
            imgsComparacao[i].style.opacity = "0";
        }
        imgvisivel = false;
        fundoCompararVisible = false;
        document.removeEventListener("keydown", funcoesImgComparacaoTeclado);
        setTimeout(function () {
            document.addEventListener("keydown", abrirFundosComparacao);
        }, 310);
    }

    function fadeoutcontents() {//Faz todas as divs que possuem conteúdo "sumirem".
        if (contentsVisible === true) {
            $(bttverdetalhes).fadeOut(300);
            for (let i = 0; i < contents.length; i++) {
                $(contents[i]).fadeOut(300);
            }
            contentsVisible = false;
        }
    }

    function fadeincontents() {//Faz todas as divs que possuem conteúdo "aparecerem".
        if (contentsVisible === false) {
            if (numslide != arrayfundos.length - 1) {
                $(bttverdetalhes).fadeIn(700);
            }
            for (let i = 0; i < contents.length; i++) {
                $(contents[i]).fadeIn(700);
            }
            contentsVisible = true;
        }
    }

    function clickComparaImagens(element) {
        if (imgvisivel === false) {
            element.style.opacity = "1";
            imgvisivel = true;
        }
        else {
            element.style.opacity = "0";
            imgvisivel = false;
        }
    }

    function mostrarimgFundo(e) {
        if (e.code === "Space" && fundoCompararVisible === false) {
            fadeoutcontents();
            document.removeEventListener("keydown", mostrarimgFundo);
            setTimeout(function () {
                document.addEventListener("keydown", mostrarimgFundo);
            }, 1050);
        }
    }
    document.addEventListener("keyup", function (e) {
        if (e.code === "Space" && fundoCompararVisible === false) {
            fadeincontents();
        }
    });
};

function slideCarosel() {
    let larguraJanela = window.innerWidth;

    const compararFolhasCaderno = document.getElementById("compararFolhasCaderno"),
        fundocomparafolhas = document.getElementById("fundocomparafolhas"),
        folhascontentimgicons = document.getElementById("folhascontentimgicons"),
        folhasbtnLeft = document.getElementById("folhasbtnLeft"),
        folhasbtnRight = document.getElementById("folhasbtnRight"),
        fecharfolhas = document.getElementById("fecharfolhas"),
        slidesFolhas = [document.getElementById("imgtoschool"),
        document.getElementById("imgdoghouse")],
        left = ((70 * 4 / 3) / 2);

    let contSlides = 1;
    let leftimgicons = (larguraJanela / 2) - left;

    folhascontentimgicons.style.left = leftimgicons + "px";
    //_________________________________________Comparar folhas de caderno_______________________________________________

    const iconfolhas = [document.getElementById("icontoschool"),
    document.getElementById("icondoghouse")];

    mudaSlideFolha();

    compararFolhasCaderno.addEventListener("click", function () {//Visualizar a div para ver as "folhas de caderno de desenho". 
        $(fundocomparafolhas).fadeIn(700);
        clickSlideComparar();
    });

    fecharfolhas.addEventListener("click", function () {
        $(fundocomparafolhas).fadeOut(300);
        clickFecharComparacaoSlide();
        voltaPrimeiroSlideFolha();
    });

    folhasbtnLeft.addEventListener("click", voltaFolha);
    folhasbtnRight.addEventListener("click", avancaFolha);

    iconfolhas[0].addEventListener("click", voltaPrimeiroSlideFolha);
    function voltaPrimeiroSlideFolha() {
        leftimgicons = ((larguraJanela / 2) - left) - ((left * 2) * (0));
        contSlides = 1;
        mudaSlideFolha();
    }

    iconfolhas[1].addEventListener("click", function () {
        leftimgicons = ((larguraJanela / 2) - left) - ((left * 2) * (1));
        contSlides = 2;
        mudaSlideFolha();
    });

    function voltaFolha() {
        if (contSlides > 1) {
            leftimgicons = leftimgicons + left * 2;
            contSlides--;
            mudaSlideFolha();
        }
        else if (contSlides === 1) {
            leftimgicons = ((larguraJanela / 2) - left) - ((left * 2) * (iconfolhas.length - 1));
            contSlides = iconfolhas.length;
            mudaSlideFolha();
        }
    };

    function avancaFolha() {
        if (contSlides < iconfolhas.length) {
            leftimgicons = leftimgicons - left * 2;
            contSlides++;
            mudaSlideFolha();
        }
        else if (contSlides === iconfolhas.length) {
            leftimgicons = (larguraJanela / 2) - left;
            contSlides = 1;
            mudaSlideFolha();
        }
    };

    function mudaSlideFolha() {
        folhasbtnLeft.removeEventListener("click", voltaFolha);
        folhasbtnRight.removeEventListener("click", avancaFolha);
        folhascontentimgicons.style.transition = "left 350ms ease-in-out";
        for (let i = 0; i < slidesFolhas.length; i++) {
            slidesFolhas[i].style.transition = "width 350ms ease-in-out";
        }
        setTimeout(function () {
            for (let i = 0; i < slidesFolhas.length; i++) {
                if (i != (contSlides - 1)) {
                    slidesFolhas[i].style.width = "0%";
                }
            }
            slidesFolhas[contSlides - 1].style.width = "100%";
            folhascontentimgicons.style.left = leftimgicons + "px";
            iconfolhas[contSlides - 1].style.border = "1px solid rgba(213, 192, 107, 0.555)";
            setTimeout(function () {
                iconfolhas[contSlides - 1].style.opacity = "1";
                for (let i = 0; i < iconfolhas.length; i++) {
                    if (i != contSlides - 1) {
                        iconfolhas[i].style.border = "";
                        iconfolhas[i].style.opacity = "";
                    }
                }
                folhasbtnLeft.addEventListener("click", voltaFolha);
                folhasbtnRight.addEventListener("click", avancaFolha);
                for (let i = 0; i < imgsComparacao.length; i++) {
                    imgsComparacao[i].style.opacity = "0";
                }
                imgvisivel = false;  
            }, 350)
        }, 5)
    };
    //__________________________________________Comparar Mapa da escola____________________________________________

    const compararescola = document.getElementById("compararEscola"),
        fundomapaescola = document.getElementById("fundomapaescola"),
        fecharfundoescola = document.getElementById("fecharfundoescola"),
        escolacontentimgicons = document.getElementById("escolacontentimgicons"),
        mapaescolabtnLeft = document.getElementById("mapaescolabtnLeft"),
        mapaescolabtnRight = document.getElementById("mapaescolabtnRight");

    const iconMapaEscola = [document.getElementById("iconmapaescolap"),
    document.getElementById("iconmapaescola1a"),
    document.getElementById("iconmapaescola2a"),
    document.getElementById("iconmapaescolat")];

    const slidesMapaEscola = [document.getElementById("imgschoolp"),
    document.getElementById("imgschool1a"),
    document.getElementById("imgschool2a"),
    document.getElementById("imgschoolt")];

    escolacontentimgicons.style.left = leftimgicons + "px";

    mudaSlideMapaEscola();

    compararescola.addEventListener("click", function () {//Visualizar a div para comparar o mapa de Escola.
        $(fundomapaescola).fadeIn(700);
        clickSlideComparar();
    });

    fecharfundoescola.addEventListener("click", function () {//Fechar a div para comparar o mapa de Escola.
        $(fundomapaescola).fadeOut(300);        
        voltaPrimeiroSlideMapaEscola();       
        clickFecharComparacaoSlide();
    });

    function clickSlideComparar() {//O que acontece quando o usuário clica em alguma imagem para comparar as edições.
        document.removeEventListener("keydown", abrirFundosComparacao);
        setTimeout(function () {
            document.addEventListener("keydown", funcoesSlideImgTeclado);
        }, 600);
    }

    function clickFecharComparacaoSlide() {//O que acontece quando o usuário "fecha" alguma div de comparação.
        folhavisivel = false;
        document.removeEventListener("keydown", funcoesSlideImgTeclado);
        setTimeout(function () {
            document.addEventListener("keydown", abrirFundosComparacao);
        }, 310);
    }

    mapaescolabtnLeft.addEventListener("click", voltaMapaEscola);
    mapaescolabtnRight.addEventListener("click", avancaMapaEscola);

    iconMapaEscola[0].addEventListener("click", voltaPrimeiroSlideMapaEscola);
    function voltaPrimeiroSlideMapaEscola() {
        leftimgicons = ((larguraJanela / 2) - left) - ((left * 2) * (0));
        contSlides = 1;
        mudaSlideMapaEscola();
    };

    iconMapaEscola[1].addEventListener("click", function () {
        leftimgicons = ((larguraJanela / 2) - left) - ((left * 2) * (1));
        contSlides = 2;
        mudaSlideMapaEscola();
    });

    iconMapaEscola[2].addEventListener("click", function () {
        leftimgicons = ((larguraJanela / 2) - left) - ((left * 2) * (2));
        contSlides = 3;
        mudaSlideMapaEscola();
    });

    iconMapaEscola[3].addEventListener("click", function () {
        leftimgicons = ((larguraJanela / 2) - left) - ((left * 2) * (3));
        contSlides = 4;
        mudaSlideMapaEscola();
    });

    function voltaMapaEscola() {
        if (contSlides > 1) {
            leftimgicons = leftimgicons + left * 2;
            contSlides--;
            mudaSlideMapaEscola();
        }
        else if (contSlides === 1) {
            leftimgicons = ((larguraJanela / 2) - left) - ((left * 2) * (iconMapaEscola.length - 1));
            contSlides = iconMapaEscola.length;
            mudaSlideMapaEscola();
        }
    };

    function avancaMapaEscola() {
        if (contSlides < iconMapaEscola.length) {
            leftimgicons = leftimgicons - left * 2;
            contSlides++;
            mudaSlideMapaEscola();
        }
        else if (contSlides === iconMapaEscola.length) {
            leftimgicons = (larguraJanela / 2) - left;
            contSlides = 1;
            mudaSlideMapaEscola();
        }
    };

    function mudaSlideMapaEscola() {
        mapaescolabtnLeft.removeEventListener("click", voltaMapaEscola);
        mapaescolabtnRight.removeEventListener("click", avancaMapaEscola);
        escolacontentimgicons.style.transition = "left 350ms ease-in-out";
        for (let i = 0; i < slidesMapaEscola.length; i++) {
            slidesMapaEscola[i].style.transition = "width 350ms ease-in-out";
        }
        setTimeout(function () {
            for (let i = 0; i < slidesMapaEscola.length; i++) {
                if (i != (contSlides - 1)) {
                    slidesMapaEscola[i].style.width = "0%";
                }
            }
            slidesMapaEscola[contSlides - 1].style.width = "100%";
            escolacontentimgicons.style.left = leftimgicons + "px";
            iconMapaEscola[contSlides - 1].style.border = "1px solid rgba(213, 192, 107, 0.555)";
            setTimeout(function () {
                iconMapaEscola[contSlides - 1].style.opacity = "1";
                for (let i = 0; i < iconMapaEscola.length; i++) {
                    if (i != contSlides - 1) {
                        iconMapaEscola[i].style.border = "";
                        iconMapaEscola[i].style.opacity = "";
                    }
                }
                mapaescolabtnLeft.addEventListener("click", voltaMapaEscola);
                mapaescolabtnRight.addEventListener("click", avancaMapaEscola);
                for (let i = 0; i < imgsComparacao.length; i++) {
                    imgsComparacao[i].style.opacity = "0";
                }
                imgvisivel = false;
            }, 350)
        }, 5)
    };
    //____________________________________________________________________________________________________________________

    function funcoesSlideImgTeclado(e) {
        switch (e.code) {
            case code = "Space":
                if (fundocomparafolhas.style.display === "block") {
                    if (contSlides === 1) {
                        imgsComparacao[2].click();
                    }
                    else if (contSlides === 2) {
                        imgsComparacao[3].click();
                    }
                }
                else if (fundomapaescola.style.display === "block") {
                    if (contSlides === 1) {
                        imgsComparacao[5].click();
                    }
                    else if (contSlides === 2) {
                        imgsComparacao[6].click();
                    }
                    else if (contSlides === 3) {
                        imgsComparacao[7].click();
                    }
                    else if (contSlides === 4) {
                        imgsComparacao[8].click();
                    }
                }
                break;

            case code = "ArrowRight":
                if (fundocomparafolhas.style.display === "block") {
                    folhasbtnRight.click();
                }
                else if (fundomapaescola.style.display === "block") {
                    mapaescolabtnRight.click();
                }
                break;

            case code = "KeyD":
                if (fundocomparafolhas.style.display === "block") {
                    folhasbtnRight.click();
                }
                else if (fundomapaescola.style.display === "block") {
                    mapaescolabtnRight.click();
                }
                break;

            case code = "ArrowLeft":
                if (fundocomparafolhas.style.display === "block") {
                    folhasbtnLeft.click();
                }
                else if (fundomapaescola.style.display === "block") {
                    mapaescolabtnLeft.click();
                }
                break;

            case code = "KeyA":
                if (fundocomparafolhas.style.display === "block") {
                    folhasbtnLeft.click();
                }
                else if (fundomapaescola.style.display === "block") {
                    mapaescolabtnLeft.click();
                }
                break;

            case code = "Escape":
                if (fundocomparafolhas.style.display === "block") {
                    fecharfolhas.click();
                }
                else if (fundomapaescola.style.display === "block") {
                    fecharfundoescola.click();
                }
                break;
        }
    }

    window.addEventListener("resize", function () {
        larguraJanela = window.innerWidth;
        leftimgicons = ((larguraJanela / 2) - left) - ((left * 2) * (contSlides - 1));
        folhascontentimgicons.style.left = leftimgicons + "px";
        escolacontentimgicons.style.left = leftimgicons + "px";
        folhascontentimgicons.style.transition = "";
        escolacontentimgicons.style.transition = "";
        for (let i = 0; i < slidesFolhas.length; i++) {
            slidesFolhas[i].style.transition = "";
        }
        for (let i = 0; i < slidesMapaEscola.length; i++) {
            slidesMapaEscola[i].style.transition = "";
        }
    });
}