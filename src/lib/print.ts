// Tiny event bridge so any component can ask the print root to print something.

export type PrintRequest = { kind: "cv" } | { kind: "letter"; body: string };

const EVENT = "cvmaker:print";

export const requestPrint = (req: PrintRequest) =>
	window.dispatchEvent(new CustomEvent<PrintRequest>(EVENT, { detail: req }));

export const onPrintRequest = (fn: (req: PrintRequest) => void) => {
	const handler = (e: Event) => fn((e as CustomEvent<PrintRequest>).detail);
	window.addEventListener(EVENT, handler);
	return () => window.removeEventListener(EVENT, handler);
};
