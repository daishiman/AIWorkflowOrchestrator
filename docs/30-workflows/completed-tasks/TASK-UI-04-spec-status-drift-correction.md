# 仕様書ステータス乖離修正 - タスク指示書

## メタ情報（依存: TASK-UI-01/UI-02/UI-03完了後に実行）

```yaml
issue_number: 1942
task_id: TASK-UI-04
task_name: spec-status-drift-correction
category: メンテナンス（品質管理系）
target_feature: タスク仕様書群の artifacts.json / index.md ステータスフィールド
priority: P0（最高）
scale: 中規模
status: phase12_completed
source: 実装状態監査（P0タスク群の実装完了後レビュー）
created_date: 2026-04-06
step: 13（TASK-UI-01/02/03後に直列実行）
dependencies:
  - TASK-UI-01（Lifecycle Panel Primary Route Promotion）
  - TASK-UI-02（Conversation Panel Orphan Resolution）
  - TASK-UI-03（IPC Session Runtime Unification）
```

| 項目         | 値                                                                                         |
| ------------ | ------------------------------------------------------------------------------------------ |
| タスクID     | TASK-UI-04                                                                                 |
| タスク名     | 仕様書ステータス乖離修正（Spec Status Drift Correction）                                   |
| 分類         | メンテナンス（品質管理系）                                                                 |
| 対象機能     | タスク仕様書群の artifacts.json / index.md ステータスフィールド                            |
| 優先度       | P0（最高）                                                                                 |
| 見積もり規模 | 中規模                                                                                     |
| ステータス   | spec_created（未実施）                                                                     |
| 発見元       | 実装状態監査（P0タスク群の実装完了後レビュー）                                             |
| 発見日       | 2026-04-06                                                                                 |
| Step         | 13（TASK-UI-01/02/03後に直列実行）                                                         |
| 依存タスク   | TASK-UI-01（Lifecycle Panel）, TASK-UI-02（Conversation Panel）, TASK-UI-03（IPC Session） |

---

## 1. Why

### 1.1 背景

TASK-P0-01〜P0-09 のコード実装はすべてマージ済みであるにもかかわらず、各タスクの仕様書（`artifacts.json` / `index.md`）のステータスフィールドが `spec_created` / `in_progress` のまま放置されている。

TASK-UI-01 の完了により、UI 側の最初の実装が着地し、ステータス乖離の是正に着手できる状態となった。本タスクはコード変更を一切行わず、仕様書ドキュメントのステータスフィールドのみを実態に合わせて更新するメンテナンス作業である。

具体的に乖離が発生している仕様書は以下の通り:

1. **TASK-P0-01** (SkillCreatorVerificationEngine Layer 1/2) — `artifacts.json` が `in_progress` だがコード実装・マージ済み
2. **TASK-P0-02** (verify→improve closed loop) — `spec_created` だが `recordVerifyPass()` / `requestReverify()` は実装済み
3. **TASK-P0-04** (ManifestLoader default activation) — `spec_created` だが `hasDynamicResourcePipeline()` は動作済み
4. **TASK-P0-05** (execute→SkillFileWriter integration) — `spec_created` だが `_executeInternal()` に完全パイプライン実装済み
5. **TASK-P0-06** (conversational interview UI) — `spec_created` だが `ConversationalInterview.tsx` は機能済み
6. **TASK-P0-07** (hardcoded agent names dynamic resolution) — `spec_created` / `in_progress` だが動的解決ステータスの確認が必要
7. **TASK-P0-08** (session resume renderer) — `spec_created` だが session IPC handlers が `creatorHandlers.ts` に存在
8. **TASK-P0-09** (permission hooks governance) — `in_progress` だが `governance/` ディレクトリに完全実装済み

### 1.2 問題点・課題

