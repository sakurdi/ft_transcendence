package users

import (
	"encoding/json"
	"fmt"
	// "ft_transcendence/internal/auth"
	"ft_transcendence/internal/config"
	"ft_transcendence/internal/models"
	store "ft_transcendence/internal/store"
	// "io"
	"net/http"
)

type userDataResonseJSON struct {
	Success bool		`json:"success"`
	Context string		`json:"context"`
	UserInfo models.UserInfo	`json:"userinfo"`
}

func GetUserDataHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		responseJSON := userDataResonseJSON{false, "", models.UserInfo{}}
		w.Header().Set("Content-Type", "application/json")
		
		username := c.Session.GetString(r.Context(), "username")
		fmt.Printf("Found: %v\n", username)
		userData, err := store.GetUserInfo(c.DB, r.Context(), username)
		fmt.Printf("UserData: %v\n", userData)

		if (err != nil) {
			responseJSON.Context = "Error"
		} else {
			responseJSON.Success = true;
			responseJSON.UserInfo = userData
		}
		json.NewEncoder(w).Encode(responseJSON)
		w.WriteHeader(http.StatusOK)
	}
}
