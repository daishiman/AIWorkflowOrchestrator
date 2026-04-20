# EVALS.json Schema Change Guide

> ★ 最終成果物 4 / TASK-EVALS-CONSUMER-AUDIT-001 Phase 8
> AC-5 / FR-7 の直接根拠。AC-6（TASK-CONFLICT-PREVENT-001）の解除判定（Phase 10）入力。
> 本ガイドは「フィールド追加 / 削除 / リネーム」3 操作を安全に実施するための**唯一の正本手順書**である。

---

## メタ情報

| 項目               | 内容                                                                                                                                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| task_id            | TASK-EVALS-CONSUMER-AUDIT-001                                                                                                                                                               |
| phase_id           | 8                                                                                                                                                                                           |
| 生成日時           | 2026-04-19                                                                                                                                                                                  |
| 依存成果物         | `phase-5/consumer-audit-report.md`、`phase-5/evals-field-map.md`、`phase-6/dual-root-parity.md`、`phase-7/coverage-recheck.md`                                                              |
| 対応 AC            | AC-5 / FR-7（Phase 1）、AC-6 解除条件（TASK-CONFLICT-PREVENT-001）                                                                                                                          |
| 対応 Quality Gate  | QG-7（Phase 2）                                                                                                                                                                             |
| 対象 root          | `.claude/skills/*/EVALS.json`（6 件） / `.agents/skills/*/EVALS.json`（6 件） / `apps/desktop/src/__tests__/__fixtures__/skill-creator/complete-skill/EVALS.json`                           |
| consumer 集合      | Phase 5-A §3〜§6（A/B/C/D 4 分類 32 件 + 動的パス 13 件）                                                                                                                                   |
| 対象フィールド総数 | **56 件**（evals-field-map.md §4.1 集計）                                                                                                                                                   |
| validator 件数     | **0 件**（`validate-schemas.js` は EVALS.json を対象外とする — evals-field-map.md §1 / §4.4）                                                                                               |
| dual root 同期前提 | Phase 6 で `.claude` / `.agents` の 6 スキル全件が **bit-for-bit 一致**（cmp -s IDENTICAL、SHA-256 同一）                                                                                   |
| スキーマ方言       | **camelCase v2 系**（task-specification-creator / github-issue-manager / int-test-skill）／**snake_case v1 系**（skill-creator / aiworkflow-requirements / fixture / skill-fixture-runner） |

### 🚨 クリティカル前提（必ず読むこと）

1. **validator=0 件**: EVALS.json の構造（キー有無・型）を実行時または CI 時に検証する consumer は現状 **0 件** である。リネーム・削除時の発見機構（fail-fast）は存在せず、`undefined` 参照による **NaN 伝播・サイレント破損**が主たるリスクである。本ガイドの「検証手順」は手動 `rg` / `diff` / `node --check` のみに依存する。
2. **camelCase / snake_case 二重スキーマ併存**: 同一概念（例: `currentLevel` vs `current_level`）が 2 系統で並立。**どちらかを正本と断定しない**（Phase 2 §3.1）。ガイドは両方を 2 行に分けて扱う。
3. **dual root 正本を断定しない**: `.claude/skills/` / `.agents/skills/` のどちらが正本かは本ガイドの範囲外。両 root を **同一 commit で同時更新**する運用に固定する。
4. **fixture EVALS.json の更新義務**: `apps/desktop/src/__tests__/__fixtures__/skill-creator/complete-skill/EVALS.json` は snake_case v1 系の期待値として `apps/desktop/src/__tests__/fixtures/skill-creator.fixture.test.ts` (TC-004) の assertion を固定する。スキーマ変更時は必ず連動して更新する。
5. **SkillScanner.ts はスキーマ非依存**: filename / size / type=evals タグのみを扱い、内容 parse は行わない（consumer-audit-report.md §3.1）。本ガイドの影響範囲判定から **SkillScanner.ts を除外してよい**（下流 UI で `type=evals` タグを参照する経路は Phase 7 / Phase 9 で未タスク化済）。

---

## 1. 目的

`.claude/skills/*/EVALS.json` / `.agents/skills/*/EVALS.json` および fixture EVALS.json の **スキーマ変更 3 操作（追加 / 削除 / リネーム）** を、consumer 破損・dual root ドリフト・スキーマ方言汚染なく実施するための手順書。

本ガイドは**単体では実装を行わない**。コード変更が必要な操作（リネーム・削除）は、本ガイドの手順列挙に従って**後続タスク**が行う。

---

## 2. 前提条件

### 2.1 着手前チェック

- [ ] TASK-CONFLICT-PREVENT-001 AC-6 の解除判定（Phase 10 成果物 `phase-10/ac6-release-verdict.md`）を確認
- [ ] 変更対象フィールドが `phase-5/evals-field-map.md` §3 に列挙されていること
- [ ] 変更対象が `phase-5/consumer-audit-report.md` §3〜§6 の consumer 集合と整合していること
- [ ] Phase 6 `dual-root-parity.md` の差分タイプが **0（完全一致）** であること（もし「要対応」があれば本ガイド適用前に解消）
- [ ] Phase 7 `coverage-recheck.md` の QG-6 が PASS しており、漏れヒット 0 が保証されていること
- [ ] 最新 main / 並行ブランチで同スキーマを触るタスクが無いことを確認

