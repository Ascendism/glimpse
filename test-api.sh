#!/bin/bash
# Simple API smoke test

set -e

echo "=== Glimpse API Smoke Test ==="
echo

BASE_URL="http://localhost:8080"

echo "1. Testing create table..."
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/createTable" || echo '{"error":"failed"}')
echo "Response: $CREATE_RESPONSE"

TABLE_ID=$(echo "$CREATE_RESPONSE" | grep -o '"tableId":"[^"]*"' | cut -d'"' -f4 || echo "")
if [ -z "$TABLE_ID" ]; then
  echo "❌ FAILED: Could not extract tableId"
  exit 1
fi
echo "✅ Created table: $TABLE_ID"
echo

echo "2. Testing join table..."
JOIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/joinTable" \
  -H "Content-Type: application/json" \
  -d "{\"tableId\":\"$TABLE_ID\",\"playerName\":\"TestPlayer\"}" || echo '{"error":"failed"}')
echo "Response: $JOIN_RESPONSE"

PLAYER_ID=$(echo "$JOIN_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4 | head -1 || echo "")
if [ -z "$PLAYER_ID" ]; then
  echo "❌ FAILED: Could not extract playerId"
  exit 1
fi
echo "✅ Joined as player: $PLAYER_ID"
echo

echo "3. Testing fetch game state..."
FETCH_RESPONSE=$(curl -s "$BASE_URL/api/fetchGameState?tableId=$TABLE_ID" || echo '{"error":"failed"}')
echo "Response (truncated): $(echo "$FETCH_RESPONSE" | cut -c1-200)..."

if echo "$FETCH_RESPONSE" | grep -q "players"; then
  echo "✅ Game state fetched successfully"
else
  echo "❌ FAILED: Game state missing players"
  exit 1
fi
echo

echo "4. Testing chat..."
CHAT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/sendChatMessage" \
  -H "Content-Type: application/json" \
  -d "{\"tableId\":\"$TABLE_ID\",\"playerId\":\"$PLAYER_ID\",\"text\":\"Test message\"}" || echo '{"error":"failed"}')
echo "Response: $CHAT_RESPONSE"

if echo "$CHAT_RESPONSE" | grep -q "success"; then
  echo "✅ Chat message sent"
else
  echo "❌ FAILED: Chat message failed"
  exit 1
fi
echo

echo "=== All API tests passed! ✅ ==="
