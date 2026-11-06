import { BrowserWindow } from "electrobun/main";

const auto = process.env.MB_AUTO === "1";

// Tiny local endpoint so the web side can POST its result back (for headless runs).
const server = Bun.serve({
	port: 0,
	async fetch(req) {
		const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*" };
		if (req.method === "POST") {
			console.log("MEDIABUNNY_REPORT " + (await req.text()));
			if (auto) setTimeout(() => process.exit(0), 200);
		}
		return new Response("ok", { headers: cors });
	},
});

new BrowserWindow({
	title: "Mediabunny PoC (Electrobun)",
	url: `views://mainview/index.html?report=http://127.0.0.1:${server.port}/${auto ? "&auto=1" : ""}`,
	frame: { width: 820, height: 760, x: 200, y: 200 },
});
