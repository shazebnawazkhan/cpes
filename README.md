<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/49766fb4-e310-44ce-b7c2-ec70465623bf

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. (optional) set the API base url for development, e.g.
   `VITE_API_BASE=http://localhost:3000`
   or add the same variable to `.env.local`.
4. Run the frontend and backend (each in its own shell):
   - backend: `python app.py` (listens on port **3000**)
   - frontend: `npm run dev` (Vite server on port **5000**)

The web app will make requests against the API on port 3000 automatically.



create docker image
-----------------------------------------
```bash
#docker build -f Dockerfile -t cpes .
docker build --progress=plain -f Dockerfile.fe -t cpesfe .
```

create intance:
-----------------------------------------
```bash
docker run --name fe -d -it --network=host -v${PWD}:/code front-app
docker run --name fe -d -it --network=host -v${PWD}:/code fe_img


docker run --name cpes-fe -d -it --network=host cpesf
```




