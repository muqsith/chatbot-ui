import asyncio
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI()

# Enable CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/echo")
async def echo_message(request: Request):
    data = await request.json()
    message = data.get("message", "")
    print("Received message:", message, flush=True)
    print("Processing message...", flush=True)
    # add delay to simulate processing
    await asyncio.sleep(5)
    print("Processing complete", flush=True)
    return JSONResponse(content={"message": message})

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8090)