- `docs/30-workflows/skill-creator-agent-sdk-lane/` 配下の各ステップディレクトリに `artifacts.json` と `index.md` が存在するが、ステータスフィールドが実装完了後に更新されていない
- 開発者が残作業を確認しようとすると、仕様書上は「未着手」と表示されるため、実際にコードが存在するかどうかを個別にソースコードで確認しなければならない
- 8件以上の仕様書が一斉に乖離しており、ステータスの不一致が蓄積している
- TASK-UI-01〜03 が完了するまでは実行できなかったため、意図的に後回しにされていたタスクである

### 1.3 放置した場合の影響

- 新規参加者が仕様書を見て「未実装のタスクが大量に残っている」と誤認し、不要な作業を開始するリスクがある
- 完了済みタスクと未完了タスクの区別ができないため、実際の残作業量の見積もりが不正確になる
- `executor-guide.md` / 親 `index.md` のタスク一覧も最新状態を反映しておらず、プロジェクト全体の進捗が把握できない
- 将来的なタスク追加時に乖離が常態化し、仕様書管理の信頼性が低下する

---

## 2. What

### 2.1 達成目標

- `docs/30-workflows/skill-creator-agent-sdk-lane/` 配下の全タスク仕様書について、`artifacts.json` の `status` フィールドをコード実装状態と一致させる
- `index.md` 本文のステータス記載も `artifacts.json` と同期させる
- 完全実装済みタスクの各フェーズ (`phases`) ステータスを `pending` から `completed` に更新する
- 親 `index.md` と `executor-guide.md` のタスク一覧を最新状態に更新する

### 2.2 最終ゴール

1. TASK-P0-01〜P0-09 の全 `artifacts.json` の `status` フィールドが `completed` または実態を反映した値になっている
2. 各 `index.md` の `ステータス` 表記が `artifacts.json` と一致している
3. 部分実装済みタスクには、残作業の明確な記録が `index.md` に追記されている
4. 親 `index.md` のタスク一覧が最新の実装状態を反映している
5. `executor-guide.md` の実行ステータスが更新されている
6. `pnpm --filter @repo/desktop typecheck` / `pnpm --filter @repo/desktop lint` への影響がない（ドキュメント変更のみのため）

### 2.3 スコープ

#### 含むもの

- `artifacts.json` の `status` / `phases[*].status` フィールドの更新
- `index.md` のステータステーブル・本文ステータスの更新
- 部分完了タスクへの残作業メモの追記
- 親 `index.md` タスク一覧の更新
- `executor-guide.md` のステータス更新

#### 含まないもの

- コードの変更（実装・リファクタリング・バグ修正）
- テストの追加・変更
- 新規タスク仕様書の作成
- `outputs/` 配下の成果物ファイルの変更（ファイルが存在しない場合の補完は対象外）

---

## 3. How（前提条件: TASK-UI-01/02/03完了後）

### 3.1 前提条件

- **TASK-UI-01 完了**: Lifecycle Panel Primary Route Promotion が完了していること
- **TASK-UI-02 完了**: Conversation Panel Orphan Resolution が完了していること
- **TASK-UI-03 完了**: IPC Session Runtime Unification が完了していること
- TASK-P0-01〜P0-09 のコード実装がすべて main ブランチにマージ済みであること

### 3.2 現状アーキテクチャの理解

#### artifacts.json の status フィールド体系

`artifacts.json` は以下の status 値を持つ:

- `spec_created`: 仕様書作成済み、未着手
- `in_progress`: 一部フェーズ完了、進行中
- `completed`: 全フェーズ完了

各 phase の status は以下の値を持つ:

- `pending`: 未着手
- `in_progress`: 進行中
- `completed`: 完了

#### 乖離が発生するパターン

1. **コード実装後に artifacts.json を更新し忘れる**: 最も多いパターン。フェーズを進めながら `artifacts.json` を更新しない
2. **index.md と artifacts.json の二重管理による不一致**: `index.md` のステータステーブルと `artifacts.json` の `status` フィールドを独立して管理しているため乖離する

---

## 4. 実行手順

### Phase 1: ステータス乖離の全量調査

#### 目的

TASK-P0-01〜P0-09 の仕様書と実コードを突合し、乖離している箇所の全量を把握する。

#### 手順

