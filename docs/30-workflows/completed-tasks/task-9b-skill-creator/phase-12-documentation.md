# Phase 12: ドキュメント更新

## メタ情報

| 項目      | 値                         |
| --------- | -------------------------- |
| Phase     | 12                         |
| タスク    | TASK-9B                    |
| 機能名    | task-9b-skill-creator      |
| 作成日    | 2026-02-26                 |
| 前提Phase | Phase 11（手動テスト検証） |
| 次Phase   | Phase 13（PR作成）         |

## 目的

実装した内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

## 事前チェック【必須】

Phase 12は漏れが最も発生しやすいPhase。以下の06-known-pitfalls.mdのPhase 12関連項目を**実行前に必ず確認**すること:

| Pitfall ID | 内容                                    | 対策                                                           |
| ---------- | --------------------------------------- | -------------------------------------------------------------- |
| P1         | LOGS.md 2ファイル更新漏れ               | aiworkflow-requirements + task-specification-creator 両方更新  |
| P2         | topic-map.md 再生成忘れ                 | セクション変更時は必ず generate-index.js 実行                  |
| P3         | 未タスク管理の3ステップ不完全           | ①指示書→②task-workflow.md登録→③関連仕様書リンク                |
| P4         | documentation-changelogへの早期「完了」 | 全Step確認前に「完了」と記載しない                             |
| P25        | LOGS.md 2ファイル更新漏れ（再発）       | P1と同様。Phase 12チェックリストで明示的にチェック             |
| P26        | システム仕様書更新遅延                  | Phase 12完了時点でシステム仕様書を更新する。PRマージを待たない |
| P27        | topic-map.md 再生成トリガー判断ミス     | 追加/削除/更新全てが再生成トリガー                             |
| P28        | スキルフィードバックレポート未作成      | 改善点がなくても「改善点なし」として出力必須                   |
| P29        | SKILL.md 変更履歴の更新漏れ             | LOGS.mdとは別にSKILL.md変更履歴も必ず更新                      |
| P43        | サブエージェント rate limit 中断        | 仕様書更新は3ファイル以下/エージェントに分割                   |

## 実行タスク（5タスク - 全て完了必須）

- Task 12-1: 実装ガイド作成
- Task 12-2: システムドキュメント更新
- Task 12-3: ドキュメント更新履歴 & artifacts.json更新
- Task 12-4: 未タスク検出
- Task 12-5: スキルフィードバックレポート作成

## 参照資料

