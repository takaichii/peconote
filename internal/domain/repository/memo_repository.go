package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/peconote/peconote/internal/domain"
)

type MemoRepository interface {
	Create(ctx context.Context, m *domain.Memo) error
	List(ctx context.Context, tag *string, groupID *uuid.UUID, limit, offset int) ([]*domain.Memo, int, error)
	Get(ctx context.Context, id uuid.UUID) (*domain.Memo, error)
	Update(ctx context.Context, m *domain.Memo) error
	Delete(ctx context.Context, id uuid.UUID) error
}
