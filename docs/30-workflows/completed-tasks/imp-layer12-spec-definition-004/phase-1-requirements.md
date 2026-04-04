# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目      | 内容                            |
| --------- | ------------------------------- |
| Phase     | 1                               |
| 機能名    | imp-layer12-spec-definition-004 |
| 作成日    | 2026-04-03                      |
| 前提Phase | なし                            |
| 後続Phase | Phase 2                         |

## 目的

`SkillCreatorVerificationEngine` の全 check ID（L1-001〜L4-003）の正確な実態を把握し、`aiworkflow-requirements` の FR-04 verify 契約における現在の記載状況を確認する。タスク分類（docs-only task）を明示的に記録する。

## タスク分類

| 項目          | 判定       |
| ------------- | ---------- |
| タスク種別    | docs-only  |
| UI 変更       | なし       |
| コード変更    | なし       |
| Phase 11 判定 | NON_VISUAL |

## 実行タスク

### タスク1: SkillCreatorVerificationEngine の check ID 棚卸し

**目的**: 実装コードから全 check ID とその詳細を正確に抽出する

**手順**:

1. `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts` を読み、全 check ID を抽出する
2. 各 check ID について以下を記録する:
   - check ID（例: L1-001）
   - 検証内容（何を検証するか）
   - 合否判定基準（どうなれば合格か）
   - severity（error / warning）
   - エラーメッセージ（pass / fail 両方）
3. Layer ごとに分類して一覧表を作成する

**期待される成果物**:

- `outputs/phase-1/check-id-inventory.md` — 全 check ID の棚卸し結果

### タスク2: aiworkflow-requirements の FR-04 関連記載状況調査

**目的**: FR-04 verify 契約に関する現在の記載内容と追記候補先を特定する

**手順**:

1. `.claude/skills/aiworkflow-requirements/references/resource-map.md` を確認し、FR-04 関連のエントリを探す
2. `grep -rn "FR-04\|verify.*契約\|verify contract\|SkillCreatorVerification" .claude/skills/aiworkflow-requirements/references/` で関連ファイルを特定する
3. 以下のファイルの FR-04 関連記載を確認する:
   - `interfaces-agent-sdk-skill.md` 系ファイル
   - `lessons-learned-current.md`
   - `task-workflow-completed.md`
4. check ID 体系が既に記載されているかを確認する
5. 追記候補先ファイルを 1〜3 件リストアップする

**期待される成果物**:

- `outputs/phase-1/fr04-current-state.md` — FR-04 の現状記載状況と追記候補先

### タスク3: 既存コードの命名規則分析

**目的**: check ID の命名規則を分析し、記録する

**手順**:

1. `SkillCreatorVerificationEngine.ts` 内の check ID 命名パターンを確認する
   - `L{Layer番号}-{3桁連番}` 形式
   - Layer 番号: 1=構造検証, 2=コンテンツ検証, 3=詳細コンテンツ検証, 4=参照整合性・結合検証
2. severity の割り当てパターンを確認する（error vs warning）
3. Layer 間の依存関係（Layer 1 → 2 → 3 → 4 の順序制約）を確認する

**期待される成果物**:

- `outputs/phase-1/naming-convention-analysis.md` — 命名規則分析結果

### タスク4: 受け入れ基準の詳細化

**目的**: AC-1〜AC-7 の検証方法を具体化する

**手順**:

1. 各 AC について、検証コマンドまたは確認手順を定義する:
   - AC-1〜AC-4: `grep -c "L{N}-" <追記先ファイル>` で check ID の記載数を検証
   - AC-5: 各 check ID に「検証内容」「判定基準」「severity」カラムが存在するか確認
   - AC-6: `grep "L{N}-{NNN}" <追記先ファイル>` で命名規則セクションを検証
   - AC-7: `SkillCreatorVerificationEngine.ts` と追記内容の diff による突き合わせ

**期待される成果物**:

- 本 Phase の成果物に AC 検証方法を含める（check-id-inventory.md に追記）

## 参照資料

| 資料名                         | パス                                                                                        | 説明                |
| ------------------------------ | ------------------------------------------------------------------------------------------- | ------------------- |
| SkillCreatorVerificationEngine | `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts`                  | check ID 実装の正本 |
| VerificationEngine テスト      | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorVerificationEngine.test.ts`   | check ID の使用例   |
| aiworkflow-requirements        | `.claude/skills/aiworkflow-requirements/references/`                                        | 追記対象の仕様書群  |
| skill-feedback-report          | `docs/30-workflows/completed-tasks/step-09-par-task-p0-01-verify-execution-engine-layer12/` | 本タスク発見の根拠  |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                   | パス                                                                              | 内容                           |
| -------------------------- | --------------------------------------------------------------------------------- | ------------------------------ |
| interfaces-agent-sdk-skill | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | スキル関連インターフェース定義 |
| lessons-learned-current    | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`    | VerificationEngine 関連の教訓  |