| 資料名                    | パス                                                                                        | 説明                  |
| ------------------------- | ------------------------------------------------------------------------------------------- | --------------------- |
| Phase 2設計成果物         | `outputs/phase-2/architecture-design.md`                                                    | 設計意図・責務境界    |
| Phase 5実装成果物         | `outputs/phase-5/design-changes.md`                                                         | 実装変更内容          |
| Phase 6テスト拡充成果物   | `outputs/phase-6/coverage-report.md`                                                        | 追加テスト観点        |
| Phase 7カバレッジ成果物   | `outputs/phase-7/coverage-report.md`                                                        | カバレッジ判定結果    |
| Phase 8リファクタ成果物   | `outputs/phase-8/refactoring-report.md`                                                     | 設計改善内容          |
| Phase 9品質成果物         | `outputs/phase-9/quality-report.md`                                                         | 品質ゲート結果        |
| 手動テスト結果            | `outputs/phase-11/manual-test-result.md`                                                    | Phase 11成果物        |
| 最終レビュー結果          | `outputs/phase-10/final-review-result.md`                                                   | Phase 10成果物        |
| 実装コード                | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                               | ドキュメント対象      |
| IPCハンドラ               | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`                                         | IPC実装               |
| Preload API               | `apps/desktop/src/preload/skill-creator-api.ts`                                             | Renderer向けAPI       |
| 共有型（本体）            | `packages/shared/src/types/skillCreator.ts`                                                 | 型定義同期の正本      |
| 共有型（export集約）      | `packages/shared/src/types/index.ts`                                                        | re-export同期確認     |
| 定数定義                  | `apps/desktop/src/main/services/skill/constants.ts`                                         | マジックナンバー排除  |
| 追加ユニットテスト        | `apps/desktop/src/main/services/skill/__tests__/ApiIntegrator.test.ts`                      | Phase 6拡充確認       |
| 仕様更新ガイド            | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`              | 更新手順              |
| 実装ガイドテンプレート    | `.claude/skills/task-specification-creator/assets/implementation-guide-template.md`         | テンプレート          |
| 仕様抽出ガイド            | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                            | 更新対象仕様の特定    |
| 仕様トピック索引          | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                               | セクション粒度の特定  |
| Skillインターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | Skill型定義・IPC契約  |
| Electronサービス設計      | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`               | Facadeパターン・DI    |
| IPCセキュリティ仕様       | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | セキュリティ要件      |
| Agent IPC仕様             | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | IPC契約の正本         |
| アーキテクチャ概要        | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | IPC登録一覧の更新先   |
| タスク運用台帳            | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | 完了/未タスク参照整合 |
| Electron APIセキュリティ  | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                | Preload制約確認       |
| テストパターン            | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`           | 追加テスト方針        |
| API一覧                   | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`                        | 実装状況テーブル更新  |
| セキュリティ原則          | `.claude/skills/aiworkflow-requirements/references/security-principles.md`                  | 更新判断の原則        |
| 品質基準                  | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | 完了判定の品質基準    |
| Claude Codeスキル構造     | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-structure.md`         | スキル構成            |
| 実装パターン              | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | パターン集            |
| IPC契約チェックリスト     | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | IPC検証手順           |
| 教訓集                    | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 過去の知見            |

## 実行手順

### Task 12-1: 実装ガイド作成【必須】

**2パート構成**の実装ガイドを作成する。テンプレート `assets/implementation-guide-template.md` を使用。

#### Part 1: 概念的な説明（中学生でもわかる版）

| セクション                 | 内容                                                                                                                                                               |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| スキルクリエイターって何？ | 「料理レシピの自動生成マシンのようなもの。材料（要件）を入れると、レシピ（スキル）が出てくる。さらに既存のレシピを改善したり、複数のレシピを組み合わせたりできる」 |
| 12のコマンドとは？         | 「料理マシンについている12個のボタンのようなもの。『新しいレシピを作る(chat)』『外国の料理を翻訳する(api)』『味を良くする(improve)』ボタンがある」                 |
| Facadeパターンとは？       | 「家電量販店の受付カウンターのようなもの。お客さん（Renderer）が何を買いたいか伝えると、担当スタッフ（サブコンポーネント）が裏で準備してくれる」                   |
| IPC通信とは？              | 「注文伝票のようなもの。お客さん（画面）が注文伝票（IPC）に書いて裏方（Main Process）に渡し、裏方が結果を伝票で返す」                                              |
| Claude Agent SDKとは？     | 「翻訳者のようなもの。人間の言葉（自然言語の要件）をAIが理解できる言葉に変換し、AIの回答を人間に返す」                                                             |

#### Part 2: 技術的な詳細（開発者向け）

| セクション              | 内容                                                                                   |
| ----------------------- | -------------------------------------------------------------------------------------- |
| SkillCreatorService API | Facadeの全12公開メソッドのシグネチャ・引数・戻り値・使用例                             |
| サブコンポーネント構成  | HearingFacilitator, TaskGenerator, CodeGenerator, APIIntegrator, Validatorの関係と責務 |
| 型定義一覧              | SkillCreatorMode, CreateSkillOptions, ExecutionReport, SkillCreatorConfig等の定義      |
| IPCチャンネル一覧       | skill-creator関連の全IPCチャンネル名・引数型・戻り値型                                 |
| Claude Agent SDK連携    | query() API呼び出しパターン、Hooksシステム、PermissionControl設定                      |
| エラーハンドリング      | エラーコード一覧（カテゴリ別）、各コマンド固有のエラーと復旧手順                       |
| 設定パラメータ一覧      | タイムアウト、リトライ回数、最大同時実行数等の設定値と変更方法                         |
| セキュリティ設計        | 3段バリデーション（P42）、sender検証、パストラバーサル防御                             |
| 拡張ポイント            | 新規コマンド追加方法、カスタムエージェント追加方法                                     |

