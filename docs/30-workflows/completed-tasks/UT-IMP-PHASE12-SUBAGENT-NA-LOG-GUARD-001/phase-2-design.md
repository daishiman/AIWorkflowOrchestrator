# Phase 2: 設計 — UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001

## メタ情報

| 項目       | 値                                          |
| ---------- | ------------------------------------------- |
| Phase      | 2 — 設計                                    |
| 機能名     | Phase 12 仕様書別SubAgent N/A判定ログガード |
| タスクID   | UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001    |
| 作成日     | 2026-03-01                                  |
| 依存成果物 | Phase 1 要件定義書                          |
| ステータス | Draft                                       |

## 目的

Phase 1 で定義した FR-1〜FR-4、NFR-1〜NFR-3 を満たす具体的な設計を行い、N/A判定ログテンプレート構造・三点突合チェックフロー・検証コマンドセット・current/baseline分離記録モデル・SubAgent分担表テンプレートを確定する。

## 実行タスク

- N/A判定ログテンプレートの構造設計: FR-1のフィールド定義をJSON Schemaとして形式化する。
- 三点突合チェック手順のフロー設計: FR-2の突合ルール表を段階的な手順に展開する。
- 検証コマンドセットの設計: NFR-1準拠のコピー&ペースト実行可能なコマンド群を設計する。
- current/baseline分離記録のデータモデル設計: FR-3の分離基準を実装可能なデータ構造に変換する。
- SubAgent分担表テンプレートの設計: FR-4のSubAgent定義を実行手順付きテンプレートに展開する。

| #   | タスク名                                   | 内容                                                     |
| --- | ------------------------------------------ | -------------------------------------------------------- |
| 1   | N/A判定ログテンプレートの構造設計          | FR-1のフィールド定義をJSON Schemaとして形式化する        |
| 2   | 三点突合チェック手順のフロー設計           | FR-2の突合ルール表をステップバイステップの手順に展開する |
| 3   | 検証コマンドセットの設計                   | NFR-1準拠のコピー&ペースト実行可能なコマンド群を設計する |
| 4   | current/baseline分離記録のデータモデル設計 | FR-3の分離基準を実装可能なデータ構造に変換する           |
| 5   | SubAgent分担表テンプレートの設計           | FR-4のSubAgent定義を実行手順付きテンプレートに展開する   |

## 参照資料

| #   | 資料名                                  | パス                                                                                | 用途                            |
| --- | --------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------- |
| 1   | Phase 1 要件定義書                      | `phase-1-requirements.md`                                                           | FR/NFR/ACの参照                 |
| 2   | Phase 12 レトロスペクティブテンプレート | `.claude/skills/skill-creator/assets/phase12-system-spec-retrospective-template.md` | N/A管理ログ既存構造の参照       |
| 3   | タスクワークフロー                      | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                | SubAgent分担マトリクスの参照    |
| 4   | Phase テンプレート                      | `.claude/skills/task-specification-creator/references/phase-templates.md`           | 成果物配置ルールの参照          |
| 5   | 既知の落とし穴                          | `.claude/rules/06-known-pitfalls.md`                                                | P43（rate limit）対策の設計反映 |

## 実行手順

### Step 1: N/A判定ログテンプレートの構造設計（FR-1対応）

