# checklist-gate-design.md

## メタ情報

| 項目     | 内容                                                                     |
| -------- | ------------------------------------------------------------------------ |
| 文書種別 | Phase 2 設計成果物                                                       |
| タスクID | UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001                                |
| 作成日   | 2026-04-19                                                               |
| 対象     | phase-12-completion-checklist.md ゲート文言設計・skill教訓還流経路マップ |

---

## 1. 概要

この文書は以下の2点を設計する。

1. `phase-12-completion-checklist.md` に追加するparity validatorゲート文言
2. `task-specification-creator` / `aiworkflow-requirements` 両skillへの教訓還流経路マップ

---

## 2. phase-12-completion-checklist.md ゲート文言設計

### 2.1 追加先セクションと配置

追加対象ファイル: `.claude/skills/task-specification-creator/references/phase-12-completion-checklist.md`

追加する項目は3箇所に分散して挿入する。

---

### 2.2 【初手チェック】セクションへの追加項目

既存の「【初手チェック】」セクションに以下の項目を**先頭**に追加する。

```markdown
- [ ] 【初手チェック】`validate-closeout-parity.js --workflow <workflow-path>` を実行し、
      `PARITY_OK (exit=0)` であることを確認した - FAIL時: drift一覧を確認し、S1/S2/S3/S4のうち乖離している情報源を手動修正してから再実行する - MISSING_SOURCE (exit=2): `outputs/artifacts.json` 等の存在を確認する
```

**配置理由**: Phase 12開始時点でparity不成立の場合、以降の全チェックが無意味になるため、最初に実行させる。

---

### 2.3 「artifacts.json二重管理チェック」の置換

既存の手動確認項目（artifacts.jsonの二重管理チェック）を以下のコマンド実行項目に置き換える。

**置換前（既存）**:

```markdown
- [ ] artifacts.json と outputs/artifacts.json の status が一致していることを確認した
```

**置換後（新規）**:

````markdown
- [ ] 以下のコマンドを実行し、`code: "PARITY_OK"` が出力されることを確認した

  ```bash
  node .claude/skills/task-specification-creator/scripts/validate-closeout-parity.js \
    --workflow <workflow-path> --json
  ```
````

期待出力:

```json
{ "code": "PARITY_OK", "exitCode": 0, "drifts": [] }
```

PARITY_DRIFT検出時は `drifts[]` の `phase` と `sources` を参照して乖離を修正し、
再実行で PARITY_OK になるまでPhase 12のPASS判定を行わない。

````

---

### 2.4 PASS判定必須条件への追加

「Phase 12 PASS判定の必須条件」セクションに以下を追加する。

```markdown
- [ ] parity validatorを1回以上実行し、**最終実行で `PARITY_OK` を記録した**
      （`PARITY_DRIFT` / `MISSING_SOURCE` / `INVALID_STATUS_VALUE` のまま Phase 12 PASSは禁止）
- [ ] `validate-closeout-parity.js` の実行ログ（または `--json` 出力）を
      `outputs/phase-12/` 配下に保存した（evidence記録）
````

---

### 2.5 完成後のゲートフロー全体像

```
Phase 12 開始
  │
  ▼
【初手チェック】
  parity validator実行 → PARITY_OK確認
  │
  ├─ FAIL → 乖離修正 → 再実行 → PARITY_OK まで繰り返す
  │
  ▼
【既存チェック群】
  コード品質 / テスト / ドキュメント / ...
  │
  ▼
【PASS判定直前】
  parity validator 最終実行 → PARITY_OK確認
  実行ログ保存（evidence）
  │
  ▼
