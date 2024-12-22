from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from backend.services.correction import auto_correct_text

thes = FastAPI()

@thes.get("/")
def health_check():
    return "Server is up and running"

@thes.websocket("/ws/thesis")
async def websocket_endpoint(websocket: WebSocket):
    print("Client connecting")
    await websocket.accept()
    print("Connection accepted")
    try:
        while True:
            data = await websocket.receive_text()  
            print(f"Received data: {data}")
            print(type(data))
            corrected_text = auto_correct_text(data)
            print(f"Corrected text: {corrected_text}")
            await websocket.send_text(corrected_text)

    except WebSocketDisconnect:
        print("Client disconnected")
