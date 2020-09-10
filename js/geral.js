export function fadeOutLoading() {
    const content = document.getElementById("carregamento");
    content.style.opacity = 0;
    setTimeout(() => content.remove(), 800);
}

export function throttle(func, wait, immediate) {
    let timeout = null
    let initialCall = true

    return function () {
        const callNow = immediate && initialCall
        const next = function () {
            func.apply(this, arguments)
            timeout = null
        }
        if (callNow) {
            initialCall = false
            next()
        }
        if (!timeout) {
            timeout = setTimeout(next, wait)
        }
    }
}