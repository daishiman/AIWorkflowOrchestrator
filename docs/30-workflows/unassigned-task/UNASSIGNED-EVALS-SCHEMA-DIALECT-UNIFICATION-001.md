# UNASSIGNED-EVALS-SCHEMA-DIALECT-UNIFICATION-001: 6スキル間の EVALS.json 方言統一 - タスク指示書

## メタ情報

```yaml
issue_number: TBD
task_id: UNASSIGNED-EVALS-SCHEMA-DIALECT-UNIFICATION-001
task_name: 6スキル間の EVALS.json 方言統一
category: 改善 / スキーマ統一
target_feature: EVALS.json（全6スキル）/ validate-evals.js
priority: 低
scale: 中規模
status: 未実施
implementation_mode: new
source_phase: UNASSIGNED-EVALS-VALIDATOR-GUARD-001 Phase 12 苦戦箇所フィードバック
created_date: 2026-04-21
dependencies:
  - TASK-EVALS-CONSUMER-AUDIT-001（完了 / 背景知識）
  - UNASSIGNED-EVALS-VALIDATOR-GUARD-001（完了 / validate-evals.js 実装済み）
spec_path: docs/30-workflows/unassigned-task/UNASSIGNED-EVALS-SCHEMA-DIALECT-UNIFICATION-001.md
```

| 項目         | 内容                                                                                                                                                                                   |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID     | UNASSIGNED-EVALS-SCHEMA-DIALECT-UNIFICATION-001                                                                                                                                        |
| タスク名     | 6スキル間の EVALS.json 方言統一                                                                                                                                                        |
| 分類         | 改善 / スキーマ統一                                                                                                                                                                    |
| 対象機能     | EVALS.json（skill-creator / aiworkflow-requirements / task-specification-creator / int-test-skill / github-issue-manager / skill-fixture-runner）/ validate-evals.js permissive モード |
| 優先度       | 低                                                                                                                                                                                     |
| 見積もり規模 | 中規模                                                                                                                                                                                 |
| ステータス   | 未実施                                                                                                                                                                                 |
| 発見元       | UNASSIGNED-EVALS-VALIDATOR-GUARD-001 Phase 12 苦戦箇所フィードバック                                                                                                                   |
| 発見日       | 2026-04-21                                                                                                                                                                             |
| 関連タスク   | TASK-EVALS-CONSUMER-AUDIT-001（完了）/ UNASSIGNED-EVALS-VALIDATOR-GUARD-001（完了・validate-evals.js 実装済み）                                                                        |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`UNASSIGNED-EVALS-VALIDATOR-GUARD-001` において `validate-evals.js` を実装した際、camelCase（v2 系）と snake_case（v1 系）の 2 方言が **3 組 6 フィールド** にわたって共存していることが明らかになった。

| camelCase (v2)                  | snake_case (v1)                   |
| ------------------------------- | --------------------------------- |
| `skillName`                     | `skill_name`                      |
| `currentLevel`                  | `current_level`                   |
| `metrics.totalUsageCount`（等） | `metrics.total_usage_count`（等） |

今回 `validate-evals.js` は「どちらか一方が存在すれば OK」とする **permissive モード** で対応したが、これは根本的な方言統一を先送りにした暫定処置である。

- camelCase 系を使う skill: `task-specification-creator` / `int-test-skill` / `github-issue-manager`
- snake_case 系を使う skill: `skill-creator` / `aiworkflow-requirements` / `skill-fixture-runner`（一部）

根拠資料:

- `.claude/skills/aiworkflow-requirements/references/evals-schema-spec.md` §2〜§3
- `docs/30-workflows/evals-consumer-audit-001/outputs/phase-5/evals-field-map.md` §5.2

### 1.2 問題点・課題

`validate-evals.js` 実装時の苦戦箇所から得た知見を以下に整理する。

**苦戦点 A: 方言自動検出ロジックの複雑化**

validator が `skillName` の有無で camelCase 方言を判定し、`skill_name` の有無で snake_case 方言を判定するという **方言自動検出ロジック**（`validateL2` 内）が必要となった。この検出ロジックは `DIALECT_PAIRS` 定数に依存しており、将来フィールドが増えるたびにリストの更新が必要となる。

**苦戦点 B: permissive / strict 2 モードでテストケースが倍増**

「camelCase のみ」「snake_case のみ」「両方存在」「両方不在」という 4 パターンを permissive と strict の 2 モードでテストする必要があり、テストケース数が 2 倍以上になった。方言が 1 系統に統一されれば strict モードのみを維持でき、テストの複雑度が大幅に低減する。

**苦戦点 C: DIALECT_PAIRS リストの管理コスト**

```js
// validate-evals.js 現在の定義
const DIALECT_PAIRS = [
  ["skillName", "skill_name"],
  ["currentLevel", "current_level"],
];
```

このリストは現在 2 ペアのみだが、`metrics.*` 系の方言ペア（`totalUsageCount` / `total_usage_count` 等）はリストに含まれていない。将来フィールドが追加されるたびにこのリストを更新しなければならず、更新漏れが silent break につながる。

### 1.3 放置した場合の影響

