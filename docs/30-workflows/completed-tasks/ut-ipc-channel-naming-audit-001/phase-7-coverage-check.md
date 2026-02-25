# Phase 7: テストカバレッジ確認

## メタ情報

| 項目      | 値                              |
| --------- | ------------------------------- |
| Phase     | 7                               |
| タスクID  | UT-IPC-CHANNEL-NAMING-AUDIT-001 |
| 機能名    | ut-ipc-channel-naming-audit-001 |
| 作成日    | 2026-02-24                      |
| 前提Phase | Phase 6                         |
| 後続Phase | Phase 8                         |
| 判定対象  | 監査網羅率と証跡充足率          |

## 目的

監査対象チャネルに対する検証実施率を算出し、未検証項目を0件にする。

## 背景

命名監査は「全件確認」が前提であり、部分監査では効果が薄い。Phase 7 で網羅率を数値化して不足を潰す。

## 実行タスク

- 総件数集計: `channels.ts` 定義数を確定する。
- 検証済み件数集計: レポート記載済み件数を集計する。
- 未検証件抽出: 漏れチャネルを抽出する。
- 補完実施: 漏れチャネルを追加監査してレポートを更新する。

### カバレッジ算出式

`coverage = 検証済みチャネル数 / 総チャネル数 * 100`

### 判定テーブル

| カバレッジ      | 判定  | アクション               |
| --------------- | ----- | ------------------------ |
| 100%            | PASS  | Phase 8 へ進行           |
| 95%以上100%未満 | MINOR | 未検証件を補完して再計測 |
| 95%未満         | MAJOR | Phase 6 に戻り追加検証   |

## 参照資料

| 参照資料 | パス                                                                        | 内容               |
| -------- | --------------------------------------------------------------------------- | ------------------ |
| 棚卸し   | `outputs/phase-5/channel-inventory.md`                                      | 総件数算出元       |
| 監査結果 | `outputs/phase-5/channel-naming-audit-report.md`                            | 検証済み件数算出元 |
| 追補結果 | `outputs/phase-6/audit-report-addendum.md`                                  | 追加検証結果       |
| 品質要件 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | 判定基準補助       |

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

Main/Preload/Renderer の参照チャネルが棚卸し件数に含まれることを相互照合し、3層合算で網羅率を算出する。

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

| 成果物             | パス                                    | 内容                         |
| ------------------ | --------------------------------------- | ---------------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md`    | 総件数、検証済み件数、網羅率 |
| 未検証チャネル一覧 | `outputs/phase-7/uncovered-channels.md` | 漏れ一覧                     |

## 完了条件

- [ ] 総チャネル件数が固定されている。
- [ ] 検証済み件数が再計算されている。
- [ ] 未検証チャネルが0件である。
- [ ] 網羅率が100%である。

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

- **前提**: Phase 6
- **後続**: Phase 8

## Phase実行記録（全Phase共通）

Phase 7 完了後、以下を記録する。

```markdown
## Phase 7 実行記録

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

`phase-8-refactoring.md`
