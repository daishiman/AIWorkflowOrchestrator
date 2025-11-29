---
description: |
  E2Eテストシナリオの自動作成を行う専門コマンド。

  ユーザー視点でのクリティカルパス全体の動作保証を目的とし、Playwrightによる
  ブラウザ自動化テスト、テストデータ管理、フレーキーテスト防止を実現します。
  テストピラミッドの原則に基づき、E2Eテストは少数・高コストとして設計します。

  🤖 起動エージェント:
  - `.claude/agents/e2e-tester.md`: E2Eテスト作成専門エージェント（Playwright自動化）

  📚 利用可能スキル（e2e-testerエージェントが必要時に参照）:
  **Phase 1（テスト要件理解）:** playwright-testing
  **Phase 2（テスト環境セットアップ）:** test-data-management, api-mocking
  **Phase 3（テストコード実装）:** playwright-testing
  **Phase 4（フレーキー防止）:** flaky-test-prevention, visual-regression-testing
  **Phase 5（テスト実行と検証）:** 全スキル統合

  💡 使用パターン:
  - 統合テストフェーズでのクリティカルパスE2Eシナリオ実行
  - デプロイ前の最終動作確認
  - ユーザーフロー変更後の回帰テスト
  - API とフロントエンドの統合動作検証

  ⚙️ このコマンドの設定:
  - argument-hint: ユーザーフロー名（必須）
  - allowed-tools: エージェント起動とE2Eテストファイル作成用
    • Task: e2e-testerエージェント起動用
    • Read: 仕様書、既存テスト確認用
    • Write(tests/**/*.spec.ts): E2Eテストファイル生成用（パス制限）
    • Edit: 既存テスト修正用
    • Bash(pnpm test*|playwright*): テスト実行用
    • Grep: 既存パターン検索用
  - model: sonnet（E2Eテスト設計タスク）

  📊 成果物:
  - `tests/[user-flow-name].spec.ts`（Playwrightテスト）
  - テストデータFixture（`tests/fixtures/`）
  - 安定性保証済みE2Eテストコード（フレーキー防止済み）

  トリガーキーワード: e2e test, integration test, user flow, playwright, E2Eテスト
argument-hint: "[user-flow]"
allowed-tools: [Task, Read, Write(tests/**/*.spec.ts), Edit, Bash(pnpm test*|playwright*), Grep]
model: opus
---

# E2Eテストシナリオ自動作成

## 目的

`.claude/agents/e2e-tester.md` エージェントを起動し、クリティカルパスのE2Eテストシナリオを自動作成します。

## エージェント起動フロー

### Phase 1: 引数検証

```markdown
ユーザーフロー名: "$ARGUMENTS"

引数未指定の場合:
エラー: 「ユーザーフロー名を指定してください」
使用例: `/ai:generate-e2e-tests login-flow`
使用例: `/ai:generate-e2e-tests checkout-process`
```

### Phase 2: e2e-tester エージェント起動

Task ツールで `.claude/agents/e2e-tester.md` を起動:

```markdown
エージェント: .claude/agents/e2e-tester.md
ユーザーフロー: ${ユーザーフロー名}

依頼内容:
- クリティカルパスのE2Eテストシナリオ設計
- Playwrightによるブラウザ自動化テスト実装
- テストデータFixture作成とクリーンアップ戦略
- フレーキーテスト防止（明示的待機、非決定性排除）
- Page Object Model等の抽象化パターン適用

必須要件:
1. Phase 1: テスト要件理解（クリティカルパス特定、シナリオ設計）
2. Phase 2: テスト環境セットアップ（テストデータ、モック設定）
3. Phase 3: テストコード実装（セレクタ戦略、明示的待機）
4. Phase 4: フレーキー防止（非決定性排除、リトライロジック）
5. Phase 5: テスト実行と検証（並列実行、CI/CD統合提案）

テストピラミッド原則:
- E2Eは少数・高コスト・統合テストとして位置づけ
- 詳細なエッジケースはユニットテストに委譲
```

**期待成果物:**
- Playwrightテストファイル（`tests/[user-flow].spec.ts`）
- テストデータFixture（`tests/fixtures/`）
- セレクタ戦略適用済み（data-testid優先）
- フレーキー防止済み（固定時間待機禁止）

### Phase 3: テスト実行と報告

- E2Eテスト実行（`pnpm test:e2e`）
- 結果サマリーとファイルパス報告
- CI/CD統合提案

## 使用例

### 基本的な使用

```bash
/ai:generate-e2e-tests login-flow
```

### 複雑なユーザーフロー

```bash
/ai:generate-e2e-tests checkout-process
```

### 期待される出力

```markdown
✅ E2Eテスト作成完了

📁 生成ファイル:
- tests/login-flow.spec.ts
- tests/fixtures/user-data.ts

📊 テストシナリオ:
- ✅ ログインフォーム表示
- ✅ 正常ログイン（メール + パスワード）
- ✅ 認証エラーハンドリング
- ✅ リダイレクト動作確認

✅ すべてのテスト成功（4/4）
⚡ 実行時間: 8.5秒
🔒 フレーキーテスト: 0件
```

## 参照

- エージェント: `.claude/agents/e2e-tester.md`
- スキル: `.claude/skills/playwright-testing/SKILL.md`
- スキル: `.claude/skills/test-data-management/SKILL.md`
- スキル: `.claude/skills/flaky-test-prevention/SKILL.md`
