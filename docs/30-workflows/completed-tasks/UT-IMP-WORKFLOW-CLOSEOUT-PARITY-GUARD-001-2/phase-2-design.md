# Phase 2: 設計

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 2                                         |
| 機能名     | UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001 |
| タスク名   | workflow close-out parity guard           |
| 前提Phase  | Phase 1                                   |
| 後続Phase  | Phase 3                                   |
| 作成日     | 2026-04-19                                |
| ステータス | completed                                 |

## 目的

Phase 1 で固定した三者 SSOT parity 要件を、validator / `complete-phase.js` 拡張 / checklist ゲート / skill 教訓還流の 4 構成で設計する。Phase 3 の設計レビューを通せる粒度の成果物を作る。

## 実行タスク

1. parity 判定アルゴリズムの決定論的仕様を固定する
2. `validate-closeout-parity.js` の入出力契約（CLI / JSON / exit code）を設計する
3. `complete-phase.js` を三者同値更新へ拡張する設計（Atomic 性・ロールバック）を作る
4. `verify-all-specs.js` への parity gate 挿入ポイントを決定する
5. `phase-12-completion-checklist.md` の機械検証ゲート文言を設計する
6. `task-specification-creator` / `aiworkflow-requirements` 両 skill への教訓還流経路を決定する
7. 既存 `validate-phase-output.js` との棲み分け（責務境界）を確定する

## 参照資料

### 実装・コード

| 資料名                  | パス                                                                         | 用途                         |
| ----------------------- | ---------------------------------------------------------------------------- | ---------------------------- |
| Phase 1 成果物          | `outputs/phase-1/requirements.md`                                            | AC-1〜AC-7 の確定版参照      |
| Phase 1 成果物          | `outputs/phase-1/drift-inventory.md`                                         | baseline 観測結果            |
| validate-phase-output   | `.claude/skills/task-specification-creator/scripts/validate-phase-output.js` | 既存検証との責務境界         |
| verify-all-specs        | `.claude/skills/task-specification-creator/scripts/verify-all-specs.js`      | gate 挿入位置                |
| complete-phase          | `.claude/skills/task-specification-creator/scripts/complete-phase.js`        | 拡張対象（三者同値書き込み） |
| generate-index          | `.claude/skills/task-specification-creator/scripts/generate-index.js`        | index.md 書き手の唯一性確認  |
| 受け入れ基準 AC-1〜AC-7 | `outputs/phase-1/acceptance-criteria.md`                                     | Phase 1 成果物               |

### システム仕様（aiworkflow-requirements）

| 資料名               | パス                                                                        | 用途          |
| -------------------- | --------------------------------------------------------------------------- | ------------- |
| task-workflow        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`        | current facts |
| error-handling       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`       | 失敗契約      |
| quality-requirements | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | 品質ゲート    |

## 実行手順

1. Phase 1 成果物を参照し AC-1〜AC-7 を検証可能な設計単位へ分解する
2. parity 判定の決定論的アルゴリズムを疑似コードで記述する
3. validator の CLI / JSON 出力スキーマを定義する
4. `complete-phase.js` の拡張差分を設計する（atomic write / rollback）
5. `verify-all-specs.js` の挿入順序を確定する
6. `phase-12-completion-checklist.md` の差分文言を設計する
7. 両 skill への教訓還流経路（references / LOGS / SKILL.md / `.agents/` mirror）を確定する
8. 4 つの設計成果物を出力する

## 設計内容

### 1. 全体アーキテクチャ

