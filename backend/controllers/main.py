from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from backend.services.correction import auto_correct_text
 
thes = FastAPI()
 

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