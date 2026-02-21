# Phase 12: ドキュメント更新 — TypeScript `@repo/shared` モジュール解決エラー修正

## メタ情報

| 項目       | 値                                       |
| ---------- | ---------------------------------------- |
| Phase      | 12                                       |
| Phase名    | ドキュメント更新                         |
| 前提Phase  | Phase 11（手動テスト検証）               |
| 後続Phase  | Phase 13（PR作成）                       |
| ステータス | 完了（2026-02-20）                       |
| 作成日     | 2026-02-20                               |
| 機能名     | TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 |
| Issue      | #837                                     |

## 目的

実装した TypeScript モジュール解決エラー修正の技術的理解を促進するドキュメントを作成し、システム要件ドキュメントに反映し、未完了タスクを検出・記録する。

## 実行タスク

- Task 1: 実装ガイド作成【必須】
- Task 2: システムドキュメント更新【必須】
- Task 3: ドキュメント更新履歴 & artifacts.json 更新【必須】
- Task 4: 未タスク検出【必須】
- Task 5: スキルフィードバックレポート【必須】

## 参照資料

### Phase 成果物

| 資料名       | パス                           | 説明            |
| ------------ | ------------------------------ | --------------- |
| 要件定義     | `phase-1-requirements.md`      | Phase 1 成果物  |
| 設計書       | `phase-2-design.md`            | Phase 2 成果物  |
| 設計レビュー | `phase-3-design-review.md`     | Phase 3 成果物  |
| テスト仕様   | `phase-4-test-creation.md`     | Phase 4 成果物  |
| 実装仕様     | `phase-5-implementation.md`    | Phase 5 成果物  |
| テスト拡充   | `phase-6-test-expansion.md`    | Phase 6 成果物  |
| カバレッジ   | `phase-7-coverage-check.md`    | Phase 7 成果物  |
| リファクタ   | `phase-8-refactoring.md`       | Phase 8 成果物  |
| 品質保証     | `phase-9-quality-assurance.md` | Phase 9 成果物  |
| 最終レビュー | `phase-10-final-review.md`     | Phase 10 成果物 |
| 手動テスト   | `phase-11-manual-test.md`      | Phase 11 成果物 |

### システム仕様（aiworkflow-requirements）

| 資料名                 | パス                                                                                        | 説明                                             |
| ---------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| モノレポアーキテクチャ | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md`                | モノレポ構成・依存管理                           |
| 品質要件               | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | 品質基準・カバレッジ                             |
| 実装パターン           | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 実装パターン集                                   |
| TypeScript 技術基盤    | `.claude/skills/aiworkflow-requirements/references/technology-core.md`                      | `moduleResolution` / `exports` / `typesVersions` |
| DevOps/テスト基盤      | `.claude/skills/aiworkflow-requirements/references/technology-devops.md`                    | Vitest運用・workspace運用                        |
| 開発ガイドライン       | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`               | 開発ルール                                       |
| 教訓集                 | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 再発防止の知見                                   |

### タスク仕様書スキル参照

| 資料名                 | パス                                                                           | 説明                  |
| ---------------------- | ------------------------------------------------------------------------------ | --------------------- |
| 仕様書更新ワークフロー | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | Step 1-A〜Step 2 手順 |

## 実行手順

1. 事前チェックリスト（既知の落とし穴防止）を確認する
2. Task 1〜5 を順次実行する
3. 各 Task の成果物が正しく生成されていることを確認する
4. 完了条件をすべて満たしていることを検証する

---

## 事前チェック【必須】

Phase 12 実行前に以下の既知の落とし穴を確認:

