# EasyTravel AI Chatbot Service 🚌

A Python FastAPI microservice that powers the EasyTravel chatbot using **Google Gemini 2.0 Flash** with real **function calling** to interact with the Spring Boot backend APIs.

## Features

| Capability | Details |
|---|---|
| 🔍 **Search Buses** | Finds schedules between any two cities for a date |
| 💺 **View Seats** | Shows available/booked seats on a specific trip |
| 🎫 **Book Tickets** | Books one or multiple seats with passenger details |
| 📋 **My Bookings** | Retrieves all bookings for the logged-in user |
| ❌ **Cancel Booking** | Cancels a booking by its ID |
| 🗺️ **Available Routes** | Lists all routes in the system |

## Quick Start

### 1. Add your Gemini API Key

Edit the `.env` file in this folder:
```
GEMINI_API_KEY=your_actual_key_here
```
Get a free key at: https://aistudio.google.com/app/apikey

### 2. Start the service

Double-click `start_chatbot.bat` or run:
```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8085 --reload
```

### 3. Use with start_all.bat

The top-level `start_all.bat` will launch this service automatically alongside all other microservices.

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/chat` | POST | Send a message to the chatbot |
| `/health` | GET | Service health check |
| `/docs` | GET | Swagger API docs |

### POST /chat

```json
{
  "message": "Search buses from Mumbai to Pune tomorrow",
  "history": [],
  "auth_token": "your_jwt_token_here"
}
```

Response:
```json
{
  "reply": "Found 3 buses from Mumbai to Pune...",
  "actions": [
    { "tool": "search_buses", "args": {...}, "result": {...} }
  ]
}
```

## How It Works

1. **User sends a message** → FastAPI receives it
2. **Gemini processes with function calling** → decides which backend API to call
3. **Python calls Spring Boot APIs** via httpx (through API Gateway on port 8080)
4. **Results returned to Gemini** → Gemini generates a human-friendly response
5. **Response sent to React frontend** → displayed in the chat widget

## Tech Stack

- **FastAPI** — Python web framework
- **Google Gemini 2.0 Flash** — LLM with function calling
- **httpx** — Async HTTP client for calling Spring APIs
- **uvicorn** — ASGI server

## Port

The chatbot service runs on **port 8085** (separate from the Spring API Gateway on 8080).
