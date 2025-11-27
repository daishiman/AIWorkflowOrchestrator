#!/bin/bash
# 認証エンドポイントのテストスクリプト

set -e

echo "🔐 認証エンドポイント テストスクリプト"
echo ""

# 引数チェック
if [ $# -lt 2 ]; then
  echo "使用方法: test-auth-endpoint.sh <フロータイプ> <ベースURL> [クライアントID] [クライアントシークレット]"
  echo ""
  echo "フロータイプ:"
  echo "  - token          : トークンエンドポイントのテスト"
  echo "  - introspect     : トークン検証エンドポイントのテスト"
  echo "  - revoke         : トークン無効化エンドポイントのテスト"
  echo "  - userinfo       : ユーザー情報エンドポイントのテスト"
  echo ""
  echo "例: test-auth-endpoint.sh token https://auth.example.com CLIENT_ID CLIENT_SECRET"
  exit 1
fi

FLOW_TYPE=$1
BASE_URL=$2
CLIENT_ID=${3:-"test-client"}
CLIENT_SECRET=${4:-"test-secret"}

echo "📍 ベースURL: ${BASE_URL}"
echo "🔑 クライアントID: ${CLIENT_ID}"
echo ""

case $FLOW_TYPE in
  "token")
    echo "🧪 トークンエンドポイントをテスト中..."
    echo ""
    echo "1️⃣  Client Credentials フロー"
    echo ""

    RESPONSE=$(curl -s -X POST "${BASE_URL}/token" \
      -H "Content-Type: application/x-www-form-urlencoded" \
      -d "grant_type=client_credentials" \
      -d "client_id=${CLIENT_ID}" \
      -d "client_secret=${CLIENT_SECRET}" \
      -d "scope=read")

    echo "レスポンス:"
    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
    echo ""

    # アクセストークンの抽出
    ACCESS_TOKEN=$(echo "$RESPONSE" | jq -r '.access_token' 2>/dev/null)

    if [ "$ACCESS_TOKEN" != "null" ] && [ -n "$ACCESS_TOKEN" ]; then
      echo "✅ トークン取得成功"
      echo "🔑 Access Token: ${ACCESS_TOKEN:0:50}..."
      echo ""

      # JWT の場合はデコード
      if [[ "$ACCESS_TOKEN" =~ ^eyJ ]]; then
        echo "📋 JWT ペイロード:"
        echo "$ACCESS_TOKEN" | awk -F. '{print $2}' | base64 -d 2>/dev/null | jq '.' || echo "デコード失敗"
      fi
    else
      echo "❌ トークン取得失敗"
      exit 1
    fi
    ;;

  "introspect")
    echo "🧪 トークン検証エンドポイントをテスト中..."
    echo ""

    if [ -z "$5" ]; then
      echo "❌ アクセストークンが必要です"
      echo "使用方法: test-auth-endpoint.sh introspect <ベースURL> <クライアントID> <クライアントシークレット> <アクセストークン>"
      exit 1
    fi

    ACCESS_TOKEN=$5

    RESPONSE=$(curl -s -X POST "${BASE_URL}/introspect" \
      -H "Content-Type: application/x-www-form-urlencoded" \
      -u "${CLIENT_ID}:${CLIENT_SECRET}" \
      -d "token=${ACCESS_TOKEN}")

    echo "レスポンス:"
    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
    echo ""

    ACTIVE=$(echo "$RESPONSE" | jq -r '.active' 2>/dev/null)

    if [ "$ACTIVE" = "true" ]; then
      echo "✅ トークンは有効です"
      echo ""
      echo "トークン情報:"
      echo "$RESPONSE" | jq '{active, scope, client_id, exp, iat}' 2>/dev/null
    else
      echo "❌ トークンは無効です"
    fi
    ;;

  "revoke")
    echo "🧪 トークン無効化エンドポイントをテスト中..."
    echo ""

    if [ -z "$5" ]; then
      echo "❌ アクセストークンまたはリフレッシュトークンが必要です"
      echo "使用方法: test-auth-endpoint.sh revoke <ベースURL> <クライアントID> <クライアントシークレット> <トークン>"
      exit 1
    fi

    TOKEN=$5

    RESPONSE=$(curl -s -X POST "${BASE_URL}/revoke" \
      -H "Content-Type: application/x-www-form-urlencoded" \
      -u "${CLIENT_ID}:${CLIENT_SECRET}" \
      -d "token=${TOKEN}")

    echo "レスポンス:"
    echo "$RESPONSE"
    echo ""

    if [ $? -eq 0 ]; then
      echo "✅ トークン無効化成功"
    else
      echo "❌ トークン無効化失敗"
      exit 1
    fi
    ;;

  "userinfo")
    echo "🧪 ユーザー情報エンドポイントをテスト中..."
    echo ""

    if [ -z "$5" ]; then
      echo "❌ アクセストークンが必要です"
      echo "使用方法: test-auth-endpoint.sh userinfo <ベースURL> <クライアントID> <クライアントシークレット> <アクセストークン>"
      exit 1
    fi

    ACCESS_TOKEN=$5

    RESPONSE=$(curl -s -X GET "${BASE_URL}/userinfo" \
      -H "Authorization: Bearer ${ACCESS_TOKEN}")

    echo "レスポンス:"
    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
    echo ""

    if echo "$RESPONSE" | jq -e '.sub' >/dev/null 2>&1; then
      echo "✅ ユーザー情報取得成功"
      echo ""
      echo "ユーザー情報:"
      echo "$RESPONSE" | jq '{sub, email, name, preferred_username}' 2>/dev/null
    else
      echo "❌ ユーザー情報取得失敗"
      exit 1
    fi
    ;;

  *)
    echo "❌ 不明なフロータイプ: $FLOW_TYPE"
    echo ""
    echo "有効なフロータイプ:"
    echo "  - token"
    echo "  - introspect"
    echo "  - revoke"
    echo "  - userinfo"
    exit 1
    ;;
esac

echo ""
echo "✨ テスト完了"
