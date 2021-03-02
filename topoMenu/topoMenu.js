import { delay, throttle, getElement, getAllElements, setStyle, loadFile } from "../js/utils.js";

const loadTopMenu = async () => {
    const htmlMenu = await loadFile("./topoMenu/menuTopo.html");
    if (htmlMenu) {
        document.head.insertAdjacentHTML("beforeend", "<link rel='stylesheet' href='topoMenu/topoMenu.css'>");
        document.body.insertAdjacentHTML("afterbegin", await htmlMenu.text());
    } else { window.location.reload(); }
}

export default async function topMenuObject(changeMenu = true, initialTheme = 1) {
    await loadTopMenu();
    let scrollBody = 0;
    const menuBar = getElement("topoMenu");
    const bttLogo = getElement("bttLogoMenu");
    const bttSeta = getElement("bttSeta");
    const bttMenu = getElement("bttMenuOpcoesMenu2");
    const changeTheme = numTheme =>
        menuBar.classList.replace(...(numTheme === 1 ? ["topoMenu2", "topoMenu1"] : ["topoMenu1", "topoMenu2"]));
    const onClickBttSeta = (() => {
        let opened = false;
        return (open = null) => {
            opened = open !== null ? open : !opened;
            bttSeta.classList.replace(...(opened ? ["inicioBttSeta", "mudaBttSeta"] :
                ["mudaBttSeta", "inicioBttSeta"]));
        }
    })();
    bttSeta.addEventListener("click", onClickBttSeta.bind(null, null));
    bttSeta.addEventListener("mouseleave", onClickBttSeta.bind(null, false));
    const onClickBttMenu = (() => {
        let opened = false;
        return (open = null) => {
            opened = open !== null ? open : !opened;
            bttMenu.classList.replace(...(opened ? ["opcoesMenu2Fechado", "opcoesMenu2Aberto"] :
                ["opcoesMenu2Aberto", "opcoesMenu2Fechado"]));
        }
    })();
    getElement("tracosBttMenuOpcoesMenu2").addEventListener("click", onClickBttMenu.bind(null, null));
    getElement("fundomenu").addEventListener("mouseleave", onClickBttMenu.bind(null, false));

    const scrollMenu = () => {
        scrollBody = document.body.scrollTop || document.documentElement.scrollTop;
        if (scrollBody > 5) { changeTheme(2); }
        else { changeTheme(1); }
    }
    const screenResize = () => {
        if (window.innerWidth > 650) { onClickBttMenu(false); }
    }
    changeTheme(initialTheme);
    window.addEventListener("resize", screenResize);
    if (changeMenu) { window.addEventListener("scroll", scrollMenu); }
    await delay(400);
    return {
        changeTheme,
        logoClick(functionClick) {
            bttLogo.addEventListener("click", functionClick);
            return this;
        }
    }
}