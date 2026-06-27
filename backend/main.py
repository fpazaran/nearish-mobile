from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth as auth_router
from routers import home as home_router
from routers import visits as visits_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(home_router.router)
app.include_router(visits_router.router)

@app.get("/")
def root():
    return {"message": "Hello World"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)