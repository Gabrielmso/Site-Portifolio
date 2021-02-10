import { getElement, setStyle, createElement, openWindowBackgroundBlur, delay, createEventEmitterToObservers } from "../js/utils.js";

export default function createProjectWindowObject({ notification, colors }) {
    const state = { created: false, mode: "create", dragEnterElement: null }
    const observers = createEventEmitterToObservers(["createProject"]);
    const content = getElement("contentCriarAbrirProjeto");
    const createProject = {
        window: getElement("janelaCriarProjeto"),
        inputs: {
            txtName: getElement("txtNomeProjeto"), txtWidth: getElement("txtLarguraProjeto"),
            txtHeight: getElement("txtAlturaProjeto"), txtBackground: getElement("corDeFundoProjeto"),
            txtNumLayers: getElement("numeroCamadasProjeto")
        },
        bttCreate: getElement("bttCriarprojeto"),
        addEventsToElements() { this.bttCreate.addEventListener("mousedown", validateProperties); },
        removeEventsToElements() { this.bttCreate.removeEventListener("mousedown", validateProperties); }
    }
    const loadProject = {
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
    }
    const close = async () => {
        const removeEventsMode = {
            create: () => createProject.removeEventsToElements(),
            load: () => loadProject.removeEventsToElements(),
        }
        removeEventsMode[state.mode]();
        content.removeEventListener("mousedown", clickContentToClose);
        await openWindowBackgroundBlur(content, false);
    }
    const conclude = async () => {
        state.created = true;
        await delay(100);
        await close();
        content.remove();
    }
    const fileValidation = file => {
        if (file) {
            const extencao = file.name.split('.').pop().toLowerCase();
            if (extencao === "gm") {
                observers.notify("createProject", { mode: "load", obj: file });
                conclude();
            } else {
                notification.open({
                    type: "notify", timeNotify: 2500, title: "Erro!", message: "Arquivo selecionado inválido!"
                });
                close();
            }
        } else {
            notification.open({
                type: "notify", timeNotify: 2500, title: "Erro!",
                message: "Falha ao carregar projeto, tente novamente."
            });
            close();
        }
    }
    const getFile = () => {
        const input = createElement("input", { type: "file", accept: ".gm" });
        input.addEventListener("change", (e) => fileValidation(e.currentTarget.files[0]));
        input.click();
    }
    const validateProperties = () => {
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
        const { txtName, txtWidth, txtHeight, txtBackground, txtNumLayers } = createProject.inputs;
        const name = (txtName.value).replace(/ /g, "-"),
            width = +(txtWidth.value), height = +(txtHeight.value),
            valueCor = +(txtBackground.value), numLayers = +(txtNumLayers.value);
        if (width > 1920 || width < 1) {
            campoInvalido(txtWidth);
            return;
        } else if (height > 1080 || height < 1) {
            campoInvalido(txtHeight);
            return;
        } else if (valueCor > 4 || valueCor < 1) {
            campoInvalido(txtBackground);
            return;
        } else if (numLayers > 5 || numLayers < 1) {
            campoInvalido(txtNumLayers);
            return;
        }
        const background = valueCor === 1 ? { r: 255, g: 255, b: 255 } : valueCor === 2 ? { r: 0, g: 0, b: 0 } :
            valueCor === 3 ? false : colors.get(1);
        observers.notify("createProject", {
            mode: "create",
            obj: { name, resolution: { width, height }, background, numLayers }
        });
        conclude();
    }
    const clickContentToClose = e => { if (e.currentTarget === e.target) { close(); } }
    const mouseLeaveWindowLoad = () => loadProject.window.classList.replace("dragEnter", "dragLeave")
    const dragEnterWindowLoad = e => {
        state.dragEnterElement = e.target;
        loadProject.window.classList.replace("dragLeave", "dragEnter");
    }
    const dragLeaveWindowLoad = e => {
        if (state.dragEnterElement !== e.target) { return; }
        loadProject.window.classList.replace("dragEnter", "dragLeave");
    }
    const dropFileWindowLoad = e => fileValidation(e.dataTransfer.files[0]);

    return {
        open: mode => {
            if (state.created) {
                notification.open({
                    type: "confirm", title: "Projeto em andamento!",
                    message: "Todo o progresso não salvo será perdido, deseja continuar?",
                    functionConfirm: () => {
                        sessionStorage.setItem("loadMode", mode);
                        window.location.reload();
                    }
                });
                return;
            }
            openWindowBackgroundBlur(content, true);
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
        addObservers: observers.add, removeObservers: observers.remove
    }
}