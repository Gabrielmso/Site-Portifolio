import loadTopoMenu from "../topoMenu/topoMenu.js";
import { throttle } from "../js/geral.js";

let topoMenu;

function animationScrollTop(element, scrollValue, time) {
    const frameTime = 16, deltaScrollValue = scrollValue - element.scrollTop;
    const numberFrames = time / frameTime, addScrollValue = deltaScrollValue / numberFrames;
    let animate = requestAnimationFrame(animation, element), now, before = 0;
    function animation() {
        now = performance.now();
        const deltaTime = now - before;
        if (deltaTime >= frameTime) {
            element.scrollTop += addScrollValue;
            if (element.scrollTop === scrollValue) {
                cancelAnimationFrame(animate);
                return;
            }
            before = now;
        }
        animate = requestAnimationFrame(animation, element);
    }
}

function homeFunctions() {
    let topo = true;
    const topoApresentacao = document.getElementById("topoApresentacao"),
        sobreMim = document.getElementById("sobreMim"),
        imgFundos = [document.getElementById("imgFundo"),
        document.getElementById("imgFundoBlur")],
        txt1 = document.getElementById("txt1"),
        txt2 = document.getElementById("txt2"),
        txt3 = document.getElementById("txt3"),
        txt4 = document.getElementById("txt4"),
        bttSobreMim = document.getElementById("bttSobreMim");

    topoApresentacao.style.display = "block";
    sobreMim.style.display = "block";
    setTimeout(carregamento, 1200);

    window.addEventListener("resize", function () {
        if (!topo) { document.documentElement.scrollTop = window.innerHeight; }
    });

    document.addEventListener("scroll", throttle(function () {
        if ((document.body.scrollTop || document.documentElement.scrollTop) > window.innerHeight / 2) {
            imgFundos[1].style.opacity = "1";
            imgFundos[0].style.opacity = "0.75";
            topo = false;
        } else {
            imgFundos[1].style.opacity = "0";
            imgFundos[0].style.opacity = "0.55";
            topo = true;
        }
    }, 120, true));

    topoMenu.logo.addEventListener("click", function () {
        if ((document.body.scrollTop || document.documentElement.scrollTop) > 3) {
            animationScrollTop(document.documentElement, 0, 450);
        } else { window.location.href = "index.html"; }
    });

    bttSobreMim.addEventListener("click", () => animationScrollTop(document.documentElement, window.innerHeight, 450))

    function carregamento() {
        txt1.style.opacity = "1";
        setTimeout(function () {
            txt2.style.opacity = "1";
            txt2.style.marginLeft = "8px";
            setTimeout(function () {
                txt3.style.opacity = "1";
                setTimeout(function () {
                    txt3.style.borderBottom = "2px solid rgba(255, 255, 255, 0.302)";
                    setTimeout(function () {
                        txt4.style.opacity = "1";
                        bttSobreMim.style.display = "block";
                        setTimeout(function () {
                            bttSobreMim.style.opacity = "1";
                        }, 800);
                    }, 1500);
                }, 500);
            }, 1100);
        }, 1000);
    }
}

export async function home() {
    topoMenu = await loadTopoMenu();
    if (topoMenu) {
        homeFunctions();
        return true;
    }
    return false;
}