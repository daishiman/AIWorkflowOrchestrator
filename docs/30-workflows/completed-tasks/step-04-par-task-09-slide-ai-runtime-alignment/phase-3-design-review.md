# Phase 3: 設計レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 3                                       |
| Phase名    | 設計レビュー                            |
| タスクID   | TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001 |
| 前提Phase  | Phase 1（要件定義）、Phase 2（設計）    |
| 後続Phase  | Phase 4（テスト作成）                   |
| ステータス | completed                               |
| 作成日     | 2026-03-13                              |
| 更新日     | 2026-03-19                              |
| 機能名     | slide-ai-runtime-alignment              |

## 目的

Slide / Modifier / Legacy Agent の統一設計が安全に適用できるか多角的にレビューし、Phase 4 への gate 判定を行う。

## 実行タスク

- T-3-1 レビュー実施: PASS / MINOR / MAJOR の判定根拠を整理し、Phase 4 進行可否を決める

### T-3-1: レビュー実施

レビュー観点に沿って PASS、MINOR、MAJOR の判定根拠を整理する。

## レビュー観点

### 観点 1: Direct SDK / Silent Fallback 排除の完全性

| チェック項目                                                      | 判定基準                                                                  |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `@anthropic-ai/sdk` 直 import が設計上残らないか                  | agent-client.ts 廃止後に slide 配下で direct import が 0 件               |
| electron-store 直読みが設計上残らないか                           | IAuthKeyService 以外の API key 取得経路が 0 件                            |
| `process.env.ANTHROPIC_API_KEY` の silent fallback が排除されるか | env fallback を残さず、未設定/無効時は handoff または明示エラーに分岐する |
| コメントと実態の乖離が解消されるか                                | 「シミュレーション実装」コメントが削除対象として明記されている            |

### 観点 2: Internal Role の UI 非露出

| チェック項目                                                        | 判定基準                                                             |
| ------------------------------------------------------------------- | -------------------------------------------------------------------- |
| watcher / modifier / reverse-sync が UI mode 切替として露出しないか | SlideWorkspace の CTA が user-facing 操作のみ                        |
| internal orchestration が Renderer から直接呼び出されないか         | IPC 経由でのみアクセスし、Renderer が SyncManager 等を直接参照しない |

### 観点 3: Reverse-sync / Watcher / Sync Status の Authority 保全

| チェック項目                                                | 判定基準                                                                    |
| ----------------------------------------------------------- | --------------------------------------------------------------------------- |
| reverse-sync の authority が SyncManager に集約されているか | 複数箇所から sync status を直接変更するパスが存在しない                     |
| watch-start/stop lifecycle が明確か                         | FileWatcher の start/stop 条件が曖昧でない                                  |
| sync status push が Renderer まで到達するか                 | Main → IPC → Renderer (Zustand slideSlice) の push 経路が設計されている     |
| onHtmlChange 未接続問題が設計で解消されるか                 | file-watcher → sync-manager → integrated runtime の自動パスが明記されている |

### 観点 4: IPC セキュリティ

| チェック項目                                                 | 判定基準                                                               |
| ------------------------------------------------------------ | ---------------------------------------------------------------------- |
| 全 slide IPC ハンドラに validateIpcSender が設計されているか | 0 件の漏れなし                                                         |
| projectPath に P42 準拠 3 段バリデーションが設計されているか | 型チェック → 空文字列 → トリム空文字列                                 |
| パストラバーサル検出が設計されているか                       | detectPathTraversal() の適用が明記されている                           |
| Preload whitelist に slide チャネルが登録されているか        | ALLOWED_INVOKE_CHANNELS / ALLOWED_ON_CHANNELS への追加が明記されている |

### 観点 5: UI/UX 整合性

| チェック項目                                                        | 判定基準                                                        |
| ------------------------------------------------------------------- | --------------------------------------------------------------- |
| ui-ux-realization.md の 4 状態が全て設計に含まれるか                | synced / running / degraded / guidance の UI 設計が存在         |
| degraded 時のマイクロコピーが「回復導線の同居」原則に準拠しているか | 失敗理由と次アクションが同一ブロックに配置されている            |
| Persistent Terminal Launcher が SlideWorkspace に配置されているか   | header / panel header / composer 近傍の固定導線が設計されている |

### 観点 6: Cross-task 契約の整合