- **NaN 伝播リスク**: 同一スキル内で camelCase と snake_case を混在させると、`totalUsageCount + total_usage_count` のような集計で `undefined + 1 = NaN` が EVALS.json に書き戻される。
- **validator の恒久 permissive 化**: 方言統一がなされなければ `validate-evals.js` が永久に permissive モードで運用され、strict モードへの移行機会が失われる。
- **新規 consumer の方言迷い**: 新しい writer / reader を追加する際、どちらの方言を採用すべきか判断材料がなく、ドキュメントを読んでも「どちらでもよい」に見えてしまう。
- **DIALECT_PAIRS の肥大化**: 検証外フィールド（`metrics.totalUsageCount` 系）が増えるたびに `validate-evals.js` を修正しなければならず、修正漏れが silent break として蓄積する。

---

## 2. 何を達成するか（What）

### 2.1 目的

EVALS.json スキーマの正本方言を **1 系統（camelCase v2 または snake_case v1）** に確定し、全 6 スキルの EVALS.json および writer / reader スクリプトを統一する。その結果として `validate-evals.js` の permissive モードを廃止し、strict モードのみで運用できる状態にする。

### 2.2 最終ゴール

1. 正本方言（camelCase v2 または snake_case v1）が **1 つ** に確定され、`evals-schema-spec.md` §3.1 に明記されている。
2. 全 6 スキルの EVALS.json が正本方言で統一されている。
3. 全 writer スクリプト（`log_usage.js`、`init_skill.js` 等）が正本方言で統一されている。
4. `validate-evals.js` の `DIALECT_PAIRS` が正本方言のフィールドのみを検証し、permissive モードが不要になっている。
5. `--strict` フラグが `validate-evals.js` のデフォルトとなり、CI でも `--strict` モードで実行できる。
6. dual root（`.claude/skills/` / `.agents/skills/`）の bit 一致が全 6 スキルで保たれている。

### 2.3 スコープ

#### 含むもの

- 正本方言の採用判断と根拠ドキュメントの作成
- 全 6 スキル EVALS.json のキー名統一（3 組 6 フィールドのリネーム）
- 各スキルの writer スクリプト（`log_usage.js`、`init_skill.js` 等）のキー名修正
- `validate-evals.js` の `DIALECT_PAIRS` 精査・拡充、permissive モードの廃止または非推奨化
- `evals-schema-spec.md` §3.1 の正本断定禁止方針の解除と正本方言明記
- dual root（`.claude/skills/` ⇄ `.agents/skills/`）の同時更新
- fixture（`apps/desktop/src/__tests__/__fixtures__/skill-creator/complete-skill/EVALS.json`）の更新
- 関連テストの更新（`skill-creator.fixture.test.ts` TC-004 / TC-037 等）

#### 含まないもの

- `metrics.*` 以外のスキーマ構造変更（フィールド追加・削除・ツリー再構成）
- `qualityInsights.*` / `phaseMetrics.*` の詳細検証（既知残課題として `evals-schema-spec.md` §7.4 に記載済み）
- `validate-evals.js` への新機能追加（CI 自動実行設定等 — 別タスク）
- EVALS.json の格納場所・ファイル形式変更

### 2.4 成果物

| 成果物                                       | パス                                                                                                            |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| 正本方言決定ドキュメント                     | `docs/30-workflows/unassigned-evals-schema-dialect-unification-001/outputs/phase-2/dialect-decision.md`（新規） |
| 更新後 EVALS.json（全 6 スキル × dual root） | `.claude/skills/<skill>/EVALS.json` / `.agents/skills/<skill>/EVALS.json`（6 スキル × 2 root）                  |
| 更新後 writer スクリプト                     | `.claude/skills/<skill>/scripts/log_usage.js`（+ `init_skill.js` 等）× 6 スキル                                 |
| 更新後 validate-evals.js                     | `.claude/skills/skill-fixture-runner/scripts/validate-evals.js`                                                 |
| 更新後 fixture JSON                          | `apps/desktop/src/__tests__/__fixtures__/skill-creator/complete-skill/EVALS.json`                               |
| 更新後テスト                                 | `apps/desktop/src/__tests__/fixtures/skill-creator.fixture.test.ts`                                             |
| 更新後 evals-schema-spec.md                  | `.claude/skills/aiworkflow-requirements/references/evals-schema-spec.md`                                        |
| 検証ログ                                     | `docs/30-workflows/unassigned-evals-schema-dialect-unification-001/outputs/phase-9/verification-log.md`         |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `UNASSIGNED-EVALS-VALIDATOR-GUARD-001` が完了し、`validate-evals.js` が `.claude/skills/skill-fixture-runner/scripts/` に存在すること。
- `node .claude/skills/skill-fixture-runner/scripts/validate-evals.js --all-skills` が全 6 スキルで PASS すること（permissive モード）。
- `docs/30-workflows/evals-consumer-audit-001/outputs/phase-5/evals-field-map.md` が最新状態であること。
- dual root（`.claude/skills/` / `.agents/skills/`）の現行 bit 一致が `diff -qr` で確認されていること。

### 3.2 依存タスク

| タスクID                             | 関係                           | ステータス |
| ------------------------------------ | ------------------------------ | ---------- |
| TASK-EVALS-CONSUMER-AUDIT-001        | 親（背景知識・field-map）      | 完了       |
| UNASSIGNED-EVALS-VALIDATOR-GUARD-001 | 先行（validate-evals.js 実装） | 完了       |

### 3.3 必要な知識

