function notificationsObject() {
    return {
        opened: false,
        contentWindow: document.getElementById("contentNotificacao"),
        window: document.getElementById("notificacao"),
        title: document.getElementById("tituloNotificacao"),
        text: document.getElementById("textoNotificacao"),
        buttons: {
            btt1: document.getElementById("bttNotificacao1"),
            btt2: document.getElementById("bttNotificacao2")
        },
        open(content, type, func) {
            this.title.innerText = content.title;
            this.text.innerText = content.text;
            this.opened = true;
            this.contentWindow.style.display = "block";
            this.window.style.transition = "none";
            this.window.style.opacity = "0";
            this.window.style.bottom = "-" + this.window.offsetHeight + "px";
            setTimeout(() => {
                this.window.style.transition = "";
                this.window.style.opacity = "1";
                this.window.style.bottom = "10px";
            }, 7);
            if (type.name === "confirm") {
                this.buttons.btt2.style.display = "block";
                this.buttons.btt1.innerText = "Sim";
                this.buttons.btt2.innerText = "Não";
                this.buttons.btt1.addEventListener("mousedown", () => {
                    this.close();
                    setTimeout(() => func(), 400);
                });
                this.buttons.btt2.addEventListener("mousedown", () => this.close());
            } else if (type.name === "notify") {
                this.buttons.btt2.style.display = "none";
                this.buttons.btt1.innerText = "Ok";
                this.buttons.btt1.addEventListener("mousedown", () => this.close())
                setTimeout(() => this.close(), type.time + 400);
            }
        },
        close() {
            this.buttons.btt1 = cloneReplaceElement(this.buttons.btt1);
            this.buttons.btt2 = cloneReplaceElement(this.buttons.btt2);
            this.window.style.opacity = "0";
            this.window.style.bottom = "-" + (this.window.offsetHeight + 10) + "px";
            setTimeout(() => this.contentWindow.style.display = "none", 400);
        }
    }
}