| チェック項目                                                     | 判定基準                                                  |
| ---------------------------------------------------------------- | --------------------------------------------------------- |
| Task01 の RuntimeResolver / access matrix を正しく参照しているか | local 判定を増やさず Task01 の共通基盤を消費している      |
| skill-lifecycle Task03 が同じ契約を参照できるか                  | SkillExecutor の execute 契約が共通インターフェースである |
| IPC チャネル名が正本仕様と統一されているか                       | 4 チャネルの rename が明記されている                      |

### 観点 7: Zustand State 設計

| チェック項目                                          | 判定基準                                                                  |
| ----------------------------------------------------- | ------------------------------------------------------------------------- |
| slideSlice が P31（無限ループ）リスクを回避しているか | 個別セレクタ使用、合成 Hook 非使用                                        |
| P48（useShallow 未適用）リスクがないか                | `.filter()` / `.map()` 等の派生セレクタに `useShallow` が適用される設計か |
| useSlideProject の依存配列が安全か                    | store オブジェクト全体ではなく個別プロパティに依存する設計か              |

## レビューゲート

設計レビュー の判定基準は `.claude/skills/task-specification-creator/references/review-gate-criteria.md` に従う。

| 判定  | 条件                     | 次のアクション         |
| ----- | ------------------------ | ---------------------- |
| PASS  | 重大な問題がない         | Phase 4 に進む         |
| MINOR | 軽微な指摘がある         | 指摘を記録して次へ進む |
| MAJOR | 戻り先が必要な問題がある | 下表の戻り先へ戻す     |

| 問題の種類 | 戻り先              |
| ---------- | ------------------- |
| 要件の問題 | Phase 1（要件定義） |
| 設計の問題 | Phase 2（設計）     |

### MINOR 追跡テーブル

Phase 3 で MINOR 判定された指摘は、以下のテーブルで追跡計画を明示する。

| MINOR ID  | 指摘内容                 | 解決予定 Phase | 解決確認 Phase | 備考 |
| --------- | ------------------------ | -------------- | -------------- | ---- |
| TECH-M-01 | （Phase 3 実行時に記入） | Phase 5/8      | Phase 9/10     | —    |

### Simpler Alternative 検討

以下の代替案を検討し、結果を記録する:

| 代替案                                                                | メリット         | デメリット                               | 採否                     |
| --------------------------------------------------------------------- | ---------------- | ---------------------------------------- | ------------------------ |
| agent-client.ts を修正して IAuthKeyService に差し替える（廃止しない） | 変更範囲が小さい | Direct SDK import が残る、責務境界が曖昧 | （Phase 3 実行時に判定） |
| slide 系を全て新規実装する                                            | クリーンな設計   | 工数が大きい、既存テストの廃棄           | （Phase 3 実行時に判定） |
| IPC チャネル名を現行のまま維持する                                    | 変更なし         | 正本仕様との乖離が残る                   | （Phase 3 実行時に判定） |

## 参照資料

| 参照資料             | パス                                                 | 内容                                                  |
| -------------------- | ---------------------------------------------------- | ----------------------------------------------------- |
| Phase 1（要件定義）  | `phase-1-requirements.md`                            | 依存する前提成果物を確認する                          |
| Phase 2（設計）      | `phase-2-design.md`                                  | 依存する前提成果物を確認する                          |
| slide skill-executor | `apps/desktop/src/main/slide/skill-executor.ts`      | slide skill execute の current path を確認する        |
| slide agent-client   | `apps/desktop/src/main/slide/agent-client.ts`        | legacy agent client の current path を確認する        |
| SlideWorkspace       | `apps/desktop/src/renderer/slide/SlideWorkspace.tsx` | slide renderer surface と reverse-sync 導線を確認する |

### システム仕様（aiworkflow-requirements）

> 完全な canonical set は `index.md` を正本とし、この Phase では「レビュー判定に使う根拠」だけを重点確認する。

