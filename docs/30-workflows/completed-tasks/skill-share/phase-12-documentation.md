# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                                                    |
| ---------- | ----------------------------------------------------------------------- |
| Phase番号  | 12                                                                      |
| Phase名    | ドキュメント更新                                                        |
| 目的       | 実装ガイド作成・システム仕様書更新・IPC契約検証・未タスク検出を実行する |
| 前提Phase  | Phase 11（手動テスト検証）                                              |
| 後続Phase  | Phase 13（PR作成）                                                      |
| ステータス | 未実施                                                                  |
| 作成日     | 2026-02-27                                                              |
| 機能名     | skill-share                                                             |

---

## 目的

TASK-9F「スキル共有・インポート機能」の実装内容をドキュメント化し、システム仕様書を最新の実装に同期する。未タスクの検出と管理を行い、スキルの改善提案を記録する。

> **注意**: Phase 12は漏れが最も発生しやすいPhaseである（P1, P2, P3, P4, P25, P26, P27, P28, P43参照）。全タスク・全チェックリストを逐次確認し、タスク完了前に「完了」と記載しないこと。

---

## 実行タスク

- 実装ガイド作成: Part 1（概念的説明）+ Part 2（技術的詳細）+ APIドキュメント
- システム仕様書更新: spec-update-workflow.md準拠のStep 1-A〜1-D, Step 2, Step 3
- documentation-changelog.md: 更新した全仕様書の変更内容を記録
- 未タスク検出: 6つのソースからの検出 + 3ステップ管理
- スキルフィードバック: 改善点の記録（0件でもレポート作成必須）

---

## 参照資料

| 参照資料                 | パス                                                                                    | 内容                                    |
| ------------------------ | --------------------------------------------------------------------------------------- | --------------------------------------- |
| 仕様更新ワークフロー     | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`          | Phase 12 Task 2の実行手順               |
| 未タスクガイドライン     | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`    | 検出ソース・3ステップ管理手順           |
| 技術ドキュメントガイド   | `.claude/skills/task-specification-creator/references/technical-documentation-guide.md` | 実装ガイド作成基準                      |
| IPC仕様                  | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                    | 更新対象のIPC仕様書                     |
| セキュリティ仕様         | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`            | セキュリティ検証パターン                |
| IPC契約チェックリスト    | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`           | IPC契約検証Phase 1-6                    |
| Phase 5 実装仕様         | `docs/30-workflows/skill-share/phase-5-implementation.md`                               | 実装変更範囲の一次ソース                |
| Phase 6 テスト拡充       | `docs/30-workflows/skill-share/phase-6-test-expansion.md`                               | 統合/異常系テスト追加の証跡             |
| Phase 7 カバレッジ確認   | `docs/30-workflows/skill-share/phase-7-coverage-check.md`                               | カバレッジ最終値                        |
| Phase 8 リファクタリング | `docs/30-workflows/skill-share/phase-8-refactoring.md`                                  | リファクタ内容と挙動不変根拠            |
| Phase 9 品質保証         | `docs/30-workflows/skill-share/phase-9-quality-assurance.md`                            | Lint/型/セキュリティの最終検証          |
| Phase 10 最終レビュー    | `docs/30-workflows/skill-share/phase-10-final-review.md`                                | レビュー判定と指摘事項                  |
| 実装コード               | `apps/desktop/src/main/services/skill/SkillShareManager.ts`                             | メインの実装ファイル                    |
| 共有型定義               | `packages/shared/src/types/skill-share.ts`                                              | ShareTarget/ImportResult/ExportResult型 |
| 要件定義書               | `outputs/phase-1/acceptance-criteria.md`                                                | 要件情報                                |
| 設計書                   | `outputs/phase-2/architecture-design.md`                                                | アーキテクチャ設計                      |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`                                                | Phase 11テスト結果                      |
| P1対策                   | `.claude/rules/06-known-pitfalls.md#P1`                                                 | LOGS.md 2ファイル更新漏れ               |
| P2対策                   | `.claude/rules/06-known-pitfalls.md#P2`                                                 | topic-map.md再生成忘れ                  |
| P3対策                   | `.claude/rules/06-known-pitfalls.md#P3`                                                 | 未タスク管理3ステップ不完全             |
| P4対策                   | `.claude/rules/06-known-pitfalls.md#P4`                                                 | documentation-changelog早期完了記載     |
| P38対策                  | `.claude/rules/06-known-pitfalls.md#P38`                                                | 未タスク配置ディレクトリ間違い          |
| P43対策                  | `.claude/rules/06-known-pitfalls.md#P43`                                                | サブエージェントrate limit中断          |

