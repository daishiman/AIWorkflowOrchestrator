# Phase 12: スキルフィードバック報告

## メタ情報

| 項目     | 内容                                       |
| -------- | ------------------------------------------ |
| Phase    | 12                                         |
| 機能名   | Main Chat / Settings runtime 同期          |
| タスクID | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 |
| 成果物   | skill-feedback-report.md                   |
| 作成日   | 2026-03-17                                 |

---

## 1. ワークフロー改善点

### 1.1 Phase 3 MINOR から Phase 12 未タスクへの追跡フロー

**問題**: Phase 3 で指摘した MINOR 指摘（MINOR-01〜03）が Phase 12 の未タスク検出まで追跡されず、Phase 10 最終レビューで再度同じ内容が MINOR 指摘として登場した。

**改善提案**: Phase 3 の MINOR 指摘は即時に未タスク候補として `artifacts.json` に記録し、Phase 12 で「既存 MINOR の3ステップ完了確認」を必須ステップとして追加する。

**効果**: Phase 10 で MINOR を「再発見」する無駄な工数を削減できる。

### 1.2 IPC 契約ドリフト検出の自動化

**問題**: GAP/DRIFT の多くが IPC 契約のドリフト（P44/P45 パターン）に起因しており、人手の確認に頼っているため見逃しが発生しやすい。

**改善提案**: Phase 9 の QA チェックリストに IPC 契約の自動検証スクリプト（`check-ipc-contracts.ts`）の実行を組み込む。このスクリプトは：

1. Main Process ハンドラの引数型定義を読み取る
2. Preload API の呼び出しパターンを読み取る
3. 両者の形式が一致しているか検証する

**効果**: P44/P45 パターンの再発を CI で自動検出できる。

### 1.3 health check 統一のような破壊的変更の段階的移行

**問題**: `AI_CHECK_CONNECTION` の廃止は破壊的変更であり、Renderer 側のすべての参照箇所を一括で変更する必要があった。並列エージェントで作業する場合に競合が発生しやすい。

**改善提案**: 破壊的変更は Phase 8（リファクタリング）で段階的移行計画を立て、以下の順序で実施する：

1. 廃止予定の API に `@deprecated` タグを追加
2. 新 API と旧 API を並存させる移行期間を設ける
3. 旧 API の参照をすべて移行してから削除する

**効果**: 並列エージェントが旧 API を誤って使用し続けるリスクを低減できる。

---

## 2. task-specification-creator への改善提案

### 提案 T-01: MINOR 指摘の自動未タスク候補化

| 項目   | 内容                                                                                |
| ------ | ----------------------------------------------------------------------------------- |
| 対象   | Phase 3 設計レビュー仕様書テンプレート                                              |
| 問題   | MINOR 指摘が「Phase N で対応」としか記載されず、追跡が途切れやすい                  |
| 改善   | Phase 3 のテンプレートに「MINOR 指摘を UT-TASK-xxx として登録する」セクションを追加 |
| 優先度 | 中                                                                                  |

### 提案 T-02: IPC 契約チェックリストの Phase 9 統合

| 項目   | 内容                                                                                 |
| ------ | ------------------------------------------------------------------------------------ |
| 対象   | Phase 9 品質検証仕様書テンプレート                                                   |
| 問題   | `ipc-contract-checklist.md` は IPC 修正タスクにしか適用されない（Phase 3 ルール）    |
| 改善   | Phase 9 の QA チェックリストに「IPC 契約ドリフト確認（Phase 9 標準チェック）」を追加 |
| 優先度 | 高                                                                                   |

### 提案 T-03: authMode 語彙統一のような横断的変更の影響範囲テンプレート

| 項目   | 内容                                                                                         |
| ------ | -------------------------------------------------------------------------------------------- |
| 対象   | Phase 2 設計仕様書テンプレート                                                               |
| 問題   | `auto/ask/deny` → `ready/blocked/unavailable` のような語彙変更は影響範囲が広く見落としが発生 |
| 改善   | Phase 2 テンプレートに「語彙変更の影響ファイル一覧」セクションを追加（grep コマンド例付き）  |
| 優先度 | 低                                                                                           |

---

## 3. aiworkflow-requirements への改善提案

### 提案 A-01: health check 統一パターン（S32）の新規追加

| 項目   | 内容                                                                                     |
| ------ | ---------------------------------------------------------------------------------------- |
| 対象   | `aiworkflow-requirements/references/architecture-implementation-patterns.md`             |
| 問題   | health check の二重経路問題（DRIFT-4）が既知パターンとして記録されていない               |
| 改善   | S32 として「Health Check 統一パターン」を追加：単一 IPC チャンネルでの health check 実装 |
| 優先度 | 中                                                                                       |

**追加内容案**:

```markdown
### S32: Health Check 統一パターン

**問題**: health check の呼び出し経路が複数存在すると、結果の整合性が取れなくなる。

**解決策**: `llm:check-health` の単一チャンネルのみを使用し、Renderer 側の全コンポーネントがこのチャンネルを通じて health 状態を取得する。

**実装例**:

- llmSlice に `healthStatus: Record<LLMProviderId, HealthStatus>` を管理
- `llm:check-health` の結果を onModeChanged イベントで全コンポーネントに伝播
```

### 提案 A-02: DEFAULT_CONFIG fallback 禁止パターン（P62）の新規追加

| 項目   | 内容                                                                               |
| ------ | ---------------------------------------------------------------------------------- |
| 対象   | `aiworkflow-requirements/references/06-known-pitfalls.md`                          |
| 問題   | `DEFAULT_CONFIG` への暗黙 fallback（GAP-03）が既知の落とし穴として記録されていない |
| 改善   | P62 として「DEFAULT_CONFIG への暗黙 fallback 禁止」を追加                          |
| 優先度 | 中                                                                                 |

**追加内容案**:

```markdown
### P62: DEFAULT_CONFIG への暗黙 fallback（GAP-03 パターン）

- **教訓**: Provider/Model が未選択の場合に `DEFAULT_CONFIG` へ fallback すると、ユーザーが意図しない
  AI モデルでリクエストが送信される。
- **症状**: AI から予期しないレスポンスが返る、または本番環境と開発環境で動作が異なる。
- **解決策**: Provider/Model が未選択の場合はエラー表示またはセレクター画面へのリダイレクト。
  fallback は一切行わない。
```

### 提案 A-03: RAG state Main authority パターン（S33）の新規追加

| 項目   | 内容                                                                                  |
| ------ | ------------------------------------------------------------------------------------- |
| 対象   | `aiworkflow-requirements/references/architecture-implementation-patterns.md`          |
| 問題   | RAG state のようなクロスコンポーネント状態の authority 設計パターンが記録されていない |
| 改善   | S33 として「クロスコンポーネント状態の Main authority パターン」を追加                |
| 優先度 | 低                                                                                    |
