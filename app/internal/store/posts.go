package store

import (
	"context"
	"ft_transcendence/internal/models"
	"github.com/jackc/pgx/v5/pgxpool"
	"log"
)

func CreatePost(db *pgxpool.Pool, ctx context.Context, post models.PostCreate, boardID, authorID int) (int, error) {
	var id int
	err := db.QueryRow(ctx, `
		INSERT INTO posts (board_id, author_id, title, content, parent_id, upload_path)
		VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
		boardID, authorID, post.Title, post.Content, post.ParentID, post.UploadPath,
	).Scan(&id)
	return id, err
}

func GetThreads(db *pgxpool.Pool, ctx context.Context, boardID int, limit, offset int) ([]models.Post, error) {
	rows, err := db.Query(ctx, `
		SELECT p.id, p.board_id, b.name as board_name, p.author_id, u.login as username, 
		       p.title, p.content, COALESCE(p.upload_path, '') as upload_path, p.parent_id, p.created_at,
		       (SELECT COUNT(*) FROM posts r WHERE r.parent_id = p.id) as reply_count
		FROM posts p
		JOIN boards b ON p.board_id = b.id
		LEFT JOIN users u ON p.author_id = u.id
		WHERE p.board_id = $1 AND p.parent_id IS NULL
		ORDER BY p.created_at DESC LIMIT $2 OFFSET $3`,
		boardID, limit, offset,
	)
	if err != nil {
		log.Printf("GetThreads query error: %v", err)
		return nil, err
	}
	defer rows.Close()

	var posts []models.Post
	for rows.Next() {
		var p models.Post
		if err := rows.Scan(&p.ID, &p.BoardID, &p.BoardName, &p.AuthorID, &p.Username, &p.Title, &p.Content, &p.UploadPath, &p.ParentID, &p.CreatedAt, &p.ReplyCount); err != nil {
			log.Printf("GetThreads scan error: %v", err)
			return nil, err
		}
		posts = append(posts, p)
	}
	return posts, nil
}

func GetScrollThreads(db *pgxpool.Pool, ctx context.Context, boardID int, limit, cursor int) ([]models.Post, error) {
	rows, err := db.Query(ctx, `
		SELECT p.id, p.board_id, b.name as board_name, p.author_id, u.login as username, 
		       p.title, p.content, COALESCE(p.upload_path, '') as upload_path, p.parent_id, p.created_at,
		       (SELECT COUNT(*) FROM posts r WHERE r.parent_id = p.id) as reply_count
		FROM posts p
		JOIN boards b ON p.board_id = b.id
		LEFT JOIN users u ON p.author_id = u.id
		WHERE p.board_id = $1 AND p.parent_id IS NULL AND p.id > $2
		ORDER BY p.id ASC LIMIT $3`,
		boardID, cursor, limit,
	)
	if err != nil {
		log.Printf("GetScrollThreads query error: %v", err)
		return nil, err
	}
	defer rows.Close()

	var posts []models.Post
	for rows.Next() {
		var p models.Post
		if err := rows.Scan(&p.ID, &p.BoardID, &p.BoardName, &p.AuthorID, &p.Username, &p.Title, &p.Content, &p.UploadPath, &p.ParentID, &p.CreatedAt, &p.ReplyCount); err != nil {
			log.Printf("GetScrollThreads scan error: %v", err)
			return nil, err
		}
		posts = append(posts, p)
	}
	return posts, nil
}

func GetReplies(db *pgxpool.Pool, ctx context.Context, postID int) ([]models.Post, error) {
	rows, err := db.Query(ctx, `
		SELECT p.id, p.board_id, b.name as board_name, p.author_id, u.login as username, 
		       p.title, p.content, COALESCE(p.upload_path, '') as upload_path, p.parent_id, p.created_at,
		       (SELECT COUNT(*) FROM posts r WHERE r.parent_id = p.id) as reply_count
		FROM posts p
		JOIN boards b ON p.board_id = b.id
		LEFT JOIN users u ON p.author_id = u.id
		WHERE p.parent_id = $1
		ORDER BY p.created_at ASC`,
		postID,
	)
	if err != nil {
		log.Printf("GetReplies query error: %v", err)
		return nil, err
	}
	defer rows.Close()

	var posts []models.Post
	for rows.Next() {
		var p models.Post
		if err := rows.Scan(&p.ID, &p.BoardID, &p.BoardName, &p.AuthorID, &p.Username, &p.Title, &p.Content, &p.UploadPath, &p.ParentID, &p.CreatedAt, &p.ReplyCount); err != nil {
			log.Printf("GetReplies scan error: %v", err)
			return nil, err
		}
		posts = append(posts, p)
	}
	return posts, nil
}

func GetScrollReplies(db *pgxpool.Pool, ctx context.Context, parentID int, limit, cursor int) ([]models.Post, error) {
	rows, err := db.Query(ctx, `
		SELECT p.id, p.board_id, b.name as board_name, p.author_id, u.login as username, 
		       p.title, p.content, COALESCE(p.upload_path, '') as upload_path, p.parent_id, p.created_at,
		       (SELECT COUNT(*) FROM posts r WHERE r.parent_id = p.id) as reply_count
		FROM posts p
		JOIN boards b ON p.board_id = b.id
		LEFT JOIN users u ON p.author_id = u.id
		WHERE p.parent_id = $1 AND p.id > $2
		ORDER BY p.id ASC LIMIT $3`,
		parentID, cursor, limit,
	)
	if err != nil {
		log.Printf("GetScrollReplies query error: %v", err)
		return nil, err
	}
	defer rows.Close()

	var posts []models.Post
	for rows.Next() {
		var p models.Post
		if err := rows.Scan(&p.ID, &p.BoardID, &p.BoardName, &p.AuthorID, &p.Username, &p.Title, &p.Content, &p.UploadPath, &p.ParentID, &p.CreatedAt, &p.ReplyCount); err != nil {
			log.Printf("GetScrollReplies scan error: %v", err)
			return nil, err
		}
		posts = append(posts, p)
	}
	return posts, nil
}

func GetPost(db *pgxpool.Pool, ctx context.Context, postID int) (models.Post, error) {
	var p models.Post
	err := db.QueryRow(ctx, `
		SELECT p.id, p.board_id, b.name as board_name, p.author_id, u.login as username, 
		       p.title, p.content, COALESCE(p.upload_path, '') as upload_path, p.parent_id, p.created_at,
		       (SELECT COUNT(*) FROM posts r WHERE r.parent_id = p.id) as reply_count
		FROM posts p
		JOIN boards b ON p.board_id = b.id
		LEFT JOIN users u ON p.author_id = u.id
		WHERE p.id = $1`,
		postID,
	).Scan(&p.ID, &p.BoardID, &p.BoardName, &p.AuthorID, &p.Username, &p.Title, &p.Content, &p.UploadPath, &p.ParentID, &p.CreatedAt, &p.ReplyCount)
	if err != nil {
		log.Printf("GetPost scan error: %v", err)
	}
	return p, err
}

func GetPostAuthorID(db *pgxpool.Pool, ctx context.Context, postID int) (int, error) {
	var authorID int
	err := db.QueryRow(ctx, "SELECT author_id FROM posts WHERE id = $1", postID).Scan(&authorID)
	return authorID, err
}

func GetPostBoardID(db *pgxpool.Pool, ctx context.Context, postID int) (int, error) {
	var boardID int
	err := db.QueryRow(ctx, "SELECT board_id FROM posts WHERE id = $1", postID).Scan(&boardID)
	return boardID, err
}

func UpdatePost(db *pgxpool.Pool, ctx context.Context, postID int, post models.PostEdit) error {
	_, err := db.Exec(ctx, "UPDATE posts SET content = $1 WHERE id = $2", post.Content, postID)
	return err
}

func DeletePost(db *pgxpool.Pool, ctx context.Context, postID int) error {
	_, err := db.Exec(ctx, "DELETE FROM posts WHERE id = $1", postID)
	return err
}