1. `docs/30-workflows/skill-creator-agent-sdk-lane/` 配下の全ステップディレクトリを列挙する:
   ```bash
   ls docs/30-workflows/skill-creator-agent-sdk-lane/
   ```
2. 各ディレクトリの `artifacts.json` を読み込み、`status` / `phases[*].status` を記録する
3. 各タスクに対応するコードファイルが存在するか確認する（以下の確認ポイント）:
   - TASK-P0-01: `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts`
   - TASK-P0-02: `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`（`recordVerifyPass` / `requestReverify`）
   - TASK-P0-04: `apps/desktop/src/main/services/runtime/ManifestLoader.ts`（`hasDynamicResourcePipeline`）
   - TASK-P0-05: `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`（`_executeInternal`）
   - TASK-P0-06: `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`
   - TASK-P0-07: `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`（動的解決パス）
   - TASK-P0-08: `apps/desktop/src/main/ipc/creatorHandlers.ts`（session handlers）
   - TASK-P0-09: `apps/desktop/src/main/services/governance/`（ディレクトリ存在確認）
4. 乖離一覧を `outputs/phase-1/status-drift-inventory.md` に記録する

#### 成果物

- `outputs/phase-1/status-drift-inventory.md`（乖離一覧）
- `outputs/phase-1/spec-extraction-map.md`（各仕様書の現行ステータスマップ）

#### 完了条件

- [ ] TASK-P0-01〜P0-09 の全 `artifacts.json` の現行 `status` が記録されている
- [ ] 各タスクに対応するコードファイルの存在が確認されている
- [ ] 乖離箇所の全量（件数・ファイルパス）が把握されている

---

### Phase 2: 更新計画策定

#### 目的

Phase 1 の調査結果をもとに、各仕様書に対してどの status 値を設定するかの更新計画を作成する。

#### 手順

1. Phase 1 で特定した乖離箇所ごとに、更新後の status 値を決定する:
   - コード全実装済み → `completed`（全フェーズを `completed` に）
   - コード部分実装済み → `in_progress`（完了フェーズのみ `completed`、未完了は `pending`）
   - コード未実装 → `spec_created`（変更不要）
2. 以下の更新優先順を決定する:
   1. TASK-P0-01〜P0-09 の `artifacts.json` 更新
   2. TASK-P0-01〜P0-09 の `index.md` ステータステーブル更新
   3. 部分完了タスクへの残作業メモ追記
   4. 親 `index.md` タスク一覧更新
   5. `executor-guide.md` ステータス更新
3. 更新計画を `outputs/phase-2/correction-plan.md` に記録する

#### 成果物

- `outputs/phase-2/correction-plan.md`（更新計画）

#### 完了条件

- [ ] 全乖離箇所に対して更新後の status 値が確定している
- [ ] 更新順序と対象ファイルパスの一覧が作成されている

---

### Phase 3: 設計レビュー（ゲート）

#### 目的

Phase 2 の更新計画が正確かどうかを確認し、更新後に問題が生じないかをレビューする。

#### 手順

1. 更新計画に記載された status 値が、実際のコード実装状態と一致しているかを再確認する
2. `artifacts.json` の `status` と `phases[*].status` が整合性を持っているかを確認する（例: 全フェーズが `completed` なのに top-level が `in_progress` になっていないか）
3. `index.md` の更新内容が `artifacts.json` と齟齬を生じさせないかを確認する
4. 判定結果を `outputs/phase-3/design-review-gate.md` に記録する（PASS / MINOR / MAJOR）

#### 成果物

- `outputs/phase-3/design-review-gate.md`（レビュー判定: PASS / MINOR / MAJOR）

#### 完了条件

- [ ] レビュー結果が PASS または MINOR である
- [ ] MAJOR の場合は Phase 2 に戻り計画を修正する

---

### Phase 4: テストマトリクス作成

#### 目的

更新後の検証手順を明確にするテストマトリクスを作成する。

#### 手順

