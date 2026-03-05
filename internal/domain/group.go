package domain

import (
	"time"

	"github.com/google/uuid"
)

type Group struct {
	ID        uuid.UUID
	Name      string
	CreatedAt time.Time
	UpdatedAt time.Time
}