### 2.2 禁止事項

- ❌ 実データ（既存 EVALS.json の value）を本ガイド適用 PR で同時に書き換えること（別タスクに委譲）
- ❌ `.claude/skills/` と `.agents/skills/` を**別 commit / 別 PR** で更新すること（bit-for-bit 同期を崩す）
- ❌ TypeScript の EVALS 型定義を新規追加すること（実装ガードに相当。別タスク `task-skill-fixture-runner-evals-schema-validate-001` へ委譲）
- ❌ `validate-schemas.js` / `validate-skill-structure.js` の拡張を本ガイド適用で同時実施すること（別タスクに委譲）

### 2.3 推奨ワークフロー概観

```
プラン    → schema-change-guide.md §3/§4/§5 を参照し影響範囲確定
   ↓
実装      → consumer 一覧（evals-field-map.md 逆引き）を閉じる
   ↓
検証      → §7 の 3 カテゴリ検証コマンドを実行
   ↓
dual sync → .claude/.agents を同一 commit で更新（§6）
   ↓
fixture   → fixture EVALS.json と fixture テストを同期更新
   ↓
記録      → evals-field-map.md / consumer-audit-report.md を更新
```

---

## 3. フィールド追加手順

### 3.1 影響範囲（Read）

- **既存 consumer が `undefined` を許容するか**が最大の論点。evals-field-map.md §3 の各行 `readers` 列を起点に逆引きする。
- **camelCase 系のみ追加**する場合: 影響 reader は `C:tsc-log-usage` / `A:tsc-log-usage` / `C:sc-collect_feedback` / `A:sc-collect_feedback`（evals-field-map.md §2）。snake_case 系（skill-creator / aiworkflow-requirements）の log_usage.js は camelCase キーを参照しないため影響なし。
- **snake_case 系のみ追加**する場合: 影響 reader は `C:sc-log_usage` / `A:sc-log_usage` / `C:aw-log_usage` / `A:aw-log_usage` / `APPS:fixture.test`。fixture EVALS.json の更新必須。
- **両方に同時追加**する場合: 両スキーマ系の全 reader（B/C 分類の全 consumer 最大 13 件）が影響範囲。
- **SkillScanner.ts はスキーマ非依存**のため影響範囲から除外（consumer-audit-report.md §3.1 / evals-field-map.md §1）。
- **D 分類（ドキュメント参照のみ）**: evals-field-map.md §2 に記載の `D:*` は情報整合のため更新推奨（必須ではない）。

### 3.2 手順

| step | action                                                                                             | affected_consumers                                                                                                                       | dual_root_scope | validation                                                                                                                            | notes                                                                                        |
| ---- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| 1    | 追加フィールドのデフォルト値ポリシー決定（`null` / `0` / `""` / `[]` / `{}`）                      | n/a                                                                                                                                      | n/a             | 本ガイド §3.3 の undefined 許容表で確認                                                                                               | read 時 default fallback を持つ reader は undefined 許容。持たない reader はデフォルト値必須 |
| 2    | initializer 系 consumer に追加書き込みを反映                                                       | `C:sc-init_skill`, `A:sc-init_skill`（camelCase 追加時のみ）                                                                             | both            | `rg -n '<new_field>' .claude/skills/skill-creator/scripts/init_skill.js .agents/skills/skill-creator/scripts/init_skill.js`           | init で生成しない場合、新規スキルで undefined のまま log_usage が走るリスクあり              |
| 3    | writer 系 consumer で必要なら書き込みロジック追加                                                  | `C:tsc-log-usage`, `A:tsc-log-usage`（camelCase） / `C:sc-log_usage`, `A:sc-log_usage`, `C:aw-log_usage`, `A:aw-log_usage`（snake_case） | both            | diff で両 root 変更行が一致                                                                                                           | 派生値（derived）の場合は計算式を notes に明記                                               |
| 4    | reader 系 consumer で必要なら読み取りロジック追加                                                  | evals-field-map.md §3 の該当 `readers` 列                                                                                                | both            | `rg -n '<new_field>' .claude/skills/ .agents/skills/ apps/`                                                                           | default fallback 値を必ず指定（例: `evals.newField ?? 0`）                                   |
| 5    | fixture EVALS.json に新フィールドを追加（snake_case 系の場合）                                     | `apps/desktop/src/__tests__/__fixtures__/skill-creator/complete-skill/EVALS.json`                                                        | n/a             | `node -e "JSON.parse(require('fs').readFileSync('apps/desktop/src/__tests__/__fixtures__/skill-creator/complete-skill/EVALS.json'))"` | fixture は legacy-snake-min 相当。camelCase 追加時は不要                                     |
| 6    | fixture テスト（TC-004）に assertion 追加（任意）                                                  | `apps/desktop/src/__tests__/fixtures/skill-creator.fixture.test.ts`                                                                      | n/a             | `pnpm --filter @repo/desktop test skill-creator.fixture`                                                                              | 追加した field を契約化するならテスト追加、しなければ省略可                                  |
| 7    | evals-field-map.md §3 に新フィールド行を追加                                                       | n/a                                                                                                                                      | n/a             | `rg -n '<new_field>' docs/30-workflows/evals-consumer-audit-001/outputs/phase-5/evals-field-map.md`                                   | readers / writers / validators / risk_on_change / notes / schema_origin を埋める             |
| 8    | consumer-audit-report.md §3〜§6 の該当 consumer 行の `referenced_fields` / `updated_fields` を更新 | n/a                                                                                                                                      | n/a             | 目視 + 手順 7 との整合性確認                                                                                                          | 影響 consumer 全件                                                                           |
| 9    | dual root 同一 commit 作成                                                                         | 全 writer consumer                                                                                                                       | both            | §6 dual root 同期ルールに従い `diff` で一致確認                                                                                       | `.claude` / `.agents` を別 commit にしない                                                   |
| 10   | 検証コマンド 3 カテゴリ実行（§7）                                                                  | n/a                                                                                                                                      | n/a             | §7 表参照                                                                                                                             | 静的参照 / dual root 一致 / JSON パースを全て通すこと                                        |