1. 以下の検証項目を `outputs/phase-4/test-matrix.md` に記録する:
   - 各 `artifacts.json` の `status` フィールドが期待値と一致していること
   - 各 `index.md` のステータステーブルの値が `artifacts.json` と一致していること
   - 親 `index.md` のタスク一覧が更新されていること
2. 自動検証スクリプトが利用可能か確認する:
   ```bash
   ls .claude/skills/task-specification-creator/scripts/
   ```
3. 手動確認チェックリストを作成する

#### 成果物

- `outputs/phase-4/test-matrix.md`（検証マトリクス）

#### 完了条件

- [ ] 検証項目が TASK-P0-01〜P0-09 全件をカバーしている
- [ ] 手動確認チェックリストが作成されている

---

### Phase 5: 実装（artifacts.json / index.md 更新）

#### 目的

Phase 2 の更新計画に従い、`artifacts.json` と `index.md` を実際に更新する。

#### 手順

1. TASK-P0-01〜P0-09 の `artifacts.json` を順次更新する:
   - `status` フィールドを `completed` / `in_progress` / `spec_created` に設定する
   - `phases[*].status` を各フェーズの完了状態に合わせて更新する
   - `lastUpdated` を `2026-04-06T00:00:00.000Z` に更新する
2. 各 `index.md` のステータステーブルを `artifacts.json` と同期させる
3. 部分完了タスクには残作業を明記したセクションを追記する:

   ```markdown
   ## 残作業（2026-04-06 時点）

   - Phase N 以降: 未実施
   - 完了済みコード: xxx.ts（マージ済み）
   ```

4. 更新ログを `outputs/phase-5/implementation-record.md` に記録する

#### 成果物

- 更新済み `artifacts.json`（TASK-P0-01〜P0-09）
- 更新済み `index.md`（TASK-P0-01〜P0-09）
- `outputs/phase-5/implementation-record.md`（更新ログ）

#### 完了条件

- [ ] TASK-P0-01〜P0-09 の全 `artifacts.json` が更新されている
- [ ] 各 `index.md` のステータステーブルが `artifacts.json` と一致している
- [ ] 部分完了タスクに残作業メモが追記されている

---

### Phase 6: テスト拡充

#### 目的

Phase 5 の更新内容を Phase 4 のテストマトリクスで検証し、漏れがないかを確認する。

#### 手順

1. Phase 4 のテストマトリクスの各検証項目を実施する
2. `artifacts.json` の `status` フィールドを全件確認する:
   ```bash
   grep -r '"status"' \
     docs/30-workflows/skill-creator-agent-sdk-lane/step-*/artifacts.json
   ```
3. 乖離が残っている箇所があれば Phase 5 に戻って修正する
4. 確認結果を `outputs/phase-6/test-expansion.md` に記録する

#### 成果物

- `outputs/phase-6/test-expansion.md`（テスト実施記録）

#### 完了条件

- [ ] テストマトリクスの全検証項目が PASS している
- [ ] 未修正の乖離がゼロである

---

### Phase 7: カバレッジ確認

#### 目的

更新対象が全件カバーされているかを確認する。

#### 手順

1. `docs/30-workflows/skill-creator-agent-sdk-lane/` 配下の全 `artifacts.json` を列挙し、更新対象の件数と実際に更新した件数が一致するかを確認する
2. 親 `index.md` のタスク一覧に漏れがないかを確認する
3. `executor-guide.md` の更新が完了しているかを確認する
4. カバレッジレポートを `outputs/phase-7/coverage-report.md` に記録する

#### 成果物

- `outputs/phase-7/coverage-report.md`（カバレッジレポート）

#### 完了条件

- [ ] 更新対象の全件が更新されている
- [ ] 親 `index.md` が最新の状態を反映している
- [ ] `executor-guide.md` が更新されている

---

### Phase 8: リファクタリング

#### 目的

更新後の仕様書群に記述の揺れや冗長な記載がある場合を整理する。

#### 手順