### Task 12-2: システムドキュメント更新【必須】

> **重要**: 詳細手順は `references/spec-update-workflow.md` を参照
> **重要**: 仕様書更新は3ファイル以下/エージェントに分割すること（P43対策）

#### Step 1-A: タスク完了記録【必須・全項目チェック】

- [ ] `interfaces-agent-sdk-skill.md` に「完了タスク」セクション追加（SkillCreatorService全12コマンドのAPI記録）
- [ ] `arch-electron-services.md` にSkillCreatorService統合記録追加（Facadeパターン・サブコンポーネント構成）
- [ ] `security-skill-ipc.md` にskill-creator IPCチャンネルのセキュリティ記録追加（3段バリデーション・sender検証）
- [ ] `task-workflow.md` に完了/未タスク参照リンク整合を反映（移管/削除の同期）
- [ ] `aiworkflow-requirements/LOGS.md` にタスク完了エントリ追加
- [ ] `task-specification-creator/LOGS.md` にタスク完了記録追加（**2ファイル両方必須** P1/P25対策）
- [ ] `aiworkflow-requirements/SKILL.md` 変更履歴テーブル更新（P29対策）
- [ ] `task-specification-creator/SKILL.md` 変更履歴テーブル更新（P29対策）

**更新対象仕様書テーブル（Step 1-A）**:

| 仕様書                              | 更新内容                                       | 必須 |
| ----------------------------------- | ---------------------------------------------- | ---- |
| interfaces-agent-sdk-skill.md       | SkillCreatorService API定義・12コマンドI/F追加 | ✅   |
| arch-electron-services.md           | Facadeパターン・DI設計記録                     | ✅   |
| security-skill-ipc.md               | skill-creator IPCセキュリティ要件              | ✅   |
| aiworkflow-requirements/LOGS.md     | タスク完了エントリ                             | ✅   |
| task-specification-creator/LOGS.md  | タスク完了エントリ                             | ✅   |
| aiworkflow-requirements/SKILL.md    | 変更履歴                                       | ✅   |
| task-specification-creator/SKILL.md | 変更履歴                                       | ✅   |

#### Step 1-B: 実装状況テーブル更新【必須】

- [ ] `api-endpoints.md` のskill-creator関連チャンネルステータスを「完了」に更新

#### Step 1-C: 関連タスクテーブル更新【必須】

- [ ] `grep -rn "TASK-9B" .claude/skills/aiworkflow-requirements/references/` で関連仕様書を検索して更新
- [ ] `grep -rn "skill-creator" .claude/skills/aiworkflow-requirements/references/` で追加の関連箇所を確認

```bash
# Step 1-C 発見手順
grep -rn "TASK-9B" .claude/skills/aiworkflow-requirements/references/
grep -rn "skill-creator" .claude/skills/aiworkflow-requirements/references/
```

#### Step 1-D: topic-map.md 再生成【必須】（P2/P27対策）

- [ ] `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行してtopic-map.mdを再生成

```bash
# topic-map.md再生成
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

#### Step 1-E: 未タスク参照リンク整合チェック【必須】

- [ ] `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js` を実行して `ALL_LINKS_EXIST` を確認

```bash
# task-workflow.md 内の未タスクリンク参照切れ検証
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
```

#### Step 1-F: 本ブランチ差分の反映漏れチェック【必須】

