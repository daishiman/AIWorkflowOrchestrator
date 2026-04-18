# Phase 3: 設計レビューゲート

## メタ情報

| 項目   | 値                                                |
| ------ | ------------------------------------------------- |
| Phase  | 3                                                 |
| 機能名 | task-execute-async-snapshot-error-propagation-001 |
| 作成日 | 2026-04-18                                        |

## 目的

Phase 1/2 の evidence を基に、差分確認型 workflow として妥当かを判定する。

## レビュー観点

| 観点               | 判定基準                                             |
| ------------------ | ---------------------------------------------------- |
| current facts 優先 | speculative redesign を排している                    |
| 型変更抑制         | `errorCode` 拡張が必要時のみ許可されている           |
| NON_VISUAL         | Phase 11 証跡が screenshot 非依存で閉じる            |
| close-out          | Phase 12 の6成果物と parity が設計へ組み込まれている |

## 実行タスク

- Task 3-1: Phase 1/2 成果物レビュー
- Task 3-2: 差分確認型 workflow としての妥当性判定
- Task 3-3: Phase 4 進行可否のゲート判断

## 参照資料

| 資料名         | パス                                    | 説明          |
| -------------- | --------------------------------------- | ------------- |
| Phase 1 成果物 | `outputs/phase-1/code-investigation.md` | current facts |
| Phase 2 成果物 | `outputs/phase-2/design-notes.md`       | 契約判断      |

## ゲート判定

| 確認項目                                | 判定 |
| --------------------------------------- | ---- |
| Phase 1 成果物が存在する                | [ ]  |
| Phase 2 の契約判断が整理されている      | [ ]  |
| Phase 5 が新規実装前提になっていない    | [ ]  |
| Phase 12 / 13 の運用が skill 準拠である | [ ]  |

## 成果物

| 成果物       | 配置先                                    |
| ------------ | ----------------------------------------- |
| レビュー結果 | `outputs/phase-3/design-review-result.md` |

## 完了条件

- [ ] レビュー観点を全て確認した
- [ ] PENDING のまま次へ送る論点が明示されている
- [ ] Phase 4 に進める条件を明文化した

## 次Phase

→ [Phase 4: テスト作成](phase-4-test-creation.md)
