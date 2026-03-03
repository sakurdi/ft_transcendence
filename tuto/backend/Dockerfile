FROM golang:1.24-alpine

WORKDIR /backend

COPY go.mod ./
RUN go mod download

COPY . .

RUN go mod tidy

CMD ["go", "run", "./cmd/main.go"]
