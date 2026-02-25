# Phase 13: PR作成

## メタ情報

| 項目      | 値                              |
| --------- | ------------------------------- |
| Phase     | 13                              |
| タスクID  | UT-IPC-CHANNEL-NAMING-AUDIT-001 |
| 機能名    | ut-ipc-channel-naming-audit-001 |
| 作成日    | 2026-02-24                      |
| 前提Phase | Phase 12                        |
| 後続Phase | なし                            |
| 目的区分  | リリース準備                    |

## 目的

監査成果物をレビュー可能な変更セットとして整理し、PR提出時に必要な説明と証跡を揃える。

## 背景

本タスクでは現在PR作成を実施しないが、将来提出時の再利用を目的として手順とテンプレートを定義する。

## 実行タスク

- 変更要約作成: 監査結果と計画を要約する。
- 添付証跡整理: 各Phase成果物のリンクを整理する。
- レビュー観点整理: 重点レビュー項目を定義する。
- PR本文テンプレート作成: そのまま貼り付け可能な形式で作成する。

### PR本文テンプレート項目

| セクション | 記載内容                     |
| ---------- | ---------------------------- |
| Summary    | 監査目的と成果物             |
| Changes    | 追加した仕様書と出力ファイル |
| Validation | 実行した検証コマンドと結果   |
| Risks      | 未実施項目と次タスク依存     |

## 参照資料

| 参照資料         | パス                                                | 内容               |
| ---------------- | --------------------------------------------------- | ------------------ |
| Phase 2成果物    | `outputs/phase-2/audit-design.md`                   | 変更説明の設計根拠 |
| Phase 5成果物    | `outputs/phase-5/channel-naming-audit-report.md`    | 監査元データ       |
| Phase 6成果物    | `outputs/phase-6/test-expansion-result.md`          | 追加検証データ     |
| Phase 7成果物    | `outputs/phase-7/coverage-report.md`                | 網羅率証跡         |
| Phase 8成果物    | `outputs/phase-8/channel-rename-plan-normalized.md` | 計画証跡           |
| Phase 9成果物    | `outputs/phase-9/quality-report.md`                 | 品質証跡           |
| Phase 11成果物   | `outputs/phase-11/manual-test-result.md`            | 手動検証証跡       |
| 実装ガイド       | `outputs/phase-12/implementation-guide.md`          | PR説明材料         |
| 仕様更新サマリー | `outputs/phase-12/spec-update-summary.md`           | PR説明材料         |
| 更新履歴         | `outputs/phase-12/documentation-changelog.md`       | PR説明材料         |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`           | 承認材料           |

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

| 成果物         | パス                                 | 内容                   |
| -------------- | ------------------------------------ | ---------------------- |
| PR情報         | `outputs/phase-13/pr-info.md`        | PR本文案、チェック結果 |
| レビュー依頼文 | `outputs/phase-13/review-request.md` | レビュワー向け要点     |

## 完了条件

- [ ] PR本文テンプレートが作成されている。
- [ ] 主要成果物リンクが整理されている。
- [ ] レビュー観点が列挙されている。
- [ ] 未実施事項と次タスク依存が明記されている。

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

- **前提**: Phase 12
- **後続**: なし（最終Phase）

## Phase実行記録（全Phase共通）

Phase 13 完了後、以下を記録する。

```markdown
## Phase 13 実行記録

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

完了（本ワークフロー終了）