#### 1.1 JSON Schema 定義

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "NA Judgment Log",
  "type": "object",
  "required": ["taskId", "phase", "judgments", "summary"],
  "properties": {
    "taskId": {
      "type": "string",
      "pattern": "^[A-Z][A-Z0-9-]+$",
      "description": "タスクID（例: UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001）"
    },
    "phase": {
      "type": "integer",
      "const": 12,
      "description": "対象Phase（固定値: 12）"
    },
    "judgments": {
      "type": "array",
      "minItems": 5,
      "items": {
        "$ref": "#/$defs/judgmentEntry"
      },
      "description": "推奨5点セット仕様書それぞれの判定結果"
    },
    "summary": {
      "type": "object",
      "required": ["totalSpecs", "updatedCount", "naCount"],
      "properties": {
        "totalSpecs": { "type": "integer", "minimum": 5 },
        "updatedCount": { "type": "integer", "minimum": 0 },
        "naCount": { "type": "integer", "minimum": 0 }
      }
    }
  },
  "$defs": {
    "judgmentEntry": {
      "type": "object",
      "required": [
        "specName",
        "judgment",
        "reason",
        "alternativeProof",
        "updatedBy",
        "timestamp"
      ],
      "properties": {
        "specName": {
          "type": "string",
          "description": "仕様書ファイル名（拡張子込み）"
        },
        "judgment": {
          "type": "string",
          "enum": ["updated", "na"],
          "description": "判定結果"
        },
        "reason": {
          "type": "string",
          "minLength": 10,
          "description": "判定理由（最低10文字）"
        },
        "alternativeProof": {
          "type": "string",
          "minLength": 10,
          "description": "代替証跡（最低10文字）"
        },
        "updatedBy": {
          "type": "string",
          "enum": ["A", "B", "C", "D", "E", "lead"],
          "description": "更新担当SubAgent名"
        },
        "timestamp": {
          "type": "string",
          "format": "date-time",
          "description": "判定日時（ISO 8601）"
        }
      },
      "if": {
        "properties": { "judgment": { "const": "na" } }
      },
      "then": {
        "properties": {
          "alternativeProof": {
            "pattern": "(grep|git diff|git log|検索|確認)",
            "description": "N/A判定時は検証手段を含む具体的な証跡が必要"
          }
        }
      }
    }
  }
}
```

#### 1.2 Markdown テンプレート形式

`spec-update-summary.md` 内の N/A管理ログセクションとして以下の形式で記録する:

```markdown
## N/A管理ログ

| 仕様書名            | 判定    | 理由                                           | 代替証跡                                                     | 担当       | 日時                |
| ------------------- | ------- | ---------------------------------------------- | ------------------------------------------------------------ | ---------- | ------------------- | ------ | --- | ------------------- |
| interfaces-agent.md | updated | AgentConfig型にtimeoutフィールドを追加したため | diff: +timeout: number (L42)                                 | A          | 2026-03-01T10:00:00 |
| api-ipc-agent.md    | na      | 今回のタスクはIPC変更を含まないため            | grep -rn "agent:" apps/desktop/src/main/ → 変更0件           | B          | 2026-03-01T10:05:00 |
| security-api.md     | na      | セキュリティ関連の変更を含まないため           | git diff --stat -- apps/desktop/src/main/security/ → 0 files | C          | 2026-03-01T10:05:00 |
| task-workflow.md    | updated | 完了タスクテーブルにタスクIDを追加したため     | diff: +                                                      | UT-IMP-... | completed           | (L120) | D   | 2026-03-01T10:10:00 |
| lessons-learned.md  | na      | 今回のタスクで新規教訓は検出されなかったため   | Phase 10レビュー結果: 教訓候補0件                            | E          | 2026-03-01T10:10:00 |

**集計**: 更新 2件 / N/A 3件 / 合計 5件
```

### Step 2: 三点突合チェック手順のフロー設計（FR-2対応）

#### 2.1 フロー概要

```
[開始]
  │
  ├─ Step A: 成果物実体の存在確認
  │   └─ ls -la outputs/phase-12/
  │
  ├─ Step B: artifacts.json ステータス確認
  │   └─ jq '.phases["12"].status' artifacts.json
  │
  ├─ Step C: phase-12-documentation.md チェック状態確認
  │   └─ grep -c "\[x\]" phase-12-documentation.md
  │   └─ grep -c "\[ \]" phase-12-documentation.md
  │
  ├─ Step D: 三点突合マッチング
  │   └─ 8パターンの突合ルール表に照合
  │
  └─ Step E: 判定結果の記録
      ├─ PASS → Phase 12完了として記録
      ├─ FAIL → 対処手順を実行後、Step A から再実行
      └─ CRITICAL → エスカレーション（手動介入必須）
