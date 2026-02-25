# Phase 3: 設計レビューゲート

## メタ情報

| 項目      | 値                              |
| --------- | ------------------------------- |
| Phase     | 3                               |
| タスクID  | UT-IPC-CHANNEL-NAMING-AUDIT-001 |
| 機能名    | ut-ipc-channel-naming-audit-001 |
| 作成日    | 2026-02-24                      |
| 前提Phase | Phase 2                         |
| 後続Phase | Phase 4                         |
| 判定方式  | PASS / MINOR / MAJOR / CRITICAL |

## 目的

Phase 2 の監査設計をレビューし、判定基準の再現性と成果物設計の妥当性を確認する。

## 背景

監査タスクでは判定の揺れが最大リスクである。レビューゲートで判定手順と証跡仕様を固定し、後続Phaseの手戻りを防止する。

## 実行タスク

- 設計妥当性レビュー: 監査フローとSubAgent分担の妥当性を判定する。
- 仕様整合レビュー: aiworkflow-requirements 参照漏れの有無を判定する。
- 判定再現性レビュー: 同一入力で同一判定になる設計かを判定する。
- ゲート判定: PASS/MINOR/MAJOR/CRITICAL を確定する。

### レビュー観点

| 観点         | 合格条件                                         |
| ------------ | ------------------------------------------------ |
| 命名規則準拠 | 3パターンと判定式が一致している                  |
| 競合検出性   | 重複チャネル検出手順が定義されている             |
| 契約整合性   | Main/Preload/Renderer の確認方法が定義されている |
| 実行再現性   | 手順を読めば同一結果になる                       |

### レビュー結果記録フォーマット

| 項目     | 記録内容                   |
| -------- | -------------------------- |
| 判定     | PASS/MINOR/MAJOR/CRITICAL  |
| 指摘ID   | R3-001 形式                |
| 指摘内容 | 差分で修正可能な具体指摘   |
| 対応方針 | Phase 4 へ持ち込む検証項目 |

## 参照資料

| 参照資料         | パス                                                                                        | 内容                 |
| ---------------- | ------------------------------------------------------------------------------------------- | -------------------- |
| Phase 1成果物    | `outputs/phase-1/requirements-definition.md`                                                | 監査要件の基準       |
| 監査設計書       | `outputs/phase-2/audit-design.md`                                                           | レビュー対象         |
| SubAgent実行計画 | `outputs/phase-2/subagent-execution-plan.md`                                                | 並列設計レビュー対象 |
| IPC命名規則      | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 合否判定の正本       |
| IPCセキュリティ  | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | P5/P44/P45 観点      |
| 残課題管理       | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | 未タスク管理要件     |

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

Phase 4 で実行する grep テストが、レビュー指摘の全項目を検証できるようにテストケースへのマッピング表を作成する。

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

| 成果物             | パス                                        | 内容                     |
| ------------------ | ------------------------------------------- | ------------------------ |
| 設計レビュー結果   | `outputs/phase-3/design-review-result.md`   | 判定、指摘、対応方針     |
| テストマッピング表 | `outputs/phase-3/review-to-test-mapping.md` | 指摘とテストケースの対応 |

## 完了条件

- [ ] 判定が PASS/MINOR/MAJOR/CRITICAL のいずれかで確定している。
- [ ] 指摘がID付きで記録されている。
- [ ] 指摘ごとの対応Phaseが明記されている。
- [ ] Phase 4 のテスト項目へ全指摘が接続されている。

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

- **前提**: Phase 2
- **後続**: Phase 4

## レビューゲート（Phase 3, 10 の場合）

| 判定     | 条件             | 次のアクション                |
| -------- | ---------------- | ----------------------------- |
| PASS     | 重大欠陥なし     | Phase 4 へ進行                |
| MINOR    | 軽微な修正で収束 | 指摘を記録して Phase 4 へ進行 |
| MAJOR    | 判定手順の欠落   | Phase 2 へ戻る                |
| CRITICAL | 目的定義が破綻   | Phase 1 へ戻る                |

## Phase実行記録（全Phase共通）

Phase 3 完了後、以下を記録する。

```markdown
## Phase 3 実行記録

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

`phase-4-test-creation.md`
