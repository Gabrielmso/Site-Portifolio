import { getElement, setStyle, getMousePosition } from "../js/utils.js"

export default function ScrollsContentTelas({ contentTelas }) {
    const verticalBar = { bar: getElement("scrollVertical"), content: getElement("barraVertical") };
    const horizontalBar = { bar: getElement("scrollHorizontal"), content: getElement("barraHorizontal") };
    const changeTopScrollContentTelas = top => {
        contentTelas.scrollTop = top * (contentTelas.scrollHeight / contentTelas.offsetHeight);
    }
    const changeLeftScrollContentTelas = left => {
        contentTelas.scrollLeft = left * (contentTelas.scrollWidth / contentTelas.offsetWidth);
    }
    const setPositionVerticalBar = (top, update = false) => {
        top = top < 0 ? 0 : top > verticalBar.content.offsetHeight - verticalBar.bar.offsetHeight ?
            verticalBar.content.offsetHeight - verticalBar.bar.offsetHeight : top;
        setStyle(verticalBar.bar, { top: top + "px" });
        if (update) { changeTopScrollContentTelas(top) };
    }
    const setPositionHorizontalBar = (left, update = false) => {
        left = left < 0 ? 0 : left > horizontalBar.content.offsetWidth - horizontalBar.bar.offsetWidth ?
            horizontalBar.content.offsetWidth - horizontalBar.bar.offsetWidth : left;
        setStyle(horizontalBar.bar, { left: left + "px" });
        if (update) { changeLeftScrollContentTelas(left) };
    }
    const moveVerticalBar = (() => {
        let clickPosition;
        const move = e =>
            setPositionVerticalBar((getMousePosition(verticalBar.content, e)).y - clickPosition, true)
        const up = () => {
            document.removeEventListener("mouseup", up);
            document.removeEventListener("mousemove", move);
        }
        const down = e => {
            clickPosition = (getMousePosition(verticalBar.bar, e)).y;
            document.addEventListener("mouseup", up);
            document.addEventListener("mousemove", move);
        }
        return down;
    })();
    const moveHorizontalBar = (() => {
        let clickPosition;
        const move = e =>
            setPositionHorizontalBar((getMousePosition(horizontalBar.content, e)).x - clickPosition, true);
        const up = () => {
            document.removeEventListener("mouseup", up);
            document.removeEventListener("mousemove", move);
        }
        const down = e => {
            clickPosition = (getMousePosition(horizontalBar.bar, e)).x;
            document.addEventListener("mouseup", up);
            document.addEventListener("mousemove", move);
        }
        return down;
    })();
    const adjustPositionBars = () => {
        const { scrollHeight, scrollTop, offsetHeight, scrollLeft, scrollWidth, offsetWidth } = contentTelas;
        const top = scrollTop / (scrollHeight / offsetHeight);
        const left = scrollLeft / (scrollWidth / offsetWidth);
        setPositionHorizontalBar(left, false);
        setPositionVerticalBar(top, false);
    }
    const adjustHorizontalBar = () => {
        const maxWidth = contentTelas.offsetWidth;
        const width = Math.floor(maxWidth * (maxWidth / contentTelas.scrollWidth));
        setStyle(horizontalBar.bar, { width: width + "px" });
    }
    const adjustVerticalBar = () => {
        const maxHeight = contentTelas.offsetHeight;
        const height = Math.floor(maxHeight * (maxHeight / contentTelas.scrollHeight));
        setStyle(verticalBar.bar, { height: height + "px" });
    }
    const updateBars = () => {
        const { scrollHeight, offsetHeight, scrollWidth, offsetWidth } = contentTelas;
        setStyle(horizontalBar.bar, { display: scrollWidth > offsetWidth ? "block" : null });
        setStyle(verticalBar.bar, { display: scrollHeight > offsetHeight ? "block" : null });
        adjustVerticalBar();
        adjustHorizontalBar();
        adjustPositionBars();
    }

    verticalBar.bar.addEventListener("mousedown", moveVerticalBar);
    verticalBar.content.addEventListener("mousedown", e => {
        if (e.currentTarget != e.target) { return; }
        setPositionVerticalBar(getMousePosition(e.currentTarget, e).y - (verticalBar.bar.offsetHeight / 2), true);
        setTimeout(() => moveVerticalBar(e), 0);
    });
    horizontalBar.bar.addEventListener("mousedown", moveHorizontalBar);
    horizontalBar.content.addEventListener("mousedown", e => {
        if (e.currentTarget != e.target) { return; }
        setPositionHorizontalBar(getMousePosition(e.currentTarget, e).x - (horizontalBar.bar.offsetWidth / 2), true);
        setTimeout(() => moveHorizontalBar(e), 0);
    });

    const onZoom = updateBars;
    contentTelas.addEventListener("scroll", adjustPositionBars);

    return { onZoom }
}