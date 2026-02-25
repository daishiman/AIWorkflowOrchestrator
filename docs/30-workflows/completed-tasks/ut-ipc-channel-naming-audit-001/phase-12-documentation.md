# Phase 12: ドキュメント更新

## メタ情報

| 項目         | 値                              |
| ------------ | ------------------------------- |
| Phase        | 12                              |
| タスクID     | UT-IPC-CHANNEL-NAMING-AUDIT-001 |
| 機能名       | ut-ipc-channel-naming-audit-001 |
| 作成日       | 2026-02-24                      |
| 前提Phase    | Phase 11                        |
| 後続Phase    | Phase 13                        |
| 必須タスク数 | 5                               |

## 目的

監査成果物を実装チームへ引き継ぐため、実装ガイド・仕様更新サマリー・更新履歴・未タスク検出・スキルフィードバックを作成する。

## 背景

Phase 12 は成果物の再利用性を決める。監査結果を台帳と正本仕様へ反映し、次タスクの起点を固定する。

## 実行タスク

- 実装ガイド作成: Part 1（中学生向け）と Part 2（技術者向け）を作成する。
- 仕様更新サマリー作成: Step 1-A/1-B/1-C を記録し、Step 2 要否を判定する。
- ドキュメント更新履歴作成: 変更内容を時系列で記録する。
- 未タスク検出レポート作成: 追加課題の有無を記録する。
- スキルフィードバック作成: 改善点と維持点を整理する。

### Part 1（中学生向け）要件

- 日常の例えを使う。
- 専門用語を使う場合は同段落で説明する。
- 先に「なぜ行うか」を説明し、次に「何を行うか」を説明する。

### Part 2（技術者向け）要件

- 型定義例を記載する。
- APIシグネチャ例を記載する。
- エラーケースと再試行方針を記載する。
- 設定値と判定基準を一覧化する。

## 参照資料

| 参照資料          | パス                                                                                        | 内容           |
| ----------------- | ------------------------------------------------------------------------------------------- | -------------- |
| Phase 2成果物     | `outputs/phase-2/spec-update-design.md`                                                     | 反映方針の基準 |
| Phase 5成果物     | `outputs/phase-5/channel-naming-audit-report.md`                                            | 反映元原本     |
| Phase 6成果物     | `outputs/phase-6/audit-report-addendum.md`                                                  | 追補反映元     |
| Phase 7成果物     | `outputs/phase-7/coverage-report.md`                                                        | 網羅率記録     |
| Phase 9成果物     | `outputs/phase-9/quality-report.md`                                                         | 品質記録       |
| Phase 10成果物    | `outputs/phase-10/final-review-result.md`                                                   | 最終判定記録   |
| 手動テスト結果    | `outputs/phase-11/manual-test-result.md`                                                    | 反映元         |
| 監査レポート      | `outputs/phase-8/channel-naming-audit-report-normalized.md`                                 | 反映元         |
| リネーム計画      | `outputs/phase-8/channel-rename-plan-normalized.md`                                         | 反映元         |
| task-workflow正本 | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | 台帳更新先     |
| 実装パターン正本  | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 規則追記先     |

## システム仕様抽出（aiworkflow-requirements）

> 本タスクで必要な仕様を抽出し、監査設計・判定・ドキュメント更新に適用する。

