# Phase 9: 品質保証

## メタ情報

| 項目      | 値                              |
| --------- | ------------------------------- |
| Phase     | 9                               |
| タスクID  | UT-IPC-CHANNEL-NAMING-AUDIT-001 |
| 機能名    | ut-ipc-channel-naming-audit-001 |
| 作成日    | 2026-02-24                      |
| 前提Phase | Phase 8                         |
| 後続Phase | Phase 10                        |
| 品質軸    | 正確性、再現性、追跡性          |

## 目的

監査成果物の品質を総合判定し、Phase 10 の最終レビューへ渡せる状態を作る。

## 背景

監査成果物は将来タスクの入力仕様となる。品質保証で欠陥を残すと、改名実装時に追加調査コストが増える。

## 実行タスク

- 正確性監査: 判定根拠と抽出データの整合を検証する。
- 再現性監査: 同コマンドで同結果になるかを検証する。
- 追跡性監査: 各指摘に参照パスと検索根拠があるかを検証する。
- 品質判定: PASS/MINOR/MAJOR を確定する。

### 品質チェックリスト

| 観点   | チェック内容                        | 合格条件  |
| ------ | ----------------------------------- | --------- |
| 正確性 | 指摘行と実ファイルが一致            | 不一致0件 |
| 再現性 | 再実行で同数値を再取得              | 差分0件   |
| 追跡性 | 全指摘に `path` と `command` がある | 欠落0件   |

## 参照資料

| 参照資料           | パス                                                                          | 内容           |
| ------------------ | ----------------------------------------------------------------------------- | -------------- |
| Phase 5成果物      | `outputs/phase-5/channel-naming-audit-report.md`                              | 判定根拠の原本 |
| 正規化監査レポート | `outputs/phase-8/channel-naming-audit-report-normalized.md`                   | 品質判定対象   |
| 正規化リネーム計画 | `outputs/phase-8/channel-rename-plan-normalized.md`                           | 品質判定対象   |
| カバレッジ結果     | `outputs/phase-7/coverage-report.md`                                          | 網羅性根拠     |
| IPC契約チェック    | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` | 契約整合観点   |

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

Main/Preload/Renderer の各レイヤーで抽出件数が一致することを再確認し、層別集計を品質レポートへ添付する。

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

| 成果物         | パス                                     | 内容           |
| -------------- | ---------------------------------------- | -------------- |
| 品質レポート   | `outputs/phase-9/quality-report.md`      | 判定結果と根拠 |
| 再現性検証ログ | `outputs/phase-9/reproducibility-log.md` | 再実行結果     |

## 完了条件

- [ ] 正確性チェックの不一致が0件である。
- [ ] 再現性チェックの差分が0件である。
- [ ] 追跡性チェックの欠落が0件である。
- [ ] 品質判定が記録されている。

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

- **前提**: Phase 8
- **後続**: Phase 10

## 品質ゲート（Phase 9 の場合）

- [ ] 監査対象の全チャネルが検証済み。
- [ ] 重大な命名違反が未分類のまま残っていない。
- [ ] リネーム計画が優先度順で並んでいる。

## Phase実行記録（全Phase共通）

Phase 9 完了後、以下を記録する。

```markdown
## Phase 9 実行記録

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

`phase-10-final-review.md`
