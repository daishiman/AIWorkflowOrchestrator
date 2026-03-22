# Phase 1: 要件定義書

## メタ情報

| 項目     | 内容                                              |
| -------- | ------------------------------------------------- |
| タスクID | TASK-IMP-TERMINAL-HANDOFF-SURFACE-REALIZATION-001 |
| Phase    | 1                                                 |
| 作成日   | 2026-03-22                                        |

## 1. 機能要件（FR）

### FR-1: Persistent Terminal Launcher

全 mainline surface で常時表示される terminal launcher の統一仕様。

| 項目         | 仕様                                        |
| ------------ | ------------------------------------------- |
| ラベル       | 「terminal を開く」（統一、別名禁止）       |
| アイコン     | Terminal icon（`terminal.fill` 相当）       |
| click 動作   | TerminalDock を `collapsed` → `idle` へ遷移 |
| 再入可能     | 既に `idle` でも click で focus             |
| session 保持 | dock を閉じても session 履歴保持            |
| 配置         | App Shell Header 右上（全 surface 共通）    |

### FR-2: Shared Handoff Card

integrated 実行不可時に表示する統一 UI 要素。全 consumer が同一 DTO（`HandoffGuidance`）を使用する。

| 必須要素          | 内容                                 |
| ----------------- | ------------------------------------ |
| Context Summary   | ここまでの文脈の簡潔な要約           |
| Suggested Command | terminal で実行推奨の CLI コマンド例 |
| Copy Action       | suggested command のコピーボタン     |

**表示条件**: `handoffGuidance != null`
**位置**: 入力欄の上（AgentExecutionControls との間）
**保持期間**: dismiss するまで表示継続（ユーザー主導で消去）

### FR-3: Guidance-Only Consumer 統一

Skill Docs を含む guidance-only consumer が同一 `SkillDocsCapabilityResult` DTO を使う設計。

| capability         | 意味                       | 次アクション           |
| ------------------ | -------------------------- | ---------------------- |
| `integrated-api`   | API key 有効・LLM 到達可能 | 自動実行               |
| `guidance-only`    | API key 未設定             | 設定案内・docs 表示    |
| `terminal-handoff` | API key 有効・LLM 到達不可 | terminal launcher 提示 |

### FR-4: Context Summary 生成

`TerminalHandoffBuilder.buildContextSummary()` が以下を含む:

- basename（対象ファイル）
- 選択行範囲（選択がある場合）
- コマンドタイプ（refactor, generate-test 等）
- workspace 名

### FR-5: 許容操作の定義

| 操作                   | 許否   | 詳細                                               |
| ---------------------- | ------ | -------------------------------------------------- |
| Copy Command           | 許容   | terminalCommand をクリップボード複製               |
| Copy Context           | 許容   | contextSummary をクリップボード複製                |
| Open Working Directory | 要検討 | セキュリティリスク評価後に判断（後続タスク化候補） |
| Auto-send to Terminal  | 禁止   | terminal へのコマンド自動送信は禁止                |
| Hidden Injection       | 禁止   | 不可視のプロンプト注入は禁止                       |

## 2. 非機能要件（NFR）

### NFR-1: セキュリティ - Manual Boundary 4 層防御

| 層            | 責務                                     | 実装                                       |
| ------------- | ---------------------------------------- | ------------------------------------------ |
| Policy        | capability / health / handoff DTO で判定 | HandoffGuidance DTO が terminal lane 指定  |
| UI            | launcher button の配置・命名を統一       | header に「terminal を開く」固定配置       |
| IPC           | Renderer が hidden invoke をしない       | Preload whitelist に launcher action のみ  |
| Documentation | codepath に「user-operated」comment      | skill-creator lane との対比で comment 追加 |

### NFR-2: パフォーマンス

- Handoff card の表示は 200ms 以内
- Launcher click → dock 遷移は 300ms 以内

### NFR-3: アクセシビリティ

- Launcher button にキーボードフォーカス可能
- Handoff card に ARIA ラベル付与
- Copy action にフィードバック表示

## 3. 受入基準（AC）の検証可能化

| AC-ID | 基準                                                                                          | 検証方法                                                                               |
| ----- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| AC-1  | persistent launcher と shared handoff card の UI 責務が定義されている                         | outputs/phase-2/design-summary.md に launcher 配置表と handoff card 仕様が存在すること |
| AC-2  | copy command / copy context / open working directory の許容操作が明示されている               | outputs/phase-2/contract-matrix.md に操作一覧と許否が表形式で定義されていること        |
| AC-3  | Skill Docs を含む guidance-only consumer が同一 DTO を使う設計になっている                    | outputs/phase-2/design-summary.md に DTO 統一図と consumer 一覧が存在すること          |
| AC-4  | manual-only boundary（auto-send 禁止・hidden injection 禁止）が screenshot 契約まで落ちている | outputs/phase-11/screenshot-plan.json に manual boundary 検証の TC-ID が存在すること   |

## 4. Phase 2 への論点（Concern）

| Concern ID | 内容                                            | Phase 2 での解決方針                             |
| ---------- | ----------------------------------------------- | ------------------------------------------------ |
| C-1        | guidance-only と terminal-only の意味差が曖昧   | concern 分解で明確に区別し、DTO で分岐条件を固定 |
| C-2        | Handoff Card の consumer ごとの UI drift リスク | 共通コンポーネント仕様で統一                     |
| C-3        | Open Working Directory の実装要否               | セキュリティリスク評価後に後続タスク化の判断     |

## 5. 統合テスト連携

| 統合ポイント     | 観点                                        | 後続 Phase |
| ---------------- | ------------------------------------------- | ---------- |
| UI state         | 5 状態の遷移が launcher click で正しく動作  | Phase 4/11 |
| IPC              | HandoffGuidance DTO の Preload 経由受け渡し | Phase 4/6  |
| Settings         | API key 未設定時の guidance-only 判定       | Phase 4/6  |
| Terminal handoff | copy command の secret-free 検証            | Phase 11   |
