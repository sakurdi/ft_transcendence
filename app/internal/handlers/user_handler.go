package UserHandler

import (
	"fmt"
	"ft_transcendence/internal/config"
	"ft_transcendence/internal/store"
	"ft_transcendence/internal/models"
	"net/http"
	"io"
	"encoding/json"

	"github.com/go-chi/chi/v5"
)

func LoginHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var userInfo models.UserLogin

	if err := json.NewDecoder(r.Body).Decode(&userInfo); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	fmt.Fprintf(w, "Recieved user: %v password: %v\n", userInfo.Login, userInfo.Password)
	

	}
}

func GetUserById(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		idStr := chi.URLParam(r, "id")

		login, err := store.GetUserLogin(c.DB, r.Context(), idStr)

		if err != nil {
			http.Error(w, "User not found", http.StatusNotFound)
			return
		}
		fmt.Fprintf(w, "login: %s", login)
	}
}


func SessionNewHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {		
		c.Session.Put(r.Context(), "Test", "Test session message")
		fmt.Fprintf(w, "%v created", c.Session.Get(r.Context(), "Test"))
	}
}

func SessionGetHandler(c *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		
		msg := c.Session.GetString(r.Context(), "Test")
		if msg != ""{
			io.WriteString(w, msg)
		}else{
			http.Error(w, "Session not found", 404)
		}
	}
}
