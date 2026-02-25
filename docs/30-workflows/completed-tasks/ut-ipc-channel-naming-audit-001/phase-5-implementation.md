# Phase 5: 実装

## メタ情報

| 項目      | 値                                 |
| --------- | ---------------------------------- |
| Phase     | 5                                  |
| タスクID  | UT-IPC-CHANNEL-NAMING-AUDIT-001    |
| 機能名    | ut-ipc-channel-naming-audit-001    |
| 作成日    | 2026-02-24                         |
| 前提Phase | Phase 4                            |
| 後続Phase | Phase 6                            |
| 実装対象  | 監査実行、レポート作成、計画文書化 |

## 目的

Phase 4 で定義したテストケースを実行し、全IPCチャネル命名を監査して、違反一覧とリネーム計画を作成する。

## 背景

監査タスクの価値は「網羅性」と「再現性」にある。監査結果は次タスクの実装入力となるため、違反ごとに根拠と影響範囲を記録する。

## 実行タスク

- SubAgent-A 実行: チャネル棚卸しを作成する。
- SubAgent-B 実行: 命名規則照合で違反を抽出する。
- SubAgent-C 実行: 影響範囲を調査しリネーム案を作る。
- 統合記録: 監査レポートとリネーム計画を統合する。

### SubAgent-A: チャネル棚卸し

1. `channels.ts` の全定義を抽出。
2. ドメイン（`skill`, `auth`, `agent`, `chat-edit` 等）で分類。
3. 各チャネルの用途と引数形を記録。

### SubAgent-B: 命名規則照合

1. `skill:{動詞}` 系3パターンへ照合。
2. 規則外、意味不明、重複候補を抽出。
3. P5/P44/P45 リスクをタグ付け。

### SubAgent-C: 影響範囲調査

1. 候補チャネルを `apps/desktop/src/` 全体で検索。
2. Main/Preload/Renderer の使用箇所を列挙。
3. 高/中/低で優先度を付与し、リネーム計画を作成。

## 参照資料

| 参照資料         | パス                                                                                        | 内容             |
| ---------------- | ------------------------------------------------------------------------------------------- | ---------------- |
| テスト仕様書     | `outputs/phase-4/test-specification.md`                                                     | 実行元ケース     |
| 監査テンプレート | `outputs/phase-4/audit-report-template.md`                                                  | 出力フォーマット |
| 命名規則正本     | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 判定ルール       |
| セキュリティ仕様 | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | P5関連確認       |
| 教訓             | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | grep監査手順     |

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

TC-06〜TC-08 を実行し、監査結果に Main/Preload/Renderer の差分を記録する。

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

| 成果物           | パス                                             | 内容                   |
| ---------------- | ------------------------------------------------ | ---------------------- |
| チャネル棚卸し   | `outputs/phase-5/channel-inventory.md`           | 全チャネル一覧         |
| 命名監査レポート | `outputs/phase-5/channel-naming-audit-report.md` | 違反一覧、根拠、リスク |
| リネーム計画     | `outputs/phase-5/channel-rename-plan.md`         | 優先度付き改名計画     |

## 完了条件

- [ ] 全チャネルが棚卸し表に記載されている。
- [ ] 命名規則違反の有無が全チャネルで判定済みである。
- [ ] 違反チャネルごとに影響範囲が記録されている。
- [ ] 優先度付きリネーム計画が作成されている。

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

- **前提**: Phase 4
- **後続**: Phase 6

## TDD検証（Phase 4, 5, 8 の場合）

```bash
# Green判定の監査実行例
rg -o '"[a-z0-9:-]+"' apps/desktop/src/main/ipc/channels.ts | sort | uniq -d
```

## Phase実行記録（全Phase共通）

Phase 5 完了後、以下を記録する。

```markdown
## Phase 5 実行記録

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

`phase-6-test-expansion.md`
