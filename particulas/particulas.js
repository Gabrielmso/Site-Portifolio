function particulas() {
   const espacoparticulas = document.getElementById("espacoparticulas"),
      particulas = document.getElementById("particulas");

   let contexto = particulas.getContext("2d"),
      larguraJanela = window.innerWidth,
      alturaJanela = window.innerHeight,
      relacaonumparticulas = larguraJanela * alturaJanela,
      scrollposicao = document.body.scrollTop || document.documentElement.scrollTop,
      numParticulas = Math.round(relacaonumparticulas / 25500), //Determina o número de particulas deixando com a mesma densidade independente do tamanho da janela.
      raioCirculo = 0,//Tamanho de cada particula.
      posicaoX = 0,//Posição no eixo x de cada particula.
      posicaoY = 0,//Posição no eixo y de cada particula.
      deslocaX = 0,//Velocidade de deslocamento do eixo x de cada particula.
      deslocay = 0,//Velocidade de deslocamento do eixo y de cada particula.
      guardarParticula = [];//Armazena as propriedades de cada particula, cada indice será uma particula, o número de indices é determinado pela "numParticulas".

   let frameRate = 23,//Frames por segundo que a animação terá.
      agora, //Tempo atual em milisegundos desde que a página foi carregada.
      antes = performance.now(),//Tempo em milisegundos em que o frame anterior foi desenhado.
      intervaloEntreFrames = 1000 / frameRate,//Intervalo em milisegundos que cada frame terá.
      diferencaTempo, //Comparação entre o tempo atual e o tempo em que o frame anterior foi desenhando.
      iniciarAnimacao = requestAnimationFrame(animar, particulas);

   mudarTamanhoCanvas(larguraJanela, alturaJanela);//Deixa o canvas com a mesma resolução da janela.
   guardaParticulas();

   window.addEventListener("resize", function () {
      larguraJanela = window.innerWidth;//Atualiza a largura da janela quando a mesma mudar
      alturaJanela = window.innerHeight;//Atualiza a altura da janela quando a mesma mudar.
      mudarTamanhoCanvas();
      relacaonumparticulas = larguraJanela * alturaJanela;
      guardarParticula = [];//"Exclui" as particulas anteriores para atualizar a quantidade da mesma caso a janela mude de tamanho.
      numParticulas = Math.round(relacaonumparticulas / 25555);//Atualiza o número de particulas caso a janela mude de tamanho.
      guardaParticulas();
   });

   document.addEventListener("scroll", throttle(function () {
      scrollposicao = document.body.scrollTop || document.documentElement.scrollTop;
      if (scrollposicao >= alturaJanela - 13) {
         //Encerra a animação quando o valor do scrollTop da página for superior ao tamanho da janela (pois as particulas não serão mais visíveis) evitar processamento inútil.
         espacoparticulas.style.webkitTransition = "none";
         espacoparticulas.style.transition = "none";
         espacoparticulas.style.opacity = "0";
         cancelAnimationFrame(iniciarAnimacao);
         iniciarAnimacao = null;
      }
      if (scrollposicao < 3 && iniciarAnimacao == null) {
         //Retoma a animação quando a página voltar ao topo.
         espacoparticulas.style.webkitTransition = "opacity 3s linear";
         espacoparticulas.style.transition = "opacity 3s linear";
         espacoparticulas.style.opacity = "1";
         iniciarAnimacao = requestAnimationFrame(animar, particulas);
      }
   }), 115, true);

   function guardaParticulas() {
      for (let i = 0; i < numParticulas; i++) {
         raioCirculo = valorAleatorio(3, 8);//Calcula um tamanho aleatório de raio para cada particula ter um tamanho diferente.
         posicaoX = valorAleatorio(raioCirculo, larguraJanela - raioCirculo);//Calcula uma posição aleatória no eixo x entre 0 mais o raio da particula e a largura total da janela menos o raio da particula para a mesma não passar as bordas da janela.
         posicaoY = valorAleatorio(raioCirculo, alturaJanela - raioCirculo);//Calcula uma posição aleatória no eixo y entre 0 mais o raio da particula e a altura total da janela menos o raio da particula para a mesma não passar as bordas da janela.
         deslocaX = valorAleatorio(-0.7, 0.7);//Calcula uma velocidade aleatória de deslocamento da particula no eixo x entre -1 pixel (mover 1 pixel para a esquerda) e 1 pixel (mover 1 pixel para a direita).
         deslocay = valorAleatorio(-0.7, 0.7);//Calcula uma velocidade aleatória de deslocamento da particula no eixo y entre -1 pixel (mover 1 pixel para cima) e 1 pixel (mover 1 pixel para baixo).
         guardarParticula[i] = (new criarParticula(posicaoX, posicaoY, deslocaX, deslocay, raioCirculo, i, raioCirculo / 2));//Executa a função para criar a particula e armazena toda a função em vetor para mudar as propriedades que constituem as particulas para realizar a animação de cada particula.
      }
   }

   function criarParticula(posicaoX, posicaoY, deslocaX, deslocaY, raioCirculo, indice, massa) {//Função que retorna um objeto cuja as propriedades e os métodos ficam armazenados na "guardarParticula".
      return {
         //--------Características/propriedades do objeto/particula---------
         ind: indice,
         posX: posicaoX,
         posY: posicaoY,
         desX: deslocaX,
         desY: deslocaY,
         raio: raioCirculo,
         m: massa,
         //----------------Ações/métodos do objeto/particula----------------
         mudarDirecao: function () {
            //Se a particula passar das extremidades da janela faz ela aparecer na extremidade oposta.
            if (this.posY - this.raio >= alturaJanela) {
               this.posY = -(this.raio);
            }
            else if (this.posY + this.raio <= 0) {
               this.posY = alturaJanela + this.raio;
            }
            if (this.posX - this.raio >= larguraJanela) {
               this.posX = -(this.raio);
            }
            else if (this.posX + this.raio <= 0) {
               this.posX = larguraJanela + this.raio;
            }

            for (let i = 0; i < guardarParticula.length; i++) {
               if (i != this.ind) {
                  const disLinha = 190;
                  const dx = guardarParticula[i].posX - this.posX;//Distância no eixo X entre uma particula e outra.
                  const dy = guardarParticula[i].posY - this.posY;//Distância no eixo Y entre uma particula e outra.
                  const sr = this.raio + guardarParticula[i].raio;//Soma dos raios de uma particula e outra.
                  let novaPos = {}, novadisparticulaXesquerda = {}, novadisparticulaXdireita = {}, novadisparticulaYcima = {}, novadisparticulaYbaixo = {};

                  if (this.posX <= disLinha || this.posX >= larguraJanela - disLinha || this.posY <= disLinha || this.posY >= alturaJanela - disLinha) { //Se a particula estiver próxima das extremidades.
                     novaPos = {//Calcula a posição que as particulas tem depois das extremidades da tela para que seja possível desenhar as linhas que "atravessão" as extremidades da tela.
                        xEsq: (guardarParticula[i].posX - larguraJanela),//Posição X após a extremidade da esquerda.
                        xDir: (larguraJanela + guardarParticula[i].posX),//Posição X após a extremidade da direita.
                        yCima: (guardarParticula[i].posY - alturaJanela),//Posição Y após a extremidade de cima.
                        yBaixo: (alturaJanela + guardarParticula[i].posY)//Posição Y após a extremidade de baixo.
                     };
                     const novaDis = {//Calcula a distância dos eixos das particulas com as novas posições.
                        xEsq: (novaPos.xEsq - this.posX),//Distância no eixo X entre a particula após a extremidade da esquerda.
                        xDir: (novaPos.xDir - this.posX),//Distância no eixo X entre a particula após a extremidade da direita.
                        yCima: (novaPos.yCima - this.posY),//Distância no eixo y entre a particula após a extremidade de cima.
                        yBaixo: (novaPos.yBaixo - this.posY)//Distância no eixo y entre a particula após a extremidade de baixo.
                     };
                     novadisparticulaXesquerda = { prim: (Math.sqrt((novaDis.xEsq * novaDis.xEsq) + (dy * dy))) };//Fórmula para saber a distância entre as particulas quando estiver próxima da extremidade esquerda.
                     novadisparticulaXdireita = { prim: Math.sqrt((novaDis.xDir * novaDis.xDir) + (dy * dy)) };//Fórmula para saber a distância entre as particulas quando estiver próxima da extremidade direita.
                     novadisparticulaYcima = { prim: Math.sqrt((dx * dx) + (novaDis.yCima * novaDis.yCima)) };//Fórmula para saber a distância entre as particulas quando estiver próxima da extremidade superior.
                     novadisparticulaYbaixo = { prim: Math.sqrt((dx * dx) + (novaDis.yBaixo * novaDis.yBaixo)) };//Fórmula para saber a distância entre as particulas quando estiver próxima da extremidade inferior.
                  }

                  const disparticula = { prim: Math.sqrt((dx * dx) + (dy * dy)), seg: Math.sqrt(sr * sr) };//Fórmula para saber a distância entre uma particula e outra.
                  if (disparticula.prim <= disparticula.seg) {//Se a soma dos quadrados da diferença entre a posição X e a posição Y das particulas for menor ou igual que o quadrado da soma dos raios das mesmas, uma particula está "encostando na outra".
                     colisao(this, guardarParticula[i], dx, dy);//Calcula a velocidade e o angulo q as particulas terão após encostarem uma na outra.
                  }
                  else if (disparticula.prim <= disLinha) {//Se elas não estiverem encostando, desenha uma linha entre as particulas se elas estiverem com uma distância menor que 200 pixels.
                     let linhaOpacidade = ((disLinha - disparticula.prim) / disLinha);
                     desenhaLinha(this.posX, this.posY, guardarParticula[i].posX, guardarParticula[i].posY, linhaOpacidade, false);
                  }
                  else if (novadisparticulaYbaixo.prim <= disLinha && this.posY >= alturaJanela - disLinha) {//Se a particula estiver próxima de uma extremidade e houver uma particula próxima a extremidade oposta uma linha é desenhada atravessando as extremidades até a outra particula.
                     let linhaOpacidade = ((disLinha - novadisparticulaYbaixo.prim) / disLinha);
                     let novaPosYBaixo = (novaPos.yBaixo + (guardarParticula[i].raio * 2));
                     desenhaLinha(this.posX, this.posY, guardarParticula[i].posX, novaPosYBaixo, linhaOpacidade, true);
                  }
                  else if (novadisparticulaYcima.prim <= disLinha && this.posY <= disLinha) {
                     let linhaOpacidade = ((disLinha - novadisparticulaYcima.prim) / disLinha);
                     let novaPosYCima = (novaPos.yCima - (guardarParticula[i].raio * 2));
                     desenhaLinha(this.posX, this.posY, guardarParticula[i].posX, novaPosYCima, linhaOpacidade, true);
                  }
                  else if (novadisparticulaXesquerda.prim <= disLinha && this.posX <= disLinha) {
                     let linhaOpacidade = ((disLinha - novadisparticulaXesquerda.prim) / disLinha);
                     let novaPosXEsq = (novaPos.xEsq - (guardarParticula[i].raio * 2));
                     desenhaLinha(this.posX, this.posY, novaPosXEsq, guardarParticula[i].posY, linhaOpacidade, true);
                  }
                  else if (novadisparticulaXdireita.prim <= disLinha && this.posX >= larguraJanela - disLinha) {
                     let linhaOpacidade = ((disLinha - novadisparticulaXdireita.prim) / disLinha);
                     let novaPosXDir = (novaPos.xDir + (guardarParticula[i].raio * 2));
                     desenhaLinha(this.posX, this.posY, novaPosXDir, guardarParticula[i].posY, linhaOpacidade, true);
                  }
               }
            }
            this.posX += this.desX;//Acrescenta o valor de deslocamento no eixo X no valor da posição da particula no eixo X.
            this.posY += this.desY;//Acrescenta o valor de deslocamento no eixo Y no valor da posição da particula no eixo Y.
            desenhaParticula(this);//Chama a função que cria a particula, para "recriá-la" na nova posição.
         },
      }
   }

   function desenhaParticula(particula) {
      contexto.beginPath();
      contexto.arc(particula.posX, particula.posY, particula.raio, 0, 2 * Math.PI, true);
      contexto.fillStyle = "#fff";
      contexto.fill();
      contexto.closePath();
   }

   function desenhaLinha(posX, posY, posX2, posY2, opacidade, voltaLinha) {
      contexto.beginPath();
      contexto.lineWidth = 0.65;
      contexto.moveTo(posX, posY);
      contexto.lineTo(posX2, posY2);
      if (voltaLinha === true) {
         contexto.lineTo(posX, posY);
      }
      contexto.strokeStyle = "rgba(255, 255, 255, " + opacidade + ')';
      contexto.stroke();
      contexto.closePath();
   }

   function colisao(primparticula, segunparticula, dx, dy) {//Calcula a velocidade e o angulo que as particulas terão após encostarem uma na outra.
      const diferencaVelocidadeX = primparticula.desX - segunparticula.desX;
      const diferencaVelocidadeY = primparticula.desY - segunparticula.desY;

      if (diferencaVelocidadeX * dx + diferencaVelocidadeY * dy >= 0) {

         const angulo = -Math.atan2(dy, dx);

         const m1 = primparticula.m;
         const m2 = segunparticula.m;

         const u1 = rotate(primparticula.desX, primparticula.desY, angulo);
         const u2 = rotate(segunparticula.desX, segunparticula.desY, angulo);

         const v1 = { x: u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2), y: u1.y };
         const v2 = { x: u2.x * (m1 - m2) / (m1 + m2) + u1.x * 2 * m2 / (m1 + m2), y: u2.y };

         const vFinal1 = rotate(v1.x, v1.y, -angulo);
         const vFinal2 = rotate(v2.x, v2.y, -angulo);

         primparticula.desX = vFinal1.x - (vFinal1.x / 40);
         primparticula.desY = vFinal1.y - (vFinal1.y / 40);
         segunparticula.desX = vFinal2.x - (vFinal2.x / 40);
         segunparticula.desY = vFinal2.y - (vFinal2.y / 40);
      }

      function rotate(desX, desY, angulo) {
         return {
            x: desX * Math.cos(angulo) - desY * Math.sin(angulo),
            y: desX * Math.sin(angulo) + desY * Math.cos(angulo)
         };
      }
   }

   function movimentarParticulas() {
      for (let i = 0; i < guardarParticula.length; i++) {
         guardarParticula[i].mudarDirecao();//"Redesenha" o novo "frame" com as particulas nas novas posições.
      }
   }

   function animar() {
      iniciarAnimacao = requestAnimationFrame(animar, particulas);//Recursividade.
      agora = performance.now();
      diferencaTempo = agora - antes;
      if (diferencaTempo >= intervaloEntreFrames) {//Apaga o frame e desenha um novo quando a diferença do tempo atual e do tempo em que o frame foi desenhado for maior ou igual ao intervalo desejado.
         antes = agora - (diferencaTempo % intervaloEntreFrames);
         contexto.clearRect(0, 0, larguraJanela, alturaJanela);//Limpa o "frame" anterior.
         movimentarParticulas();//Desenha o próximo "frame".    
      }
   }

   function mudarTamanhoCanvas() {//Muda o tamanho do canvas para o mesmo tamanho da janela.
      particulas.width = larguraJanela;
      particulas.height = alturaJanela;
   }

   function desfocarParticulas() {
      let tempoTransicao = valorAleatorio(1, 10);
      let tempoEsperar = valorAleatorio(0.6, 10);
      let desfoque = valorAleatorio(0.8, 5.5);
      particulas.style.transition = "filter " + tempoTransicao + "s linear";
      setTimeout(() => {
         particulas.style.filter = "blur(" + desfoque + "px)";
         setTimeout(() => {
            focarParticulas();
         }, (tempoTransicao * 1000) + (tempoEsperar * 1000));
      }, 1);

      function focarParticulas() {
         tempoTransicao = valorAleatorio(1, 10);
         tempoEsperar = valorAleatorio(0.6, 10);
         particulas.style.transition = "filter " + tempoTransicao + "s linear";
         setTimeout(() => {
            particulas.style.filter = "blur(0px)";
            setTimeout(() => {
               desfocarParticulas();
            }, (tempoTransicao * 1000) + (tempoEsperar * 1000));
         }, 1);
      }
   }

   setTimeout(()=>{
      desfocarParticulas();
   }, 4500);

   function valorAleatorio(numMinimo, numMaximo) {//Retorna um número float aleatório entre "numMinimo" e "numMaximo".
      return Math.random() * (numMaximo - numMinimo) + numMinimo;
   }
};