## 統合テスト連携

本タスクは docs-only のため、統合テストは N/A。ただし、追記内容と実装の突き合わせ検証（grep ベース）を Phase 4 以降で実施する。

## check ID 棚卸し結果（Phase 1 実行時に埋める）

### Layer 1（構造検証）— 5 checks

| check ID | 検証内容                              | severity | 合否判定基準           |
| -------- | ------------------------------------- | -------- | ---------------------- |
| L1-001   | SKILL.md ファイルの存在確認           | error    | ファイルが存在する     |
| L1-002   | agents/ ディレクトリの存在確認        | error    | ディレクトリが存在する |
| L1-003   | agents/ ディレクトリが空でないか      | error    | ファイル数 > 0         |
| L1-004   | references/ ディレクトリの存在確認    | warning  | ディレクトリが存在する |
| L1-005   | output-schema.json ファイルの存在確認 | warning  | ファイルが存在する     |

### Layer 2（コンテンツ検証）— 7 checks

| check ID | 検証内容                                   | severity | 合否判定基準          |
| -------- | ------------------------------------------ | -------- | --------------------- |
| L2-001   | SKILL.md が H1 見出しを含むか              | error    | H1 見出しが存在する   |
| L2-002   | SKILL.md が「概要」セクションを含むか      | error    | セクションが存在する  |
| L2-003   | SKILL.md が「Trigger」セクションを含むか   | error    | セクションが存在する  |
| L2-004   | SKILL.md が「Anchors」セクションを含むか   | warning  | セクションが存在する  |
| L2-005   | agent ファイルが H1 見出しを含むか         | error    | H1 見出しが存在する   |
| L2-006   | agent ファイルが「責務」セクションを含むか | warning  | セクションが存在する  |
| L2-007   | output-schema.json が有効な JSON か        | error    | JSON パースが成功する |

### Layer 3（詳細コンテンツ検証）— 4 checks

| check ID | 検証内容                                             | severity | 合否判定基準            |
| -------- | ---------------------------------------------------- | -------- | ----------------------- |
| L3-001   | output-schema.json が $schema フィールドを含むか     | warning  | フィールドが存在する    |
| L3-002   | output-schema.json の type フィールドが有効か        | error    | 有効な JSON Schema type |
| L3-003   | agent の「責務」セクションが実質的内容を持つか       | warning  | 20 文字以上             |
| L3-004   | SKILL.md の「Trigger」セクションが実質的内容を持つか | warning  | 10 文字以上             |

### Layer 4（参照整合性・結合検証）— 3 checks

| check ID | 検証内容                                               | severity | 合否判定基準                  |
| -------- | ------------------------------------------------------ | -------- | ----------------------------- |
| L4-001   | SKILL.md の「Anchors」にリスト項目があるか             | error    | リスト項目が 1 件以上存在する |
| L4-002   | SKILL.md で言及された references/ ファイルが存在するか | warning  | 全ファイルが存在する          |
| L4-003   | agent ファイル名が SKILL.md で言及されているか         | warning  | テキスト内で言及されている    |

## 成果物

| 成果物          | パス                                            | 説明                        |
| --------------- | ----------------------------------------------- | --------------------------- |
| check ID 棚卸し | `outputs/phase-1/check-id-inventory.md`         | 全 check ID の詳細一覧      |
| FR-04 現状調査  | `outputs/phase-1/fr04-current-state.md`         | 追記先候補と現状記載状況    |
| 命名規則分析    | `outputs/phase-1/naming-convention-analysis.md` | check ID 命名パターンの分析 |

## 完了条件

- [ ] 全 check ID（L1-001〜L1-005, L2-001〜L2-007, L3-001〜L3-004, L4-001〜L4-003）が棚卸しされている
- [ ] 各 check ID の検証内容・判定基準・severity が記録されている
- [ ] FR-04 verify 契約の現状記載状況が調査されている
- [ ] 追記候補先ファイルが特定されている
- [ ] 命名規則（L{N}-{NNN} 形式）が分析・記録されている
- [ ] タスク分類（docs-only task）が記録されている
- [ ] AC-1〜AC-7 の検証方法が具体化されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 2: 設計
