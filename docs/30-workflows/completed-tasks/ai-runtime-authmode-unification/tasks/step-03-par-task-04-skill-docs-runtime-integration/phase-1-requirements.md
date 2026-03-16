# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| Phase      | 1                                  |
| Phase名    | 要件定義                           |
| タスクID   | TASK-IMP-SKILL-DOCS-AI-RUNTIME-001 |
| 前提Phase  | なし                               |
| 後続Phase  | Phase 2（設計）                    |
| ステータス | completed                          |
| 作成日     | 2026-03-13                         |
| 更新日     | 2026-03-16                         |
| 機能名     | skill-docs-runtime-integration     |

## 目的

Skill Docs 生成の現状 stub 経路を棚卸しし、Integrated API Runtime 接続と Terminal Handoff の要件を確定する。

## 前提条件

- Task01（Access Matrix Foundation）の Phase 3 ゲートが PASS していること
- Task02（Claude Code Terminal Surface）の Phase 2 が完了していること
- TASK-9I（Skill Docs 基盤）が完了済みであること（2026-02-28 完了、64テスト全PASS）

## 実行タスク

### T-1-1: stubQueryFn の現状棚卸し

SkillDocGenerator の DI 経路を確認し、stub の影響範囲を明文化する。

- SkillDocGenerator.ts の Constructor Injection パターンを確認する
  - `queryFn: LLMQueryFn = (prompt: string) => Promise<{ content: string }>` が現在の型
  - 本番は固定値疑似応答のみを返す（TASK-9I Phase 10 の MINOR 指摘が残存）
- registerAllIpcHandlers() での DI 注入経路を確認する
  - Pattern 3 登録: `registerSkillDocsHandlers(mainWindow, skillDocGenerator)` で一元管理
- stub が使用される 4 つの IPC チャンネルを特定する
  - `skill:docs:generate` / `skill:docs:preview` / `skill:docs:export` / `skill:docs:templates`

### T-1-2: Integrated API Runtime 要件の整理

production 経路で必要な runtime 要件を定義する。

- LLM プロバイダの選定要件を定義する
  - 対象: Anthropic Claude / OpenAI GPT 等の API key ベースプロバイダ
  - consumer subscription token をアプリが取得・保存・利用しない（Task01 禁止事項）
- API key 管理方式を定義する
  - Settings 画面での登録・検証フロー（Task06 と連携）
  - API key 未設定時の fail-fast 要件（silent fallback 禁止）
- queryFn 置換の要件を定義する
  - stub → real LLM client への差し替え境界
  - UT-9I-001（LLM プロバイダ連携）との責務境界を明確化

### T-1-3: Terminal Handoff 要件の整理

Integrated API Runtime が使えない場合の handoff 要件を定義する。

- docs 生成失敗時の 3 経路を定義する
  - `timeout`（30秒超過）: guidance + retry + terminal handoff を同ブロックに表示
  - `missing credentials`（API key 未設定）: guidance block で設定画面への導線を表示
  - `rate limit`（429 応答）: 待機時間と再試行ボタンを表示
- terminal handoff の境界を定義する
  - アプリは terminal 用の prompt context と suggested command を提供する
  - アプリが terminal へ自動コマンド送信・自動プロンプト注入をしない（Task01 禁止事項）
  - copy context / open working directory は許可するが実行はユーザー操作に限定する

### T-1-4: Access Matrix 適用要件の整理

Task01 の Access Matrix を Skill Docs surface に適用する要件を定義する。

- Skill Docs の Access Path を 3 経路で定義する
  - `integrated-api`: API key 有効 → docs 生成実行（timeout 付き）
  - `guidance-only`: API key 未設定 → guidance block 表示（terminal handoff 導線あり）
  - `terminal-handoff`: 生成失敗時 → terminal での手動作成を招待
- Capability Resolver の判定要件を定義する
  - Main Process で完結し Renderer 依存を増やさない
  - 各 surface 独自の mode 判定を持たず Task01 の access matrix を消費する

### T-1-5: エラー分類と非機能要件の整理

エラーハンドリングと SLA 要件を定義する。

- エラー分類コード体系を定義する（02-code-quality.md 準拠）
  - Validation Error (1000-1999): 入力不正（skillName 空、format 不正）
  - Business Error (2000-2999): 生成不可（テンプレート未発見）
  - External Service Error (3000-3999): LLM API エラー（429, 5xx）→ リトライ可能
  - Infrastructure Error (4000-4999): IPC 通信エラー → リトライ可能
  - Internal Error (5000-5999): 予期しないエラー
- 非機能要件を定義する
  - timeout: 30 秒（既存 Promise.race 実装を維持）
  - retry: External Service Error に限り最大 2 回（exponential backoff）
  - rate limit: 429 応答時は Retry-After ヘッダに従い待機

## 参照資料