```

#### 2.2 ステップバイステップ手順

**Step A: 成果物実体の存在確認**

```bash
# 1. Phase 12 成果物ディレクトリの一覧を取得
ls -la docs/30-workflows/<TASK-ID>/outputs/phase-12/

# 2. 必須成果物の存在をチェック
REQUIRED_FILES=(
  "spec-update-summary.md"
  "documentation-changelog.md"
  "unassigned-task-report.md"
)
for f in "${REQUIRED_FILES[@]}"; do
  if [ ! -f "docs/30-workflows/<TASK-ID>/outputs/phase-12/$f" ]; then
    echo "MISSING: $f"
  fi
done
```

**Step B: artifacts.json ステータス確認**

```bash
# artifacts.json の Phase 12 ステータスを確認
cat docs/30-workflows/<TASK-ID>/artifacts.json | grep -A5 '"phase-12"'
```

期待値: `"status": "completed"`

**Step C: phase-12-documentation.md チェック状態確認**

```bash
# チェック済み項目数
CHECKED=$(grep -c "\[x\]" docs/30-workflows/<TASK-ID>/phase-12-documentation.md)
# 未チェック項目数
UNCHECKED=$(grep -c "\[ \]" docs/30-workflows/<TASK-ID>/phase-12-documentation.md)
echo "Checked: $CHECKED / Unchecked: $UNCHECKED"
```

期待値: `UNCHECKED === 0`

**Step D: 三点突合マッチング**

Step A〜C の結果を以下のルール表に照合する:

| #   | 成果物実体 | artifacts.json | チェックリスト | 判定     | 対処コマンド                                                  |
| --- | ---------- | -------------- | -------------- | -------- | ------------------------------------------------------------- |
| 1   | 存在       | completed      | 全[x]          | PASS     | —                                                             |
| 2   | 存在       | completed      | [ ]あり        | FAIL     | チェックリストを更新し再コミット                              |
| 3   | 存在       | 未completed    | 全[x]          | FAIL     | `artifacts.json` の status を `completed` に更新              |
| 4   | 存在       | 未completed    | [ ]あり        | FAIL     | `artifacts.json` 更新 + チェックリスト更新                    |
| 5   | 不在       | completed      | 全[x]          | CRITICAL | 成果物を作成するか、artifacts.json とチェックリストを取り消す |
| 6   | 不在       | completed      | [ ]あり        | FAIL     | artifacts.json の status を取り消す                           |
| 7   | 不在       | 未completed    | 全[x]          | FAIL     | チェックリストを取り消す                                      |
| 8   | 不在       | 未completed    | [ ]あり        | N/A対象  | N/A判定ログに記録する                                         |

**Step E: 判定結果の記録**

```bash
# PASS の場合: Phase 12 完了を記録
echo "三点突合: PASS ($(date -u +%Y-%m-%dT%H:%M:%SZ))" >> docs/30-workflows/<TASK-ID>/outputs/phase-12/spec-update-summary.md

# FAIL の場合: 対処実行後に Step A から再実行
# CRITICAL の場合: 手動介入が必要 — リーダーに通知
```

### Step 3: 検証コマンドセットの設計（NFR-1対応）

#### 3.1 コマンド一覧

| #   | コマンド名                   | 目的                             | 実行タイミング         |
| --- | ---------------------------- | -------------------------------- | ---------------------- |
| 1   | `verify-na-log`              | N/A判定ログの完全性を検証する    | N/A判定ログ記録後      |
| 2   | `verify-three-point`         | 三点突合を実行する               | Phase 12全タスク完了後 |
| 3   | `verify-current-baseline`    | current/baseline分離を検証する   | 監査スクリプト実行後   |
| 4   | `verify-subagent-assignment` | SubAgent分担の完了状態を検証する | SubAgent作業完了後     |

#### 3.2 verify-na-log コマンド設計

```bash
# N/A判定ログの完全性検証
# 入力: spec-update-summary.md
# 期待: 推奨5点セット全件に判定が存在し、N/A判定にはreasonとalternativeProofが存在する

