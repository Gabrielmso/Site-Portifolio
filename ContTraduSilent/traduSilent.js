function traduSilent() {
    let largurajanela = window.innerWidth;
    let alturajanela = window.innerHeight;
    let proporcao = largurajanela / alturajanela;
    const proporcao16por9 = 16 / 9;
    const proporcao4por3 = 4 / 3;
    const arrayfundos = [document.getElementById("fundo1"), //Armazenar todos os "slides" em ordem.
    document.getElementById("fundo1blur"),
    document.getElementById("fundo2blur"),
    document.getElementById("fundo3blur"),
    document.getElementById("fundo4blur"),
    document.getElementById("fundo5blur"),
    document.getElementById("fundo6blur"),
    document.getElementById("fundo7blur")];
    const contents = document.getElementsByClassName("content"),//Armazena todas as divs que possuem conteúdo.
        comparar = [document.getElementById("compararthereareviolent"),
        document.getElementById("omedodesangue"),
        document.getElementById("compararMapaAntigaSilent"),
        document.getElementById("compararFolhasCaderno"),
        document.getElementById("compararChavesEclipse"),
        document.getElementById("compararEscola")],
        imgviolentasorig = document.getElementById("imgviolentasorig"),
        imgviolentastrad = document.getElementById("imgviolentastrad"),
        imgverjap = document.getElementById("imgverjap"),
        imgverlimp = document.getElementById("imgverlimp"),
        imgjap = document.getElementById("imgjap"),
        imglimp = document.getElementById("imglimp"),
        gifcgintrovert = document.getElementById("gifcgintrovert"),
        gifcgintrohori = document.getElementById("gifcgintrohori"),
        imgoldsilenthill = document.getElementById("imgoldsilenthill"),
        imgantigasilenthill = document.getElementById("imgantigasilenthill"),
        imgkeysforeclipse = document.getElementById("imgkeysforeclipse"),
        imgchavesparaoeclipse = document.getElementById("imgchavesparaoeclipse"),
        fundoverjapelimp = document.getElementById("fundoverjapelimp"),
        bttverdetalhes = document.getElementById("bttverdetalhes"),
        fundocomparacao = document.getElementById("fundocomparacao"),
        fundocomparacg = document.getElementById("fundocomparacg"),
        fundoantigasilenthill = document.getElementById("fundoantigasilenthill"),
        fundochavesparaoeclipse = document.getElementById("fundochavesparaoeclipse"),
        fecharfundo1 = document.getElementById("fecharfundo1"),
        fecharantigasilenthill = document.getElementById("fecharantigasilenthill"),
        fecharchavesparaoeclipse = document.getElementById("fecharchavesparaoeclipse"),
        titulo = document.getElementById("titulo"),
        bttdownload = document.getElementById("bttdownload"),
        traprogress = document.getElementById("traprogress"),
        info = document.getElementById("info");
    let carregamentopagina = setTimeout(carregamento, 900);
    let numslide = 0; //Armazena o numero do slide mostrado. 
    const tempotransicao = 730; //Armazena o tempo de transição dos "slides" em milisegundos.
    let styletransicao = "height " + tempotransicao + "ms ease-in-out";//Armazena a configuração da transição dos slides. 
    let imgvisivel = false; //Usar para alternar a opacidade das imagens que serão comparadas entre 0 e 1;
    let tmp;
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

    comparar[0].addEventListener("click", function () {//Visualizar a div para comparar as imagens "There are violent and disturbing imagens in this game" e fazer o conteúdo do site "sumir".
        fadeoutcontents();
        $(fundocomparacao).fadeIn(700);
        ajustarimgscomparacao();
    });

    imgviolentastrad.addEventListener("click", function () {//Deixa a opacidade da imagem em 0 para ver a imagem que está atrás. Comparar as imagens. 
        if (imgvisivel == false) {
            this.style.opacity = "1";
            imgvisivel = true;
        }
        else {
            this.style.opacity = "0";
            imgvisivel = false;
        }
    });

    fecharfundo1.addEventListener("click", function () {//"Fechar" a div que mostra as imagens "There are violent and disturbing imagens in this game" e fazer o conteúdo do site "aparecer".
        $(fundocomparacao).fadeOut(300);
        fadeincontents();
        imgviolentastrad.style.opacity = "0";
        imgvisivel = false;
    });

    imgverjap.addEventListener("click", function () {//Visualizar a div para ver a versão japonesa da imagem "There are violent and disturbing imagens in this game".
        imglimp.style.opacity = "0";
        $(fundoverjapelimp).fadeIn(400);
        ajustarimgscomparacao();
        document.removeEventListener("keydown", mudarslide);//Remove a função "mudarslide" do evento "keydown" do document.
    });

    imgverlimp.addEventListener("click", function () {//Visualizar a div para ver a imagem "There are violent and disturbing imagens in this game" sem texto.
        imglimp.style.opacity = "1";
        $(fundoverjapelimp).fadeIn(400);
        ajustarimgscomparacao();
        document.removeEventListener("keydown", mudarslide);//Remove a função "mudarslide" do evento "keydown" do document.
    });

    imgjap.addEventListener("click", function () {
        $(fundoverjapelimp).fadeOut(400);
        document.addEventListener("keydown", mudarslide);//Adiciona novamente a função "mudarslide" ao evento "keydown" do document.
    });

    comparar[1].addEventListener("click", function () {//Vizualizar a div que mostra o gif comparando a edição feita na cg de inicio e fazer o conteúdo do site "sumir".
        fadeoutcontents();
        $(fundocomparacg).fadeIn(700);
        ajustarimgscomparacao();
    });

    gifcgintrohori.addEventListener("click", function () {//"Fechar" a div que mostra o gif comparando a edição feita na cg de inicio e fazer o conteúdo do site "aparecer".
        $(fundocomparacg).fadeOut(300);
        fadeincontents();
    });

    gifcgintrovert.addEventListener("click", function () {//"Fechar" a div que mostra o gif comparando a edição feita na cg de inicio e fazer o conteúdo do site "aparecer".
        $(fundocomparacg).fadeOut(300);
        fadeincontents();
    });

    comparar[2].addEventListener("click", function () {//Vizualizar a div que compara o mapa da Antiga Silent Hill e fazer o conteúdo do site "sumir".
        fadeoutcontents();
        $(fundoantigasilenthill).fadeIn(700);
        ajustarimgscomparacao();
    });

    imgantigasilenthill.addEventListener("click", function () {
        if (imgvisivel == false) {
            this.style.opacity = 1;
            imgvisivel = true;
        }
        else {
            this.style.opacity = 0;
            imgvisivel = false;
        }
    });

    fecharantigasilenthill.addEventListener("click", function () {//"Fechar" a div que compara o mapa da Antiga Silent Hill e fazer o conteúdo do site "aparecer".
        $(fundoantigasilenthill).fadeOut(300);
        fadeincontents();
        imgantigasilenthill.style.opacity = 0;
        imgvisivel = false;
    });

    comparar[4].addEventListener("click", function () {//Vizualizar a div que compara "Chaves para o Eclipse" e fazer o conteúdo do site "sumir".
        fadeoutcontents();
        $(fundochavesparaoeclipse).fadeIn(700);
        ajustarimgscomparacao();
    });

    imgchavesparaoeclipse.addEventListener("click", function () {
        if (imgvisivel == false) {
            this.style.opacity = 1;
            imgvisivel = true;
        }
        else {
            this.style.opacity = 0;
            imgvisivel = false;
        }
    });

    fecharchavesparaoeclipse.addEventListener("click", function () {
        $(fundochavesparaoeclipse).fadeOut(300);
        fadeincontents();
        imgchavesparaoeclipse.style.opacity = 0;
        imgvisivel = false;
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
                    setTimeout(function () {
                        bttverdetalhes.style.webkitTransition = "";
                        bttverdetalhes.style.transition = "";
                    }, 1610);
                }, 1000);
            }, 900);
        }, 1500);
    };

    function brilhotitulo() {//Fazer o título brilhar somente quando estiver no "slide" 0.
        if (numslide == 0) {
            if (titulo.classList.contains("brilho") == true) {
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
                gifcgintrovert.style.height = "97%";
                gifcgintrovert.style.width = gifcgintrovert.offsetHeight * (proporcao4por3 * 2) + "px";
            }
            else {
                gifcgintrovert.style.width = "97%";
                gifcgintrovert.style.height = gifcgintrovert.offsetWidth / (proporcao4por3 * 2) + "px";
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
                gifcgintrohori.style.height = "97%";
                gifcgintrohori.style.width = gifcgintrohori.offsetHeight * (proporcao4por3 / 2) + "px";
            }
            else {
                gifcgintrohori.style.width = "97%";
                gifcgintrohori.style.height = gifcgintrohori.offsetWidth / (proporcao4por3 / 2) + "px";
            }
        }
    }

    function ajustarelementos() {//fazer o background-image ficar sempre ajustado a janela do nevegador e as div's "fundo terem a mesma altura e largura que a janela do nevegador.
        bttverdetalhes.style.left = (largurajanela / 2) - 30 + "px";
        proporcao = largurajanela / alturajanela;
        let novalargura = alturajanela * proporcao16por9;
        let novaAltura = largurajanela / proporcao16por9;
        let backgroundsize, backgroundpositionx, backgroundpositiony;
        if (proporcao <= proporcao16por9) {
            backgroundsize = novalargura + "px " + alturajanela + "px";
            backgroundpositionx = -1 * ((novalargura - (novalargura / 2)) - (largurajanela / 2)) + "px";
            backgroundpositiony = "0px";
            for (let i = 0; i < arrayfundos.length; i++) {
                arrayfundos[i].style.backgroundSize = backgroundsize;
                arrayfundos[i].style.backgroundPositionX = backgroundpositionx;
                arrayfundos[i].style.backgroundPositionY = backgroundpositiony;
            }
        }
        else {
            backgroundsize = largurajanela + "px " + novaAltura + "px";
            backgroundpositionx = "0px";
            backgroundpositiony = -1 * ((novaAltura - (novaAltura / 2)) - (alturajanela / 2)) + "px";
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
            for (let i = 0; i < comparar.length; i++) {
                comparar[i].style.width = "55%";
            }
        }
        else {
            for (let i = 0; i < comparar.length; i++) {
                comparar[i].style.width = "90%";
            }
        }

    };

    logoBlack.addEventListener("click", function () { //Ao clicar na "logoBlack" voltar ao primeiro "slide".    
        if (numslide > 0) {
            tmp = setInterval(brilhotitulo, 1200);
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
            }, tempotransicao + 20);
        }
        else {
            window.location.href = "index.html";
        }
    })

    function slideDown(slide) {//Função que volta para o "slide" anterior.
        document.removeEventListener("keydown", mudarslide);//Remove a função "mudarslide" do evento "keydown" do document para evitar que as teclas para voltar os "slides" sejam pressionadas antes que a transição dos "slides" tenha sido concluída.  
        let slideanterior = slide - 1;//Armazena o número do slide anterior que irá aparecer.
        if (slide == 2) {//Se estiver no "slide" 2 ignorar o "slide" 1 passando para o "slide" 0.
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
            if (slide == 2) {//Permite que a barra de rolagem apareça depois da transição do "slide" se necessário. retira a transição de altura.
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
            document.addEventListener("keydown", mudarslide);//Adiciona novamente a função "mudarslide" ao evento "keydown" do document depois que a transição do "slide" tenha sido concluída para que seja possível mudar de slide novamente apertando as teclas..
        }, tempotransicao + 20);
    }


    function slideUp(slide) {//Função que passa para o próximo "slide".
        document.removeEventListener("keydown", mudarslide);//Remove a função "mudarslide" do evento "keydown" do document para evitar que as teclas para passar os "slides" sejam pressionadas antes que o slide apareça por completo.
        bttverdetalhes.removeEventListener("click", mudarslidebttverdetalhes);//Remove a função "mudarslidebttverdetalhes" do evento "click" do "bttverdetalhes" para evitar que a função seja executada novamente antes que a transição dos "slides" seja concluída.
        let proximoslide = slide + 1;
        if (slide == 0) {//Se estiver no "slide" 0 ignorar o "slide" 1 passando para o "slide" 2.
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
            if (slide == 0) {//Permite que a barra de rolagem apareça depois da transição do "slide" se necessário. retira a transição de altura.
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
        }, tempotransicao + 20);

        if (slide == 0) {
            mudarmenu();//Muda o menu para o estilo de saída do topo da página, já que o "slide" 0 seria o topo da página.
        }
    }

    function mudarslide() {//Função que verifica se as teclas para passar os "slides" foram pressionadas.
        switch (event.keyCode) {
            case keyCode = 40://Direcional baixo.

                if (numslide < arrayfundos.length - 1) {
                    slideUp(numslide);
                }
                break;

            case keyCode = 83://Tecla "S".

                if (numslide < arrayfundos.length - 1) {
                    slideUp(numslide);
                }
                break;

            case keyCode = 38://Direcional cima.

                if (numslide > 0) {
                    slideDown(numslide);
                }
                break;

            case keyCode = 87://Tecla "W".

                if (numslide > 0) {
                    slideDown(numslide);
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
        if (numslide > 0) {
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
        else {
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
    }

    function fadeoutcontents() {//Faz todas as divs que possuem conteúdo "sumirem".
        $(bttverdetalhes).fadeOut(300);
        for (let i = 0; i < contents.length; i++) {
            $(contents[i]).fadeOut(300);
        }
    }

    function fadeincontents() {//Faz todas as divs que possuem conteúdo "aparecerem".       
        $(bttverdetalhes).fadeIn(700);
        for (let i = 0; i < contents.length; i++) {
            $(contents[i]).fadeIn(700);
        }
    }
};