Phase 12 PASS
```

---

## 3. 両skillへの教訓還流経路マップ

### 3.1 還流対象の教訓

本タスク（UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001）が明確にした教訓:

1. **S1/S2/S3/S4の手動同期は失敗する**: 4情報源の手動一致は現実的に困難で、driftが必ず発生する
2. **validator自動化が唯一の解**: 機械的な検証ゲートがないと手動チェックは形骸化する
3. **bypass手段を設けないことが品質保証の根幹**: エスケープハッチは必ず悪用される

---

### 3.2 task-specification-creator skillへの還流

| 還流先ファイル                                | 変更内容                                                                                                  | 変更種別 |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------- | -------- |
| `references/phase-12-completion-checklist.md` | 上記2.2〜2.4のゲート項目追加                                                                              | 追記     |
| `references/patterns-phase12-sync.md`         | パターン10「artifacts.json手動確認」を「validator実行」に昇格・自動化への言及追加                         | 更新     |
| `SKILL.md` 変更履歴                           | バージョン追記: `v?.?.? (2026-04-19): parity guard gate追加 by UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001` | 追記     |
| `LOGS.md`                                     | 以下のcurrent facts記録を追加                                                                             | 追記     |

`LOGS.md` に追加するcurrent facts:

```markdown
## 2026-04-19 UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001

- [FACT] S1(index.md)/S2(root artifacts.json)/S3(outputs artifacts.json)/S4(phase frontmatter)
  の4情報源は手動同期では乖離が発生する（drift-inventory.md参照）
- [FACT] validate-closeout-parity.js が parity checker として新設された
- [FACT] complete-phase.js はS1〜S4同値更新 + validator呼び出し + rollbackを内包する
- [FACT] phase-12-completion-checklist.md に parity validator必須ゲートが追加された
- [PATTERN] Phase 12開始時と終了直前の2回parity validatorを実行することが標準手順となった
```

---

### 3.3 aiworkflow-requirements skillへの還流

| 還流先ファイル                                  | 変更内容                                                      | 変更種別 |
| ----------------------------------------------- | ------------------------------------------------------------- | -------- |
| `references/task-workflow.md`                   | close-out parity guardのcurrent facts追加（下記参照）         | 追記     |
| `references/lessons-learned-current-2026-04.md` | `L-CLOSEOUT-PARITY-001` 追加（下記参照）                      | 追記     |
| `SKILL.md` 変更履歴                             | バージョン追記: `v?.?.? (2026-04-19): parity guard facts追加` | 追記     |
| `LOGS.md`                                       | sync記録追加                                                  | 追記     |

`task-workflow.md` に追加するcurrent facts:

```markdown
### close-out parity guard（2026-04-19追加）

- Phase complete-out時にS1/S2/S3/S4の4情報源を同値更新する必要がある
- `validate-closeout-parity.js --workflow <path>` でparity状態を検証できる
- PARITY_DRIFT (exit=1) の場合はPhase 12 PASSを禁止する
- `complete-phase.js` がS1〜S4同値更新を自動実行する（bypass不可）
```

`lessons-learned-current-2026-04.md` に追加するエントリ:

```markdown
## L-CLOSEOUT-PARITY-001 (2026-04-19)

**タスク**: UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001

**問題**: S1(index.md)/S2/S3/S4の4情報源のstatus手動同期でdriftが発生し、
complete-phase.js実行後も情報源間で値が乖離する状態が続いていた。

**根本原因**: 4情報源の書き手が分散しており、手動同期を前提とした設計だった。

**解決策**:

- `validate-closeout-parity.js` で4情報源のparity自動検証を実装
- `complete-phase.js` をS1〜S4同値更新 + parity検証 + rollbackに拡張
- `phase-12-completion-checklist.md` にvalidator必須ゲートを追加

**教訓**:

