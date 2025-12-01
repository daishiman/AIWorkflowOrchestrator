---
description: |
  外部API統合ゲートウェイの実装（Discord、Slack、OpenAI等）。

  認証、リトライ、レート制限、腐敗防止層（Anti-Corruption Layer）を含む
  Clean Architectureに準拠したAPIクライアントを作成します。

  🤖 起動エージェント:
  - `.claude/agents/gateway-dev.md`: 外部連携ゲートウェイ開発専門エージェント（Phase 2で起動）

  📚 利用可能スキル（タスクに応じてgateway-devエージェントが必要時に参照）:
  **Phase 2（設計時）:** `.claude/skills/api-client-patterns/SKILL.md`
  **Phase 3（実装時）:** `.claude/skills/http-best-practices/SKILL.md`, `.claude/skills/authentication-flows/SKILL.md`
  **Phase 4（信頼性時）:** `.claude/skills/retry-strategies/SKILL.md`, `.claude/skills/rate-limiting/SKILL.md`

  ⚙️ このコマンドの設定:
  - argument-hint: 必須引数1つ（API名: discord, slack, openai等）
  - allowed-tools: エージェント起動と実装・テスト用
    • Read: プロジェクト設計書・既存コード確認用
    • Write: APIクライアント・変換層・テスト生成用
    • Grep: 既存パターン検索用
    • Bash: テスト実行・型チェック用
  - model: opus（複雑なアーキテクチャ設計・セキュリティ設計が必要）

  トリガーキーワード: api, gateway, integration, 外部連携, Discord, Slack, OpenAI
argument-hint: "[api-name] (例: discord, slack, openai, stripe)"
model: opus
allowed-tools:
  - Read
  - Write
  - Grep
  - Bash
---

# 外部API統合ゲートウェイ実装

あなたは **gateway-dev エージェント** (`.claude/agents/gateway-dev.md`) を起動し、外部API統合ゲートウェイを実装します。

## エージェント起動 3フェーズ

### Phase 1: 準備（エージェント起動前）

**引数検証**:
```bash
API_NAME="$1"

if [ -z "$API_NAME" ]; then
  echo "❌ Error: API名が指定されていません"
  echo "Usage: /ai:create-api-gateway [api-name]"
  echo "Example: /ai:create-api-gateway discord"
  exit 1
fi
```

**プロジェクト設計書確認**:
- `docs/00-requirements/master_system_design.md`: ハイブリッドアーキテクチャ、Clean Architecture制約確認

---

### Phase 2: エージェント起動

**gateway-dev エージェント起動**:

```
.claude/agents/gateway-dev.md

以下のAPI統合ゲートウェイを実装してください。

## 実装対象
- API名: $API_NAME

## 成果物要件
1. **APIクライアント実装** (`src/shared/infrastructure/$API_NAME/client.ts`)
   - 認証フロー実装
   - リトライ戦略（指数バックオフ）
   - レート制限対応
   - サーキットブレーカーパターン
   - タイムアウト設定

2. **データ変換層** (`src/shared/infrastructure/$API_NAME/transformer.ts`)
   - 腐敗防止層（Anti-Corruption Layer）
   - 外部API型 → ドメインモデル変換
   - ドメインモデル → 外部API型変換

3. **テスト** (`src/shared/infrastructure/$API_NAME/__tests__/`)
   - クライアントテスト（モック使用）
   - 変換層テスト
   - テストカバレッジ 85%以上

4. **設定ファイル**
   - 環境変数設定例（`.env.example` 更新）
   - 認証情報はハードコード禁止

## プロジェクト制約（master_system_design.md準拠）
- ハイブリッドアーキテクチャ: shared/infrastructure配下に配置
- Clean Architecture: 依存関係は Infrastructure → Core
- 腐敗防止層（Anti-Corruption Layer）必須
- リトライ戦略、サーキットブレーカー、タイムアウト必須実装
- テストカバレッジ85%以上
- 認証情報は環境変数で管理（.env禁止、ハードコード禁止）

## スキル参照（フェーズ別）
- Phase 2: `.claude/skills/api-client-patterns/SKILL.md`
- Phase 3: `.claude/skills/http-best-practices/SKILL.md`, `.claude/skills/authentication-flows/SKILL.md`
- Phase 4: `.claude/skills/retry-strategies/SKILL.md`, `.claude/skills/rate-limiting/SKILL.md`

## 実装を開始してください
```

---

### Phase 3: 完了確認

エージェントが以下を完了したことを確認:

**成果物チェックリスト**:
- [ ] `src/shared/infrastructure/$API_NAME/client.ts` 作成
- [ ] `src/shared/infrastructure/$API_NAME/transformer.ts` 作成
- [ ] `src/shared/infrastructure/$API_NAME/__tests__/` テスト作成
- [ ] `.env.example` 環境変数設定例追加
- [ ] テストカバレッジ 85%以上達成
- [ ] Clean Architecture依存関係遵守
- [ ] 腐敗防止層実装完了

**検証コマンド**:
```bash
# テスト実行
pnpm test src/shared/infrastructure/$API_NAME

# カバレッジ確認
pnpm test:coverage src/shared/infrastructure/$API_NAME

# 型チェック
pnpm type-check
```

---

## 使用例

### Discord API統合
```bash
/ai:create-api-gateway discord
```

### Slack API統合
```bash
/ai:create-api-gateway slack
```

### OpenAI API統合
```bash
/ai:create-api-gateway openai
```

### Stripe API統合
```bash
/ai:create-api-gateway stripe
```

---

## 注意事項

- **認証情報管理**: 環境変数で管理し、ハードコード禁止
- **腐敗防止層**: 外部API依存をドメインモデルから隔離
- **エラーハンドリング**: リトライ、タイムアウト、サーキットブレーカー必須
- **テスト**: モックを使用し、外部APIに依存しないテスト設計
- **依存関係**: Infrastructure層 → Core層の一方向依存を遵守
