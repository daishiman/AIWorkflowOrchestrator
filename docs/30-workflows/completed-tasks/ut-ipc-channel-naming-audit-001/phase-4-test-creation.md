# Phase 4: テスト作成

## メタ情報

| 項目       | 値                              |
| ---------- | ------------------------------- |
| Phase      | 4                               |
| タスクID   | UT-IPC-CHANNEL-NAMING-AUDIT-001 |
| 機能名     | ut-ipc-channel-naming-audit-001 |
| 作成日     | 2026-02-24                      |
| 前提Phase  | Phase 3（レビュー結果確定）     |
| 後続Phase  | Phase 5                         |
| テスト方式 | grep/集計ベースの仕様監査テスト |

## 目的

監査実行前に Red となる検証ケースを作成し、命名規則違反・重複・契約ドリフト兆候を機械的に検出できる状態を作る。

## 背景

本タスクは仕様監査中心のため、テストは「監査コマンドと期待値」の形式で定義する。Phase 5 の監査実行後に Green 判定へ移行する。

## 実行タスク

- テストケース定義: 命名規則・重複・参照整合の3カテゴリでケースを作る。
- コマンド定義: `rg`/`grep` ベースで再実行可能な検証コマンドを定義する。
- 期待値定義: ケースごとの PASS 条件を数値で定義する。
- レポート雛形作成: Phase 5 の監査結果を記録するテンプレートを作成する。

### テストケース一覧

| TC-ID | 観点                       | コマンド例                                                                                 | 期待値                            |
| ----- | -------------------------- | ------------------------------------------------------------------------------------------ | --------------------------------- | ----------- | --- |
| TC-01 | チャネル抽出               | `rg -n "^[[:space:]]+[A-Z0-9_]+:\s*\"[a-z0-9:-]+\"" apps/desktop/src/main/ipc/channels.ts` | 1件以上                           |
| TC-02 | 重複値検出                 | `rg -o "\"[a-z0-9:-]+\"" apps/desktop/src/main/ipc/channels.ts                             | sort                              | uniq -d`    | 0件 |
| TC-03 | skillドメイン命名規則      | `rg -n "skill:" apps/desktop/src/main/ipc/channels.ts`                                     | 規則外0件                         |
| TC-04 | FromSource利用妥当性       | `rg -n "FromSource" apps/desktop/src/main/ipc/channels.ts`                                 | 用途不一致0件                     |
| TC-05 | Source利用妥当性           | `rg -n "Source" apps/desktop/src/main/ipc/channels.ts`                                     | 用途不一致0件                     |
| TC-06 | ipcMain.handle重複登録兆候 | `rg -n "ipcMain\.handle\(" apps/desktop/src/main`                                          | 同一チャネル多重登録0件           |
| TC-07 | preload参照整合            | `rg -n "IPC_CHANNELS\.                                                                     | skill:" apps/desktop/src/preload` | 参照漏れ0件 |
| TC-08 | renderer参照整合           | `rg -n "skill:" apps/desktop/src/renderer`                                                 | 設計外チャネル0件                 |

## 参照資料

| 参照資料        | パス                                                                                        | 内容               |
| --------------- | ------------------------------------------------------------------------------------------- | ------------------ |
| Phase 1成果物   | `outputs/phase-1/acceptance-criteria.md`                                                    | テスト期待値の基準 |
| Phase 2成果物   | `outputs/phase-2/audit-design.md`                                                           | テスト設計の前提   |
| レビュー結果    | `outputs/phase-3/design-review-result.md`                                                   | テスト化対象の指摘 |
| IPC命名規則     | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 判定基準           |
| IPC契約チェック | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | コマンド観点       |
| IPC型解決ガイド | `.claude/skills/aiworkflow-requirements/references/ipc-type-resolution-guide.md`            | P5/P44/P45 観点    |

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

Main/Preload/Renderer の3層で同一チャネルが一貫して参照されるかを、TC-06〜TC-08 で確認する。

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

| 成果物           | パス                                       | 内容                   |
| ---------------- | ------------------------------------------ | ---------------------- |
| テスト仕様書     | `outputs/phase-4/test-specification.md`    | TC一覧と期待値         |
| 検証コマンド集   | `outputs/phase-4/test-commands.md`         | 実行コマンドと判定式   |
| 監査レポート雛形 | `outputs/phase-4/audit-report-template.md` | Phase 5 用テンプレート |

## 完了条件

- [ ] 8件以上のテストケースがID付きで定義されている。
- [ ] 各テストケースにコマンドと期待値が定義されている。
- [ ] 3層整合テスト（Main/Preload/Renderer）が含まれている。
- [ ] Phase 5 で直接実行可能な形式でコマンドが記載されている。

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

- **前提**: Phase 3
- **後続**: Phase 5

## TDD検証（Phase 4, 5, 8 の場合）

```bash
# Red想定の初回検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/completed-tasks/ut-ipc-channel-naming-audit-001
```

## Phase実行記録（全Phase共通）

Phase 4 完了後、以下を記録する。

```markdown
## Phase 4 実行記録

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

`phase-5-implementation.md`
