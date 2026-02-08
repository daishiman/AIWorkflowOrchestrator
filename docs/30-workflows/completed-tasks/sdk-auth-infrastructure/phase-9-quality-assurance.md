# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| タスクID   | TASK-FIX-16-1-SDK-AUTH-INFRASTRUCTURE |
| Phase      | 9                                     |
| Phase名    | 品質保証                              |
| 前提Phase  | Phase 8 (リファクタリング)            |
| 後続Phase  | Phase 10 (最終レビューゲート)         |
| ステータス | 未実施                                |
| 作成日     | 2026-02-07                            |
| 機能名     | sdk-auth-infrastructure               |

---

## 目的

静的解析・セキュリティ・性能の観点から認証キー管理基盤の品質を検証する。

## 背景

実装・リファクタリング完了後、本番リリースに向けた品質保証を行う。
認証キー管理はセキュリティクリティカルな機能であるため、セキュリティ観点の品質検証を重点的に実施する。

---

## 実行タスク

- 静的解析: ESLint・TypeScript型チェックによるコード品質検証
- セキュリティ検証: キー管理のセキュリティ原則遵守確認
- テスト網羅性確認: カバレッジ基準の最終確認
- パフォーマンス確認: 暗号化/復号処理のパフォーマンス確認

---

## 参照資料

| 参照資料             | パス                                                | 内容             |
| -------------------- | --------------------------------------------------- | ---------------- |
| 実装コード           | `apps/desktop/src/main/services/api-key-service.ts` | 検証対象         |
| IPC ハンドラー       | `apps/desktop/src/main/ipc/auth-handlers.ts`        | 検証対象         |
| 型定義               | `packages/shared/src/types/auth.ts`                 | 検証対象         |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md`                | 変更履歴         |
| セキュリティガイド   | `.claude/rules/04-electron-security.md`             | セキュリティ原則 |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                  | 内容             |
| ------------------ | --------------------------------------------------------------------- | ---------------- |
| 品質基準           | `.claude/skills/aiworkflow-requirements/references/quality.md`        | 品質基準         |
| セキュリティ原則   | `.claude/skills/aiworkflow-requirements/references/security-*.md`     | セキュリティ基準 |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md` | エラー処理規約   |

---

## 成果物

| 成果物       | パス                                | 内容         |
| ------------ | ----------------------------------- | ------------ |
| 品質レポート | `outputs/phase-9/quality-report.md` | 品質検証結果 |

---

## 品質ゲート

### 機能検証

- [ ] 全ユニットテスト成功
- [ ] 全統合テスト成功
- [ ] 全セキュリティテスト成功

### コード品質

- [ ] pnpm lint が通ること（ESLintエラーなし）
- [ ] pnpm typecheck が通ること（TypeScript型エラーなし）
- [ ] コードフォーマット適用済み

### テスト網羅性

| 指標              | 最低基準 | 推奨基準 | 現在値 | 判定 |
| ----------------- | -------- | -------- | ------ | ---- |
| Line Coverage     | 80%      | 90%      | -      | -    |
| Branch Coverage   | 60%      | 70%      | -      | -    |
| Function Coverage | 80%      | 90%      | -      | -    |

### セキュリティ

- [ ] キーが平文でログに出力されていないこと
- [ ] キーが平文でストレージに保存されていないこと
- [ ] Rendererにキーが直接送信されていないこと
- [ ] エラーメッセージにキー情報が含まれていないこと
- [ ] 入力バリデーションが適切であること
- [ ] Result型による適切なエラーハンドリングがされていること

---

## セキュリティチェックリスト（04-electron-security.md 準拠）

### 3プロセスモデル遵守

| 確認項目                                     | 結果 |
| -------------------------------------------- | ---- |
| キー保存・取得はMain Processのみで実行される | -    |
| PreloadはcontextBridgeのみを使用している     | -    |
| RendererはDOM操作のみを行っている            | -    |

### IPCセキュリティ

| 確認項目                                       | 結果 |
| ---------------------------------------------- | ---- |
| チャンネル名がホワイトリストで管理されている   | -    |
| 全ハンドラで送信元ウィンドウを検証している     | -    |
| 引数がMain側でバリデーションされている         | -    |
| エラーがサニタイズされてからRendererに送られる | -    |

