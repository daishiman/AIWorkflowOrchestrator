---
name: skill-creator
description: |
  スキルを作成・更新・プロンプト改善するためのメタスキル。
  **collaborative**モードでユーザーと対話しながら共創し、
  抽象的なアイデアから具体的な実装まで柔軟に対応する。
  **orchestrate**モードでタスクの実行エンジン（Claude Code / Codex / 連携）を選択。

  Anchors:
  • Continuous Delivery (Jez Humble) / 適用: 自動化パイプライン / 目的: 決定論的実行
  • The Lean Startup (Eric Ries) / 適用: Build-Measure-Learn / 目的: 反復改善
  • Domain-Driven Design (Eric Evans) / 適用: 戦略的設計・ユビキタス言語・Bounded Context / 目的: ドメイン構造の明確化
  • Clean Architecture (Robert C. Martin) / 適用: 依存関係ルール・層分離設計 / 目的: 変更に強い高精度スキル
  • Design Thinking (IDEO) / 適用: ユーザー中心設計 / 目的: 共感と共創

  Trigger:
  新規スキルの作成、既存スキルの更新、プロンプト改善を行う場合に使用。
  スキル作成, スキル更新, プロンプト改善, skill creation, skill update, improve prompt,
  Codexに任せて, assign codex, Codexで実行, GPTに依頼, 実行モード選択, どのAIを使う,
  IPC Bridge統一, API統一パターン, safeInvoke/safeOn, Preload API標準化
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - Task
  - AskUserQuestion
---

# Skill Creator

スキルを作成・更新・プロンプト改善するためのメタスキル。

## 設計原則

| 原則                    | 説明                                       |
| ----------------------- | ------------------------------------------ |
| **Problem First**       | 機能の前に本質的な問題を特定する           |
| **Collaborative First** | ユーザーとの対話を通じて要件を明確化       |
| Domain-Driven Design    | ドメイン構造を明確化し高精度な設計を導く   |
| Clean Architecture      | 層分離と依存関係ルールで変更に強い構造     |
| Script First            | 決定論的処理はスクリプトで実行（100%精度） |
| Progressive Disclosure  | 必要な時に必要なリソースのみ読み込み       |

## クイックスタート

| モード            | 用途                             | 開始方法                                        |
| ----------------- | -------------------------------- | ----------------------------------------------- |
| **collaborative** | ユーザー対話型スキル共創（推奨） | AskUserQuestionでインタビュー開始               |
| **orchestrate**   | 実行エンジン選択                 | AskUserQuestionでヒアリング開始                 |
| create            | 要件が明確な場合の新規作成       | `scripts/detect_mode.js --request "..."`        |
| update            | 既存スキル更新                   | `scripts/detect_mode.js --skill-path <path>`    |
| improve-prompt    | プロンプト改善                   | `scripts/analyze_prompt.js --skill-path <path>` |

---

## ワークフロー概要

### Collaborative モード（推奨）

```
Phase 0-0: 問題発見 → problem-definition.json
      ↓
Phase 0.5: ドメインモデリング → domain-model.json
      ↓
Phase 0-1〜0-8: インタビュー → interview-result.json
      ↓
リソース選択: select-resources.md → resource-selection.json
      ↓
Phase 1〜6: 分析 → 設計 → 構造計画 → 生成 → 検証
```

📖 [agents/discover-problem.md](.claude/skills/skill-creator/agents/discover-problem.md) — 根本原因分析
📖 [agents/model-domain.md](.claude/skills/skill-creator/agents/model-domain.md) — DDD/Clean Architecture
📖 [agents/interview-user.md](.claude/skills/skill-creator/agents/interview-user.md)
📖 [agents/select-resources.md](.claude/skills/skill-creator/agents/select-resources.md)

### Orchestrate モード

実行エンジン選択: `claude` | `codex` | `claude-to-codex`

📖 [references/execution-mode-guide.md](.claude/skills/skill-creator/references/execution-mode-guide.md)

---

## リソース一覧