### 3.3 undefined 許容表（既存 reader が新フィールドを読んだときの挙動）

| 既存 reader                                      | reader の default fallback 実装  | undefined 許容度 | 追加時のデフォルト値必須性                               |
| ------------------------------------------------ | -------------------------------- | ---------------- | -------------------------------------------------------- |
| `C:tsc-log-usage`, `A:tsc-log-usage`             | 多くのキーに `??` or `if` ガード | 高               | 必須でない（ただし init で生成推奨）                     |
| `C:sc-log_usage`, `A:sc-log_usage`               | `ensureEvalsFile` で初期化       | 中               | 必須（既存 EVALS.json は ensure が走らないと新キー不在） |
| `C:aw-log_usage`, `A:aw-log_usage`               | 不在時は skip（no-op）           | 高               | 必須でない                                               |
| `C:sc-collect_feedback`, `A:sc-collect_feedback` | `??` で default `1` / 末尾 dir   | 高               | 必須でない                                               |
| `APPS:fixture.test` (TC-004)                     | `expect(...).toBeDefined()`      | **低**           | **必須**（fixture 更新と同時）                           |
| `APPS:SkillScanner`, `APPS:SkillScanner.test`    | 内容 parse しない                | 完全許容         | 不要                                                     |

### 3.4 追加時チェックリスト

- [ ] デフォルト値ポリシー決定済
- [ ] 影響 reader 全件を evals-field-map.md §3 で確認済
- [ ] init で生成されること（必要な場合）
- [ ] fixture EVALS.json を更新した（snake_case 追加時）
- [ ] evals-field-map.md / consumer-audit-report.md を更新した
- [ ] dual root が同一 commit で bit-for-bit 一致

---

## 4. フィールド削除手順

### 4.1 影響範囲（Read）

- **削除原則**: evals-field-map.md §3 の該当行で `readers` / `writers` / `validators` が**全て空**（`なし`）でなければ削除禁止。
- **writers=0 候補**（evals-field-map.md §4.5）: 削除候補として安全寄り。ただし `readers` がある場合は reader 側も同時削除が必要。
- **dead 候補**（reader / writer 両方 0）: `version`、`lastUpdated`、`levelHistory[].trigger`、`qualityInsights.*` 全 11 件、`phaseMetrics.<phase_id>.commonIssues[]`、`patterns.frequentAgents[]`、`metrics.average_satisfaction`、`levels.{N}.description`。
- **リスク**: validator=0 件のため、削除しても**コード実行時には気付かない**。後から復活させる際のスキーマ方言衝突に注意。

### 4.2 手順

| step | action                                                                                                                         | affected_consumers                              | dual_root_scope | validation                                                                         | notes                                                                 |
| ---- | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------- | --------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| 1    | evals-field-map.md §3 で対象行の `readers` / `writers` / `validators` が**全て空**であることを確認                             | n/a                                             | n/a             | `rg -n '<field_path>' docs/.../evals-field-map.md`                                 | 1 件でも consumer があれば削除不可。代わりに rename を検討            |
| 2    | `consumer-audit-report.md` §3〜§6 の全 consumer 行でも `referenced_fields` / `updated_fields` に該当フィールドがないことを確認 | n/a                                             | n/a             | `rg -n '<field>' docs/.../consumer-audit-report.md`                                | 手順 1 と二重チェック                                                 |
| 3    | 最終実物参照検索（ripgrep）                                                                                                    | `.claude/skills/`、`.agents/skills/`、`apps/`   | both            | `rg -n '<field>' .claude/skills/ .agents/skills/ apps/ -g '*.{js,ts,tsx,md,json}'` | 0 件でなければ「未補足 consumer」の可能性あり。Phase 7 同等の再検索   |
| 4    | 既存 EVALS.json 実ファイルからのフィールド除去                                                                                 | 6 スキル × 2 root = **12 ファイル** + fixture 1 | both            | `find .claude/skills .agents/skills -name EVALS.json -exec node -e "..." \;`       | **本ガイド適用 PR では行わない**。別タスクに委譲                      |
| 5    | evals-field-map.md §3 から該当行を削除                                                                                         | n/a                                             | n/a             | `rg -n '<field>' docs/.../evals-field-map.md` が 0 件                              | §4.5 / §5.1 等のサマリ表も再集計                                      |
| 6    | consumer-audit-report.md 該当 consumer 行の `referenced_fields` / `updated_fields` 更新                                        | n/a                                             | n/a             | 目視                                                                               | もし手順 1 で 0 件でなく削除不可だった場合はここに来ない              |
| 7    | dual root 同一 commit                                                                                                          | n/a（コード削除がない場合）                     | both            | §6                                                                                 | 実データ削除を別タスクに委譲する場合も、ドキュメント更新は同一 commit |

