# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| タスクID   | TASK-FIX-16-1-SDK-AUTH-INFRASTRUCTURE |
| Phase      | 6                                     |
| Phase名    | テスト拡充                            |
| 前提Phase  | Phase 5 (実装)                        |
| 後続Phase  | Phase 7 (テストカバレッジ確認)        |
| ステータス | 未実施                                |
| 作成日     | 2026-02-07                            |
| 機能名     | sdk-auth-infrastructure               |

---

## 目的

Phase 5（実装）完了後、認証キー管理基盤のテストカバレッジ目標達成に向けたテスト拡充と統合テストの追加を行う。

## 背景

Claude Agent SDK 認証キー管理基盤の実装完了後、リファクタリングに進む前にテストを拡充する。
特にセキュリティ観点（キーの暗号化・漏洩防止）のテストを重点的に追加し、Main-Renderer間IPC通信の統合テストを含める。

---

## 実行タスク

- カバレッジ分析: テストカバレッジの測定と不足領域の特定
- セキュリティテスト拡充: キー暗号化・マスキング・漏洩防止のテスト追加
- 統合テスト設計・実行: Main-Renderer IPC通信テストの追加
- 異常系テスト: キー未設定・無効キー・ストレージ障害のテスト追加
- 境界値テスト: キー長・形式バリデーションのテスト追加

---

## 参照資料

| 参照資料           | パス                                        | 内容                     |
| ------------------ | ------------------------------------------- | ------------------------ |
| 設計書             | `outputs/phase-2/architecture-design.md`    | アーキテクチャ設計       |
| テスト仕様書       | `outputs/phase-4/test-specification.md`     | Phase 4テスト設計        |
| 実装サマリー       | `outputs/phase-5/implementation-summary.md` | Phase 5実装結果          |
| セキュリティガイド | `.claude/rules/04-electron-security.md`     | Electronセキュリティ原則 |

### システム仕様（aiworkflow-requirements）

> 以下のシステム仕様書からテスト拡充の観点を抽出し、カバレッジ改善に反映してください。

| 参照資料                     | パス                                                                              | 内容                                   |
| ---------------------------- | --------------------------------------------------------------------------------- | -------------------------------------- |
| テスト規約                   | `.claude/skills/aiworkflow-requirements/references/testing.md`                    | カバレッジ基準、テスト設計ガイドライン |
| コンポーネントテストパターン | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | 統合テストパターン、E2Eテスト設計      |
| セキュリティ原則             | `.claude/skills/aiworkflow-requirements/references/security-principles.md`        | 暗号化検証、ログ漏洩テスト観点         |
| IPCセキュリティ              | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | IPC通信テスト、sender検証              |
| 認証インターフェース         | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`            | 境界値テスト観点                       |
| エラーハンドリング           | `.claude/skills/aiworkflow-requirements/references/error-handling.md`             | エラーケーステスト、リトライテスト     |
| アーキテクチャ層別テスト     | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`     | Main/Preload/Renderer層別テスト配置    |

---

## 成果物