- EVALS.json スキーマ構造（camelCase v2 / snake_case v1 の 2 系統）と該当 6 フィールドの意味（`evals-schema-spec.md` §2〜§3 参照）。
- `evals-field-map.md` §5.2 の field_path 表（各 consumer が何のフィールドを read/write しているか）。
- `validate-evals.js` の `DIALECT_PAIRS` 定数と `validateL2` 関数の動作（permissive / strict 分岐）。
- dual root 同期手順（`schema-change-guide.md` §6.3）とアンチパターン（§6.4）。
- skill-creator の `init_skill.js` / `log_usage.js` の生成・書き込みパス。

### 3.4 推奨アプローチ

1. **正本方言の確定（Phase 1〜2）**: `evals-field-map.md` §5.2 を参照し、現行の consumer 数・行数・テスト固定状況から「camelCase v2 を正本とする」か「snake_case v1 を正本とする」かを決定する。根拠と移行コスト見積もりを `dialect-decision.md` に記録する。
2. **対象 consumer の棚卸し（Phase 2）**: `grep -rn "skill_name\|current_level\|total_usage_count\|last_evaluated" .claude/` と `grep -rn "skillName\|currentLevel\|totalUsageCount\|lastEvaluated" .claude/` で現行参照を全件収集し、修正対象ファイルを行番号単位で列挙する。
3. **1 フィールドずつ順次移行（Phase 5）**: `writer → fixture → reader → test` の順で 1 フィールドペアをリネームし、各ステップで `node validate-evals.js --all-skills` と `pnpm typecheck` で緑を確認してから次フィールドへ進む。
4. **DIALECT_PAIRS 精査・拡充（Phase 5）**: `metrics.*` 系の方言ペアをリストに追加し、将来フィールド追加時の更新ポイントを utility として分離できないか設計する（Phase 2 でアーキテクチャを検討）。
5. **dual root 同時更新（各ステップ）**: `.claude/skills/` を修正した直後に `.agents/skills/` を同じ差分で更新し、`diff -qr .claude/skills .agents/skills` で bit 一致を確認する。
6. **permissive モード廃止（Phase 8）**: 全フィールド統一後に `validate-evals.js` の permissive モードを廃止または非推奨化し、`--strict` をデフォルトに変更する。
7. **evals-schema-spec.md 更新（Phase 12）**: §3.1 の「正本断定禁止方針」を解除し、確定した正本方言を明記する。

### 3.5 実装課題と解決策（親タスクからの教訓）

`UNASSIGNED-EVALS-VALIDATOR-GUARD-001` の実装で遭遇した苦戦箇所と解決策を以下に整理する。将来の実装者はこの表を参照することで同様の課題を先回りして解決できる。

| #   | 課題                                                                      | 発見経緯                                                                  | 解決策                                                                              | 教訓                                                                                      |
| --- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| A   | 方言自動検出ロジックが複雑化し、`DIALECT_PAIRS` リストへの依存が生じた    | `validateL2` の実装時に「どちらの方言か」を判定するロジックが必要になった | `DIALECT_PAIRS` を定数に切り出し、ペアの追加を 1 箇所で管理                         | 方言ペアリストは外部化して再利用可能な utility にし、コード内に散在させない               |
| B   | permissive / strict の 2 モードでテストケースが倍増                       | `vitest` でモード別のテストを書き始めて件数が急増した                     | モードを関数引数で切り替え、テストは 1 ファイルにまとめた                           | 方言統一後は strict モードのみにし、permissive テストを削除できる                         |
| C   | `metrics.*` 系のフィールドが `DIALECT_PAIRS` に未登録で検証対象外になった | validator 実装後に `evals-field-map.md` を見直して発見                    | 現バージョンでは scope out として仕様書に明記し、本タスクで完全対応                 | フィールドペアリストは `evals-field-map.md` §5.2 を唯一の真実として同期する               |
| D   | `skillName` / `skill_name` の検出順序が validator の判定に影響した        | camelCase 優先で検出した場合に snake_case スキルで誤 PASS が発生          | camelCase の有無のみで方言判定し、snake_case のみ存在する場合も正常扱い             | 方言検出は「どちらが存在するか」で判定し、存在しない方言については欠落 warning にとどめる |
| E   | dual root 更新を後回しにして `.agents/skills/` の bit 差分が残留した      | Phase 5 終盤で `diff -qr` を走らせて発見                                  | 「`.claude/` 修正 → 即 `.agents/` 同期 → `diff -qr` 確認」を 1 フィールド単位に強制 | dual root 更新は「同一 commit 内」を鉄則にする                                            |

---

## 4. 実行手順（Phase 1〜13）

### Phase 構成概要

| Phase | 名称             | 目的                                                   |
| ----- | ---------------- | ------------------------------------------------------ |
| 1     | 要件定義         | スコープ・受入条件・inventory の確定                   |
| 2     | 設計             | 正本方言の決定・移行アーキテクチャの設計               |
| 3     | 設計レビュー     | Phase 4 進行可否の判定                                 |
| 4     | テスト作成       | TDD RED: 統一後のスキーマを検証するテスト群を先に作成  |
| 5     | 実装             | フィールド統一・writer / reader / fixture 修正         |
| 6     | テスト拡充       | fail path・dual root 回帰ガード                        |
| 7     | カバレッジ確認   | 変更ファイルの line/branch カバレッジ可視化            |
| 8     | リファクタリング | permissive モード廃止・DIALECT_PAIRS 整理              |
| 9     | 品質保証         | typecheck / lint / validate-evals.js 全スキル検証      |
| 10    | 最終レビュー     | 受入条件と blocker の判定                              |
| 11    | 手動テスト       | dual root 一致・fixture テスト・writer 連続実行        |
| 12    | ドキュメント更新 | implementation-guide / spec-sync / 未タスク / feedback |
| 13    | PR 作成          | ユーザーの明示承認後のみ実施                           |

