// The entry file of your WebAssembly module.

export function add(a: i32, b: i32): i32 {
	return a + b;
}

export function isPrime(x: u32): bool {
	if (x < 2) {
		return false;
	}

	for (let i: u32 = 2; i < x; i++) {
		if (x % i === 0) {
			return false;
		}
	}

	return true;
}

/** Calculates the n-th Fibonacci number. */
export function fib(n: i32): i32 {
	let a = 0; let
		b = 1;
	if (n > 0) {
		while (--n) {
			const t = a + b;
			a = b;
			b = t;
		}

		return b;
	}

	return a;
}
