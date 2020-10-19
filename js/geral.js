export const fadeOutLoading = () => {
    const content = document.querySelector(`[data-id="carregamento"]`);
    content.style.opacity = 0;
    setTimeout(() => content.remove(), 800);
}

export const throttle = (func, limit) => {
    let inThrottle = false;
    return (...args) => {
        if (inThrottle) { return; }
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
    }
}

export const loadFile = async (url) => {
    const response = await fetch(url);
    return response.ok ? response : false;
}

export const getImage = (url, fnOnLoad = false) => {
    const image = new Image();
    if (fnOnLoad) { image.onload = fnOnLoad; }
    image.src = url;
    return image;
}

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
    for (const prop in attributes) {
        newElement.setAttribute(prop, attributes[prop]);
    }
    return newElement;
}

export const cloneElement = oldElement => oldElement.cloneNode(true);

export const setStyle = (element, style) => {
    for (const property in style) {
        const value = style[property];
        element.style[property] = value ? value : "";
    }
}

export const preventDefaultAction = e => {
    e.preventDefault();
    e.stopPropagation();
}

export const logarithm = (base, log) => Math.log(log) / Math.log(base);
export const getDistanceCoordinates = (p1, p2) => (((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2) ** 0.5);
export const randomNumber = (min, max) => (Math.random() * (max - min) + min);
export const getElement = data_id => document.querySelector(`[data-id="${data_id}"]`);
export const getAllElements = attr => document.querySelectorAll(`[${attr}]`);
export const getAllElementsClass = className => document.getElementsByClassName(className);