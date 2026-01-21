FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf
COPY init.sh /docker-entrypoint.d/init.sh
RUN chmod +x ./docker-entrypoint.d/init.sh
