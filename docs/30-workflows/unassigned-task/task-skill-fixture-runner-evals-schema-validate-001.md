# skill-fixture-runner EVALS.json スキーマ検証追加 - タスク指示書

## メタ情報

```yaml
issue_number: null
task_id: UNASSIGNED-EVALS-VALIDATOR-GUARD-001
task_name: skill-fixture-runner EVALS.json スキーマ検証追加
category: 改善
target_feature: skill-fixture-runner / EVALS.json 自動検証
priority: 高
scale: 中規模
status: 未実施
source_phase: TASK-EVALS-CONSUMER-AUDIT-001 Phase 12
created_date: 2026-04-19
dependencies:
  - task-evals-schema-dialect-unification-001
successors:
  - task-skill-scanner-evals-content-validate-001
spec_path: docs/30-workflows/unassigned-task/task-skill-fixture-runner-evals-schema-validate-001.md
```

| 項目         | 内容                                             |
| ------------ | ------------------------------------------------ |
| タスクID     | UNASSIGNED-EVALS-VALIDATOR-GUARD-001             |
| タスク名     | skill-fixture-runner EVALS.json スキーマ検証追加 |
| 分類         | 改善                                             |
| 対象機能     | skill-fixture-runner / EVALS.json 自動検証       |
| 優先度       | 高                                               |
| 見積もり規模 | 中規模                                           |
| ステータス   | 未実施                                           |
| 発見元       | TASK-EVALS-CONSUMER-AUDIT-001 Phase 12           |
| 発見日       | 2026-04-19                                       |
| 先行タスク   | task-evals-schema-dialect-unification-001        |
| 後続タスク   | task-skill-scanner-evals-content-validate-001    |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`TASK-EVALS-CONSUMER-AUDIT-001` の Phase 5 〜 Phase 8 監査で、EVALS.json の構造・キー・値を機械的に検証する consumer（validator）が **0 件** であることが確定した（`phase-5/consumer-audit-report.md` §6 / `phase-12/implementation-guide.md` §3.1）。現状は `schema-change-guide.md` §7.1 に定義された **3 カテゴリ手動検証**（静的参照検索 / dual root 一致 / JSON パース）が唯一のガードである。

`.claude/skills/skill-fixture-runner/scripts/` には既に `validate-schemas.js` / `validate-skill-structure.js` / `validate-agents.js` / `validate-skill-md.js` / `run-all-validations.js` が存在するが、`validate-schemas.js` の対象は `schemas/*.json`（JSON Schema 定義）のみで、EVALS.json そのものの構造検証は行っていない。

### 1.2 問題点・課題

- EVALS.json のキー削除 / リネーム時、consumer 側の `undefined` 参照→NaN 伝播がサイレントに発生する（`schema-change-guide.md` §7.4）
- dual root（`.claude/skills/*` と `.agents/skills/*`）の片側のみ更新したドリフトを自動検出できない
- 破損 JSON（構文エラー）が CI で検出されず、スキルロード時まで気づかない
- 3 カテゴリ手動検証は属人的で、PR レビュアの注意力に依存する
- camelCase / snake_case の 2 方言が 3 組 6 フィールドで併存し、ミスマッチ（例: skill-creator の `init` と `log_usage`）が NaN 伝播を引き起こす

### 1.3 放置した場合の影響

- スキーマ変更のたびに手動 3 カテゴリ検証漏れが発生するリスクが蓄積する
- validator=0 件状態が `TASK-CONFLICT-PREVENT-001 AC-6` の恒久解除を阻害する
- 後続の `task-skill-scanner-evals-content-validate-001`（`SkillScanner.ts` 側の内容検証）を着手しても、上流の validator 基盤が無いため検証ロジックが二重実装になる

---

## 2. 何を達成するか（What）

### 2.1 目的

`skill-fixture-runner` の検証スクリプト群に **EVALS.json 専用 validator** を追加し、validator=0 件状態を解消する。dual root・方言・fixture の 3 特殊事情を正しく扱う。

### 2.2 最終ゴール

- `.claude/skills/*/EVALS.json` / `.agents/skills/*/EVALS.json` を自動走査し、最低限の構造検証（JSON パース / 必須キー / 方言整合）を行う validator が実装されている
- dual root 6 スキル全件の bit-for-bit 一致を CI / ローカルで再現可能に検証できる
- fixture EVALS（TC-004 の test 契約固定）を validator の対象から除外、または特別扱い方針が明示されている
- 動的パス consumer 13 件を考慮した検証対象パスの列挙方針が決まっている

### 2.3 スコープ

#### 含むもの

- `validate-schemas.js` への EVALS.json 検証ロジック追加、または新設 `validate-evals.js`
- `validate-skill-structure.js` の EVALS.json 存在チェック強化（dual root 両側）
- `run-all-validations.js` への新 validator 統合
- 検証対象パスの列挙規則（glob + 動的パス除外 / 特別扱い）
- fixture EVALS.json の除外 or 特別扱い方針
- ローカル実行手順と CI 連携方針のドキュメント化

#### 含まないもの

