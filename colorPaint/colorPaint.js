mudarMenu = false;
let corPrincipal, corSecundaria;
let createProjectWindow, project, drawingTools, previewFunctions, undoRedoChange, hotKeys, createGridWindow, colorSelectionWindow,
    notification, openProject;
let janelaPrincipal;
let contentTelas;//Elemento onde ficará a "tela" para desenhar.
let txtCorEscolhida;//Recebe a string da cor do primeiro plano no formato RGB para informar ao usuário.
let txtPorcentagemZoom;//Recebe a string com a porcentagem de zoom no "project.screen".
function colorPaint() {
    createProjectWindow = createProjectWindowObject();
    project = projectObject();
    openProject = openProjectObject();
    colorSelectionWindow = colorSelectionWindowObject();
    drawingTools = drawingToolsObject();
    previewFunctions = previewFunctionsObject();
    undoRedoChange = undoRedoChangeObject();
    hotKeys = hotKeysObject();
    createGridWindow = createGridWindowObject();
    notification = notificationsObject();
    const contentJanelaAtalhos = document.getElementById("contentJanelaAtalhos");
    const contentTools = document.getElementById("contentTools");
    const barraLateralEsquerda = document.getElementById("barraLateralEsquerda");
    const barraLateralDireita = document.getElementById("barraLateralDireita");
    const contentCentro = document.getElementById("contentCentro");
    janelaPrincipal = document.getElementById("colorPaintContent");
    contentTelas = document.getElementById("contentTelas");
    corPrincipal = document.getElementById("corPrincipal");
    corSecundaria = document.getElementById("corSecundaria");
    txtCorEscolhida = document.getElementById("txtCorEscolhida");
    txtPorcentagemZoom = document.getElementById("txtPorcentagemZoom");

    menuPadrao();
    ajustarContents();
    criarOuAbrirProjeto();
    txtCorEscolhida.value = "rgb(" + project.selectedColors.primary.r + ", " + project.selectedColors.primary.g + ", " + project.selectedColors.primary.b + ")";

    project.addEventsToElements();
    colorSelectionWindow.addEventsToElements();
    notification.addEventsToElements();

    document.getElementById("bttCriarNovoProjeto").addEventListener("mousedown", () => createProjectWindow.open());
    document.getElementById("bttCriarGrade").addEventListener("mousedown", () => createGridWindow.open());

    corPrincipal.addEventListener("click", function () {
        if (colorSelectionWindow.opened) { colorSelectionWindow.findColor(project.selectedColors.primary); }
        else { colorSelectionWindow.open(1); }
    });

    corSecundaria.addEventListener("click", function () {
        if (colorSelectionWindow.opened) { colorSelectionWindow.findColor(project.selectedColors.secondary); }
        else { colorSelectionWindow.open(2); }
    });

    document.getElementById("bttCoresPrincipais").addEventListener("mousedown", function () {//Coloca preto na corPrincipalEcolhida e branco na corSecundariaEscolhida.
        if (!colorSelectionWindow.opened) {
            project.selectedColors.primary = { r: 0, g: 0, b: 0 };
            project.selectedColors.secondary = { r: 255, g: 255, b: 255 };
            corPrincipal.style.backgroundColor = "rgb(" + project.selectedColors.primary.r + ", " + project.selectedColors.primary.g + ", " + project.selectedColors.primary.b + ")";
            corSecundaria.style.backgroundColor = "rgb(" + project.selectedColors.secondary.r + ", " + project.selectedColors.secondary.g + ", " + project.selectedColors.secondary.b + ")";
            txtCorEscolhida.value = "rgb(" + project.selectedColors.primary.r + ", " + project.selectedColors.primary.g + ", " + project.selectedColors.primary.b + ")";
        }
    });

    document.getElementById("bttAlternaCor").addEventListener("mousedown", () => {
        if (!colorSelectionWindow.opened) {
            corPrincipal.style.backgroundColor = "rgb(" + project.selectedColors.secondary.r + ", " + project.selectedColors.secondary.g + ", " + project.selectedColors.secondary.b + ")";
            corSecundaria.style.backgroundColor = "rgb(" + project.selectedColors.primary.r + ", " + project.selectedColors.primary.g + ", " + project.selectedColors.primary.b + ")";
            const cor = project.selectedColors.primary;
            project.selectedColors.primary = project.selectedColors.secondary;
            project.selectedColors.secondary = cor;
            txtCorEscolhida.value = "rgb(" + project.selectedColors.primary.r + ", " + project.selectedColors.primary.g + ", " + project.selectedColors.primary.b + ")";
        }
    });

    document.getElementById("bttZoomMais").addEventListener("mousedown", () => project.zoom(true, true, 1.25));
    document.getElementById("bttZoomMenos").addEventListener("mousedown", () => project.zoom(false, true, 1.25));

    txtPorcentagemZoom.addEventListener("keyup", (e) => {
        if (e.code === "Enter" || e.keyCode === 13) {
            const valor = parseFloat(((e.currentTarget.value).replace("%", "")).replace(",", "."));
            if (isNaN(valor) === false && valor >= 1) { project.zoom("porcentagem", true, valor); }
        }
    });

    document.getElementById("bttAtalhos").addEventListener("click", () => {
        contentJanelaAtalhos.style.display = "flex";
        backgroundBlur(true);
    });
    document.getElementById("bttOkAtalhos").addEventListener("click", () => {
        contentJanelaAtalhos.style.display = "none";
        backgroundBlur(false);
    });

    document.getElementById("colorPaintContent").addEventListener("wheel", (e) => {//Zoom com o scroll do mouse.
        if (hotKeys.ctrlPressed) {
            e.preventDefault();
            if (e.deltaY < 0) { project.zoom(true, false, 1.10); }
            else { project.zoom(false, false, 1.10); }
            const posContentTelas = getMousePosition(contentTelas, e);
            const proporcaoPosY = drawingTools.mousePosition.y / project.properties.resolution.height;
            const proporcaoPosX = drawingTools.mousePosition.x / project.properties.resolution.width;
            contentTelas.scrollTop = (contentTelas.scrollHeight * proporcaoPosY) - posContentTelas.y;
            contentTelas.scrollLeft = (contentTelas.scrollWidth * proporcaoPosX) - posContentTelas.x;
        }
    });

    document.addEventListener("dragover", preventDefaultAction);
    document.addEventListener("dragenter", preventDefaultAction);
    document.addEventListener("drop", preventDefaultAction); 

    window.addEventListener("resize", function () {
        ajustarContents();
        setTimeout(() => ajustarContents(), 120);
        if (project.created) { project.adjustInVisualizationScreen(); };
    });

    function menuPadrao() {
        menu.classList.replace("iniciomenu", "mudamenu");
        logoBlack.classList.replace("iniciologoBlack", "mudalogoBlack");
        iconesetablack.classList.replace("inicioiconeblack", "mudaiconeblack");
        iconemenublack.classList.replace("inicioiconeblack", "mudaiconeblack");
        for (let i = 0; i < arrayop.length; i++) { arrayop[i].classList.replace("inicioopcoes", "mudaopcoes"); }
    }

    function ajustarContents() {
        contentTools.style.height = (janelaPrincipal.offsetHeight - 90) + "px";
        contentCentro.style.width = contentTools.offsetWidth - barraLateralEsquerda.offsetWidth - barraLateralDireita.offsetWidth - 0.5 + "px";
        contentCentro.style.height = contentTools.style.height;
        contentTelas.style.height = (contentCentro.offsetHeight - 15) + "px";
        document.getElementById("janelaCamadas").style.height = (barraLateralEsquerda.offsetHeight - 336) + "px";
    }
}
// ==========================================================================================================================================================================================================================================

