"""
EasyTravel AI Chatbot Microservice
====================================
Conversational AI powered by Google Gemini + OpenWeatherMap.
- Checks real-time weather for any city
- Recommends if it's a good day to travel
- Suggests what to carry, best travel time, etc.

Endpoints:
  POST /chat   — send a message, get a Gemini AI reply
  GET  /health — service health check
"""

import os
import json
import httpx
from datetime import datetime
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

# ─── Configuration ────────────────────────────────────────────────────────────
GEMINI_API_KEY       = os.getenv("GEMINI_API_KEY", "")
OPENWEATHER_API_KEY  = os.getenv("OPENWEATHER_API_KEY", "")

if not GEMINI_API_KEY:
    print("⚠️  WARNING: GEMINI_API_KEY not set.")
if not OPENWEATHER_API_KEY:
    print("⚠️  WARNING: OPENWEATHER_API_KEY not set. Weather features will be limited.")

genai.configure(api_key=GEMINI_API_KEY)

app = FastAPI(
    title="EasyTravel Chatbot Service",
    description="Weather-aware travel advisor + bus booking guide powered by Google Gemini",
    version="3.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Request / Response Models ─────────────────────────────────────────────────
class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: list[Message] = []
    auth_token: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str
    actions: list[dict] = []

# ─── Weather Fetcher ───────────────────────────────────────────────────────────
async def fetch_weather(city: str) -> dict | None:
    """Fetch live weather from OpenWeatherMap for a city."""
    if not OPENWEATHER_API_KEY:
        return None

    async with httpx.AsyncClient(timeout=8.0) as client:
        try:
            # Current weather
            weather_resp = await client.get(
                "https://api.openweathermap.org/data/2.5/weather",
                params={
                    "q": city,
                    "appid": OPENWEATHER_API_KEY,
                    "units": "metric"
                }
            )
            if weather_resp.status_code != 200:
                return None
            w = weather_resp.json()

            # 3-day forecast (next 24 hrs)
            forecast_resp = await client.get(
                "https://api.openweathermap.org/data/2.5/forecast",
                params={
                    "q": city,
                    "appid": OPENWEATHER_API_KEY,
                    "units": "metric",
                    "cnt": 8   # 8 x 3hr = 24 hrs
                }
            )
            forecast_data = []
            if forecast_resp.status_code == 200:
                for item in forecast_resp.json().get("list", []):
                    forecast_data.append({
                        "time": item["dt_txt"],
                        "temp": item["main"]["temp"],
                        "condition": item["weather"][0]["description"],
                        "rain_chance": item.get("pop", 0) * 100
                    })

            return {
                "city": w.get("name", city),
                "country": w["sys"]["country"],
                "temperature": w["main"]["temp"],
                "feels_like": w["main"]["feels_like"],
                "humidity": w["main"]["humidity"],
                "condition": w["weather"][0]["main"],
                "description": w["weather"][0]["description"],
                "wind_speed_kmh": round(w["wind"]["speed"] * 3.6, 1),
                "visibility_km": round(w.get("visibility", 10000) / 1000, 1),
                "sunrise": datetime.fromtimestamp(w["sys"]["sunrise"]).strftime("%I:%M %p"),
                "sunset": datetime.fromtimestamp(w["sys"]["sunset"]).strftime("%I:%M %p"),
                "forecast_24h": forecast_data[:4]  # next 12 hrs
            }
        except Exception:
            return None

def build_weather_context(weather: dict) -> str:
    """Convert weather data into a text block for Gemini's context."""
    cond = weather["condition"].lower()
    desc = weather["description"]
    temp = weather["temperature"]
    feels = weather["feels_like"]
    humidity = weather["humidity"]
    wind = weather["wind_speed_kmh"]
    visibility = weather["visibility_km"]

    # Determine travel rating
    is_rainy = any(k in cond for k in ["rain", "drizzle", "thunderstorm", "snow"])
    is_foggy = "mist" in cond or "fog" in cond or "haze" in cond or visibility < 2
    is_extreme_heat = temp > 40
    is_cold = temp < 10
    is_windy = wind > 50

    if is_rainy and "thunderstorm" in cond:
        travel_rating = "❌ NOT RECOMMENDED — Thunderstorms are dangerous for travel"
        advice = "Heavy thunderstorms make travel risky. Avoid long journeys if possible."
    elif is_rainy:
        travel_rating = "⚠️ TRAVEL WITH CAUTION — Rain expected"
        advice = "It is raining. Roads may be slippery. Carry a raincoat or umbrella and allow extra travel time."
    elif is_foggy:
        travel_rating = "⚠️ TRAVEL WITH CAUTION — Poor visibility"
        advice = "Foggy conditions reduce visibility. Travel during daylight hours only."
    elif is_extreme_heat:
        travel_rating = "⚠️ TRAVEL CAREFULLY — Extreme heat"
        advice = "Very hot weather. Travel early morning or late evening. Carry water and wear light clothing."
    elif is_cold:
        travel_rating = "✅ OKAY TO TRAVEL — Cold weather"
        advice = "Cold conditions. Carry warm clothes, especially for overnight bus journeys."
    elif is_windy:
        travel_rating = "⚠️ TRAVEL WITH CAUTION — Strong winds"
        advice = "Strong winds may affect bus travel. Check for service disruptions."
    else:
        travel_rating = "✅ GREAT DAY TO TRAVEL — Weather is clear"
        advice = "Perfect travel weather! Enjoy your journey."

    forecast_text = ""
    if weather["forecast_24h"]:
        forecast_text = "\nNext 12-hour forecast:\n"
        for f in weather["forecast_24h"]:
            rain_str = f"(Rain chance: {f['rain_chance']:.0f}%)" if f['rain_chance'] > 20 else ""
            forecast_text += f"  • {f['time']} — {f['temp']}°C, {f['condition']} {rain_str}\n"

    return f"""
[LIVE WEATHER DATA — {datetime.now().strftime("%d %b %Y, %I:%M %p")}]
City: {weather['city']}, {weather['country']}
Temperature: {temp}°C (Feels like {feels}°C)
Condition: {desc.capitalize()}
Humidity: {humidity}%
Wind Speed: {wind} km/h
Visibility: {visibility} km
Sunrise: {weather['sunrise']} | Sunset: {weather['sunset']}

Travel Rating: {travel_rating}
Travel Advice: {advice}
{forecast_text}
"""

def extract_city_from_message(message: str) -> Optional[str]:
    """
    Simple heuristic to extract a city name from a user weather query.
    Checks for patterns like 'weather in Mumbai', 'is it raining in Pune', etc.
    """
    lower = message.lower()

    # Known Indian cities to look for directly
    known_cities = [
        "mumbai", "pune", "delhi", "jaipur", "bangalore", "bengaluru",
        "chennai", "hyderabad", "kolkata", "ahmedabad", "surat", "lucknow",
        "nagpur", "bhopal", "patna", "agra", "varanasi", "goa", "kochi",
        "coimbatore", "visakhapatnam", "indore", "chandigarh", "shimla",
        "dehradun", "manali", "leh", "darjeeling", "mysore", "mysuru",
        "amritsar", "jodhpur", "udaipur", "srinagar", "lonavala",
        "mahabaleshwar", "ooty", "munnar", "rishikesh", "haridwar",
        "london", "paris", "dubai", "singapore", "new york", "tokyo",
        "sydney", "bangkok", "kuala lumpur", "amsterdam"
    ]

    for city in known_cities:
        if city in lower:
            # Return with proper case
            return city.title()

    # Try patterns: "weather in X", "raining in X", "temperature in X"
    import re
    patterns = [
        r"(?:weather|temperature|temp|raining|rain|climate|sunny|forecast)\s+(?:in|at|of|for)\s+([A-Za-z\s]+?)(?:\?|$|\.|,)",
        r"(?:in|at)\s+([A-Za-z\s]+?)\s+(?:weather|temperature|temp|raining|rain|travel|safe|good)",
        r"(?:is it|will it|what is the)\s+(?:weather|raining|temperature|temp|rain|sunny)\s+(?:in|at)\s+([A-Za-z\s]+?)(?:\?|$|\.)",
        r"([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:weather|temperature|temp|rain|travel)",
    ]
    for pattern in patterns:
        match = re.search(pattern, message, re.IGNORECASE)
        if match:
            city_candidate = match.group(1).strip()
            if 2 < len(city_candidate) < 30:  # sanity check
                return city_candidate.title()

    return None

def is_weather_query(message: str) -> bool:
    """Detect if user's message is weather or travel-condition related."""
    keywords = [
        "weather", "temperature", "temp", "rain", "raining", "sunny",
        "forecast", "climate", "hot", "cold", "windy", "wind", "humid",
        "storm", "thunderstorm", "fog", "foggy", "drizzle", "travel condition",
        "good day to travel", "safe to travel", "should i travel", "is it safe",
        "carry umbrella", "what to wear", "travel today", "travel tomorrow"
    ]
    lower = message.lower()
    return any(kw in lower for kw in keywords)

# ─── System Prompt ─────────────────────────────────────────────────────────────
SYSTEM_PROMPT = """You are **EasyTravel Assistant** 🚌, a friendly AI travel advisor for the EasyTravel bus booking platform in India.

Your two core functions are:

---

## 🌤️ WEATHER-BASED TRAVEL ADVISOR
When live weather data is provided in the context, use it to:
1. **Confirm the current conditions** — temperature, rain, humidity, wind, visibility
2. **Rate the travel conditions** — Great ✅ / Caution ⚠️ / Not Recommended ❌
3. **Give specific travel advice** based on conditions:
   - 🌧️ Rain → carry raincoat/umbrella, expect delays, check bus schedules
   - ⛈️ Thunderstorm → advise postponing travel
   - ☀️ Very hot → travel early morning/evening, carry water
   - 🌫️ Fog → travel only in daylight, expect delays
   - ❄️ Cold → carry warm clothes especially for overnight buses
4. **Mention next 12-hr forecast** so user can plan departure time
5. **Suggest what to carry** based on exact weather (raincoat, water bottle, sunscreen, warm jacket, etc.)

---

## 🚌 EASYTRAVEL BOOKING GUIDE
Help users understand how to use the EasyTravel platform:

**HOW TO BOOK:**
1. Login / Register on the platform
2. Enter source city, destination city, and travel date → click Search
3. Choose a bus (compare price, type, timing)
4. Select seats from the interactive seat map (green = available)
5. Enter passenger details (name, age, gender)
6. Enter contact info (email, phone)
7. Choose payment method and confirm
8. Get booking confirmation with reference number → view under "My Bookings"

**CANCEL A BOOKING:**
1. Go to "My Bookings"
2. Find the booking → click Cancel
3. Refund goes to original payment method

**POPULAR ROUTES:**
- Mumbai ↔️ Pune (4 hrs | From ₹450)
- Bangalore ↔️ Chennai (7 hrs | From ₹1200)
- Delhi ↔️ Jaipur (6 hrs | From ₹700)
- Hyderabad ↔️ Bangalore (9 hrs | From ₹1300)

---

## 📍 DESTINATION INFO (if asked)
Share tips about Indian travel destinations — places to visit, food, best season, local tips.

---

**RESPONSE STYLE:**
- Warm, friendly, and helpful 😊
- Use emojis naturally (🌧️ ☀️ 🌡️ 🚌 🎫 📍 🍽️)
- Be specific and actionable — not vague
- If weather data is in context, ALWAYS reference it with actual numbers
- Today's date: """ + datetime.now().strftime("%A, %B %d, %Y") + """
"""

# ─── Fallback reply builder (when Gemini quota is exhausted) ──────────────────
def build_fallback_reply(user_message: str, weather_data: dict | None) -> str:
    """Generate a direct helpful reply from weather data when Gemini is unavailable."""
    if weather_data:
        cond = weather_data["condition"].lower()
        temp = weather_data["temperature"]
        desc = weather_data["description"]
        humidity = weather_data["humidity"]
        wind = weather_data["wind_speed_kmh"]
        city = weather_data["city"]

        is_rainy = any(k in cond for k in ["rain", "drizzle", "thunderstorm", "snow"])
        is_foggy = any(k in cond for k in ["mist", "fog", "haze"])
        is_extreme_heat = temp > 40
        is_cold = temp < 10
        is_windy = wind > 50

        if "thunderstorm" in cond:
            rating = "❌ NOT RECOMMENDED to travel"
            tips = "⛈️ There are active thunderstorms in {city}. Please avoid long-distance bus travel today — it's dangerous!"
            carry = "If you must travel: wear a waterproof jacket, carry an emergency kit."
        elif is_rainy:
            rating = "⚠️ TRAVEL WITH CAUTION"
            tips = f"🌧️ It is raining in {city} right now ({desc}). Roads may be wet and slippery."
            carry = "**What to carry:** ☂️ Umbrella, 🧥 Raincoat, 👟 Waterproof shoes. Allow extra travel time."
        elif is_foggy:
            rating = "⚠️ TRAVEL WITH CAUTION — Low visibility"
            tips = f"🌫️ Foggy conditions in {city}. Visibility may be reduced on roads."
            carry = "**Tip:** Travel only during daylight. Buses may run late due to fog. Carry a light jacket."
        elif is_extreme_heat:
            rating = "⚠️ TRAVEL CAREFULLY — Extreme heat"
            tips = f"🌡️ It is very hot in {city} at {temp}°C! Heat can cause exhaustion during travel."
            carry = "**What to carry:** 💧 Water bottle, 🧴 Sunscreen, 🕶️ Sunglasses. Travel early morning or evening."
        elif is_cold:
            rating = "✅ OKAY TO TRAVEL — Cold weather"
            tips = f"🥶 It's cold in {city} at {temp}°C. Bundle up for overnight bus journeys."
            carry = "**What to carry:** 🧥 Warm jacket, 🧣 Muffler, ☕ Hot beverage flask."
        elif is_windy:
            rating = "⚠️ TRAVEL WITH CAUTION — Strong winds"
            tips = f"💨 Strong winds ({wind} km/h) in {city}. Check for bus delays."
            carry = "**Tip:** Wear a windbreaker. Hold onto luggage tightly."
        else:
            rating = "✅ GREAT DAY TO TRAVEL!"
            tips = f"☀️ {city} has lovely weather today — {temp}°C and {desc}. Perfect for travel!"
            carry = "**Pack light**, enjoy the journey! 🚌"

        forecast_lines = ""
        if weather_data.get("forecast_24h"):
            forecast_lines = "\n\n**Next 12-hour forecast:**"
            for f in weather_data["forecast_24h"]:
                rain_tag = f" 🌧️ ({f['rain_chance']:.0f}% rain)" if f['rain_chance'] > 25 else ""
                forecast_lines += f"\n• {f['time']} — {f['temp']}°C, {f['condition']}{rain_tag}"

        return f"""**🌤️ Live Weather Report — {city}**

🌡️ Temperature: **{temp}°C** (Feels like {weather_data['feels_like']}°C)
☁️ Condition: **{desc.capitalize()}**
💧 Humidity: **{humidity}%** | 🌬️ Wind: **{wind} km/h**
🌅 Sunrise: {weather_data['sunrise']} | 🌇 Sunset: {weather_data['sunset']}

**Travel Rating: {rating}**
{tips}

{carry}{forecast_lines}

---
*To book a bus ticket on EasyTravel, go to the Search section and enter your route!* 🚌"""

    # Generic fallback for non-weather queries
    msg_lower = user_message.lower()
    if any(k in msg_lower for k in ["book", "ticket", "how to"]):
        return """**How to book a bus ticket on EasyTravel 🎫**

1. 🔍 **Search** — Enter From city, To city, and Date
2. 🚌 **Choose a bus** — Pick based on price, timing, and bus type
3. 💺 **Select seat** — Green seats are available
4. 👤 **Passenger details** — Name, Age, Gender
5. 📧 **Contact info** — Email and Phone
6. 💳 **Payment** — Complete payment to confirm
7. ✅ **Done!** — Check "My Bookings" for your ticket

Need more help? Ask me! 😊"""

    if any(k in msg_lower for k in ["cancel", "refund"]):
        return """**How to cancel a booking on EasyTravel ❌**

1. Go to **"My Bookings"** from the top navigation
2. Find the booking you want to cancel
3. Click the **"Cancel"** button
4. Refund is processed to your original payment method

For help, contact EasyTravel support. 🙏"""

    return """Hi! 👋 I'm **EasyTravel Assistant**!

I can help you with:
🌤️ **Weather checks** — Ask *"Is it raining in Mumbai?"*
🚌 **Booking guide** — Ask *"How do I book a ticket?"*
❌ **Cancellation** — Ask *"How do I cancel my booking?"*
📍 **Travel tips** — Ask about any Indian city

*(Note: AI service is temporarily limited. Weather queries still work fully!)* 🌤️"""


# ─── Chat Endpoint ─────────────────────────────────────────────────────────────
@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        user_message = request.message
        extra_context = ""
        weather_data = None

        # ── Step 1: Fetch weather if it's a weather query ────────────────────
        if is_weather_query(user_message):
            city = extract_city_from_message(user_message)
            if city:
                weather_data = await fetch_weather(city)
                if weather_data:
                    extra_context = build_weather_context(weather_data)
                elif OPENWEATHER_API_KEY:
                    extra_context = f"\n[Weather lookup for '{city}' failed.]\n"
                else:
                    extra_context = "\n[OPENWEATHER_API_KEY not configured.]\n"

        # ── Build weather action card ─────────────────────────────────────────
        actions = []
        if weather_data:
            actions.append({
                "type": "weather_card",
                "city": weather_data["city"],
                "temperature": f"{weather_data['temperature']}°C",
                "condition": weather_data["description"],
                "humidity": f"{weather_data['humidity']}%",
                "wind": f"{weather_data['wind_speed_kmh']} km/h"
            })

        # ── Step 2: Try Gemini if configured ─────────────────────────────────
        if GEMINI_API_KEY:
            try:
                history = []
                for msg in request.history:
                    role = "user" if msg.role == "user" else "model"
                    history.append({"role": role, "parts": [msg.content]})

                final_message = user_message
                if extra_context:
                    final_message = f"{extra_context}\n\nUser's question: {user_message}"

                model = genai.GenerativeModel(
                    model_name="gemini-2.0-flash",
                    system_instruction=SYSTEM_PROMPT,
                )
                chat_session = model.start_chat(history=history)
                response = chat_session.send_message(final_message)

                reply = ""
                for part in response.candidates[0].content.parts:
                    if hasattr(part, "text") and part.text:
                        reply += part.text

                if reply:
                    return ChatResponse(reply=reply, actions=actions)

            except Exception as gemini_err:
                err_str = str(gemini_err)
                # If it's a quota error, fall through to direct fallback
                if "429" in err_str or "quota" in err_str.lower() or "RESOURCE_EXHAUSTED" in err_str:
                    print(f"⚠️ Gemini quota exceeded, using fallback reply.")
                else:
                    # For other Gemini errors, still fall back
                    print(f"⚠️ Gemini error: {gemini_err}")

        # ── Step 3: Direct fallback reply (no Gemini needed) ─────────────────
        reply = build_fallback_reply(user_message, weather_data)
        return ChatResponse(reply=reply, actions=actions)

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))



# ─── Health Check ──────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "EasyTravel Chatbot",
        "model": "gemini-2.0-flash",
        "gemini_configured": bool(GEMINI_API_KEY),
        "weather_configured": bool(OPENWEATHER_API_KEY),
        "timestamp": datetime.now().isoformat()
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8085, reload=True)