- `SkillScanner.ts`（Main プロセス側）での内容検証（→ `task-skill-scanner-evals-content-validate-001`）
- 方言統一そのもの（→ `task-evals-schema-dialect-unification-001`）
- CI パイプラインへの実環境組込み（本タスクは手順書までで、実環境導入は別タスク）

### 2.4 成果物

| 成果物                          | パス                                                                                             |
| ------------------------------- | ------------------------------------------------------------------------------------------------ |
| EVALS.json validator スクリプト | `.claude/skills/skill-fixture-runner/scripts/validate-evals.js`（or `validate-schemas.js` 拡張） |
| 構造チェッカーの更新            | `.claude/skills/skill-fixture-runner/scripts/validate-skill-structure.js`                        |
| 統合ランナー更新                | `.claude/skills/skill-fixture-runner/scripts/run-all-validations.js`                             |
| ミラー側の同期                  | `.agents/skills/skill-fixture-runner/scripts/*`（dual root 同一 commit）                         |
| 実行手順ドキュメント            | `.claude/skills/skill-fixture-runner/SKILL.md` §検証手順 追記                                    |
| テスト（任意）                  | `.claude/skills/skill-fixture-runner/tests/validate-evals.test.*`                                |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `task-evals-schema-dialect-unification-001` で方言方針（snake_case 正本 / camelCase 廃止など）が決定していること（先行推奨）
- `phase-5/consumer-audit-report.md` / `phase-6/dual-root-parity.md` / `phase-8/schema-change-guide.md` を読了していること
- dual root bit-for-bit 一致が現時点で成立していることを `cmp -s` で再確認していること

### 3.2 依存タスク

| タスクID                                      | 区分         | ステータス |
| --------------------------------------------- | ------------ | ---------- |
| task-evals-schema-dialect-unification-001     | 先行推奨     | 未実施     |
| TASK-EVALS-CONSUMER-AUDIT-001                 | 先行完了前提 | 完了       |
| task-skill-scanner-evals-content-validate-001 | 後続         | 未実施     |

### 3.3 必要な知識

- Node.js スクリプト（ESM）の実装
- JSON Schema（Ajv 等）、もしくは最小の手書きバリデータの選定
- `schema-change-guide.md` §7 の 3 カテゴリ検証の内容
- camelCase / snake_case 二重スキーマの対応表（`phase-5/evals-field-map.md` §5.2）
- dual root 同期ルール（`phase-8/schema-change-guide.md` §6）
- fixture EVALS.json と TC-004 の test 契約（`apps/desktop/src/__tests__/fixtures/skill-creator.fixture.test.ts`）

### 3.4 推奨アプローチ

1. **validator 本体を `validate-evals.js` として新設**（`validate-schemas.js` の責務は JSON Schema 定義検証のまま残す）
2. 検証レイヤを 3 段階で組む
   - L1: JSON パース（`JSON.parse` 例外検出）
   - L2: 必須キー検証（`skill_name` / `timestamp` / 方言別の最小セット）
   - L3: dual root 一致（`.claude` と `.agents` の同名スキルを `cmp -s` 相当で比較）
3. **方言ハンドリング** — 先行タスクで決定した正本方言に合わせて必須キーセットを切り替える。暫定は両方言サポート（`phase-5/evals-field-map.md` §5.2 の 3 組 6 フィールドを両方許容）
4. **fixture EVALS の扱い** — `apps/desktop/src/__tests__/__fixtures__/skill-creator/complete-skill/EVALS.json` は TC-004 の期待値に固定されているため、validator の対象から **除外**（パス allowlist）するか、**snake_case v1 専用の最小セット** だけを当てる特別扱いを選ぶ
5. **動的パス consumer 13 件** — `consumer-audit-report.md` §7 の動的パス構築箇所は glob では捕まらないため、検証対象は **スキル ID の allowlist ベース** で列挙する（`aiworkflow-requirements` / `github-issue-manager` / `int-test-skill` / `skill-creator` / `skill-fixture-runner` / `task-specification-creator` の 6 スキル × dual root）
6. **統合** — `run-all-validations.js` に `validate-evals.js` を追加し、1 コマンドで全 validator を実行可能にする
7. **ドキュメント** — `SKILL.md` にローカル実行コマンドと CI 向けの expected exit code 表を追記

### 3.5 実装手順の概略

| Step | 作業                                                 | 検証                                                                                                         |
| ---- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 1    | `validate-evals.js` 骨組み実装（L1 JSON パースのみ） | 破損 JSON を仕込んで exit code 確認                                                                          |
| 2    | L2 必須キー検証 + 方言判定                           | `skill-creator` / `aiworkflow-requirements` で通過                                                           |
| 3    | L3 dual root 一致（6 スキル全件）                    | 片側を意図的に差分化して検出確認                                                                             |
| 4    | fixture EVALS 除外 or 特別扱い                       | TC-004 が壊れないこと                                                                                        |
| 5    | `run-all-validations.js` への統合                    | `pnpm` から 1 コマンドで実行可能                                                                             |
| 6    | `.agents/` ミラーを同一 commit で更新                | `diff -u .claude/skills/skill-fixture-runner/scripts .agents/skills/skill-fixture-runner/scripts` で差分ゼロ |
| 7    | `SKILL.md` 更新                                      | 手順どおりに実行できること                                                                                   |

