---
description: |
  依存パッケージの管理・更新・セキュリティ監査。
  セマンティックバージョニング、脆弱性検出、段階的アップグレードを実施します。

  🤖 起動エージェント:
  - `.claude/agents/dep-mgr.md`: 依存パッケージ管理専門エージェント

  📚 利用可能スキル（dep-mgrエージェントが必要時に参照）:
  **常時活用:** semantic-versioning, dependency-auditing
  **更新時:** upgrade-strategies, lock-file-management
  **モノレポ時:** monorepo-dependency-management

  ⚙️ このコマンドの設定:
  - argument-hint: 更新戦略（patch/minor/major、オプション）
  - allowed-tools: エージェント起動とパッケージ管理用
    • Task: dep-mgrエージェント起動
    • Bash(pnpm*|pnpm*): パッケージマネージャー操作
    • Read: package.json、pnpm-lock.yaml
    • Edit: package.json更新
  - model: sonnet（依存管理タスク）

  トリガーキーワード: dependencies, package, update, security, audit, vulnerability
argument-hint: "[--upgrade-strategy]"
allowed-tools:
  - Task
  - Bash(pnpm*)
  - Read
  - Edit
model: sonnet
---

# 依存パッケージ管理コマンド

あなたは `/ai:manage-dependencies` コマンドを実行します。

## 目的

依存パッケージのセキュリティ監査、更新戦略の決定、段階的アップグレードを実施し、
プロジェクトの依存関係を健全かつ最新の状態に保ちます。

## 実行フロー

### Phase 1: エージェント起動準備

**ユーザー引数の処理:**
- `$1` (--upgrade-strategy): 更新戦略（オプション）
  - `patch`: パッチバージョンのみ（デフォルト、バグ修正のみ）
  - `minor`: マイナーバージョンまで（新機能含む、後方互換）
  - `major`: メジャーバージョンまで（破壊的変更含む）

**コンテキスト収集:**
```bash
# セキュリティ監査
pnpm audit --json

# 過時パッケージ確認
pnpm outdated

# プロジェクト情報
cat package.json | grep -E '"name"|"version"|"dependencies"'
```

### Phase 2: dep-mgr エージェント起動

```typescript
`.claude/agents/dep-mgr.md` を起動し、以下を依頼:

**タスク**: 依存パッケージの監査と更新計画
**フォーカス**: dependency-auditing, semantic-versioning, upgrade-strategies

**入力情報**:
- 更新戦略: $UPGRADE_STRATEGY（patch/minor/major）
- セキュリティ監査結果: pnpm audit --json
- 過時パッケージ: pnpm outdated
- package.json: 現在の依存関係

**期待成果物**:
1. **セキュリティレポート** (`docs/security/dependency-audit.md`):
   - 脆弱性リスト（CVSS評価含む）
   - Critical: 即時対応必須（24時間以内）
   - High: 優先対応（1週間以内）
   - Medium/Low: 計画的対応

2. **更新計画** (`docs/maintenance/upgrade-plan.md`):
   - 更新対象パッケージリスト
   - バージョン変更サマリー
   - 破壊的変更の影響評価
   - ロールバック手順

3. **package.json更新**:
   - セキュリティ修正は即座に適用
   - その他は計画に基づいて段階的に実施

**実装要件**:
- セマンティックバージョニング厳格遵守
- pnpm 9.x優先使用
- pnpm-lock.yaml整合性維持
- 更新後のテスト実行必須
```

### Phase 3: 更新実行と検証

エージェントの更新計画に基づき、以下を実行:

```bash
# セキュリティ修正適用（Critical/High）
pnpm update <critical-packages>

# テスト実行
pnpm test

# 型チェック
pnpm typecheck

# ビルド確認
pnpm build
```

### Phase 4: 完了報告

エージェントからの成果物とテスト結果を統合し、ユーザーに以下を報告:
- ✅ セキュリティ監査結果
  - Critical: X件（対応済み/未対応）
  - High: X件（対応済み/未対応）
  - Medium/Low: X件

- 📊 更新サマリー
  - 更新されたパッケージ数: X件
  - セキュリティ修正: X件
  - 機能追加: X件
  - メジャーバージョンアップ: X件

- 🧪 検証結果
  - テスト: Pass/Fail
  - 型チェック: Pass/Fail
  - ビルド: Pass/Fail

- 💡 推奨される次のステップ
  - 破壊的変更への対応（あれば）
  - 計画的な残り更新の実施
  - 定期監査スケジュールの設定

## 注意事項

- このコマンドは依存管理のみを行い、詳細はエージェントに委譲
- pnpm 9.xを優先使用（master_system_design.md 3章準拠）
- Critical脆弱性は即座に対応（24時間以内）
- 更新後は必ずテスト実行
