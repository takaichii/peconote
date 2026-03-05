package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/spf13/cobra"
)

var apiBase string

func main() {
	apiBase = os.Getenv("PECO_API")
	if apiBase == "" {
		apiBase = "http://localhost:8080/api"
	}

	root := &cobra.Command{
		Use:   "peco",
		Short: "PecoNote CLI — manage your memos from the terminal",
	}

	root.AddCommand(
		listCmd(),
		createCmd(),
		getCmd(),
		editCmd(),
		deleteCmd(),
	)

	if err := root.Execute(); err != nil {
		os.Exit(1)
	}
}

// ─── API types ───────────────────────────────────────────────────────────────

type memoItem struct {
	ID        string    `json:"id"`
	Body      string    `json:"body"`
	Tags      []string  `json:"tags"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type pagination struct {
	Page       int `json:"page"`
	PageSize   int `json:"page_size"`
	TotalPages int `json:"total_pages"`
	TotalCount int `json:"total_count"`
}

type listResponse struct {
	Items      []memoItem `json:"items"`
	Pagination pagination `json:"pagination"`
}

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

func doRequest(method, path string, body any) (*http.Response, error) {
	var r io.Reader
	if body != nil {
		b, err := json.Marshal(body)
		if err != nil {
			return nil, err
		}
		r = bytes.NewReader(b)
	}
	req, err := http.NewRequest(method, apiBase+path, r)
	if err != nil {
		return nil, err
	}
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	return http.DefaultClient.Do(req)
}

func decodeJSON(resp *http.Response, v any) error {
	defer resp.Body.Close()
	return json.NewDecoder(resp.Body).Decode(v)
}

// ─── Display helpers ──────────────────────────────────────────────────────────

func printMemoList(items []memoItem) {
	if len(items) == 0 {
		fmt.Println("No memos found.")
		return
	}
	for _, m := range items {
		preview := strings.ReplaceAll(m.Body, "\n", " ")
		if len([]rune(preview)) > 60 {
			preview = string([]rune(preview)[:60]) + "…"
		}
		tags := ""
		if len(m.Tags) > 0 {
			tags = " [" + strings.Join(m.Tags, ", ") + "]"
		}
		fmt.Printf("%-36s  %s%s\n", m.ID, preview, tags)
	}
}

func printMemo(m *memoItem) {
	fmt.Printf("ID:      %s\n", m.ID)
	fmt.Printf("Body:\n%s\n", m.Body)
	if len(m.Tags) > 0 {
		fmt.Printf("Tags:    %s\n", strings.Join(m.Tags, ", "))
	}
	fmt.Printf("Created: %s\n", m.CreatedAt.Local().Format("2006-01-02 15:04:05"))
	fmt.Printf("Updated: %s\n", m.UpdatedAt.Local().Format("2006-01-02 15:04:05"))
}

// ─── list ─────────────────────────────────────────────────────────────────────

func listCmd() *cobra.Command {
	var tag string
	var page int

	cmd := &cobra.Command{
		Use:   "list",
		Short: "List memos",
		RunE: func(cmd *cobra.Command, _ []string) error {
			path := fmt.Sprintf("/memos?page=%d&page_size=20", page)
			if tag != "" {
				path += "&tag=" + tag
			}
			resp, err := doRequest("GET", path, nil)
			if err != nil {
				return err
			}
			var result listResponse
			if err := decodeJSON(resp, &result); err != nil {
				return err
			}
			printMemoList(result.Items)
			if result.Pagination.TotalPages > 1 {
				fmt.Printf("\nPage %d / %d  (%d total)\n",
					result.Pagination.Page,
					result.Pagination.TotalPages,
					result.Pagination.TotalCount,
				)
			}
			return nil
		},
	}
	cmd.Flags().StringVar(&tag, "tag", "", "Filter by tag")
	cmd.Flags().IntVar(&page, "page", 1, "Page number")
	return cmd
}

// ─── create ───────────────────────────────────────────────────────────────────

func createCmd() *cobra.Command {
	var tags []string

	cmd := &cobra.Command{
		Use:   "create <body>",
		Short: "Create a new memo",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			payload := map[string]any{
				"body": args[0],
				"tags": tags,
			}
			resp, err := doRequest("POST", "/memos", payload)
			if err != nil {
				return err
			}
			defer resp.Body.Close()
			if resp.StatusCode != http.StatusCreated {
				b, _ := io.ReadAll(resp.Body)
				return fmt.Errorf("server returned %d: %s", resp.StatusCode, b)
			}
			var result struct {
				ID string `json:"id"`
			}
			if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
				return err
			}
			fmt.Printf("Created: %s\n", result.ID)
			return nil
		},
	}
	cmd.Flags().StringSliceVar(&tags, "tags", nil, "Comma-separated tags (e.g. --tags work,idea)")
	return cmd
}

// ─── get ──────────────────────────────────────────────────────────────────────

func getCmd() *cobra.Command {
	return &cobra.Command{
		Use:   "get <id>",
		Short: "Show a memo",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			resp, err := doRequest("GET", "/memos/"+args[0], nil)
			if err != nil {
				return err
			}
			if resp.StatusCode == http.StatusNotFound {
				return fmt.Errorf("memo not found: %s", args[0])
			}
			var m memoItem
			if err := decodeJSON(resp, &m); err != nil {
				return err
			}
			printMemo(&m)
			return nil
		},
	}
}

// ─── edit ─────────────────────────────────────────────────────────────────────

func editCmd() *cobra.Command {
	var body string
	var tags []string
	var addTags []string
	var removeTags []string

	cmd := &cobra.Command{
		Use:   "edit <id>",
		Short: "Edit a memo",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			// fetch current memo first
			resp, err := doRequest("GET", "/memos/"+args[0], nil)
			if err != nil {
				return err
			}
			if resp.StatusCode == http.StatusNotFound {
				return fmt.Errorf("memo not found: %s", args[0])
			}
			var current memoItem
			if err := decodeJSON(resp, &current); err != nil {
				return err
			}

			// apply changes
			newBody := current.Body
			if cmd.Flags().Changed("body") {
				newBody = body
			}

			newTags := current.Tags
			if cmd.Flags().Changed("tags") {
				newTags = tags
			} else {
				// incremental add/remove
				removeSet := make(map[string]bool)
				for _, t := range removeTags {
					removeSet[t] = true
				}
				filtered := make([]string, 0, len(newTags))
				for _, t := range newTags {
					if !removeSet[t] {
						filtered = append(filtered, t)
					}
				}
				newTags = filtered
				newTags = append(newTags, addTags...)
			}

			payload := map[string]any{"body": newBody, "tags": newTags}
			putResp, err := doRequest("PUT", "/memos/"+args[0], payload)
			if err != nil {
				return err
			}
			defer putResp.Body.Close()
			if putResp.StatusCode != http.StatusNoContent {
				b, _ := io.ReadAll(putResp.Body)
				return fmt.Errorf("server returned %d: %s", putResp.StatusCode, b)
			}
			fmt.Printf("Updated: %s\n", args[0])
			return nil
		},
	}
	cmd.Flags().StringVar(&body, "body", "", "New body text")
	cmd.Flags().StringSliceVar(&tags, "tags", nil, "Replace all tags")
	cmd.Flags().StringSliceVar(&addTags, "add-tag", nil, "Add tag(s)")
	cmd.Flags().StringSliceVar(&removeTags, "remove-tag", nil, "Remove tag(s)")
	return cmd
}

// ─── delete ───────────────────────────────────────────────────────────────────

func deleteCmd() *cobra.Command {
	var force bool

	cmd := &cobra.Command{
		Use:   "delete <id>",
		Short: "Delete a memo",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			if !force {
				fmt.Printf("Delete memo %s? [y/N] ", args[0])
				var ans string
				fmt.Scanln(&ans)
				if strings.ToLower(ans) != "y" {
					fmt.Println("Cancelled.")
					return nil
				}
			}
			resp, err := doRequest("DELETE", "/memos/"+args[0], nil)
			if err != nil {
				return err
			}
			defer resp.Body.Close()
			switch resp.StatusCode {
			case http.StatusNoContent:
				fmt.Printf("Deleted: %s\n", args[0])
			case http.StatusNotFound:
				return fmt.Errorf("memo not found: %s", args[0])
			default:
				b, _ := io.ReadAll(resp.Body)
				return fmt.Errorf("server returned %d: %s", resp.StatusCode, b)
			}
			return nil
		},
	}
	cmd.Flags().BoolVarP(&force, "force", "f", false, "Skip confirmation")
	return cmd
}
