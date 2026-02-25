# Phase 8: リファクタリング

## メタ情報

| 項目      | 値                              |
| --------- | ------------------------------- |
| Phase     | 8                               |
| タスクID  | UT-IPC-CHANNEL-NAMING-AUDIT-001 |
| 機能名    | ut-ipc-channel-naming-audit-001 |
| 作成日    | 2026-02-24                      |
| 前提Phase | Phase 7                         |
| 後続Phase | Phase 9                         |
| 対象      | 監査結果と計画文書の改善        |

## 目的

監査レポートとリネーム計画を、実行側がそのまま使える形式へ整える。重複記載や不統一表現を除去し、判断コストを下げる。

## 背景

監査結果が読みにくいと後続タスクの実装速度が低下する。Phase 8 は内容変更ではなく表現と構造の最適化に集中する。

## 実行タスク

- 構造正規化: レポートの列定義を統一する。
- 重複除去: 同一指摘の重複行を統合する。
- 優先度再整理: 高/中/低の根拠を明示する。
- 実装引き継ぎ化: 1件ごとに改名前/改名後/影響箇所を1行で示す。

### リファクタ対象

| ファイル                                         | 改善内容               |
| ------------------------------------------------ | ---------------------- |
| `outputs/phase-5/channel-naming-audit-report.md` | 列順と用語統一         |
| `outputs/phase-5/channel-rename-plan.md`         | 実施順序と依存関係追記 |
| `outputs/phase-6/audit-report-addendum.md`       | Phase 5 本文へ統合     |

## 参照資料

| 参照資料         | パス                                                                                        | 内容           |
| ---------------- | ------------------------------------------------------------------------------------------- | -------------- |
| Phase 1成果物    | `outputs/phase-1/requirements-definition.md`                                                | 監査目的の原点 |
| Phase 2成果物    | `outputs/phase-2/spec-update-design.md`                                                     | 文書構造設計   |
| 命名監査レポート | `outputs/phase-5/channel-naming-audit-report.md`                                            | 主対象         |
| リネーム計画     | `outputs/phase-5/channel-rename-plan.md`                                                    | 主対象         |
| Phase 6成果物    | `outputs/phase-6/audit-report-addendum.md`                                                  | 追補結果       |
| カバレッジ結果   | `outputs/phase-7/coverage-report.md`                                                        | 正規化前提     |
| 実装パターン     | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 用語統一       |

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

リファクタ後に TC-02（重複検出）と TC-06（多重登録兆候）を再実行し、監査結果が変質していないことを確認する。

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

| 成果物             | パス                                                        | 内容           |
| ------------------ | ----------------------------------------------------------- | -------------- |
| リファクタログ     | `outputs/phase-8/refactoring-log.md`                        | 変更前後差分   |
| 正規化監査レポート | `outputs/phase-8/channel-naming-audit-report-normalized.md` | 実施向け整形版 |
| 正規化リネーム計画 | `outputs/phase-8/channel-rename-plan-normalized.md`         | 実施向け整形版 |

## 完了条件

- [ ] 監査レポートの列定義が統一されている。
- [ ] 重複指摘が解消されている。
- [ ] 各改名候補に優先度根拠がある。
- [ ] 後続実装者が追加質問なしで着手できる形式になっている。

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

- **前提**: Phase 7
- **後続**: Phase 9

## TDD検証（Phase 4, 5, 8 の場合）

```bash
# 正規化後の差分確認
rg -n "改名前|改名後|優先度" \
  docs/30-workflows/completed-tasks/ut-ipc-channel-naming-audit-001/outputs/phase-8/*.md
```

## Phase実行記録（全Phase共通）

Phase 8 完了後、以下を記録する。

```markdown
## Phase 8 実行記録

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

`phase-9-quality-assurance.md`
