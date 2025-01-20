from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from backend.services.correction import auto_correct_text
from fastapi.middleware.cors import CORSMiddleware
 
thes = FastAPI()
 
thes.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8082"],  # Replace with the React app's URL
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

@thes.get("/")
def health_check():
    return {"status": "Server is up and running"}
 
@thes.websocket("/ws/thesis")
async def websocket_endpoint(websocket: WebSocket):
    print("Client connecting")
    await websocket.accept()
    print("Connection accepted")
    try:
        while True:
            
            data = await websocket.receive_text()
            print(f"Received data: {data}")
            corrected_chunks = auto_correct_text(data)
            print(f"Corrected chunks: {corrected_chunks}")
            await websocket.send_json(corrected_chunks)
 
    except WebSocketDisconnect:
        print("Client disconnected")