- [x] **P1**: LOGS.md は `aiworkflow-requirements` と `task-specification-creator` の **2ファイル両方** を更新する
- [x] **P2**: 仕様書に変更があれば **topic-map.md を必ず再生成** する（セクション追加だけでなく削除・更新も対象）
- [x] **P3**: 未タスク管理は **4ステップ全完了** する（①指示書 → ②物理存在確認 → ③残課題テーブル → ④関連仕様書リンク）
- [x] **P4**: 全 Step 完了前に documentation-changelog に **「完了」と記載しない**
- [x] **P25**: LOGS.md 2ファイル更新漏れ再発防止（P1と同じだが過去に再発あり）
- [x] **P26**: システム仕様書更新を **PRマージ後まで遅延しない** — Phase 12完了時点で更新する
- [x] **P27**: topic-map.md 再生成のトリガーは **セクション追加だけでなく更新・削除も含む**
- [x] **P28**: スキルフィードバックレポートは **改善点なしでも出力必須**
- [x] **P29**: SKILL.md の **変更履歴テーブル** も更新する（LOGS.md だけでは不十分）
- [x] **P43**: 仕様書更新は **3ファイル以下/エージェント** に分割する（rate limit 防止）

### 漏れやすいポイント参照テーブル

| Pitfall ID | 内容                        | チェック対象    | 対策                                                      |
| ---------- | --------------------------- | --------------- | --------------------------------------------------------- |
| P1         | LOGS.md 2ファイル更新漏れ   | Task 2 Step 1-A | 2箇所とも更新を明示的にチェック                           |
| P2         | topic-map.md 再生成忘れ     | Task 2 Step 1-D | 仕様書変更があれば必ず再生成                              |
| P27        | topic-map.md 再生成トリガー | Task 2 Step 1-D | 追加・削除・更新すべてがトリガー                          |
| P29        | SKILL.md 変更履歴更新漏れ   | Task 2 Step 1-A | LOGS.md と SKILL.md の両方を更新                          |
| P3         | 未タスク管理4ステップ不完全 | Task 4          | ①指示書 → ②物理存在確認 → ③残課題テーブル → ④仕様書リンク |

---

## Task 1: 実装ガイド作成【必須】

**2パート構成**の実装ガイドを作成する:

| パート | 対象読者         | 内容                                                            |
| ------ | ---------------- | --------------------------------------------------------------- |
| Part 1 | 初学者・非技術者 | 概念的な説明（中学生でもわかる版）                              |
| Part 2 | 開発者・技術者   | 技術的な詳細（moduleResolution、exports、typesVersions の関係） |

### Part 1: 概念説明（中学生レベル）

**必須要件**:

- 日常生活での例え話を**必ず**含める
- 専門用語は使わない（使う場合は即座に説明）
- 「なぜ必要か」を先に説明してから「何をするか」を説明

**例え話のヒント**:

- モジュール解決 → 「荷物の住所」
  - プログラムが別のファイルを使いたいとき、「住所」を頼りに探す。住所の書き方が間違っていたり、地図（設定ファイル）が古いと届かない
- `package.json` の `exports` → 「ビルの受付にある入館案内図」
  - 「3階は経理部」「5階は営業部」のように、どの入口からどの部署に行けるかが書いてある。案内図にない部署には行けない
- `tsconfig.json` の `paths` → 「ショートカット（近道）の地図」
  - 毎回正式な住所を書くのは面倒なので、「営業部」と書くだけで正しい場所に届くようにする地図
- Vitest の `resolve.alias` → 「テスト用の臨時住所変換表」
  - テストのときだけ使う特別な住所変換。本番の地図（paths）と同じ場所を指していないとテストが迷子になる
- 一元管理 → 「住所変更したら全ての地図を同時に更新する仕組み」
  - 引っ越し（モジュール追加）したのに一部の地図だけ更新すると、古い地図を見た人が迷子になる

### Part 2: 技術的詳細

**必須要件**:

- TypeScript `moduleResolution` 設定の説明（`node16` / `bundler` / `nodenext` の違い）
- `package.json` の `exports` フィールドとサブパスエクスポートの仕組み
- `typesVersions` フィールドの役割と `exports` との関係
- `tsconfig.json` の `paths` と実行時モジュール解決の関係
- Vitest `resolve.alias` の仕組みと TypeScript `paths` との整合性維持方法
- 一元管理化の設計判断（二重管理の問題点と解決策）

**設定ファイル関係図**:

```
packages/shared/package.json
├── "exports" → サブパスエクスポート定義（正式な住所録）
└── "typesVersions" → 型解決のフォールバック（古いTS向け互換住所録）

apps/desktop/tsconfig.json
└── "compilerOptions.paths" → TypeScript コンパイル時のパス解決

apps/desktop/vitest.config.ts
└── "resolve.alias" → Vitest テスト実行時のパス解決
          ↕ 一元管理（同一のモジュールを指す）
```

### API ドキュメント

設定変更に関するドキュメントを作成:

| セクション                   | 内容                                   |
| ---------------------------- | -------------------------------------- |
| 変更対象ファイル一覧         | 修正した設定ファイルとその役割         |
| サブパスエクスポート追加手順 | 新規サブパス追加時の手順チェックリスト |
| トラブルシューティング       | よくあるエラーと解決方法               |

### 成果物

- `outputs/phase-12/implementation-guide.md`

---

## Task 2: システムドキュメント更新【必須】

> **重要**: 詳細手順は `.claude/skills/task-specification-creator/references/spec-update-workflow.md` を参照

### Step 1-A: タスク完了記録【必須・全タスク】

以下の **全ファイル** を更新する:

1. **該当仕様書にタスク完了記録を追加**

   対象仕様書候補:
   - `architecture-monorepo.md` — モノレポ構成・モジュール解決の記述があれば更新
   - `quality-requirements.md` — typecheck 関連の品質基準に記述があれば更新
   - `development-guidelines.md` — 開発ガイドラインに記述があれば更新

   ```markdown
   ## 完了タスク

   | タスクID                                 | タスク名                              | 完了日     | 成果物                       |
   | ---------------------------------------- | ------------------------------------- | ---------- | ---------------------------- |
   | TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 | @repo/shared モジュール解決エラー修正 | 2026-02-XX | 設定ファイル修正・テスト追加 |
   ```

2. **LOGS.md 更新（2ファイル両方 — P1/P25 対策）**

   ```bash
   # 1つ目
   .claude/skills/aiworkflow-requirements/LOGS.md

   # 2つ目
   .claude/skills/task-specification-creator/LOGS.md
   ```

   各ファイルに以下を追記:

   ```markdown
   ## TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001

   - **タスク名**: TypeScript `@repo/shared` モジュール解決エラー 228件の根本解決
   - **完了日**: 2026-02-XX
   - **Issue**: #837
   - **概要**: `pnpm typecheck` 時の `Cannot find module '@repo/shared'` エラー228件を、package.json exports・tsconfig paths・vitest alias の一元管理化により根本解決
   ```

3. **SKILL.md 変更履歴更新（2ファイル両方 — P29 対策）**

   ```bash
   # 1つ目
   .claude/skills/aiworkflow-requirements/SKILL.md

   # 2つ目
   .claude/skills/task-specification-creator/SKILL.md
   ```

### Step 1-B: 実装状況テーブル更新

以下の仕様書に実装ステータスの更新が必要か確認:

| 仕様書                     | 更新内容                           | 更新要否 |
| -------------------------- | ---------------------------------- | -------- |
| `architecture-monorepo.md` | モジュール解決設定の現状反映       | 確認     |
| `quality-requirements.md`  | typecheck エラー 0件の品質基準追加 | 確認     |

> 仕様書作成のみ完了のタスクは、実装完了 (`completed`) ではなく `spec_created` を使用して記録する。

### Step 1-C: 関連タスクテーブル更新

```bash
# 関連仕様書の検索
grep -rn "TASK-FIX-TS-SHARED-MODULE-RESOLUTION" .claude/skills/*/references/
grep -rn "@repo/shared" .claude/skills/*/references/
grep -rn "moduleResolution" .claude/skills/*/references/
```

検索結果に基づき、関連仕様書の関連タスクテーブルを更新する。

### Step 1-D: topic-map.md 再生成【必須 — P2/P27 対策】

```bash
# topic-map.md の再生成
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
node .claude/skills/task-specification-creator/scripts/generate-index.js \
  --workflow docs/30-workflows/TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 \
  --regenerate
```

