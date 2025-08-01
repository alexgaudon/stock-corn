FROM oven/bun:latest

COPY package.json ./
COPY bun.lockb ./
COPY src ./src
COPY db ./db
COPY start.sh ./
COPY tsconfig.json ./

RUN bun install --production
CMD [ "./start.sh" ]