---

### Phase 1: 要件定義

#### 目的

方言統一の受入条件・対象 inventory・スコープ外を確定する。

#### 手順

1. `node .claude/skills/skill-fixture-runner/scripts/validate-evals.js --all-skills --verbose` を実行し、現行の方言ごとの PASS/FAIL 件数を記録する。
2. `grep -rn "skill_name\|current_level\|total_usage_count\|last_evaluated" .claude/skills/` で snake_case 参照の全件リストを作成する。
3. `grep -rn "skillName\|currentLevel\|totalUsageCount\|lastEvaluated" .claude/skills/` で camelCase 参照の全件リストを作成する。
4. 上記リストを `outputs/phase-1/dialect-inventory.md` にまとめ、スキル別・ファイル別の方言採用状況を一覧化する。
5. 受入条件（AC-1〜AC-6）を確定し、`outputs/phase-1/acceptance-criteria.md` に記録する。

#### 受入条件（AC）

- AC-1: 全 6 スキルの EVALS.json が正本方言の 3 組 6 フィールドのみを使用している（旧方言が `grep` で 0 件）。
- AC-2: 全 writer スクリプトが正本方言で書き込みを行っている。
- AC-3: `validate-evals.js --all-skills --strict` が全 6 スキルで PASS する。
- AC-4: dual root（`.claude/skills/` / `.agents/skills/`）の全 6 スキルで bit 一致している。
- AC-5: skill-creator の `init_skill.js` + `log_usage.js` 連続実行で `totalUsageCount`（or `total_usage_count`）が `NaN` にならない。
- AC-6: `evals-schema-spec.md` §3.1 に正本方言が明記されている。

#### 成果物

- `outputs/phase-1/dialect-inventory.md`（方言別 consumer 一覧）
- `outputs/phase-1/acceptance-criteria.md`（AC-1〜AC-6）

#### 完了条件

- [ ] dialect-inventory.md が作成されている（スキル別 × ファイル別 × 行番号）
- [ ] 受入条件 AC-1〜AC-6 が文書化されている

---

### Phase 2: 設計

#### 目的

正本方言を 1 つに決定し、移行アーキテクチャと順序を設計する。

#### 手順

1. `evals-field-map.md` §5.2 の field_path 表を参照し、camelCase 採用スキル数と snake_case 採用スキル数を比較する。
2. 「camelCase v2 を正本とする」vs「snake_case v1 を正本とする」の採用基準（consumer 数 / fixture 修正コスト / CLI 契約との整合）を検討し、`dialect-decision.md` に根拠と決定を記録する。
3. 移行順序を設計する: `writer → fixture → EVALS.json → reader → test` の順で 1 フィールドペアずつ進める方針を確定する。
4. `DIALECT_PAIRS` の拡充設計: `metrics.*` 系（`totalUsageCount` / `total_usage_count` 等）をペアリストに追加し、将来フィールドを外部 JSON / 定数ファイルで管理できるアーキテクチャを検討する。
5. Phase 2 CLI 契約への方言ルール明記を検討し、実施するか否かを `dialect-decision.md` に記録する。

#### 成果物

- `outputs/phase-2/dialect-decision.md`（正本方言確定 + 根拠 + 移行コスト見積もり）
- `outputs/phase-2/migration-plan.md`（対象 consumer 一覧・移行順序・ロールバック手順）

#### 完了条件

- [ ] 正本方言が 1 つに確定され `dialect-decision.md` に明記されている
- [ ] 移行順序・対象ファイル・ロールバック手順が `migration-plan.md` に記載されている
- [ ] `DIALECT_PAIRS` 拡充の設計方針が決まっている

---

### Phase 3: 設計レビュー

#### 目的

Phase 2 の設計が Phase 4 進行可能な品質であるかを判定する。

#### 判定基準

| 項目               | PASS 条件                                                        |
| ------------------ | ---------------------------------------------------------------- |
| 正本方言           | 1 つに確定され根拠が明記されている                               |
| 対象 consumer 一覧 | 全 writer / reader / fixture / test が行番号単位で列挙されている |
| 移行順序           | ロールバックポイントが明確な段階的手順になっている               |
| DIALECT_PAIRS 設計 | 拡充方針が具体的に決まっている                                   |
| dual root 同期     | `.claude/` 修正後の即時 `.agents/` 同期が手順に組み込まれている  |

#### 成果物

- `outputs/phase-3/design-review-result.md`（PASS / FAIL + 指摘事項）

#### 完了条件

- [ ] 設計レビューが PASS している（FAIL 項目が 0 件）
- [ ] Phase 4 進行許可が得られている

---

### Phase 4: テスト作成（TDD RED）

#### 目的

方言統一後のスキーマを検証するテスト群を先に作成し、RED 状態にする。

#### 手順

