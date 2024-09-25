from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # Import CORSMiddleware

from app.routes.demo_routes import router as demo_router
from app.routes.auth_routes import router as auth_router
from app.routes.check_routes import router as check_router
from app.routes.dash_routes import router as dash_router

app = FastAPI()

# Define origins that are allowed to communicate with your backend
origins = [
    "http://localhost:3000",  # Allow your frontend to communicate with your backend
    "http://127.0.0.1:3000",  # If using localhost with a different port
    "http://yourdomain.com",  # Replace with your actual domain if deployed
]

# Add CORS middleware to your application
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allow requests from these origins
    allow_credentials=True,  # Allow cookies to be sent with requests
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Include router for item-related routes
app.include_router(demo_router,prefix="/demo")
app.include_router(auth_router,prefix="/auth")
app.include_router(check_router,prefix="/check")
app.include_router(dash_router,prefix="/dash")



@app.on_event("startup")
async def on_startup():
    """Code to run on server startup."""
    print("Server is running on 0.0.0.0:8000")

@app.on_event("shutdown")
async def on_shutdown():
    """Code to run on server shutdown."""
    print("Server is shutting down...")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
