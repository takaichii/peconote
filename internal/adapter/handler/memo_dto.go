package handler

import (
	"time"

	"github.com/peconote/peconote/internal/domain/model"
)

type MemoCreateRequest struct {
	Body    string   `json:"body" binding:"required,max=2000"`
	Tags    []string `json:"tags" binding:"max=10"`
	GroupID *string  `json:"group_id"`
}

type MemoUpdateRequest struct {
	Body    string   `json:"body" binding:"required,max=2000"`
	Tags    []string `json:"tags" binding:"max=10"`
	GroupID *string  `json:"group_id"`
}

type MemoCreateResponse struct {
	ID string `json:"id"`
}

type MemoItem struct {
	ID        string    `json:"id"`
	Body      string    `json:"body"`
	Tags      []string  `json:"tags"`
	GroupID   *string   `json:"group_id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type MemoListResponse struct {
	Items      []MemoItem       `json:"items"`
	Pagination model.Pagination `json:"pagination"`
}
