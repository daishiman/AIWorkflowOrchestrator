# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 4                               |
| Phase名    | テスト作成                      |
| カテゴリ   | TDD-Red                         |
| 前提Phase  | Phase 3                         |
| 後続Phase  | Phase 5                         |
| ステータス | 未実施                          |
| 作成日     | 2026-01-16                      |
| 機能名     | skill-ipc-handlers-registration |

---

## 目的

既存テストでRed状態（ハンドラー未登録によるエラー）を確認し、修正後にGreen状態になることを検証する基盤を準備する。

## 背景

TDDのRed-Green-Refactorサイクルに従い、まず既存テストが失敗することを確認する。既に統合テストが存在するため、これを活用する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 既存テストの確認

**目的**: 既存のスキル管理テストを確認する

**実行手順**:

1. `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts` を確認する
2. `apps/desktop/src/main/services/skill/__tests__/integration.test.ts` を確認する
3. テストカバレッジを確認する

**期待される成果物**:

- 既存テスト一覧

---

### タスク2: Red状態の確認

**目的**: 現状でテストがFail（またはハンドラー未登録状態）であることを確認する

**実行手順**:

1. アプリを起動し、Agent画面でエラーが発生することを確認する
2. 該当するIPCチャネルが登録されていないことを確認する
3. エラーログを記録する

**期待される成果物**:

- Red状態確認レポート

---

### タスク3: テスト要件の確認

**目的**: 修正後に確認すべきテストケースを特定する

**実行手順**:

1. 既存テストケースで修正により影響を受けるものをリストアップする
2. 追加が必要なテストケースがあれば特定する
3. テスト実行コマンドを確認する

**期待される成果物**:

- テスト要件リスト

---

## 参照資料

| 参照資料            | パス                                                                 | 内容                  |
| ------------------- | -------------------------------------------------------------------- | --------------------- |
| 前Phase成果物       | `docs/30-workflows/skill-ipc-handlers-registration/phase-3-*.md`     | 前Phaseのタスク仕様書 |
| skillHandlersテスト | `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`          | ユニットテスト        |
| 統合テスト          | `apps/desktop/src/main/services/skill/__tests__/integration.test.ts` | 統合テスト            |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料              | パス                                                                         | 内容            |
| --------------------- | ---------------------------------------------------------------------------- | --------------- |
| architecture-patterns | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | IPC APIチャネル |

---

## 成果物

| 成果物             | パス                                   | 内容           |
| ------------------ | -------------------------------------- | -------------- |
| テスト確認レポート | `outputs/phase-4/test-red-status.md`   | Red状態確認    |
| テスト要件リスト   | `outputs/phase-4/test-requirements.md` | 必要テスト一覧 |

---

## 統合テスト連携（Phase 1〜11は必須）

既存テストでRed状態確認:

- `SH-REG-02: should register skill:list-imported handler` - ハンドラー登録テスト
- `INT-IPC-02: should respond to skill:list-imported` - IPC応答テスト

---

## 完了条件

- [ ] 既存のスキル管理テストを確認した
- [ ] Red状態（ハンドラー未登録）を確認した
- [ ] 修正後に確認すべきテストケースを特定した

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test
```

**確認項目**:

- [ ] 現状でハンドラーが登録されていないことを確認（Red状態）

---

## 依存関係

- **前提**: Phase 3 が完了していること
- **後続**: Phase 5 へ進む

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 4 実行記録

### 実行タスク

- （記入）

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

`docs/30-workflows/skill-ipc-handlers-registration/phase-5-implementation.md`
