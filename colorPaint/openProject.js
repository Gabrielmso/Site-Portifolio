function openProjectObject() {
    return {
        content: document.getElementById("contentAbrirProjeto"),
        dropFile: document.getElementById("soltarArquivo"),
        bttSelectFile: document.getElementById("bttSelecionarProjeto"),
        clickToClose: false,
        open() {
            if (project.created) {
                notification.open({
                    title: "Projeto em andamento!", text: "Todo o progresso não salvo será perdido, deseja continuar?"
                }, { name: "confirm", time: null }, () => {
                    sessionStorage.setItem("abrirProjetoSalvo", "true");
                    window.location.reload();
                });
            } else {
                backgroundBlur(true);
                this.content.style.display = "block";
                this.bttSelectFile.addEventListener("mousedown", openProject.getFile);
                this.content.addEventListener("mousedown", openProject.mouseDownClose);
                this.dropFile.addEventListener("mouseenter", openProject.mouseEnterClose);
                this.dropFile.addEventListener("mouseleave", openProject.mouseLeaveClose);
            }
        },
        close() {
            backgroundBlur(false);
            openProject.content.style.display = "none";
            openProject.bttSelectFile.removeEventListener("mousedown", openProject.getFile);
            openProject.content.removeEventListener("mousedown", openProject.mouseDownClose);
            openProject.dropFile.removeEventListener("mouseenter", openProject.mouseEnterClose);
            openProject.dropFile.removeEventListener("mouseleave", openProject.mouseLeaveClose);
        },
        mouseDownClose() {
            if (openProject.clickToClose) { openProject.close(); }
        },
        mouseEnterClose() { openProject.clickToClose = false; },
        mouseLeaveClose() { openProject.clickToClose = true; },
        getFile() {
            const input = document.createElement("input");
            input.setAttribute("type", "file");
            input.addEventListener("change", (e) => {
                const arquivo = e.currentTarget.files[0];
                const reader = new FileReader();
                reader.onload = () => {
                    if (reader.result === "") {
                        notification.open({ title: "Erro!", text: "Este arquivo não possui projeto salvo." },
                            { name: "notify", time: 2000 }, null);
                    } else { project.loadProject(reader.result); }
                    openProject.close();
                };
                if (!arquivo) {
                    notification.open({ title: "Erro!", text: "Falha ao carregar projeto, tente novamente." },
                        { name: "notify", time: 2000 }, null);
                    openProject.close();
                } else {
                    const extencao = arquivo.name.split('.').pop().toLowerCase();
                    if (extencao === "gm") { reader.readAsText(arquivo, "ISO-8859-1"); }
                    else {
                        notification.open({ title: "Erro!", text: "Arquivo selecionado inválido!" },
                            { name: "notify", time: 2000 }, null);
                        openProject.close();
                    }
                }
            }, false);
            input.click();
        }
    }
}