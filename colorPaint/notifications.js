function notificationsObject() {
    return {
        opened: false,
        window: document.getElementById("notificacao"),
        title: document.getElementById("tituloNotificacao"),
        text: document.getElementById("textoNotificacao"),
        contentBtt: document.getElementById("bttsNotificacao"),
        buttons: {
            btt1: document.getElementById("bttNotificacao1"),
            btt2: document.getElementById("bttNotificacao2")
        },
        open(content, type, func) {
            this.title.innerText = content.title;
            this.text.innerText = content.text;
            this.opened = true;
            this.window.style.transition = "none";
            this.window.style.opacity = "0";
            this.window.style.bottom = "-" + this.window.offsetHeight + "px";
            setTimeout(() => {
                this.window.style.transition = "";
                this.window.style.opacity = "1";
                this.window.style.bottom = "10px";
            }, 5);
            if (type === "confirm") {
                this.contentBtt.style.display = "";
                this.buttons.btt1.innerText = "Sim";
                this.buttons.btt2.innerText = "Não";
                this.buttons.btt1.addEventListener("mousedown", () => func());
                this.buttons.btt2.addEventListener("mousedown", () => this.close());
            }
            else if (type === "notify") {
                this.contentBtt.style.display = "none";
                setTimeout(() => this.close(), 2600);
            }
        },
        close() {
            if (!this.opened) { return; }
            this.buttons.btt1 = cloneReplaceElement(this.buttons.btt1);
            this.buttons.btt2 = cloneReplaceElement(this.buttons.btt2);
            this.window.style.opacity = "0";
            this.window.style.bottom = "-" + (this.window.offsetHeight + 10) + "px";
            this.opened = false;
        }
    }
}