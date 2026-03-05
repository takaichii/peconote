package handler

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/peconote/peconote/internal/usecase"
)

type GroupHandler struct {
	usecase usecase.GroupUsecase
}

func NewGroupHandler(u usecase.GroupUsecase) *GroupHandler {
	return &GroupHandler{usecase: u}
}

func (h *GroupHandler) CreateGroup(c *gin.Context) {
	var req GroupCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	id, err := h.usecase.CreateGroup(c.Request.Context(), req.Name)
	if err != nil {
		if errors.Is(err, usecase.ErrInvalidGroup) {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
		return
	}
	c.Header("Location", "/api/groups/"+id.String())
	c.JSON(http.StatusCreated, GroupCreateResponse{ID: id.String()})
}

func (h *GroupHandler) ListGroups(c *gin.Context) {
	groups, err := h.usecase.ListGroups(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
		return
	}
	items := make([]GroupItem, len(groups))
	for i, g := range groups {
		items[i] = GroupItem{
			ID:        g.ID.String(),
			Name:      g.Name,
			CreatedAt: g.CreatedAt,
			UpdatedAt: g.UpdatedAt,
		}
	}
	c.JSON(http.StatusOK, GroupListResponse{Items: items})
}

func (h *GroupHandler) GetGroup(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	g, err := h.usecase.GetGroup(c.Request.Context(), id)
	if err != nil {
		switch {
		case errors.Is(err, usecase.ErrGroupNotFound):
			c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
		}
		return
	}
	c.JSON(http.StatusOK, GroupItem{
		ID:        g.ID.String(),
		Name:      g.Name,
		CreatedAt: g.CreatedAt,
		UpdatedAt: g.UpdatedAt,
	})
}

func (h *GroupHandler) UpdateGroup(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	var req GroupUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.usecase.UpdateGroup(c.Request.Context(), id, req.Name); err != nil {
		switch {
		case errors.Is(err, usecase.ErrInvalidGroup):
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		case errors.Is(err, usecase.ErrGroupNotFound):
			c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
		}
		return
	}
	c.Status(http.StatusNoContent)
}

func (h *GroupHandler) DeleteGroup(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	if err := h.usecase.DeleteGroup(c.Request.Context(), id); err != nil {
		switch {
		case errors.Is(err, usecase.ErrGroupNotFound):
			c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
		}
		return
	}
	c.Status(http.StatusNoContent)
}
