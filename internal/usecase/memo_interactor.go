package usecase

import (
	"context"
	"database/sql"
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/peconote/peconote/internal/domain"
	"github.com/peconote/peconote/internal/domain/model"
	"github.com/peconote/peconote/internal/domain/repository"
)

var ErrInvalidMemo = errors.New("invalid memo")
var ErrInvalidMemoQuery = errors.New("invalid memo query")
var ErrMemoNotFound = errors.New("memo not found")

type MemoUsecase interface {
	CreateMemo(ctx context.Context, body string, tags []string, groupID *uuid.UUID) (uuid.UUID, error)
	ListMemos(ctx context.Context, page, pageSize int, tag *string, groupID *uuid.UUID) ([]*domain.Memo, *model.Pagination, error)
	GetMemo(ctx context.Context, id uuid.UUID) (*domain.Memo, error)
	UpdateMemo(ctx context.Context, id uuid.UUID, body string, tags []string, groupID *uuid.UUID) error
	DeleteMemo(ctx context.Context, id uuid.UUID) error
}

type memoUsecase struct {
	repo repository.MemoRepository
}

func NewMemoUsecase(r repository.MemoRepository) MemoUsecase {
	return &memoUsecase{repo: r}
}

func (u *memoUsecase) CreateMemo(ctx context.Context, body string, tags []string, groupID *uuid.UUID) (uuid.UUID, error) {
	if strings.TrimSpace(body) == "" || len(body) > 2000 {
		return uuid.Nil, ErrInvalidMemo
	}
	if len(tags) > 10 {
		return uuid.Nil, ErrInvalidMemo
	}
	for _, t := range tags {
		if l := len(t); l < 1 || l > 30 {
			return uuid.Nil, ErrInvalidMemo
		}
	}
	id := uuid.New()
	now := time.Now().UTC()
	memo := &domain.Memo{
		ID:        id,
		Body:      body,
		Tags:      tags,
		GroupID:   groupID,
		CreatedAt: now,
		UpdatedAt: now,
	}
	if err := u.repo.Create(ctx, memo); err != nil {
		return uuid.Nil, err
	}
	return id, nil
}

func (u *memoUsecase) ListMemos(ctx context.Context, page, pageSize int, tag *string, groupID *uuid.UUID) ([]*domain.Memo, *model.Pagination, error) {
	if pageSize < 1 || pageSize > 100 {
		return nil, nil, ErrInvalidMemoQuery
	}
	if tag != nil {
		t := strings.TrimSpace(*tag)
		if t == "" || len(t) > 30 {
			return nil, nil, ErrInvalidMemoQuery
		}
		*tag = t
	}
	offset := (page - 1) * pageSize
	items, total, err := u.repo.List(ctx, tag, groupID, pageSize, offset)
	if err != nil {
		return nil, nil, err
	}
	totalPages := 0
	if pageSize > 0 {
		totalPages = (total + pageSize - 1) / pageSize
	}
	p := &model.Pagination{
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
		TotalCount: total,
	}
	return items, p, nil
}

func (u *memoUsecase) GetMemo(ctx context.Context, id uuid.UUID) (*domain.Memo, error) {
	memo, err := u.repo.Get(ctx, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrMemoNotFound
		}
		return nil, err
	}
	return memo, nil
}

func (u *memoUsecase) UpdateMemo(ctx context.Context, id uuid.UUID, body string, tags []string, groupID *uuid.UUID) error {
	if strings.TrimSpace(body) == "" || len(body) > 2000 {
		return ErrInvalidMemo
	}
	if len(tags) > 10 {
		return ErrInvalidMemo
	}
	for _, t := range tags {
		if l := len(t); l < 1 || l > 30 {
			return ErrInvalidMemo
		}
	}
	memo := &domain.Memo{
		ID:        id,
		Body:      body,
		Tags:      tags,
		GroupID:   groupID,
		UpdatedAt: time.Now().UTC(),
	}
	if err := u.repo.Update(ctx, memo); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrMemoNotFound
		}
		return err
	}
	return nil
}

func (u *memoUsecase) DeleteMemo(ctx context.Context, id uuid.UUID) error {
	if err := u.repo.Delete(ctx, id); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrMemoNotFound
		}
		return err
	}
	return nil
}
