function createProjectWindowObject() {
    return {
        contentWindow: document.getElementById("contentJanelaCriarProjeto"),
        buttons: {
            create: document.getElementById("bttCriarprojeto"),
            cancel: document.getElementById("bttCancelaCriarprojetor")
        },
        open() {
            if (!project.created) {
                this.contentWindow.style.display = "flex";
                this.buttons.create.addEventListener("mousedown", () => this.validateProperties());
                this.buttons.cancel.addEventListener("mousedown", () => this.close());
            } else {
                if (confirm("Todo o progresso não salvo será perdido, deseja continuar?")) {
                    sessionStorage.setItem("criarNovoProjeto", "true");
                    window.location.reload();
                }
            }
        },
        close() {
            this.buttons.create = cloneReplaceElement(this.buttons.create);
            this.buttons.cancel = cloneReplaceElement(this.buttons.cancel);
            this.contentWindow.style.display = "none";
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
                } else { el.style.backgroundColor = "rgba(0, 0, 0, 0)"; }
            }
            const nomeProjeto = (arrayProperties[0].value).replace(/ /g, "-"),
                larguraProjeto = parseInt(arrayProperties[1].value),
                alturaProjeto = parseInt(arrayProperties[2].value),
                valueCor = parseInt(arrayProperties[3].value),
                numeroCamadas = parseInt(arrayProperties[4].value);

            if (larguraProjeto > 2560 || larguraProjeto < 1) {
                campoInvalido(arrayProperties[1]);
                return;
            } else if (alturaProjeto > 1440 || alturaProjeto < 1) {
                campoInvalido(arrayProperties[2]);
                return;
            } else if (valueCor > 4 || valueCor < 1) {
                campoInvalido(arrayProperties[3]);
                return;
            } else if (numeroCamadas > 5 || numeroCamadas < 1) {
                campoInvalido(arrayProperties[4]);
                return;
            }
            let color;
            if (valueCor === 1) { color = { r: 255, g: 255, b: 255 }; }
            else if (valueCor === 2) { color = { r: 0, g: 0, b: 0 }; }
            else if (valueCor === 3) { color = false; }
            else { color = corEscolhidaPrincipal; }
            for (let i = 0; i < arrayProperties.length; i++) { arrayProperties[i].style.backgroundColor = "rgb(37, 37, 37)"; }
            project.create(nomeProjeto, { width: larguraProjeto, height: alturaProjeto }, color, numeroCamadas);
            this.close();
            function campoInvalido(campo) {
                campo.focus();
                campo.style.backgroundColor = "rgba(255, 0, 0, 0.25)";
            }
        },
    }
}