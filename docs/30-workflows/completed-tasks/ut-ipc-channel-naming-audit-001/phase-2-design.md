# Phase 2: 設計

## メタ情報

| 項目       | 値                              |
| ---------- | ------------------------------- |
| Phase      | 2                               |
| タスクID   | UT-IPC-CHANNEL-NAMING-AUDIT-001 |
| 機能名     | ut-ipc-channel-naming-audit-001 |
| 作成日     | 2026-02-24                      |
| 前提Phase  | Phase 1                         |
| 後続Phase  | Phase 3                         |
| タスク種別 | spec-only（監査設計）           |

## 目的

監査実行フロー、SubAgent並列区間、成果物スキーマ、判定アルゴリズムを設計し、Phase 5 で迷いなく監査を実行できる状態を作る。

## 背景

本タスクは実装修正タスクではなく監査タスクである。監査手順の曖昧さはレビュー差分を生み、同一入力でも異なる判定結果になる。設計段階で判定手順を固定する。

## 実行タスク

- 監査パイプライン設計: 抽出→分類→照合→影響調査→計画化の順序を確定する。
- データ構造設計: チャネル監査レコードの項目を定義する。
- SubAgent実行設計: 並列実行区間と直列区間を定義する。
- 仕様更新設計: `architecture-implementation-patterns.md` 追記方針を定義する。
- エラー設計: 判定不能ケースと例外ルールを定義する。

### 実行シーケンス

1. SubAgent-A が `channels.ts` からチャネル一覧を抽出。
2. SubAgent-B が命名規則との適合を判定。
3. SubAgent-C が違反チャネルの影響範囲を調査しリネーム計画化。
4. 統合レビューで優先度（高/中/低）を確定。

### 並列化方針

| 区間           | 実行方式 | 理由                               |
| -------------- | -------- | ---------------------------------- |
| 抽出と分類     | 並列     | ファイル読み取り系で独立           |
| 判定と影響調査 | 部分並列 | 判定結果を入力に影響調査を開始可能 |
| 最終計画作成   | 直列     | 優先度統合が必要                   |

## 参照資料

| 参照資料            | パス                                                                                        | 内容                       |
| ------------------- | ------------------------------------------------------------------------------------------- | -------------------------- |
| Phase 1成果物       | `outputs/phase-1/requirements-definition.md`                                                | Phase 1 要件定義の確定結果 |
| IPC命名規則         | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | `skill:{動詞}` 系3パターン |
| API命名原則         | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`                        | 命名規則の一般原則         |
| IPC契約ドリフト対策 | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | P44/P45 再発防止           |
| IPC整合チェック     | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | 6フェーズチェックリスト    |
| 親タスク教訓        | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | grepベース検証手順         |

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

判定アルゴリズムを grep/集計コマンドへ写像し、Phase 4 で Red ケースと Green ケースの両方を定義する。

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

| 成果物           | パス                                         | 内容                   |
| ---------------- | -------------------------------------------- | ---------------------- |
| 監査設計書       | `outputs/phase-2/audit-design.md`            | 手順、判定式、例外処理 |
| SubAgent実行計画 | `outputs/phase-2/subagent-execution-plan.md` | 並列/直列の境界        |
| 仕様更新設計     | `outputs/phase-2/spec-update-design.md`      | 追記対象セクション定義 |

## 完了条件

- [ ] 監査フローの入力と出力が全ステップで定義されている。
- [ ] 並列化区間と直列区間が表で定義されている。
- [ ] リネーム優先度ルールが明文化されている。
- [ ] 仕様書更新対象と更新単位が定義されている。

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

- **前提**: Phase 1
- **後続**: Phase 3

## Phase実行記録（全Phase共通）

Phase 2 完了後、以下を記録する。

```markdown
## Phase 2 実行記録

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

`phase-3-design-review.md`