- [ ] `git status --porcelain` の差分ファイルが本タスク仕様書群（`docs/30-workflows/completed-tasks/task-9b-skill-creator/`）に明示されている
- [ ] 旧仕様書パスの削除/移管（task-013e, task-014, task-020a）が Phase 12成果物に記録されている
- [ ] `packages/shared/src/types/index.ts` / `skillCreator.ts` / `constants.ts` / `ApiIntegrator.test.ts` の4ファイルが成果物またはサマリーに明示されている

#### Step 2: システム仕様更新【必須】

SkillCreatorServiceは新規インターフェース追加・アーキテクチャ変更に該当するため、更新が必要。

- [ ] `interfaces-agent-sdk-skill.md` にSkillCreatorServiceのインターフェース定義追加（12コマンドの型定義）
- [ ] `arch-electron-services.md` にSkillCreatorServiceのアーキテクチャ記録追加（Facade・サブコンポーネント構成図）
- [ ] `security-skill-ipc.md` に新規IPCチャンネルのセキュリティ要件追加
- [ ] `claude-code-skills-overview.md` にskill-creatorスキルの登録確認

**IPC機能開発時の追加更新対象テーブル**:

| #   | 更新対象ファイル                        | 更新内容                                                     | 必須/任意 |
| --- | --------------------------------------- | ------------------------------------------------------------ | --------- |
| 1   | api-ipc-agent.md                        | 新規チャンネル一覧（12コマンド対応）、型定義、完了タスク記録 | 必須      |
| 2   | security-electron-ipc.md                | 3段バリデーション・sender検証パターン                        | 必須      |
| 3   | architecture-overview.md                | IPCハンドラー登録一覧へのskill-creator追加                   | 必須      |
| 4   | interfaces-agent-sdk-skill.md           | SkillCreatorServiceインターフェース定義                      | 必須      |
| 5   | task-workflow.md                        | 残課題テーブル更新・完了タスクセクション追加                 | 必須      |
| 6   | lessons-learned.md                      | 実装中の教訓（苦戦箇所がある場合）                           | 任意      |
| 7   | architecture-implementation-patterns.md | 新規パターン（Facadeパターン適用等）                         | 任意      |

#### Step 3: IPC契約検証【必須 - IPC機能追加のため】

> **重要**: skill-creatorは新規IPCチャンネルを追加するため、`ipc-contract-checklist.md` Phase 1-6 の実施が必須。

- [ ] **Phase 1**: チャンネル名がIPC_CHANNELS定数で管理されていること
- [ ] **Phase 2**: ハンドラ引数形式とPreload側（skill-creator-api.ts）の呼び出し形式が一致していること（P44対策）
- [ ] **Phase 3**: 引数名のセマンティクスが実際に渡される値と一致していること（P45対策）
- [ ] **Phase 4**: P42準拠3段バリデーション（型チェック → 空文字列 → トリム空文字列）が全ハンドラに適用されていること
- [ ] **Phase 5**: エラーレスポンスがサニタイズされていること（内部パス情報・スタックトレースが含まれていないこと）
- [ ] **Phase 6**: validateIpcSenderが全skill-creator:\*ハンドラに適用されていること

**検証コマンド**:

```bash
# ハードコード文字列チャンネルの検出（P27対策）
grep -rn "safeInvoke\|safeOn" apps/desktop/src/preload/skill-creator-api.ts | grep -v "IPC_CHANNELS"

# .trim()バリデーション漏れの検出（P42対策）
grep -rn "skill-creator" apps/desktop/src/main/ipc/skillCreatorHandlers.ts | grep -v "trim"

# 引数命名の一致確認（P45対策）
grep -rn "skillName\|skillId" apps/desktop/src/main/ipc/skillCreatorHandlers.ts | head -20
```

**IPC契約検証結果テーブル**:

| Phase | 項目                  | 確認結果 |
| ----- | --------------------- | -------- |
| 1     | チャンネル名定数管理  | -        |
| 2     | 引数形式一致          | -        |
| 3     | 引数名セマンティクス  | -        |
| 4     | 3段バリデーション     | -        |
| 5     | エラーサニタイズ      | -        |
| 6     | validateIpcSender適用 | -        |