### 4.3 破損する consumer（reader / writer / validator が 1 件以上ある場合）

下記は **削除禁止フィールド**の例（evals-field-map.md §3.1〜§3.8 の writers/readers から抜粋）。削除する場合は必ず consumer 側を先に修正してから。

| field_path                                      | 破損する consumer                                     | 備考                                                  |
| ----------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------- |
| `skillName` / `skill_name`                      | collect_feedback / fixture.test (TC-004) / init_skill | fixture テストが assertion で固定                     |
| `currentLevel` / `current_level`                | log-usage / log_usage 全 6 本 / collect_feedback      | レベル判定の中核                                      |
| `metrics.totalUsageCount` / `total_usage_count` | log-usage / log_usage / init_skill                    | 全スキーマ系で最も read/write される                  |
| `metrics.successCount` / `success_count`        | 同上                                                  | successRate 計算の分母                                |
| `metrics.successRate` / （snake 相当なし）      | log-usage（derived）                                  | レベル判定の閾値比較に使用                            |
| `levelCriteria.level{N}.*`                      | log-usage のレベルアップ閾値                          | 削除するとレベルアップ不能（representative 固有）     |
| `levels.{N}.requirements.min_usage_count`       | snake_case 系 log_usage 全 4 本                       | 削除するとレベルアップ不能（legacy-snake-v1 固有）    |
| `phaseMetrics.<phase_id>.*`                     | tsc-log-usage                                         | 任意キー構造ごと削除すると phase ごとのメトリクス欠損 |

### 4.4 削除時チェックリスト

- [ ] 対象フィールドの `readers` / `writers` / `validators` が全て `なし` であることを evals-field-map.md §3 で確認
- [ ] `rg` で実コードから参照 0 件を確認
- [ ] fixture EVALS.json から参照されていないことを確認（snake_case 系削除時）
- [ ] 実データ削除は別タスクに委譲する旨を PR 説明に明記
- [ ] dual root を同一 commit で更新

---

## 5. フィールドリネーム手順

### 5.1 影響範囲（Read）

- **リネームは「新フィールド追加 → 全 consumer を新フィールド対応に更新 → 旧フィールド削除」の 3 段階に分解**する（P8-R-1 対策）。`add+remove` の合成として扱うと writer / reader の更新漏れが発生しうる。
- **最危険パターン**: camelCase ↔ snake_case 間の「翻訳リネーム」（例: `currentLevel` → `current_level` 統一）。evals-field-map.md §5.2 の 6 フィールド（3 組）が該当し、両スキーマ系の全 writer / reader が同時に影響を受ける。
- **fixture snake_case 固定**: fixture テスト TC-004 の `expect(evals.skill_name).toBeDefined()` が snake_case を**契約**として固定しているため、camelCase 化リネームは fixture 修正が必須（consumer-audit-report.md §10 発見 #3）。

### 5.2 手順

| step | action                                                                                         | affected_consumers                                                                | dual_root_scope | validation                                                            | notes                                                                    |
| ---- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | --------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| 1    | 旧 → 新フィールドの対応表を evals-field-map.md §3 から作成                                     | n/a                                                                               | n/a             | 対応表を PR 説明に貼付                                                | schema_origin（camel/snake）とリネーム方向を明示                         |
| 2    | **段階 A: 新フィールド追加**（§3 の手順に準拠）                                                | §3.2 の affected_consumers                                                        | both            | §3.2 step 10 検証                                                     | 新フィールドの writer のみ先に追加、reader はまだ旧フィールドを参照      |
| 3    | **段階 B1: reader を新フィールド参照に切替**                                                   | evals-field-map.md §3 の `readers` 全件（下表 5.3 参照）                          | both            | `rg -n '<old_field>' .claude/skills/ .agents/skills/ apps/`           | 1 件でも旧参照が残ればテスト or 本番で undefined 誤動作                  |
| 4    | **段階 B2: writer を新フィールドのみに切替（旧フィールド書き込み削除）**                       | evals-field-map.md §3 の `writers` 全件（下表 5.3 参照）                          | both            | `rg -n '<old_field>' .claude/skills/ .agents/skills/ apps/ -g '*.js'` | writer 側に旧 / 新両方書き込むデュアルライト期間を挟むなら本 step を分割 |
| 5    | fixture EVALS.json のキーをリネーム（snake_case ↔ fixture 同期）                               | `apps/desktop/src/__tests__/__fixtures__/skill-creator/complete-skill/EVALS.json` | n/a             | `node -e "JSON.parse(...)"` + fixture テスト実行                      | fixture 破壊を防ぐため必ず同期                                           |
| 6    | fixture テスト（TC-004）の assertion を新フィールド名に更新                                    | `apps/desktop/src/__tests__/fixtures/skill-creator.fixture.test.ts`               | n/a             | `pnpm --filter @repo/desktop test skill-creator.fixture`              | assertion 更新忘れは CI で検出されないケースがある（validator=0 前提）   |
| 7    | 既存 EVALS.json 実ファイルのキーリネーム（migrator 作成 or 手作業）                            | 12 実ファイル + fixture 1                                                         | both            | `find ... EVALS.json -exec node -e "..." \;`                          | **本ガイド適用 PR では行わない**（別タスク / migration script 推奨）     |
| 8    | **段階 C: 旧フィールド削除**（§4 の手順に準拠）                                                | §4.2 の affected_consumers                                                        | both            | §4.2 step 3 検証                                                      | `rg` で旧フィールド参照 0 件が確認できてから実行                         |
| 9    | evals-field-map.md §3 の旧行を新行に置換、notes 列に `renamed_from: <old>` を記録              | n/a                                                                               | n/a             | `rg -n '<new_field>' docs/.../evals-field-map.md`                     | §5.1 / §5.2 二重スキーマメモも更新                                       |
| 10   | consumer-audit-report.md §3〜§6 全 consumer 行を更新（`referenced_fields` / `updated_fields`） | n/a                                                                               | n/a             | 目視 + 手順 9 と整合                                                  | 旧フィールド残留 0 件を確認                                              |
| 11   | dual root 同一 commit を最終確認                                                               | 全 writer / reader consumer                                                       | both            | §6 + §7 の 3 カテゴリ検証                                             | リネーム完了の commit で `.claude` / `.agents` を同時更新                |