- 複数情報源の同期は機械的な検証ゲートなしに成立しない
- bypass手段を設けないことで信頼性を保証する
- Phase 12開始時と終了直前の2回検証が標準手順
```

---

### 3.4 `.agents/skills/` ミラーへの還流

上記3.2・3.3の変更はすべて `.agents/skills/` 配下の対応ファイルにも同一内容をミラーする。

| ミラー元                                                                                | ミラー先                                                                                |
| --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `.claude/skills/task-specification-creator/references/phase-12-completion-checklist.md` | `.agents/skills/task-specification-creator/references/phase-12-completion-checklist.md` |
| `.claude/skills/task-specification-creator/references/patterns-phase12-sync.md`         | `.agents/skills/task-specification-creator/references/patterns-phase12-sync.md`         |
| `.claude/skills/task-specification-creator/SKILL.md`                                    | `.agents/skills/task-specification-creator/SKILL.md`                                    |
| `.claude/skills/task-specification-creator/LOGS.md`                                     | `.agents/skills/task-specification-creator/LOGS.md`                                     |
| `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                    | `.agents/skills/aiworkflow-requirements/references/task-workflow.md`                    |
| `.claude/skills/aiworkflow-requirements/references/lessons-learned-current-2026-04.md`  | `.agents/skills/aiworkflow-requirements/references/lessons-learned-current-2026-04.md`  |
| `.claude/skills/aiworkflow-requirements/SKILL.md`                                       | `.agents/skills/aiworkflow-requirements/SKILL.md`                                       |
| `.claude/skills/aiworkflow-requirements/LOGS.md`                                        | `.agents/skills/aiworkflow-requirements/LOGS.md`                                        |

**ミラーのタイミング**: Phase 12完了時（validate-closeout-parity.js PARITY_OK確認後）に実施する。

---

### 3.5 還流経路の全体マップ

```
UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001 教訓
  │
  ├─── task-specification-creator skill
  │      │
  │      ├── references/phase-12-completion-checklist.md
  │      │     └── parity validator必須ゲート追加
  │      │
  │      ├── references/patterns-phase12-sync.md
  │      │     └── パターン10 → validator実行に昇格
  │      │
  │      ├── SKILL.md（変更履歴）
  │      │     └── バージョン追記
  │      │
  │      └── LOGS.md（current facts）
  │            └── 4情報源drift / validator新設 / checklist更新
  │
  ├─── aiworkflow-requirements skill
  │      │
  │      ├── references/task-workflow.md
  │      │     └── close-out parity guard facts追加
  │      │
  │      ├── references/lessons-learned-current-2026-04.md
  │      │     └── L-CLOSEOUT-PARITY-001追加
  │      │
  │      ├── SKILL.md（変更履歴）
  │      │     └── バージョン追記
  │      │
  │      └── LOGS.md（sync記録）
  │            └── sync記録追加
  │
  └─── .agents/skills/ ミラー（上記全て）
         └── Phase 12完了後に同一内容をミラー
```

---

## 4. 責務分離の設計原則

### 4.1 checklist文言の設計原則

- 「確認した」で終わる定性的チェックではなく、「コマンドを実行してexit=0を確認した」という定量的チェックにする
- evidence（実行ログ・JSON出力）の保存を必須とすることで、PASSの根拠を残す
- チェック漏れを防ぐため、Phase 12の「初手」と「終手」の2箇所に配置する

### 4.2 教訓還流の設計原則

- 具体的なファイルパスと変更内容まで記述し、Phase 12実施者が迷わず還流できるようにする
- 「教訓を記録する」ではなく「具体的に何をどこに書くか」を規定する
- `.agents/skills/` へのミラーを必須とし、同期漏れを防ぐ

---

## 5. 参照

| 参照先                 | パス                                                                                    |
| ---------------------- | --------------------------------------------------------------------------------------- |
| parity判定アルゴリズム | `outputs/phase-2/parity-algorithm-design.md`                                            |
| validator CLI/JSON契約 | `outputs/phase-2/validator-placement-design.md`                                         |
| complete-phase拡張設計 | `outputs/phase-2/complete-phase-extension-design.md`                                    |
| Phase 1 要件定義       | `outputs/phase-1/requirements.md`                                                       |
| Phase 1 drift baseline | `outputs/phase-1/drift-inventory.md`                                                    |
| 既存checklist          | `.claude/skills/task-specification-creator/references/phase-12-completion-checklist.md` |
