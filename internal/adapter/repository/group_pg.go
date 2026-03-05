package repository

import (
	"context"
	"database/sql"
	"time"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/peconote/peconote/internal/domain"
	domainRepo "github.com/peconote/peconote/internal/domain/repository"
)

type groupRepository struct {
	db *sqlx.DB
}

func NewGroupRepository(db *sqlx.DB) domainRepo.GroupRepository {
	return &groupRepository{db: db}
}

func (r *groupRepository) Create(ctx context.Context, g *domain.Group) error {
	query := `INSERT INTO memo_group (id, name, created_at, updated_at) VALUES ($1, $2, $3, $4)`
	_, err := r.db.ExecContext(ctx, query, g.ID, g.Name, g.CreatedAt, g.UpdatedAt)
	return err
}

func (r *groupRepository) List(ctx context.Context) ([]*domain.Group, error) {
	type groupRow struct {
		ID        uuid.UUID `db:"id"`
		Name      string    `db:"name"`
		CreatedAt time.Time `db:"created_at"`
		UpdatedAt time.Time `db:"updated_at"`
	}
	var rows []groupRow
	if err := r.db.SelectContext(ctx, &rows, `SELECT id, name, created_at, updated_at FROM memo_group ORDER BY name ASC`); err != nil {
		return nil, err
	}
	groups := make([]*domain.Group, len(rows))
	for i, row := range rows {
		groups[i] = &domain.Group{
			ID:        row.ID,
			Name:      row.Name,
			CreatedAt: row.CreatedAt,
			UpdatedAt: row.UpdatedAt,
		}
	}
	return groups, nil
}

func (r *groupRepository) Get(ctx context.Context, id uuid.UUID) (*domain.Group, error) {
	type groupRow struct {
		ID        uuid.UUID `db:"id"`
		Name      string    `db:"name"`
		CreatedAt time.Time `db:"created_at"`
		UpdatedAt time.Time `db:"updated_at"`
	}
	var row groupRow
	if err := r.db.GetContext(ctx, &row, `SELECT id, name, created_at, updated_at FROM memo_group WHERE id = $1`, id); err != nil {
		return nil, err
	}
	return &domain.Group{
		ID:        row.ID,
		Name:      row.Name,
		CreatedAt: row.CreatedAt,
		UpdatedAt: row.UpdatedAt,
	}, nil
}

func (r *groupRepository) Update(ctx context.Context, g *domain.Group) error {
	res, err := r.db.ExecContext(ctx,
		`UPDATE memo_group SET name = $1, updated_at = $2 WHERE id = $3`,
		g.Name, g.UpdatedAt, g.ID,
	)
	if err != nil {
		return err
	}
	if cnt, err := res.RowsAffected(); err == nil && cnt == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (r *groupRepository) Delete(ctx context.Context, id uuid.UUID) error {
	res, err := r.db.ExecContext(ctx, `DELETE FROM memo_group WHERE id = $1`, id)
	if err != nil {
		return err
	}
	if cnt, err := res.RowsAffected(); err == nil && cnt == 0 {
		return sql.ErrNoRows
	}
	return nil
}