### 5.3 更新箇所リスト（全 consumer の行番号リファレンス）

> 下表はリネーム時に `rg` / エディタ jump 先として使う「更新漏れ禁止リスト」。行番号は evals-field-map.md §3 の notes 列および consumer-audit-report.md §4 の notes 列で示された既知の実装箇所（Phase 4 raw-grep-\*.txt と整合）。行番号はリファクタリングで変わるため、実行時は **パス単位の rg** を primary、行番号はヒント扱いとする。

| フィールド系統             | consumer パス                                                                     | 推定行番号（ヒント）                     | root         |
| -------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------- | ------------ |
| camelCase（currentLevel）  | `.claude/skills/task-specification-creator/scripts/log-usage.js`                  | L14, L27, L101–234                       | `.claude`    |
| camelCase                  | `.agents/skills/task-specification-creator/scripts/log-usage.js`                  | 同上（dual root bit 一致）               | `.agents`    |
| camelCase                  | `.claude/skills/skill-creator/scripts/collect_feedback.js`                        | L226–260                                 | `.claude`    |
| camelCase                  | `.agents/skills/skill-creator/scripts/collect_feedback.js`                        | 同上                                     | `.agents`    |
| camelCase                  | `.claude/skills/skill-creator/scripts/init_skill.js`                              | L42–45（createEvalsTemplate）            | `.claude`    |
| camelCase                  | `.agents/skills/skill-creator/scripts/init_skill.js`                              | 同上                                     | `.agents`    |
| camelCase                  | `.claude/skills/skill-creator/assets/evals-template.json`                         | 全行（テンプレ）                         | `.claude`    |
| camelCase                  | `.claude/skills/task-specification-creator/references/self-improvement-cycle.md`  | EVALS.json 構造例の箇所                  | `.claude`    |
| camelCase                  | `.agents/skills/task-specification-creator/references/self-improvement-cycle.md`  | 同上                                     | `.agents`    |
| snake_case (current_level) | `.claude/skills/skill-creator/scripts/log_usage.js`                               | L111–141（ensureEvalsFile + レベル判定） | `.claude`    |
| snake_case                 | `.agents/skills/skill-creator/scripts/log_usage.js`                               | 同上                                     | `.agents`    |
| snake_case                 | `.claude/skills/aiworkflow-requirements/scripts/log_usage.js`                     | L111–141（類似構造）                     | `.claude`    |
| snake_case                 | `.agents/skills/aiworkflow-requirements/scripts/log_usage.js`                     | 同上                                     | `.agents`    |
| snake_case                 | `.claude/skills/skill-creator/references/feedback-loop.md`                        | snake_case 例示箇所                      | `.claude`    |
| snake_case                 | `.agents/skills/skill-creator/references/feedback-loop.md`                        | 同上                                     | `.agents`    |
| fixture（snake_case）      | `apps/desktop/src/__tests__/__fixtures__/skill-creator/complete-skill/EVALS.json` | 全行                                     | fixture      |
| fixture テスト             | `apps/desktop/src/__tests__/fixtures/skill-creator.fixture.test.ts`               | L163 (expect skill_name)                 | apps/desktop |
| D 分類（ドキュメント）     | `.claude/skills/skill-creator/SKILL.md`                                           | EVALS.json 言及行                        | `.claude`    |
| D 分類                     | `.agents/skills/skill-creator/SKILL.md`                                           | 同上                                     | `.agents`    |
| D 分類                     | `.claude/skills/aiworkflow-requirements/SKILL.md`                                 | EVALS.json 言及行                        | `.claude`    |
| D 分類                     | `.agents/skills/aiworkflow-requirements/SKILL.md`                                 | 同上                                     | `.agents`    |

> **実行時必須コマンド**（行番号に依存しない primary 検索）:
>
> ```bash
> rg -n '<old_field_name>' .claude/skills/ .agents/skills/ apps/ \
>    -g '!**/node_modules/**' -g '!**/.backups/**' \
>    -g '*.{js,ts,tsx,mjs,cjs,md,json}'
> ```

