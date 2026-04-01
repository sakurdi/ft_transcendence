FROM owasp/modsecurity-crs:nginx-alpine

USER root
RUN mkdir -p /docker-entrypoint.d /var/cache/nginx /var/run/nginx && \
    chown -R nginx:nginx /var/cache/nginx /var/run /etc/nginx

COPY nginx.conf /etc/nginx/nginx.conf
COPY init.sh /docker-entrypoint.d/init.sh

RUN chmod +x /docker-entrypoint.d/init.sh && \
    chown nginx:nginx /docker-entrypoint.d/init.sh

ENV MODSEC_RULE_ENGINE=On
ENV MODSEC_REQ_BODY_ACCESS=On
ENV MODSEC_RESP_BODY_ACCESS=On

USER nginx 
ENTRYPOINT ["/bin/sh", "-c", "/docker-entrypoint.d/init.sh && nginx -g 'daemon off;'"]