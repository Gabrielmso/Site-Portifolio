function openProjectObject() {
    return {
        content: document.getElementById("contentAbrirProjeto"),
        dropFile: document.getElementById("soltarArquivo"),
        neverOpened: true,
        clickToClose: false,
        open() {
            backgroundBlur(true);
            this.content.style.display = "block";
            this.dropFile.classList.replace("dragEnter", "dragLeave");
            if (this.neverOpened) {
                this.neverOpened = false;
                document.getElementById("bttSelecionarProjeto").addEventListener("mousedown", () => this.getFile());
                this.content.addEventListener("mousedown", () => this.mouseDownClose());
                this.dropFile.addEventListener("mouseenter", () => this.clickToClose = false);
                this.dropFile.addEventListener("mouseleave", () => {
                    this.clickToClose = true;
                    this.dropFile.classList.replace("dragEnter", "dragLeave");
                });
                this.dropFile.addEventListener("dragenter", () => this.dropFile.classList.replace("dragLeave", "dragEnter"));
                this.dropFile.addEventListener("dragleave", () => this.dropFile.classList.replace("dragEnter", "dragLeave"));
                this.dropFile.addEventListener("drop", (e) => {
                    preventDefaultAction(e);
                    this.fileValidation(e.dataTransfer.files[0]);
                })
            }
        },
        close() {
            backgroundBlur(false);
            this.content.style.display = "none";
        },
        conclude() {
            this.close();
            this.content.remove();
            openProject = null;
        },
        mouseDownClose() {
            if (openProject.clickToClose) { openProject.close(); }
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
                if (extencao === "gm") { project.loadProject(file) }
                else {
                    openProject.close();
                    notification.open({ title: "Erro!", text: "Arquivo selecionado inválido!" },
                        { name: "notify", time: 2000 }, null);
                }
            } else {
                openProject.close();
                notification.open({ title: "Erro!", text: "Falha ao carregar projeto, tente novamente." },
                    { name: "notify", time: 2000 }, null);
            }
        }
    }
}