VERSION=$(shell git log -1 --pretty=%h)

docker-build:
	docker build -t gaslow:${VERSION} .

docker-start:
	docker stop gaslow; docker rm gaslow || true
	docker run --name gaslow --init -p 3000:3000 -v $(shell pwd)/.env:/usr/src/app/.env:ro gaslow:${VERSION}

docker-load-remote:
	docker buildx build --platform=linux/amd64 -t gaslow:${VERSION} -o type=docker,dest=- . | gzip | ssh fun-met-oracle 'docker load'

docker-start-remote: docker-load-remote
	ssh fun-met-oracle 'docker stop gaslow; docker rm gaslow; \
		docker run --name gaslow --init -d -p 3000:3000 \
		-v /home/ubuntu/repos/gaslow/.env:/usr/src/app/.env:ro \
		--restart always \
		--env "VIRTUAL_HOST=gaslow-api.mattianatali.com" \
    	--env "VIRTUAL_PORT=3000" \
    	--env "LETSENCRYPT_HOST=gaslow-api.mattianatali.com" \
		gaslow:${VERSION}'