| 成果物             | パス                                  | 内容               |
| ------------------ | ------------------------------------- | ------------------ |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`  | カバレッジ計測結果 |
| 統合テスト結果     | `outputs/phase-6/integration-test.md` | 統合テスト実行結果 |

---

## ユニットテストカバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

---

## 結合テストカバレッジ基準

| 指標                         | 目標 |
| ---------------------------- | ---- |
| IPCチャンネル                | 100% |
| モジュール間インターフェース | 100% |
| 正常系シナリオ               | 100% |
| 異常系シナリオ               | 80%+ |
| セキュリティテスト           | 100% |

---

## 統合テスト拡充【必須】

### セキュリティテスト

| テストカテゴリ       | 検証項目                                      |
| -------------------- | --------------------------------------------- |
| 暗号化テスト         | キーがsafeStorageで暗号化されて保存されること |
| マスキングテスト     | Renderer側にキーが平文で送信されないこと      |
| ログ漏洩テスト       | ログ出力にキーが含まれないこと                |
| ストレージ分離テスト | Main ProcessのみがキーにアクセスできるこFと   |

### IPC通信テスト

| テストカテゴリ   | 検証項目                                      |
| ---------------- | --------------------------------------------- |
| チャンネル疎通   | auth:get-key-status, auth:set-api-key等の疎通 |
| エラー伝播テスト | Main側エラーがRenderer側に適切に伝播すること  |
| 型安全性テスト   | IPC通信の型定義が正しく適用されていること     |

### 異常系テスト

| テストカテゴリ       | 検証項目                                      |
| -------------------- | --------------------------------------------- |
| キー未設定テスト     | キー未設定時にSDK呼び出しがブロックされること |
| 無効キーテスト       | 不正なキー形式が拒否されること                |
| ストレージ障害テスト | ストレージアクセス失敗時のエラーハンドリング  |
| SDK初期化失敗テスト  | SDK初期化失敗時のリトライ・エラー表示         |

---

## 統合テスト連携（Phase 1〜11は必須）

### Phase 6での必須アクション

- [ ] 統合テストの拡充（全カテゴリのカバレッジ向上）
- [ ] セキュリティテストの追加（暗号化・マスキング・ログ漏洩防止）
- [ ] IPC通信テストの追加
- [ ] 異常系・境界値テストの追加
- [ ] キーが平文でログ・ストレージに露出しないことを検証

---

## 実行コマンド

```bash
# ユニットテストカバレッジ確認
pnpm --filter @repo/desktop test:coverage

# テスト実行（認証キー管理関連）
pnpm --filter @repo/desktop test -- sdk-auth
pnpm --filter @repo/desktop test -- api-key

# 統合テスト実行
pnpm --filter @repo/desktop test:integration

# Lint・型チェック
pnpm --filter @repo/desktop lint
pnpm --filter @repo/desktop typecheck
```

---

## アーキテクチャ層別テスト

| 層               | テスト観点                     | テストファイル配置                       |
| ---------------- | ------------------------------ | ---------------------------------------- |
| Main Process     | ApiKeyService, SecureStorage   | `apps/desktop/src/main/**/*.test.ts`     |
| IPC通信          | チャンネルハンドラー、型安全性 | `apps/desktop/src/main/ipc/*.test.ts`    |
| Preload          | contextBridge API              | `apps/desktop/src/preload/**/*.test.ts`  |
| Renderer Process | フック、状態管理               | `apps/desktop/src/renderer/**/*.test.ts` |
| Shared           | 型定義、ユーティリティ         | `packages/shared/**/*.test.ts`           |

---

## 完了条件

- [ ] ユニットテストカバレッジ基準を達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] 結合テストカバレッジ基準を達成（IPC 100%, シナリオ 100%/80%）
- [ ] セキュリティテストが追加されている（暗号化・マスキング・ログ漏洩防止）
- [ ] IPC通信テストが追加されている
- [ ] 異常系・境界値テストが追加されている
- [ ] キーが平文でログ・ストレージに露出しないことを検証済み
- [ ] カバレッジレポートが出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 発見事項・引き継ぎ事項が記録されている

---

## 依存関係

- **前提**: Phase 5 が完了していること
- **後続**: Phase 7 へ進む

---

## 実行記録テンプレート

Phase完了後、以下を記録してください:

```markdown
## Phase 6 実行記録

### カバレッジ結果

- Line Coverage: {{%}}
- Branch Coverage: {{%}}
- Function Coverage: {{%}}

### セキュリティテスト結果

- 暗号化テスト: {{PASS/FAIL}}
- マスキングテスト: {{PASS/FAIL}}
- ログ漏洩テスト: {{PASS/FAIL}}

### 追加テスト数

- ユニットテスト: {{N}}件
- 統合テスト: {{N}}件
- 異常系テスト: {{N}}件

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

`docs/30-workflows/sdk-auth-infrastructure/phase-7-coverage-verification.md`