### 5.4 リネーム時チェックリスト

- [ ] 旧 → 新 対応表を作成した
- [ ] 段階 A（追加）→ B（切替）→ C（削除）の 3 段階で commit を分割した（一括 commit は禁止）
- [ ] reader / writer の両方を更新した
- [ ] fixture EVALS.json と fixture テスト assertion を同期更新した
- [ ] evals-field-map.md / consumer-audit-report.md を更新した
- [ ] dual root 各段階で同一 commit となっている
- [ ] 最終検証で旧フィールド参照 0 件を確認した（§7 静的参照検証）

---

## 6. dual root 同期ルール

### 6.1 基本原則

- **正本判定を行わない**（Phase 2 §3.1）。`.claude/skills/` / `.agents/skills/` はどちらも正当な root として扱う。
- **変更順序**: ローカル編集は「`.claude/skills/` → `.agents/skills/`」の順で適用し、commit 前に必ず `diff` で同期確認。
- **commit 粒度**: 両 root の変更は**同一 commit**にまとめる。別 commit / 別 PR にして片方向だけが merge される事態を避ける。
- **スナップショット前提**: Phase 6 時点で 6 スキル全件が bit-for-bit 一致（SHA-256 同一）。本ガイド適用後も同一性を維持。

### 6.2 差分タイプ別同期ルール

| 差分タイプ        | 定義（Phase 6 §2.1）                                                                             | 本ガイド適用時の扱い                                                                                                               |
| ----------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| **0（完全一致）** | `cmp -s` IDENTICAL、`diff -u` 出力空、SHA-256 一致                                               | **スキーマ変更時は両 root を同一 commit で更新**（本スナップショット 6/6 がここ）                                                  |
| **許容**          | `lastUpdated` / `metrics.totalUsageCount` / `metrics.lastEvaluated` 等の運用メトリクス数値差のみ | **スキーマキーのみ両 root で同期**（値の揺らぎは別問題）。本ガイドは「キー構造」のみを扱う                                         |
| **要対応**        | スキーマ構造差（キー有無・型差異）                                                               | **本ガイド適用前に解消**必須。Phase 12 の `unassigned-task-detection.md` 経由で未タスク化し、先に差分を 0 化してから本ガイドを適用 |
| **片方欠損**      | 片 root にのみ EVALS.json が存在                                                                 | **本ガイド適用対象外**。dual-root-parity.md §4 を確認し、欠損理由（新規スキル追加途中等）を別タスクで解消してから適用              |

### 6.3 dual root 同期手順（操作非依存の共通手順）

```bash
# 0) 変更前スナップショット
for s in $(ls .claude/skills); do
  cmp -s ".claude/skills/$s/EVALS.json" ".agents/skills/$s/EVALS.json" \
    && echo "OK: $s" || echo "DRIFT: $s"
done

# 1) .claude 側を編集
# 2) .agents 側へ同内容を反映
# 3) 変更後検証
for s in $(ls .claude/skills); do
  diff -u ".claude/skills/$s/EVALS.json" ".agents/skills/$s/EVALS.json"
done | tee /tmp/dual-root-diff.txt

test ! -s /tmp/dual-root-diff.txt && echo "OK: bit-for-bit sync" || echo "NG: drift detected"

# 4) SHA-256 でも二重確認
for s in $(ls .claude/skills); do
  c=$(shasum -a 256 ".claude/skills/$s/EVALS.json" | awk '{print $1}')
  a=$(shasum -a 256 ".agents/skills/$s/EVALS.json" | awk '{print $1}')
  [ "$c" = "$a" ] && echo "OK: $s" || echo "NG: $s ($c vs $a)"
done

# 5) 両 root の変更を同一 commit に含める（コード変更の場合）
git add .claude/skills/ .agents/skills/
# （実データ EVALS.json の書き換えは本ガイド適用 PR には含めない）
```

### 6.4 dual root 対称性を破壊しうるアンチパターン

1. ❌ `.claude` だけコミットして PR を出す
2. ❌ `.agents/skills/skill-creator/references/resource-map.md` から `.claude/skills/skill-creator/assets/evals-template.json` への cross-root link を使う（consumer-audit-report.md §10 発見 #4 / 既知未タスク `task-mirror-resource-map-cross-root-link-001`）
3. ❌ 片方の root で ensureEvalsFile 走行結果をそのまま commit する（運用メトリクス差が混入）
4. ❌ `diff` 無しで目視同期した気になる

---

## 7. 検証手順

### 7.1 3 カテゴリ検証コマンド

| カテゴリ               | コマンド                                                                                                                                                             | 判定                                                               |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| **静的参照検証**       | `rg -n '<old_or_new_field>' .claude/skills/ .agents/skills/ apps/ -g '!**/node_modules/**' -g '!**/.backups/**' -g '*.{js,ts,tsx,mjs,cjs,md,json}'`                  | 追加: 新キーが全該当 consumer に存在 / 削除・リネーム: 旧キー 0 件 |
| **dual root 一致検証** | `for s in $(ls .claude/skills); do diff -u .claude/skills/$s/EVALS.json .agents/skills/$s/EVALS.json; done`                                                          | 出力が空であること                                                 |
| **JSON パース検証**    | `find .claude/skills .agents/skills apps/desktop/src/__tests__/__fixtures__ -name EVALS.json -exec node -e "JSON.parse(require('fs').readFileSync('{}','utf8'))" \;` | 例外なく全件パース成功                                             |

