function particles() {
   const ctx = document.getElementById("particulas").getContext("2d"), lineDistance = 200;
   let arrayParticles, startAnimation;
   window.addEventListener("resize", () => {
      start();
   });
   start();
   blurParticles();

   function moveParticles() {
      for (let i = 0, n = arrayParticles.length; i < n; i++) {
         const particle = arrayParticles[i];
         if (particle.pos.x + particle.radius >= window.innerWidth || particle.pos.x - particle.radius <= 0) {
            particle.vel.x = -particle.vel.x;
         } else if (particle.pos.y + particle.radius >= window.innerHeight || particle.pos.y - particle.radius <= 0) {
            particle.vel.y = -particle.vel.y;
         }
         for (let e = 0; e < n; e++) {
            if (e === i) { continue; }
            const particle2 = arrayParticles[e], distance = getDistanceCoordinates(particle.pos, particle2.pos);
            if (distance <= lineDistance) {
               drawLine(particle.pos, particle2.pos, ((lineDistance - distance) / lineDistance), false);
               if (distance <= particle.radius + particle2.radius) { collision(particle, particle2); }
            }
         }
         particle.pos.y += particle.vel.y;
         particle.pos.x += particle.vel.x;
         ctx.drawImage(particle.circle.canvas, particle.pos.x - particle.mid, particle.pos.y - particle.mid);
      }

   }

   function drawLine(point1, point2, opacity, backLine) {
      ctx.beginPath();
      ctx.strokeStyle = "rgba(255, 255, 255, " + opacity + ')';
      ctx.moveTo(point1.x, point1.y);
      ctx.lineTo(point2.x, point2.y);
      if (backLine) { ctx.lineTo(point1.x, point1.y); }
      ctx.stroke();
   }

   function collision(particle1, particle2) {
      const deltaVelocityX = particle1.vel.x - particle2.vel.x, deltaVelocityY = particle1.vel.y - particle2.vel.y,
         dx = particle2.pos.x - particle1.pos.x, dy = particle2.pos.y - particle1.pos.y;
      if (deltaVelocityX * dx + deltaVelocityY * dy >= 0) {
         const angle = -Math.atan2(dy, dx), m1 = particle1.radius, m2 = particle2.radius,
            u1 = rotate(particle1.vel.x, particle1.vel.y, angle),
            u2 = rotate(particle2.vel.x, particle2.vel.y, angle),
            v1 = { x: u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2), y: u1.y },
            v2 = { x: u2.x * (m1 - m2) / (m1 + m2) + u1.x * 2 * m2 / (m1 + m2), y: u2.y },
            vFinal1 = rotate(v1.x, v1.y, -angle), vFinal2 = rotate(v2.x, v2.y, -angle);
         particle1.vel = { x: vFinal1.x - (vFinal1.x / 50), y: vFinal1.y - (vFinal1.y / 50) };
         particle2.vel = { x: vFinal2.x - (vFinal2.x / 50), y: vFinal2.y - (vFinal2.y / 50) };
      }
      function rotate(desX, desY, angle) {
         return {
            x: desX * Math.cos(angle) - desY * Math.sin(angle), y: desX * Math.sin(angle) + desY * Math.cos(angle)
         };
      }
   }

   function getDistanceCoordinates(point1, point2) {
      return ((point2.x - point1.x) ** 2 + (point2.y - point1.y) ** 2) ** 0.5;
   }

   function start() {
      cancelAnimationFrame(startAnimation);
      setResolutionCtx(window.innerWidth, window.innerHeight);
      ctx.lineWidth = 0.95;
      arrayParticles = createParticles(Math.round(window.innerWidth * window.innerHeight / 26500));
      startAnimation = requestAnimationFrame(animation, ctx.canvas);;
   }

   let now, before = 0;
   function animation() {
      now = performance.now();
      const deltaTime = now - before;
      if (deltaTime >= 62) {
         before = now;
         ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
         moveParticles();
      }
      setTimeout(() => startAnimation = requestAnimationFrame(animation, ctx.canvas), 27);
   }

   function setResolutionCtx(width, height) {
      ctx.canvas.width = width;
      ctx.canvas.height = height;
   }

   function blurParticles() {
      let tempoTransicao = randomNumber(1, 10);
      let tempoEsperar = randomNumber(0.5, 4);
      let desfoque = randomNumber(0.8, 4);
      ctx.canvas.style.transition = "filter " + tempoTransicao + "s linear";
      setTimeout(() => {
         ctx.canvas.style.filter = "blur(" + desfoque + "px)";
         setTimeout(() => {
            focusParticles();
         }, (tempoTransicao * 1000) + (tempoEsperar * 1000));
      }, 1);

      function focusParticles() {
         tempoTransicao = randomNumber(1, 10);
         tempoEsperar = randomNumber(5, 15);
         ctx.canvas.style.transition = "filter " + tempoTransicao + "s linear";
         setTimeout(() => {
            ctx.canvas.style.filter = "blur(0px)";
            setTimeout(() => {
               blurParticles();
            }, (tempoTransicao * 1000) + (tempoEsperar * 1000));
         }, 1);
      }
   }
}

function createParticles(numParticles) {
   const particles = [];
   for (let i = 0; i < numParticles; i++) { particles.push(getParticle()); }
   function getParticle() {
      const radius = randomNumber(1.4, 9), circle = drawCircle(),
         posX = randomNumber(radius, window.innerWidth - radius),
         posY = randomNumber(radius, window.innerHeight - radius),
         velX = randomNumber(-0.6, 0.6), velY = randomNumber(-0.6, 0.6);

      function drawCircle() {
         const ctxCircle = document.createElement("canvas").getContext("2d"),
            size = Math.ceil((radius + 1) * 2);
         ctxCircle.canvas.width = ctxCircle.canvas.height = size;
         ctxCircle.arc(size / 2, size / 2, radius, 0, 2 * Math.PI, true);
         ctxCircle.fillStyle = "rgb(255, 255, 255)";
         ctxCircle.fill();
         return ctxCircle;
      }
      return {
         id: particles.length, circle, radius, mid: circle.canvas.width / 2, pos: { x: posX, y: posY },
         vel: { x: velX, y: velY }
      }
   }
   return particles;
}

function randomNumber(min, max) { return Math.random() * (max - min) + min; }