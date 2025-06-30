# Node.js dev container for the whole project
FROM node:18

WORKDIR /workspace

RUN npm install -g typescript

# Keep container running for devcontainer
CMD ["sleep", "infinity"]
