VERSION=$(shell git log -1 --pretty=%h)

docker-build:
	docker build -t gaslow:${VERSION} .

docker-start: docker-build
	VERSION=$(VERSION) docker compose up -d

docker-load-remote:
	docker buildx build --platform=linux/amd64 -t gaslow:${VERSION} -o type=docker,dest=- . | gzip | ssh fun-met-oracle2 'docker load'

docker-start-remote: docker-load-remote
	ssh fun-met-oracle2 'cd ~/repos/gaslow && VERSION=$(VERSION) docker compose up -d'