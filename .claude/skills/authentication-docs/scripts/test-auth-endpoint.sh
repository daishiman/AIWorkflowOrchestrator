#!/bin/bash
# 認証エンドポイントの疎通確認スクリプト

set -e

show_help() {
  echo "認証エンドポイント疎通確認"
  echo ""
  echo "Usage: test-auth-endpoint.sh <base-url> <endpoint> [--token <token>]"
  echo ""
  echo "Options:"
  echo "  --token <token>    Bearer token を付与"
  echo "  -h, --help         ヘルプを表示"
  echo ""
  echo "Example:"
  echo "  test-auth-endpoint.sh https://api.example.com /oauth/token"
  echo "  test-auth-endpoint.sh https://api.example.com /me --token ABC"
}

if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
  show_help
  exit 0
fi

if [ $# -lt 2 ]; then
  show_help
  exit 2
fi

BASE_URL=$1
ENDPOINT=$2
TOKEN=""

shift 2
while [ $# -gt 0 ]; do
  case "$1" in
    --token)
      TOKEN=$2
      shift 2
      ;;
    -h|--help)
      show_help
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      show_help
      exit 2
      ;;
  esac
done

URL="${BASE_URL}${ENDPOINT}"

if [ -n "$TOKEN" ]; then
  curl -sS -i -H "Authorization: Bearer ${TOKEN}" "$URL"
else
  curl -sS -i "$URL"
fi
