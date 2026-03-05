package router

import (
	"encoding/json"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
	"gorm.io/gorm"

	adapterhandler "github.com/peconote/peconote/internal/adapter/handler"
	adapterrepo "github.com/peconote/peconote/internal/adapter/repository"
	"github.com/peconote/peconote/internal/infrastructure/persistence"
	"github.com/peconote/peconote/internal/interfaces/controller"
	"github.com/peconote/peconote/internal/usecase"
)

func NewRouter(gormDB *gorm.DB, sqlxDB *sqlx.DB) *gin.Engine {
	r := gin.New()
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Content-Type"},
	}))
	r.Use(gin.Recovery(), jsonLogger())

	userRepo := persistence.NewUserRepository(gormDB)
	userUsecase := usecase.NewUserUsecase(userRepo)
	userController := controller.NewUserController(userUsecase)

	r.GET("/users", userController.GetUsers)
	r.POST("/users", userController.CreateUser)

	memoRepo := adapterrepo.NewMemoRepository(sqlxDB)
	memoUsecase := usecase.NewMemoUsecase(memoRepo)
	memoHandler := adapterhandler.NewMemoHandler(memoUsecase)

	r.POST("/api/memos", memoHandler.CreateMemo)
	r.GET("/api/memos", memoHandler.ListMemos)
	r.GET("/api/memos/:id", memoHandler.GetMemo)
	r.PUT("/api/memos/:id", memoHandler.UpdateMemo)
	r.DELETE("/api/memos/:id", memoHandler.DeleteMemo)

	return r
}

func jsonLogger() gin.HandlerFunc {
	return gin.LoggerWithFormatter(func(param gin.LogFormatterParams) string {
		m := map[string]interface{}{
			"method":     param.Method,
			"path":       param.Path,
			"status":     param.StatusCode,
			"latency_ms": param.Latency.Milliseconds(),
		}
		q := param.Request.URL.Query()
		if v := q.Get("page"); v != "" {
			m["page"] = v
		}
		if v := q.Get("page_size"); v != "" {
			m["page_size"] = v
		}
		if v := q.Get("tag"); v != "" {
			m["tag"] = v
		}
		if v := param.Request.Context().Value("trace_id"); v != nil {
			if s, ok := v.(string); ok {
				m["trace_id"] = s
			}
		}
		b, _ := json.Marshal(m)
		return string(b) + "\n"
	})
}