---

## システム仕様（aiworkflow-requirements）

| 仕様書                                    | 更新内容                                                                                |
| ----------------------------------------- | --------------------------------------------------------------------------------------- |
| `api-ipc-agent.md`                        | 新規3チャネル（`skill:importFromSource`, `skill:export`, `skill:validateSource`）の追加 |
| `security-electron-ipc.md`                | 新規チャネルのセキュリティ検証パターン追加                                              |
| `security-skill-ipc.md`                   | P42/P44/P45観点での入力検証・Sender検証の更新                                           |
| `security-api-electron.md`                | Preload公開API境界の更新（contextBridge）                                               |
| `architecture-overview.md`                | IPCハンドラ登録一覧に新規3チャネルを追加                                                |
| `interfaces-agent-sdk-skill.md`           | ShareTarget/ImportResult/ExportResult型定義の追加                                       |
| `quality-requirements.md`                 | テスト品質・非機能要件の更新要否判断                                                    |
| `task-workflow.md`                        | 残課題テーブル更新・TASK-9F完了タスクセクション追加                                     |
| `lessons-learned.md`                      | 実装教訓の記録（該当する場合）                                                          |
| `architecture-implementation-patterns.md` | 実装パターンの記録（該当する場合）                                                      |

---

## 実行手順

### Task 1: 実装ガイド作成

#### Part 1: 概念的説明（中学生レベル）

以下の構成で `outputs/phase-12/implementation-guide.md` の Part 1 を作成する。

**必須要素**:

1. **身近な例えによる説明**:
   - 「スキル共有は、友達にレシピをコピーしてあげるようなもの」
   - 「GitHubは料理本の図書館、Gistは1枚のレシピカード、URLはレシピのリンク、ローカルは自分のノートからの写し」
   - 「エクスポートは、自分のレシピを料理本に載せたり、友達にカードで渡すこと」

2. **なぜこの機能が必要か**:
   - ユーザーが作ったスキルを他の人と共有できるようにする
   - 他の人が公開したスキルを自分の環境に取り込める
   - スキルの再利用性を高め、コミュニティの発展を促進する

3. **全体像の図**:
   ```
   [GitHub/Gist/URL/ローカル] → importFromSource → [~/.aiworkflow/skills/]
   [~/.aiworkflow/skills/]    → export           → [Gist/ローカル]
   ```

#### Part 2: 技術的詳細（開発者向け）

以下の構成で Part 2 を作成する。

**必須要素**:

1. **ファイル構成**:
   - 新規作成ファイル（2ファイル）:
     - `apps/desktop/src/main/services/skill/SkillShareManager.ts`
     - `packages/shared/src/types/skill-share.ts`
   - 修正ファイル（5ファイル）:
     - `packages/shared/src/types/index.ts`
     - `apps/desktop/src/main/ipc/skillHandlers.share.ts`
     - `apps/desktop/src/preload/channels.ts`
     - `apps/desktop/src/preload/skill-api.ts`
     - `apps/desktop/src/preload/types.ts`

2. **型定義詳細**:
   - `ShareTarget` — インポート/エクスポート先の指定（type: "github" | "gist" | "url" | "local"）
   - `ImportResult` — インポート結果（成功/失敗、インポートされたスキル情報）
   - `ExportResult` — エクスポート結果（成功/失敗、shareUrl）

3. **SkillShareManagerのメソッド一覧と使用例**:
   - `importFromSource(source: ShareTarget): Promise<ImportResult>`
   - `export(skillName: string, target: ShareTarget): Promise<ExportResult>`
   - `validateSource(source: ShareTarget): Promise<ValidationResult>`