### ⚠️ よくある誤判断パターン

| 誤判断パターン                                 | 正しい判断       | 理由                                                                  |
| ---------------------------------------------- | ---------------- | --------------------------------------------------------------------- |
| 「既存型を再利用しているので更新不要」         | **Step 1-B必須** | 実装状況テーブルの更新は必須                                          |
| 「内部実装のみなので更新不要」                 | **Step 1-A必須** | タスク完了記録は常に必須                                              |
| 「関連タスクテーブルは確認不要」               | **Step 1-C必須** | 仕様書内の「未タスク候補」テーブルにTASK-9Bが記載されている可能性あり |
| 「task-specification-creator/LOGS.mdは後で」   | **Step 1-A必須** | 両方のLOGS.mdを同時に更新すること                                     |
| 「topic-map.mdはセクション追加がないので不要」 | **Step 1-D必須** | 追加/削除/更新全てが再生成トリガー（P27対策）                         |
| 「SKILL.mdの変更履歴は後で」                   | **Step 1-A必須** | LOGS.mdとは別にSKILL.md変更履歴も同時に更新すること（P29対策）        |
| 「LOGS.mdに先に完了を書いて後で更新」          | **最後に書く**   | 全ファイル更新後の最終ステップとして記録する（P43対策）               |

### Task 12-3: ドキュメント更新履歴・仕様更新サマリー・artifacts同期【必須】

```bash
# ドキュメント更新履歴生成
node scripts/generate-documentation-changelog.js --workflow docs/30-workflows/completed-tasks/task-9b-skill-creator

# 仕様更新サマリー作成（Step 1-A〜Step 3の結果を記録）
cat > docs/30-workflows/completed-tasks/task-9b-skill-creator/outputs/phase-12/spec-update-summary.md <<'EOF'
# spec-update-summary

## Step 1-A
- 実施内容:
- 更新ファイル:

## Step 1-B
- 実施内容:
- 更新ファイル:

## Step 1-C
- 実施内容:
- 更新ファイル:

## Step 1-D
- 実施内容:
- 更新ファイル:

## Step 2
- 実施内容:
- 更新ファイル:

## Step 3
- 実施内容:
- 更新ファイル:
EOF

# Phase 12完了登録（artifacts.json更新）
node scripts/complete-phase.js \
  --workflow docs/30-workflows/completed-tasks/task-9b-skill-creator \
  --phase 12 \
  --artifacts "outputs/phase-12/implementation-guide.md:実装ガイド,outputs/phase-12/documentation-changelog.md:ドキュメント更新履歴,outputs/phase-12/spec-update-summary.md:仕様更新サマリー,outputs/phase-12/unassigned-task-detection.md:未タスク検出レポート,outputs/phase-12/skill-feedback-report.md:スキルフィードバックレポート,outputs/phase-12/elegant-solution-audit.md:整合性監査台帳"
```

### Task 12-4: 未タスク検出【必須 - 0件でも出力必須】

以下の全ソースから未タスクを検出する:

| #   | ソース                 | 確認項目                      |
| --- | ---------------------- | ----------------------------- |
| 1   | Phase 3レビュー結果    | MINOR判定の指摘事項           |
| 2   | Phase 10レビュー結果   | MINOR判定の指摘事項           |
| 3   | Phase 11手動テスト結果 | スコープ外の発見事項          |
| 4   | 各Phase成果物          | 「将来対応」「TODO」「FIXME」 |
| 5   | コードベース           | TODO/FIXME/HACK/XXXコメント   |

```bash
# コードベース内のTODO/FIXME検出
grep -rn "TODO\|FIXME\|HACK\|XXX" apps/desktop/src/main/services/skill/ --include="*.ts"
grep -rn "TODO\|FIXME\|HACK\|XXX" apps/desktop/src/preload/ --include="*.ts" | grep -i "skill"
```

