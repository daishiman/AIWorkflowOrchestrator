# Phase 3: 設計レビュー

## メタ情報

| 項目         | 内容                               |
| ------------ | ---------------------------------- |
| Phase        | 3                                  |
| タスクID     | TASK-FIX-LIFECYCLE-PANEL-ERROR-001 |
| ステータス   | 未実施                             |
| 担当         | 実装者                             |
| 見積もり時間 | 0.25h                              |

## 目的

Phase 2 の設計が AC-1〜AC-5 を全て満たし、既存動作を破壊しないことを確認する。PASS の場合のみ Phase 4 へ進む。MAJOR 指摘がある場合は Phase 2 に戻る。

## 実行タスク

1. AC-1〜AC-5 が設計で満たされているか確認
2. `handoffBundle` 処理への無影響を確認
3. React hooks deps 変更がないことを確認
4. breaking change がないことの確認
5. MAJOR 指摘の有無を判定し、PASS/FAIL を決定する

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                         | 内容           |
| ------------------ | ---------------------------------------------------------------------------- | -------------- |
| アーキテクチャ仕様 | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md` | システム全体像 |

## 実行手順

### ステップ 1: AC-1〜AC-5 の設計充足確認

各受入条件を Phase 2 の設計と照合する:

| AC   | 受入条件                                                                                                   | 対応する設計                                                                      | 充足判定 |
| ---- | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | -------- |
| AC-1 | `phase === 'failed'` の snapshot を受け取ったとき、`setWorkflowError(null)` が呼ばれないこと               | `if (snapshot.phase !== 'failed')` で `setWorkflowError(null)` を囲む設計         | 確認対象 |
| AC-2 | `phase !== 'failed'` の snapshot を受け取ったとき、`setWorkflowError(null)` が呼ばれること（既存動作維持） | `if (snapshot.phase !== 'failed')` ブロック内で `setWorkflowError(null)` を実行   | 確認対象 |
| AC-3 | `handoffBundle` の処理は `phase` に関わらず変わらないこと                                                  | `handoffBundle` の `if` ブロックは `phase` 判定の外に置かれている                 | 確認対象 |
| AC-4 | 既存テストが全て PASS すること                                                                             | 変更がコールバック内の 1 行追加のみのため既存テストへの影響なし（Phase 9 で確認） | 確認対象 |
| AC-5 | UI 上でスキル生成エラー発生時にエラーメッセージが表示されたままになること                                  | `setWorkflowError(null)` が呼ばれないことで Redux store のエラー状態が保持される  | 確認対象 |

### ステップ 2: 既存動作への影響確認

以下の既存動作が破壊されないことを確認する:

| 動作                                         | 影響                                   | 判定     |
| -------------------------------------------- | -------------------------------------- | -------- |
| `setWorkflowSnapshot` の呼び出し             | 無条件のまま（変更なし）               | 問題なし |
| `setHandoffGuidance` の呼び出し              | `handoffBundle` 条件で実行（変更なし） | 問題なし |
| `useEffect` の依存配列                       | 変更なし                               | 問題なし |
| `onWorkflowStateChanged` の戻り値（cleanup） | 変更なし（return のまま）              | 問題なし |

### ステップ 3: breaking change の確認

本修正は `SkillLifecyclePanel.tsx` の内部ロジック変更であり、以下の点で breaking change なし:

| 変更内容                                | 外部への影響                                                 | 判定     |
| --------------------------------------- | ------------------------------------------------------------ | -------- |
| `setWorkflowError(null)` の呼び出し条件 | Redux store のエラー状態がクリアされなくなる（意図した変更） | 問題なし |
| コンポーネントの Props 変更             | なし                                                         | 問題なし |
| IPC 通信の変更                          | なし                                                         | 問題なし |
| 型定義の変更                            | なし（既存型を使用）                                         | 問題なし |

### ステップ 4: PASS/FAIL 判定

以下の判定基準に従い、`outputs/phase-3/design-review-result.md` に結果を記録する:

#### PASS 条件

- AC-1〜AC-5 の全てが設計で充足されている
- `handoffBundle` 処理が `phase` 判定の影響を受けない設計になっている
- React hooks deps の変更がない
- breaking change がない
- MAJOR 指摘がゼロ

#### FAIL 条件（Phase 2 に戻る）

- AC のいずれかが設計で充足されていない
- `handoffBundle` 処理が誤って `phase` 判定の内側に含まれている
- React hooks deps に変更が生じている
- MAJOR な breaking change が未対処

## 多角的チェック観点

- `if (snapshot.phase !== 'failed')` の条件で `handoffBundle` 処理が意図せず囲まれていないか確認したか（括弧の位置）
- `phase: 'failed'` 以外のエラー関連フェーズ（`'heartbeat_timeout'` 等）が AC-1 の想定に含まれるべきか確認したか（Phase 6 のエッジケースとして扱うか）
- 修正後に `setWorkflowError` が永久にクリアされないケース（ユーザーが手動でエラーをクリアするUIがあるか）を確認したか

## 成果物

| 成果物           | パス                                      | 説明                                |
| ---------------- | ----------------------------------------- | ----------------------------------- |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md` | PASS/FAIL 判定、AC 充足表、指摘事項 |

## 完了条件

- [ ] AC-1〜AC-5 の全てが設計で充足されていることが確認されている
- [ ] `handoffBundle` 処理が `phase` 判定の外にあることが確認されている
- [ ] React hooks deps が変更なしであることが確認されている
- [ ] breaking change がないことが確認されている
- [ ] PASS/FAIL 判定が `design-review-result.md` に明記されている
- [ ] MAJOR 指摘がある場合は Phase 2 に戻っている

## タスク100%実行確認【必須】

- [ ] 全実行タスクが完了している
- [ ] 全成果物が存在する（`outputs/phase-3/design-review-result.md`）
- [ ] 全完了条件が満たされている

## 次Phase

Phase 4: テスト作成（TDD Red） へ進む（設計レビュー PASS の場合のみ）
