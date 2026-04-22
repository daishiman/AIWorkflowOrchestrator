# EVALS スキーマ方言（camelCase / snake_case）統一 - タスク指示書

## メタ情報

```yaml
issue_number: 2383
task_id: UNASSIGNED-EVALS-SCHEMA-DIALECT-UNIFICATION-001
task_name: EVALS スキーマ方言（camelCase / snake_case）統一
category: 改善
target_feature: EVALS writer / reader / fixture（skill-creator / aiworkflow-requirements / task-specification-creator / int-test-skill / github-issue-manager / skill-fixture-runner）
priority: 高
scale: 中規模
status: completed
source_phase: TASK-EVALS-CONSUMER-AUDIT-001 Phase 12
created_date: 2026-04-19
completed_date: 2026-04-21
dependencies: [UNASSIGNED-EVALS-SPEC-SNAKE-CASE-V1-DOCUMENT-001]
spec_path: docs/30-workflows/UNASSIGNED-EVALS-SCHEMA-DIALECT-UNIFICATION-001/index.md
```

| 項目         | 内容                                                                                                                                                                   |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID     | UNASSIGNED-EVALS-SCHEMA-DIALECT-UNIFICATION-001                                                                                                                        |
| タスク名     | EVALS スキーマ方言（camelCase / snake_case）統一                                                                                                                       |
| 分類         | 改善                                                                                                                                                                   |
| 対象機能     | EVALS writer / reader / fixture（skill-creator / aiworkflow-requirements / task-specification-creator / int-test-skill / github-issue-manager / skill-fixture-runner） |
| 優先度       | 高                                                                                                                                                                     |
| 見積もり規模 | 中規模                                                                                                                                                                 |
| ステータス   | completed                                                                                                                                                              |
| 発見元       | TASK-EVALS-CONSUMER-AUDIT-001 Phase 12                                                                                                                                 |
| 発見日       | 2026-04-19                                                                                                                                                             |
| 関連タスク   | UNASSIGNED-EVALS-SPEC-SNAKE-CASE-V1-DOCUMENT-001（先行）／ UNASSIGNED-SKILL-FIXTURE-RUNNER-EVALS-SCHEMA-VALIDATE-001（後続）                                           |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-EVALS-CONSUMER-AUDIT-001 Phase 12 の監査で、EVALS スキーマに camelCase 系（v2）と snake_case 系（v1）の 2 系統が共存していることが確定した。
同一概念を指すキーが 3 組 6 フィールド並立しており、writer / reader / fixture のどれが正しい方言を使うかが skill ごとに異なる。

- camelCase 系を使う skill: `task-specification-creator` / `int-test-skill` / `github-issue-manager`
- snake_case 系を使う skill: `skill-creator` / `aiworkflow-requirements` / `skill-fixture-runner`（fixture）
- 根拠資料: `docs/30-workflows/evals-consumer-audit-001/outputs/phase-12/implementation-guide.md` §3.2 / `phase-5/evals-field-map.md` §5.2

### 1.2 問題点・課題

- 3 組 6 フィールド（`currentLevel` / `current_level`、`metrics.totalUsageCount` / `metrics.total_usage_count`、`metrics.lastEvaluated` / `metrics.last_evaluated`）が 2 系統で並立し、キー名不一致のまま `writer → reader` が接続されると `undefined` が伝播する。
- 同一スキル（`skill-creator`）内で `init_skill.js`（camelCase 生成）と `log_usage.js`（snake_case 期待）がミスマッチしており、累計使用回数の集計で `NaN` が発生する潜在リスクがある。
- fixture（`apps/desktop/src/__tests__/fixtures/skill-creator.fixture.test.ts:163` 他）が snake_case を unit test 契約として固定しているため、どちらの方言を正本にするかで修正コストと影響範囲が大きく変わる。
- validator が 0 件のため、方言ミスマッチは型でも test でも検出されず、silent break として本番 EVALS ファイルに蓄積し得る。

### 1.3 放置した場合の影響

- 新規 consumer 追加時に、どちらの方言を書けばよいかの判断材料がなく、誤った方言で writer を足すと既存 reader と noop になる。
- skill-creator 系の `NaN` 伝播が実際の EVALS ファイルに記録され、後続の集計・表示で値が壊れる。
- dual root（`.claude/skills` / `packages/skills`）の片側だけが方言変更されると、対称性が崩れて bit 差分が発生する。
- schema-change-guide.md §5 リネーム手順が camelCase / snake_case 両系統を扱わざるを得ない状態が続き、フィールド操作のたびに二重手順が必要になる。

