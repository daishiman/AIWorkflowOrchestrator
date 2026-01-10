#!/bin/bash
# API バージョン間の移行ガイド生成スクリプト

set -e

echo "📝 API 移行ガイド生成スクリプト"
echo ""

# 引数チェック
if [ $# -lt 2 ]; then
  echo "使用方法: generate-migration-guide.sh <旧バージョン> <新バージョン> [出力ファイル]"
  echo "例: generate-migration-guide.sh v1 v2 migration-v1-to-v2.md"
  exit 1
fi

OLD_VERSION=$1
NEW_VERSION=$2
OUTPUT_FILE=${3:-"migration-${OLD_VERSION}-to-${NEW_VERSION}.md"}

echo "🔄 ${OLD_VERSION} → ${NEW_VERSION} への移行ガイドを生成します"
echo "📄 出力ファイル: ${OUTPUT_FILE}"
echo ""

# テンプレートから移行ガイドを生成
cat > "$OUTPUT_FILE" << EOF
# API 移行ガイド: ${OLD_VERSION} → ${NEW_VERSION}

**最終更新:** $(date '+%Y年%m月%d日')

---

## 📋 概要

本ガイドは、API ${OLD_VERSION} から ${NEW_VERSION} への移行手順を説明します。

### 🎯 移行の目的

- [移行の理由を記述]
- [新機能の説明]
- [廃止される機能]

### ⏰ タイムライン

| フェーズ | 期間 | 内容 |
|---------|------|------|
| **告知期間** | $(date -v+2w '+%Y年%m月%d日') まで | ${NEW_VERSION} リリースアナウンス |
| **移行期間** | $(date -v+6w '+%Y年%m月%d日') まで | ${OLD_VERSION} と ${NEW_VERSION} 併用可能 |
| **完全移行** | $(date -v+12w '+%Y年%m月%d日') | ${OLD_VERSION} の完全廃止 |

---

## 🚨 破壊的変更

### 1. [変更項目1]

**影響:**
- [どのエンドポイントが影響を受けるか]
- [既存のクライアントへの影響]

**${OLD_VERSION}:**
\`\`\`http
GET /api/${OLD_VERSION}/users?page=1
\`\`\`

**${NEW_VERSION}:**
\`\`\`http
GET /api/${NEW_VERSION}/users?cursor=abc123
\`\`\`

**移行手順:**
1. [ステップ1]
2. [ステップ2]
3. [ステップ3]

---

### 2. [変更項目2]

[同様の形式で記述]

---

## ✨ 新機能

### 1. [新機能1]

**説明:** [機能の説明]

**使用例:**
\`\`\`bash
curl -X GET "https://api.example.com/api/${NEW_VERSION}/new-endpoint" \\
  -H "Authorization: Bearer YOUR_TOKEN"
\`\`\`

**レスポンス:**
\`\`\`json
{
  "data": [],
  "meta": {}
}
\`\`\`

---

## 📊 フィールドマッピング

| ${OLD_VERSION} | ${NEW_VERSION} | 変更内容 |
|----------------|----------------|---------|
| \`first_name\` | \`firstName\` | camelCase に変更 |
| \`last_name\` | \`lastName\` | camelCase に変更 |
| \`created_at\` | \`createdAt\` | camelCase に変更 |
| \`user_type\` | \`role\` | フィールド名変更 |

---

## 🔧 コード移行例

### JavaScript/TypeScript

**${OLD_VERSION}:**
\`\`\`typescript
// ${OLD_VERSION} の実装
const response = await fetch('/api/${OLD_VERSION}/users?page=1');
const data = await response.json();

const user = {
  id: data.id,
  name: data.first_name + ' ' + data.last_name,
  created: data.created_at
};
\`\`\`

**${NEW_VERSION}:**
\`\`\`typescript
// ${NEW_VERSION} の実装
const response = await fetch('/api/${NEW_VERSION}/users?cursor=abc');
const data = await response.json();

const user = {
  id: data.id,
  name: data.fullName, // 統合済み
  created: data.createdAt // camelCase
};
\`\`\`

### Python

**${OLD_VERSION}:**
\`\`\`python
# ${OLD_VERSION} の実装
response = requests.get('/api/${OLD_VERSION}/users?page=1')
data = response.json()

user = {
    'id': data['id'],
    'name': f"{data['first_name']} {data['last_name']}",
    'created': data['created_at']
}
\`\`\`

**${NEW_VERSION}:**
\`\`\`python
# ${NEW_VERSION} の実装
response = requests.get('/api/${NEW_VERSION}/users?cursor=abc')
data = response.json()

user = {
    'id': data['id'],
    'name': data['fullName'],  # 統合済み
    'created': data['createdAt']  # camelCase
}
\`\`\`

---

## ⚠️ 非推奨機能

以下の機能は ${NEW_VERSION} で非推奨となり、将来的に削除されます：

| 機能 | 非推奨日 | 削除予定日 | 代替機能 |
|-----|---------|----------|---------|
| \`GET /users?page=N\` | $(date '+%Y-%m-%d') | $(date -v+12w '+%Y-%m-%d') | \`GET /users?cursor=XXX\` |

---

## 🧪 テスト計画

### 1. 互換性テスト

\`\`\`bash
# ${OLD_VERSION} エンドポイントの動作確認
curl -X GET "https://api.example.com/api/${OLD_VERSION}/users"

# ${NEW_VERSION} エンドポイントの動作確認
curl -X GET "https://api.example.com/api/${NEW_VERSION}/users"
\`\`\`

### 2. 負荷テスト

[負荷テストの手順を記述]

### 3. ロールバック手順

[問題発生時のロールバック手順を記述]

---

## 📞 サポート

### 質問・問題報告

- **Email:** api-support@example.com
- **Slack:** #api-migration
- **Issue Tracker:** https://github.com/example/api/issues

### 移行サポート期間

$(date '+%Y年%m月%d日') 〜 $(date -v+12w '+%Y年%m月%d日')

---

## 📚 参考資料

- [API ドキュメント ${NEW_VERSION}](https://docs.example.com/api/${NEW_VERSION})
- [CHANGELOG](./CHANGELOG.md)
- [Breaking Changes 詳細](./BREAKING_CHANGES.md)

---

**生成日:** $(date '+%Y年%m月%d日 %H:%M:%S')
**生成コマンド:** \`generate-migration-guide.sh ${OLD_VERSION} ${NEW_VERSION}\`
EOF

echo "✅ 移行ガイドを生成しました: ${OUTPUT_FILE}"
echo ""
echo "次のステップ:"
echo "1. ${OUTPUT_FILE} を編集して具体的な変更内容を記入"
echo "2. コード例を実際のAPIに合わせて更新"
echo "3. タイムラインを調整"
echo "4. レビュー後に公開"
