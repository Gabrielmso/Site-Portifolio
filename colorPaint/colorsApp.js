import {
    getElement, createEventEmitterToObservers, createElement, preventDefaultAction,
    setStyle
} from "../js/utils.js";
import colorSelectionWindowObject from "./colorSelectionWindow.js";

export default function colorsApp({ project, notification, janelaPrincipal }) {
    const observers = createEventEmitterToObservers(["openColorSelectionWindow", "colorChanged"]);
    const colorSelectionWindow = colorSelectionWindowObject({ janelaPrincipal })
    const firstPlane = { btt: getElement("corPrincipal"), color: { r: 0, g: 0, b: 0 } };
    const backgroundPlane = { btt: getElement("corSecundaria"), color: { r: 255, g: 255, b: 255 } }
    const bttRemoveSavedColor = getElement("bttRemoverCorSalva");
    const contentElSavedColors = getElement("coresSalvas");
    const get = plane =>
        (plane < 1 ? 1 : plane > 2 ? 1 : plane) === 1 ? firstPlane.color : backgroundPlane.color;
    const set = (() => {
        const apply = {
            color1: ({ r, g, b }) => {
                firstPlane.color = { r, g, b };
                setStyle(firstPlane.btt, { background: "rgb(" + r + ", " + g + ", " + b + ")" });

            },
            color2: ({ r, g, b }) => {
                backgroundPlane.color = { r, g, b };
                setStyle(backgroundPlane.btt, { background: "rgb(" + r + ", " + g + ", " + b + ")" });
            }
        }
        return ({ plane, color }) => {
            if (colorSelectionWindow.opened) { colorSelectionWindow.currentColor = color; }
            else {
                plane = plane < 1 ? 1 : plane > 2 ? 1 : plane;
                apply["color" + plane](color); observers.notify("colorChanged", { plane, color: get(plane) });
            }
        };
    })();

    const savedColors = {
        selected: -1, colors: [],
        select: e => {
            if (project.toolInUse) { return; }
            for (let i = 0; i < savedColors.colors.length; i++) {
                const { el, rgb } = savedColors.colors[i];
                if (el === e.currentTarget) {
                    set({ plane: e.button, color: rgb });
                    setStyle(el, { boxShadow: "0px 0px 4px rgb(255, 255, 255)" });
                    savedColors.selected = i;
                } else { setStyle(el, { boxShadow: null }) }
            }
        },
        deselectAll: () => {
            for (const { el } of savedColors.colors) {
                savedColors.selected = -1;
                setStyle(el, { boxShadow: null });
            }
        },
        save: rgb => {
            const indexColor = savedColors.colors.length;
            if (indexColor === 0) { setStyle(bttRemoveSavedColor, { display: "block" }); }
            for (let i = 0; i < indexColor; i++) {
                const { r, g, b } = savedColors.colors[i].rgb;
                if (r === rgb.r && g === rgb.g && b === rgb.b) {
                    notification.open({
                        type: "notify", timeNotify: 1500, title: "Atenção!",
                        message: "Essa cor já está salva."
                    });
                    return;
                }
            }
            const styleColor = "rgb(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ")";
            const savedColorEl = createElement("div", {
                title: styleColor, class: "corSalva cursor", style: "background-color: " + styleColor + ";"
            });
            contentElSavedColors.appendChild(savedColorEl);
            savedColors.colors.push({ el: savedColorEl, rgb });
            savedColorEl.addEventListener("mousedown", (e) => {
                if (colorSelectionWindow.opened) {
                    colorSelectionWindow.currentColor = rgb
                } else { savedColors.select(e); }
            });
            savedColorEl.addEventListener("contextmenu", preventDefaultAction);
        },
        remove: () => {
            if (savedColors.selected === -1) { return; }
            savedColors.colors.splice(savedColors.selected, 1).first.el.remove();
            savedColors.selected = -1
            if (!savedColors.colors.length) { setStyle(bttRemoveSavedColor, { display: null }); }
        }
    }
    const onClickOpenColorSelectionWindow = (() => {
        let planeToChangeColor = 1;
        const changeColorPlane = color => {
            set({ plane: planeToChangeColor, color });
            savedColors.deselectAll();
        }
        colorSelectionWindow.addObservers("selectedColor", [changeColorPlane]);

        return plane => {
            if (project.toolInUse) { return; }
            if (colorSelectionWindow.opened) { colorSelectionWindow.currentColor = get(plane); }
            else {
                planeToChangeColor = plane;
                colorSelectionWindow.open(get(planeToChangeColor));
            }
        }
    })();

    firstPlane.btt.addEventListener("mousedown", onClickOpenColorSelectionWindow.bind(null, 1));
    backgroundPlane.btt.addEventListener("mousedown", onClickOpenColorSelectionWindow.bind(null, 2));
    bttRemoveSavedColor.addEventListener("mousedown", savedColors.remove);

    getElement("bttCoresPrincipais").addEventListener("mousedown", () => {
        if (colorSelectionWindow.opened) { return; }
        set({ plane: 1, color: { r: 0, g: 0, b: 0 } });
        set({ plane: 2, color: { r: 255, g: 255, b: 255 } });
    });

    getElement("bttAlternaCor").addEventListener("mousedown", () => {
        if (colorSelectionWindow.opened) { return; }
        const color = { ...get(1) };
        set({ plane: 1, color: get(2) });
        set({ plane: 2, color });
    });

    colorSelectionWindow.addObservers("open", [open =>
        observers.notify("openColorSelectionWindow", open)]);
    colorSelectionWindow.addObservers("saveColor", [savedColors.save]);

    return {
        set, get, save: savedColors.save, get savedColors() { return savedColors.colors },
        addObservers: observers.add
    }
}