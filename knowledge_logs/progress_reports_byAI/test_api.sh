#!/bin/bash

echo "=== API動作確認テスト ==="
echo

# 一時ファイル
COOKIE_FILE="cookies.txt"
AUTH_TOKEN_FILE="auth_token.txt"
touch $COOKIE_FILE

echo "1. ユーザーログイン"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/users/sign_in \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -c $COOKIE_FILE \
  -d '{"user": {"email": "test@example.com", "password": "password123"}}')

# CSRFトークンとセッショントークンの取得
CSRF_TOKEN=$(cat $COOKIE_FILE | grep csrf | awk '{print $7}')
SESSION_TOKEN=$(cat $COOKIE_FILE | grep session | awk '{print $7}')

echo "認証情報:"
echo "CSRF_TOKEN: $CSRF_TOKEN"
echo "SESSION_TOKEN: $SESSION_TOKEN"

echo -e "\n2. ブックマーク一覧取得"
curl -s -X GET http://localhost:3000/bookmarks \
  -H "Accept: application/json" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -b $COOKIE_FILE

echo -e "\n\n3. ブックマーク作成（Google）"
curl -s -X POST http://localhost:3000/bookmarks \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -b $COOKIE_FILE \
  -d '{
    "bookmark": {
      "url": "https://www.google.com",
      "title": "Google",
      "tag_list": "検索, ウェブ"
    }
  }'

echo -e "\n\n4. ブックマーク作成（GitHub）"
curl -s -X POST http://localhost:3000/bookmarks \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -b $COOKIE_FILE \
  -d '{
    "bookmark": {
      "url": "https://github.com",
      "title": "GitHub",
      "tag_list": "開発, コード"
    }
  }'

echo -e "\n\n5. 一覧の確認"
curl -s -X GET http://localhost:3000/bookmarks \
  -H "Accept: application/json" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -b $COOKIE_FILE

echo -e "\n\n6. ブックマーク更新（ID:1のタイトル変更）"
curl -s -X PATCH http://localhost:3000/bookmarks/1 \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -b $COOKIE_FILE \
  -d '{
    "bookmark": {
      "title": "Google Search",
      "tag_list": "検索エンジン, ウェブ"
    }
  }'

echo -e "\n\n7. ブックマーク削除（ID:1）"
curl -s -X DELETE http://localhost:3000/bookmarks/1 \
  -H "Accept: application/json" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -b $COOKIE_FILE

echo -e "\n\n8. 最終一覧確認"
curl -s -X GET http://localhost:3000/bookmarks \
  -H "Accept: application/json" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -b $COOKIE_FILE

# 一時ファイルの削除
rm $COOKIE_FILE

echo -e "\n\nテスト完了"
