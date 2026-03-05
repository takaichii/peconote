package usecase

import (
	"context"
	"database/sql"
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/peconote/peconote/internal/domain"
	"github.com/peconote/peconote/internal/domain/repository"
)

var ErrInvalidGroup = errors.New("invalid group")
var ErrGroupNotFound = errors.New("group not found")

type GroupUsecase interface {
	CreateGroup(ctx context.Context, name string) (uuid.UUID, error)
	ListGroups(ctx context.Context) ([]*domain.Group, error)
	GetGroup(ctx context.Context, id uuid.UUID) (*domain.Group, error)
	UpdateGroup(ctx context.Context, id uuid.UUID, name string) error
	DeleteGroup(ctx context.Context, id uuid.UUID) error
}

type groupUsecase struct {
	repo repository.GroupRepository
}

func NewGroupUsecase(r repository.GroupRepository) GroupUsecase {
	return &groupUsecase{repo: r}
}

func (u *groupUsecase) CreateGroup(ctx context.Context, name string) (uuid.UUID, error) {
	name = strings.TrimSpace(name)
	if name == "" || len(name) > 50 {
		return uuid.Nil, ErrInvalidGroup
	}
	now := time.Now().UTC()
	g := &domain.Group{
		ID:        uuid.New(),
		Name:      name,
		CreatedAt: now,
		UpdatedAt: now,
	}
	if err := u.repo.Create(ctx, g); err != nil {
		return uuid.Nil, err
	}
	return g.ID, nil
}

func (u *groupUsecase) ListGroups(ctx context.Context) ([]*domain.Group, error) {
	return u.repo.List(ctx)
}

func (u *groupUsecase) GetGroup(ctx context.Context, id uuid.UUID) (*domain.Group, error) {
	g, err := u.repo.Get(ctx, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrGroupNotFound
		}
		return nil, err
	}
	return g, nil
}

func (u *groupUsecase) UpdateGroup(ctx context.Context, id uuid.UUID, name string) error {
	name = strings.TrimSpace(name)
	if name == "" || len(name) > 50 {
		return ErrInvalidGroup
	}
	g := &domain.Group{
		ID:        id,
		Name:      name,
		UpdatedAt: time.Now().UTC(),
	}
	if err := u.repo.Update(ctx, g); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrGroupNotFound
		}
		return err
	}
	return nil
}

func (u *groupUsecase) DeleteGroup(ctx context.Context, id uuid.UUID) error {
	if err := u.repo.Delete(ctx, id); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrGroupNotFound
		}
		return err
	}
	return nil
}