---

## 4. 苦戦箇所記録

### 4.1 記録1: validator=0 件 = 3 カテゴリ手動検証が唯一のガード

`phase-12/implementation-guide.md` §3.1 で確定している事実として、EVALS.json を機械的に検証する consumer は現時点で 0 件である。`schema-change-guide.md` §7.1 が定める **静的参照検索 / dual root 一致 / JSON パース** の 3 コマンドが現状唯一の防衛線で、PR ごとに手動実行されている。validator を 1 本追加するだけで済む話ではなく、3 カテゴリすべてを 1 つのランナーで再現できる粒度にしないと、既存の手動検証フローを置き換えられない。

**対処方針**: `validate-evals.js` を L1/L2/L3 の 3 層構成にし、手動 3 カテゴリと 1:1 対応させる。`run-all-validations.js` から 1 コマンド実行した際の出力に、どの層で失敗したか明示する。

### 4.2 記録2: camelCase / snake_case 二重スキーマ併存

`phase-5/evals-field-map.md` §5.2 で整理された通り、3 組 6 フィールドが camelCase / snake_case の 2 方言で並立している。代表例は `skill-creator` の `init` vs `log_usage` 系統で、取り違えて writer を追加すると NaN 伝播が発生する（`phase-12/implementation-guide.md` §3.1 リスクケース表）。validator は方言が未統一な期間、両方言を同時にサポートする必要があり、その間は「どちらか一方必須」ではなく「正規化後の必須キーで判定」する設計が必要。

**対処方針**: 先行タスク `task-evals-schema-dialect-unification-001` で正本方言が決まるまでは **両方言許容モード** を既定とし、決定後に strict モードへ切り替える。方言判定は validator 入口で 1 回だけ行い、以降は正規化済みキーで比較する。

### 4.3 記録3: fixture EVALS の扱い（TC-004 test 契約固定）

`apps/desktop/src/__tests__/__fixtures__/skill-creator/complete-skill/EVALS.json` は `skill-creator.fixture.test.ts` TC-004 の assertion を固定するための snake_case v1 系期待値であり、スキーマ変更時には **fixture とテストを同時に更新する義務** がある（`schema-change-guide.md` §5 Step 4）。validator の対象に単純に含めると、dual root 6 スキルと異なる契約を持つため誤検知が発生する。

**対処方針**: fixture パスは allowlist で除外し、専用の最小検証（`skill_name` のみチェックなど）に限定する。除外方針は `SKILL.md` に明記し、将来 fixture 方針が変わった際の再検討フックとする。

### 4.4 記録4: 動的パス consumer 13 件があり単純 glob で列挙不能

`phase-5/consumer-audit-report.md` §7 に挙がる動的パス構築箇所は 13 件存在し、`path.join(...)` や template literal で EVALS.json パスを合成する。これらは glob 走査だけでは捕捉できないため、validator の検証対象を「ファイル存在ベース glob」で決めると動的 consumer がカバーされない矛盾が発生する。

**対処方針**: 検証対象は **スキル ID allowlist × dual root** の直積で列挙する（6 スキル × 2 root = 12 EVALS.json）。動的 consumer の存在は `consumer-audit-report.md` §7 を参照する旨を SKILL.md に記載し、allowlist の更新責任を明示する。

---

## 5. 完了条件

- [ ] `validate-evals.js`（新設 or `validate-schemas.js` 拡張）に L1 JSON パース / L2 必須キー / L3 dual root 一致 の 3 層検証が実装されている
- [ ] dual root 6 スキル全件（`aiworkflow-requirements` / `github-issue-manager` / `int-test-skill` / `skill-creator` / `skill-fixture-runner` / `task-specification-creator`）の EVALS.json を走査し、bit-for-bit 一致を検証できる
- [ ] 破損 JSON / 欠落必須キー / 方言不整合 / dual root ドリフトの 4 種を検出できる
- [ ] 両方言許容モードと strict モードが切替可能、もしくは先行タスク決定後の切替手順が文書化されている
- [ ] fixture EVALS.json（`apps/desktop/src/__tests__/__fixtures__/skill-creator/complete-skill/EVALS.json`）の除外 or 特別扱い方針が実装と SKILL.md の双方で明示されている
- [ ] 動的パス consumer 13 件を考慮し、検証対象はスキル ID allowlist で列挙されている
- [ ] `run-all-validations.js` から 1 コマンドで新 validator が起動する
- [ ] `.claude/skills/skill-fixture-runner/scripts/*` と `.agents/skills/skill-fixture-runner/scripts/*` が同一 commit で更新され、`diff -u` で差分ゼロ
- [ ] ローカル実行手順と expected exit code 表が `SKILL.md` に追記されている
- [ ] CI 連携方針（実導入は別タスク）が明記されている
- [ ] 後続タスク `task-skill-scanner-evals-content-validate-001` から参照できるインターフェース（JSON 出力フォーマット）が安定している
