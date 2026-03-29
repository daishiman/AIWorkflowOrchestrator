# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 4                                         |
| Phase名    | テスト作成                                |
| 対象機能   | claude-sdk-message-contract-normalization |
| 前提Phase  | Phase 3（設計レビュー）                   |
| 後続Phase  | Phase 5（実装）                           |
| ステータス | pending                                   |
| 作成日     | 2026-03-29                                |

## 目的

normalizer の主要 message パターンと edge case を検証するテストケースを定義する。

## 背景

Phase 2 で設計した normalizer の変換ロジックを TDD アプローチで検証するため、実装前にテストケースを網羅的に定義する。Red 状態のテストを先に用意し、Phase 5 の実装で Green にする。

## 実行タスク

### Task 1: system/init 正規化テスト

**目的**: `system/init` メッセージの正規化を検証するテストを作成する。

**実行手順**:

1. `system/init` メッセージのテストフィクスチャを作成する
2. 正規化後の `SkillCreatorSdkEvent` が期待値と一致することを検証する

**期待される成果物**:

- system/init 正規化テストケース

### Task 2: assistant message 正規化テスト

**目的**: `assistant` メッセージの正規化を検証するテストを作成する。

**実行手順**:

1. `assistant` メッセージのテストフィクスチャを作成する
2. text フィールドの抽出が正しいことを検証する

**期待される成果物**:

- assistant 正規化テストケース

### Task 3: result subtype / permission denial 正規化テスト

**目的**: `result` subtype および permission denial の正規化を検証するテストを作成する。

**実行手順**:

1. 各 result subtype のテストフィクスチャを作成する
2. permission denial 情報の抽出を検証する

**期待される成果物**:

- result / permission denial テストケース

### Task 4: session_id 欠損時のテスト

**目的**: `session_id` 欠損時の振る舞いを検証するテストを作成する。

**実行手順**:

1. `session_id` が欠損した入力を作成する
2. warning 扱いとなることを検証する

**期待される成果物**:

- session_id 欠損テストケース

## 参照資料

| 資料名  | パス                      | 説明 |
| ------- | ------------------------- | ---- |
| Phase 1 | `phase-1-requirements.md` | 要件 |
| Phase 2 | `phase-2-design.md`       | 設計 |

## 成果物

| 成果物      | パス                             | 説明       |
| ----------- | -------------------------------- | ---------- |
| test matrix | `outputs/phase-4/test-matrix.md` | ケース一覧 |

## 統合テスト連携

normalizer 変換パターンの統合テストシナリオを作成する。

---

## TDD検証

### TDD サイクル確認（Red）

```bash
pnpm vitest run --filter "sdk-message-normalizer"
```

**確認項目**:

- [ ] テストが失敗することを確認（Red 状態）

## 完了条件

- [ ] 主要 message ケースが列挙されている
- [ ] edge case が含まれている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 3 が完了していること
- **後続**: Phase 5 へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`phase-5-implementation.md`