> **注意**: 仕様書にセクションの追加・更新・削除があった場合は **必ず** 再生成する。

### Step 1-E: 未タスク参照整合チェック（検出件数が1件以上の場合は必須）

```bash
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
```

`ALL_LINKS_EXIST` を確認し、`task-workflow.md` の未タスクリンク参照切れをゼロにする。

### Step 2: システム仕様更新（該当する場合）

以下のチェックリストで更新要否を判断:

| 変更内容                    | 更新先                      | 更新要否 |
| --------------------------- | --------------------------- | -------- |
| モジュール解決設定の変更    | `architecture-monorepo.md`  | **必要** |
| TypeScript paths 一元管理化 | `development-guidelines.md` | 検討     |
| Vitest alias 二重管理解消   | `quality-requirements.md`   | 検討     |
| package.json exports 正規化 | `architecture-monorepo.md`  | **必要** |

**更新が必要な場合の実行手順**:

1. 該当仕様書を開く
2. モジュール解決に関するセクションを追加または更新
3. 変更履歴にバージョンを追記

### 成果物

- 更新済み仕様書一覧
- `outputs/phase-12/system-docs-update-log.md`

---

## Task 3: documentation-changelog.md 作成【必須】

> **P4 対策**: 全 Step 完了前に「完了」と記載しない

### 記録内容

以下のフォーマットで記録:

```markdown
# Documentation Changelog — TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001

## 概要

| 項目     | 内容                                     |
| -------- | ---------------------------------------- |
| タスクID | TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 |
| Issue    | #837                                     |
| 完了日   | 2026-02-XX                               |

## Step 実行結果

### Step 1-A: タスク完了記録

- [ ] 該当仕様書更新: （更新したファイル名を記載）
- [ ] LOGS.md (aiworkflow-requirements): 更新済み
- [ ] LOGS.md (task-specification-creator): 更新済み
- [ ] SKILL.md (aiworkflow-requirements): 更新済み
- [ ] SKILL.md (task-specification-creator): 更新済み

### Step 1-B: 実装状況テーブル

- [ ] （更新結果を記載）

### Step 1-C: 関連タスクテーブル

- [ ] grep 検索結果: （件数を記載）
- [ ] 更新したファイル: （ファイル名を記載）

### Step 1-D: topic-map.md 再生成

- [ ] aiworkflow-requirements: 再生成済み
- [ ] task-specification-creator: 再生成済み

### Step 2: システム仕様更新

- [ ] （更新結果を記載）

## 更新ファイル一覧

| ファイル名       | 更新内容 | Step |
| ---------------- | -------- | ---- |
| （実行時に記載） |          |      |
```

### 成果物

- `outputs/phase-12/documentation-changelog.md`

---

## Task 4: 未タスク検出【必須】

> **P3 対策**: 未タスク管理は4ステップ全完了する
> **0件でも `unassigned-task-report.md` の出力は必須**

### 検出ソース

1. **Phase 3（設計レビュー）結果**: MINOR/MAJOR 指摘の残課題
2. **Phase 10（最終レビュー）結果**: MINOR 指摘の未タスク化
3. **Phase 11（手動テスト）結果**: 発見された追加課題
4. **コードベース TODO/FIXME**:
   ```bash
   grep -rn "TODO\|FIXME\|HACK\|XXX" packages/shared/src/ apps/desktop/vitest.config.ts apps/desktop/tsconfig.json
   ```
5. **後続タスク候補**:
   - `apps/web` の `@repo/shared` モジュール解決対応
   - `apps/backend` の `@repo/shared` モジュール解決対応
   - CI/CD パイプラインでの typecheck エラー 0件チェック追加

### 検出時の4ステップ

未タスクが検出された場合、以下の4ステップを**全て**完了する:

