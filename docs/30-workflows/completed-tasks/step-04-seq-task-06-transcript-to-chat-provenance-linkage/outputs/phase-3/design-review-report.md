# Phase 3: 設計レビュー報告

> タスクID: TASK-IMP-TRANSCRIPT-TO-CHAT-PROVENANCE-LINKAGE-001
> レビュー日: 2026-03-22

## 1. レビュー観点と判定

### 1.1 出所喪失（Source Loss）

| チェック項目                                  | 判定 | 根拠                                                                |
| --------------------------------------------- | ---- | ------------------------------------------------------------------- |
| 3 操作全てで provenance metadata が付与される | PASS | design-summary C-2 で全操作に TranscriptProvenance を自動付与と定義 |
| metadata が DB に永続化される                 | PASS | ChatMessage.metadata.transcriptProvenance パスを定義済み            |
| 履歴復元時に provenance chip が復元される     | PASS | contract-matrix V-C7 で復元検証を定義済み                           |
| dismiss 後も metadata が保持される            | PASS | contract-matrix V-C8 で保持検証を定義済み                           |

**判定**: PASS

### 1.2 二重導線（Duplicate Navigation）

| チェック項目                                         | 判定 | 根拠                                                   |
| ---------------------------------------------------- | ---- | ------------------------------------------------------ |
| Terminal Handoff CTA と Transcript Copy CTA が別領域 | PASS | Handoff Card は inline、Transcript CTA は Toolbar 上部 |
| 表示条件が排他的でなく共存可能                       | PASS | Handoff は AI 提案時、Transcript CTA はユーザー選択時  |
| i18n key が重複しない                                | PASS | contract-matrix で一意な key を定義済み                |

**判定**: PASS

### 1.3 Copy Ambiguity

| チェック項目                                       | 判定 | 根拠                                                     |
| -------------------------------------------------- | ---- | -------------------------------------------------------- |
| 3 操作の目的が明確に区別される                     | PASS | OP-1(選択範囲), OP-2(直近出力), OP-3(セッション)         |
| OP-1 と Task 05 の「コマンドをコピー」が混同しない | PASS | 対象が異なる（テキスト vs CLI コマンド）、CTA ラベルも別 |
| clipboard vs 直接挿入の使い分けが明確              | PASS | OP-1 は直接挿入、OP-2/OP-3 は attachment                 |

**判定**: PASS

### 1.4 アーキテクチャ整合性

| チェック項目                                   | 判定 | 根拠                                                    |
| ---------------------------------------------- | ---- | ------------------------------------------------------- |
| Renderer -> Preload -> Main の一方向依存を遵守 | PASS | 新規 IPC 不要、既存の conversationAPI パスを利用        |
| 新規 IPC チャネル追加なし                      | PASS | 設計タスクのため IPC 実装は後続                         |
| P31/P48/P5 のリスク回避策がある                | PASS | 個別セレクタ / optional chaining / cleanup を設計に明記 |

**判定**: PASS

### 1.5 UI/UX 正本との整合

| チェック項目                              | 判定 | 根拠                                         |
| ----------------------------------------- | ---- | -------------------------------------------- |
| CTA 上限（primary 1 + secondary 1）を遵守 | PASS | contract-matrix で surface ごとに確認済み    |
| auto-send boundary を遵守                 | PASS | NFR-2 で明示的に禁止                         |
| Terminal は user-operated workspace       | PASS | GOV-1 で明記                                 |
| Apple HIG 準拠のデザイン原則              | PASS | Chip / Toolbar は Clarity / Deference に沿う |

**判定**: PASS

## 2. Simpler Alternative 再確認

| 現在の設計                         | より単純な代替               | 再評価結果                                            |
| ---------------------------------- | ---------------------------- | ----------------------------------------------------- |
| OP-1: composer 直接挿入            | clipboard copy のみ          | **不採用維持**: provenance が失われる                 |
| OP-2/OP-3: attachment chip         | composer に全文ペースト      | **不採用維持**: 長文で UX 悪化                        |
| WorkspaceChatMessage 型拡張 (案C)  | 全く新しい ProvenanceContext | **不採用維持**: 過剰設計                              |
| Transcript selection = local state | Zustand Store                | **不採用維持**: 単一コンポーネント利用で Store 化不要 |

**結論**: 現在の設計が最もシンプルな選択肢であり、変更不要。

## 3. 総合判定

| 観点           | 判定     |
| -------------- | -------- |
| 出所喪失       | PASS     |
| 二重導線       | PASS     |
| Copy Ambiguity | PASS     |
| アーキテクチャ | PASS     |
| UI/UX          | PASS     |
| **総合**       | **PASS** |

## 4. MINOR 指摘（未タスク化対象）

| #   | 指摘                                                                    | 対象 Phase | 追跡先                        |
| --- | ----------------------------------------------------------------------- | ---------- | ----------------------------- |
| M-1 | SelectedFile に source フィールドが未対応（ファイル背景の出所追跡不可） | 後続タスク | 未タスク化（Phase 12 Task 4） |
| M-2 | TranscriptSession 型が workspaceSlice に未定義（現状は骨組みのみ）      | Phase 5    | 実装時に追加                  |
| M-3 | originalContent の truncation 上限（10,000文字）の根拠が未記載          | Phase 5    | 実装時に定量化                |
