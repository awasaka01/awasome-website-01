class MouseTrackerClass {
    _x;
    _y;
    set y(y) { this._y = y; }
    set x(x) { this._x = x; }
    get x() { return this._x; }
    get y() { return this._y; }
    update(x, y) { this._x = x; this._y = y; }
    constructor(target = document) {
        target.addEventListener("mousemove", (e) => this.update(e.offsetX, e.offsetY));
    }
}
let mouse = undefined;
export function trackMouse(target) {
    if (mouse !== undefined)
        return mouse;
    mouse = new MouseTrackerClass(target);
    return mouse;
}
class TrackedInput {
    name;
    element;
    eventNames = [];
    callbacks = { "input": [], "change": [] };
    constructor(element) {
        this.element = element;
        this.name = element.name;
        // Add event listeners
        this.element.addEventListener("input", (e) => { for (const callback of this.callbacks.input) {
            callback(e);
        } });
        this.element.addEventListener("change", (e) => { for (const callback of this.callbacks.change) {
            callback(e);
        } });
    }
    listen(event, callback) {
        this.callbacks[event].push(callback);
        callback({ target: this.element });
    }
    getValue() {
        if (this.element.type === "checkbox")
            return `${this.element.checked}`;
        return this.element.value;
    }
    get value() { return this.element.value; }
}
class InputTracker {
    static inputs = [];
    // Register an 'input' element to be tracked on change, triggering callbacks that can be attached by '.listen()'
    static addInput(input) {
        const trackedInput = new TrackedInput(input);
        this.inputs.push(trackedInput);
        return trackedInput;
    }
    // Register an 'output' element to automatically fill itself with the value of a TrackedInput, when it changes
    static addOutput(output) {
        const targetInput = this.inputs.find((input) => input.name === output.name);
        if (targetInput === undefined)
            throw new Error(`No matching input found for name ${output.name}, or it is not yet tracked`);
        targetInput.listen("input", () => output.value = targetInput.getValue());
        output.value = targetInput.getValue();
    }
    static get(name) {
        return this.inputs.find((input) => input.name === name);
    }
}
export function trackInputs(identifierClassName = "awa-input") {
    // Start tracking all inputs currently on page, that have class
    const inputElements = document.querySelectorAll(`input.${identifierClassName}`);
    for (const input of inputElements) {
        if (input.id === undefined)
            throw new Error("Tracked element must have an id");
        InputTracker.addInput(input);
    }
    // Add all output elements to the element it wants to be output for
    const outputElements = document.querySelectorAll(`output.${identifierClassName}`);
    for (const output of outputElements) {
        if (output.name === undefined)
            throw new Error("Tracked element must have a specified 'name' attribute");
        InputTracker.addOutput(output);
    }
    return InputTracker; //
}