### 7.2 補助検証

| 目的                        | コマンド                                                                                                               | 備考                                                       |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| SHA-256 dual root 一致      | §6.3 step 4 のスクリプト                                                                                               | bit-for-bit の最終確認                                     |
| 動的パス consumer 再検索    | `rg -n "join\([^)]*EVALS\|\`[^\`]\*EVALS\.json\|'EVALS\.json'\|\"EVALS\.json\"" .claude/skills/ .agents/skills/ apps/` | consumer-audit-report.md §7 の 13 件に含まれることを確認   |
| fixture テスト              | `pnpm --filter @repo/desktop test skill-creator.fixture`                                                               | snake_case 系リネーム時は必ず実行                          |
| SkillScanner テスト         | `pnpm --filter @repo/desktop test SkillScanner`                                                                        | スキーマ非依存のため通常は影響なし。出力契約変更時のみ対象 |
| evals-field-map.md 自己整合 | `rg -n '<field_path>' docs/30-workflows/evals-consumer-audit-001/outputs/phase-5/evals-field-map.md`                   | readers / writers に記載のパスが実コードと一致             |

### 7.3 `validate-schemas.js` 拡張の取り扱い

- 現状 `.claude/skills/skill-fixture-runner/scripts/validate-schemas.js` は `schemas/*.json` のみを対象とし、**EVALS.json の構造検証は行わない**（evals-field-map.md §1 / §4.4 / consumer-audit-report.md §8 発見 #5）。
- 本ガイドでは `validate-schemas.js` 拡張は**スコープ外**とする。理由は Phase 1 §6.2「CI フック実装は別タスク」による。
- 代替として §7.1 の 3 カテゴリ手動検証に依存する。validator=0 件であることを PR 説明に明記し、レビュワーに手動確認を依頼する。
- **CI 化推奨（本ガイド範囲外）**: `unassigned-task/task-skill-fixture-runner-evals-schema-validate-001.md`（提案済）にて JSON Schema 化を検討。実装完了後は本ガイド §7 を差し替える運用とする。

### 7.4 手動確認ポイント（validator=0 前提）

- [ ] 追加: 新フィールドが必要な全 consumer で参照 / 書き込みされている
- [ ] 追加: 既存 EVALS.json の次回 log_usage 実行で `undefined` 参照による NaN が発生しないか（init が走る or default fallback 実装済）
- [ ] 削除: `rg` で参照 0 件
- [ ] 削除: fixture テスト grep でも 0 件
- [ ] リネーム: 旧キー `rg` で 0 件（段階 C 完了後）
- [ ] リネーム: 新キー `rg` で全 writer / reader 位置にヒット
- [ ] 全操作: `diff -u` で dual root 差分 0
- [ ] 全操作: `node -e JSON.parse` で 13 EVALS.json 全件パース成功

---

## 8. consumer 追加時の運用ルール（RISK-4 対策）

### 8.1 背景（RISK-4）

> Phase 1 RISK-4「監査後に新規 consumer が追加されてスキーマが変更禁止のまま放置される」

本監査スナップショットは **2026-04-19** 時点の固定。スキーマ変更禁止ではなくなった後も、**新規 consumer 追加で本ガイドの影響範囲記述が古くなる**リスクがある。新 consumer 追加時は以下のルールに従う。

### 8.2 consumer 追加時チェックリスト（PR 提出者向け）

新しい EVALS.json 参照 consumer（`.js` / `.ts` / `.tsx` / `.md` / `.json` 中の EVALS.json 参照）を追加する PR では:

- [ ] `consumer-audit-report.md` §3〜§6 の該当カテゴリ（A/B/C/D）に 1 行追加したか
- [ ] `evals-field-map.md` §3 の該当フィールド行の `readers` / `writers` / `validators` を更新したか（新 consumer がエイリアス §2 に追加されているか）
- [ ] dual root の対称性が維持されているか（`.claude` 側追加なら `.agents` 側も追加）
- [ ] **schema-change-guide.md**（本ガイド）の §3.3 undefined 許容表 / §5.3 更新箇所リスト / §7.1 静的参照検証範囲が現状と乖離していないか。乖離があれば本ガイドも同 PR で更新
- [ ] §4.1 / §4.3「破損する consumer」表の該当行を更新したか
- [ ] fixture EVALS.json / fixture テストが新 consumer で読まれる場合、fixture を更新したか

### 8.3 schema-change-guide.md 自身の更新義務

- 本ガイドは consumer 集合・フィールド集合に依存するため、consumer / フィールドが増減した場合は**同 PR 内で本ガイドも更新**すること
- 更新時は以下を同期:
  - §1 メタ情報の「consumer 集合 / 対象フィールド総数 / validator 件数」
  - §3.3 undefined 許容表
  - §4.3 破損 consumer 表
  - §5.3 更新箇所リスト
  - §7.1 静的参照検証コマンドの対象拡張子
- 本ガイドの更新履歴は末尾 §11 「更新履歴」に 1 行追記する
- 新 consumer の追加だけでなく、既存 consumer の EVALS 参照削除時も同様に本ガイドを更新

### 8.4 CI / Hooks 化（将来タスクへの言及のみ）

