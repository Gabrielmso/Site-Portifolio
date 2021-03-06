export const fadeOutLoading = () => {
    const content = document.querySelector(`[data-id="carregamento"]`);
    const circle = document.querySelector(`[data-id="circle"]`);
    circle.style.opacity = content.style.opacity = 0;
    setTimeout(() => content.remove(), 800);
}

export const setStyle = (element, style) => {
    for (const property in style) {
        element.style[property] = style[property];
    }
}

export const delay = ms => new Promise(r => setTimeout(r, ms));

export const openWindowBackgroundBlur = async (window, open) => {
    const transitionsTime = 250;
    if (open) {
        setStyle(window, {
            transition: "backdrop-filter " + transitionsTime + "ms ease-in-out, opacity " + transitionsTime + "ms ease-in-out",
            display: "flex"
        });
        await delay(10);
        setStyle(window, { opacity: "1", "backdrop-filter": "blur(8px)" });
    } else {
        setStyle(window, { opacity: null, "backdrop-filter": null });
        await delay(transitionsTime + 10);
        setStyle(window, { transition: null, display: null });
    }
}

export const throttle = (func, limit, inThrottle = false) =>
    (...args) => {
        if (inThrottle) { return; }
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
    }

export const loadFile = async url => {
    const response = await fetch(url);
    return response.ok ? response : false;
}

export const loadImage = (url, fnOnLoad = false) => new Promise((resolve) => {
    const image = new Image();
    image.addEventListener("load", e => {
        if (fnOnLoad) { fnOnLoad(e); }
        resolve(image);
    });
    image.addEventListener("error", () => resolve(false));
    image.src = url;
});

export const getImage = (url, fnOnLoad = false) => {
    const image = new Image();
    if (fnOnLoad) { image.addEventListener("load", fnOnLoad(e)); }
    image.src = url;
    return image;
};

export const getMousePosition = (element, mouseEvent) => {
    const { left, top } = element.getBoundingClientRect();
    return { x: mouseEvent.clientX - left, y: mouseEvent.clientY - top }
}

export const cloneReplaceElement = oldElement => {
    const newElement = oldElement.cloneNode(true);
    oldElement.parentNode.insertBefore(newElement, oldElement);
    oldElement.remove();
    return newElement;
}

export const createElement = (tagName, attributes) => {
    const newElement = document.createElement(tagName);
    for (const prop in attributes) { newElement.setAttribute(prop, attributes[prop]); }
    return newElement;
}

export const cloneElement = oldElement => oldElement.cloneNode(true);

export const preventDefaultAction = e => {
    e.preventDefault();
    e.stopPropagation();
}

export const createEventEmitterToObservers = (eventNames = [""]) => {
    if (eventNames.includes("") || !eventNames.length) { throw new TypeError("eventNames is empty!"); }
    const listeners = eventNames.reduce((ac, name) => {
        if (typeof name !== "string") { throw new TypeError("Event name is not a string!"); }
        ac[name] = [];
        return ac;
    }, {});
    return {
        add: (event, newObservers = []) => {
            const currentObservers = listeners[event];
            if (!currentObservers) { throw new TypeError("Invalid event!"); }
            for (const newObserver of newObservers) {
                if (currentObservers.includes(newObserver)) { throw new TypeError("Observer exist!"); }
            }
            for (const observer of newObservers) {
                if (typeof observer !== "function") { throw new TypeError("Observer is not a function!"); }
                currentObservers.push(observer)
            }
        },
        remove: (event, observersToRemove = []) => {
            const currentObservers = listeners[event];
            if (!currentObservers) { throw new TypeError("Invalid event!"); }
            for (let i = 0; i < currentObservers.length; i++) {
                for (const observerToRemove of observersToRemove) {
                    if (currentObservers[i] === observerToRemove) { currentObservers.splice(i, 1); }
                }
            }
        },
        notify: (event, message) => {
            for (const observer of listeners[event]) { observer(message); }
        }
    }
}

export const rgbTohex = ({ r, g, b }) => {
    const rgb = b | (g << 8) | (r << 16);
    return ("#" + (0x1000000 + rgb).toString(16).slice(1));
}
export const hexToRgb = hex => {
    const resul = hex.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
    if (resul) { return resul.slice(1, 4).map(x => parseInt(x, 16)); }
    return null;
}
export const rgbToHsv = ({ r, g, b }) => {
    let rabs = r / 255, gabs = g / 255, babs = b / 255, h, s, v = Math.max(rabs, gabs, babs),
        diff = v - Math.min(rabs, gabs, babs), diffc = c => (v - c) / 6 / diff + 1 / 2,
        percentRoundFn = num => (num * 100) / 100;
    if (diff === 0) { h = s = 0; }
    else {
        const rr = diffc(rabs), gg = diffc(gabs), bb = diffc(babs);
        s = diff / v;
        if (rabs === v) { h = bb - gg; }
        else if (gabs === v) { h = (1 / 3) + rr - bb; }
        else if (babs === v) { h = (2 / 3) + gg - rr; }
        if (h < 0) { h += 1; }
        else if (h > 1) { h -= 1; }
    }
    return { h: (h * 360), s: percentRoundFn(s * 100), v: percentRoundFn(v * 100) };
}
export const hsvToRgb = hsvCode => {
    if (hsvCode.h === 360) { hsvCode.h = 0; }
    const h = (Math.max(0, Math.min(360, hsvCode.h))) / 60,
        s = (Math.max(0, Math.min(100, hsvCode.s))) / 100,
        v = (Math.max(0, Math.min(100, hsvCode.v))) / 100;
    if (s === 0) {
        const silver = Math.round(v * 255);
        return { r: silver, g: silver, b: silver };
    }
    const i = Math.floor(h), f = h - i, p = v * (1 - s), q = v * (1 - s * f), t = v * (1 - s * (1 - f)),
        getCodeRgb = {
            case0: [v, t, p], case1: [q, v, p], case2: [p, v, t],
            case3: [p, q, v], case4: [t, p, v], case5: [v, p, q]
        }
    const codeRgb = getCodeRgb["case" + i].map(value => Math.round(value * 255));
    return { r: codeRgb[0], g: codeRgb[1], b: codeRgb[2] };
}

export const logarithm = (base, log) => Math.log(log) / Math.log(base);
export const getDistanceCoordinates = (p1, p2) => (((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2) ** 0.5);
export const randomNumber = (min, max) => (Math.random() * (max - min) + min);
export const getElement = data_id => document.querySelector("[data-id='" + data_id + "']");
export const getAllElements = attr => document.querySelectorAll(`[${attr}]`);
export const getAllElementsClass = className => document.getElementsByClassName(className);

export const createCopyCanvas = elCanvas => {
    const ctxCanvas = cloneElement(elCanvas).getContext("2d");
    ctxCanvas.drawImage(elCanvas, 0, 0);
    return ctxCanvas.canvas;
}