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