package api

import (
  "errors"
  "net/http"
  "strings"
  "time"

  "blogit/internal/db"
  "github.com/golang-jwt/jwt/v5"
  "github.com/jackc/pgx/v5"
  "golang.org/x/crypto/bcrypt"
)

type RegisterRequest struct{
	Name	string `json:"name"`
	Email	string	`json:"email"`
	Password	string `json:"password"`
}

type LoginRequest struct{
	Email string `json:"email"`
	Password	string	`json:"password"`
}

type authorResponse struct {
  ID        string `json:"id"`
  Name      string `json:"name"`
  Email     string `json:"email"`
  CreatedAt string `json:"created_at"`
}

type LoginResponse struct {
	Token	string `json:"token"`
	Author  authorResponse	`json:"author"`
}



func (s *Server) handleRegister(w http.ResponseWriter , r *http.Request) {
	var req RegisterRequest

	if err:= readJSON(w,r,&req);err!=nil {
		writeError(w,http.StatusBadRequest,"Invalid request payload")
		return
	}

	req.Name = strings.TrimSpace(req.Name)
	req.Email = normalizeEmail(req.Email)

	if err:= validateRegister(req.Name,req.Email,req.Password);err!=nil {
		writeError(w,http.StatusUnprocessableEntity,err.Error())
		return
	}

	hash,err:= bcrypt.GenerateFromPassword([]byte(req.Password),bcrypt.DefaultCost)

	if err != nil {
		writeError(w,http.StatusInternalServerError,"failed to create account")
		return
	}

	author,err:= s.queries.CreateAuthor(r.Context(),db.CreateAuthorParams{
		Name: req.Name,
		Email: req.Email,
		PasswordHash: string(hash),
	})

	if err!=nil{
		if isUniqueViolation(err){
			writeError(w,http.StatusConflict,"email already registered")
			return
		}
		writeError(w,http.StatusInternalServerError,"failed to create account")
		return
	}

	writeJSON(w,http.StatusCreated,newAuthorResponse(author))
}

func (s *Server) handleLogin(w http.ResponseWriter,r *http.Request){
	var req LoginRequest
	if err:=readJSON(w,r,&req);err!=nil{
		writeError(w,http.StatusBadRequest,"Invalid payload")
		return
	}

	req.Email = normalizeEmail(req.Email)

	author, err := s.queries.GetAuthorByEmail(r.Context(), req.Email)
  	if err != nil {
    	if errors.Is(err, pgx.ErrNoRows) {
      	writeError(w, http.StatusUnauthorized, "invalid email or password")
      	return
   	 }
    writeError(w, http.StatusInternalServerError, "login failed")
    return
  	}

	if err:=bcrypt.CompareHashAndPassword([]byte(author.PasswordHash),[]byte(req.Password));err!=nil{
		writeError(w,http.StatusUnauthorized,"Invalid email or password")
		return
	}

	token,err:=s.issueToken(author.ID.String())
	if err!=nil{
		writeError(w,http.StatusInternalServerError,"login failed")
		return
	}

	writeJSON(w,http.StatusOK,LoginResponse{Token:token,Author:newAuthorResponse(author)})
}

func (s *Server) issueToken(authorID string) (string, error) {
  now := time.Now()
  claims := jwt.RegisteredClaims{
    Subject: authorID,
    IssuedAt: jwt.NewNumericDate(now),
    ExpiresAt: jwt.NewNumericDate(now.Add(24*time.Hour)),
  }
  return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(s.jwtSecret)
}

func (s *Server) handleMe(w http.ResponseWriter, r *http.Request) {
  id, ok := CurrentUserID(r)
  if !ok {
    writeError(w, http.StatusUnauthorized, "unauthorized")
    return
  }
  author, err := s.queries.GetAuthorById(r.Context(), id)
  // handle pgx.ErrNoRows -> 404, else 200 newAuthorResponse(author)
  if err!=nil{
	if errors.Is(err,pgx.ErrNoRows){
		writeError(w,http.StatusNotFound,"author does not exist")
		return
	}
	writeError(w,http.StatusInternalServerError,err.Error())
	return
  }

  writeJSON(w,http.StatusOK,newAuthorResponse(author))
}