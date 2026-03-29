# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 6                                         |
| Phase名    | テスト拡充                                |
| 対象機能   | claude-sdk-message-contract-normalization |
| 前提Phase  | Phase 5（実装）                           |
| 後続Phase  | Phase 7（カバレッジ確認）                 |
| ステータス | pending                                   |
| 作成日     | 2026-03-29                                |

## 目的

中断、permission denial、resume 時の再開などの edge case を追加検証する。

## 背景

Phase 4 / 5 で基本パターンのテストと実装は完了しているが、実運用で発生しうる例外的なシナリオ（中断・権限拒否・セッション再開）のカバレッジが不足している。これらの edge case を網羅し、normalizer の堅牢性を担保する。

## 実行タスク

### Task 1: cancellation / timeout ケースの追加

**目的**: cancellation / timeout ケースを追加し、中断時の正規化を検証する。

**実行手順**:

1. SDK セッションの中断シナリオを洗い出す
2. timeout 時の振る舞いを定義しテストを作成する

**期待される成果物**:

- cancellation / timeout テストケース

### Task 2: permission denial ケースの追加

**目的**: permission denial ケースを追加し、権限拒否時の正規化を検証する。

**実行手順**:

1. permission denial のバリエーションを列挙する
2. 各パターンの正規化結果を検証するテストを作成する

**期待される成果物**:

- permission denial テストケース

### Task 3: resumed session ケースの追加

**目的**: resumed session ケースを追加し、セッション再開時の正規化を検証する。

**実行手順**:

1. `session_id` が引き継がれるケースを定義する
2. resume 時の初期化メッセージ処理を検証するテストを作成する

**期待される成果物**:

- resumed session テストケース

## 参照資料

| 資料名  | パス                       | 説明       |
| ------- | -------------------------- | ---------- |
| Phase 4 | `phase-4-test-creation.md` | 基本テスト |

## 成果物

| 成果物               | パス                                      | 説明       |
| -------------------- | ----------------------------------------- | ---------- |
| extended test record | `outputs/phase-6/extended-test-record.md` | 拡張テスト |

## 統合テスト連携

edge case（中断・permission denial・resumed session）の統合テスト拡充を行う。

## 完了条件

- [ ] edge case が追加されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 5 が完了していること
- **後続**: Phase 7 へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`phase-7-coverage-check.md`