1. 更新された `index.md` の記述スタイルが、他のタスク仕様書と統一されているかを確認する
2. `artifacts.json` のフィールド名・値の命名規則が統一されているかを確認する（例: `completed` / `in_progress` / `spec_created` の表記ゆれ）
3. 必要な場合のみ記述の統一を行う（機能・ステータス値の変更は行わない）
4. リファクタリングログを `outputs/phase-8/refactoring-log.md` に記録する

#### 成果物

- `outputs/phase-8/refactoring-log.md`（リファクタリングログ）

#### 完了条件

- [ ] 記述スタイルが統一されている
- [ ] `artifacts.json` のフィールド値に表記ゆれがない

---

### Phase 9: 品質保証

#### 目的

ドキュメント変更がコードベースに影響を与えていないことを確認する。

#### 手順

1. TypeScript 型チェックを実行し、ドキュメント変更がコードに影響を与えていないことを確認する:
   ```bash
   pnpm --filter @repo/desktop typecheck
   ```
2. ESLint を実行する:
   ```bash
   pnpm --filter @repo/desktop lint
   ```
3. `docs/` 配下の変更のみであり、コードファイルが変更されていないことを確認する:
   ```bash
   git diff --name-only | grep -v '^docs/'
   ```
4. QA レポートを `outputs/phase-9/qa-report.md` に記録する

#### 成果物

- `outputs/phase-9/qa-report.md`（QAレポート）

#### 完了条件

- [ ] typecheck エラーなし（ドキュメント変更のため影響なしが期待される）
- [ ] lint エラーなし
- [ ] `docs/` 以外のファイルが変更されていない

---

### Phase 10: 最終レビュー（ゲート）

#### 目的

全更新内容が正確で、乖離が解消されていることを最終確認する。

#### 手順

1. 更新後の `artifacts.json` を全件確認し、`status` が `in_progress` / `spec_created` のまま残っているものがないかを確認する（残す意図があるものを除く）
2. `index.md` の各ステータステーブルが `artifacts.json` と一致しているかを確認する
3. Phase 1 の `status-drift-inventory.md` に記録された乖離箇所が全件解消されているかを確認する
4. 最終レビュー結果を `outputs/phase-10/final-review-result.md` に記録する（PASS / MINOR / MAJOR）

#### 成果物

- `outputs/phase-10/final-review-result.md`（最終レビュー判定）

#### 完了条件

- [ ] 最終レビューが PASS または MINOR である
- [ ] Phase 1 で記録した全乖離箇所が解消されている

---

### Phase 11: 手動テスト

#### 目的

実際の仕様書を目視で確認し、更新内容が自然で正確であることを確認する。

#### 手順

1. 更新後の `artifacts.json` を 2〜3 件サンプリングして目視確認する
2. 更新後の `index.md` を 2〜3 件サンプリングして目視確認する（ステータステーブルの値が `artifacts.json` と一致しているか）
3. 親 `index.md` のタスク一覧を確認し、ステータスが正確に反映されているかを確認する
4. 手動テスト結果を `outputs/phase-11/manual-test-result.md` に記録する

#### 成果物

- `outputs/phase-11/manual-test-result.md`（手動テスト結果）

#### 完了条件

- [ ] サンプリング確認した `artifacts.json` / `index.md` が正確である
- [ ] 親 `index.md` のタスク一覧が最新状態を反映している

---

### Phase 12: ドキュメント更新

#### 目的

本タスク自身の仕様書（`step-13` の `artifacts.json` / `index.md`）を更新し、作業記録を完結させる。

#### 手順

1. `docs/30-workflows/skill-creator-agent-sdk-lane/step-13-seq-task-ui-04-spec-status-drift-correction/artifacts.json` を更新し、完了した全フェーズを `completed` にする
2. `docs/30-workflows/skill-creator-agent-sdk-lane/step-13-seq-task-ui-04-spec-status-drift-correction/index.md` のステータスを `completed` に更新する
3. 作業で得た知見を `outputs/phase-12/implementation-guide.md` に記録する

#### 成果物

- `outputs/phase-12/implementation-guide.md`（作業ガイド）

#### 完了条件

- [ ] step-13 の `artifacts.json` が `completed` に更新されている
- [ ] step-13 の `index.md` のステータスが `completed` になっている