| 参照資料                             | パス                                                                                                              | 内容                                                    |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| SkillDocGenerator                    | `apps/desktop/src/main/services/skill/SkillDocGenerator.ts`                                                       | docs 生成本体、stubQueryFn の DI 経路を確認する         |
| ipc index                            | `apps/desktop/src/main/ipc/index.ts`                                                                              | registerSkillDocsHandlers の DI current path を確認する |
| task UT-9I-001                       | `docs/30-workflows/completed-tasks/TASK-9I-skill-docs/unassigned-task/task-ut-9i-001-llm-provider-integration.md` | 既存 stub 排除タスクの要件を確認する                    |
| task UT-9I-002                       | `docs/30-workflows/completed-tasks/TASK-9I-skill-docs/unassigned-task/task-ut-9i-002-template-crud.md`            | テンプレート CRUD タスクの要件を確認する                |
| Task01 foundation investigation      | `docs/30-workflows/TASK-FIX-SKILL-DOCS-SPEC-FOUNDATION/task-05-phase-1-3-source-investigation-report.md`          | access matrix / resolver / fail-fast の現行調査結果     |
| Task01 settings review investigation | `docs/30-workflows/TASK-FIX-SKILL-DOCS-SPEC-FOUNDATION/task-05-phase-1-3-source-investigation-report.md`          | 設定画面レビュー結果（TC-11-00 相当）                   |
| pack parent index                    | `docs/30-workflows/ai-runtime-authmode-unification/index.md`                                                      | 実行順序、依存グラフ、共通方針の正本                    |
| pack design audit                    | `docs/30-workflows/ai-runtime-authmode-unification/design-audit-matrix.md`                                        | 多角的監査の結論、禁止事項                              |
| pack UI/UX 正本                      | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-realization.md`                                          | 全 surface 共通の状態、CTA、microcopy 契約              |
| pack UI/UX 図解                      | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-diagrams.md`                                             | 5 図セットの画面構成、状態遷移                          |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                                 | パス                                                                                                              | 内容                                                                       |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| api-ipc-agent                            | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-details.md`                                      | Skill Docs IPC 正本（4 チャンネル契約）                                    |
| architecture-overview                    | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                                      | registerSkillDocsHandlers の Pattern 3 構成                                |
| interfaces-agent-sdk-skill               | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference-share-debug-analytics.md` | DocGenerationRequest / GeneratedDoc 型定義正本                             |
| security-electron-ipc                    | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-advanced.md`                             | 4 層検証（sender / P42 / 入力制約 / エラー境界）                           |
| workflow-ai-runtime-authmode-unification | `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md`                   | `Integrated API Runtime` と `Claude Code Terminal Surface` の責務分離正本  |
| ui-ux-settings                           | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                                             | 設定画面3領域（認証方式/APIキー入力/APIキー一覧）の表示契約                |
| interfaces-auth                          | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`                                            | capability 基盤（integratedRuntime / terminalSurface / both / none）型契約 |
| api-ipc-system                           | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                                             | runtime 解決経路と settings 反映 IPC 契約                                  |
| legacy-ordinal-family-register           | `.claude/skills/aiworkflow-requirements/references/legacy-ordinal-family-register.md`                             | 旧 filename 互換の台帳（artifact inventory の逆引き）                      |
| task-workflow                            | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                              | TASK-9I 完了履歴と UT-9I-001/002 未タスク正本                              |

## 実行手順

### ステップ1: 参照資料を確認する

Task01 Phase 3 ゲート結果と TASK-9I 完了履歴を確認し、Skill Docs 生成の前提条件を固定する。特に access matrix の 4 path 定義と stubQueryFn の DI 経路を把握する。

### ステップ2: 実行タスクを T-1-1 から T-1-5 まで順に実施する

要件定義の 5 タスクを上から順に処理する。各タスクの出力を `requirements-definition.md` に反映する。

### ステップ3: system spec との整合を確認する

aiworkflow-requirements の正本と照合する。特に以下の整合を確認する:

- IPC 4 チャンネルの既存契約を壊さないこと
- DocGenerationRequest / GeneratedDoc の型定義との互換性
- 4 層セキュリティ検証の維持
- P42 準拠 3 段バリデーションの継続

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携

以下の接続要件を要件として明文化する:

- queryFn: stub → real LLM client 差し替え時の互換性
- provider adapter: API key 検証 → LLM クライアント初期化 → queryFn 注入の経路
- timeout: 30 秒 Promise.race の維持と timeout 後の guidance 表示
- retry: External Service Error (3000-3999) に限定した再試行ポリシー
- guidance: API key 未設定 / timeout / rate limit 各状態での表示内容

## 成果物

| 成果物       | パス                                         | 内容                                                       |
| ------------ | -------------------------------------------- | ---------------------------------------------------------- |
| 要件整理     | `outputs/phase-1/requirements-definition.md` | 5 タスクの要件、制約、受入基準を整理する                   |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 対象範囲（stub 排除、handoff）と除外範囲（CRUD）を明記する |

## 完了条件

- [ ] stubQueryFn の DI 経路と影響範囲が棚卸しされている
- [ ] Integrated API Runtime の LLM プロバイダ・API key 管理要件が定義されている
- [ ] Terminal Handoff の 3 経路（timeout / missing credentials / rate limit）が定義されている
- [ ] Access Matrix の Skill Docs 適用方針（3 path）が Task01 契約と整合している
- [ ] エラー分類コード体系が 02-code-quality.md の 5 カテゴリに準拠している
- [ ] consumer subscription をアプリ内自動実行に使わない制約が明文化されている
- [ ] UT-9I-001 との責務境界が明確になっている

## 既知の落とし穴（関連 Pitfall）

| Pitfall | 内容                                    | 本 Phase での対策                              |
| ------- | --------------------------------------- | ---------------------------------------------- |
| P23     | API 二重定義の型管理複雑性              | 型定義ファイルの一覧化と更新順序の決定         |
| P32     | 型定義の二箇所同時更新必須              | shared types と preload types の同時更新要件化 |
| P42     | 文字列引数の .trim() バリデーション漏れ | 3 段バリデーション継続を要件に含める           |
| P48     | non-null assertion による安全性偽装     | 実行時型検証を要件に含める                     |

## 次のPhase

- [Phase 2（設計）](./phase-2-design.md) に進む