| カテゴリ    | 詳細参照                     |
| ----------- | ---------------------------- |
| agents/     | [resource-map.md#agents]     |
| references/ | [resource-map.md#references] |
| scripts/    | [resource-map.md#scripts]    |
| assets/     | [resource-map.md#assets]     |
| schemas/    | [resource-map.md#schemas]    |

📖 [references/resource-map.md](.claude/skills/skill-creator/references/resource-map.md)

---

## 主要エントリポイント

| 用途                 | リソース                       |
| -------------------- | ------------------------------ |
| 問題発見             | agents/discover-problem.md     |
| ドメインモデリング   | agents/model-domain.md         |
| インタビュー         | agents/interview-user.md       |
| リソース選択         | agents/select-resources.md     |
| 要求分析             | agents/analyze-request.md      |
| スクリプト生成       | agents/design-script.md        |
| オーケストレーション | agents/design-orchestration.md |
| フィードバック記録   | scripts/log_usage.js           |

---

## 機能別ガイド

| 機能                       | 参照先                                      |
| -------------------------- | ------------------------------------------- |
| **問題発見フレームワーク** | references/problem-discovery-framework.md   |
| **ドメインモデリング**     | references/domain-modeling-guide.md         |
| **Clean Architecture**     | references/clean-architecture-for-skills.md |
| **スクリプト/LLM分担**     | references/script-llm-patterns.md           |
| スクリプト生成             | references/script-types-catalog.md          |
| ワークフローパターン       | references/workflow-patterns.md             |
| オーケストレーション       | references/orchestration-guide.md           |
| ドキュメント生成           | references/api-docs-standards.md            |
| 自己改善サイクル           | references/self-improvement-cycle.md        |
| ライブラリ管理             | references/library-management.md            |

---

## フィードバック（必須）

実行後は必ず記録：

```bash
node scripts/log_usage.js --result success --phase "Phase 4"
node scripts/log_usage.js --result failure --phase "Phase 3" --error "ValidationError"
```

---

## ベストプラクティス

| すべきこと                          | 避けるべきこと                |
| ----------------------------------- | ----------------------------- |
| 問題を先に特定する（Problem First） | 機能から設計を始める          |
| Core Domainに集中する               | 全体を均等に設計する          |
| Outcomeでゴール定義                 | Outputでゴール定義する        |
| Script優先（決定論的処理）          | 全リソースを一度に読み込む    |
| LLMは判断・創造のみ                 | Script可能な処理をLLMに任せる |
| Progressive Disclosure              | 具体例をテンプレートに書く    |

---

## 変更履歴

| Version    | Date           | Changes                                                                                                                                                                                                                                                                                                            |
| ---------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **8.10.0** | **2026-02-10** | **TASK-FIX-15-1パターン追加: patterns.mdに統合テストでの依存サービスモック漏れ防止パターン（P25）と入力バリデーション統一パターン（whitespace対策、P26）を追加**                                                                                                                                                   |
| **8.9.0**  | **2026-02-09** | **TASK-FIX-17-1パターン追加: patterns.mdにmockReturnValue vs mockReturnValueOnceテスト間リーク防止パターン追加。06-known-pitfalls.md#P23追加。aiworkflow-requirements/patterns.mdにも同パターン追加**                                                                                                              |
| **8.8.0**  | **2026-02-06** | **TASK-AUTH-CALLBACK-001パターン追加: patterns.mdにSupabase OAuth flowType設定、PKCE内部管理委任、ローカルHTTPサーバーコールバック受信の3成功パターン追加。失敗パターン5件（カスタムstate競合、Site URL未設定、Implicit Flow混同、code_verifier不足）追加。06-known-pitfalls.mdにP15-P18追加**                     |
| **8.7.0**  | **2026-02-06** | **TASK-FIX-5-1最適化: patterns.mdの3パターンにクロスリファレンス追加（architecture-implementation-patterns.md, 06-known-pitfalls.md連携）**                                                                                                                                                                        |
| **8.6.1**  | **2026-02-06** | **TASK-FIX-5-1パターン追加: patterns.mdにIPC Bridge API統一時のテストモック設計、セッション間仕様書編集永続化検証、Phase 1依存仕様書マトリクスの3パターン追加**                                                                                                                                                    |
| **8.6.0**  | **2026-02-06** | **TASK-AUTH-SESSION-REFRESH-001パターン追加: patterns.mdにSupabase SDK競合防止、setTimeout vs setInterval選択、vi.useFakeTimers+flushPromisesテスト、Callback DIテスタブル設計の4パターン追加。06-known-pitfalls.mdにP12(SDK競合)・P13(タイマーテスト無限ループ)追加**                                             |
| **8.5.0**  | **2026-02-05** | **TASK-FIX-GOOGLE-LOGIN-001パターン追加: patterns.mdにOAuthコールバックエラーパラメータ抽出、Zustandリスナー二重登録防止、IPC経由エラー情報伝達設計の3パターン追加**                                                                                                                                               |
| **8.4.0**  | **2026-02-05** | **TASK-FIX-4-1-IPC-CONSOLIDATIONパターン追加**: patterns.mdにIPCチャンネル統合パターン追加（ハードコード文字列発見、重複定義整理、ホワイトリスト更新漏れ検証）、aiworkflow-requirements連携更新                                                                                                                    |
| **8.3.0**  | **2026-02-04** | **AUTH-UI-001パターン追加: patterns.mdに既実装済み修正の発見、テスト環境問題切り分け、React Portal z-index解決、Supabase認証状態変更後即時UI更新の4パターン追加**                                                                                                                                                  |
| **8.2.0**  | **2026-02-02** | **E2Eテストパターン追加: patterns.mdにARIA属性ベースセレクタ、ヘルパー関数分離、安定性対策3層パターン追加（TASK-8C-B由来）**                                                                                                                                                                                       |
| 8.1.0      | 2026-01-30     | 構造リファクタリング: schemas追加（problem-definition.json, domain-model.json）、integration-patterns.md分割（1,171→70行+4サブファイル）、.tmpクリーンアップ、resource-map.md更新                                                                                                                                  |
| 8.0.0      | 2026-01-30     | Problem First + DDD/Clean Architecture統合: 問題発見Phase(0-0)・ドメインモデリングPhase(0.5)追加、discover-problem.md・model-domain.md新規エージェント、problem-discovery-framework.md・domain-modeling-guide.md・clean-architecture-for-skills.md新規リファレンス、Anchors更新（Clean Architecture追加・DDD拡張） |
| 7.2.0      | 2026-01-30     | 統合パターン集・Phase完了チェックリスト追加: integration-patterns.md, phase-completion-checklist.md新規作成、resource-map.md更新（成果物明確化セクション追加、統合契約パターンリンク）                                                                                                                             |
| 7.1.2      | 2026-01-28     | ハードコード数値を削除: 動的に変わるリソース数等の具体的数値を排除                                                                                                                                                                                                                                                 |
| 7.1.1      | 2026-01-28     | script-llm-patterns.mdリファクタリング: 責務分離明確化、関連リソース整理                                                                                                                                                                                                                                           |
| 7.1.0      | 2026-01-28     | スクリプト/LLMパターンガイド追加: script-llm-patterns.md                                                                                                                                                                                                                                                           |
| 7.0.1      | 2026-01-24     | 整合性修正: custom-script-design.json追加、壊れた参照修正                                                                                                                                                                                                                                                          |
| 7.0.0      | 2026-01-24     | リファクタリング: SKILL.md 481→130行（73%削減）、詳細をreferencesに委譲                                                                                                                                                                                                                                            |
| 6.2.0      | 2026-01-24     | API推薦機能追加: recommend-integrations.md, goal-to-api-mapping.md                                                                                                                                                                                                                                                 |
| 6.1.0      | 2026-01-24     | 自動リソース選択機能追加: select-resources.md                                                                                                                                                                                                                                                                      |
| 6.0.0      | 2026-01-24     | オーケストレーション・ドキュメント生成機能追加                                                                                                                                                                                                                                                                     |
| 5.7.0      | 2026-01-21     | Part 5をresource-map.mdに分離                                                                                                                                                                                                                                                                                      |
| 5.6.0      | 2026-01-21     | Self-Contained Skills: PNPM依存関係管理                                                                                                                                                                                                                                                                            |
| 5.0.0      | 2026-01-15     | Collaborative First追加、抽象度レベル対応                                                                                                                                                                                                                                                                          |
