package main

import (
	"fmt"
	"log"
	"os"

	"github.com/egoist/mygo"
)

// Reporter lets the web page hand its result to Go (used for headless runs).
type Reporter struct{}

// Report prints the JSON result and exits in auto mode.
func (Reporter) Report(json string) {
	fmt.Printf("MEDIABUNNY_REPORT %s\n", json)
	if os.Getenv("MB_AUTO") == "1" {
		os.Exit(0)
	}
}

func main() {
	mygo.Bind(Reporter{})
	mygo.App.WhenReady(func() {
		url := "/"
		if os.Getenv("MB_AUTO") == "1" {
			url = "/?auto=1"
		}
		mygo.NewWindow(mygo.WindowOptions{
			Title:  "Mediabunny PoC (MyGo)",
			Width:  820,
			Height: 760,
			URL:    url,
		})
	})
	if err := mygo.App.Run(); err != nil {
		log.Fatal(err)
	}
}
