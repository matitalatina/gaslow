docker-build:
	docker build -t gaslow .

docker-start:
	docker stop gaslow; docker rm gaslow || true
	docker run --name gaslow --init -p 3000:3000 -v $(shell pwd)/.env:/usr/src/app/.env:ro gaslow