### 認証セキュリティ

| 確認項目                                       | 結果 |
| ---------------------------------------------- | ---- |
| トークン・キーは暗号化して保存されている       | -    |
| 機密データはMain Processに留められている       | -    |
| Rendererにはキーのステータス情報のみ送信される | -    |

---

## 統合テスト連携（Phase 1〜11は必須）

### Phase 9での必須アクション

- [ ] 品質保証で統合テスト結果を確認
- [ ] セキュリティ観点の最終検証
- [ ] 04-electron-security.md の原則に準拠していることを確認
- [ ] パフォーマンス観点の確認

---

## 実行コマンド

```bash
# Lint実行
pnpm --filter @repo/desktop lint

# 型チェック
pnpm --filter @repo/desktop typecheck

# テスト実行
pnpm --filter @repo/desktop test -- sdk-auth
pnpm --filter @repo/desktop test -- api-key

# カバレッジ確認
pnpm --filter @repo/desktop test:coverage

# 統合テスト
pnpm --filter @repo/desktop test:integration

# セキュリティテスト
pnpm --filter @repo/desktop test -- security
```

---

## 品質レポート項目

### 1. 静的解析結果

| 項目               | 結果 | 詳細 |
| ------------------ | ---- | ---- |
| ESLintエラー       | -    | -    |
| ESLint警告         | -    | -    |
| TypeScript型エラー | -    | -    |
| コードフォーマット | -    | -    |

### 2. テスト結果

| 項目               | 結果 | 件数 |
| ------------------ | ---- | ---- |
| ユニットテスト     | -    | -    |
| 統合テスト         | -    | -    |
| セキュリティテスト | -    | -    |

### 3. カバレッジ結果

| 指標              | 値  | 基準達成 |
| ----------------- | --- | -------- |
| Line Coverage     | -   | -        |
| Branch Coverage   | -   | -        |
| Function Coverage | -   | -        |

### 4. セキュリティ検証結果

| 項目                         | 結果 |
| ---------------------------- | ---- |
| キー暗号化                   | -    |
| キーマスキング               | -    |
| ログ漏洩防止                 | -    |
| 04-electron-security.md 準拠 | -    |

---

## 完了条件

- [ ] 全ユニットテスト成功
- [ ] 全統合テスト成功
- [ ] 全セキュリティテスト成功
- [ ] pnpm lint が通ること（ESLintエラーなし）
- [ ] pnpm typecheck が通ること（TypeScript型エラーなし）
- [ ] コードフォーマット適用済み
- [ ] テストカバレッジ基準達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] キーが平文でログ・ストレージに露出しないことを確認
- [ ] 04-electron-security.md の原則に準拠していること
- [ ] 品質レポートが出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各品質チェック項目を100%完了し、完了を明記
- [ ] 発見事項・引き継ぎ事項が記録されている

---

## 依存関係

- **前提**: Phase 5, 8 が完了していること
- **後続**: Phase 10 へ進む

---

## 実行記録テンプレート

Phase完了後、以下を記録してください:

```markdown
## Phase 9 実行記録

### 静的解析結果

- ESLintエラー: {{数}}件
- ESLint警告: {{数}}件
- TypeScript型エラー: {{数}}件

### テスト結果

- ユニットテスト: {{PASS/FAIL}} ({{数}}件)
- 統合テスト: {{PASS/FAIL}} ({{数}}件)
- セキュリティテスト: {{PASS/FAIL}} ({{数}}件)

### カバレッジ結果

- Line Coverage: {{%}} (基準: 80%)
- Branch Coverage: {{%}} (基準: 60%)
- Function Coverage: {{%}} (基準: 80%)

### セキュリティ検証結果

- キー暗号化: {{PASS/FAIL}}
- キーマスキング: {{PASS/FAIL}}
- ログ漏洩防止: {{PASS/FAIL}}
- 04-electron-security.md 準拠: {{PASS/FAIL}}

### 品質ゲート判定

- 全体判定: {{PASS/FAIL}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/sdk-auth-infrastructure/phase-10-final-review.md`
