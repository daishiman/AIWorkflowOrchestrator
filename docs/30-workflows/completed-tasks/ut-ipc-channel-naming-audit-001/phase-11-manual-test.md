# Phase 11: 手動テスト検証

## メタ情報

| 項目      | 値                              |
| --------- | ------------------------------- |
| Phase     | 11                              |
| タスクID  | UT-IPC-CHANNEL-NAMING-AUDIT-001 |
| 機能名    | ut-ipc-channel-naming-audit-001 |
| 作成日    | 2026-02-24                      |
| 前提Phase | Phase 10                        |
| 後続Phase | Phase 12                        |
| 検証者    | 仕様レビュー担当者              |

## 目的

監査成果物を人手で追試し、将来の実装担当者が迷わずリネーム作業へ入れるかを確認する。

## 背景

機械検証が PASS でも、文書の読みやすさや運用性は手動確認が必要である。Phase 11 で実務観点の不足を洗い出す。

## 実行タスク

- 手順追試: 監査コマンドを手順書どおりに実行する。
- 計画追試: リネーム計画を上から読んで実施可否を確認する。
- 参照追試: すべての参照パスが実在するかを確認する。
- 指摘整理: 発見事項を MINOR/MAJOR で分類する。

### 手動検証チェック項目

| 項目         | 合格条件                       |
| ------------ | ------------------------------ |
| コマンド再現 | 記載コマンドがそのまま実行可能 |
| 手順明瞭性   | 追加説明なしで手順が理解できる |
| パス実在性   | 参照パス切れが0件              |
| 実施順序     | リネーム順序が矛盾しない       |

## 参照資料

| 参照資料         | パス                                                                       | 内容               |
| ---------------- | -------------------------------------------------------------------------- | ------------------ |
| Phase 2成果物    | `outputs/phase-2/subagent-execution-plan.md`                               | 手順追試の設計基準 |
| Phase 5成果物    | `outputs/phase-5/channel-naming-audit-report.md`                           | 手動確認の原本     |
| Phase 6成果物    | `outputs/phase-6/test-expansion-result.md`                                 | 境界ケース確認結果 |
| Phase 7成果物    | `outputs/phase-7/coverage-report.md`                                       | 網羅率確認         |
| Phase 9成果物    | `outputs/phase-9/quality-report.md`                                        | 品質判定確認       |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`                                  | 手動検証の前提     |
| 監査レポート     | `outputs/phase-8/channel-naming-audit-report-normalized.md`                | 検証対象           |
| リネーム計画     | `outputs/phase-8/channel-rename-plan-normalized.md`                        | 検証対象           |
| 運用仕様         | `.claude/skills/aiworkflow-requirements/references/security-operations.md` | 運用観点           |

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

## 統合テスト連携（Phase 1〜11は必須）

手動で Main/Preload/Renderer の3層差分を確認し、層間の命名不整合が残っていないことをチェックリストに記録する。

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

| 成果物         | パス                                     | 内容     |
| -------------- | ---------------------------------------- | -------- |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | 実施結果 |
| 手動指摘一覧   | `outputs/phase-11/manual-findings.md`    | 追加課題 |

## 完了条件

- [ ] 手動チェック項目が全て実施済みである。
- [ ] 参照パス切れが0件である。
- [ ] 指摘の重要度が分類済みである。
- [ ] Phase 12 へのドキュメント反映項目が確定している。

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

- **前提**: Phase 10
- **後続**: Phase 12

## Phase実行記録（全Phase共通）

Phase 11 完了後、以下を記録する。

```markdown
## Phase 11 実行記録

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

`phase-12-documentation.md`
