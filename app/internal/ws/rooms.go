package ws

import "fmt"

func BoardRoom(boardID int) string { return fmt.Sprintf("board:%d", boardID) }
func ThreadRoom(postID int) string { return fmt.Sprintf("thread:%d", postID) }

func DMRoom(userA, userB int) string {
	if userA > userB {
		userA, userB = userB, userA
	}
	return fmt.Sprintf("dm:%d:%d", userA, userB)
}

func FriendRoom(senderID int, friendIDs []int) string {
	room := fmt.Sprintf("friends:%d", senderID)
	for _, friendID := range friendIDs {
		room += fmt.Sprintf(":%d", friendID)
	}
	return room
}