4. **IPC通信フロー**:

   ```
   Renderer (DevTools/UI)
     ↓ window.electronAPI.skill.importFromSource(source)
   Preload (skill-api.ts)
     ↓ safeInvoke(IPC_CHANNELS.SKILL_IMPORT_FROM_SOURCE, source)
   Main (skillHandlers.ts)
     ↓ P42準拠3段バリデーション
   SkillShareManager
     ↓ GitHub API / Gist API / fetch / fs.copy
   External API / File System
   ```

5. **Date型のIPC境界処理**:
   - IPC境界を越えるDate型はISO 8601文字列（`toISOString()`）に変換
   - Renderer側で受け取り時に `new Date(isoString)` で復元

6. **テスト構成と実行方法**:
   - テストファイルの場所と実行コマンド
   - `cd apps/desktop && pnpm vitest run src/main/services/skill/SkillShareManager.test.ts`

#### IPCドキュメント

`outputs/phase-12/ipc-documentation.md` として以下を作成する。

| チャネル                 | メソッド                                             | リクエスト            | レスポンス         | エラーコード                                                   |
| ------------------------ | ---------------------------------------------------- | --------------------- | ------------------ | -------------------------------------------------------------- |
| `skill:importFromSource` | `window.electronAPI.skill.importFromSource(source)`  | `ShareTarget`         | `ImportResult`     | 1000（バリデーション）, 3000（外部サービス）, 4000（インフラ） |
| `skill:export`           | `window.electronAPI.skill.export(skillName, target)` | `string, ShareTarget` | `ExportResult`     | 1000, 2000（ビジネス）, 3000                                   |
| `skill:validateSource`   | `window.electronAPI.skill.validateSource(source)`    | `ShareTarget`         | `ValidationResult` | 1000                                                           |

---

### Task 2: システム仕様書更新（spec-update-workflow.md準拠）

> **P43対策**: 仕様書更新は3ファイル以下/エージェントに分割する。LOGS.mdへの「完了」記録は全ファイル更新後の最終ステップとする。

#### Step 1-A: タスク完了記録

- [ ] 該当仕様書（`api-ipc-agent.md`）にTASK-9F完了記録を追加
- [ ] `aiworkflow-requirements/LOGS.md` を更新（**P1/P25対策: 2ファイルのうち1つ目**）
- [ ] `task-specification-creator/LOGS.md` を更新（**P1/P25対策: 2ファイルのうち2つ目**）
- [ ] `aiworkflow-requirements/SKILL.md` の変更履歴テーブルを更新
- [ ] `task-specification-creator/SKILL.md` の変更履歴テーブルを更新

#### Step 1-B: 実装状況テーブル更新

- [ ] `api-ipc-agent.md` に新規3チャネル（`skill:importFromSource`, `skill:export`, `skill:validateSource`）を追加
- [ ] `interfaces-agent-sdk-skill.md` に `ShareTarget`, `ImportResult`, `ExportResult`, `ValidationResult` 型定義を追加

#### Step 1-C: 関連タスクテーブル更新

- [ ] `grep -rn "TASK-9F" .claude/skills/aiworkflow-requirements/references/` で関連仕様書を検索
- [ ] `grep -rn "TASK-9F" .claude/skills/task-specification-creator/references/` で関連仕様書を検索
- [ ] 検出された各仕様書のTASK-9F関連セクションを更新

#### Step 1-D: topic-map.md再生成

- [ ] `node .claude/skills/aiworkflow-requirements/scripts/generate-index.mjs` を実行（**P2/P27対策: 仕様書に変更があれば常に再生成**）
- [ ] 再生成後のtopic-map.mdに新規チャネルが反映されていることを確認

#### Step 2: システム仕様更新（IPC機能開発のため全項目必須）

以下の仕様書を更新する。P43対策として、3ファイル以下の単位で分割して更新する。

**更新グループ1（IPC・セキュリティ）**:

- [ ] `api-ipc-agent.md` — 新規3チャネルの一覧・リクエスト/レスポンス型定義・バリデーションルール
- [ ] `security-electron-ipc.md` — 新規チャネルのセキュリティ検証パターン（送信元検証、P42準拠3段バリデーション、パストラバーサル防止）
- [ ] `architecture-overview.md` — IPCハンドラ登録一覧に新規3チャネルを追加

**更新グループ2（インターフェース・ワークフロー）**:

- [ ] `interfaces-agent-sdk-skill.md` — `ShareTarget`, `ImportResult`, `ExportResult`, `ValidationResult` のインターフェース定義を追加
- [ ] `task-workflow.md` — 残課題テーブル更新、TASK-9F完了タスクセクション追加

**更新グループ3（任意）**:

- [ ] `lessons-learned.md` — TASK-9F実装中の教訓を記録（該当する場合のみ）
- [ ] `architecture-implementation-patterns.md` — 新規実装パターンを記録（該当する場合のみ）

#### Step 3: IPC契約検証（IPC機能開発のため必須）

`ipc-contract-checklist.md` のPhase 1-6を実施する。

- [ ] **Phase 1**: チャネル名が `IPC_CHANNELS` 定数で定義されている（ハードコード文字列なし）
- [ ] **Phase 2**: ハンドラ引数形式とPreload側の呼び出し形式が一致（**P44対策**）
  - `skill:importFromSource`: ハンドラが受け取る引数 = Preloadの `safeInvoke` が渡す引数
  - `skill:export`: 同上
  - `skill:validateSource`: 同上
- [ ] **Phase 3**: 引数名のセマンティクスが実際の値と一致（**P45対策**）
  - `source` パラメータが実際に `ShareTarget` オブジェクトであること
  - `skillName` パラメータが実際にスキル名（文字列）であること
- [ ] **Phase 4**: P42準拠3段バリデーション確認
  - 全文字列引数: `typeof === "string"` → `=== ""` → `.trim() === ""` の3段チェック
  - `ShareTarget.type`: 許可値（`"github"`, `"gist"`, `"url"`, `"local"`）のホワイトリスト検証
- [ ] **Phase 5**: エラーサニタイズ確認
  - Rendererに返すエラーに内部ファイルパス・スタックトレースが含まれないこと
- [ ] **Phase 6**: 送信元ウィンドウ検証
  - 全ハンドラで `validateIpcSender` が呼び出されていること

---

### Task 3: documentation-changelog.md

> **P4対策: 全Step確認前に「完了」と記載しない。各Stepの実際の完了結果を記録する。**

`outputs/phase-12/documentation-changelog.md` に以下を記録する。

- [ ] 更新した全仕様書のファイルパスと変更内容を一覧で記録
- [ ] Task 1（実装ガイド）の完了結果を詳細に記録
- [ ] Task 2 Step 1-A〜1-D の各Stepの完了結果を個別に記録
- [ ] Task 2 Step 2 の各仕様書の更新結果を個別に記録
- [ ] Task 2 Step 3 のIPC契約検証Phase 1-6の結果を個別に記録
- [ ] Task 3（本ファイル自体）の記録
- [ ] Task 4（未タスク検出）の結果を記録
- [ ] Task 5（スキルフィードバック）の結果を記録

**重要**: 全Task・全Stepが完了するまで「Phase 12完了」と記載しないこと。

---

### Task 4: 未タスク検出

> **P3対策: 検出した未タスクは3ステップ全完了が必須（1つでも欠けると不完全）**
> **P38対策: 未タスク指示書は `docs/30-workflows/unassigned-task/` に配置する（`tasks/` 直下ではない）**

#### 4-1. 未タスク検出（6つのソース全てを確認）

