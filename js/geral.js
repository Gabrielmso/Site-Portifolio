export const fadeOutLoading = () => {
    const content = document.getElementById("carregamento");
    content.style.opacity = 0;
    setTimeout(() => content.remove(), 800);
}

export const throttle = (func, limit) => {
    let inThrottle;
    return function () {
        if (!inThrottle) {
            func.apply(this, arguments);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

export const getImage = (url) => {
    const image = new Image();
    image.src = url;
    return image;
}

export const getMousePosition = (element, mouseEvent) => {
    const { left, top } = element.getBoundingClientRect();
    return { x: mouseEvent.clientX - left, y: mouseEvent.clientY - top }
}

export const cloneReplaceElement = (oldElement) => {
    const newElement = oldElement.cloneNode(true);
    oldElement.parentNode.insertBefore(newElement, oldElement);
    oldElement.remove();
    return newElement;
}

export const preventDefaultAction = (e) => {
    e.preventDefault();
    e.stopPropagation();
}

export const logarithm = (base, log) => Math.log(log) / Math.log(base);
export const getDistanceCoordinates = (point1, point2) => (((point2.x - point1.x) ** 2 + (point2.y - point1.y) ** 2) ** 0.5);
export const randomNumber = (min, max) => (Math.random() * (max - min) + min);
export const elementById = id => document.getElementById(id);