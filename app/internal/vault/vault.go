package vault

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
)

type Secrets struct {
	DBPassword string
}

func LoadSecrets() (Secrets, error) {

	addr := os.Getenv("VAULT_ADDR")
	token := os.Getenv("VAULT_TOKEN")

	req, _ := http.NewRequest("GET", addr+"/v1/secret/data/ft_transcendence", nil)
	req.Header.Set("X-Vault-Token", token)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return Secrets{}, fmt.Errorf("vault not active: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return Secrets{}, fmt.Errorf("vault error: status %d", resp.StatusCode)
	}

	var result struct {
		Data struct {
			Data map[string]string `json:"data"`
		} `json:"data"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return Secrets{}, fmt.Errorf("vault decode: %w", err)
	}

	d := result.Data.Data
	return Secrets{
		DBPassword: d["db_password"],
	}, nil
}
