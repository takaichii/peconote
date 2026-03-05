package handler

import "time"

type GroupCreateRequest struct {
	Name string `json:"name" binding:"required,max=50"`
}

type GroupUpdateRequest struct {
	Name string `json:"name" binding:"required,max=50"`
}

type GroupCreateResponse struct {
	ID string `json:"id"`
}

type GroupItem struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type GroupListResponse struct {
	Items []GroupItem `json:"items"`
}
