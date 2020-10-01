import { cloneReplaceElement, getElement, setStyle } from "../js/geral.js";

export default function notificationsObject() {
    const status = { type: "", opened: false, mouseInWindow: false }, timeTransition = 360,
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
        close = () => {
            if (!status.opened || status.mouseInWindow && status.type === "notify") { return; }
            status.opened = false;
            buttons.btt1 = cloneReplaceElement(buttons.btt1);
            buttons.btt2 = cloneReplaceElement(buttons.btt2);
            hideTransition();
        },
        modeType = {
            confirm(properties) {
                setStyle(window, { backgroundColor: "rgba(25, 5, 125, 0.9)" });
                setStyle(buttons.btt2, { display: "block" });
                buttons.btt1.textContent = "Sim";
                buttons.btt2.textContent = "Não";
                buttons.btt1.addEventListener("mousedown", () => {
                    close();
                    setTimeout(properties.function, timeTransition);
                });
                buttons.btt2.addEventListener("mousedown", close);
            },
            notify(properties) {
                setStyle(window, { backgroundColor: "rgba(145, 5, 5, 0.9)" });
                setStyle(buttons.btt2, { display: "none" });
                buttons.btt1.textContent = "Ok";
                buttons.btt1.addEventListener("mousedown", () => {
                    status.type = "";
                    close();
                });
                setTimeout(close, properties.time + timeTransition);
            }
        }

    return {
        addEventsToElements() {
            contentWindow.addEventListener("mousedown", (e) => {
                if (e.currentTarget === e.target) { showTransition(); }
            });
            window.addEventListener("mouseenter", () => status.mouseInWindow = true);
            window.addEventListener("mouseleave", () => {
                status.mouseInWindow = false;
                if (status.type === "notify") { setTimeout(close, 500); }
            });
            delete this.addEventsToElements;
        },
        open(properties, content) {
            title.innerText = content.title;
            text.innerText = content.text;
            status.opened = true;
            setStyle(contentWindow, { display: "block" })
            setTimeout(() => contentWindow.classList.add("applyBackDropBlur"), 7);
            showTransition();
            status.type = properties.name;
            modeType[status.type](properties);
        }
    }
}