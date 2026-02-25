# Phase 6: テスト拡充

## メタ情報

| 項目      | 値                              |
| --------- | ------------------------------- |
| Phase     | 6                               |
| タスクID  | UT-IPC-CHANNEL-NAMING-AUDIT-001 |
| 機能名    | ut-ipc-channel-naming-audit-001 |
| 作成日    | 2026-02-24                      |
| 前提Phase | Phase 5                         |
| 後続Phase | Phase 7                         |
| 目的区分  | 監査の網羅性向上                |

## 目的

Phase 5 で作成した監査結果に対して追加検証を行い、見逃しを減らす。

## 背景

初回監査は主要違反を検出できるが、文脈依存の命名不整合や例外ルール漏れが残る可能性がある。追加テストで境界ケースを潰す。

## 実行タスク

- 例外ケース検証: 命名規則の例外チャネルを検証する。
- 文脈検証: 同名動詞の用途差異を検証する。
- レイヤー検証: Main/Preload/Renderer の参照差分を検証する。
- レポート追補: 追加検証結果を監査レポートへ反映する。

### 追加テスト観点

| 観点ID | 内容                              | 検証方法                                              |
| ------ | --------------------------------- | ----------------------------------------------------- |
| EX-01  | `Source` を含むチャネルの用途一致 | `rg -n "Source" apps/desktop/src`                     |
| EX-02  | `FromSource` の引数型整合         | 参照先の型定義を確認                                  |
| EX-03  | camel/kebab混在の検出             | `rg -n "[A-Z][a-z]+:[a-z]" apps/desktop/src/main/ipc` |
| EX-04  | 非推奨別名チャネルの残存          | 旧名リストとの照合                                    |

## 参照資料

| 参照資料         | パス                                                                             | 内容           |
| ---------------- | -------------------------------------------------------------------------------- | -------------- |
| 命名監査レポート | `outputs/phase-5/channel-naming-audit-report.md`                                 | 追加検証の対象 |
| リネーム計画     | `outputs/phase-5/channel-rename-plan.md`                                         | 優先度確認     |
| IPC型解決ガイド  | `.claude/skills/aiworkflow-requirements/references/ipc-type-resolution-guide.md` | 境界ケース観点 |
| セキュリティ運用 | `.claude/skills/aiworkflow-requirements/references/security-operations.md`       | 監査ログ観点   |

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

3層差分検証を再実行し、Phase 5 の結果との差分を `delta` として記録する。

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

| 成果物           | パス                                       | 内容                |
| ---------------- | ------------------------------------------ | ------------------- |
| 追加テスト結果   | `outputs/phase-6/test-expansion-result.md` | EX-01〜EX-04 の結果 |
| 差分レポート     | `outputs/phase-6/layer-delta-report.md`    | 3層差分             |
| 監査レポート追補 | `outputs/phase-6/audit-report-addendum.md` | Phase 5 追補        |

## 完了条件

- [ ] 境界ケース検証が4観点以上で完了している。
- [ ] Phase 5 との差分が記録されている。
- [ ] 追加違反がリネーム計画へ反映されている。
- [ ] 監査レポートに追補が反映されている。

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

- **前提**: Phase 5
- **後続**: Phase 7

## Phase実行記録（全Phase共通）

Phase 6 完了後、以下を記録する。

```markdown
## Phase 6 実行記録

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

`phase-7-coverage-check.md`