| Step | 作業内容                                            | 出力先                                                               |
| ---- | --------------------------------------------------- | -------------------------------------------------------------------- |
| 1    | `docs/30-workflows/unassigned-task/` に指示書を作成 | `docs/30-workflows/unassigned-task/UT-FIX-TS-XXX-NNN.md`             |
| 2    | 物理ファイル存在を確認                              | `ls docs/30-workflows/unassigned-task/`                              |
| 3    | `task-workflow.md` の残課題テーブルに登録           | `.claude/skills/aiworkflow-requirements/references/task-workflow.md` |
| 4    | 関連仕様書に参照リンクを追加                        | 該当する `references/*.md`                                           |

作成後に `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js` を実行し、`ALL_LINKS_EXIST` を確認する。

### 想定される未タスク候補

| 候補ID | 概要                                        | 検出ソース         |
| ------ | ------------------------------------------- | ------------------ |
| UT-1   | `apps/web` 向け同様のモジュール解決修正     | Phase 2 スコープ外 |
| UT-2   | `apps/backend` 向け同様のモジュール解決修正 | Phase 2 スコープ外 |
| UT-3   | CI typecheck ゼロエラー品質ゲート追加       | Phase 10 レビュー  |

### 成果物

- `outputs/phase-12/unassigned-task-report.md`（0件でも必須）
- `outputs/phase-12/unassigned-task-detection.md`（件数・ステータス）
- 検出された場合: `docs/30-workflows/unassigned-task/` 配下の指示書

---

## Task 5: スキルフィードバックレポート作成【必須】

> **P28 対策**: 改善点なしでも出力必須

### 評価観点

| 観点             | 確認内容                                       |
| ---------------- | ---------------------------------------------- |
| ワークフロー効率 | Phase 1-13 の実行で非効率だった点はないか      |
| スキル改善       | task-specification-creator の改善点はないか    |
| 自動化可能性     | 手動で行った作業のうち自動化できるものはないか |
| ドキュメント品質 | 仕様書テンプレートの改善点はないか             |

### フィードバック候補

- モジュール解決系のバグ修正タスクに特化したテンプレートの必要性
- `exports` / `paths` / `alias` の整合性自動検証スクリプトの提案
- モノレポ設定変更時の影響分析ツールの提案

### 成果物

- `outputs/phase-12/skill-feedback-report.md`

---

## 成果物一覧

| 成果物名                     | パス                                            | 説明                          |
| ---------------------------- | ----------------------------------------------- | ----------------------------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`      | Part 1 + Part 2 の2パート構成 |
| システムドキュメント更新ログ | `outputs/phase-12/system-docs-update-log.md`    | 更新した仕様書の記録          |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`   | 全 Step の実行結果            |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-report.md`    | 検出結果（0件でも必須）       |
| 未タスク検出サマリー         | `outputs/phase-12/unassigned-task-detection.md` | 件数・ステータス              |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`     | スキル改善提案                |

## 完了条件

- [x] Task 1: 実装ガイド（Part 1 + Part 2）が作成されている
- [x] Task 1: Part 1 に日常の例え話（「荷物の住所」等）が含まれている
- [x] Task 1: Part 2 に moduleResolution・exports・typesVersions・paths・alias の技術説明が含まれている
- [x] Task 2: LOGS.md が **2ファイル両方** 更新されている（P1/P25 対策）
- [x] Task 2: SKILL.md が **2ファイル両方** 更新されている（P29 対策）
- [x] Task 2: topic-map.md が再生成されている（P2/P27 対策）
- [x] Task 2: システム仕様書が Phase 12 完了時点で更新されている（P26 対策）
- [x] Task 3: documentation-changelog.md に全 Step の実行結果が記録されている
- [x] Task 3: 全 Step 完了前に「完了」と記載されていない（P4 対策）
- [x] Task 4: unassigned-task-report.md が作成されている（0件でも必須）
- [x] Task 4: 検出された未タスクが4ステップ全完了している（P3 対策）
- [x] Task 4: `verify-unassigned-links.js` を実行し、`ALL_LINKS_EXIST` を確認している
- [x] Task 5: スキルフィードバックレポートが作成されている（P28 対策）
- [x] artifacts.json の Phase 12 ステータスが更新されている

## 次のPhase

Phase 13（PR作成）へ進む。
