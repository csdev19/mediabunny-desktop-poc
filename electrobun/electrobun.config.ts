import type { ElectrobunConfig } from "electrobun";

export default {
	app: {
		name: "mediabunny-poc-electrobun",
		identifier: "dev.cs19.mediabunnypoc",
		version: "0.0.1",
	},
	build: {
		mainProcess: "bun",
		bun: { entrypoint: "src/bun/index.ts" },
		// Reuse the shared web build as-is.
		copy: {
			"../web/dist/index.html": "views/mainview/index.html",
			"../web/dist/bundle.js": "views/mainview/bundle.js",
			"../web/dist/sample.mp4": "views/mainview/sample.mp4",
		},
		mac: { bundleCEF: false },
		linux: { bundleCEF: false },
		win: { bundleCEF: false },
	},
} satisfies ElectrobunConfig;
