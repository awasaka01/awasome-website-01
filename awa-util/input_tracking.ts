class MouseTrackerClass {
	private _x : number;
	private _y : number;
	private set y (y : number) { this._y = y; }
	private set x (x : number) { this._x = x; }
	public get x () { return this._x; }
	public get y () { return this._y; }
	private update (x : number, y : number) { this._x = x; this._y = y; }
	constructor (target : HTMLElement | HTMLDocument = document) {
		target.addEventListener("mousemove", (e : Event) => this.update((e as MouseEvent).offsetX, (e as MouseEvent).offsetY));

	}
}
export type MouseTracker = MouseTrackerClass;
let mouse = undefined;
export function trackMouse (target ?: HTMLElement) : MouseTrackerClass {
	if (mouse !== undefined) return mouse;
	mouse = new MouseTrackerClass(target);
	return mouse;
}

class TrackedInput {
	name : string;

	element : HTMLInputElement;
	eventNames : string[] = [];
	public callbacks : { "input" : ((e : { target : HTMLInputElement } & Event) => void)[], "change" : ((e : { target : HTMLInputElement } & Event) => void)[] } = { "input": [], "change": [] };
	constructor (element) {
		this.element = element;
		this.name = element.name;

		// Add event listeners
		this.element.addEventListener("input", (e) => { for (const callback of this.callbacks.input) { callback(e as { target : HTMLInputElement } & Event); } });
		this.element.addEventListener("change", (e) => { for (const callback of this.callbacks.change) { callback(e as { target : HTMLInputElement } & Event); } });
	}
	public listen (event : ("input" | "change"), callback : (e : { target : HTMLInputElement } & Event) => void) {
		this.callbacks[event].push(callback);
		callback({ target: this.element } as { target : HTMLInputElement } & Event);
	}
	public getValue () {
		if (this.element.type === "checkbox") return `${this.element.checked}`;
		return this.element.value;
	}
	public get value () { return this.element.value; }
}


class InputTracker {
	static inputs : TrackedInput[] = [];

	// Register an 'input' element to be tracked on change, triggering callbacks that can be attached by '.listen()'
	static addInput (input : HTMLInputElement) {
		const trackedInput = new TrackedInput(input);
		this.inputs.push(trackedInput);
		return trackedInput;
	}

	// Register an 'output' element to automatically fill itself with the value of a TrackedInput, when it changes
	static addOutput (output : HTMLOutputElement) {
		const targetInput = this.inputs.find((input) => input.name === output.name);
		if (targetInput === undefined) throw new Error(`No matching input found for name ${output.name}, or it is not yet tracked`);
		targetInput.listen("input", () => output.value = targetInput.getValue());
		output.value = targetInput.getValue();
	}
	static get (name : string) {
		return this.inputs.find((input) => input.name === name);
	}
}


export function trackInputs (identifierClassName = "awa-input") {

	// Start tracking all inputs currently on page, that have class
	const inputElements = document.querySelectorAll(`input.${identifierClassName}`) as NodeListOf<HTMLInputElement>;
	for (const input of inputElements) {
		if (input.id === undefined) throw new Error("Tracked element must have an id");
		InputTracker.addInput(input);
	}

	// Add all output elements to the element it wants to be output for
	const outputElements = document.querySelectorAll(`output.${identifierClassName}`) as NodeListOf<HTMLOutputElement>;
	for (const output of outputElements) {
		if (output.name === undefined) throw new Error("Tracked element must have a specified 'name' attribute");
		InputTracker.addOutput(output);
	}

	return InputTracker; //
}
