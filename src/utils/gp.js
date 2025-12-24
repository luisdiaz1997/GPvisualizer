/**
 * Gaussian Process computations
 */

import {
    full,
    linspace,
    transpose,
    matMul,
    matVec,
    addDiag,
    cholesky,
    solveL,
    choleskySolve,
    randn,
} from './gp_utilities';

import { rbf, matern12, matern32, matern52 } from './kernels';

// Kernel function lookup
const KERNEL_FNS = {
    rbf,
    matern12,
    matern32,
    matern52,
};

/**
 * Compute kernel matrix using the specified kernel function
 */
function kernelMatrix(x1, x2, lengthScale, signalVariance, kernelName = 'rbf') {
    const kernelFn = KERNEL_FNS[kernelName] || rbf;
    return x1.map(xi =>
        x2.map(xj => kernelFn(xi, xj, lengthScale, signalVariance))
    );
}

/**
 * Compute GP posterior mean and variance given observations
 */
export function computePosterior(points, testX, params) {
    const n = points.length;
    const m = testX.length;
    const kernelName = params.kernel || 'rbf';

    // Prior case: no observations
    if (n === 0) {
        return {
            mean: Array(m).fill(0),
            variance: Array(m).fill(params.signalVariance),
        };
    }

    const X = points.map(p => p.x);
    const y = points.map(p => p.y);

    // K(X, X) + noise * I
    let K_XX = kernelMatrix(X, X, params.lengthScale, params.signalVariance, kernelName);
    K_XX = addDiag(K_XX, params.noiseLevel ** 2 + 1e-8);
    const L = cholesky(K_XX);

    // K(X*, X)
    const K_Xs = kernelMatrix(testX, X, params.lengthScale, params.signalVariance, kernelName);

    // Mean: K_Xs * (K_XX)^-1 * y
    const alpha = solveL(L, y);
    const k_ss = params.signalVariance;
    // For each test point i:
    // v_i = L^{-1} K_Xs[i]^T  (one forward solve, reused)
    // mean_i = v_i^T beta
    // var_i = k_ss - ||v_i||^2
    const { mean, variance } = K_Xs
        .map(row => solveL(L, row))
        .reduce((acc, v) => {
            const mu = v.reduce((s, vi, j) => s + vi * alpha[j], 0);
            const vTv = v.reduce((s, vi) => s + vi * vi, 0);
            acc.mean.push(mu);
            acc.variance.push(Math.max(k_ss - vTv, 1e-10));
            return acc;
        }, { mean: [], variance: [] });

    return { mean, variance };
}

/**
 * Sample from the GP (prior or posterior)
 */
export function sampleFromGP(points, sampleX, params) {
    const m = sampleX.length;
    const n = points.length;
    const kernelName = params.kernel || 'rbf';

    if (n === 0) {
        // Sample from prior
        let K = kernelMatrix(sampleX, sampleX, params.lengthScale, params.signalVariance, kernelName);
        K = addDiag(K, 1e-8);
        const L = cholesky(K);
        const z = Array(m).fill(null).map(() => randn());
        return matVec(L, z);
    }

    // Sample from posterior
    const X = points.map(p => p.x);
    const y = points.map(p => p.y);

    let K_XX = kernelMatrix(X, X, params.lengthScale, params.signalVariance, kernelName);
    K_XX = addDiag(K_XX, params.noiseLevel ** 2 + 1e-8);
    const L_XX = cholesky(K_XX);

    const K_Xs = kernelMatrix(sampleX, X, params.lengthScale, params.signalVariance, kernelName);
    const K_ss = kernelMatrix(sampleX, sampleX, params.lengthScale, params.signalVariance, kernelName);

    // Posterior mean
    const alpha = choleskySolve(L_XX, y);
    const mu = matVec(K_Xs, alpha);

    // Posterior covariance: K_ss - K_Xs * K_XX^-1 * K_sX
    const V = Array(n).fill(null).map(() => []);
    for (let i = 0; i < m; i++) {
        const v = solveL(L_XX, K_Xs[i]);
        for (let j = 0; j < n; j++) {
            V[j][i] = v[j];
        }
    }

    const VtV = matMul(transpose(V), V);
    const Sigma = K_ss.map((row, i) => row.map((v, j) => v - VtV[i][j]));
    const Sigma_jit = addDiag(Sigma, 1e-6);

    const L_Sigma = cholesky(Sigma_jit);
    const z = Array(m).fill(null).map(() => randn());
    const Lz = matVec(L_Sigma, z);

    return mu.map((mui, i) => mui + Lz[i]);
}

/**
 * Create a linspace array for test points
 */
export { linspace };