---

### Phase 13: PR 作成

#### 目的

ドキュメント更新 PR を作成し、レビューを経てマージする。

#### 手順

1. 変更差分を確認する:
   ```bash
   git diff --name-only
   ```
2. PR を作成する（ユーザー承認後）。タイトル: `chore(docs): TASK-UI-04 仕様書ステータス乖離修正（P0タスク群の status を completed に同期）`
3. PR 作成記録を `outputs/phase-13/pr-creation-record.md` に記録する

#### 成果物

- `outputs/phase-13/pr-creation-record.md`（PR作成記録）
- GitHub PR

#### 完了条件

- [ ] PR が作成されている（ユーザー承認後）
- [ ] `docs/` 配下のみを変更したことが PR 差分で確認できる

---

## 4. 苦戦箇所と知見（重要）

### 苦戦箇所 1: 大量の artifacts.json を一括で正確に更新する手段がない

`docs/30-workflows/skill-creator-agent-sdk-lane/` 配下には TASK-P0-01〜P0-09 の計 8〜9 件の `artifacts.json` が存在する。各ファイルを個別に開いて手動更新する場合、`phases[*].status` の更新漏れが発生しやすい。

**対策**: Phase 1 で全量調査マップを作成し、更新計画（Phase 2）を先に策定してから一括更新する。更新後は grep で全件確認する。

```bash
grep -r '"status"' \
  docs/30-workflows/skill-creator-agent-sdk-lane/step-*/artifacts.json
```

### 苦戦箇所 2: spec_created から completed へのステータス変更時に phase 成果物の実在確認が必要

`status: "completed"` に変更する際、`phases[*].artifacts` に列挙されたファイル（例: `phase-1-requirements.md`）が実際に `outputs/` 配下に存在するかどうかを確認する必要がある。ファイルが存在しない場合に `completed` に変更すると、成果物の実在を偽って示すことになる。

**対策**: 「コードが実装済みかどうか」と「outputs/ 配下のファイルが存在するかどうか」は独立した観点として扱う。コード実装済みの場合は `status: "completed"` に変更するが、`outputs/` 配下のファイルが存在しない phase は `phases[N].status` を `completed` にせず `in_progress` または `pending` のままにする。

### 苦戦箇所 3: index.md の本文ステータスと artifacts.json の status フィールドの双方を同期する必要がある

`index.md` のステータステーブル（`| ステータス | spec_created |`）と `artifacts.json` の `"status": "spec_created"` は独立して管理されている。片方だけ更新すると不一致が生じる。

**対策**: 更新手順を「`artifacts.json` を先に更新し、その後 `index.md` を `artifacts.json` に合わせて更新する」という順序に固定する。Phase 5 の手順にこの順序を明記する。

### 苦戦箇所 4: 部分実装済みタスク（TASK-P0-07 など）の扱い

TASK-P0-07 は仕様書の `artifacts.json` が `in_progress`（Phase 1〜3 完了）だが、コードの動的解決が完全実装済みかどうかが不明確な場合がある。コード確認と仕様書の更新を混同しないように注意が必要。

**対策**: Phase 1 でコード実装状態を明示的に確認してから更新計画を策定する。確認なしに `completed` に変更しない。

---

## 5. 依存関係

| 種別       | タスクID          | 役割                                                           |
| ---------- | ----------------- | -------------------------------------------------------------- |
| upstream   | TASK-UI-01        | UI変更の仕様化完了後に実行し、再乖離を防ぐ                     |
| upstream   | TASK-UI-02        | UI変更の仕様化完了後に実行し、再乖離を防ぐ                     |
| upstream   | TASK-UI-03        | UI変更の仕様化完了後に実行し、再乖離を防ぐ                     |
| peer       | TASK-P0-01〜P0-09 | ステータス修正の対象タスク群（コード変更は行わない）           |
| downstream | なし              | 本タスクはメンテナンス作業の最終ピース。後続タスクへの影響なし |

---

## 6. 受入条件

