import {
    getMousePosition, getElement, setStyle, createEventEmitterToObservers, rgbTohex,
    hexToRgb, hsvToRgb, rgbToHsv
} from "../js/utils.js";

export default function ColorSelectionWindow({ janelaPrincipal }) {
    const status = { opened: false, functionWhenSelecting: () => { } }
    const observers = createEventEmitterToObservers(["open", "saveColor", "selectedColor"]);
    const selectedColor = {
        r: 0, g: 0, b: 0, update({ r, g, b }) {
            this.r = r;
            this.g = g;
            this.b = b;
        }, get() { return { r: this.r, g: this.g, b: this.b } }
    }
    const colorHsv = {
        h: 0, s: 100, v: 100, update({ h, s, v }) {
            this.h = h;
            this.s = s;
            this.v = v;
        }, get() { return { h: this.h, s: this.s, v: this.v } }
    }
    const window = getElement("janelaSelecionarCor");
    const insideWindow = {
        barMoveWindow: getElement("moverJanelaSelecionarCor"),
        compareColors: { current: getElement("corAtual"), selected: getElement("corSelecionada") },
        canvas: {
            spectrum: getElement("barraEspectroCor").getContext("2d"),
            gradient: getElement("gradienteCor").getContext("2d"),
            brightness: getElement("barraBrilho").getContext("2d"),
            saturation: getElement("barraSaturacao").getContext("2d"),
        },
        cursors: {
            spectrum: getElement("cursorBarra"), gradient: getElement("cursorGradiente"),
            brightness: getElement("cursorBarraBrilho"), saturation: getElement("cursorBarraSaturacao"),
        },
        inputs: { txtRgb: getElement("codRGB"), txtHex: getElement("codHEX") },
        buttons: {
            ok: getElement("bttOkSelecionaCor"),
            saveColor: getElement("bttSalvarCor"),
            cancel: getElement("bttCancelarSelecionaCor")
        }
    }
    const paintSpectrum = () => {
        const spectrum = insideWindow.canvas.spectrum, { width, height } = spectrum.canvas;
        spectrum.rect(0, 0, width, height);
        const gradient = spectrum.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, "rgb(255, 0, 0)");
        gradient.addColorStop(0.1666666666666667, "rgb(255, 255, 0)");
        gradient.addColorStop(0.3333333333333334, "rgb(0, 255, 0)");
        gradient.addColorStop(0.5000000000000001, "rgb(0, 255, 255)");
        gradient.addColorStop(0.6666666666666668, "rgb(0, 0, 255)");
        gradient.addColorStop(0.8333333333333335, "rgb(255, 0, 255)");
        gradient.addColorStop(1, "rgb(255, 0, 0)");
        spectrum.fillStyle = gradient;
        spectrum.fill();
    }
    const paintGradient = () => {
        const color = hsvToRgb({ h: colorHsv.h, s: 100, v: 100 });
        const { gradient } = insideWindow.canvas, { width, height } = gradient.canvas;
        gradient.clearRect(0, 0, width, height);
        gradient.fillStyle = "rgb(" + color.r + ", " + color.g + ", " + color.b + ")";
        gradient.fillRect(0, 0, width, height);
        const gradientWhite = gradient.createLinearGradient(0, 0, width, 0);
        gradientWhite.addColorStop(0, "rgba(255, 255, 255, 1)");
        gradientWhite.addColorStop(1, "rgba(255, 255, 255, 0)");
        gradient.fillStyle = gradientWhite;
        gradient.fillRect(0, 0, width, height);
        const gradientBlack = gradient.createLinearGradient(0, 0, 0, height);
        gradientBlack.addColorStop(0, "rgba(0, 0, 0, 0)");
        gradientBlack.addColorStop(1, "rgba(0, 0, 0, 1)");
        gradient.fillStyle = gradientBlack;
        gradient.fillRect(0, 0, width, height);
    }
    const paintSaturation = () => {
        const initial = hsvToRgb({ h: colorHsv.h, s: 0, v: colorHsv.v });
        const final = hsvToRgb({ h: colorHsv.h, s: 100, v: colorHsv.v })
        const canvas = insideWindow.canvas.saturation, { width, height } = canvas.canvas;
        const gradient = canvas.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, "rgb(" + initial.r + ", " + initial.g + ", " + initial.b + ")");
        gradient.addColorStop(1, "rgb(" + final.r + ", " + final.g + ", " + final.b + ")");
        canvas.fillStyle = gradient;
        canvas.fillRect(0, 0, width, height);
    }
    const paintBrightness = () => {
        const color = hsvToRgb({ h: colorHsv.h, s: colorHsv.s, v: 100 });
        const canvas = insideWindow.canvas.brightness, { width, height } = canvas.canvas;
        const gradientBlack = canvas.createLinearGradient(0, 0, 0, height);
        gradientBlack.addColorStop(0, "rgb(" + color.r + ", " + color.g + ", " + color.b + ")");
        gradientBlack.addColorStop(1, "rgb(0, 0, 0, 1)");
        canvas.fillStyle = gradientBlack;
        canvas.fillRect(0, 0, width, height);
    }
    const findColorInPositionGradient = () => {
        const cor = hsvToRgb(colorHsv.get());
        const style = { backgroundColor: "rgb(" + cor.r + ", " + cor.g + ", " + cor.b + ")" }
        selectedColor.update(cor);
        setStyle(insideWindow.cursors.gradient, style);
        setStyle(insideWindow.cursors.brightness, style);
        setStyle(insideWindow.cursors.saturation, style);
        setStyle(insideWindow.compareColors.selected, style);
        insideWindow.inputs.txtHex.value = rgbTohex(cor);
        insideWindow.inputs.txtRgb.value = cor.r + ", " + cor.g + ", " + cor.b;
    }
    const moveCursorSpectrum = () => {
        const position = insideWindow.canvas.spectrum.canvas.offsetWidth * (colorHsv.h / 360);
        const color = hsvToRgb({ h: colorHsv.h, s: 100, v: 100 });
        setStyle(insideWindow.cursors.spectrum, {
            left: position + "px", backgroundColor: "rgb(" + color.r + ", " + color.g + ", " + color.b + ")"
        });
    }
    const moveCursorSaturation = () => {
        const position = insideWindow.canvas.saturation.canvas.offsetWidth * (colorHsv.s / 100);
        setStyle(insideWindow.cursors.saturation, { left: position + "px" });
    }
    const moveCursorBrightness = () => {
        const position = insideWindow.canvas.brightness.canvas.offsetHeight -
            (insideWindow.canvas.brightness.canvas.offsetHeight * (colorHsv.v / 100));
        setStyle(insideWindow.cursors.brightness, { top: position + "px", })
    }
    const moveCursorGradient = () => {
        const position = {
            x: insideWindow.canvas.gradient.canvas.offsetWidth * (colorHsv.s / 100),
            y: insideWindow.canvas.gradient.canvas.offsetHeight -
                (insideWindow.canvas.gradient.canvas.offsetHeight * (colorHsv.v / 100))
        }
        setStyle(insideWindow.cursors.gradient, { left: position.x + "px", top: position.y + "px" });
    }
    const proxy = {
        set: (() => {
            const actionToSetPropertie = {
                h: () => {
                    moveCursorSpectrum();
                    paintGradient();
                    paintBrightness();
                    paintSaturation();
                },
                s: () => {
                    moveCursorSaturation();
                    moveCursorGradient();
                    paintBrightness();
                },
                v: () => {
                    moveCursorBrightness();
                    moveCursorGradient();
                    paintSaturation();
                }
            }
            return (target, key, value) => {
                target[key] = value;
                const fn = actionToSetPropertie[key];
                if (fn) {
                    fn();
                    findColorInPositionGradient();
                }
                return true;
            }
        })()
    }
    const hsv = new Proxy(colorHsv, proxy);
    const mouseDownCanvasSpectrum = (() => {
        const move = e => {
            let position = getMousePosition(insideWindow.canvas.spectrum.canvas, e).x;
            const { offsetWidth } = insideWindow.canvas.spectrum.canvas
            position = position < 0 ? 0 : position > offsetWidth ? offsetWidth : position;
            hsv.h = ((position * 360) / offsetWidth);
        };
        const up = () => {
            document.removeEventListener("mousemove", move);
            document.removeEventListener("mouseup", up);
        }
        const down = e => {
            document.addEventListener("mousemove", move);
            document.addEventListener("mouseup", up);
            move(e);
        }
        return down;
    })();
    const mouseDownCanvasGradient = (() => {
        const move = e => {
            const { x, y } = getMousePosition(insideWindow.canvas.gradient.canvas, e);
            const { offsetWidth: width, offsetHeight: height } = insideWindow.canvas.gradient.canvas;
            const position = { x: x < 0 ? 0 : x > width ? width : x, y: y < 0 ? 0 : y > height ? height : y }
            hsv.s = ((position.x * 100) / width);
            hsv.v = 100 - ((position.y * 100) / height);
        };
        const up = () => {
            document.removeEventListener("mousemove", move);
            document.removeEventListener("mouseup", up);
        }
        const down = e => {
            document.addEventListener("mousemove", move);
            document.addEventListener("mouseup", up);
            move(e);
        }
        return down;
    })();
    const mouseDownCanvasSaturation = (() => {
        const move = e => {
            let position = getMousePosition(insideWindow.canvas.saturation.canvas, e).x;
            const { offsetWidth } = insideWindow.canvas.saturation.canvas
            position = position < 0 ? 0 : position > offsetWidth ? offsetWidth : position;
            hsv.s = ((position * 100) / offsetWidth);
        };
        const up = () => {
            document.removeEventListener("mousemove", move);
            document.removeEventListener("mouseup", up);
        }
        const down = e => {
            document.addEventListener("mousemove", move);
            document.addEventListener("mouseup", up);
            move(e);
        }
        return down;
    })();
    const mouseDownCanvasBrightness = (() => {
        const move = e => {
            let position = getMousePosition(insideWindow.canvas.brightness.canvas, e).y;
            const { offsetHeight } = insideWindow.canvas.brightness.canvas
            position = position < 0 ? 0 : position > offsetHeight ? offsetHeight : position;
            hsv.v = 100 - ((position * 100) / offsetHeight);
        };;
        const up = () => {
            document.removeEventListener("mousemove", move);
            document.removeEventListener("mouseup", up);
        }
        const down = e => {
            document.addEventListener("mousemove", move);
            document.addEventListener("mouseup", up);
            move(e);
        }
        return down;
    })();
    const moveWindow = (() => {
        let mousePositionMoveWindow = { x: 0, y: 0, };
        const move = (e) => {
            const { x, y } = getMousePosition(janelaPrincipal, e), { x: bx, y: by } = mousePositionMoveWindow;
            const left = x - bx, top = y - by;
            const validateLeft = left < 0 ? 0 : left + window.offsetWidth > janelaPrincipal.offsetWidth ?
                janelaPrincipal.offsetWidth - window.offsetWidth : left;
            const validateTop = top < 50 ? 50 : top + window.offsetHeight > janelaPrincipal.offsetHeight ?
                janelaPrincipal.offsetHeight - window.offsetHeight : top;
            setStyle(window, { top: validateTop + "px", left: validateLeft + "px" });
        }, up = () => {
            document.removeEventListener("mousemove", move);
            document.removeEventListener("mouseup", up);
        }, down = (e) => {
            mousePositionMoveWindow = getMousePosition(e.currentTarget, e);
            document.addEventListener("mousemove", move);
            document.addEventListener("mouseup", up);
        }
        return down;
    })();
    const findColor = color => hsv.update(rgbToHsv(color));
    const txtRgbKeyUp = e => {
        const codColor = e.currentTarget.value.split(",") || e.currentTarget.value.split(", ");
        for (let i = 0; i < codColor.length; i++) { codColor[i] = +codColor[i]; }
        if (codColor.length === 3) {
            if (codColor[0] <= 255 && codColor[1] <= 255 && codColor[2] <= 255) {
                findColor({ r: codColor[0], g: codColor[1], b: codColor[2] });
            }
        }
    }
    const txtHexKeyUp = e => {
        const codCorHEX = (e.currentTarget.value.indexOf("#") === 0 ? "" : "#") + e.currentTarget.value,
            codColor = hexToRgb(codCorHEX);
        if (codColor === null) { return; }
        findColor({ r: codColor[0], g: codColor[1], b: codColor[2] });
    }
    const saveColor = () => observers.notify("saveColor", selectedColor.get())
    const selectColor = () => {
        close();
        observers.notify("selectedColor", selectedColor.get());
    }
    const addEventsToElements = () => {
        insideWindow.canvas.spectrum.canvas.parentElement.addEventListener("mousedown", mouseDownCanvasSpectrum);
        insideWindow.canvas.gradient.canvas.parentElement.addEventListener("mousedown", mouseDownCanvasGradient);
        insideWindow.canvas.saturation.canvas.parentElement.addEventListener("mousedown", mouseDownCanvasSaturation);
        insideWindow.canvas.brightness.canvas.parentElement.addEventListener("mousedown", mouseDownCanvasBrightness);
        insideWindow.barMoveWindow.addEventListener("mousedown", moveWindow);
        insideWindow.inputs.txtRgb.addEventListener("keyup", txtRgbKeyUp);
        insideWindow.inputs.txtHex.addEventListener("keyup", txtHexKeyUp);
        insideWindow.buttons.ok.addEventListener("mousedown", selectColor)
        insideWindow.buttons.saveColor.addEventListener("mousedown", saveColor);
        insideWindow.buttons.cancel.addEventListener("mousedown", close);
    }
    const removeEventsToElements = () => {
        insideWindow.canvas.spectrum.canvas.parentElement.removeEventListener("mousedown", mouseDownCanvasSpectrum);
        insideWindow.canvas.gradient.canvas.parentElement.removeEventListener("mousedown", mouseDownCanvasGradient);
        insideWindow.canvas.saturation.canvas.parentElement.removeEventListener("mousedown", mouseDownCanvasSaturation);
        insideWindow.canvas.brightness.canvas.parentElement.removeEventListener("mousedown", mouseDownCanvasBrightness);
        insideWindow.barMoveWindow.removeEventListener("mousedown", moveWindow);
        insideWindow.inputs.txtRgb.removeEventListener("keyup", txtRgbKeyUp);
        insideWindow.inputs.txtHex.removeEventListener("keyup", txtHexKeyUp);
        insideWindow.buttons.ok.removeEventListener("mousedown", selectColor)
        insideWindow.buttons.saveColor.removeEventListener("mousedown", saveColor);
        insideWindow.buttons.cancel.removeEventListener("mousedown", close);
    }
    const close = () => {
        removeEventsToElements();
        status.opened = false;
        setStyle(window, { display: null });
        observers.notify("open", false);
    }
    const open = ({ r = 0, g = 0, b = 0 }) => {
        addEventsToElements();
        setStyle(window, { display: "block" });
        status.opened = true;
        setStyle(insideWindow.compareColors.current,
            { backgroundColor: "rgb(" + r + ", " + g + ", " + b + ")" });
        paintSpectrum();
        findColor({ r, g, b });
        observers.notify("open", true);
    }
    return {
        get opened() { return status.opened }, set currentColor(color) { findColor(color) },
        open, addObservers: observers.add
    }
}