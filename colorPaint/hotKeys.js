import { createEventEmitterToObservers } from "../js/utils.js";

export default function hotKeysObject() {
    const observers = createEventEmitterToObservers(["hotKey"]);
    const keyDownEvent = e => observers.notify("hotKey", { pressed: true, e })
    const keyUpEvent = e => observers.notify("hotKey", { pressed: false, e })

    document.addEventListener("keydown", keyDownEvent);
    document.addEventListener("keyup", keyUpEvent);

    document.addEventListener("keydown", e => {
        if (e.code === "F5") { preventDefaultAction(e); }
    });
    return { addObservers: observers.add }
}