import path from "node:path";
/// <reference types="vitest" />
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "node",
	},
	resolve: {
		alias: {
			"~": path.resolve(__dirname, "./src"),
		},
	},
});