| 仕様                      | パス                                                                                        | 適用内容                                      |
| ------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------- |
| IPC API仕様               | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | チャネル用途と要求/応答の整合確認             |
| API命名仕様               | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`                        | 命名規則とチャネル一覧の整合確認              |
| Skill IF仕様              | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | Skill系チャネルの命名・引数セマンティクス確認 |
| IPCセキュリティ仕様       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | P5（二重登録）/P44/P45 観点の確認             |
| Skill IPCセキュリティ仕様 | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | SkillドメインのIPC検証原則確認                |
| 実装パターン仕様          | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | `skill:{動詞}` 系3パターンの基準適用          |
| IPC契約チェック仕様       | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | Main/Preload/Renderer 3層整合チェック         |
| IPC型解決仕様             | `.claude/skills/aiworkflow-requirements/references/ipc-type-resolution-guide.md`            | 型/命名ドリフト検知観点の適用                 |
| 教訓仕様                  | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 既知苦戦パターンと回避策の再利用              |
| 品質仕様                  | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | 監査品質と検証再現性の基準適用                |
| タスク台帳仕様            | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | 未タスク/完了記録の追跡整合                   |

## 実行手順

1. 参照資料を確認し、入力と制約を明確化する。
2. 実行タスクを上から順に実施し、判断根拠を成果物へ記録する。
3. 完了条件と検証コマンドを実行して、次Phaseへ引き継ぐ。

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                                         | 仕様参照先                                   |
| ------------------ | ------------------------------------------------ | -------------------------------------------- |
| セキュリティ       | IPC/権限/入力検証が関係する場合                  | `aiworkflow-requirements: security-*.md`     |
| UI/UX              | Renderer連携や利用手順に影響する場合             | `aiworkflow-requirements: ui-ux-*.md`        |
| アーキテクチャ     | 層間構成・命名規則・責務分割を扱う場合           | `aiworkflow-requirements: architecture-*.md` |
| API設計            | IPCチャネル契約やリクエスト/レスポンスを扱う場合 | `aiworkflow-requirements: api-*.md`          |
| データ整合性       | 型定義や監査データ整合を扱う場合                 | `aiworkflow-requirements: interfaces-*.md`   |
| エラーハンドリング | 判定不能ケースや失敗時対応を扱う場合             | `aiworkflow-requirements: error-handling.md` |
| パフォーマンス     | 監査コマンドの実行コストを扱う場合               | `aiworkflow-requirements: architecture-*.md` |
| アクセシビリティ   | レビュー手順・運用ドキュメントの可読性を扱う場合 | `aiworkflow-requirements: ui-ux-*.md`        |

**Electronデスクトップアプリ観点**:

| 層                         | 適用判断                                   | 仕様参照先                                             |
| -------------------------- | ------------------------------------------ | ------------------------------------------------------ |
| フロントエンド（Renderer） | 画面側のIPC利用箇所を確認する場合          | `aiworkflow-requirements: ui-ux-*.md`                  |
| バックエンド（Main）       | チャネル定義・ハンドラー登録を確認する場合 | `aiworkflow-requirements: architecture-*.md`           |
| IPC通信                    | Main-Renderer 契約を監査する場合           | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |
| Preload/セキュリティ       | safeInvoke/safeOn と公開APIを確認する場合  | `aiworkflow-requirements: security-api-electron.md`    |
| ローカルストレージ         | 監査結果の保存・履歴整合を扱う場合         | `aiworkflow-requirements: database-*.md`               |

## 成果物

| 成果物           | パス                                            | 内容                   |
| ---------------- | ----------------------------------------------- | ---------------------- |
| 実装ガイド       | `outputs/phase-12/implementation-guide.md`      | Part 1/Part 2          |
| 仕様更新サマリー | `outputs/phase-12/spec-update-summary.md`       | Step 1-A/1-B/1-C/2判定 |
| 更新履歴         | `outputs/phase-12/documentation-changelog.md`   | 変更履歴               |
| 未タスク検出     | `outputs/phase-12/unassigned-task-detection.md` | 追加課題有無           |
| フィードバック   | `outputs/phase-12/skill-feedback-report.md`     | 改善提案               |

## 完了条件

- [ ] 実装ガイドに Part 1/Part 2 の両方が含まれている。
- [ ] 仕様更新サマリーに Step 1-A/1-B/1-C の実施記録がある。
- [ ] 未タスク検出結果が件数付きで記録されている。
- [ ] 更新履歴とフィードバックが作成されている。

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下を管理する。

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施（Phase 1〜11）
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase末端で各タスクの完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/ut-ipc-channel-naming-audit-001
```

## 依存関係

- **前提**: Phase 11
- **後続**: Phase 13

## Phase実行記録（全Phase共通）

Phase 12 完了後、以下を記録する。

```markdown
## Phase 12 実行記録

### 実行タスク

- タスク名: 結果（完了/未完了）

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

-
```

## 次のPhase

`phase-13-pr-creation.md`
