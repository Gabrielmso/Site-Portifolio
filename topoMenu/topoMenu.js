let arrayop = [];
let logoBlack;
let scrollposicao;
let mudarMenu = true;
let iconemenublack, iconesetablack, opcoesmenu2, fundomenu, menu, submenu, socials, traco1, traco2, traco3;
function topoMenu() {
    iconemenublack = document.getElementById("iconemenublack");
    iconesetablack = document.getElementById("iconesetablack");
    opcoesmenu2 = document.getElementById("opcoesmenu2");
    fundomenu = document.getElementById("fundomenu");
    menu = document.getElementById("menu");
    submenu = document.getElementById("submenu");
    socials = document.getElementById("socials");
    traco1 = document.getElementById("traco1");
    traco2 = document.getElementById("traco2");
    traco3 = document.getElementById("traco3");
    logoBlack = document.getElementById("logoBlack");//Cada pagina terá de conter um arquivo de script com o evento click individual.

    const arraytracoseta = [document.getElementById("tracoseta1"),
    document.getElementById("tracoseta2"),
    document.getElementById("tracoseta3"),
    document.getElementById("tracoseta4")];

    let clickSocials = false;

    arrayop = [document.getElementById("op1"),
    document.getElementById("op2"),
    document.getElementById("op3"),
    document.getElementById("op4")];

    scrollposicao = document.body.scrollTop || document.documentElement.scrollTop;

    redimencionarjanela();
    telamenor651px();

    window.addEventListener("resize", function () {
        if (clickSocials === true) {
            clickSocials = false;
            socials.style.height = "0px";
            iconesetablacknormal();
        }
        redimencionarjanela();
        telamenor651px();
    });

    window.addEventListener("scroll", throttle(function () {
        scrollposicao = document.body.scrollTop || document.documentElement.scrollTop;
        if (clickSocials === true) {
            clickSocials = false;
            socials.style.height = "0px";
            iconesetablacknormal();
        }
        if (scrollposicao > 5 && mudarMenu === true) {
            menu.classList.replace("iniciomenu", "mudamenu");
            logoBlack.classList.replace("iniciologoBlack", "mudalogoBlack");
            iconesetablack.classList.replace("inicioiconeblack", "mudaiconeblack");
            iconemenublack.classList.replace("inicioiconeblack", "mudaiconeblack");
            for (let i = 0; i < arrayop.length; i++) { arrayop[i].classList.replace("inicioopcoes", "mudaopcoes"); }
        }
        else {
            menu.classList.replace("mudamenu", "iniciomenu");
            logoBlack.classList.replace("mudalogoBlack", "iniciologoBlack");
            iconesetablack.classList.replace("mudaiconeblack", "inicioiconeblack");
            iconemenublack.classList.replace("mudaiconeblack", "inicioiconeblack");
            for (let i = 0; i < arrayop.length; i++) { arrayop[i].classList.replace("mudaopcoes", "inicioopcoes"); }
        }
    }, 110, true));

    iconesetablack.addEventListener("click", function () {
        if (clickSocials === true) {
            clickSocials = false;
            socials.style.height = "0px";
            iconesetablacknormal();
        }
        else {
            clickSocials = true;
            socials.style.height = "200px";
            for (let i = 0; i < arraytracoseta.length; i++) {
                let nomeclasseinicio = "iniciotracoseta" + i;
                let nomeclassemuda = "movertracoseta" + i;
                arraytracoseta[i].classList.replace(nomeclasseinicio, nomeclassemuda);
            }
        }
    });

    submenu.addEventListener("mouseleave", function () {
        if (clickSocials === true) {
            clickSocials = false;
            socials.style.height = "0px";
            iconesetablacknormal();
        }
    });

    iconemenublack.addEventListener("click", acaobotaomenu);

    function iconesetablacknormal() {
        for (let i = 0; i < arraytracoseta.length; i++) {
            let nomeclasseinicio = "iniciotracoseta" + i;
            let nomeclassemuda = "movertracoseta" + i;
            arraytracoseta[i].classList.replace(nomeclassemuda, nomeclasseinicio);
        }
    }

    function acaobotaomenu() {//Abrir o menu e fazer a "animação" do "iconemenublack".
        if (fundomenu.classList.contains("fechafundomenu") === true) {
            fundomenu.classList.replace("fechafundomenu", "abrefundomenu")
            traco1.classList.replace("iniciotraco1", "movertraco1");
            traco2.classList.add("movertraco2");
            traco3.classList.replace("iniciotraco3", "movertraco3");
        } 
        else {
            fundomenu.classList.replace("abrefundomenu", "fechafundomenu")
            traco1.classList.replace("movertraco1", "iniciotraco1");
            traco2.classList.remove("movertraco2");
            traco3.classList.replace("movertraco3", "iniciotraco3");
        }
    };

    function telamenor651px() {
        if (mudarMenu === true) {
            if (scrollposicao > 5) {
                menu.classList.replace("iniciomenu", "mudamenu");
                logoBlack.classList.replace("iniciologoBlack", "mudalogoBlack");
            }
            else {
                menu.classList.replace("mudamenu", "iniciomenu");
                logoBlack.classList.replace("mudalogoBlack", "iniciologoBlack");
            }

            if (window.innerWidth > 650) {
                logoBlack.style.left = "0px";
                fundomenu.classList.replace("abrefundomenu", "fechafundomenu")
                traco1.classList.replace("movertraco1", "iniciotraco1");
                traco2.classList.remove("movertraco2");
                traco3.classList.replace("movertraco3", "iniciotraco3");
            }
        }
    };
    function redimencionarjanela() {
        opcoesmenu2.style.height = (window.innerHeight - 50) + "px";
        fundomenu.style.height = (window.innerHeight * 2) + "px";
    };
};
// function debounce(func, wait, immediate) {
//     let timeout;
//     return function () {
//         let context = this, args = arguments;
//         let later = function () {
//             timeout = null;
//             if (!immediate) func.apply(context, args);
//         };
//         let callNow = immediate && !timeout;
//         clearTimeout(timeout);
//         timeout = setTimeout(later, wait);
//         if (callNow) func.apply(context, args);
//     };
// };

function throttle(func, wait, immediate) {
    let timeout = null
    let initialCall = true

    return function () {
        const callNow = immediate && initialCall
        const next = function () {
            func.apply(this, arguments)
            timeout = null
        }
        if (callNow) {
            initialCall = false
            next()
        }
        if (!timeout) {
            timeout = setTimeout(next, wait)
        }
    }
}