1. `validate-evals.js` の `--strict` モードで全 6 スキルが FAIL する（現行方言が混在しているため）ことを確認する。これが TDD RED の開始状態。
2. 正本方言側のフィールドのみを assert する新規テストケースを `validate-evals.test.js` または `validate-evals.spec.js` に追加する。
3. skill-creator の `init_skill.js` + `log_usage.js` 連続実行で `NaN` にならないことを検証するテスト（または手動手順）を設計する。
4. fixture テスト（`skill-creator.fixture.test.ts` TC-004 / TC-037）の修正ポイントを特定し、更新差分をコメントに記録する（まだ修正しない）。

#### 注意事項

- Phase 4 でテストを作成する前に、対象フィールド名が Phase 2 で確定した正本方言と一致しているかを確認すること。
- `DIALECT_PAIRS` への新ペア追加は Phase 5 実装後に行う（Phase 4 時点では既存ペアのみで RED にする）。

#### 成果物

- `validate-evals.test.js`（strict モードの新規テストケース追加）
- `outputs/phase-4/test-design.md`（テスト設計書・RED 確認ログ）

#### 完了条件

- [ ] `node validate-evals.js --all-skills --strict` が現行状態で FAIL している（RED 確認）
- [ ] strict モード対応テストケースが設計されている
- [ ] NaN 伝播テストのシナリオが文書化されている

---

### Phase 5: 実装

#### 目的

1 フィールドペアずつ順次移行し、各ステップで GREEN を確認しながら全フィールドを統一する。

#### 手順（繰り返し: フィールドペアごと）

以下を **`skillName` / `skill_name` ペアから順に** 実施する:

1. **writer スクリプト修正**: 対象スキルの `log_usage.js` / `init_skill.js` でキー名を正本方言にリネームする。
2. **EVALS.json 修正**: 対象スキルの `.claude/skills/<skill>/EVALS.json` の旧方言キーを正本方言にリネームする。
3. **dual root 同期**: `.agents/skills/<skill>/EVALS.json` を `.claude/` と同一内容にする。`diff -qr .claude/skills/<skill>/EVALS.json .agents/skills/<skill>/EVALS.json` で確認。
4. **fixture 修正**: 対象フィールドを使用する fixture JSON を更新する。
5. **テスト更新**: 対象フィールドを assert するテストケース（TC-004 / TC-037 等）を正本方言に更新する。
6. **GREEN 確認**: `node validate-evals.js --skill <skill>` + `pnpm typecheck` で GREEN を確認してから次フィールドへ進む。

#### DIALECT_PAIRS 拡充（全フィールド移行後）

全フィールドペアの移行完了後、`validate-evals.js` の `DIALECT_PAIRS` に `metrics.*` 系ペアを追加する。

#### 変更対象ファイル一覧（Phase 2 で確定した内容に基づき更新すること）

| ファイル                                                                          | 変更種別                       |
| --------------------------------------------------------------------------------- | ------------------------------ |
| `.claude/skills/*/EVALS.json`（6 スキル）                                         | キー名リネーム                 |
| `.agents/skills/*/EVALS.json`（6 スキル）                                         | dual root 同期                 |
| `.claude/skills/*/scripts/log_usage.js`（6 スキル）                               | キー名リネーム                 |
| `.claude/skills/skill-creator/scripts/init_skill.js`                              | キー名リネーム                 |
| `.claude/skills/skill-fixture-runner/scripts/validate-evals.js`                   | `DIALECT_PAIRS` 拡充           |
| `apps/desktop/src/__tests__/__fixtures__/skill-creator/complete-skill/EVALS.json` | キー名リネーム                 |
| `apps/desktop/src/__tests__/fixtures/skill-creator.fixture.test.ts`               | assert 更新（TC-004 / TC-037） |

#### 成果物

- 上記ファイル群の修正差分（`git diff` で確認可能）

#### 完了条件

- [ ] 全 6 フィールドペアの移行が完了している
- [ ] `grep -rn "<旧方言キー>" .claude/skills/` が 0 件
- [ ] dual root の全 6 スキルで `diff -qr` が 0 件
- [ ] 全テストが GREEN

---

### Phase 6: テスト拡充

#### 目的

fail path・dual root 回帰ガード・混在検出テストを追加する。

#### 手順

1. 「旧方言キーが EVALS.json に残存している場合に validate-evals.js が FAIL する」テストケースを追加する。
2. dual root 不一致（`.claude/` と `.agents/` が異なる場合）を検出するテストケースを追加する。
3. `DIALECT_PAIRS` リストに存在しないフィールドが追加された場合の動作を確認するテストケースを追加する。
4. `pnpm test` で全テストが GREEN であることを確認する。

#### 成果物

- `validate-evals.test.js` への fail path テスト追加
- `outputs/phase-6/test-expansion-report.md`

#### 完了条件

- [ ] fail path テスト（旧方言残存 / dual root 不一致）が追加されている
- [ ] 全テストが GREEN

---

### Phase 7: カバレッジ確認

#### 目的

変更ファイルの line / branch カバレッジを可視化する。

#### 手順

1. `pnpm vitest run --coverage -- .claude/skills/skill-fixture-runner/scripts/validate-evals.js` でカバレッジを取得する（またはスクリプトのテスト対象に合わせた方法）。
2. `validateL2` の strict / permissive 分岐が branch 100% カバーされているかを確認する。
3. `DIALECT_PAIRS` の全ペアが検証されているかを確認する。

#### 目標

| ファイル            | line     | branch                              |
| ------------------- | -------- | ----------------------------------- |
| `validate-evals.js` | 90% 以上 | 90% 以上（`validateL2` 分岐を含む） |

