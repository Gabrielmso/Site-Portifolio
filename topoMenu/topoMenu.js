let arrayop = [];//Declarada aqui para usar em outros arquivos JS.
let logoBlack;
let scrollposicao;
function topoMenu() {
    const iconemenublack = document.getElementById("iconemenublack"),
        iconesetablack = document.getElementById("iconesetablack"),
        opcoesmenu2 = document.getElementById("opcoesmenu2"),
        fundomenu = document.getElementById("fundomenu"),
        menu = document.getElementById("menu"),
        submenu = document.getElementById("submenu"),
        socials = document.getElementById("socials"),
        traco1 = document.getElementById("traco1"),
        traco2 = document.getElementById("traco2"),
        traco3 = document.getElementById("traco3");

    logoBlack = document.getElementById("logoBlack");//Cada pagina terá de conter um arquivo de script com o evento click individual.

    const arraytracoseta = [document.getElementById("tracoseta1"),
    document.getElementById("tracoseta2"),
    document.getElementById("tracoseta3"),
    document.getElementById("tracoseta4")];

    arrayop = [document.getElementById("op1"),
    document.getElementById("op2"),
    document.getElementById("op3"),
    document.getElementById("op4")];

    scrollposicao = document.body.scrollTop || document.documentElement.scrollTop;

    redimencionarjanela();

    telamenor651px();

    window.addEventListener("resize", function () {
        $(socials).slideUp("fast");

        iconesetablacknormal();

        redimencionarjanela();

        telamenor651px();
    });

    window.addEventListener("scroll", throttle(function () {
        scrollposicao = document.body.scrollTop || document.documentElement.scrollTop;;

        iconesetablacknormal();

        $(socials).slideUp("fast");

        if (scrollposicao > 5) {
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
    }, 110, true));

    iconesetablack.addEventListener("click", function () {
        $(socials).slideToggle(150);
        if (arraytracoseta[0].classList.contains("movertracoseta0") == true) {
            iconesetablacknormal();
        }
        else {
            for (let i = 0; i < arraytracoseta.length; i++) {
                let nomeclasseinicio = "iniciotracoseta" + i;
                let nomeclassemuda = "movertracoseta" + i;
                arraytracoseta[i].classList.remove(nomeclasseinicio);
                arraytracoseta[i].classList.add(nomeclassemuda);
            }
        }
    });

    submenu.addEventListener("mouseleave", function () {
        $(socials).slideUp("fast");
        iconesetablacknormal();
    });

    iconemenublack.addEventListener("click", function () {
        acaobotaomenu();
    });

    function iconesetablacknormal() {
        for (let i = 0; i < arraytracoseta.length; i++) {
            let nomeclasseinicio = "iniciotracoseta" + i;
            let nomeclassemuda = "movertracoseta" + i;
            arraytracoseta[i].classList.remove(nomeclassemuda);
            arraytracoseta[i].classList.add(nomeclasseinicio);
        }
    }

    function acaobotaomenu() {
        if (fundomenu.classList.contains("fechafundomenu") == true) {
            //Abrir o menu e fazer a "animação" do "iconemenublack".
            fundomenu.classList.remove("fechafundomenu");
            fundomenu.classList.add("abrefundomenu");
            traco1.classList.remove("iniciotraco1");
            traco1.classList.add("movertraco1");
            traco2.classList.add("movertraco2");
            traco3.classList.remove("iniciotraco3");
            traco3.classList.add("movertraco3");
        }
        else {
            fundomenu.classList.remove("abrefundomenu");
            fundomenu.classList.add("fechafundomenu");
            traco1.classList.remove("movertraco1");
            traco1.classList.add("iniciotraco1");
            traco2.classList.remove("movertraco2");
            traco3.classList.remove("movertraco3");
            traco3.classList.add("iniciotraco3");
        };
    };

    function telamenor651px() {
        if (scrollposicao > 5) {
            menu.classList.remove("iniciomenu");
            menu.classList.add("mudamenu");
            logoBlack.classList.remove("iniciologoBlack");
            logoBlack.classList.add("mudalogoBlack");
        }
        else {
            menu.classList.remove("mudamenu");
            menu.classList.add("iniciomenu");
            logoBlack.classList.remove("mudalogoBlack");
            logoBlack.classList.add("iniciologoBlack");
        }

        if (window.innerWidth > 650) {
            logoBlack.style.left = "0px";
            fundomenu.classList.remove("abrefundomenu");
            fundomenu.classList.add("fechafundomenu");
            traco1.classList.remove("movertraco1");
            traco1.classList.add("iniciotraco1");
            traco2.classList.remove("movertraco2");
            traco3.classList.remove("movertraco3");
            traco3.classList.add("iniciotraco3");
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