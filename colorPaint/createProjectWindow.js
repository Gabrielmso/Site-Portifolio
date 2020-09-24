export default function createProjectWindowObject() {
    const D = {}, status = { neverOpened: true }, conclude = async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        await D.createProjectWindow.close();
        D.createProjectWindow.content.remove();
        for (const prop in D.createProjectWindow) { delete D.createProjectWindow[prop]; }
        D.createProjectWindow.open = (type) => {
            D.notification.open({
                name: "confirm", function: () => {
                    sessionStorage.setItem(type, "true");
                    window.location.reload();
                }
            }, {
                title: "Projeto em andamento!",
                text: "Todo o progresso não salvo será perdido, deseja continuar?"
            });
        }
    }, fileValidation = (file) => {
        if (file) {
            const extencao = file.name.split('.').pop().toLowerCase();
            if (extencao === "gm") {
                D.project.loadProject(file);
                conclude();
            } else {
                D.notification.open({ name: "notify", time: 2000 },
                    { title: "Erro!", text: "Arquivo selecionado inválido!" });
                this.close();
            }
        } else {
            D.notification.open({ name: "notify", time: 2000 },
                { title: "Erro!", text: "Falha ao carregar projeto, tente novamente." });
            D.createProjectWindow.close();
        }
    }, getFile = () => {
        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.addEventListener("change", (e) => fileValidation(e.currentTarget.files[0]));
        input.click();
    }
    return {
        content: document.getElementById("contentCriarAbrirProjeto"),
        windows: {
            create: document.getElementById("janelaCriarProjeto"),
            load: document.getElementById("janelaAbrirProjeto")
        },
        clickToClose: true,
        addEventsToCreate() {
            const window = this.windows.create;
            document.getElementById("bttCriarprojeto").addEventListener("mousedown", () => this.validateProperties());
            window.addEventListener("mouseenter", () => this.clickToClose = false);
            window.addEventListener("mouseleave", () => this.clickToClose = true);
        },
        addEventsToLoad() {
            const window = this.windows.load;
            document.getElementById("bttSelecionarProjeto").addEventListener("mousedown", getFile);
            window.addEventListener("mouseenter", () => this.clickToClose = false);
            window.addEventListener("mouseleave", () => {
                this.clickToClose = true;
                window.classList.replace("dragEnter", "dragLeave");
            });
            window.addEventListener("dragenter", () => window.classList.replace("dragLeave", "dragEnter"));
            window.addEventListener("dragleave", () => window.classList.replace("dragEnter", "dragLeave"));
            window.addEventListener("drop", (e) => fileValidation(e.dataTransfer.files[0]));
        },
        open(mode) {
            D.openWindowbackgroundBlur(this.content, true);
            const typeMode = {
                create: () => {
                    this.windows.load.style.display = "none";
                    this.windows.create.style.display = "block";
                },
                load: () => {
                    this.windows.load.classList.replace("dragEnter", "dragLeave");
                    this.windows.create.style.display = "none";
                    this.windows.load.style.display = "flex";
                }
            }
            typeMode[mode]();
            if (status.neverOpened) {
                status.neverOpened = false;
                this.content.addEventListener("mousedown", () => {
                    if (this.clickToClose) { this.close(); }
                })
                this.addEventsToCreate();
                this.addEventsToLoad();
            }
        },
        async close() {
            await D.openWindowbackgroundBlur(this.content, false);
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
                } else { el.style.border = el.style.boxShadow = ""; }
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
            const color = valueCor === 1 ? { r: 255, g: 255, b: 255 } : valueCor === 2 ? { r: 0, g: 0, b: 0 } :
                valueCor === 3 ? false : D.project.selectedColors.firstPlane;
            D.project.create(nomeProjeto, { width: larguraProjeto, height: alturaProjeto }, color, numeroCamadas);
            conclude();
            function campoInvalido(campo) {
                campo.focus();
                campo.style.boxShadow = "0px 5px 20px rgba(225, 0, 0, 0.25)";
                campo.style.border = "2px solid rgba(225, 0, 0, 0.4)";
            }
        },
        addDependencies(dependencies) {
            for (const prop in dependencies) { D[prop] = dependencies[prop]; }
        }
    }
}