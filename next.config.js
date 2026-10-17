/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import './src/env.js';
import { withWorkflow } from 'workflow/next';

/** @type {import("next").NextConfig} */
const config = {};

// Compiles the `"use workflow"` / `"use step"` directives that run analysis
// generation as durable background work.
export default withWorkflow(config);
