package main

import (
	"fmt"
	"io"
	"net"
	"net/http"
	"os"
	"slices"

	webview "github.com/webview/webview_go"
)

func main() {
	auto := slices.Contains(os.Args[1:], "--auto")
	done := make(chan struct{})

	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		panic(err)
	}
	base := "http://" + ln.Addr().String()

	mux := http.NewServeMux()
	mux.Handle("/", http.FileServer(http.Dir("../web/dist")))
	mux.HandleFunc("/__report", func(w http.ResponseWriter, r *http.Request) {
		body, _ := io.ReadAll(r.Body)
		fmt.Printf("MEDIABUNNY_REPORT %s\n", body)
		if auto {
			close(done)
		}
	})
	go http.Serve(ln, mux)

	w := webview.New(false)
	defer w.Destroy()
	w.SetTitle("Mediabunny PoC (Go webview)")
	w.SetSize(820, 760, webview.HintNone)
	url := base + "/index.html?report=" + base + "/__report"
	if auto {
		url += "&auto=1"
		go func() { <-done; w.Terminate() }()
	}
	w.Navigate(url)
	w.Run()
}
