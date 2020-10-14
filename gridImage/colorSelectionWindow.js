import { getMousePosition, getElement, setStyle } from "../js/geral.js";

export default function colorSelectionWindowObject(contentWindow) {
    const observers = [], status = { opened: false },
        selectedColor = {
            r: 0, g: 0, b: 0, update({ r, g, b }) {
                this.r = r;
                this.g = g;
                this.b = b;
            }, get() { return { r: this.r, g: this.g, b: this.b } }
        },
        colorHsv = {
            h: 0, s: 100, v: 100, update({ h, s, v }) {
                this.h = h;
                this.s = s;
                this.v = v;
            }, get() { return { h: this.h, s: this.s, v: this.v } }
        },
        window = getElement("janelaSelecionarCor"), insideWindow = {
            barMoveWindow: getElement("moverJanelaSelecionarCor"),
            compareColors: { current: getElement("corAtual"), selected: getElement("corSelecionada") },
            canvas: {
                spectrum: getElement("barraeEspectroCor").getContext("2d"),
                gradient: getElement("gradienteCor").getContext("2d")
            },
            cursors: {
                spectrum: { el: getElement("cursorBarra"), clicked: false },
                gradient: { el: getElement("cursorGradiente"), position: { x: 0, y: 0 }, clicked: false }
            },
            inputs: { txtRgb: getElement("codRGB"), txtHex: getElement("codHEX") },
            buttons: {
                ok: getElement("bttOkSelecionaCor"),
                cancel: getElement("bttCancelarSelecionaCor")
            },
        },
        notifyColorSelected = async color => {
            for (const observer of observers) { await observer(color); }
        },
        rgbTohex = color => {
            const rgb = color.b | (color.g << 8) | (color.r << 16);
            return '#' + (0x1000000 + rgb).toString(16).slice(1);
        },
        hexToRgb = hex => {
            const resul = hex.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
            if (resul) { return resul.slice(1, 4).map(x => parseInt(x, 16)); }
            return null;
        },
        rgbToHsv = color => {
            let rabs, gabs, babs, rr, gg, bb, h, v, s, diff, diffc, percentRoundFn;
            rabs = color.r / 255;
            gabs = color.g / 255;
            babs = color.b / 255;
            v = Math.max(rabs, gabs, babs),
                diff = v - Math.min(rabs, gabs, babs);
            diffc = c => (v - c) / 6 / diff + 1 / 2;
            percentRoundFn = num => (num * 100) / 100;
            if (diff == 0) { h = s = 0; }
            else {
                s = diff / v;
                rr = diffc(rabs);
                gg = diffc(gabs);
                bb = diffc(babs);
                if (rabs === v) { h = bb - gg; }
                else if (gabs === v) { h = (1 / 3) + rr - bb; }
                else if (babs === v) { h = (2 / 3) + gg - rr; }
                if (h < 0) { h += 1; }
                else if (h > 1) { h -= 1; }
            }
            return { h: (h * 360), s: percentRoundFn(s * 100), v: percentRoundFn(v * 100) };
        },
        hsvToRgb = hsvCode => {
            const h = (Math.max(0, Math.min(360, hsvCode.h))) / 60,
                s = (Math.max(0, Math.min(100, hsvCode.s))) / 100,
                v = (Math.max(0, Math.min(100, hsvCode.v))) / 100;
            if (s === 0) {
                v = Math.round(v * 255);
                return { r: v, g: v, b: v };
            }
            const i = Math.floor(h), f = h - i, p = v * (1 - s), q = v * (1 - s * f), t = v * (1 - s * (1 - f)),
                getCodeRgb = {
                    case0: [v, t, p], case1: [q, v, p], case2: [p, v, t],
                    case3: [p, q, v], case4: [t, p, v], case5: [v, p, q]
                }, codeRgb = getCodeRgb["case" + i].map(value => Math.round(value * 255));
            return { r: codeRgb[0], g: codeRgb[1], b: codeRgb[2] };
        },
        paintGradient = color => {
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
        },
        paintSpectrum = () => {
            const spectrum = insideWindow.canvas.spectrum, width = spectrum.canvas.width, height = spectrum.canvas.height;
            spectrum.rect(0, 0, width, height);
            const gradient = spectrum.createLinearGradient(0, 0, width, 0);
            gradient.addColorStop(0, "rgb(255, 0, 0)");
            gradient.addColorStop(0.16666666666666666667, "rgb(255, 255, 0)");
            gradient.addColorStop(0.33333333333333333334, "rgb(0, 255, 0)");
            gradient.addColorStop(0.50000000000000000001, "rgb(0, 255, 255)");
            gradient.addColorStop(0.66666666666666666668, "rgb(0, 0, 255)");
            gradient.addColorStop(0.83333333333333333335, "rgb(255, 0, 255)");
            gradient.addColorStop(1, "rgb(255, 0, 0)");
            spectrum.fillStyle = gradient;
            spectrum.fill();
        },
        findColorInPositionGradient = () => {
            let s = ((insideWindow.cursors.gradient.position.x) * 100) / insideWindow.canvas.gradient.canvas.offsetWidth;
            let v = 100 - ((insideWindow.cursors.gradient.position.y) * 100) / insideWindow.canvas.gradient.canvas.offsetHeight;
            if (s === 0) { s = 0.02; }
            if (v === 0) { v = 0.02; }
            const cor = hsvToRgb({ h: colorHsv.get().h, s: s, v: v });
            const style = { backgroundColor: "rgb(" + cor.r + ", " + cor.g + ", " + cor.b + ")" }
            setStyle(insideWindow.cursors.gradient.el, style);
            setStyle(insideWindow.compareColors.selected, style);
            insideWindow.inputs.txtHex.value = rgbTohex(cor);
            insideWindow.inputs.txtRgb.value = cor.r + ", " + cor.g + ", " + cor.b;
            selectedColor.update(cor);
        },
        moveCursorSpectrum = position => {
            const width = insideWindow.canvas.spectrum.canvas.offsetWidth;
            position = position < 0 ? 0 : position > width ? width : position;
            let h = ((position * 360) / width);
            if (h === 360) { h = 0; }
            colorHsv.update({ h: h, s: 100, v: 100 });
            const color = hsvToRgb(colorHsv.get());
            setStyle(insideWindow.cursors.spectrum.el, {
                top: "0px", left: (position - 10) + "px",
                backgroundColor: "rgb(" + color.r + ", " + color.g + ", " + color.b + ")"
            })
            paintGradient(color);
            findColorInPositionGradient();
        },
        moveCursorGradient = ({ x, y }) => {
            const width = insideWindow.canvas.gradient.canvas.offsetWidth, height = insideWindow.canvas.gradient.canvas.offsetHeight;
            const position = { x: x < 0 ? 0 : x > width ? width : x, y: y < 0 ? 0 : y > height ? height : y }
            insideWindow.cursors.gradient.position = position;
            setStyle(insideWindow.cursors.gradient.el, {
                left: (position.x - 10) + "px", top: (position.y - 10) + "px"
            });
            findColorInPositionGradient();
        },
        mouseDownCanvasSpectrum = e => {
            insideWindow.cursors.spectrum.clicked = true;
            moveCursorSpectrum(getMousePosition(e.currentTarget, e).x);
        },
        mouseDownCanvasGradient = e => {
            insideWindow.cursors.gradient.clicked = true;
            moveCursorGradient(getMousePosition(e.currentTarget, e));
        },
        mouseMoveMoveCursors = e => {
            if (insideWindow.cursors.gradient.clicked) { moveCursorGradient(getMousePosition(insideWindow.canvas.gradient.canvas, e)); }
            else if (insideWindow.cursors.spectrum.clicked) { moveCursorSpectrum(getMousePosition(insideWindow.canvas.spectrum.canvas, e).x); }
        },
        mouseUpMoveCursors = () => {
            insideWindow.cursors.spectrum.clicked = insideWindow.cursors.gradient.clicked = false;
        },
        moveWindow = (() => {
            let mousePositionMoveWindow = { x: 0, y: 0, };
            const move = e => {
                const { x, y } = getMousePosition(contentWindow, e), { x: bx, y: by } = mousePositionMoveWindow;
                const left = x - bx, top = y - by;
                const validateLeft = left < 0 ? 0 : left + window.offsetWidth > contentWindow.offsetWidth ?
                    contentWindow.offsetWidth - window.offsetWidth : left;
                const validateTop = top < 50 ? 50 : top + window.offsetHeight > contentWindow.offsetHeight ?
                    contentWindow.offsetHeight - window.offsetHeight : top;
                setStyle(window, { top: validateTop + "px", left: validateLeft + "px" });
            }, up = () => {
                document.removeEventListener("mousemove", move);
                document.removeEventListener("mouseup", up);
            }, down = e => {
                mousePositionMoveWindow = getMousePosition(e.currentTarget, e);
                document.addEventListener("mousemove", move);
                document.addEventListener("mouseup", up);
            }
            return down;
        })(),
        findCursorsPosition = () => {
            const { h, s, v } = colorHsv.get(), gradient = insideWindow.canvas.gradient.canvas,
                spectrum = insideWindow.canvas.spectrum.canvas;
            const posx = (gradient.offsetWidth / 100) * s, posy = gradient.offsetHeight - ((gradient.offsetHeight / 100) * v);
            const posx2 = (spectrum.offsetWidth / 360) * h;
            moveCursorSpectrum(posx2);
            moveCursorGradient({ x: posx, y: posy });
        },
        findColor = color => {
            paintSpectrum();
            colorHsv.update(rgbToHsv(color));
            findCursorsPosition();
        },
        txtRgbKeyUp = e => {
            const codColor = e.currentTarget.value.split(",") || e.currentTarget.value.split(", ");
            for (let i = 0; i < codColor.length; i++) { codColor[i] = +codColor[i]; }
            if (codColor.length === 3) {
                if (codColor[0] <= 255 && codColor[1] <= 255 && codColor[2] <= 255) {
                    findColor({ r: codColor[0], g: codColor[1], b: codColor[2] });
                }
            }
        },
        txtHexKeyUp = e => {
            const codCorHEX = e.currentTarget.value.indexOf('#') === -1 ? "#" + e.currentTarget.value : e.currentTarget.value,
                codColor = hexToRgb(codCorHEX);
            if (codColor === null) { return; }
            findColor({ r: codColor[0], g: codColor[1], b: codColor[2] });
        },
        addEventsToElements = () => {
            document.addEventListener("mousemove", mouseMoveMoveCursors);
            document.addEventListener("mouseup", mouseUpMoveCursors);
            insideWindow.canvas.spectrum.canvas.parentNode.addEventListener("mousedown", mouseDownCanvasSpectrum);
            insideWindow.canvas.gradient.canvas.parentNode.addEventListener("mousedown", mouseDownCanvasGradient);
            insideWindow.barMoveWindow.addEventListener("mousedown", moveWindow);
            insideWindow.inputs.txtRgb.addEventListener("keyup", txtRgbKeyUp);
            insideWindow.inputs.txtHex.addEventListener("keyup", txtHexKeyUp);
            insideWindow.buttons.ok.addEventListener("mousedown", selectColor);
            insideWindow.buttons.cancel.addEventListener("mousedown", close);
        },
        removeEventsToElements = () => {
            document.removeEventListener("mousemove", mouseMoveMoveCursors);
            document.removeEventListener("mouseup", mouseUpMoveCursors);
            insideWindow.canvas.spectrum.canvas.parentNode.removeEventListener("mousedown", mouseDownCanvasSpectrum);
            insideWindow.canvas.gradient.canvas.parentNode.removeEventListener("mousedown", mouseDownCanvasGradient);
            insideWindow.barMoveWindow.removeEventListener("mousedown", moveWindow);
            insideWindow.inputs.txtRgb.removeEventListener("keyup", txtRgbKeyUp);
            insideWindow.inputs.txtHex.removeEventListener("keyup", txtHexKeyUp);
            insideWindow.buttons.ok.removeEventListener("mousedown", selectColor)
            insideWindow.buttons.cancel.removeEventListener("mousedown", close);
        },
        close = () => {
            removeEventsToElements();
            status.opened = false;
            setStyle(window, { display: null });
        },
        selectColor = () => {
            notifyColorSelected(selectedColor.get());
            close();
        }

    return {
        get isOpen() { return status.opened },
        set currentColor(color) { findColor(color) },
        open(color) {
            if (status.opened) { return };
            addEventsToElements();
            insideWindow.cursors.spectrum.clicked = insideWindow.cursors.gradient.clicked = false;
            setStyle(window, { display: "block" });
            status.opened = true;
            setStyle(insideWindow.compareColors.current, {
                backgroundColor: "rgb(" + color.r + ", " + color.g + ", " + color.b + ")",
            });
            findColor(color);
        },
        addObservers(newObservers) {
            for (const observer of newObservers) { observers.push(observer); }
        }
    }
}