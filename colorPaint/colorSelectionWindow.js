function colorSelectionWindowObject() {
    return {
        opened: false,
        primaryOrSecondary: 1,
        selectedColor: { r: 0, g: 0, b: 0 },
        colorHsv: { h: 0, s: 100, v: 100 },
        compareColors: { current: document.getElementById("corAtual"), selected: document.getElementById("corSelecionada") },
        window: document.getElementById("janelaSelecionarCor"),
        barMoveWindow: { el: document.getElementById("moverJanelaSelecionarCor"), clicked: false },
        inputs: { txtRgb: document.getElementById("codRGB"), txtHex: document.getElementById("codHEX") },
        buttons: {
            ok: document.getElementById("bttOkSelecionaCor"),
            saveColor: document.getElementById("bttSalvarCor"),
            cancel: document.getElementById("bttCancelarSelecionaCor")
        },
        canvas: {
            spectrum: document.getElementById("barraeEspectroCor").getContext("2d"),
            gradient: document.getElementById("gradienteCor").getContext("2d")
        },
        cursors: {
            spectrum: { el: document.getElementById("cursorBarra"), clicked: false },
            gradient: { el: document.getElementById("cursorGradiente"), position: { x: 0, y: 0 }, clicked: false }
        },
        mousePositionMoveWindow: null,
        addEventsToElements() {
            this.window.addEventListener("mousemove", (e) => this.moveCursors(e));
            document.addEventListener("mouseup", () => {
                if (!this.opened) { return; }
                this.cursors.spectrum.clicked = this.cursors.gradient.clicked = this.barMoveWindow.clicked = false;
            });
            this.canvas.spectrum.canvas.parentNode.addEventListener("mousedown", (e) => {
                this.cursors.spectrum.clicked = true;
                this.moveCursorSpectrum(getMousePosition(e.currentTarget, e).x);
            });
            this.canvas.gradient.canvas.parentNode.addEventListener("mousedown", (e) => {
                this.cursors.gradient.clicked = true;
                this.moveCursorGradient(getMousePosition(e.currentTarget, e));
            });
        },
        removeEventsToElements() {
            document.removeEventListener("mousemove", colorSelectionWindow.mouseMoveEvent);
            this.barMoveWindow.el = cloneReplaceElement(this.barMoveWindow.el);
            this.inputs.txtRgb = cloneReplaceElement(this.inputs.txtRgb);
            this.inputs.txtHex = cloneReplaceElement(this.inputs.txtHex);
            this.buttons.ok = cloneReplaceElement(this.buttons.ok);
            this.buttons.saveColor = cloneReplaceElement(this.buttons.saveColor);
            this.buttons.cancel = cloneReplaceElement(this.buttons.cancel);
        },
        moveWindow(mousePosition, move) {
            if (move) {
                let newPositionX = mousePosition.x - this.mousePositionMoveWindow.x,
                    newPositionY = mousePosition.y - this.mousePositionMoveWindow.y;
                if (newPositionX < 0) { newPositionX = 0; }
                else if (newPositionX + this.window.offsetWidth > janelaPrincipal.offsetWidth) {
                    newPositionX = janelaPrincipal.offsetWidth - this.window.offsetWidth;
                }
                if (newPositionY < 50) { newPositionY = 50 }
                else if (newPositionY + this.window.offsetHeight > janelaPrincipal.offsetHeight) {
                    newPositionY = janelaPrincipal.offsetHeight - this.window.offsetHeight;
                }
                this.window.style.left = newPositionX + "px";
                this.window.style.top = newPositionY + "px";
            } else {
                this.barMoveWindow.clicked = true;
                this.mousePositionMoveWindow = mousePosition;
                document.addEventListener("mousemove", colorSelectionWindow.mouseMoveEvent);
            }
        },
        mouseMoveEvent(e) {
            if (colorSelectionWindow.barMoveWindow.clicked) {
                colorSelectionWindow.moveWindow(getMousePosition(janelaPrincipal, e), true);
            }
        },
        findColor(color) {
            this.paintSpectrum();
            this.colorHsv = this.rgbToHsv(color);
            this.findCursorPosition();
        },
        findCursorPosition() {
            const gradient = this.canvas.gradient.canvas, spectrum = this.canvas.spectrum.canvas;
            const posx = (gradient.offsetWidth / 100) * this.colorHsv.s, posy = gradient.offsetHeight - ((gradient.offsetHeight / 100) * this.colorHsv.v);
            const posx2 = (spectrum.offsetWidth / 360) * this.colorHsv.h;
            this.moveCursorSpectrum(posx2);
            this.moveCursorGradient({ x: posx, y: posy });
        },
        moveCursors(e) {
            if (this.cursors.gradient.clicked) { this.moveCursorGradient(getMousePosition(this.canvas.gradient.canvas, e)); }
            else if (this.cursors.spectrum.clicked) { this.moveCursorSpectrum(getMousePosition(this.canvas.spectrum.canvas, e).x); }
        },
        moveCursorSpectrum(position) {
            const widthBar = this.canvas.spectrum.canvas.offsetWidth;
            if (position < 0) { position = 0; }
            else if (position > widthBar) { position = widthBar; }
            this.cursors.spectrum.el.style.top = "0px";
            this.cursors.spectrum.el.style.left = (position - 10) + "px";
            let h = ((position * 360) / widthBar);
            if (h === 360) { h = 0; }
            this.colorHsv = { h: h, s: 100, v: 100 };
            const color = this.hsvToRgb(this.colorHsv);
            this.cursors.spectrum.el.style.backgroundColor = "rgb(" + color.r + ", " + color.g + ", " + color.b + ")";
            this.paintGradient(color);
            this.findColorInPositionGradient();
        },
        moveCursorGradient(position) {
            const width = this.canvas.gradient.canvas.offsetWidth, height = this.canvas.gradient.canvas.offsetHeight;
            if (position.x < 0) { position.x = 0 }
            else if (position.x > width) { position.x = width }
            if (position.y < 0) { position.y = 0 }
            else if (position.y > height) { position.y = height }
            this.cursors.gradient.position = { x: position.x, y: position.y };
            this.cursors.gradient.el.style.left = (position.x - 10) + "px";
            this.cursors.gradient.el.style.top = (position.y - 10) + "px";
            this.findColorInPositionGradient();
        },
        findColorInPositionGradient() {
            let s = ((this.cursors.gradient.position.x) * 100) / this.canvas.gradient.canvas.offsetWidth;
            let v = 100 - ((this.cursors.gradient.position.y) * 100) / this.canvas.gradient.canvas.offsetHeight;
            if (s === 0) { s = 0.02; }
            if (v === 0) { v = 0.02; }
            const cor = this.hsvToRgb({ h: this.colorHsv.h, s: s, v: v });
            const stringCorRGB = "rgb(" + cor.r + ", " + cor.g + ", " + cor.b + ")";
            this.cursors.gradient.el.style.backgroundColor = stringCorRGB;
            this.compareColors.selected.style.backgroundColor = stringCorRGB;
            this.inputs.txtHex.value = this.rgbTohex(cor);
            this.inputs.txtRgb.value = cor.r + ", " + cor.g + ", " + cor.b;
            this.selectedColor = cor;
        },
        txtRgbKeyUp(e) {
            let codColor = e.currentTarget.value;
            codColor = codColor.split(",") || codColor.split(", ");
            for (let i = 0; i < codColor.length; i++) { codColor[i] = parseInt(codColor[i]); }
            if (codColor.length === 3) {
                if (codColor[0] <= 255 && codColor[1] <= 255 && codColor[2] <= 255) {
                    this.findColor({ r: codColor[0], g: codColor[1], b: codColor[2] });
                }
            }
        },
        txtHexKeyUp(e) {
            let codCorHEX = e.currentTarget.value;
            if (codCorHEX.indexOf("#") === -1) { codCorHEX = "#" + codCorHEX; }
            let codColor = this.hexToRgb(codCorHEX);
            if (codColor === null) { return; }
            if (codColor[0] <= 255 && codColor[1] <= 255 && codColor[2] <= 255) {
                this.findColor({ r: codColor[0], g: codColor[1], b: codColor[2] });
            }
        },
        open(num) {
            this.barMoveWindow.el.addEventListener("mousedown", (e) => this.moveWindow(getMousePosition(e.currentTarget, e), false));
            this.inputs.txtRgb.addEventListener("keyup", (e) => this.txtRgbKeyUp(e));
            this.inputs.txtHex.addEventListener("keyup", (e) => this.txtHexKeyUp(e));
            this.buttons.ok.addEventListener("mousedown", () => this.selectColor())
            this.buttons.saveColor.addEventListener("mousedown", () => project.saveColor(this.selectedColor));
            this.buttons.cancel.addEventListener("mousedown", () => this.close());
            this.primaryOrSecondary = num;
            this.cursors.spectrum.clicked = this.cursors.gradient.clicked = this.clickMoveWindow = false;
            let color;
            if (this.primaryOrSecondary === 1) { color = project.selectedColors.primary; }
            else if (this.primaryOrSecondary === 2) { color = project.selectedColors.secondary; }
            drawingTools.selectDrawingTool(drawingTools.arrayTools.length - 1);//Mudar para a ferramenta Conta-gotas.
            this.window.style.display = "block";
            this.opened = true;
            this.compareColors.current.style.backgroundColor = "rgb(" + color.r + ", " + color.g + ", " + color.b + ")";
            this.findColor(color);
        },
        close() {
            this.removeEventsToElements();
            this.opened = false;
            drawingTools.selectDrawingTool(drawingTools.previousTool);
            this.window.style.display = "none";
        },
        selectColor() {
            const styleColor = "rgb(" + this.selectedColor.r + ", " + this.selectedColor.g + ", " + this.selectedColor.b + ")";
            if (this.primaryOrSecondary === 1) {
                project.selectedColors.primary = this.selectedColor;
                corPrincipal.style.backgroundColor = styleColor;
                txtCorEscolhida.value = styleColor;
            } else if (this.primaryOrSecondary === 2) {
                project.selectedColors.secondary = this.selectedColor;
                corSecundaria.style.backgroundColor = styleColor;
            }
            this.close();
            for (let i = 0; i < project.savedColors.length; i++) {
                project.savedColors[i].selected = false;
                project.savedColors[i].element.style.boxShadow = "";
            }
        },
        paintGradient(color) {
            const gradient = this.canvas.gradient, width = gradient.canvas.width, height = gradient.canvas.height;
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
        paintSpectrum() {
            const spectrum = this.canvas.spectrum, width = spectrum.canvas.width, height = spectrum.canvas.height;
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
        rgbTohex(color) {
            const rgb = color.b | (color.g << 8) | (color.r << 16);
            return '#' + (0x1000000 + rgb).toString(16).slice(1)
        },
        hexToRgb(hex) {
            const resul = hex.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
            if (resul) { return resul.slice(1, 4).map(function (x) { return parseInt(x, 16); }); }
            return null;
        },
        rgbToHsv(color) {
            let rabs, gabs, babs, rr, gg, bb, h, v, s, diff, diffc, percentRoundFn;
            rabs = color.r / 255;
            gabs = color.g / 255;
            babs = color.b / 255;
            v = Math.max(rabs, gabs, babs),
                diff = v - Math.min(rabs, gabs, babs);
            diffc = c => (v - c) / 6 / diff + 1 / 2;
            percentRoundFn = num => (num * 100) / 100;
            if (diff == 0) {
                h = s = 0;
            } else {
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
        hsvToRgb(hsvCode) {
            let h = hsvCode.h, s = hsvCode.s, v = hsvCode.v, r, g, b, i, f, p, q, t;
            h = Math.max(0, Math.min(360, h));
            s = Math.max(0, Math.min(100, s));
            v = Math.max(0, Math.min(100, v));
            s = s / 100;
            v = v / 100;
            if (s == 0) {
                r = g = b = v;
                return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
            }
            h /= 60;
            i = Math.floor(h);
            f = h - i;
            p = v * (1 - s);
            q = v * (1 - s * f);
            t = v * (1 - s * (1 - f));
            switch (i) {
                case 0:
                    r = v;
                    g = t;
                    b = p;
                    break;
                case 1:
                    r = q;
                    g = v;
                    b = p;
                    break;
                case 2:
                    r = p;
                    g = v;
                    b = t;
                    break;
                case 3:
                    r = p;
                    g = q;
                    b = v;
                    break;
                case 4:
                    r = t;
                    g = p;
                    b = v;
                    break;
                case 5:
                    r = v;
                    g = p;
                    b = q;
            }
            return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
        }
    }
}