#### 成果物

- `outputs/phase-7/coverage-report.md`

#### 完了条件

- [ ] `validate-evals.js` の line / branch カバレッジが目標値以上
- [ ] カバレッジレポートが `outputs/phase-7/` に保存されている

---

### Phase 8: リファクタリング

#### 目的

permissive モードの廃止・`DIALECT_PAIRS` の整理・重複コードの削除を行う。

#### 手順

1. `validate-evals.js` の permissive モードを廃止（または `--permissive` フラグとして opt-in に変更）し、`--strict` をデフォルト動作にする。
2. `DIALECT_PAIRS` を外部 JSON または別モジュールに切り出し、再利用可能な utility として分離できるか検討する（Phase 2 設計方針に従う）。
3. permissive モード用のテストケースを削除または `--permissive` フラグ対応に整理する。
4. `pnpm lint` と `pnpm typecheck` で品質確認する。

#### 変更内容記録テーブル

| 対象                           | Before                 | After           | 理由                                 |
| ------------------------------ | ---------------------- | --------------- | ------------------------------------ |
| `validate-evals.js` デフォルト | permissive             | strict          | 方言統一完了のため                   |
| `DIALECT_PAIRS` 管理場所       | インラインハードコード | 外部定数（TBD） | 将来フィールド追加時の管理コスト削減 |

#### 成果物

- 修正後の `validate-evals.js`
- `outputs/phase-8/refactoring-log.md`（Before/After/理由テーブル）

#### 完了条件

- [ ] permissive モードが廃止または opt-in に変更されている
- [ ] `validate-evals.js --all-skills` がデフォルトで strict 相当の動作をする
- [ ] lint / typecheck が PASS している

---

### Phase 9: 品質保証

#### 目的

typecheck / lint / validate-evals.js 全スキル検証 / dual root 一致の一括判定を行う。

#### 手順

1. `pnpm --filter @repo/desktop typecheck` を実行し、型エラーが 0 件であることを確認する。
2. `pnpm --filter @repo/desktop lint` を実行し、lint エラーが 0 件であることを確認する。
3. `node .claude/skills/skill-fixture-runner/scripts/validate-evals.js --all-skills` を実行し、6/6 PASS を確認する。
4. `diff -qr .claude/skills .agents/skills` を実行し、差分が 0 件であることを確認する（dual root 一致）。
5. 旧方言キーの残存確認: `grep -rn "skill_name\|current_level\|total_usage_count\|last_evaluated" .claude/skills/` が 0 件（正本が camelCase の場合）または逆方向で 0 件であることを確認する。
6. 上記全ての確認ログを `outputs/phase-9/verification-log.md` に記録する。

#### 成果物

- `outputs/phase-9/verification-log.md`（各コマンドの実行ログ）

#### 完了条件

- [ ] typecheck エラー 0 件
- [ ] lint エラー 0 件
- [ ] `validate-evals.js --all-skills` で 6/6 PASS
- [ ] dual root `diff -qr` が 0 件
- [ ] 旧方言キーの `grep` が 0 件

---

### Phase 10: 最終レビュー

#### 目的

受入条件 AC-1〜AC-6 と blocker の判定を行う。

#### 判定基準

| 受入条件                   | 確認方法                                                       | 判定      |
| -------------------------- | -------------------------------------------------------------- | --------- |
| AC-1: 旧方言キーが 0 件    | `grep -rn <旧方言キー> .claude/skills/`                        | PASS/FAIL |
| AC-2: writer が正本方言    | `grep -n "正本方言キー" .claude/skills/*/scripts/log_usage.js` | PASS/FAIL |
| AC-3: `--strict` で全 PASS | `node validate-evals.js --all-skills`                          | PASS/FAIL |
| AC-4: dual root 一致       | `diff -qr .claude/skills .agents/skills`                       | PASS/FAIL |
| AC-5: NaN 非発生           | skill-creator 手動実行 or Phase 11 手順                        | PASS/FAIL |
| AC-6: spec.md 更新済み     | `evals-schema-spec.md` §3.1 を読む                             | PASS/FAIL |

#### 成果物

- `outputs/phase-10/final-review-result.md`（AC 判定テーブル + blocker 一覧）

#### 完了条件

- [ ] AC-1〜AC-6 が全て PASS
- [ ] MAJOR blocker が 0 件

---

### Phase 11: 手動テスト

#### 目的

dual root 一致・NaN 非発生・fixture テストを手動で確認する。

#### タスク分類: NON_VISUAL

本タスクは UI/UX 変更を含まないため NON_VISUAL として扱う。Phase 11 スクリーンショットは不要。

#### 手動確認手順

1. **dual root 一致確認**:

   ```bash
   diff -qr .claude/skills .agents/skills
   # 出力なし（= 差分 0 件）が正常
   ```

2. **NaN 非発生確認（skill-creator）**:

   ```bash
   # 1. init_skill.js を実行して新規 EVALS.json を生成
   node .claude/skills/skill-creator/scripts/init_skill.js test-skill
   # 2. log_usage.js を 2 回連続実行
   node .claude/skills/skill-creator/scripts/log_usage.js test-skill
   node .claude/skills/skill-creator/scripts/log_usage.js test-skill
   # 3. totalUsageCount（or total_usage_count）が 1 → 2 と遷移し NaN でないことを確認
   node -e "console.log(JSON.parse(require('fs').readFileSync('.claude/skills/test-skill/EVALS.json', 'utf-8')))"
   ```