function criarOuAbrirProjeto() {
    const carregar = document.getElementById("carregamento");
    if (sessionStorage.getItem("abrirProjetoSalvo") === "true") {
        carregar.remove();
        openProject.open();
        sessionStorage.setItem("abrirProjetoSalvo", "false");
    } else if (sessionStorage.getItem("criarNovoProjeto") === "true") {
        carregar.remove();
        createProjectWindow.open();
        sessionStorage.setItem("criarNovoProjeto", "false");
    } else { carregamento(); }
    function carregamento() {
        const logoCarregamento = document.getElementById("logoCarregamento");
        logoCarregamento.style.transition = "opacity 1.5s linear";
        setTimeout(() => {
            logoCarregamento.style.opacity = "1";
            setTimeout(() => {
                const posLogo = logoBlack.getBoundingClientRect();
                logoCarregamento.style.transition = "width 500ms ease-out, height 500ms ease-out, opacity 500ms ease-out, top 500ms ease-out, left 500ms ease-out";
                logoCarregamento.style.height = "50px";
                logoCarregamento.style.width = "90px";
                logoCarregamento.style.opacity = "0.75";
                logoCarregamento.style.left = posLogo.left + 45 + "px";
                logoCarregamento.style.top = posLogo.top + 25 + "px";
                setTimeout(() => {
                    carregar.style.opacity = "0";
                    setTimeout(() => carregar.remove(), 1200);
                }, 350);
            }, 1550);
        }, 150);
    }
}

function getMousePosition(elemento, e) {
    const pos = elemento.getBoundingClientRect();
    return { x: e.clientX - pos.left, y: e.clientY - pos.top }
}

function cloneReplaceElement(oldElement) {
    const newElement = oldElement.cloneNode(true);
    oldElement.parentNode.insertBefore(newElement, oldElement);
    oldElement.remove();
    return newElement;
}

function throttle(func, limit) {
    let inThrottle;
    return function () {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

document.addEventListener("keydown", function (e) {
    if (e.code === "F5" && project.created) {
        e.preventDefault();
        return false;
    }
});

function backgroundBlur(blur) {
    if (blur) {
        janelaPrincipal.style.filter = "blur(9px)";
        colorSelectionWindow.window.style.filter = "blur(9px)";
        notification.window.style.filter = "blur(9px)";
    } else {
        janelaPrincipal.style.filter = "";
        colorSelectionWindow.window.style.filter = "";
        notification.window.style.filter = "";
    }
}

function preventDefaultAction(e) {
    e.preventDefault();
    e.stopPropagation();
}