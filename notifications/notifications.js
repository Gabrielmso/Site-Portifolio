import { delay, getElement, setStyle, openWindowBackgroundBlur } from "../js/utils.js";

const loadNotifications = () => {
    document.head.insertAdjacentHTML("beforeend",
        `<link rel="stylesheet" href="notifications/notifications.css">`);

    document.body.insertAdjacentHTML("beforeend",
        `<section data-id="contentNotificacao" class= "noSelection" >
            <div data-id="notificacao">
                <div data-id="tituloJanelaNotificacao" class="noSelection">
                    <p data-id="tituloNotificacao"></p>
                </div>
                <div data-id="conteudoNotificacao">
                    <p data-id="textoNotificacao" class="noSelection"></p>
                </div>
                <div data-id="bttsNotificacao">
                    <button data-id="bttNotificacao1" class="cursor noSelection"></button>
                    <button data-id="bttNotificacao2" class="cursor noSelection"></button>
                </div>
            </div>
        </section>`);
}

export default function notificationMethods() {
    loadNotifications();
    const status = { type: "", opened: false, mouseInWindow: false, timeToClose: 0 }, timeTransition = 330,
        bttsFunctions = { btt1: () => { }, btt2: () => { } },
        contentWindow = getElement("contentNotificacao"), window = getElement("notificacao"),
        elTitle = getElement("tituloNotificacao"), text = getElement("textoNotificacao"),
        buttons = { btt1: getElement("bttNotificacao1"), btt2: getElement("bttNotificacao2") },
        showTransition = async () => {
            setStyle(window, { transition: "none", opacity: "0", bottom: "-" + (window.offsetHeight + 10) + "px" });
            await delay(10);
            setStyle(window, { transition: null, opacity: "1", bottom: "10px" });
        },
        hideTransition = async () => {
            setStyle(window, { opacity: "0", bottom: `-${window.offsetHeight + 10}px` });
            await openWindowBackgroundBlur(contentWindow, false);
        },
        mouseDownContentShowTransition = e => {
            if (e.currentTarget === e.target) { showTransition(); }
        },
        mouseEnterNotification = () => status.mouseInWindow = true,
        mouseleaveNotification = () => {
            status.mouseInWindow = false;
            if (status.type === "notify") {
                setTimeout(close, 500);
            }
        },
        addEventsToElements = () => {
            contentWindow.addEventListener("mousedown", mouseDownContentShowTransition);
            window.addEventListener("mouseenter", mouseEnterNotification);
            window.addEventListener("mouseleave", mouseleaveNotification);
            buttons.btt1.addEventListener("mousedown", bttsFunctions.btt1);
            buttons.btt2.addEventListener("mousedown", bttsFunctions.btt2);
        },
        removeEventsToElements = () => {
            contentWindow.removeEventListener("mousedown", mouseDownContentShowTransition);
            window.removeEventListener("mouseenter", mouseEnterNotification);
            window.removeEventListener("mouseleave", mouseleaveNotification);
            buttons.btt1.removeEventListener("mousedown", bttsFunctions.btt1);
            buttons.btt2.removeEventListener("mousedown", bttsFunctions.btt2);
        },
        close = () => {
            if (!status.opened || status.mouseInWindow && status.type === "notify") { return; }
            clearTimeout(status.timeToClose);
            status.opened = status.mouseInWindow = false;
            removeEventsToElements();
            hideTransition();
        },
        modeType = {
            confirm({ functionConfirm: fn }) {
                setStyle(window, { backgroundColor: "rgba(25, 5, 125, 0.9)" });
                setStyle(buttons.btt2, { display: "block" });
                buttons.btt1.textContent = "Sim";
                buttons.btt2.textContent = "Não";
                bttsFunctions.btt1 = () => {
                    close();
                    setTimeout(fn, timeTransition);
                }
                bttsFunctions.btt2 = close;
            },
            notify({ timeNotify: time }) {
                setStyle(window, { backgroundColor: "rgba(145, 5, 5, 0.9)" });
                setStyle(buttons.btt2, { display: "none" });
                buttons.btt1.textContent = "Ok";
                bttsFunctions.btt1 = () => {
                    status.type = "";
                    close();
                }
                bttsFunctions.btt2 = () => { };
                status.timeToClose = setTimeout(close, time + timeTransition);
            }
        },
        open = ({
            type = "notify",
            title = "Aviso!",
            message = "",
            functionConfirm = () => { },
            timeNotify = 3000
        }) => {
            elTitle.innerText = title;
            text.innerText = message;
            status.type = type;
            modeType[status.type]({ functionConfirm, timeNotify });
            addEventsToElements();
            showTransition();
            openWindowBackgroundBlur(contentWindow, true);
            status.opened = true;
        }

    return { open }
}