3. **fixture テスト実行**:

   ```bash
   pnpm --filter @repo/desktop test -- --grep "skill-creator.*fixture"
   ```

4. **validate-evals.js strict モード全スキル実行**:
   ```bash
   node .claude/skills/skill-fixture-runner/scripts/validate-evals.js --all-skills
   # 6/6 PASS を確認
   ```

#### 成果物

- `outputs/phase-11/manual-test-result.md`（各手順の実行結果ログ）

#### 完了条件

- [ ] dual root `diff -qr` が 0 件
- [ ] NaN 非発生が確認されている
- [ ] fixture テストが全件 PASS
- [ ] `validate-evals.js --all-skills` が 6/6 PASS

---

### Phase 12: ドキュメント更新

#### 目的

implementation-guide / システム仕様書更新 / documentation-changelog / 未タスク / skill-feedback を完了する。

#### Task 12-1: 実装ガイド作成（2 パート構成）

**Part 1（中学生レベル）**

EVALS.json は「スキルの成績表」のようなものです。クラスには 6 人の生徒（6 スキル）がいるのに、成績表の書き方がバラバラだと先生が採点できません。「国語の点数（`skillName`）」と書いた人と「こくごのてんすう（`skill_name`）」と書いた人が混在していた状態を、全員が同じ書き方にそろえるのがこのタスクです。そろえたあとは、先生（validate-evals.js）も「どちらの書き方でも OK」という特別モードを使わなくてよくなります。

**Part 2（技術者レベル）**

- 正本方言: （camelCase v2 / snake_case v1 — Phase 2 決定に基づき記載）
- 統一フィールド: `skillName`、`currentLevel`、`metrics.totalUsageCount`、`metrics.successCount`、`metrics.failureCount`、`metrics.successRate`、`metrics.averageDuration`、`metrics.lastEvaluated`
- `DIALECT_PAIRS`: Phase 8 後の最終定義を記載
- `validate-evals.js --all-skills` のデフォルトモード: strict

#### Task 12-2: システム仕様書更新

- **Step 1-A**: `task-workflow-completed.md`（または `task-workflow-completed-recent-2026-04g.md`）にタスク完了記録を追記する。
- **Step 1-B**: `task-workflow.md` の実装状況テーブルで `UNASSIGNED-EVALS-SCHEMA-DIALECT-UNIFICATION-001` を「完了」に更新する。
- **Step 1-C**: 関連タスクテーブルのステータスを更新する（`TASK-EVALS-CONSUMER-AUDIT-001` 等）。
- **Step 2**: `evals-schema-spec.md` §3.1 の「正本断定禁止方針」を解除し、確定した正本方言を明記する。`validate-evals.js` validator 情報を §7.1 の最新状態に同期する。

#### Task 12-3: ドキュメント更新履歴

`outputs/phase-12/documentation-changelog.md` に以下を記録する:

- Step 1-A〜1-C の実施結果
- Step 2 の `evals-schema-spec.md` 変更内容
- `validate-evals.js` の変更内容（DIALECT_PAIRS 拡充 / permissive 廃止）

#### Task 12-4: 未タスク検出

本タスク実施後に残る未対応課題を検出し、`unassigned-task/` に記録する。想定される候補:

- `qualityInsights.*` / `phaseMetrics.*` の詳細検証（`evals-schema-spec.md` §7.4 既知残課題）
- CI への `validate-evals.js --strict` 必須チェック化

#### Task 12-5: スキルフィードバックレポート

`outputs/phase-12/skill-feedback-report.md` に以下を記録する:

- Phase 4 での DIALECT_PAIRS 不足によるテスト設計の手戻り可能性
- permissive モード廃止に伴う既存 CI / テストへの影響

#### Task 12-6: コンプライアンスチェック

`outputs/phase-12/phase12-task-spec-compliance-check.md` を作成し、6 成果物の存在と内容の妥当性を確認する。

#### 成果物（Phase 12）

| 成果物                                | パス                                                     |
| ------------------------------------- | -------------------------------------------------------- |
| implementation-guide.md               | `outputs/phase-12/implementation-guide.md`               |
| system-spec-update-summary.md         | `outputs/phase-12/system-spec-update-summary.md`         |
| documentation-changelog.md            | `outputs/phase-12/documentation-changelog.md`            |
| unassigned-task-detection.md          | `outputs/phase-12/unassigned-task-detection.md`          |
| skill-feedback-report.md              | `outputs/phase-12/skill-feedback-report.md`              |
| phase12-task-spec-compliance-check.md | `outputs/phase-12/phase12-task-spec-compliance-check.md` |

#### 完了条件

- [ ] 上記 6 成果物が全て作成されている
- [ ] `evals-schema-spec.md` §3.1 が更新されている
- [ ] LOGS.md が 2 ファイル（`aiworkflow-requirements/LOGS.md` / `task-specification-creator/LOGS.md`）更新されている
- [ ] SKILL.md が 2 ファイル（`.claude/` / `.agents/`）更新されている
- [ ] `diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements` が 0 件

---

### Phase 13: PR 作成

#### 目的

ユーザーの明示承認後に PR を作成する。

#### 手順

