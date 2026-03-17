# RAG state IPC チャンネル設計と仕様書整備 - タスク指示書

## メタ情報

| 項目         | 内容                                                                            |
| ------------ | ------------------------------------------------------------------------------- |
| タスクID     | UT-TASK06-001                                                                   |
| タスク名     | RAG state IPC チャンネル設計と仕様書整備                                        |
| 分類         | 仕様同期                                                                        |
| 対象機能     | Main Chat / Settings runtime 同期（RAG状態管理）                                |
| 優先度       | 中                                                                              |
| 見積もり規模 | 小規模                                                                          |
| ステータス   | 未実施                                                                          |
| 発見元       | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 Phase 10 MINOR-01 / Phase 11 DI-0002 |
| 発見日       | 2026-03-17                                                                      |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

RAG state を Main authority に寄せる方針は確定したが、IPC 契約（取得・更新・通知）が system spec に未反映。

### 1.2 問題点・課題

- Renderer 実装が暗黙契約に依存する。
- 将来の state 変更時に Main/Preload/Renderer でドリフトしやすい。

### 1.3 放置した場合の影響

- RAG 表示が Settings と Chat で食い違う。
- 回帰テストで原因分離が難しくなる。

## 2. 何を達成するか（What）

### 2.1 目的

RAG state IPC の request/response/event 契約を正本仕様へ固定する。

### 2.2 最終ゴール

- `rag:get-state` / `rag:set-state` / `rag:on-state-changed` の契約が文書化される。
- `contract-matrix.md` と system spec の参照が一致する。

### 2.3 スコープ

#### 含むもの

- `api-ipc-system-core.md` への RAG state IPC 追記。
- 必要なら `api-ipc-rag.md` 新規作成。
- Task06 workflow 側成果物のリンク同期。

#### 含まないもの

- RAG エンジン実装変更。
- Embedding 戦略変更。

### 2.4 成果物

- 更新済み system spec（RAG IPC 契約節）。
- Task06 からの参照リンク。

## 3. どのように実行するか（How）

### 3.1 前提条件

Task06 Phase 5〜12 の成果物が最新であること。

### 3.2 依存タスク

- TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001（完了）

### 3.3 必要な知識

- Electron IPC 契約設計
- P32/P42/P44

### 3.4 推奨アプローチ

1. 現在の RAG state データフローをコードから抽出。
2. チャンネル契約を型レベルで先に定義。
3. system spec と task-workflow backlog を同一ターンで同期。

## 4. 実行手順

1. `rg -n "rag:get-state|rag:set-state|rag:on-state-changed" apps/desktop/src` で実装実体を確認。
2. `api-ipc-system-core.md` へ契約表を追加。
3. Task06 `outputs/phase-2/contract-matrix.md` とリンク整合を確認。

## 5. 完了条件チェックリスト

- [ ] RAG state IPC の request/response/event が仕様化されている
- [ ] Main/Preload/Renderer の呼称が一致している
- [ ] 関連リンクが切れていない

## 6. 検証方法

- `rg -n "rag:get-state|rag:set-state|rag:on-state-changed" .claude/skills/aiworkflow-requirements/references`
- `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`

## 7. リスクと対策

| リスク                           | 影響度 | 発生確率 | 対策                       |
| -------------------------------- | ------ | -------- | -------------------------- |
| 呼称揺れ（rag/ragState）         | 中     | 中       | 命名を一覧表で固定         |
| 仕様だけ更新して実装が追随しない | 高     | 低       | Phase 9 IPC チェックへ追加 |

## 8. 参照情報

- `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-par-task-06-main-chat-settings-runtime-sync/outputs/phase-2/contract-matrix.md`
- `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`

## 9. 備考

Task06 の DI-0002 から formalize。Phase 12 で登録済み。