検出した未タスクは**3ステップ全完了**（P3対策）:

1. `docs/30-workflows/unassigned-task/` に指示書作成（P38対策: `unassigned-task/` 配下に配置）
2. `task-workflow.md` 残課題テーブルに登録
3. 関連仕様書に参照リンク追加

**想定される未タスク候補**:

- 12コマンドのうち未実装のコマンドがある場合のphase対応
- パフォーマンス最適化（スキル生成60秒超過の場合）
- UI統合の追加改善（ChatPanel以外のUI連携）

### Task 12-5: スキルフィードバックレポート作成【必須 - 改善点なしでも出力必須】（P28対策）

以下のセクションを含むレポートを作成:

| セクション         | 記載内容                                                   |
| ------------------ | ---------------------------------------------------------- |
| ワークフロー改善点 | Phase実行中に発見したワークフロー上の改善提案              |
| 技術的教訓         | 実装中に得られた技術的な知見・注意点                       |
| スキル改善提案     | task-specification-creator/skill-creatorスキルへの改善提案 |
| 新規Pitfall候補    | 06-known-pitfalls.mdに追加すべき新規Pitfall                |

**苦戦箇所の記録テンプレート**:

```markdown
## 苦戦箇所

### 1. {{問題の概要}}

- **症状**: {{具体的な症状}}
- **原因**: {{根本原因}}
- **解決策**: {{採用した解決策}}
- **学び**: {{教訓}}
- **関連Pitfall**: {{該当する場合はPitfall ID}}
```

## アーキテクチャ層別ドキュメント

| 層           | ドキュメント内容                            | 更新対象                                         |
| ------------ | ------------------------------------------- | ------------------------------------------------ |
| Main Process | SkillCreatorService設計、サブコンポーネント | `architecture-*.md`, `arch-electron-services.md` |
| IPC          | チャンネル定義、バリデーション              | `api-ipc-agent.md`, `security-*.md`              |
| Preload      | API定義、型安全                             | `interfaces-*.md`                                |
| Shared       | 共有型定義                                  | `interfaces-agent-sdk-skill.md`                  |

## 成果物

| 成果物                       | パス                                            | 必須 | 説明                               |
| ---------------------------- | ----------------------------------------------- | ---- | ---------------------------------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`      | ✅   | Part 1（概念的）+ Part 2（技術的） |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`   | ✅   | 更新した仕様書の変更内容記録       |
| 仕様更新サマリー             | `outputs/phase-12/spec-update-summary.md`       | ✅   | Step 1-A〜Step 3の実施結果         |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md` | ✅   | 検出結果（0件でも出力必須）        |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`     | ✅   | 改善提案（改善点なしでも出力）     |
| 整合性監査台帳               | `outputs/phase-12/elegant-solution-audit.md`    | ✅   | 差分網羅・依存整合・矛盾監査       |
| artifacts同期台帳            | `outputs/artifacts.json`                        | ✅   | `artifacts.json` との同期確認      |
| 未完了タスク指示書           | `docs/30-workflows/unassigned-task/*.md`        | 条件 | 検出時のみ作成                     |

## 完了条件チェックリスト（P4対策 - 全Step確認前に「完了」と記載しない）

### Task 12-1: 実装ガイド（4項目）

- [ ] 1. 実装ガイド Part 1（中学生レベル概念説明 — 日常例え必須）が作成されている
- [ ] 2. 実装ガイド Part 1 にskill-creatorを「スキルの工場/料理レシピ自動生成マシン」に例えた説明が含まれている
- [ ] 3. 実装ガイド Part 2（技術的詳細 — 12コマンド全APIシグネチャ記載）が作成されている
- [ ] 4. 実装ガイド Part 2 にClaude Agent SDK query() API、Facadeパターン、IPC契約、型定義が記載されている

### Task 12-2 Step 1-A: タスク完了記録（7項目）

