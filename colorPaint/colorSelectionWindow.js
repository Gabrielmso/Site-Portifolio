import { getMousePosition, elementById } from "../js/geral.js";

export default function colorSelectionWindowObject() {
    const D = {}, status = { opened: false, primaryOrSecondary: 1 }, mousePositionMoveWindow = {
        x: 0, y: 0, update({ x, y }) {
            this.x = x;
            this.y = y;
        }, get() { return { x: this.x, y: this.y } }
    }, selectedColor = {
        r: 0, g: 0, b: 0, update({ r, g, b }) {
            this.r = r;
            this.g = g;
            this.b = b;
        }, get() { return { r: this.r, g: this.g, b: this.b } }
    }, colorHsv = {
        h: 0, s: 100, v: 100, update({ h, s, v }) {
            this.h = h;
            this.s = s;
            this.v = v;
        }, get() { return { h: this.h, s: this.s, v: this.v } }
    }, window = elementById("janelaSelecionarCor"), insideWindow = {
        barMoveWindow: elementById("moverJanelaSelecionarCor"),
        compareColors: { current: elementById("corAtual"), selected: elementById("corSelecionada") },
        canvas: {
            spectrum: elementById("barraeEspectroCor").getContext("2d"),
            gradient: elementById("gradienteCor").getContext("2d")
        },
        cursors: {
            spectrum: { el: elementById("cursorBarra"), clicked: false },
            gradient: { el: elementById("cursorGradiente"), position: { x: 0, y: 0 }, clicked: false }
        },
        inputs: { txtRgb: elementById("codRGB"), txtHex: elementById("codHEX") },
        buttons: {
            ok: elementById("bttOkSelecionaCor"),
            saveColor: elementById("bttSalvarCor"),
            cancel: elementById("bttCancelarSelecionaCor")
        },
    }, rgbTohex = (color) => {
        const rgb = color.b | (color.g << 8) | (color.r << 16);
        return '#' + (0x1000000 + rgb).toString(16).slice(1);
    }, hexToRgb = (hex) => {
        const resul = hex.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
        if (resul) { return resul.slice(1, 4).map(x => parseInt(x, 16)); }
        return null;
    }, rgbToHsv = (color) => {
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
    }, hsvToRgb = (hsvCode) => {
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
    }, paintGradient = (color) => {
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
    }, paintSpectrum = () => {
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
    }, findColorInPositionGradient = () => {
        let s = ((insideWindow.cursors.gradient.position.x) * 100) / insideWindow.canvas.gradient.canvas.offsetWidth;
        let v = 100 - ((insideWindow.cursors.gradient.position.y) * 100) / insideWindow.canvas.gradient.canvas.offsetHeight;
        if (s === 0) { s = 0.02; }
        if (v === 0) { v = 0.02; }
        const cor = hsvToRgb({ h: colorHsv.get().h, s: s, v: v });
        const stringCorRGB = "rgb(" + cor.r + ", " + cor.g + ", " + cor.b + ")";
        insideWindow.cursors.gradient.el.style.backgroundColor = stringCorRGB;
        insideWindow.compareColors.selected.style.backgroundColor = stringCorRGB;
        insideWindow.inputs.txtHex.value = rgbTohex(cor);
        insideWindow.inputs.txtRgb.value = cor.r + ", " + cor.g + ", " + cor.b;
        selectedColor.update(cor);
    }, moveCursorSpectrum = (position) => {
        const width = insideWindow.canvas.spectrum.canvas.offsetWidth;
        position = position < 0 ? 0 : position > width ? width : position;
        insideWindow.cursors.spectrum.el.style.top = "0px";
        insideWindow.cursors.spectrum.el.style.left = (position - 10) + "px";
        let h = ((position * 360) / width);
        if (h === 360) { h = 0; }
        colorHsv.update({ h: h, s: 100, v: 100 });
        const color = hsvToRgb(colorHsv.get());
        insideWindow.cursors.spectrum.el.style.backgroundColor = "rgb(" + color.r + ", " + color.g + ", " + color.b + ")";
        paintGradient(color);
        findColorInPositionGradient();
    }, moveCursorGradient = (position) => {
        const width = insideWindow.canvas.gradient.canvas.offsetWidth, height = insideWindow.canvas.gradient.canvas.offsetHeight;
        position.x = position.x < 0 ? 0 : position.x > width ? width : position.x;
        position.y = position.y < 0 ? 0 : position.y > height ? height : position.y;
        insideWindow.cursors.gradient.position = { x: position.x, y: position.y };
        insideWindow.cursors.gradient.el.style.left = (position.x - 10) + "px";
        insideWindow.cursors.gradient.el.style.top = (position.y - 10) + "px";
        findColorInPositionGradient();
    }, mouseDownCanvasSpectrum = (e) => {
        insideWindow.cursors.spectrum.clicked = true;
        moveCursorSpectrum(getMousePosition(e.currentTarget, e).x);
    }, mouseDownCanvasGradient = (e) => {
        insideWindow.cursors.gradient.clicked = true;
        moveCursorGradient(getMousePosition(e.currentTarget, e));
    }, mouseMoveMoveCursors = (e) => {
        if (insideWindow.cursors.gradient.clicked) { moveCursorGradient(getMousePosition(insideWindow.canvas.gradient.canvas, e)); }
        else if (insideWindow.cursors.spectrum.clicked) { moveCursorSpectrum(getMousePosition(insideWindow.canvas.spectrum.canvas, e).x); }
    }, mouseUpMoveCursors = () => {
        insideWindow.cursors.spectrum.clicked = insideWindow.cursors.gradient.clicked = false;
    }, moveWindow = (mousePosition) => {
        const { x, y } = mousePositionMoveWindow.get();
        let newPositionX = mousePosition.x - x, newPositionY = mousePosition.y - y;
        newPositionX = newPositionX < 0 ? 0 : newPositionX + window.offsetWidth > D.janelaPrincipal.offsetWidth ?
            D.janelaPrincipal.offsetWidth - window.offsetWidth : newPositionX;
        newPositionY = newPositionY < 50 ? 50 : newPositionY + window.offsetHeight > D.janelaPrincipal.offsetHeight ?
            D.janelaPrincipal.offsetHeight - window.offsetHeight : newPositionY;
        window.style.left = newPositionX + "px";
        window.style.top = newPositionY + "px";
    }, mouseDownEventMoveWindow = (e) => {
        mousePositionMoveWindow.update(getMousePosition(e.currentTarget, e));
        document.addEventListener("mousemove", mouseMoveEventMoveWindow);
        document.addEventListener("mouseup", mouseUpEventMoveWindow);
    }, mouseMoveEventMoveWindow = (e) => {
        moveWindow(getMousePosition(D.janelaPrincipal, e))
    }, mouseUpEventMoveWindow = (e) => {
        document.removeEventListener("mousemove", mouseMoveEventMoveWindow);
        document.removeEventListener("mouseup", mouseUpEventMoveWindow);
    }, findCursorsPosition = () => {
        const { h, s, v } = colorHsv.get(), gradient = insideWindow.canvas.gradient.canvas,
            spectrum = insideWindow.canvas.spectrum.canvas;
        const posx = (gradient.offsetWidth / 100) * s, posy = gradient.offsetHeight - ((gradient.offsetHeight / 100) * v);
        const posx2 = (spectrum.offsetWidth / 360) * h;
        moveCursorSpectrum(posx2);
        moveCursorGradient({ x: posx, y: posy });
    }, findColor = (color) => {
        paintSpectrum();
        colorHsv.update(rgbToHsv(color));
        findCursorsPosition();
    }, txtRgbKeyUp = (e) => {
        const codColor = e.currentTarget.value.split(",") || e.currentTarget.value.split(", ");
        for (let i = 0; i < codColor.length; i++) { codColor[i] = +codColor[i]; }
        if (codColor.length === 3) {
            if (codColor[0] <= 255 && codColor[1] <= 255 && codColor[2] <= 255) {
                findColor({ r: codColor[0], g: codColor[1], b: codColor[2] });
            }
        }
    }, txtHexKeyUp = (e) => {
        const codCorHEX = e.currentTarget.value.indexOf('#') === -1 ? "#" + e.currentTarget.value : e.currentTarget.value,
            codColor = hexToRgb(codCorHEX);
        if (codColor === null) { return; }
        findColor({ r: codColor[0], g: codColor[1], b: codColor[2] });
    }, addEventsToElements = () => {
        window.addEventListener("mousemove", mouseMoveMoveCursors);
        insideWindow.canvas.spectrum.canvas.parentNode.addEventListener("mousedown", mouseDownCanvasSpectrum);
        insideWindow.canvas.gradient.canvas.parentNode.addEventListener("mousedown", mouseDownCanvasGradient);
        document.addEventListener("mouseup", mouseUpMoveCursors);
        insideWindow.barMoveWindow.addEventListener("mousedown", mouseDownEventMoveWindow);
        insideWindow.inputs.txtRgb.addEventListener("keyup", txtRgbKeyUp);
        insideWindow.inputs.txtHex.addEventListener("keyup", txtHexKeyUp);
        insideWindow.buttons.ok.addEventListener("mousedown", selectColor)
        insideWindow.buttons.saveColor.addEventListener("mousedown", bttSaveColor);
        insideWindow.buttons.cancel.addEventListener("mousedown", close);
    }, removeEventsToElements = () => {
        window.removeEventListener("mousemove", mouseMoveMoveCursors);
        insideWindow.canvas.spectrum.canvas.parentNode.removeEventListener("mousedown", mouseDownCanvasSpectrum);
        insideWindow.canvas.gradient.canvas.parentNode.removeEventListener("mousedown", mouseDownCanvasGradient);
        document.removeEventListener("mouseup", mouseUpMoveCursors);
        insideWindow.barMoveWindow.removeEventListener("mousedown", mouseDownEventMoveWindow);
        insideWindow.inputs.txtRgb.removeEventListener("keyup", txtRgbKeyUp);
        insideWindow.inputs.txtHex.removeEventListener("keyup", txtHexKeyUp);
        insideWindow.buttons.ok.removeEventListener("mousedown", selectColor)
        insideWindow.buttons.saveColor.removeEventListener("mousedown", bttSaveColor);
        insideWindow.buttons.cancel.removeEventListener("mousedown", close);
    }, close = () => {
        removeEventsToElements();
        status.opened = false;
        D.drawingTools.selectDrawingTool(D.drawingTools.previousTool);
        window.style.display = "none";
    }, selectColor = () => {
        D.project.selectedColors.set(status.primaryOrSecondary, selectedColor.get());
        close();
        D.project.selectedColors.deselectAllSavedColor();
    }, bttSaveColor = () => { D.project.saveColor(selectedColor.get()); }

    return {
        get opened() { return status.opened },
        set currentColor(color) { findColor(color) },
        open(numPlane) {
            addEventsToElements();
            status.primaryOrSecondary = numPlane;
            insideWindow.cursors.spectrum.clicked = insideWindow.cursors.gradient.clicked = this.clickMoveWindow = false;
            const color = D.project.selectedColors.get(status.primaryOrSecondary);
            D.drawingTools.selectDrawingTool("eyeDropper");
            window.style.display = "block";
            status.opened = true;
            insideWindow.compareColors.current.style.backgroundColor = "rgb(" + color.r + ", " + color.g + ", " + color.b + ")";
            findColor(color);
        },
        addDependencies(dependencies) {
            for (const prop in dependencies) { D[prop] = dependencies[prop]; }
        }
    }
}