1. ユーザーの明示承認を得る（口頭または Issue コメント）。
2. `git diff main...HEAD` で全変更を確認する。
3. `gh pr create` で PR を作成する。PR 本文に以下を含める:
   - 正本方言の確定結果
   - 修正スキル一覧（6 スキル）
   - `validate-evals.js --all-skills` の実行結果（6/6 PASS）
   - dual root 一致確認結果
   - AC-1〜AC-6 の判定結果

#### 完了条件

- [ ] ユーザーの明示承認が得られている
- [ ] PR が作成されている
- [ ] CI が GREEN になっている

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 全 6 スキルの EVALS.json が正本方言のみを使用している（旧方言が `grep` で 0 件）
- [ ] 全 writer スクリプトが正本方言で書き込んでいる
- [ ] `validate-evals.js --all-skills` が全 6 スキルで PASS する
- [ ] skill-creator の `init_skill.js` + `log_usage.js` 連続実行で NaN が発生しない

### 品質要件

- [ ] dual root（`.claude/skills/` / `.agents/skills/`）が全 6 スキルで bit 一致
- [ ] typecheck エラー 0 件
- [ ] lint エラー 0 件
- [ ] 関連テストが全件 PASS（`skill-creator.fixture.test.ts` TC-004 / TC-037 含む）

### ドキュメント要件

- [ ] `evals-schema-spec.md` §3.1 に正本方言が明記されている
- [ ] `validate-evals.js` の permissive モードが廃止または opt-in に変更されている
- [ ] Phase 12 の 6 成果物が全て作成されている
- [ ] LOGS.md が 2 ファイル更新されている

---

## 6. 検証方法

### テストコマンド

```bash
# 1. validate-evals.js strict モード全スキル実行
node .claude/skills/skill-fixture-runner/scripts/validate-evals.js --all-skills

# 2. dual root 一致確認
diff -qr .claude/skills .agents/skills

# 3. 旧方言残存確認（正本が camelCase の場合）
grep -rn "skill_name\|current_level\|total_usage_count\|last_evaluated" .claude/skills/

# 4. 型チェック
pnpm --filter @repo/desktop typecheck

# 5. lint
pnpm --filter @repo/desktop lint

# 6. fixture テスト
pnpm --filter @repo/desktop test -- --grep "skill-creator.*fixture"
```

---

## 7. リスクと対策

| リスク                                                                                      | 影響度 | 発生確率 | 対策                                                                                                              |
| ------------------------------------------------------------------------------------------- | ------ | -------- | ----------------------------------------------------------------------------------------------------------------- |
| 旧方言キーが grep で検出できない場所（動的アクセス等）に残存し、サイレント break が継続する | 高     | 低       | `evals-field-map.md` §5.2 の consumer 一覧を突合し、動的アクセスパターンを Phase 2 で特定する                     |
| dual root の片側だけを更新し、bit 差分が発生する                                            | 中     | 中       | 「`.claude/` 修正 → 即 `.agents/` 同期 → `diff -qr` 確認」を 1 フィールド単位に強制する（§3.5 教訓 E 参照）       |
| fixture テスト（TC-004 / TC-037）が正本方言と逆の方言を assert しており、修正を見落とす     | 中     | 中       | Phase 4 でテスト設計時に TC-004 / TC-037 の assert 内容を先に確認し、修正ポイントを列挙する                       |
| `DIALECT_PAIRS` の `metrics.*` 系ペアを追加したことで既存 permissive テストが FAIL する     | 低     | 中       | Phase 6 でテストを拡充し、`DIALECT_PAIRS` 追加後の挙動を確認する                                                  |
| permissive モード廃止が既存 CI / 自動化スクリプトに影響する                                 | 中     | 低       | Phase 8 前に `grep -rn "validate-evals.js"` で呼び出し元を特定し、strict 対応が必要な箇所を事前にリストアップする |

---

## 8. 参照情報

### 関連ドキュメント

| 資料名                      | パス                                                                                | 説明                                                         |
| --------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| EVALS.json スキーマ仕様     | `.claude/skills/aiworkflow-requirements/references/evals-schema-spec.md`            | camelCase v2 / snake_case v1 両系統の正本                    |
| EVALS.json フィールドマップ | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-5/evals-field-map.md`     | consumer 別 field_path 表                                    |
| スキーマ変更ガイド          | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-8/schema-change-guide.md` | リネーム手順・dual root 同期・アンチパターン                 |
| dual root parity レポート   | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-6/dual-root-parity.md`    | bit-for-bit 一致検証の記録                                   |
| validate-evals.js           | `.claude/skills/skill-fixture-runner/scripts/validate-evals.js`                     | L1/L2/L3 validator（DIALECT_PAIRS / permissive/strict 分岐） |
| 先行タスク仕様書            | `docs/30-workflows/unassigned-task/task-evals-schema-dialect-unification-001.md`    | 同一目標の先行仕様書（consumer 移行手順詳細）                |

### 補足

本タスク仕様書は `UNASSIGNED-EVALS-VALIDATOR-GUARD-001` の Phase 12 苦戦箇所フィードバックを起点に作成された。`task-evals-schema-dialect-unification-001.md` との重複を避けるため、本仕様書は特に **`validate-evals.js` 実装後の視点からの知見**（permissive モード廃止・DIALECT_PAIRS 管理・Phase 1〜13 全フロー）に特化している。実装者は両ファイルを合わせて参照することを推奨する。