| 参照資料                        | パス                                                                                            | 内容                                                      |
| ------------------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| workflow-ai-runtime-authmode    | `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md` | foundation 契約と canonical set の正本                    |
| api-ipc-system                  | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                           | slide IPC 契約の正本                                      |
| interfaces-auth                 | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`                          | capability / auth-mode transport の正本                   |
| llm-ipc-types                   | `.claude/skills/aiworkflow-requirements/references/llm-ipc-types.md`                            | runtime health / auth-mode transport DTO の正本           |
| llm-workspace-chat-edit         | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`                  | RuntimeResolver / handoff 再利用元                        |
| api-ipc-agent-core              | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-core.md`                       | `handoff` / `guidance` / `AUTHENTICATION_ERROR` transport |
| security-electron-ipc-core      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md`               | sender / auth-mode / secret 境界の正本                    |
| arch-state-management-reference | `.claude/skills/aiworkflow-requirements/references/arch-state-management-reference.md`          | handoffGuidance / stale state 防止 / dismiss 契約の正本   |
| ui-ux-feature-components        | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                 | guidance / error / CTA surface の正本                     |

## 実行手順

### ステップ1: Phase 1 / Phase 2 の成果物を読み込む

Phase 1 の `requirements-definition.md` / `scope-definition.md` と Phase 2 の `design-summary.md` / `contract-matrix.md` / `ui-ux-realization.md` を入力とする。

### ステップ2: 7 観点でレビューを実施する

各観点のチェック項目を1つずつ判定し、PASS / MINOR / MAJOR を記録する。

### ステップ3: MINOR 追跡テーブルを作成する

MINOR 指摘がある場合、解決予定 Phase と解決確認 Phase を設定する。

### ステップ4: Simpler Alternative を検討する

3 つの代替案を検討し、採否を判定する。

### ステップ5: gate 判定を行う

全観点の結果を集約し、最終的な gate 判定（PASS / MINOR / MAJOR）を決定する。

### ステップ6: 成果物と完了条件を確認する

成果物パス、完了条件チェックリスト、Phase 4 への handoff 情報を確認して記録する。

## 統合テスト連携

reverse-sync、watcher、guidance、streaming feedback、sync status の設計が Phase 1 と Phase 2 に整合するかをレビューする。

| 統合テスト観点            | レビュー確認事項                                                                      |
| ------------------------- | ------------------------------------------------------------------------------------- |
| reverse-sync 自動トリガー | onHtmlChange → SyncManager → SkillExecutor の自動パスが設計に含まれているか           |
| runtime 分岐テスト        | integrated / handoff の両方のテストシナリオが Phase 4 で定義可能か                    |
| IPC セキュリティテスト    | validateIpcSender / バリデーション / パストラバーサル検出のテストシナリオが定義可能か |

## 多角的チェック観点

| 観点             | 適用判断               | チェック項目                                                                                       |
| ---------------- | ---------------------- | -------------------------------------------------------------------------------------------------- |
| セキュリティ     | IPC 設計レビュー       | 全 slide チャネルの sender 検証 + バリデーションが漏れなく設計されているか                         |
| アーキテクチャ   | DI 設計レビュー        | SkillExecutor / SyncManager / FileWatcher の DI 境界が Port/Interface に依存しているか（P61 対策） |
| UI/UX            | Slide surface レビュー | 4 状態の UI が ui-ux-realization.md と完全に整合しているか                                         |
| State Management | Zustand slice レビュー | P31/P48 リスクが設計段階で回避されているか                                                         |

## サブタスク管理

Phase 実行開始時に、以下のサブタスクを作成すること:

1. Phase 1 / Phase 2 成果物の読み込み
2. 7 観点でのレビュー実施
3. MINOR 追跡テーブル作成
4. Simpler Alternative 検討
5. Gate 判定
6. 成果物の作成・配置

## 成果物

| 成果物           | パス                                      | 内容                                                                                                      |
| ---------------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 設計レビュー報告 | `outputs/phase-3/design-review-report.md` | 7 観点の PASS/MINOR/MAJOR 判定根拠、MINOR 追跡テーブル、Simpler Alternative 検討結果、gate 判定を記録する |

## 完了条件

- [ ] 7 観点の全チェック項目に判定結果が記録されている
- [ ] MAJOR 指摘 0 件
- [ ] MINOR 指摘がある場合、追跡テーブルに解決予定 Phase が記入されている
- [ ] Simpler Alternative の検討結果が記録されている
- [ ] skill-lifecycle Task03 に handoff できる設計になっている
- [ ] Phase 4 開始条件が明記されている
- [ ] Phase 13 blocked 条件が明記されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## タスク 100% 実行確認【必須】

Phase 完了前に以下を確認:

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを 100% 完了し、完了を明記している

## 次の Phase

- [Phase 4（テスト作成）](./phase-4-test-creation.md) に進む
- Phase 1-3 完了前に Phase 4 へ進まないこと
