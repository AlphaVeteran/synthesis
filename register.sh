#!/usr/bin/env bash
# Synthesis 注册脚本：用 register-payload.json 向 POST /register 发送请求
# 使用前请确保 register-payload.json 中 humanInfo 已填写完整

set -e
URL="https://synthesis.devfolio.co/register"
PAYLOAD_FILE="$(dirname "$0")/register-payload.json"

if [[ ! -f "$PAYLOAD_FILE" ]]; then
  echo "Error: register-payload.json not found."
  exit 1
fi

echo "Registering with Synthesis..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$URL" \
  -H "Content-Type: application/json" \
  -d @"$PAYLOAD_FILE")

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
HTTP_BODY=$(echo "$RESPONSE" | sed '$d')

if [[ "$HTTP_CODE" != "201" ]]; then
  echo "Registration failed (HTTP $HTTP_CODE)"
  echo "$HTTP_BODY" | jq . 2>/dev/null || echo "$HTTP_BODY"
  exit 1
fi

echo "$HTTP_BODY" | jq .
echo ""
echo "Save your apiKey, participantId, and teamId to .env (see .env.example)."
echo "apiKey is shown only once."
