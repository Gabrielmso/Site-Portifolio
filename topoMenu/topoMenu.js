import { throttle, getElement, getAllElements, setStyle, loadFile } from "../js/utils.js";

const loadTopMenu = async () => {
    const htmlMenu = await loadFile("./topoMenu/menuTopo.html");
    if (htmlMenu) {
        document.head.insertAdjacentHTML("beforeend", '<link rel="stylesheet" href="topoMenu/topoMenu.css">');
        document.body.insertAdjacentHTML("afterbegin", await htmlMenu.text());
    } else { window.location.reload(); }
}

export default async function topMenuObject(changeMenu = true, initialTheme = 1) {
    await loadTopMenu();
    let scrollBody = 0;
    const menu = getElement("menu"), logo = getElement("logoBlack"), categories = getAllElements("opmenu"),
        menuIcon = {
            btt: getElement("bttmenu"), traces: getAllElements("tracomenu"), lateralMenu: getElement("fundomenu"),
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
                setStyle(this.lateralMenu, { height: window.innerHeight + "px" });
            }
        }, downArrow = {
            btt: getElement("submenu"), icon: getElement("bttseta"),
            traces: getAllElements("tracoseta"),
            contentDrop: getElement("socials"),
            focus: false,
            actionAnimation() {
                const oldClass = this.focus ? "movertracoseta" : "iniciotracoseta",
                    newClass = this.focus ? "iniciotracoseta" : "movertracoseta";
                for (let i = 0; i < this.traces.length; i++) {
                    const oldClassName = oldClass + i, newClassName = newClass + i;
                    this.traces[i].classList.replace(oldClassName, newClassName);
                }
                const newHeight = this.focus ? "0px" : "200px";
                setStyle(this.contentDrop, { height: newHeight });
                this.focus = !this.focus;
            }
        }, changeTheme = numTheme => {
            if (downArrow.focus) { downArrow.actionAnimation(); }
            if (menuIcon.focus) { menuIcon.actionAnimation(); }
            if (numTheme === 2) {
                menu.classList.replace("iniciomenu", "mudamenu");
                logo.classList.replace("iniciologoBlack", "mudalogoBlack");
                downArrow.icon.classList.remove("inicioiconeblack");
                for (let i = 0; i < categories.length; i++) {
                    categories[i].classList.replace("inicioopcoes", "mudaopcoes");
                }
            } else if (numTheme === 1) {
                menu.classList.replace("mudamenu", "iniciomenu");
                logo.classList.replace("mudalogoBlack", "iniciologoBlack");
                downArrow.icon.classList.add("inicioiconeblack");
                for (let i = 0; i < categories.length; i++) {
                    categories[i].classList.replace("mudaopcoes", "inicioopcoes");
                }
            }
        }, scrollMenu = throttle(() => {
            scrollBody = document.body.scrollTop || document.documentElement.scrollTop;
            if (scrollBody > 5) { changeTheme(2); }
            else { changeTheme(1); }
        }, 110),
        screenResize = () => {
            if (scrollBody > 5) {
                menu.classList.replace("iniciomenu", "mudamenu");
                logo.classList.replace("iniciologoBlack", "mudalogoBlack");
            } else {
                menu.classList.replace("mudamenu", "iniciomenu");
                logo.classList.replace("mudalogoBlack", "iniciologoBlack");
            }
            if (window.innerWidth > 650) {
                if (menuIcon.focus) { menuIcon.actionAnimation(); }
            }
        },
        addChangeThemeMenuEvents = async () => {
            window.addEventListener("resize", screenResize);
            window.addEventListener("scroll", scrollMenu);
        },
        removeChangeThemeMenuEvents = async () => {
            window.removeEventListener("resize", screenResize);
            window.removeEventListener("scroll", scrollMenu);
        }

    changeTheme(initialTheme);
    if (changeMenu) {
        screenResize();
        addChangeThemeMenuEvents();
    } else {
        setStyle(menu, { transition: "none" });
    }

    window.removeEventListener("resize", () => menuIcon.resizeMenu());
    menuIcon.btt.addEventListener("mousedown", () => menuIcon.actionAnimation());
    downArrow.btt.addEventListener("mousedown", () => downArrow.actionAnimation());
    downArrow.btt.addEventListener("mouseleave", () => { if (downArrow.focus) { downArrow.actionAnimation(); } });

    menuIcon.resizeMenu();

    return {
        changeTheme, change: change => {
            if (change) {
                addChangeThemeMenuEvents();
                setStyle(menu, { transition: null });
            } else {
                removeChangeThemeMenuEvents();
                setStyle(menu, { transition: "none" });
            }
        },
        logoClick(functionClick) {
            logo.addEventListener("click", functionClick);
            return this;
        }
    }
}