---

## 2. 何を達成するか（What）

### 2.1 目的

EVALS スキーマの正本方言を 1 系統に確定し、全 consumer（writer / reader / fixture / test）を同じ方言へ揃えて silent break を排除する。

### 2.2 最終ゴール

- 正本方言（camelCase v2 または snake_case v1）が決定され、docs に明記されている。
- 全 writer / reader / fixture / test が正本方言だけを使用している。
- `skill-creator` の `init_skill.js` と `log_usage.js` が同じ方言で整合している。
- `schema-change-guide.md` §5 のリネーム手順が 1 系統のみ扱う形に簡素化されている。
- dual root（`.claude/skills` / `packages/skills`）の bit 一致が保たれている。

### 2.3 スコープ

#### 含むもの

- 正本方言の採用判断（先行タスク UNASSIGNED-EVALS-SPEC-SNAKE-CASE-V1-DOCUMENT-001 の成果を根拠にする）
- 対象 3 組 6 フィールド（`currentLevel` / `metrics.totalUsageCount` / `metrics.lastEvaluated` とその snake_case 対）の統一
- skill-creator / aiworkflow-requirements / task-specification-creator / int-test-skill / github-issue-manager / skill-fixture-runner の writer / reader / fixture 修正
- fixture（`apps/desktop/src/__tests__/__fixtures__/skill-creator/complete-skill/EVALS.json` 等）と関連 test（`skill-creator.fixture.test.ts` TC-004 / TC-037 ほか）の更新
- schema-change-guide.md §5 の単系統化
- dual root 同期手順に沿った両ルートの一括更新

#### 含まないもの

- スキーマ構造自体の変更（フィールド追加・削除・ツリー再構成）
- validator（`validate-schemas.js` 等）の新規実装 — 後続タスクに委譲
- EVALS の格納場所・ファイル形式変更
- 既存 EVALS データの値自体の書き換え（方言変更に伴うキー名リネームのみ実施）

### 2.4 成果物