- [ ] 5. `interfaces-agent-sdk-skill.md` にSkillCreatorService完了記録が追加されている
- [ ] 6. `arch-electron-services.md` にSkillCreatorService統合記録が追加されている
- [ ] 7. `security-skill-ipc.md` にskill-creator IPCセキュリティ記録が追加されている
- [ ] 8. `aiworkflow-requirements/LOGS.md` が更新されている（P1/P25対策）
- [ ] 9. `task-specification-creator/LOGS.md` が更新されている（**2ファイル両方** P1/P25対策）
- [ ] 10. `aiworkflow-requirements/SKILL.md` 変更履歴が更新されている（P29対策）
- [ ] 11. `task-specification-creator/SKILL.md` 変更履歴が更新されている（P29対策）

### Task 12-2 Step 1-B〜1-E: テーブル更新・再生成・リンク整合（4項目）

- [ ] 12. Step 1-B: 実装状況テーブルをskill-creator関連チャンネル「完了」に更新した
- [ ] 13. Step 1-C: `grep -rn "TASK-9B"` で検出された関連仕様書のタスクテーブルを更新した
- [ ] 14. Step 1-D: `topic-map.md` が再生成されている（P2/P27対策）
- [ ] 15. Step 1-E: `verify-unassigned-links.js` で未タスクリンク参照切れ0件を確認した

### Task 12-2 Step 2: システム仕様更新（4項目）

- [ ] 16. `api-ipc-agent.md` にskill-creator関連チャンネル一覧・型定義が追加されている
- [ ] 17. `architecture-overview.md` のIPCハンドラー登録一覧にskill-creatorが追加されている
- [ ] 18. `interfaces-agent-sdk-skill.md` にSkillCreatorServiceインターフェース定義が追加されている
- [ ] 19. `task-workflow.md` の `TASK-9B-H` 完了参照が `completed-tasks/skill-creator-ipc/` に正規化されている

### Task 12-2 Step 3: IPC契約検証（3項目）

- [ ] 20. `ipc-contract-checklist.md` Phase 1-6 の全項目が確認済みである
- [ ] 21. P42準拠3段バリデーションが全skill-creator:\*ハンドラに適用されていることを確認した
- [ ] 22. ハンドラ引数名のセマンティクスが実際の値と一致していることを確認した（P45対策）

### Task 12-3: ドキュメント更新履歴・仕様更新サマリー・artifacts同期（3項目）

- [ ] 23. ドキュメント更新履歴が各Stepの実施状況を含めて作成されている
- [ ] 24. `outputs/phase-12/spec-update-summary.md` が作成され、Step 1-A〜Step 3の結果を記録している
- [ ] 25. `artifacts.json` と `outputs/artifacts.json` が同期し、Phase 12 ステータスが `completed` になっている

### Task 12-4: 未タスク検出（3項目）

- [ ] 26. 未タスク検出レポートが出力されている（**0件でも出力必須**）
- [ ] 27. 検出された未タスクに対して3ステップ全完了している（P3/P38対策: ①指示書 → ②task-workflow.md → ③関連仕様書リンク）
- [ ] 28. `unassigned-task-detection.md` の件数・ステータスが更新されている

### Task 12-5: スキルフィードバック（2項目）

- [ ] 29. スキルフィードバックレポートが出力されている（**改善点なしでも出力必須** P28対策）
- [ ] 30. 苦戦箇所セクションが記録されている（苦戦がなくても「特記事項なし」と記載）

### 最終確認（2項目）

- [ ] 31. LOGS.md記録は全ファイル更新後の最終ステップとして実行済み（P43対策）
- [ ] 32. **本Phase内の全タスク（5タスク）を100%実行完了**

## 漏れやすいポイントテーブル

