# Phase 1: 要件定義

## メタ情報

| 項目       | 値                                    |
| ---------- | ------------------------------------- |
| Phase      | 1                                     |
| タスクID   | UT-IPC-CHANNEL-NAMING-AUDIT-001       |
| 機能名     | ut-ipc-channel-naming-audit-001       |
| 作成日     | 2026-02-24                            |
| 前提Phase  | なし                                  |
| 後続Phase  | Phase 2                               |
| タスク種別 | spec-only（監査設計・仕様書更新中心） |

## 目的

IPCチャネル命名規則の横断監査を実行するための要件を確定し、監査対象・判定基準・成果物・完了条件を固定する。

## 背景

`UT-SKILL-IMPORT-CHANNEL-CONFLICT-001` で `skill:{動詞}` / `skill:{動詞}FromSource` / `skill:{動詞}Source` の命名規則が確立された。既存チャネル群へ同規則が適用済みかは未監査であり、将来の追加実装で P5/P44/P45 の再発リスクがある。

## 実行タスク

- 要件整理: Why/What/How を監査タスク向けに再定義する。
- 監査対象確定: `apps/desktop/src/main/ipc/channels.ts` と参照先を対象リストに固定する。
- 判定基準定義: 命名規則準拠・重複なし・引数セマンティクス整合の3軸で判定基準を定義する。
- SubAgent分担定義: Atent Team想定で SubAgent-A/B/C の責務を明示する。
- 受け入れ基準作成: Phase 4 以降の機械検証で評価できる基準を作成する。

### SubAgent分担（設計）

| SubAgent | 責務                           | 主な入力                    | 主な出力                                         |
| -------- | ------------------------------ | --------------------------- | ------------------------------------------------ |
| A        | チャネル一覧抽出とドメイン分類 | `channels.ts`               | `outputs/phase-5/channel-inventory.md`           |
| B        | 命名規則照合と違反抽出         | Aの一覧、命名規則仕様       | `outputs/phase-5/channel-naming-audit-report.md` |
| C        | 影響範囲調査とリネーム計画作成 | Bの違反一覧、コード検索結果 | `outputs/phase-5/channel-rename-plan.md`         |

## 参照資料

| 参照資料                 | パス                                                                                        | 内容                                              |
| ------------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| 元タスク指示書           | `docs/30-workflows/completed-tasks/task-ipc-channel-naming-audit-001.md`                    | Why/What/How の元仕様（spec_created）             |
| Issue #889               | `https://github.com/daishiman/AIWorkflowOrchestrator/issues/889`                            | Issue原文と優先度                                 |
| 実装パターン             | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | IPCチャネル命名規則と競合予防                     |
| IPC契約チェック          | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | P23/P32/P42/P44の監査基準                         |
| Electron IPCセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | P5と契約ドリフト防止                              |
| 教訓                     | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | UT-SKILL-IMPORT-CHANNEL-CONFLICT-001 の再利用知見 |
| 残課題台帳               | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | UT-IPC-CHANNEL-NAMING-AUDIT-001 の登録状態        |

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

監査対象を「Main/Preload/Renderer 3層で同一チャネルが矛盾なく参照されること」として要件化し、Phase 4 で grep 検証項目に落とし込む。

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

| 成果物         | パス                                           | 内容             |
| -------------- | ---------------------------------------------- | ---------------- |
| 要件定義書     | `outputs/phase-1/requirements-definition.md`   | 要件、制約、前提 |
| 受け入れ基準   | `outputs/phase-1/acceptance-criteria.md`       | 検証可能な基準   |
| SubAgent責務表 | `outputs/phase-1/subagent-responsibilities.md` | A/B/C 分担定義   |

## 完了条件

- [ ] 監査対象ファイルと監査範囲が固定されている。
- [ ] 命名規則の判定基準が表形式で定義されている。
- [ ] SubAgent-A/B/C の責務境界が重複なしで定義されている。
- [ ] Phase 4 の機械検証へ接続できる受け入れ基準が定義されている。

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

- **前提**: なし（初回Phase）
- **後続**: Phase 2

## Phase実行記録（全Phase共通）

Phase 1 完了後、以下を記録する。

```markdown
## Phase 1 実行記録

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

`phase-2-design.md`
