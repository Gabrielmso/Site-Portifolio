import { getElement, setStyle } from "../js/utils.js";

export default function notificationsObject() {
    const status = { type: "", opened: false, mouseInWindow: false, timeToClose: 0 }, timeTransition = 360,
        bttsFunctions = { btt1: () => { }, btt2: () => { } },
        contentWindow = getElement("contentNotificacao"), window = getElement("notificacao"),
        title = getElement("tituloNotificacao"), text = getElement("textoNotificacao"),
        buttons = { btt1: getElement("bttNotificacao1"), btt2: getElement("bttNotificacao2") },
        showTransition = () => {
            setStyle(window, { transition: "none", opacity: "0", bottom: `-${window.offsetHeight + 10}px` });
            setTimeout(() => setStyle(window, { transition: null, opacity: "1", bottom: "10px" }), 7);
        },
        hideTransition = () => {
            setStyle(window, { opacity: "0", bottom: `-${window.offsetHeight + 10}px` });
            contentWindow.classList.remove("applyBackDropBlur");
            setTimeout(() => setStyle(contentWindow, { display: null }), timeTransition);
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
            confirm({ function: fn }) {
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
            notify({ time }) {
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
        }

    return {
        open(properties, content) {
            title.innerText = content.title;
            text.innerText = content.text;
            status.type = properties.name;
            modeType[status.type](properties);
            addEventsToElements();
            setStyle(contentWindow, { display: "block" });
            setTimeout(() => contentWindow.classList.add("applyBackDropBlur"), 7);
            showTransition();
            status.opened = true;
        }
    }
}