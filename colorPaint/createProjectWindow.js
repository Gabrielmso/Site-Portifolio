import { getElement, setStyle, createElement } from "../js/utils.js";

export default function createProjectWindowObject() {
    const D = {}, state = { neverOpened: true, mode: "create", dragEnterElement: null },
        content = getElement("contentCriarAbrirProjeto"),
        createProject = {
            window: getElement("janelaCriarProjeto"),
            inputs: {
                name: getElement("txtNomeProjeto"), width: getElement("txtLarguraProjeto"),
                height: getElement("txtAlturaProjeto"), background: getElement("corDeFundoProjeto"),
                numLayers: getElement("numeroCamadasProjeto")
            },
            bttCreate: getElement("bttCriarprojeto"),
            addEventsToElements() { this.bttCreate.addEventListener("mousedown", validateProperties); },
            removeEventsToElements() { this.bttCreate.removeEventListener("mousedown", validateProperties); }
        },
        loadProject = {
            window: getElement("janelaAbrirProjeto"), bttLoad: getElement("bttSelecionarProjeto"),
            addEventsToElements() {
                this.bttLoad.addEventListener("mousedown", getFile);
                this.window.addEventListener("mouseleave", mouseLeaveWindowLoad);
                this.window.addEventListener("dragenter", dragEnterWindowLoad);
                this.window.addEventListener("dragleave", dragLeaveWindowLoad);
                this.window.addEventListener("drop", dropFileWindowLoad);
            },
            removeEventsToElements() {
                this.bttLoad.removeEventListener("mousedown", getFile);
                this.window.removeEventListener("mouseleave", mouseLeaveWindowLoad);
                this.window.removeEventListener("dragenter", dragEnterWindowLoad);
                this.window.removeEventListener("dragleave", dragLeaveWindowLoad);
                this.window.removeEventListener("drop", dropFileWindowLoad);
            }
        },
        close = async () => {
            const removeEventsMode = {
                create: () => createProject.removeEventsToElements(),
                load: () => loadProject.removeEventsToElements(),
            }
            removeEventsMode[state.mode]();
            content.removeEventListener("mousedown", clickContentToClose);
            await D.openWindowbackgroundBlur(content, false);
        },
        conclude = async () => {
            await new Promise((resolve) => setTimeout(resolve, 100));
            await close();
            content.remove();
        },
        fileValidation = file => {
            if (file) {
                const extencao = file.name.split('.').pop().toLowerCase();
                if (extencao === "gm") {
                    D.project.loadProject(file);
                    conclude();
                } else {
                    D.notification.open({ name: "notify", time: 2500 },
                        { title: "Erro!", text: "Arquivo selecionado inválido!" });
                    close();
                }
            } else {
                D.notification.open({ name: "notify", time: 2500 },
                    { title: "Erro!", text: "Falha ao carregar projeto, tente novamente." });
                close();
            }
        },
        getFile = () => {
            const input = createElement("input", { type: "file", accept: ".gm" });
            input.addEventListener("change", (e) => fileValidation(e.currentTarget.files[0]));
            input.click();
        },
        validateProperties = () => {
            const campoInvalido = campo => {
                campo.focus();
                setStyle(campo, {
                    boxShadow: "0px 5px 20px rgba(225, 0, 0, 0.25)",
                    border: "2px solid rgba(225, 0, 0, 0.4)"
                });
            }
            for (const prop in createProject.inputs) {
                const el = createProject.inputs[prop];
                if (el.value === "") {
                    campoInvalido(el);
                    return;
                } else { setStyle(el, { border: null, boxShadow: null }); }
            }
            const { name, width, height, background, numLayers } = createProject.inputs;
            const nomeProjeto = (name.value).replace(/ /g, "-"),
                larguraProjeto = +(width.value), alturaProjeto = +(height.value),
                valueCor = +(background.value), numeroCamadas = +(numLayers.value);
            if (larguraProjeto > 1920 || larguraProjeto < 1) {
                campoInvalido(width);
                return;
            } else if (alturaProjeto > 1080 || alturaProjeto < 1) {
                campoInvalido(height);
                return;
            } else if (valueCor > 4 || valueCor < 1) {
                campoInvalido(background);
                return;
            } else if (numeroCamadas > 5 || numeroCamadas < 1) {
                campoInvalido(numLayers);
                return;
            }
            const color = valueCor === 1 ? { r: 255, g: 255, b: 255 } : valueCor === 2 ? { r: 0, g: 0, b: 0 } :
                valueCor === 3 ? false : D.project.selectedColors.firstPlane;
            D.project.create(nomeProjeto, { width: larguraProjeto, height: alturaProjeto }, color, numeroCamadas);
            if (D.project.created) { conclude(); }
            else {
                close();
                D.notification.open({ name: "notify", time: 2500 },
                    { title: "Erro!", text: "Falha ao criar projeto, tente novamente." });
            }
        },
        clickContentToClose = e => { if (e.currentTarget === e.target) { close(); } },
        mouseLeaveWindowLoad = () => loadProject.window.classList.replace("dragEnter", "dragLeave"),
        dragEnterWindowLoad = (e) => {
            state.dragEnterElement = e.target;
            loadProject.window.classList.replace("dragLeave", "dragEnter");
        },
        dragLeaveWindowLoad = (e) => {
            if (state.dragEnterElement !== e.target) { return; }
            loadProject.window.classList.replace("dragEnter", "dragLeave");
        },
        dropFileWindowLoad = e => fileValidation(e.dataTransfer.files[0]);

    return {
        open(mode) {
            if (D.project.created) {
                D.notification.open({
                    name: "confirm", function: () => {
                        sessionStorage.setItem("loadMode", mode);
                        window.location.reload();
                    }
                }, {
                    title: "Projeto em andamento!",
                    text: "Todo o progresso não salvo será perdido, deseja continuar?"
                });
                return;
            }
            D.openWindowbackgroundBlur(content, true);
            const typeMode = {
                create: () => {
                    setStyle(loadProject.window, { display: "none" });
                    setStyle(createProject.window, { display: "block" });
                    createProject.addEventsToElements();
                },
                load: () => {
                    loadProject.window.classList.replace("dragEnter", "dragLeave");
                    setStyle(createProject.window, { display: "none" });
                    setStyle(loadProject.window, { display: "flex" });
                    loadProject.addEventsToElements();
                }
            }
            state.mode = mode;
            typeMode[state.mode]();
            content.addEventListener("mousedown", clickContentToClose);
        },
        addDependencies(dependencies) {
            for (const prop in dependencies) { D[prop] = dependencies[prop]; }
        }
    }
}