package store

import (
	"context"
	"ft_transcendence/internal/models"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	// "log"
)

func CreatePost(db *pgxpool.Pool, ctx context.Context, post models.PostCreate, boardID, authorID int) (int, error) {
	var id int
	err := db.QueryRow(ctx, `
		INSERT INTO posts (board_id, author_id, title, content, parent_id)
		VALUES ($1, $2, $3, $4, $5) RETURNING id`,
		boardID, authorID, post.Title, post.Content, post.ParentID,
	).Scan(&id)
	return id, err
}

func GetThreads(db *pgxpool.Pool, ctx context.Context, boardID, limit, offset int) ([]models.Post, error) {
	rows, err := db.Query(ctx, `
		SELECT p.id, p.board_id, p.author_id, COALESCE(u.login, '[deleted]'), p.title, p.content, p.parent_id, p.created_at
		FROM posts p LEFT JOIN users u ON p.author_id = u.id
		WHERE p.board_id=$1 AND p.parent_id IS NULL
		ORDER BY p.created_at DESC LIMIT $2 OFFSET $3`,
		boardID, limit, offset,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanPosts(rows)
}

func GetScrollThreads(db *pgxpool.Pool, ctx context.Context, boardID, limit, offset int) ([]models.Post, error) {
	rows, err := db.Query(ctx, `
		SELECT p.id, p.board_id, p.author_id, COALESCE(u.login, '[deleted]'), p.title, p.content, p.parent_id, p.created_at
		FROM posts p LEFT JOIN users u ON p.author_id = u.id
		WHERE p.board_id=$1 AND p.parent_id IS NULL
		ORDER BY p.created_at DESC LIMIT $2 OFFSET $3`,
		boardID, limit, offset,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanPosts(rows)
}

func GetScrollReplies(db *pgxpool.Pool, ctx context.Context, parentID, limit, offset int) ([]models.Post, error) {
	rows, err := db.Query(ctx, `
		SELECT p.id, p.board_id, p.author_id, COALESCE(u.login, '[deleted]'), p.title, p.content, p.parent_id, p.created_at
		FROM posts p LEFT JOIN users u ON p.author_id = u.id
		WHERE p.parent_id=$1
		ORDER BY p.created_at DESC LIMIT $2 OFFSET $3`,
		parentID, limit, offset,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanPosts(rows)
} 

func GetReplies(db *pgxpool.Pool, ctx context.Context, parentID int) ([]models.Post, error) {
	rows, err := db.Query(ctx, `
		SELECT p.id, p.board_id, p.author_id, COALESCE(u.login, '[deleted]'), p.title, p.content, p.parent_id, p.created_at
		FROM posts p LEFT JOIN users u ON p.author_id = u.id
		WHERE p.parent_id=$1
		ORDER BY p.created_at ASC`,
		parentID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanPosts(rows)
}

func GetPostBoardID(db *pgxpool.Pool, ctx context.Context, postID int) (int, error) {
	var boardID int
	err := db.QueryRow(ctx, "SELECT board_id FROM posts WHERE id=$1", postID).Scan(&boardID)
	return boardID, err
}

func DeletePost(db *pgxpool.Pool, ctx context.Context, postID int) error {
	_, err := db.Exec(ctx, "DELETE FROM posts WHERE id=$1", postID)
	return err
}

func scanPosts(rows pgx.Rows) ([]models.Post, error) {
	var posts []models.Post
	for rows.Next() {
		var p models.Post
		if err := rows.Scan(&p.ID, &p.BoardID, &p.AuthorID, &p.Username, &p.Title, &p.Content, &p.ParentID, &p.CreatedAt); err != nil {
			return nil, err
		}
		posts = append(posts, p)
	}
	return posts, rows.Err()
}

func GetPost(db *pgxpool.Pool, ctx context.Context, postID int) (models.Post, error) {
	var p models.Post
	err := db.QueryRow(ctx, `
		SELECT p.id, p.board_id, b.name, p.author_id, COALESCE(u.login, '[deleted]'), p.title, p.content, p.parent_id, p.created_at
		FROM posts p 
		LEFT JOIN users u ON p.author_id = u.id
		LEFT JOIN boards b ON p.board_id = b.id
		WHERE p.id=$1`,
		postID,
	).Scan(&p.ID, &p.BoardID, &p.BoardName, &p.AuthorID, &p.Username, &p.Title, &p.Content, &p.ParentID, &p.CreatedAt)
	return p, err
}

func UpdatePost(db *pgxpool.Pool, ctx context.Context, postID int, body models.PostEdit) error {
	_, err := db.Exec(ctx, "UPDATE posts SET content = $1, title = COALESCE($2, title) WHERE id = $3", body.Content, body.Title, postID)
	return err
}

func GetPostAuthorID(db *pgxpool.Pool, ctx context.Context, postID int) (int, error) {
	var authorID int
	err := db.QueryRow(ctx, "SELECT author_id FROM posts WHERE id=$1", postID).Scan(&authorID)
	return authorID, err
}
