export const fadeOutLoading = () => {
    const content = document.getElementById("carregamento");
    content.style.opacity = 0;
    setTimeout(() => content.remove(), 800);
}

export const throttle = function (func, limit) {
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

export function getImage(url) {
    const image = new Image();
    image.src = url;
    return image;
}

export function getMousePosition(element, e) {
    const { left, top } = element.getBoundingClientRect();
    return { x: e.clientX - left, y: e.clientY - top }
}

export function cloneReplaceElement(oldElement) {
    const newElement = oldElement.cloneNode(true);
    oldElement.parentNode.insertBefore(newElement, oldElement);
    oldElement.remove();
    return newElement;
}

export function preventDefaultAction(e) {
    e.preventDefault();
    e.stopPropagation();
}

export const logarithm = (base, log) => Math.log(log) / Math.log(base);

export const getDistanceCoordinates = (point1, point2) => (((point2.x - point1.x) ** 2 + (point2.y - point1.y) ** 2) ** 0.5);

export const randomNumber = (min, max) => Math.random() * (max - min) + min;