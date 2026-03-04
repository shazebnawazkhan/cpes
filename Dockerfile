# Build Stage
FROM node:20-slim AS build
WORKDIR /app
COPY ./package*.json /app/
COPY ./tsconfig.json /app/
RUN npm install
COPY . .
RUN npm run build

# Production Stage
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
#COPY --from=build /app/dist ./dist
COPY ./app.py ./
COPY ./questions.json ./
EXPOSE 3000
CMD ["python", "app.py"]
