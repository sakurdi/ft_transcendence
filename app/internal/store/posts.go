func GetPost(db *pgxpool.Pool, ctx context.Context, postID int) (models.Post, error) {
	var p models.Post
	err := db.QueryRow(ctx, `
		SELECT p.id, p.board_id, b.name, p.author_id, COALESCE(u.login, '[deleted]'), p.title, p.content, p.parent_id, p.created_at, COALESCE(p.upload_path, '') AS upload_path
		FROM posts p 
		LEFT JOIN users u ON p.author_id = u.id
		LEFT JOIN boards b ON p.board_id = b.id
		WHERE p.id=$1`,
		postID,
	).Scan(&p.ID, &p.BoardID, &p.BoardName, &p.AuthorID, &p.Username, &p.Title, &p.Content, &p.ParentID, &p.CreatedAt, &p.UploadPath)
	return p, err
}
