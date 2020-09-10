import { throttle } from "../js/geral.js";

function topMenuObject() {
    return {
        changeMenu: true,
        scrollBody: 0,
        menu: document.getElementById("menu"),
        logo: document.getElementById("logoBlack"),
        categories: document.getElementsByClassName("opcaomenu"),
        menuIcon: {
            btt: document.getElementById("iconemenublack"),
            traces: [document.getElementById("traco1"),
            document.getElementById("traco2"),
            document.getElementById("traco3")],
            lateralMenu: document.getElementById("fundomenu"),
            focus: false,
            actionAnimation() {
                const oldClass = this.focus ? "movertraco" : "iniciotraco",
                    newClass = this.focus ? "iniciotraco" : "movertraco";
                for (let i = 1; i <= this.traces.length; i++) {
                    const oldClassName = oldClass + i, newClassName = newClass + i;
                    this.traces[i - 1].classList.replace(oldClassName, newClassName);
                }
                const oldClassMenu = this.focus ? "abrefundomenu" : "fechafundomenu",
                    newClassMenu = this.focus ? "fechafundomenu" : "abrefundomenu";
                this.lateralMenu.classList.replace(oldClassMenu, newClassMenu);
                this.focus = !this.focus;
            },
            resizeMenu() {
                this.lateralMenu.style.height = window.innerHeight + "px";
            }
        },
        downArrow: {
            btt: document.getElementById("submenu"),
            icon: document.getElementById("iconesetablack"),
            traces: [document.getElementById("tracoseta1"),
            document.getElementById("tracoseta2"),
            document.getElementById("tracoseta3"),
            document.getElementById("tracoseta4")],
            contentDrop: document.getElementById("socials"),
            focus: false,
            actionAnimation() {
                const oldClass = this.focus ? "movertracoseta" : "iniciotracoseta",
                    newClass = this.focus ? "iniciotracoseta" : "movertracoseta";
                for (let i = 0; i < this.traces.length; i++) {
                    const oldClassName = oldClass + i, newClassName = newClass + i;
                    this.traces[i].classList.replace(oldClassName, newClassName);
                }
                const newHeight = this.focus ? "0px" : "200px";
                this.contentDrop.style.height = newHeight;
                this.focus = !this.focus;
            },
        },
        changeTheme(top) {
            if (this.downArrow.focus) { this.downArrow.actionAnimation(); }
            if (this.menuIcon.focus) { this.menuIcon.actionAnimation(); }
            if (!this.changeMenu) { return; }
            if (!top) {
                this.menu.classList.replace("iniciomenu", "mudamenu");
                this.logo.classList.replace("iniciologoBlack", "mudalogoBlack");
                this.downArrow.icon.classList.remove("inicioiconeblack");
                for (let i = 0; i < this.categories.length; i++) {
                    this.categories[i].classList.replace("inicioopcoes", "mudaopcoes");
                }
            } else {
                this.menu.classList.replace("mudamenu", "iniciomenu");
                this.logo.classList.replace("mudalogoBlack", "iniciologoBlack");
                this.downArrow.icon.classList.add("inicioiconeblack");
                for (let i = 0; i < this.categories.length; i++) {
                    this.categories[i].classList.replace("mudaopcoes", "inicioopcoes");
                }
            }
        },
        scrollMenu() {
            this.scrollBody = document.body.scrollTop || document.documentElement.scrollTop;
            if (this.scrollBody > 5) { this.changeTheme(false); }
            else { this.changeTheme(true); }
        },
        screenResize() {
            this.menuIcon.resizeMenu();
            if (!this.changeMenu) { return; }
            if (this.scrollBody > 5) {
                this.menu.classList.replace("iniciomenu", "mudamenu");
                this.logo.classList.replace("iniciologoBlack", "mudalogoBlack");
            } else {
                this.menu.classList.replace("mudamenu", "iniciomenu");
                this.logo.classList.replace("mudalogoBlack", "iniciologoBlack");
            }
            if (window.innerWidth > 650) {
                if (this.menuIcon.focus) { this.menuIcon.actionAnimation(); }
            }
        },
        addEventsToElements() {
            this.menuIcon.btt.addEventListener("mousedown", () => this.menuIcon.actionAnimation());
            this.downArrow.btt.addEventListener("mousedown", () => this.downArrow.actionAnimation());
            this.downArrow.btt.addEventListener("mouseleave", () => { if (this.downArrow.focus) { this.downArrow.actionAnimation(); } });
            window.addEventListener("resize", () => this.screenResize());
            window.addEventListener("scroll", throttle(() => this.scrollMenu(), 110, true));
        },
        init() {
            this.addEventsToElements();
            this.screenResize();
        },
    }
}

function callTopMenuObject() {
    const topMenu = new topMenuObject();
    topMenu.init();
    return topMenu;
}

function loadFile(url) {
    return new Promise((resolve) => {
        const request = new XMLHttpRequest();
        request.onload = function () {
            if (this.status === 200) { resolve(this.response); }
            resolve(false);
        }
        request.open("GET", url, true);
        request.send(null);
    });
}

export default async function loadTopoMenu() {
    const HTMLcontent = await loadFile("./menuTopo.html");
    if (HTMLcontent) {
        document.body.insertAdjacentHTML("afterbegin", HTMLcontent.toString());
        return callTopMenuObject();
    }
    return false;
}