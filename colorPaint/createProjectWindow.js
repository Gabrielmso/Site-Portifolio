import {
    getElement, setStyle, createElement, openWindowBackgroundBlur, delay, createEventEmitterToObservers,
    getAllElementsClass
} from "../js/utils.js";

const MAX_NUM_LAYERS = 5;

export default function createProjectWindowObject({ notification, colors }) {
    const state = { mode: "create", dragEnterElement: null }
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
        await delay(100);
        await close();
        content.remove();
    }
    const fileValidation = (() => {
        const isInvalidObjRGB = obj => {
            const propInvalid = ["r", "g", "b"].some(p => typeof obj[p] !== "number");
            if (propInvalid) { return true; }
            return ["r", "g", "b"].some(p => obj[p] < 0 || obj[p] > 255);
        }
        const isInvalidObjProject = obj => [
            () => typeof obj !== "object",
            () => ["name", "resolution", "background", "savedColors", "grid", "numLayers", "layersData"]
                .some(prop => !obj[prop]),
            () => typeof obj.name !== "string",
            () => typeof obj.resolution !== "object",
            () => ["width", "height"].some(p => !obj.resolution[p]),
            () => ["width", "height"].some(p => typeof obj.resolution[p] !== "number"),
            () => {
                const type = typeof obj.background;
                if (type === "object") { return isInvalidObjRGB(obj.background); }
                else if (type === "boolean") { return obj.background !== false; }
                return true;
            },
            () => !(Array.isArray(obj.savedColors)),
            () => {
                if (!obj.savedColors.length) { return false; }
                return obj.savedColors.some(rgb => isInvalidObjRGB(rgb));
            },
            () => typeof obj.grid !== "object",
            () => ["size", "position", "visible", "opacity"].some(p => !(obj.grid.hasOwnProperty(p))),
            () => typeof obj.grid.size !== "number" || obj.grid.size < 0,
            () => typeof obj.grid.position !== "object",
            () => ["x", "y"].some(p =>
                !obj.grid.position.hasOwnProperty(p) || typeof obj.grid.position[p] !== "number"),
            () => typeof obj.grid.visible !== "boolean",
            () => typeof obj.grid.opacity !== "number" || obj.grid.opacity < 0.01 || obj.grid.opacity > 1,
            () => typeof obj.numLayers !== "number" || obj.numLayers < 1 || obj.numLayers > MAX_NUM_LAYERS,
            () => !(Array.isArray(obj.layersData)) || !obj.layersData.length || obj.layersData.length !== obj.numLayers,
            () => obj.layersData.some(obj => (["data", "opacity", "visible"].some(p => !obj.hasOwnProperty(p)))
                || typeof obj.data !== "string" || typeof obj.opacity !== "number" ||
                typeof obj.visible !== "boolean" || obj.opacity < 0.01 || obj.opacity > 1)
        ].some(fn => fn());

        return file => {
            const erro = async () => {
                await close();
                notification.open({
                    type: "notify", timeNotify: 4000, title: "Erro!", message: "Arquivo selecionado inválido!"
                });
            }
            if (!file || !file.name || file.name.split('.').pop().toLowerCase() !== "gm") {
                erro();
                return;
            }
            const reader = new FileReader();
            reader.addEventListener("load", async () => {
                let obj = {};
                try { obj = JSON.parse(reader.result); }
                catch (e) { }
                if (!isInvalidObjProject(obj)) {
                    await conclude();
                    observers.notify("createProject", { mode: "load", obj });
                } else { erro(); }
            });
            reader.readAsText(file, "utf-8");
        }
    })()
    const getFile = () => {
        const input = createElement("input", { type: "file", accept: ".gm" });
        input.addEventListener("change", e => fileValidation(e.currentTarget.files[0]));
        input.click();
    }
    const validateProperties = async () => {
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
        } else if (numLayers > MAX_NUM_LAYERS || numLayers < 1) {
            campoInvalido(txtNumLayers);
            return;
        }
        const background = valueCor === 1 ? { r: 255, g: 255, b: 255 } : valueCor === 2 ? { r: 0, g: 0, b: 0 } :
            valueCor === 3 ? false : colors.get(1);
        await conclude();
        observers.notify("createProject", {
            mode: "create", obj: { name, resolution: { width, height }, background, numLayers }
        });
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
    const openBeforeProjectCreated = mode => {
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
        Array.from(getAllElementsClass("bttLightAnimation")).map(e => e.classList.remove("bttLightAnimation"));
    };
    const open = {
        currentOpen: openBeforeProjectCreated,
        open: mode => open.currentOpen(mode), addObservers: observers.add, removeObservers: observers.remove,
        onReadyProject: () => {
            open.currentOpen = mode => notification.open({
                type: "confirm", title: "Projeto em andamento!",
                message: "Todo o progresso não salvo será perdido, deseja continuar?",
                functionConfirm: () => {
                    sessionStorage.setItem("loadMode", mode);
                    window.location.reload();
                }
            });
        }
    }
    return open;
}