| #   | 検出ソース              | 確認対象                       | 実行方法                                                                                                         | 必須 |
| --- | ----------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------- | ---- |
| 1   | Phase 3レビュー結果     | MINOR判定の指摘事項            | `outputs/phase-3/design-review-result.md` を確認                                                                 | 必須 |
| 2   | Phase 10レビュー結果    | MINOR判定の指摘事項            | `outputs/phase-10/final-review-result.md` を確認                                                                 | 必須 |
| 3   | Phase 11手動テスト結果  | スコープ外の発見事項           | `outputs/phase-11/manual-test-result.md` を確認                                                                  | 必須 |
| 4   | 各Phase成果物           | TODO/FIXME/将来対応            | `outputs/` 配下を検索                                                                                            | 必須 |
| 5   | コードベース            | TODO/FIXME/HACK/XXXコメント    | `apps/desktop/src/main/services/skill/SkillShareManager.ts` と `packages/shared/src/types/skill-share.ts` を検索 | 必須 |
| 6   | documentation-changelog | 苦戦箇所・追加対応が必要な項目 | `outputs/phase-12/documentation-changelog.md` を確認                                                             | 必須 |

#### 4-2. 未タスクレポート作成

`outputs/phase-12/unassigned-task-report.md` を作成する。**0件でも必須**。

```markdown
# 未タスク検出レポート — TASK-9F

## 検出サマリー

| ソース                  | 検出件数    |
| ----------------------- | ----------- |
| Phase 3レビュー結果     | {{n}}件     |
| Phase 10レビュー結果    | {{n}}件     |
| Phase 11手動テスト結果  | {{n}}件     |
| 成果物TODO/FIXME        | {{n}}件     |
| コードベースTODO/FIXME  | {{n}}件     |
| documentation-changelog | {{n}}件     |
| **合計**                | **{{n}}件** |

## 検出された未タスク

（各未タスクの詳細。0件の場合は「検出された未タスクはありません」と記載）

## 3ステップ管理状況

（各未タスクについて3ステップの完了状況を記録）
```

#### 4-3. 検出された未タスクの3ステップ管理

検出された各未タスクに対して以下の3ステップを**全て**完了する:

1. **指示書作成**: `docs/30-workflows/unassigned-task/` に指示書を作成（**P38対策: `tasks/` 直下に配置しない**）
2. **残課題テーブル登録**: `task-workflow.md` の残課題テーブルに行を追加
3. **関連仕様書リンク追加**: 関連する仕様書に未タスクへの参照リンクを追加

#### 4-4. 未タスク品質基準

各未タスク指示書は以下の基準を満たすこと:

| カテゴリ | 項目                 | 基準                                         |
| -------- | -------------------- | -------------------------------------------- |
| Why      | 背景が明確           | このタスクが必要になった経緯が説明されている |
| Why      | 問題点が具体的       | 現状の問題が定量的/定性的に説明されている    |
| What     | 目的が具体的         | 達成すべきことが一意に解釈できる             |
| What     | スコープが明確       | 含む/含まないが明記されている                |
| How      | 使用スキルが選定済み | タスクに適したスキルが選定されている         |
| How      | 完了条件が検証可能   | チェックリスト形式で確認できる               |

---

### Task 5: スキルフィードバック

> **P28対策: 改善点がなくても「改善点なし」としてレポートを作成する**

`outputs/phase-12/skill-feedback-report.md` を作成する。

#### 5-1. フィードバック収集

TASK-9Fの全Phase（1〜12）で使用したスキルの実行結果を評価する。

| 評価    | 基準                                           |
| ------- | ---------------------------------------------- |
| success | スキルの指示通りに実行し、期待通りの成果を得た |
| partial | 実行できたが、一部期待と異なる結果があった     |
| failure | スキルの指示が不明確で実行できなかった         |

#### 5-2. 既存スキル改善判定

| 条件                  | 判定 | アクション               |
| --------------------- | ---- | ------------------------ |
| 同じ問題が3回以上発生 | 改善 | ベストプラクティスに追加 |
| ワークフロー不足      | 改善 | Phase/アクション追加     |
| Trigger選定ミスが多発 | 改善 | Trigger条件見直し        |
| 成果物形式が不統一    | 改善 | テンプレート追加         |
| 上記以外              | 保留 | LOGS.mdに記録のみ        |

#### 5-3. 新規スキル必要性判定

| 検出条件           | 新規スキル作成の判断基準                     |
| ------------------ | -------------------------------------------- |
| 手動作業の繰り返し | 同じ手順を3回以上手動で実行した              |
| 既存スキル不在     | 必要なスキルが見つからず自前で対応した       |
| スキルの責務超過   | 1つのスキルに複数責務を詰め込んだ            |
| ドメイン知識の欠落 | 特定ドメインの専門知識が必要だった           |
| 再利用性の発見     | 他タスクでも使える汎用的な処理パターンを発見 |