| 成果物                                 | パス                                                                                                                                 |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 正本方言決定ドキュメント               | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-12/dialect-unification-decision.md`（新規）                                |
| 方言統一移行計画                       | 同上の移行計画セクション（対象 consumer 一覧・順序・ロールバック手順）                                                               |
| 更新後 writer / reader                 | `.claude/skills/{skill-creator,aiworkflow-requirements,task-specification-creator,int-test-skill,github-issue-manager}/scripts/*.js` |
| 更新後 dual root 同期成果物            | `packages/skills/**` 同名ファイル                                                                                                    |
| 更新後 fixture                         | `apps/desktop/src/__tests__/__fixtures__/skill-creator/complete-skill/EVALS.json` 他                                                 |
| 更新後 test                            | `apps/desktop/src/__tests__/fixtures/skill-creator.fixture.test.ts`（TC-004 / TC-037）                                               |
| schema-change-guide.md §5 単系統化差分 | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-8/schema-change-guide.md`                                                  |
| 検証ログ                               | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-12/dialect-unification-verification.md`                                    |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-EVALS-CONSUMER-AUDIT-001 Phase 12 が完了し、`evals-field-map.md` / `implementation-guide.md` / `schema-change-guide.md` が最新状態であること。
- `phase-5/evals-field-map.md` §5.2 で両系統の `field_path` が列挙されていること。
- 先行タスク UNASSIGNED-EVALS-SPEC-SNAKE-CASE-V1-DOCUMENT-001 で正本方言の候補が整理されていること。
- dual root（`.claude/skills` と `packages/skills`）の現行 bit 一致が確認されていること。

### 3.2 依存タスク

| タスクID                                                  | 関係 | ステータス |
| --------------------------------------------------------- | ---- | ---------- |
| UNASSIGNED-EVALS-SPEC-SNAKE-CASE-V1-DOCUMENT-001          | 先行 | 未実施     |
| TASK-EVALS-CONSUMER-AUDIT-001                             | 親   | 完了       |
| UNASSIGNED-SKILL-FIXTURE-RUNNER-EVALS-SCHEMA-VALIDATE-001 | 後続 | 未実施     |

### 3.3 必要な知識

- EVALS スキーマ構造（camelCase v2 / snake_case v1 の 2 系統）と該当 6 フィールドの意味。
- `phase-5/evals-field-map.md` §5.2 の field_path 表と、`phase-12/implementation-guide.md` §3.2 / §3.5 の発見事項。
- `schema-change-guide.md` §5 のリネーム手順（対象行番号リスト §5.3 を含む）。
- dual root 同期手順（§6.3）と、アンチパターン（§6.4）。
- skill-creator の `init_skill.js` / `log_usage.js` の生成 / 書き込みパス。

### 3.4 推奨アプローチ

1. **正本方言の確定**: 先行タスクの決定に従い、採用方言を docs に明記する。
2. **対象 consumer の棚卸し**: `phase-5/evals-field-map.md` §5.2 と `phase-12/implementation-guide.md` §3.2 / §3.5 / §（consumer 一覧）を突き合わせ、修正対象の writer / reader / fixture / test を行番号単位で列挙する。
3. **順序決定**: writer → fixture → reader → test の順にリネームし、中間で型 or test が壊れた場合にロールバックしやすい粒度で PR を分割する。
4. **dual root 同期**: `.claude/skills` を修正した直後に `packages/skills` を同じ差分で更新し、`schema-change-guide.md` §6.3 の手順に沿う。
5. **skill-creator 内部整合**: `init_skill.js` と `log_usage.js` を同じ方言で揃え、`NaN` 伝播ケースが再現しないことを手動で確認する。
6. **fixture / test 更新**: `skill-creator.fixture.test.ts` の TC-004 / TC-037 の assert を新方言に合わせて書き換える（§3.5 に明記のとおり修正必須）。
7. **schema-change-guide.md §5 の簡素化**: 正本方言のみを扱う単系統手順に書き換え、旧方言向け手順は削除または「移行前 legacy 手順」として明示する。
8. **検証**: `schema-change-guide.md` §7 に沿って typecheck / test / dual root diff を確認し、結果を `dialect-unification-verification.md` に記録する。

---

## 4. 苦戦箇所記録

### 4.1 記録1: camelCase / snake_case が 3 組 6 フィールドで並立している

`currentLevel` / `current_level`、`metrics.totalUsageCount` / `metrics.total_usage_count`、`metrics.lastEvaluated` / `metrics.last_evaluated` の 3 組が、同じ概念を指しながら 6 consumer にまたがって異なる方言で書き込み / 読み込みされている。
単純な文字列置換では対象範囲を読み誤り、片側だけリネームした瞬間に reader が `undefined` を返し始める。

**対処方針**: `phase-5/evals-field-map.md` §5.2 の field_path 表を唯一の真実とし、修正前後で表を diff 比較する。writer → fixture → reader → test の順に 1 フィールドずつ揃え、各ステップで test を緑に戻してから次フィールドに進む。

### 4.2 記録2: skill-creator 内で init（camelCase）と log_usage（snake_case）がミスマッチし NaN が伝播する

`init_skill.js` は camelCase で初期 EVALS を生成するのに対し、`log_usage.js` は snake_case のキーで累計を読み書きしようとする。
結果として `totalUsageCount` が `undefined` のまま `+1` され、`NaN` が EVALS に書き戻るリスクが潜在する（`phase-12/implementation-guide.md` §3.2 / §（未タスク候補 #1・#2）参照）。

**対処方針**: skill-creator を最初の修正対象とし、`createEvalsTemplate()` と `log_usage.js` の読み書きキーを同一方言に揃える PR を単独で切る。修正後、`createEvalsTemplate()` → `log_usage.js` → 再度 `log_usage.js` の 2 回連続ログを手動で走らせ、`totalUsageCount`（or `total_usage_count`）が `0 → 1 → 2` と遷移することを目視確認する。

### 4.3 記録3: fixture が snake_case を test 契約として固定している

`apps/desktop/src/__tests__/fixtures/skill-creator.fixture.test.ts:163` の `expect(evals.skill_name).toBeDefined()`（TC-004）と TC-037 が snake_case を unit test 契約として固定している（`phase-12/implementation-guide.md` §3.5）。
camelCase に統一する決定となった場合、test を修正せずに writer だけ camelCase に切り替えると、TC-004 / TC-037 は grep では検出されず assert レベルで赤になる。

**対処方針**: 修正対象 test を先に列挙し（§3.4 手順 2）、writer の PR と同時に test assert を新方言に差し替える。fixture JSON も同じ PR 内で更新し、`schema-change-guide.md` §5.3 の「更新箇所リスト」に TC-004 / TC-037 を明示的に追記する。

### 4.4 記録4: validator が 0 件で、統一中の中間状態で silent break が検出できない

現状 `validate-schemas.js` 等の validator が 0 件であるため、writer と reader の方言が途中でずれても typecheck / lint / 既存 test では検出できない（`phase-12/implementation-guide.md` §3.2 末尾・§主要発見参照）。
リネーム作業中の一時不整合が PR に紛れ込むと、本番 EVALS に silent で `undefined` が書き込まれ続ける。

**対処方針**: 本タスクでは validator の新規実装は行わないが、修正単位を「writer + fixture + reader + test を 1 フィールド分まとめて 1 PR」に固定し、PR マージ前後で手動の `grep -rn` によって対象キー名の残存が 0 件であることを確認する。validator 実装は後続タスク UNASSIGNED-SKILL-FIXTURE-RUNNER-EVALS-SCHEMA-VALIDATE-001 に委譲し、その依存関係を PR 本文に明記する。

### 4.5 記録5: dual root（`.claude/skills` / `packages/skills`）の非対称リスク

リネームを片側のルートだけに適用すると、Phase 11 で確認された dual root bit 一致が崩れる（`schema-change-guide.md` §6.4 アンチパターン）。

**対処方針**: `schema-change-guide.md` §6.3 の手順に従い、片側修正 → `diff -r` → もう片側へ同一差分適用 → 再度 `diff -r` で bit 一致を確認、を 1 フィールドごとに実施する。結果を `dialect-unification-verification.md` に dual root diff ログとして残す。

---

## 5. 完了条件

- [ ] 正本方言（camelCase v2 または snake_case v1）が決定され、`dialect-unification-decision.md` に根拠とともに明記されている。
- [ ] 対象 6 skill（skill-creator / aiworkflow-requirements / task-specification-creator / int-test-skill / github-issue-manager / skill-fixture-runner）の writer / reader / fixture / test が全て正本方言で揃っている。
- [ ] 対象 3 組 6 フィールド（`currentLevel` / `metrics.totalUsageCount` / `metrics.lastEvaluated` の両系統）の旧方言が `grep -rn` で 0 件であることを確認している（legacy 互換レイヤを明示的に残す場合はその旨と範囲を `dialect-unification-decision.md` に記述）。
- [ ] skill-creator の `init_skill.js` と `log_usage.js` が同一方言で整合し、連続 log_usage 実行時に累計使用回数が `NaN` にならないことを手動確認している。
- [ ] `apps/desktop/src/__tests__/fixtures/skill-creator.fixture.test.ts` の TC-004 / TC-037 を含む全 test が緑である。
- [ ] dual root（`.claude/skills` と `packages/skills`）の差分が対象ファイルで 0 bit 差であることを確認し、ログを残している。
- [ ] `schema-change-guide.md` §5 が正本方言のみを扱う単系統手順に簡素化されている。
- [ ] 移行計画・検証ログ（`dialect-unification-decision.md` / `dialect-unification-verification.md`）が dual root 同期手順に準拠した形で記載されている。
- [ ] 先行タスク UNASSIGNED-EVALS-SPEC-SNAKE-CASE-V1-DOCUMENT-001 の成果を根拠として引用している。
- [ ] 後続タスク UNASSIGNED-SKILL-FIXTURE-RUNNER-EVALS-SCHEMA-VALIDATE-001 への引き継ぎ事項（validator 実装スコープ / 優先フィールド）が PR 本文または `dialect-unification-verification.md` に記載されている。
- [x] typecheck / lint / 関連 test が通る。

---

## 6. 完了記録

| 項目            | 内容                                                                               |
| --------------- | ---------------------------------------------------------------------------------- |
| 完了日          | 2026-04-21                                                                         |
| 採用方言        | snake_case v1                                                                      |
| 更新スキル      | automation-30 / github-issue-manager / int-test-skill / task-specification-creator |
| 対象ルート      | `.claude/skills/` + `.agents/skills/`（dual root bit-for-bit 同期）                |
| 対応ブランチ    | `docs/task-spec-UNASSIGNED-EVALS-SCHEMA-DIALECT-UNIFICATION-001`                   |
| タスク仕様書    | `docs/30-workflows/UNASSIGNED-EVALS-SCHEMA-DIALECT-UNIFICATION-001/index.md`       |
| Phase 12 成果物 | `outputs/phase-12/` 配下の必須 6 ファイル（implementation-guide 他）               |
| 後続タスク      | UNASSIGNED-SKILL-FIXTURE-RUNNER-EVALS-SCHEMA-VALIDATE-001（validator 実装）        |