```
┌────────────────────────────────────────────────────────────┐
│  Phase 12 close-out 時の SSOT writer                       │
│  ┌────────────────────────────────┐                        │
│  │ complete-phase.js（拡張）       │── writes ──┐           │
│  │  - S1 index.md Phase 表         │            │           │
│  │  - S2 root artifacts.json       │            │           │
│  │  - S3 outputs/artifacts.json    │            ▼           │
│  └────────────────────────────────┘    ┌──────────────┐     │
│                                        │   3 SSOT     │     │
│  ┌────────────────────────────────┐    └──────┬───────┘     │
│  │ validate-closeout-parity.js    │           │             │
│  │ （新規 / read-only validator） │◀── reads ─┘             │
│  │  - S1 / S2 / S3 / S4 比較       │                         │
│  │  - exit 0 / 1 / 2 / 3           │                         │
│  └──────────────┬─────────────────┘                         │
│                 │                                           │
│                 ▼                                           │
│  ┌────────────────────────────────┐                         │
│  │ verify-all-specs.js（組込み）   │                         │
│  │  parity validator を呼び出し    │                         │
│  │  drift > 0 で PASS 抑止          │                         │
│  └────────────────────────────────┘                         │
│                                                             │
│  ┌────────────────────────────────┐                         │
│  │ phase-12-completion-checklist   │                         │
│  │  validator コマンドを必須 gate   │                         │
│  └────────────────────────────────┘                         │
└────────────────────────────────────────────────────────────┘
```

### 2. parity 判定アルゴリズム（決定論的）

```
function validateParity(workflowDir):
  sources = {
    S1: readIndexMdPhaseTable(workflowDir + "/index.md"),
    S2: readArtifactsJson(workflowDir + "/artifacts.json"),
    S3: readArtifactsJson(workflowDir + "/outputs/artifacts.json"),
    S4: readPhaseFrontmatters(workflowDir + "/phase-*.md"),
  }

  for src in [S1, S2, S3, S4]:
    if src.missing: return { code: MISSING_SOURCE, source: src.id, exitCode: 2 }

  drifts = []
  for n in 1..13:
    values = {
      S1: sources.S1[n],
      S2: sources.S2[n],
      S3: sources.S3[n],
      S4: sources.S4[n],
    }
    for src, val in values:
      if val not in ALLOWED_STATUS_SET:
        return { code: INVALID_STATUS_VALUE, phase: n, source: src, value: val, exitCode: 3 }

    canonical = firstDefined([values.S2, values.S3, values.S1, values.S4])
    unique = uniqueValues(values)  // "-" は S2/S3 の "pending" と同義
    if len(unique) > 1:
      drifts.push({ phase: n, expected: canonical, actual: values })

  if len(drifts) > 0:
    return { code: PARITY_DRIFT, drifts: drifts, exitCode: 1 }

  return { code: PARITY_OK, exitCode: 0 }
```

許可 status 列挙: `pending` / `in_progress` / `completed` / `blocked` / `-` (S1 のみ)

### 3. validate-closeout-parity.js CLI 契約

```bash
# 標準実行
node .claude/skills/task-specification-creator/scripts/validate-closeout-parity.js \
  --workflow docs/30-workflows/{{FEATURE_NAME}}

# JSON 出力モード
node ... validate-closeout-parity.js \
  --workflow docs/30-workflows/{{FEATURE_NAME}} \
  --json
```

JSON 出力スキーマ:

```typescript
type ParityReport = {
  workflow: string; // 対象 workflow 絶対パス
  code:
    | "PARITY_OK"
    | "PARITY_DRIFT"
    | "MISSING_SOURCE"
    | "INVALID_STATUS_VALUE";
  exitCode: 0 | 1 | 2 | 3;
  generatedAt: string; // ISO8601
  sourcesChecked: ["S1", "S2", "S3", "S4"];
  drifts: Array<{
    phase: number; // 1..13
    sources: { S1: string; S2: string; S3: string; S4: string };
    expected: string; // 多数決値
    severity: "error";
  }>;
  missing?: { source: "S1" | "S2" | "S3" | "S4"; reason: string };
  invalid?: { phase: number; source: string; value: string };
};
```

### 4. complete-phase.js 拡張設計

**拡張前**: `phases.N.status` を `artifacts.json` のみ更新、手動で他を合わせる想定。

**拡張後の責務**:

1. `artifacts.json` の `phases.N.status = "completed"` を更新
2. `outputs/artifacts.json` を同値で更新（同じ更新ターンで書き込み）
3. `generate-index.js` を内部呼び出しして `index.md` の Phase 表を再生成
4. 対象 `phase-N-*.md` 本文 frontmatter の `ステータス` を `completed` に更新（S4 書き手）
5. 上記すべて成功後に `validate-closeout-parity.js` を内部起動し、parity 不成立ならロールバックする

**atomic 性**:

- 3 ファイルを一度ディスクに書き込んだ後、validator PASS を確認してから `git add` 相当の完了ログを残す
- validator FAIL なら `git checkout --` 相当で 3 ファイルを元に戻し、エラーメッセージを返す
- ロールバックは `scripts/__tests__/` fixture で回帰確認する

**CLI 互換性**:

- 既存引数 `--workflow` / `--phase` / `--artifacts` は維持
- parity bypass 用の新規引数は追加しない。未知のフラグは usage error として reject する

### 5. verify-all-specs.js 組込み

**挿入位置**: 既存の構造・整合性・品質・完全性検証の最終段、`PASS` 判定出力前。

```
既存:
  [構造検証] → [整合性検証] → [品質検証] → [完全性検証] → PASS/FAIL

拡張後:
  [構造検証] → [整合性検証] → [品質検証] → [完全性検証] → [parity検証] → PASS/FAIL
                                                              ↑ 新規
```

- parity 検証は read-only（ファイル書き換え禁止）
- drift 検出時は全検証を FAIL 扱いに格上げし、既存の構造/整合性/品質 PASS を理由に PASS 判定しない
- JSON レポート内に `parity` フィールドを追加し、既存 consumer 側は optional として扱う（後方互換）

### 6. phase-12-completion-checklist.md ゲート設計

以下の差分を追加する:

- **【初手チェック】** セクションに新項目を追加:
  - `[ ] 【初手チェック】validate-closeout-parity.js --workflow <workflow-path> が PASS（code=PARITY_OK / exit=0）であることを確認した`
- **既存の「artifacts.json二重管理チェック」（現状は手動）** を validator 実行へ置換:
  - `[ ] node .claude/skills/task-specification-creator/scripts/validate-closeout-parity.js --workflow <workflow-path> --json で code=PARITY_OK を確認した`
- **PASS 判定の必須条件** として次を追加:
  - `[ ] parity validator を 1 回以上実行し、最終実行で PARITY_OK を記録した（PARITY_DRIFT で Phase 12 PASS は禁止）`

### 7. 教訓還流経路

| 還流先                                                                   | 反映対象                                     |
| ------------------------------------------------------------------------ | -------------------------------------------- |
| `task-specification-creator/references/patterns-phase12-sync.md`         | パターン10 を「validator 実行」に昇格        |
| `task-specification-creator/references/phase-12-completion-checklist.md` | 上記ゲート項目追加                           |
| `task-specification-creator/SKILL.md` 変更履歴                           | 本タスクのバージョン追記                     |
| `task-specification-creator/LOGS.md`                                     | current facts 記録                           |
| `aiworkflow-requirements/references/task-workflow.md`                    | close-out parity guard の current facts 追加 |
| `aiworkflow-requirements/references/lessons-learned-current-2026-04.md`  | L-CLOSEOUT-PARITY-001 追加                   |
| `aiworkflow-requirements/SKILL.md` 変更履歴                              | 本タスクのバージョン追記                     |
| `aiworkflow-requirements/LOGS.md`                                        | sync 記録                                    |
| `.agents/skills/*`                                                       | 上記ミラー全部                               |

### 8. 責務境界マトリクス

| 関心            | 書き手                        | 読み手                    | 禁止                            |
| --------------- | ----------------------------- | ------------------------- | ------------------------------- |
| S1 index.md     | `generate-index.js`           | validator, 人             | complete-phase から直接書かない |
| S2 root json    | `complete-phase.js`           | validator, init-artifacts | validator は書かない            |
| S3 outputs json | `complete-phase.js`           | validator                 | validator は書かない            |
| S4 phase 本文   | `complete-phase.js`           | validator, 人             | generate-index は S4 を書かない |
| parity 判定     | `validate-closeout-parity.js` | verify-all-specs          | state を変更しない（read-only） |

