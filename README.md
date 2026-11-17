# AIQuiz



https://github.com/user-attachments/assets/eb8e601e-a7f7-4b3e-b1ef-d50103a9d144


## Requirements

- Node 24 (minimum Node 20) and MongoDB 5, or Docker with Docker Compose.
- API keys for the LLM providers you want to use (OpenAI, Google Vertex AI…).

## Configuration

Three files, created from their templates (none of them is committed to git):

| File | Template | What goes there |
|---|---|---|
| `next.config.js` | `next.config.js.template` | `MONGODB_URI`: the database. This is the only place where it is configured. |
| `models.json` | `models.json.example` | LLM models and their API keys / Vertex AI credentials. |
| `.env` | `.env.template` | `BASE_PATH`, `JWT_SECRET` and the users created by `npm run seed:admin`. |

```bash
cp next.config.js.template next.config.js
cp models.json.example models.json
cp .env.template .env
```

- **`BASE_PATH`**: prefix the app is served under (default `/aiquiz`). It must match the `location` of the reverse proxy. It is fixed when the app is built, so after changing it you have to build again.
- **`JWT_SECRET`**: required, without it nobody can log in to the manager. Use a long random value, for example `openssl rand -hex 32`.
- **`MONGODB_URI`** (in `next.config.js`): the values of the `env` block of `next.config.js` are fixed at build time. Setting them in the `environment` of `docker-compose.yml` or in the `.env` has no effect on the app.
- In the `.env`, put values containing `#` between single quotes (`'abc#123'`): an unquoted `#` starts a comment.

## Deploy with Docker

1. **Configuration.** Create the three files (see above). In `next.config.js`, the database host is the name of the Mongo service: `mongodb://aiquiz-mongo:27017/aiquiz3`.
2. **Network.** `docker-compose.yml` uses an external network called `martell`, shared with the reverse proxy. Create it if it doesn't exist:

   ```bash
   docker network create martell
   ```

3. **Build and start.** Docker Compose reads the `.env` next to `docker-compose.yml`: it passes `BASE_PATH` to the build and `JWT_SECRET` to the container.

   ```bash
   docker compose up -d --build
   ```

4. **Create the admin user** (only the first time):

   ```bash
   docker compose exec -it aiquiz-web npm run seed:admin
   ```

   The `.env` is copied into the image when it is built, so the script reads it inside the container. If you edit the `.env` after building, rebuild, or copy it in first with `docker compose cp .env aiquiz-web:/app/.env`.

5. **Reverse proxy.** Point a `location` with the same prefix as `BASE_PATH` to the container (nginx example for `BASE_PATH=/aiquiz`):

   ```nginx
   location /aiquiz {
       proxy_pass http://aiquiz-web:3000/aiquiz;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
       proxy_read_timeout 180s;
   }
   ```

   Generating questions can take more than a minute: keep `proxy_read_timeout` high.

**Update** to a new version (only the app container is rebuilt; the databases are not touched):

```bash
git pull
docker compose up -d --build --no-deps aiquiz-web
```

**Logs:** `docker compose logs -f aiquiz-web`

### Several instances on the same server

To run a second instance (for example `/aiquiz-2`) next to an existing one, everything must have its own name, or one instance replaces the containers and data of the other:

- Its own directory, and its own project name: `COMPOSE_PROJECT_NAME=aiquiz-2` in its `.env` (or `docker compose -p aiquiz-2 …`).
- In its `docker-compose.yml`: different `container_name`s (`aiquiz-web-2`, `aiquiz-mongo-2`, `aiquiz-qdrant-2`), volume names (`mongo_data-2`…) and published ports.
- In its `next.config.js`: `MONGODB_URI=mongodb://aiquiz-mongo-2:27017/aiquiz3`.
- In its `.env`: `BASE_PATH=/aiquiz-2`, and a `location /aiquiz-2` in the proxy pointing to `aiquiz-web-2`.

## Deploy without Docker

1. **Configuration.** Create the three files (see above). In `next.config.js`, point `MONGODB_URI` to your MongoDB, for example `mongodb://localhost:27017/aiquiz3`.
2. **Install, build and start:**

   ```bash
   npm ci
   npm run build
   NODE_ENV=production npm start
   ```

   `npm run build` and `npm start` read the `.env` themselves (`BASE_PATH`, `JWT_SECRET`). Without `NODE_ENV=production`, `npm start` runs the development server. The app listens on port 3000; to change it, set it in the command, not in the `.env`: `PORT_SERVER=3001 NODE_ENV=production npm start`. To keep it running in the background: `NODE_ENV=production npm run forever:start`.

3. **Create the admin user** (only the first time):

   ```bash
   npm run seed:admin
   ```

4. **Reverse proxy:** same as with Docker, with `proxy_pass http://localhost:3000/aiquiz;`.

**Update:** `git pull`, `npm ci`, `npm run build` and restart the app.

## Admin user

`npm run seed:admin` creates the super admin (role `admin`) from the `SUPER_ADMIN_*` variables of the `.env` and, if `DEFAULT_PROFESSOR_EMAIL` is set, a professor from the `DEFAULT_PROFESSOR_*` variables. Then it asks whether you want to add more professors. It uses the database of `next.config.js` (it prints it when it starts), and users that already exist are not modified.

## Development

```bash
npm ci
npm run dev
```

Open [http://localhost:3000/aiquiz](http://localhost:3000/aiquiz) (or the `BASE_PATH` of your `.env`).

In the code, never write `/aiquiz` by hand: use `withBasePath()` / `BASE_PATH` from `app/utils/basePath.js` for `fetch`, `<a href>` and URLs sent to the browser. `<Link>` and `router.push` already add it.
