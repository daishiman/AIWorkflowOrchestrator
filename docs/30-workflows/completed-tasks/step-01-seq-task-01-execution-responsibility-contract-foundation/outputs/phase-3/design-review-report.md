# Phase 3: 設計レビュー報告

## メタ情報

| 項目     | 内容                                                      |
| -------- | --------------------------------------------------------- |
| タスクID | TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001 |
| Phase    | 3                                                         |
| 作成日   | 2026-03-20                                                |

## 語彙 Drift レビュー

### 確認結果

`RuntimePolicyResolver.ts` における旧語彙の使用状況:

| 行  | 旧語彙                   | contract 要求語彙       | 種別         |
| --- | ------------------------ | ----------------------- | ------------ |
| L6  | `integrated_api`         | `integratedRuntime`     | コメント     |
| L6  | `terminal_handoff`       | `terminalSurface`       | コメント     |
| L33 | `"integrated_api"`       | `"integratedRuntime"`   | 型リテラル   |
| L38 | `"terminal_handoff"`     | `"terminalSurface"`     | 型リテラル   |
| L43 | `authMode: AuthMode`     | capability 入力         | パラメータ名 |
| L63 | `authMode === "api-key"` | capability 判定ロジック | 判定条件     |

`auth-mode.ts` における旧語彙の使用状況:

| 行   | 旧語彙     | contract 要求語彙     | 種別         |
| ---- | ---------- | --------------------- | ------------ |
| L422 | `authMode` | capability と共存可能 | ストアキー   |
| L435 | `authMode` | capability と共存可能 | スキーマ定義 |

### 判定

- 語彙差異: **6 件**（コア型定義 2 件 + パラメータ名 1 件 + 判定条件 1 件 + コメント 2 件）
- コア型定義の不整合: `"integrated_api"` / `"terminal_handoff"` が contract 要求の `"integratedRuntime"` / `"terminalSurface"` と異なる
- ただし本 Task01 は**設計タスク**であり、コード変更は Task02 以降で行う。語彙差異は「Phase 2 の gap-capability GAP-C-3 として既に記録済み」であり、設計文書としての語彙は contract-matrix で正規化済み
- **判定: PASS**（設計文書上の語彙は統一済み。コード上の語彙変更は Task02 のスコープ）

## State Drift レビュー

### contract-matrix 全セル確認

| capability        | UI state    | primary CTA      | secondary CTA      | 矛盾 |
| ----------------- | ----------- | ---------------- | ------------------ | ---- |
| integratedRuntime | ready       | AI で実行        | 設定を開く         | なし |
| integratedRuntime | blocked     | 設定を修正       | ヘルプを表示       | なし |
| terminalSurface   | ready       | ターミナルで実行 | コマンドをコピー   | なし |
| terminalSurface   | blocked     | 設定を修正       | ヘルプを表示       | なし |
| both              | ready       | AI で実行        | ターミナルで実行   | なし |
| both              | blocked     | 設定を修正       | ターミナルで実行   | なし |
| none              | blocked     | 設定を開く       | ヘルプを表示       | なし |
| none              | unavailable | （非表示）       | セットアップガイド | なし |

### チェック項目

1. capability = integratedRuntime / terminalSurface のとき、UI state が `ready` になるか: contract-matrix 通り
2. capability = none のとき、UI state が `unavailable` になるか: contract-matrix では `blocked`（解決 action あり）と `unavailable`（なし）の 2 行
3. capability = both のとき、UI state が `ready` であり `blocked` にならないか: ready 行と blocked 行の両方が存在し、補助条件で分岐
4. blocked セルに理由テキストと解決 action が定義されているか: 全 blocked セルに guidance action あり

### 判定

- 矛盾: **0 件**
- **判定: PASS**

## Simpler Alternative 再確認

### Alternative A（2 状態簡素化）

- Phase 2 棄却理由: `both` / `none` が消えると接続断・キー未入力の表現ができない
- Phase 3 再確認: 棄却理由は**有効**。contract-matrix に `both` と `none` の行が存在し、テストケース（CA-3, CA-4, CB-4, CB-5, CC-4, CC-5）が定義される予定
- 親パック整合: 親パック index の「capability 4 状態」方針と一致
- **判定: PASS**（棄却理由が有効であり親パックと整合）

### Alternative B（CTA 統合）

- Phase 2 棄却理由: CTA ラベルを IPC contract に含めると Concern A の ownership が破壊される
- Phase 3 再確認: 棄却理由は**有効**。CTA ラベルは UI 層の責務であり、i18n / A/B test 対象
- 親パック整合: 親 UI/UX 正本の「UI 部品の責務分離」表と一致（Settings/Shell は capability と next action の説明のみ、CTA 文言は Renderer 層）
- **判定: PASS**（棄却理由が有効であり親パックと整合）

## 親パック整合確認

### 確認項目

1. **concern 分離方針との矛盾**: Task01 の 3 concern（A: capability / B: state / C: CTA）は、親パックの「契約基盤 / policy authority / mainline UI / terminal / review harness / legacy / governance」分離と矛盾しない。Task01 は Foundation lane の一部であり、Concern A-C は全て contract foundation の内部分解
2. **依存関係の正確性**: Task02 以降が Task01 の canonical doc set を参照する依存が正しい。contract-matrix と validation-matrix が正本として定義済み
3. **禁止事項の反映**: 親パックの「silent fallback / auto-send / hidden prompt injection」禁止が FR-4 に正確に反映されている

### 判定

- 親パックとの矛盾: **0 件**
- **判定: PASS**

## 最終判定

| 方向         | 結果 | 詳細                                                      |
| ------------ | ---- | --------------------------------------------------------- |
| 語彙 drift   | PASS | コード上の旧語彙は gap として記録済み。設計文書は統一済み |
| state drift  | PASS | contract-matrix の全セルに矛盾なし                        |
| simpler alt  | PASS | Alternative A / B とも棄却理由が有効かつ親パックと整合    |
| 親パック整合 | PASS | concern 分離・依存関係・禁止事項の全てが親パックと一致    |

**総合判定: PASS** - Phase 4 へ進む