- 本ガイド自身の更新漏れを機械的に検出する CI フックは **現状未実装**
- 候補タスク: `unassigned-task-detection.md` に新規提案「consumer 追加時の guide 同期 CI フック（schema-change-guide.md の `mtime` が consumer 変更 PR で更新されているかをチェック）」として起票可能
- 実装は別タスクに委譲し、本ガイドは仕組みの言及にとどめる

### 8.5 他 skill からの参照を追加する際の注意

- `.agents/skills/skill-creator/references/resource-map.md` が `.claude/skills/skill-creator/assets/evals-template.json` を cross-root リンクで参照している既知の片方向依存（consumer-audit-report.md §10 発見 #4）を新 consumer でも複製しないこと
- cross-root リンクは dual root 同期の落とし穴になるため、参照先は同じ root 側のみに留める

---

## 9. 未対応事項・未タスク候補

本ガイドの範囲外で、後続タスクに引き継ぐ論点:

| #   | 論点                                                                                                | 既存 / 新規提案先                                                                  |
| --- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 1   | camelCase / snake_case 二重スキーマの統一                                                           | `unassigned-task/task-evals-schema-dialect-unification-001.md`（提案済）           |
| 2   | fixture EVALS.json スキーマの正本化（代表スキーマと揃える）                                         | 上記 #1 と統合候補                                                                 |
| 3   | `.agents → .claude` への cross-root link（resource-map.md）の解消                                   | `unassigned-task/task-mirror-resource-map-cross-root-link-001.md`（提案済）        |
| 4   | SkillScanner の EVALS 内容バリデーション実装                                                        | `unassigned-task/task-skill-scanner-evals-content-validate-001.md`（提案済）       |
| 5   | `validate-schemas.js` / `validate-skill-structure.js` の EVALS スキーマ検証追加（validator=0 解消） | `unassigned-task/task-skill-fixture-runner-evals-schema-validate-001.md`（提案済） |
| 6   | consumer 追加時の guide 同期 CI フック化                                                            | 本ガイド §8.4 で新規未タスク提案候補                                               |
| 7   | 実 EVALS.json データのスキーマ変更適用（本ガイドは手順のみで実データは触らない）                    | 本ガイド §3.2 step 5 / §4.2 step 4 / §5.2 step 7 で別タスク委譲を明示              |

---

## 10. AC-6 解除条件との対応表

TASK-CONFLICT-PREVENT-001 AC-6: 「consumer 監査完了まで EVALS schema 変更禁止」。その解除条件と本ガイドの充足関係:

| 解除条件（AC-6 原文相当）                                                      | 本ガイドでの充足箇所                                                         |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| consumer 一覧が存在する                                                        | `phase-5/consumer-audit-report.md`（本ガイド §1 / §3 / §4 / §5 で参照）      |
| フィールド逆引きマップが存在する                                               | `phase-5/evals-field-map.md`（§3.1 / §4.1 / §4.3 / §5.3 で参照）             |
| dual root 差分が可視化されている                                               | `phase-6/dual-root-parity.md`（§6.2 差分タイプ別ルールで参照）               |
| **schema-change-guide.md でフィールド変更手順が定義されている** ★ 本ガイド本体 | 本ガイド §3 / §4 / §5（3 操作 × 4 観点）                                     |
| 未タスクが記録先指定されている                                                 | 本ガイド §9 / `phase-12/unassigned-task-detection.md`（Phase 12 で最終反映） |

**本ガイドは AC-6 解除条件「schema-change-guide.md でフィールド変更手順が定義されている」を満たす唯一の正本手順書である**。実際の解除判定は Phase 10（`outputs/phase-10/ac6-release-verdict.md`）で行われ、本ガイドはその入力となる。

---

## 11. 更新履歴

| 日付       | 更新者               | 内容                                                                                     |
| ---------- | -------------------- | ---------------------------------------------------------------------------------------- |
| 2026-04-19 | Phase 8 エージェント | 初版作成（consumer 32 件 / フィールド 56 件 / dual root 6 スキル bit-for-bit 一致 前提） |

> 更新ルール（§8.3）: consumer / フィールドが増減した場合、本表に 1 行追記する。更新漏れ検出は CI 未対応のため、PR レビュー時に目視確認する。

---

## 参照資料

| 資料                             | パス                                                                                   |
| -------------------------------- | -------------------------------------------------------------------------------------- |
| consumer-audit-report.md         | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-5/consumer-audit-report.md`  |
| evals-field-map.md               | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-5/evals-field-map.md`        |
| dual-root-parity.md              | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-6/dual-root-parity.md`       |
| coverage-recheck.md              | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-7/coverage-recheck.md`       |
| Phase 1 要件定義                 | `docs/30-workflows/evals-consumer-audit-001/design-docs/phase-1-requirements.md`       |
| Phase 2 スコープ・アーキ         | `docs/30-workflows/evals-consumer-audit-001/design-docs/phase-2-scope-architecture.md` |
| Phase 3 Phase 設計               | `docs/30-workflows/evals-consumer-audit-001/design-docs/phase-3-phase-design.md`       |
| TASK-CONFLICT-PREVENT-001 指示書 | `docs/30-workflows/unassigned-task/TASK-EVALS-CONSUMER-AUDIT-001.md`                   |
