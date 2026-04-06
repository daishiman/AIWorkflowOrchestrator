# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目      | 内容                            |
| --------- | ------------------------------- |
| Phase     | 2                               |
| 機能名    | imp-layer12-check-id-script-006 |
| 作成日    | 2026-04-04                      |
| 前提Phase | Phase 1                         |
| 後続Phase | Phase 3                         |

## 目的

Phase 1 の要件・分析結果に基づき、check ID 突き合わせスクリプトのアーキテクチャ・テーブル行スコープの grep パターン・入出力仕様を設計する。

## 実行タスク

### タスク1: スクリプトアーキテクチャの設計

**目的**: スクリプトの責務分割とファイル構成を決定する

**手順**:

1. 以下の関数構成を設計する:

```
verify-check-id-parity.js（メインスクリプト）
├── extractCheckIdsFromImpl(filePath)   // 実装ファイルから check ID を抽出
├── extractCheckIdsFromSpec(filePath)   // 仕様書テーブル行から check ID を抽出（例示値除外）
├── compareCheckIds(implIds, specIds)   // 突き合わせ・差分検出
└── main()                              // CLI エントリポイント・終了コード制御
```

2. 配置先を決定する:
   - 候補 A: `.claude/skills/task-specification-creator/scripts/verify-check-id-parity.js`
   - 候補 B: `scripts/verify-check-id-parity.js`（リポジトリルート）
   - 判断基準: 既存の同種スクリプト（`detect-unassigned-tasks.js` 等）の配置先に合わせる

3. テストファイルの配置先を決定する:
   - `scripts/__tests__/verify-check-id-parity.test.js` または
   - `.claude/skills/task-specification-creator/scripts/__tests__/verify-check-id-parity.test.js`

**期待される成果物**:

- `outputs/phase-2/design.md` — アーキテクチャ設計

### タスク2: テーブル行スコープの grep パターン設計

**目的**: Markdown テーブル行のみを対象とし、例示値を除外する正規表現パターンを設計する

**手順**:

1. `interfaces-skill-verify-contract.md` のテーブル行フォーマットを分析する:

```markdown
# テーブル行の例（check ID が登場するパターン）

| L1-001 | SKILL.md の存在確認 | `error` | ファイルが存在する | `SKILL.md is missing` |
| L2-007 | output-schema.json が有効な JSON か確認 | `error` | JSON パースが成功する |
```

2. 以下のパターンを設計し、例示値（`L2-008`）との区別を確認する:

```javascript
// テーブル行スコープの正規表現
// 行頭の | の後にスペースと check ID が続くパターン
const TABLE_ROW_PATTERN = /^\|\s+(L[1-4]-\d{3})\s+\|/gm;

// ファイル全体パターン（誤検知あり）
const GLOBAL_PATTERN = /L[1-4]-\d{3}/g;
```

3. 設計したパターンで以下を確認する:
   - テーブル行の全 19 件がマッチする
   - 拡張ガイドライン内の `L2-008`（例示値）がマッチしない
   - パターンが将来の check ID 追加（`L2-008`, `L5-001` 等）にも対応する

**期待される成果物**:

- `outputs/phase-2/design.md` に grep パターン設計を含める

### タスク3: 入出力仕様の設計

**目的**: スクリプトの CLI インターフェースと出力フォーマットを設計する

**手順**:

1. CLI インターフェースを設計する:

```
使用方法:
  node scripts/verify-check-id-parity.js [options]

オプション:
  --impl <path>   実装ファイルのパス（デフォルト: apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts）
  --spec <path>   仕様書ファイルのパス（デフォルト: .claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md）
  --help          このヘルプを表示
```

2. PASS 時の出力フォーマットを設計する:

```
✓ check ID parity check PASSED
  Implementation: 19 IDs
  Specification:  19 IDs
  Diff: 0
```

3. FAIL 時の出力フォーマットを設計する:

```
✗ check ID parity check FAILED
  Implementation: 19 IDs
  Specification:  20 IDs

  In spec but not in impl:
    - L2-008

  In impl but not in spec:
    (none)
```

4. 終了コードを定義する:
   - `0`: PASS（差分なし）
   - `1`: FAIL（差分あり）
   - `2`: エラー（ファイルが見つからない等）

**期待される成果物**:

- `outputs/phase-2/design.md` に入出力仕様を含める

## 参照資料

| 資料名               | パス                                                 |
| -------------------- | ---------------------------------------------------- |
| Phase 1 成果物       | `outputs/phase-1/`                                   |
| スクリプト要件       | `outputs/phase-1/script-requirements.md`             |
| 誤検知パターン分析   | `outputs/phase-1/false-positive-analysis.md`         |
| 既存スクリプト参照先 | `.claude/skills/task-specification-creator/scripts/` |

## 成果物

| 成果物 | パス                        |
| ------ | --------------------------- |
| 設計書 | `outputs/phase-2/design.md` |

## 完了条件

- [ ] スクリプトアーキテクチャ（関数構成・ファイル配置）が設計されている
- [ ] テーブル行スコープの正規表現パターンが設計されている
- [ ] 例示値（`L2-008`）がパターンにマッチしないことが設計書に示されている
- [ ] CLI インターフェース（オプション・デフォルト値）が設計されている
- [ ] PASS/FAIL 時の出力フォーマットが設計されている
- [ ] 終了コード（0/1/2）が定義されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 3: 設計レビュー
