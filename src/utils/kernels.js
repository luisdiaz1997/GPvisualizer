/**
 * Kernel functions for Gaussian Process
 */

/**
 * RBF (Radial Basis Function) / Squared Exponential kernel
 * k(x, x') = σ² * exp(-||x - x'||² / (2ℓ²))
 * 
 * @param {number} x1 - First input
 * @param {number} x2 - Second input
 * @param {number} lengthScale - Length scale parameter (ℓ)
 * @param {number} signalVariance - Signal variance (σ²)
 * @returns {number} Kernel value
 */
export function rbf(x1, x2, lengthScale, signalVariance) {
    const d = x1 - x2;
    const l2 = lengthScale ** 2;
    return signalVariance * Math.exp(-0.5 * d * d / l2);
}

/**
 * Matérn 1/2 kernel (equivalent to Ornstein-Uhlenbeck / Exponential kernel)
 * k(x, x') = σ² * exp(-|x - x'| / ℓ)
 * 
 * This is the roughest of the Matérn family, producing sample paths that are
 * continuous but not differentiable.
 * 
 * @param {number} x1 - First input
 * @param {number} x2 - Second input
 * @param {number} lengthScale - Length scale parameter (ℓ)
 * @param {number} signalVariance - Signal variance (σ²)
 * @returns {number} Kernel value
 */
export function matern12(x1, x2, lengthScale, signalVariance) {
    const r = Math.abs(x1 - x2) / lengthScale;
    return signalVariance * Math.exp(-r);
}

/**
 * Matérn 3/2 kernel
 * k(x, x') = σ² * (1 + √3 * r) * exp(-√3 * r)
 * where r = |x - x'| / ℓ
 * 
 * Produces sample paths that are once differentiable.
 * 
 * @param {number} x1 - First input
 * @param {number} x2 - Second input
 * @param {number} lengthScale - Length scale parameter (ℓ)
 * @param {number} signalVariance - Signal variance (σ²)
 * @returns {number} Kernel value
 */
export function matern32(x1, x2, lengthScale, signalVariance) {
    const r = Math.abs(x1 - x2) / lengthScale;
    const sqrt3r = Math.sqrt(3) * r;
    return signalVariance * (1 + sqrt3r) * Math.exp(-sqrt3r);
}

/**
 * Matérn 5/2 kernel (bonus - commonly used)
 * k(x, x') = σ² * (1 + √5 * r + 5r²/3) * exp(-√5 * r)
 * where r = |x - x'| / ℓ
 * 
 * Produces sample paths that are twice differentiable.
 * 
 * @param {number} x1 - First input
 * @param {number} x2 - Second input
 * @param {number} lengthScale - Length scale parameter (ℓ)
 * @param {number} signalVariance - Signal variance (σ²)
 * @returns {number} Kernel value
 */
export function matern52(x1, x2, lengthScale, signalVariance) {
    const r = Math.abs(x1 - x2) / lengthScale;
    const sqrt5r = Math.sqrt(5) * r;
    return signalVariance * (1 + sqrt5r + (5 * r * r) / 3) * Math.exp(-sqrt5r);
}

/**
 * Build a kernel matrix from a kernel function
 * K[i,j] = kernel(x1[i], x2[j], lengthScale, signalVariance)
 * 
 * @param {number[]} x1 - First array of inputs
 * @param {number[]} x2 - Second array of inputs
 * @param {number} lengthScale - Length scale parameter
 * @param {number} signalVariance - Signal variance
 * @param {Function} kernelFn - Kernel function to use
 * @returns {number[][]} Kernel matrix
 */
export function buildKernelMatrix(x1, x2, lengthScale, signalVariance, kernelFn = rbf) {
    return x1.map(xi =>
        x2.map(xj => kernelFn(xi, xj, lengthScale, signalVariance))
    );
}

/**
 * Available kernels registry
 */
export const KERNELS = {
    rbf: {
        name: 'RBF (Squared Exponential)',
        fn: rbf,
        description: 'Infinitely differentiable, very smooth'
    },
    matern52: {
        name: 'Matérn 5/2',
        fn: matern52,
        description: 'Twice differentiable, fairly smooth'
    },
    matern32: {
        name: 'Matérn 3/2',
        fn: matern32,
        description: 'Once differentiable, moderately smooth'
    },
    matern12: {
        name: 'Matérn 1/2 (Exponential)',
        fn: matern12,
        description: 'Continuous but rough, not differentiable'
    }
};
