use tauri::{WebviewUrl, WebviewWindowBuilder};

// The web side calls `report` with the JSON result so we can print it headlessly.
#[tauri::command]
fn report(json: String, app: tauri::AppHandle) {
    println!("MEDIABUNNY_REPORT {json}");
    if std::env::args().any(|a| a == "--auto") {
        app.exit(0);
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![report])
        .setup(|app| {
            let auto = std::env::args().any(|a| a == "--auto");
            let url = if auto { "index.html?auto=1" } else { "index.html" };
            WebviewWindowBuilder::new(app, "main", WebviewUrl::App(url.into()))
                .title("Mediabunny PoC (Tauri 2)")
                .inner_size(820.0, 760.0)
                .build()?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri app");
}