## SubAgentチーム編成（Phase 2 作業分担）

| SubAgent   | 担当                                               |
| ---------- | -------------------------------------------------- |
| SubAgent-A | parity アルゴリズム設計・CLI 契約                  |
| SubAgent-B | `complete-phase.js` / `generate-index.js` 拡張設計 |
| SubAgent-C | `verify-all-specs.js` 組込み設計                   |
| SubAgent-D | checklist / skill 教訓還流設計                     |

## 多角的チェック観点

| 観点         | チェック内容                                                                |
| ------------ | --------------------------------------------------------------------------- |
| 因果         | S1〜S4 の書き手が一箇所に集約されているか（SSOT writer）                    |
| 責務境界     | validator が read-only であり、writer を兼ねていないか                      |
| 状態所有権   | parity bypass 用フラグを追加しない方針が仕様と checklist に反映されているか |
| 価値とコスト | 既存 4 検証（構造/整合性/品質/完全性）との重複を避けているか                |
| 運用性       | drift 検出時の復旧手順が明確か（validator 実行 → ロールバック → 再実行）    |

## 統合テスト連携

本 Phase の設計成果物は Phase 4 のテスト設計へ直接引き渡す。各 SubAgent は以下のテスト設計対象を Phase 4 担当と共有する。

| SubAgent   | Phase 4 へ引き渡すテスト対象                                                          |
| ---------- | ------------------------------------------------------------------------------------- |
| SubAgent-A | parity 判定アルゴリズム（S1〜S4 比較 / 境界条件 / 許可 status 列挙）のユニットテスト  |
| SubAgent-B | `complete-phase.js` 拡張（atomic 書き込み / rollback / escape hatch）の統合テスト     |
| SubAgent-C | `verify-all-specs.js` への parity gate 挿入順序と既存 4 検証への非干渉の E2E テスト   |
| SubAgent-D | `phase-12-completion-checklist.md` ゲート項目の文字列一致テストと skill ミラー parity |

Phase 4 では本 Phase の JSON スキーマ `ParityReport` を fixture 化し、exit code 0/1/2/3 すべてに少なくとも 1 ケース通過することを確認する。

## 成果物

- `outputs/phase-2/parity-algorithm-design.md`: parity 判定アルゴリズム詳細
- `outputs/phase-2/validator-placement-design.md`: validator CLI / JSON 契約と verify-all-specs 組込み
- `outputs/phase-2/complete-phase-extension-design.md`: complete-phase.js 拡張と atomic 性設計
- `outputs/phase-2/checklist-gate-design.md`: phase-12-completion-checklist 差分と skill 教訓還流経路

## 完了条件

- [ ] parity 判定アルゴリズムが決定論的に記述されている
- [ ] validator CLI / JSON / exit code 契約が確定している
- [ ] `complete-phase.js` 拡張設計（atomic / rollback）が確定している
- [ ] `verify-all-specs.js` 挿入位置が確定している
- [ ] `phase-12-completion-checklist.md` 差分文言が確定している
- [ ] 両 skill への教訓還流経路が確定している
- [ ] 責務境界マトリクスが描かれている
- [ ] Phase 3 設計レビューに耐える粒度である

## タスク100%実行確認【必須】

- [ ] 全体アーキテクチャ図作成完了
- [ ] parity アルゴリズム擬似コード完成
- [ ] CLI / JSON スキーマ確定
- [ ] complete-phase 拡張設計完成
- [ ] verify-all-specs 組込み位置確定
- [ ] checklist 差分文言完成
- [ ] 教訓還流経路マップ完成
- [ ] 成果物 4 ファイル出力完了

## 次Phase

Phase 3（設計レビューゲート）へ進む。
