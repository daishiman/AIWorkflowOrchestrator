---
description: |
  APIエンドポイントにレート制限を実装し、 DoS攻撃やブルートフォース攻撃を防御します。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/sec-auditor.md`: セキュリティ対策設計
  - `.claude/agents/gateway-dev.md`: APIゲートウェイ実装

  ⚙️ このコマンドの設定:
  - argument-hint: [rate-limit]
  - allowed-tools: Task（エージェント起動のみ）
  - model: sonnet

  トリガーキーワード: rate limiting, レート制限, throttling, DoS対策, API制限
argument-hint: "[rate-limit]"
allowed-tools:
  - Task
model: sonnet
---

# .claude/commands/ai/setup-rate-limiting.md - レート制限の実装

## 目的

`.claude/commands/ai/setup-rate-limiting.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: セキュリティ対策設計の実行

**目的**: セキュリティ対策設計に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: セキュリティ対策設計の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/sec-auditor.md`

Task ツールで `.claude/agents/sec-auditor.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[rate-limit]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `src/middleware/rate-limit.ts`
- `src/middleware/rate-limit.middleware.ts`
- `src/plugins/rate-limit.plugin.ts`
- `src/config/rate-limit.config.ts`
- `docs/security/rate-limiting-setup.md`
- `docs/security/rate-limiting-operations.md`
- `scripts/test-rate-limit.sh`
- `docs/security/`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

### Phase 2: APIゲートウェイ実装の実行

**目的**: APIゲートウェイ実装に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: APIゲートウェイ実装の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/gateway-dev.md`

Task ツールで `.claude/agents/gateway-dev.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[rate-limit]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `src/middleware/rate-limit.ts`
- `src/middleware/rate-limit.middleware.ts`
- `src/plugins/rate-limit.plugin.ts`
- `src/config/rate-limit.config.ts`
- `docs/security/rate-limiting-setup.md`
- `docs/security/rate-limiting-operations.md`
- `scripts/test-rate-limit.sh`
- `docs/security/`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:setup-rate-limiting [rate-limit]
```
