function createProjectWindowObject() {
    return {
        content: document.getElementById("contentCriarAbrirProjeto"),
        windows: {
            create: document.getElementById("janelaCriarProjeto"),
            load: document.getElementById("janelaAbrirProjeto")
        },
        clickToClose: true,
        neverOpened: true,
        addEventsToCreate() {
            const window = this.windows.create;
            document.getElementById("bttCriarprojeto").addEventListener("mousedown", () => this.validateProperties());
            window.addEventListener("mouseenter", () => this.clickToClose = false);
            window.addEventListener("mouseleave", () => this.clickToClose = true);
        },
        addEventsToLoad() {
            const window = this.windows.load;
            document.getElementById("bttSelecionarProjeto").addEventListener("mousedown", () => this.getFile());
            window.addEventListener("mouseenter", () => this.clickToClose = false);
            window.addEventListener("mouseleave", () => {
                this.clickToClose = true;
                window.classList.replace("dragEnter", "dragLeave");
            });
            window.addEventListener("dragenter", () => window.classList.replace("dragLeave", "dragEnter"));
            window.addEventListener("dragleave", () => window.classList.replace("dragEnter", "dragLeave"));
            window.addEventListener("drop", (e) => this.fileValidation(e.dataTransfer.files[0]));
        },
        open(type) {
            this.content.style.display = "flex";
            backgroundBlur(true);
            if (type === "create") {
                this.windows.load.style.display = "none";
                this.windows.create.style.display = "block";
            } else if (type === "load") {
                this.windows.load.classList.replace("dragEnter", "dragLeave")
                this.windows.create.style.display = "none";
                this.windows.load.style.display = "flex";
            }
            if (this.neverOpened) {
                this.neverOpened = false;
                this.content.addEventListener("mousedown", () => {
                    if (this.clickToClose) { this.close(); }
                })
                this.addEventsToCreate();
                this.addEventsToLoad();
            }
        },
        close() {
            this.content.style.display = "none";
            backgroundBlur(false);
        },
        conclude() {
            this.close();
            this.content.remove();
            createProjectWindow = {
                open(type) {
                    notification.open({
                        title: "Projeto em andamento!",
                        text: "Todo o progresso não salvo será perdido, deseja continuar?"
                    }, { name: "confirm", time: null }, () => {
                        sessionStorage.setItem(type, "true");
                        window.location.reload();
                    });
                }
            }
        },
        validateProperties() {
            const arrayProperties = [document.getElementById("txtNomeProjeto"),
            document.getElementById("txtLarguraProjeto"),
            document.getElementById("txtAlturaProjeto"),
            document.getElementById("corDeFundoProjeto"),
            document.getElementById("numeroCamadasProjeto")];
            for (let i = 0; i < arrayProperties.length; i++) {
                const el = arrayProperties[i];
                if (el.value === "") {
                    campoInvalido(el);
                    return;
                } else {
                    el.style.boxShadow = "";
                    el.style.border = "";
                }
            }
            const nomeProjeto = (arrayProperties[0].value).replace(/ /g, "-"),
                larguraProjeto = parseInt(arrayProperties[1].value),
                alturaProjeto = parseInt(arrayProperties[2].value),
                valueCor = parseInt(arrayProperties[3].value),
                numeroCamadas = parseInt(arrayProperties[4].value);
            if (larguraProjeto > 1920 || larguraProjeto < 1) {
                campoInvalido(arrayProperties[1]);
                return;
            } else if (alturaProjeto > 1080 || alturaProjeto < 1) {
                campoInvalido(arrayProperties[2]);
                return;
            } else if (valueCor > 4 || valueCor < 1) {
                campoInvalido(arrayProperties[3]);
                return;
            } else if (numeroCamadas > 5 || numeroCamadas < 1) {
                campoInvalido(arrayProperties[4]);
                return;
            }
            let color;
            if (valueCor === 1) { color = { r: 255, g: 255, b: 255 }; }
            else if (valueCor === 2) { color = { r: 0, g: 0, b: 0 }; }
            else if (valueCor === 3) { color = false; }
            else { color = project.selectedColors.primary; }
            for (let i = 0; i < arrayProperties.length; i++) { arrayProperties[i].style.backgroundColor = "rgb(37, 37, 37)"; }
            project.create(nomeProjeto, { width: larguraProjeto, height: alturaProjeto }, color, numeroCamadas);
            this.conclude();
            function campoInvalido(campo) {
                campo.focus();
                campo.style.boxShadow = "0px 5px 20px rgba(225, 0, 0, 0.25)";
                campo.style.border = "2px solid rgba(225, 0, 0, 0.4)";
            }
        },
        getFile() {
            const input = document.createElement("input");
            input.setAttribute("type", "file");
            input.addEventListener("change", (e) => this.fileValidation(e.currentTarget.files[0]));
            input.click();
        },
        fileValidation(file) {
            if (file) {
                const extencao = file.name.split('.').pop().toLowerCase();
                if (extencao === "gm") {
                    project.loadProject(file);
                    this.conclude();
                } else {
                    notification.open({ title: "Erro!", text: "Arquivo selecionado inválido!" },
                        { name: "notify", time: 2000 }, null);
                    this.close();
                }
            } else {
                notification.open({ title: "Erro!", text: "Falha ao carregar projeto, tente novamente." },
                    { name: "notify", time: 2000 }, null);
                this.close();
            }
        }
    }
}