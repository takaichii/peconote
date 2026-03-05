package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/peconote/peconote/internal/domain"
)

type GroupRepository interface {
	Create(ctx context.Context, g *domain.Group) error
	List(ctx context.Context) ([]*domain.Group, error)
	Get(ctx context.Context, id uuid.UUID) (*domain.Group, error)
	Update(ctx context.Context, g *domain.Group) error
	Delete(ctx context.Context, id uuid.UUID) error
}