| ID  | ポイント                            | 対策                                                      |
| --- | ----------------------------------- | --------------------------------------------------------- |
| P1  | LOGS.md 2ファイル更新漏れ           | aiworkflow-requirements + task-specification-creator 両方 |
| P2  | topic-map.md 再生成忘れ             | セクション変更時は必ず generate-index.js 実行             |
| P3  | 未タスク管理の3ステップ不完全       | ①指示書→②task-workflow.md登録→③関連仕様書リンク           |
| P4  | 早期「完了」記載                    | 全Step確認前に「完了」と記載しない                        |
| P27 | topic-map.md 再生成トリガー判断ミス | 追加/削除/更新全てが再生成トリガー                        |
| P29 | SKILL.md 変更履歴更新漏れ           | LOGS.mdとは別にSKILL.md変更履歴も必ず更新                 |
| P38 | 未タスク配置ディレクトリ間違い      | `unassigned-task/` 配下に配置（`tasks/` 直下ではない）    |
| P43 | サブエージェント rate limit         | 仕様書更新は3ファイル以下/エージェントに分割              |

## フォールバック手順

| スクリプト                            | 代替手順                               |
| ------------------------------------- | -------------------------------------- |
| `generate-documentation-changelog.js` | 手動でdocumentation-changelog.mdを作成 |
| `complete-phase.js`                   | 手動でartifacts.jsonを編集             |
| `detect-unassigned-tasks.js`          | 手動で各Phaseのレビュー結果を確認      |
| `generate-index.js`                   | 手動でtopic-map.mdを編集（非推奨）     |

## 統合テスト連携【必須】

| テスト項目         | 確認内容                              | 期待結果       | 実行結果   |
| ------------------ | ------------------------------------- | -------------- | ---------- |
| 実装ガイド整合性   | Part 2の型定義が実装コードと一致      | 不一致箇所なし | {{RESULT}} |
| IPC仕様書整合性    | 仕様書のIPCチャンネル定義が実装と一致 | 不一致箇所なし | {{RESULT}} |
| 未タスク検出網羅性 | 全Phaseの成果物をスキャンしたか       | 漏れなし       | {{RESULT}} |

## 多角的チェック観点（AIが判断）

| 観点                   | 適用判断                                      | 仕様参照先                                                                        |
| ---------------------- | --------------------------------------------- | --------------------------------------------------------------------------------- |
| ドキュメント完全性     | 全12コマンドのAPI文書化                       | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` |
| 仕様書整合性           | 実装と仕様書の乖離がないこと                  | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`      |
| セキュリティ文書化     | 3段バリデーション・sender検証が記録されている | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`         |
| 未タスク管理の完全性   | 3ステップ全完了                               | `06-known-pitfalls.md#P3`                                                         |
| Phase 12チェックリスト | 全Pitfall対策を確認済み                       | `05-task-execution.md#Phase 12`                                                   |

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 事前チェック（06-known-pitfalls.md Phase 12関連項目確認）
2. 参照資料の確認
3. Task 12-1: 実装ガイド作成（Part 1 + Part 2）
4. Task 12-2 Step 1-A: タスク完了記録（7ファイル）
5. Task 12-2 Step 1-B: 実装状況テーブル更新
6. Task 12-2 Step 1-C: 関連タスクテーブル更新
7. Task 12-2 Step 1-D: topic-map.md再生成
8. Task 12-2 Step 1-E: 未タスク参照リンク整合チェック
9. Task 12-2 Step 2: システム仕様更新（3ファイル以下/バッチ）
10. Task 12-3: ドキュメント更新履歴・仕様更新サマリー・artifacts同期
11. Task 12-4: 未タスク検出（3ステップ完了確認）
12. Task 12-5: スキルフィードバックレポート作成
13. 完了条件チェックリストの全項目検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスク（5タスク）を100%実行完了
- [ ] 各タスクの成果物が生成されている（6必須ファイル + artifacts同期台帳）
- [ ] artifacts.jsonが全Phase completedに更新されている
- [ ] 完了条件チェックリストの全項目にチェック済み
- [ ] LOGS.md記録は全ファイル更新後の最終ステップとして実行済み（P43対策）

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-9b-skill-creator --phase 12
```

## 次のPhase

Phase 13: PR作成
