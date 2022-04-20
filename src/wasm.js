async function instantiate(module, imports = {}) {
	const {exports} = await WebAssembly.instantiate(module, imports);
	return exports;
}

export const {
	add,
} = await (async url => instantiate(
	await (WebAssembly.compileStreaming(globalThis.fetch(url))), {
	},
))(new URL('./build/debug.wasm', import.meta.url));

