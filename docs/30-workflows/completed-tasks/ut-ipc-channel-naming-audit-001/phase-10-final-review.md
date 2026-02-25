# Phase 10: 最終レビューゲート

## メタ情報

| 項目      | 値                              |
| --------- | ------------------------------- |
| Phase     | 10                              |
| タスクID  | UT-IPC-CHANNEL-NAMING-AUDIT-001 |
| 機能名    | ut-ipc-channel-naming-audit-001 |
| 作成日    | 2026-02-24                      |
| 前提Phase | Phase 9                         |
| 後続Phase | Phase 11                        |
| 判定方式  | PASS / MINOR / MAJOR / CRITICAL |

## 目的

Phase 1〜9 の成果物を統合レビューし、監査結果を正式成果物として確定する。

## 背景

最終レビューでは、命名違反抽出だけでなく「改名計画が実装タスクに引き継げるか」を判定する。

## 実行タスク

- 成果物一式レビュー: 監査レポート、計画、品質レポートを照合する。
- 重大指摘確認: 高優先度違反の見落としを確認する。
- 受け入れ可否判定: 判定を確定し、戻り先を定義する。

### 最終判定観点

| 観点     | 合格条件                               |
| -------- | -------------------------------------- |
| 網羅性   | 全チャネルに判定が付与されている       |
| 一貫性   | 命名規則判定と優先度が矛盾しない       |
| 実行性   | リネーム計画に実施順序と影響範囲がある |
| 監査証跡 | 根拠コマンドと対象ファイルが紐付く     |

## 参照資料

| 参照資料      | パス                                                                 | 内容               |
| ------------- | -------------------------------------------------------------------- | ------------------ |
| Phase 1成果物 | `outputs/phase-1/requirements-definition.md`                         | 要件適合確認       |
| Phase 2成果物 | `outputs/phase-2/audit-design.md`                                    | 設計適合確認       |
| Phase 5成果物 | `outputs/phase-5/channel-rename-plan.md`                             | 監査実行結果の原本 |
| 品質レポート  | `outputs/phase-9/quality-report.md`                                  | 判定根拠           |
| 監査レポート  | `outputs/phase-8/channel-naming-audit-report-normalized.md`          | 主要成果物         |
| リネーム計画  | `outputs/phase-8/channel-rename-plan-normalized.md`                  | 主要成果物         |
| 残課題台帳    | `.claude/skills/aiworkflow-requirements/references/task-workflow.md` | 登録整合           |

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

監査コマンドを最終再実行し、Phase 9 と同一結果であることを確認した上でレビュー結果へ添付する。

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

| 成果物           | パス                                        | 内容                 |
| ---------------- | ------------------------------------------- | -------------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`   | 判定と戻り先         |
| 指摘一覧         | `outputs/phase-10/final-review-findings.md` | MINOR/MAJOR/CRITICAL |

## 完了条件

- [ ] 判定が PASS/MINOR/MAJOR/CRITICAL のいずれかで確定している。
- [ ] 重大指摘の有無が明示されている。
- [ ] 戻り先ルールが記録されている。
- [ ] Phase 11 への引き継ぎ事項が記録されている。

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

- **前提**: Phase 9
- **後続**: Phase 11

## レビューゲート（Phase 3, 10 の場合）

| 判定     | 条件                 | 次のアクション                 |
| -------- | -------------------- | ------------------------------ |
| PASS     | 指摘なし             | Phase 11 へ進行                |
| MINOR    | 軽微な課題のみ       | 未タスク化して Phase 11 へ進行 |
| MAJOR    | 監査ロジックの欠陥   | Phase 8 へ戻る                 |
| CRITICAL | 監査結果の信頼性欠如 | Phase 5 へ戻る                 |

## Phase実行記録（全Phase共通）

Phase 10 完了後、以下を記録する。

```markdown
## Phase 10 実行記録

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

`phase-11-manual-test.md`