---

## 成果物

| 成果物                       | パス                                          | 内容                                       | 必須 |
| ---------------------------- | --------------------------------------------- | ------------------------------------------ | ---- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`    | Part 1（概念的説明）+ Part 2（技術的詳細） | 必須 |
| IPCドキュメント              | `outputs/phase-12/ipc-documentation.md`       | 3チャネルのAPI仕様書                       | 必須 |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md` | 全仕様書の変更記録                         | 必須 |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-report.md`  | 6ソースからの検出結果（0件でも作成）       | 必須 |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`   | スキル実行結果・改善提案                   | 必須 |

---

## 完了条件

### Task 1: 実装ガイド

- [ ] `implementation-guide.md` Part 1（中学生レベル概念説明 — 日常の例え必須）が作成されている
- [ ] `implementation-guide.md` Part 2（開発者向け技術詳細 — ファイル構成、型定義、IPC通信フロー、テスト構成）が作成されている
- [ ] `ipc-documentation.md`（3チャネルのリクエスト/レスポンス仕様、エラーコード）が作成されている

### Task 2: システム仕様書更新

- [ ] Step 1-A: LOGS.md **2ファイル両方**が更新されている（P1/P25対策）
- [ ] Step 1-A: SKILL.md **2ファイル両方**の変更履歴が更新されている
- [ ] Step 1-B: `api-ipc-agent.md` に新規3チャネルが追加されている
- [ ] Step 1-B: `interfaces-agent-sdk-skill.md` に型定義が追加されている
- [ ] Step 1-C: `grep -rn "TASK-9F" references/` の結果に基づき関連仕様書が更新されている
- [ ] Step 1-D: topic-map.mdが再生成されている（P2/P27対策）
- [ ] Step 2: `api-ipc-agent.md` が更新されている
- [ ] Step 2: `security-electron-ipc.md` が更新されている
- [ ] Step 2: `architecture-overview.md` が更新されている
- [ ] Step 2: `interfaces-agent-sdk-skill.md` が更新されている
- [ ] Step 2: `task-workflow.md` が更新されている
- [ ] Step 3: IPC契約検証Phase 1-6が全て完了している

### Task 3: documentation-changelog.md

- [ ] 全仕様書の変更内容が記録されている
- [ ] 各Stepの完了結果が詳細に記録されている
- [ ] 全Task・全Step完了前に「完了」と記載されていない（P4対策）

### Task 4: 未タスク検出

- [ ] `unassigned-task-report.md` が作成されている（0件でも必須）
- [ ] 6つの検出ソース全てが確認されている
- [ ] 検出された未タスクに対して3ステップ全てが完了している（P3対策）
- [ ] 未タスク指示書が `docs/30-workflows/unassigned-task/` に配置されている（P38対策）

### Task 5: スキルフィードバック

- [ ] `skill-feedback-report.md` が作成されている（改善点0件でも必須 — P28対策）
- [ ] 既存スキル改善判定が実施されている
- [ ] 新規スキル必要性判定が実施されている

---

## スキル100%実行確認【必須】

- [ ] Task 1〜5の全タスクを100%実行完了
- [ ] 全チェックリスト項目を逐次確認済み
- [ ] P1, P2, P3, P4, P25, P26, P27, P28, P38, P43, P44, P45の各対策が実施されている
- [ ] `artifacts.json` のPhase 12ステータスを `"completed"` に更新

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-share/phase-13-pr-creation.md`

---

## 備考

- Phase 12はプロジェクトで最も漏れが発生しやすいPhaseである。チェックリストの全項目を省略せず確認すること
- P43対策として、サブエージェントに委譲する場合は3ファイル以下/エージェントに分割する
- LOGS.mdへの「完了」記録は全仕様書更新が完了した最終ステップで行う
- documentation-changelog.mdに「Phase 12完了」と記載するのは、全Task（1〜5）が完了した後に限る