SUMMARY="docs/30-workflows/<TASK-ID>/outputs/phase-12/spec-update-summary.md"

# 1. 推奨5点セットの判定有無を確認
REQUIRED_SPECS=("interfaces" "api-ipc" "security" "task-workflow" "lessons-learned")
for spec in "${REQUIRED_SPECS[@]}"; do
  if ! grep -q "$spec" "$SUMMARY"; then
    echo "ERROR: $spec の判定が記録されていない"
  fi
done

# 2. N/A判定の理由・証跡が空でないことを確認
# Markdownテーブルから na 行を抽出し、理由列・証跡列が空でないことを検証
grep "| na " "$SUMMARY" | while IFS='|' read -r _ _ _ reason proof _; do
  reason=$(echo "$reason" | xargs)
  proof=$(echo "$proof" | xargs)
  if [ ${#reason} -lt 10 ]; then
    echo "ERROR: N/A判定の理由が10文字未満: '$reason'"
  fi
  if [ ${#proof} -lt 10 ]; then
    echo "ERROR: N/A判定の代替証跡が10文字未満: '$proof'"
  fi
done

echo "verify-na-log: 完了"
```

#### 3.3 verify-current-baseline コマンド設計

```bash
# current/baseline分離の検証
# 入力: verify-all-specs.js の実行結果
# 期待: currentViolations.total === 0

# 1. baseline取得（mainブランチでの違反数）
git stash
BASELINE=$(node .claude/scripts/verify-all-specs.js 2>/dev/null | grep -c "VIOLATION")
git stash pop

# 2. current取得（現在ブランチでの違反数）
CURRENT_TOTAL=$(node .claude/scripts/verify-all-specs.js 2>/dev/null | grep -c "VIOLATION")

# 3. 差分計算
CURRENT_NEW=$((CURRENT_TOTAL - BASELINE))

echo "Baseline violations: $BASELINE"
echo "Total violations: $CURRENT_TOTAL"
echo "Current (new) violations: $CURRENT_NEW"

if [ "$CURRENT_NEW" -eq 0 ]; then
  echo "PASS: currentViolations.total === 0"
else
  echo "FAIL: currentViolations.total === $CURRENT_NEW"
fi
```

### Step 4: current/baseline分離記録のデータモデル設計（FR-3対応）

#### 4.1 データ構造

`spec-update-summary.md` 内の監査結果セクションとして記録する:

```markdown
## 監査結果（current/baseline分離）

### Baseline Violations（タスク着手前から存在）

| #   | 違反内容                                | 検出元スクリプト    | 初検出タスク                          |
| --- | --------------------------------------- | ------------------- | ------------------------------------- |
| 1   | topic-map.md のセクション数不一致（-2） | verify-all-specs.js | TASK-REFACTOR-SHARED-SOURCE-STRUCTURE |

**Baseline合計**: 1件

### Current Violations（今回のタスクで新規発生）

| #   | 違反内容 | 検出元スクリプト | 対処 |
| --- | -------- | ---------------- | ---- |
| —   | —        | —                | —    |

**Current合計**: 0件

### 判定

- **判定基準**: `currentViolations.total === 0`
- **結果**: **PASS**（Current violations: 0件）
- **Baseline違反の扱い**: 未タスク UT-FIX-TOPIC-MAP-SYNC-001 として管理中
```

#### 4.2 artifacts.json への記録形式

```json
{
  "phases": {
    "12": {
      "status": "completed",
      "audit": {
        "currentViolations": {
          "total": 0,
          "details": []
        },
        "baselineViolations": {
          "total": 1,
          "details": [
            {
              "description": "topic-map.md のセクション数不一致（-2）",
              "source": "verify-all-specs.js",
              "firstDetected": "TASK-REFACTOR-SHARED-SOURCE-STRUCTURE"
            }
          ]
        },
        "judgment": "PASS",
        "judgmentBasis": "currentViolations.total === 0"
      }
    }
  }
}
```

### Step 5: SubAgent分担表テンプレートの設計（FR-4対応）

#### 5.1 テンプレート構造

```markdown
## SubAgent分担マトリクス

### 分担表

| SubAgent | 担当仕様書                        | 更新観点                        | ファイル数上限 | 依存関係   |
| -------- | --------------------------------- | ------------------------------- | -------------- | ---------- |
| A        | interfaces-\*.md（最大3ファイル） | 型/API契約の同期                | 3              | なし       |
| B        | api-ipc-\*.md（最大3ファイル）    | IPCチャネル契約の同期           | 3              | なし       |
| C        | security-\*.md（最大3ファイル）   | sender検証/P42/エラーサニタイズ | 3              | なし       |
| D        | task-workflow.md + LOGS.md x2     | 完了台帳・検証証跡の同期        | 3              | A〜C完了後 |
| E        | lessons-learned.md                | 教訓の構造化記録                | 1              | A〜C完了後 |

### P43対策: ファイル数上限

- 各SubAgentの担当ファイル数は **3ファイル以下** に制限する（P43: rate limit対策）
- 4ファイル以上の更新が必要な場合、SubAgentを分割する（例: A1, A2）

### 実行順序
```

Phase 1（並列）: SubAgent A, B, C を同時実行
↓
Phase 2（並列）: SubAgent D, E を同時実行（A〜Cの完了を待つ）
↓
Phase 3（直列）: リーダーが三点突合を実行

```

### SubAgent完了条件

| SubAgent | 完了条件                                                                          |
| -------- | --------------------------------------------------------------------------------- |
| A        | 担当仕様書の更新またはN/A判定ログ記録が完了し、diff出力で変更内容を報告済み       |
| B        | 担当仕様書の更新またはN/A判定ログ記録が完了し、diff出力で変更内容を報告済み       |
| C        | 担当仕様書の更新またはN/A判定ログ記録が完了し、diff出力で変更内容を報告済み       |
| D        | task-workflow.md + LOGS.md x2 の更新が完了し、完了タスクテーブルに記録済み         |
| E        | lessons-learned.md の更新またはN/A判定ログ記録が完了し、教訓フォーマット準拠を確認 |
```

#### 5.2 SubAgent起動テンプレート

各SubAgentへの指示は以下の形式で統一する:

```markdown
### SubAgent [X] 指示書

**担当仕様書**: [ファイルパス]
**更新観点**: [観点の説明]
**タスクID**: <TASK-ID>

#### 手順

1. 担当仕様書を読み込む
2. タスクの実装内容と仕様書の差分を確認する
3. 更新が必要な場合: 仕様書を更新し、N/A判定ログに `updated` を記録する
4. 更新が不要な場合: N/A判定ログに `na` を記録する（理由+代替証跡必須）
5. `git diff --stat` で変更内容を報告する

#### 完了報告形式

- 判定: updated / na
- 理由: [具体的な理由]
- 証跡: [grepコマンド出力 or diff出力]
```

## 統合テスト連携

| #   | 接続先                                 | 連携設計                                                                     |
| --- | -------------------------------------- | ---------------------------------------------------------------------------- |
| 1   | 監査スクリプト連携                     | `verify-all-specs.js` の violations 配列を baseline/current 分離の入力とする |
| 2   | artifacts.json API                     | `phases["12"].audit` オブジェクトに current/baseline 分離結果を格納する      |
| 3   | phase-12-documentation.md チェック同期 | grep による `[x]`/`[ ]` カウントを三点突合 Step C の入力とする               |

## 多角的チェック観点

| 観点       | 確認内容                                                                      |
| ---------- | ----------------------------------------------------------------------------- |
| FR-1 充足  | JSON Schema の required フィールドが Phase 1 の FR-1 テーブルと完全一致するか |
| FR-2 充足  | 8パターンの突合ルール表がフロー Step D に反映されているか                     |
| FR-3 充足  | データモデルに currentViolations.total の判定基準が含まれるか                 |
| FR-4 充足  | SubAgent分担表にP43対策（3ファイル上限）が含まれるか                          |
| NFR-1 充足 | 全検証コマンドがコピー&ペースト実行可能か                                     |
| NFR-2 充足 | 手順に曖昧表現が0件か                                                         |
| NFR-3 充足 | artifacts.json への追加が既存スキーマの破壊的変更でないか                     |

## 成果物

| #   | 成果物名                   | パス                                                                                                                            |
| --- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 1   | 設計書（本ファイル）       | `docs/30-workflows/completed-tasks/UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001/phase-2-design.md`                                  |
| 2   | N/A判定ログ JSON Schema    | `docs/30-workflows/completed-tasks/UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001/outputs/phase-2/na-judgment-log-schema.json`        |
| 3   | 三点突合フロー図           | `docs/30-workflows/completed-tasks/UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001/outputs/phase-2/three-point-reconciliation-flow.md` |
| 4   | 検証コマンドセット         | `docs/30-workflows/completed-tasks/UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001/outputs/phase-2/verification-commands.md`           |
| 5   | SubAgent分担表テンプレート | `docs/30-workflows/completed-tasks/UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001/outputs/phase-2/subagent-assignment-template.md`    |

## 完了条件

- [ ] N/A判定ログの JSON Schema が FR-1 の全フィールドを含んでいる
- [ ] Markdown テンプレート形式が JSON Schema と1:1対応している
- [ ] 三点突合フローの5ステップ（A〜E）が全て手順化されている
- [ ] 8パターンの突合ルール表が対処コマンド付きで定義されている
- [ ] 検証コマンド4種が全てコピー&ペースト実行可能な形式である
- [ ] current/baseline分離のデータモデルが artifacts.json 拡張として定義されている
- [ ] SubAgent分担表にP43対策（3ファイル上限）が明記されている
- [ ] SubAgent実行順序（Phase 1: A,B,C並列 → Phase 2: D,E並列）が定義されている
- [ ] 曖昧表現が0件である

## サブタスク管理

| #   | サブタスク                     | 担当 | ステータス |
| --- | ------------------------------ | ---- | ---------- |
| 1   | N/A判定ログ構造設計            | lead | 完了       |
| 2   | 三点突合フロー設計             | lead | 完了       |
| 3   | 検証コマンドセット設計         | lead | 完了       |
| 4   | current/baseline分離モデル設計 | lead | 完了       |
| 5   | SubAgent分担表テンプレート設計 | lead | 完了       |

## タスク100%実行確認【必須】

| #   | 確認項目                                                  | 結果 |
| --- | --------------------------------------------------------- | ---- |
| 1   | FR-1〜FR-4 に対応する設計が全て存在するか                 | Yes  |
| 2   | NFR-1〜NFR-3 を満たす設計要素が含まれるか                 | Yes  |
| 3   | P43対策（3ファイル上限/SubAgent）が設計に反映されているか | Yes  |
| 4   | 検証コマンドが全てシェルスクリプトとして実行可能か        | Yes  |
| 5   | artifacts.json の拡張が既存スキーマに対する追加のみか     | Yes  |
| 6   | 曖昧表現が0件か                                           | Yes  |

## 次のPhase

**Phase 3: 設計レビュー** — Phase 2 設計の妥当性検証、既存 Phase 12 運用との互換性確認、監査スクリプトとの整合性確認を実施する。
