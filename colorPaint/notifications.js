import { cloneReplaceElement, elementById } from "../js/geral.js";

export default function notificationsObject() {
    const status = { type: "", opened: false, mouseInWindow: false }, timeTransition = 360,
        contentWindow = elementById("contentNotificacao"), window = elementById("notificacao"),
        title = elementById("tituloNotificacao"), text = elementById("textoNotificacao"),
        buttons = { btt1: elementById("bttNotificacao1"), btt2: elementById("bttNotificacao2") },
        showTransition = () => {
            window.style.transition = "none";
            window.style.opacity = "0";
            window.style.bottom = "-" + window.offsetHeight + "px";
            setTimeout(() => {
                window.style.transition = "";
                window.style.opacity = "1";
                window.style.bottom = "10px";
            }, 5);
        }, hideTransition = () => {
            window.style.opacity = "0";
            window.style.bottom = "-" + (window.offsetHeight + 10) + "px";
            contentWindow.classList.remove("applyBackDropBlur");
            setTimeout(() => {
                contentWindow.style.display = "none";
            }, timeTransition);
        }, close = () => {
            if (!status.opened || status.mouseInWindow && status.type === "notify") { return; }
            status.opened = false;
            buttons.btt1 = cloneReplaceElement(buttons.btt1);
            buttons.btt2 = cloneReplaceElement(buttons.btt2);
            hideTransition();
        }, modeType = {
            confirm(properties) {
                window.style.backgroundColor = "rgba(25, 5, 125, 0.9)";
                buttons.btt2.style.display = "block";
                buttons.btt1.innerText = "Sim";
                buttons.btt2.innerText = "Não";
                buttons.btt1.addEventListener("mousedown", () => {
                    close();
                    setTimeout(properties.function, timeTransition);
                });
                buttons.btt2.addEventListener("mousedown", close);
            },
            notify(properties) {
                window.style.backgroundColor = "rgba(145, 5, 5, 0.9)";
                buttons.btt2.style.display = "none";
                buttons.btt1.innerText = "Ok";
                buttons.btt1.addEventListener("mousedown", () => {
                    status.type = "";
                    close();
                });
                setTimeout(close, properties.time + timeTransition);
            }
        }

    return {
        addEventsToElements() {
            contentWindow.addEventListener("mousedown", () => {
                if (!status.mouseInWindow) { showTransition(); }
            });
            window.addEventListener("mouseenter", () => status.mouseInWindow = true);
            window.addEventListener("mouseleave", () => {
                status.mouseInWindow = false;
                if (status.type === "notify") { setTimeout(close, 400); }
            });
            delete this.addEventsToElements;
        },
        open(properties, content) {
            title.innerText = content.title;
            text.innerText = content.text;
            status.opened = true;
            contentWindow.style.display = "block";
            setTimeout(() => contentWindow.classList.add("applyBackDropBlur"), 5);
            showTransition();
            status.type = properties.name;
            modeType[status.type](properties);
        }
    }
}