| AC   | 条件                                                                             | 検証方法         |
| ---- | -------------------------------------------------------------------------------- | ---------------- |
| AC-1 | TASK-P0-01〜P0-09 の全 `artifacts.json` の `status` が実装状態と一致している     | grep + 目視確認  |
| AC-2 | 各 `index.md` のステータステーブルが `artifacts.json` の `status` と一致している | 目視確認         |
| AC-3 | 部分完了タスクには残作業の明確な記録がある                                       | ドキュメント確認 |
| AC-4 | 親 `index.md` のタスク一覧が最新の実装状態を反映している                         | 目視確認         |
| AC-5 | `executor-guide.md` の実行ステータスが更新されている                             | 目視確認         |
| AC-6 | `docs/` 以外のファイルが変更されていない（コード変更ゼロ）                       | git diff 確認    |

---

## 7. リスクと対策

| リスク                                                                | 影響度 | 発生確率 | 対策                                                                                                |
| --------------------------------------------------------------------- | ------ | -------- | --------------------------------------------------------------------------------------------------- |
| コード確認せずに `completed` に変更し、実際は未実装だった             | 高     | 低       | Phase 1 でコードファイルの存在を必ず確認してから Phase 2 の更新計画を策定する                       |
| TASK-UI-01/02/03 の完了前に実行し再乖離が発生する                     | 中     | 中       | 前提条件（TASK-UI-01/02/03 完了）を Phase 1 開始前に確認する                                        |
| `artifacts.json` の更新後に `index.md` の更新を忘れる                 | 中     | 高       | Phase 5 の手順に「`artifacts.json` → `index.md` の順」を明記し、チェックリストで確認する            |
| 部分実装済みタスクの phases[*].status を誤って全件 `completed` にする | 中     | 中       | Phase 2 で各フェーズの完了状態を個別に確認し、更新計画に phase 単位の status 値を明記する           |
| `executor-guide.md` / 親 `index.md` の更新漏れ                        | 低     | 高       | Phase 7 のカバレッジ確認で `executor-guide.md` / 親 `index.md` の更新を必須チェック項目として含める |

---

## 8. 参照情報

### 現状確認（2026-04-06 時点）

調査の結果、以下の状態が確認されている:

- `step-10-seq-task-p0-07-*` の `artifacts.json`: `status: "in_progress"`（Phase 1〜3 完了、Phase 4 以降は `pending`）
- `step-12-par-task-ui-02-*` の `artifacts.json`: `status: "spec_created"`（全フェーズ `pending`）
- `step-13-seq-task-ui-04-*` の `artifacts.json`: `status: "spec_created"`（本タスク自身、全フェーズ `pending`）

TASK-P0-01〜P0-06, P0-08, P0-09 に対応するステップディレクトリが `skill-creator-agent-sdk-lane/` 配下に存在する可能性があり、Phase 1 で全量を確認する。

### 関連ドキュメント

| ドキュメント                     | パス                                                                                                  |
| -------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 乖離対象タスク仕様書ディレクトリ | `docs/30-workflows/skill-creator-agent-sdk-lane/`                                                     |
| Lane 親 index                    | `docs/30-workflows/skill-creator-agent-sdk-lane/index.md`                                             |
| 実行ガイド                       | `docs/30-workflows/skill-creator-agent-sdk-lane/executor-guide.md`                                    |
| 本タスク step ディレクトリ       | `docs/30-workflows/skill-creator-agent-sdk-lane/step-13-seq-task-ui-04-spec-status-drift-correction/` |
| Skill Creator Service 仕様       | `.agents/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md`           |
| タスクワークフローフェーズ仕様   | `.agents/skills/aiworkflow-requirements/references/task-workflow-phases.md`                           |
| P0 是正パック（設計方針）        | `docs/30-workflows/skill-creator-agent-sdk-lane/p0-verify-manifest-remediation-pack.md`               |
| フォーマット参照元タスク         | `docs/30-workflows/unassigned-task/TASK-P0-07-hardcoded-agent-names-dynamic-resolution.md`            |
