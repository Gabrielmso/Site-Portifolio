let corPrincipal, corSecundaria;
let createProjectWindow, project, drawingTools, previewFunctions, undoRedoChange, hotKeys, createGridWindow, colorSelectionWindow,
    notification;
let janelaPrincipal, contentTelas, txtPorcentagemZoom;
function colorPaint() {
    createProjectWindow = new createProjectWindowObject();
    project = new projectObject();
    colorSelectionWindow = new colorSelectionWindowObject();
    drawingTools = new drawingToolsObject();
    previewFunctions = new previewFunctionsObject();
    undoRedoChange = new undoRedoChangeObject();
    hotKeys = new hotKeysObject();
    createGridWindow = new createGridWindowObject();
    notification = new notificationsObject();
    const contentJanelaAtalhos = document.getElementById("contentJanelaAtalhos");
    const contentTools = document.getElementById("contentTools");
    const barraLateralEsquerda = document.getElementById("barraLateralEsquerda");
    const barraLateralDireita = document.getElementById("barraLateralDireita");
    const contentCentro = document.getElementById("contentCentro");
    janelaPrincipal = document.getElementById("colorPaintContent");
    contentTelas = document.getElementById("contentTelas");
    corPrincipal = document.getElementById("corPrincipal");
    corSecundaria = document.getElementById("corSecundaria");
    txtPorcentagemZoom = document.getElementById("txtPorcentagemZoom");
    menu.style.transition = "none";
    ajustarContents();
    criarOuAbrirProjeto();

    project.addEventsToElements();
    colorSelectionWindow.addEventsToElements();
    notification.addEventsToElements();

    document.getElementById("bttCriarNovoProjeto").addEventListener("mousedown", () => createProjectWindow.open("create"));
    document.getElementById("bttCriarGrade").addEventListener("mousedown", () => createGridWindow.open());
    document.getElementById("bttModoCursor").addEventListener("mousedown", (e) => {
        drawingTools.cursorTool.show = !drawingTools.cursorTool.show;
        e.currentTarget.getElementsByTagName("span")[0].innerText = drawingTools.cursorTool.show ? "Padrão" : "Simples";
        drawingTools.changeCursorTool();
    });
    document.getElementById("bttMostrarAlteracaoPincel").addEventListener("mousedown", (e) => {
        drawingTools.showChangesCursor = !drawingTools.showChangesCursor;
        e.currentTarget.getElementsByTagName("span")[0].innerText = drawingTools.showChangesCursor ? "Sim" : "Não";
    });
    document.getElementById("bttSalvarDesenho").addEventListener("mousedown", () => {
        if (project.created) { project.saveDraw(); }
        else {
            notification.open({
                title: "Atenção!", text: "Nenhum projeto foi criado."
            }, { name: "notify", time: 1500 }, null);
        }
    });
    document.getElementById("bttSalvarProjeto").addEventListener("mousedown", () => {
        if (project.created) { project.saveProject(); }
        else {
            notification.open({
                title: "Atenção!", text: "Nenhum projeto foi criado."
            }, { name: "notify", time: 1500 }, null);
        }
    });
    document.getElementById("bttcarregarProjeto").addEventListener("mousedown", () => createProjectWindow.open("load"));

    corPrincipal.addEventListener("mousedown", () => {
        if (colorSelectionWindow.opened) { colorSelectionWindow.findColor(project.selectedColors.firstPlane); }
        else { colorSelectionWindow.open(1); }
    });

    corSecundaria.addEventListener("mousedown", () => {
        if (colorSelectionWindow.opened) { colorSelectionWindow.findColor(project.selectedColors.backgroundPlane); }
        else { colorSelectionWindow.open(2); }
    });

    document.getElementById("bttCoresPrincipais").addEventListener("mousedown", () => {//Coloca preto na corPrincipalEcolhida e branco na corSecundariaEscolhida.
        if (!colorSelectionWindow.opened) {
            project.selectedColors.set(1, { r: 0, g: 0, b: 0 });
            project.selectedColors.set(2, { r: 255, g: 255, b: 255 });
        }
    });

    document.getElementById("bttAlternaCor").addEventListener("mousedown", () => {
        if (!colorSelectionWindow.opened) {
            const color = project.selectedColors.get(1);
            project.selectedColors.set(1, project.selectedColors.get(2));
            project.selectedColors.set(2, color);
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
            preventDefaultAction(e);
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

    window.addEventListener("resize", () => {
        ajustarContents();
        setTimeout(() => ajustarContents(), 120);
        if (project.created) { project.adjustInVisualizationScreen(); };
    });

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
    if (sessionStorage.getItem("load") === "true") {
        fadeOut();
        createProjectWindow.open("load");
        sessionStorage.removeItem("load");
    } else if (sessionStorage.getItem("create") === "true") {
        fadeOut();
        createProjectWindow.open("create");
        sessionStorage.removeItem("create");
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
                setTimeout(fadeOut, 350);
            }, 1550);
        }, 150);
    }
    function fadeOut() {
        carregar.style.opacity = "0";
        setTimeout(() => carregar.remove(), 700);
    }
}

function getMousePosition(element, e) {
    const { left, top } = element.getBoundingClientRect();
    return { x: e.clientX - left, y: e.clientY - top }
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
        preventDefaultAction(e);
        return false;
    }
});

function getImage(url) {
    const image = new Image();
    image.src = url;
    return image;
}

function backgroundBlur(blur) {
    if (blur) {
        menu.style.filter = "blur(9px)"
        janelaPrincipal.style.filter = "blur(9px)";
        colorSelectionWindow.window.style.filter = "blur(9px)";
        notification.window.style.filter = "blur(9px)";
    } else {
        menu.style.filter = ""
        janelaPrincipal.style.filter = "";
        colorSelectionWindow.window.style.filter = "";
        notification.window.style.filter = "";
    }
}

function preventDefaultAction(e) {
    e.preventDefault();
    e.stopPropagation();
}