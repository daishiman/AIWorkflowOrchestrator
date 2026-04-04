# aiworkflow-requirements への Layer 1/2 check ID 体系追記

## メタ情報

```yaml
issue_number: 1738
```

## メタ情報

| 項目         | 内容                                                     |
| ------------ | -------------------------------------------------------- |
| タスクID     | task-imp-layer12-spec-definition-004                     |
| タスク名     | aiworkflow-requirements への Layer 1/2 check ID 体系追記 |
| 分類         | 改善（imp）                                              |
| 対象機能     | aiworkflow-requirements / FR-04 verify 契約              |
| 優先度       | 中（P1）                                                 |
| 見積もり規模 | 小                                                       |
| ステータス   | 未実施                                                   |
| 発見元       | Phase 12                                                 |
| 発見日       | 2026-03-29                                               |

---

## 1. なぜこのタスクが必要か（Why）

### 背景

TASK-P0-01 で実装した `SkillCreatorVerificationEngine` は、スキル検証を Layer 1（構造検証）と
Layer 2（コンテンツ検証）に分割し、それぞれに check ID 体系（L1-001〜L1-005、L2-001〜L2-007）を
定義している。

しかし、この check ID 体系は `aiworkflow-requirements` の `references/` 配下にある
FR-04 verify 契約に未記載のままである。
`skill-feedback-report.md`（Phase 12 成果物）では、この問題が提案事項として記録されている。

> skill-feedback-report.md 抜粋:
> "FR-04 verify 契約に Layer 1 (構造検証) / Layer 2 (コンテンツ検証) の定義が未記載。
> `SkillCreatorVerificationEngine` の check ID 体系 (L1-NNN / L2-NNN) を要件仕様に追記することで、
> 将来の Layer 拡張時の基準を明確化できる。"

### 問題点・課題

- check ID が仕様書に記載されていないと、Layer 3/4 実装時に命名規則が不統一になるリスクがある
- 将来の Layer 拡張基準が不明確なため、実装者が独自のネーミングを採用してしまう可能性がある
- 仕様書と実装の乖離が蓄積すると、コードレビューや仕様確認の障壁になる

### 放置した場合の影響

| 影響領域       | 影響                                                                   |
| -------------- | ---------------------------------------------------------------------- |
| Layer 3/4 実装 | check ID の命名規則が不統一になり、既存 L1/L2 との整合性が取れなくなる |
| コードレビュー | 仕様書に定義がないため、レビュー時に命名規則の根拠を確認できない       |
| 仕様書の正確性 | FR-04 verify 契約が実装実態と乖離した状態で参照され続ける              |

---

## 2. 何を達成するか（What）

### 目的

`aiworkflow-requirements` の `references/` 配下にある FR-04 verify 契約に、
`SkillCreatorVerificationEngine` の Layer 1/2 check ID 体系（L1-NNN / L2-NNN）を追記する。
これにより、将来の Layer 3/4 実装時に命名規則の統一基準を仕様書から参照できるようにする。

### 最終ゴール

- FR-04 verify 契約に Layer 1 チェック ID（L1-001〜L1-005）の定義が記載されている
- FR-04 verify 契約に Layer 2 チェック ID（L2-001〜L2-007）の定義が記載されている
- 各 check ID の検証内容・合否判定基準が仕様書に明記されている
- Layer 3/4 実装時に「L3-NNN」形式で命名すべきことが仕様書から読み取れる

### スコープ

**含むもの:**

- `references/` 配下の FR-04 関連ファイルへの L1-NNN / L2-NNN check ID 体系の追記
- 各 check ID の検証内容・合否判定基準の記載
- Layer 命名規則（L{N}-{NNN} 形式）の明文化

**含まないもの:**

- Layer 3/4 の実装
- `SkillCreatorVerificationEngine` 本体の変更
- resource-map への参照追加（必要であれば別タスクとして分離）

### 成果物

| 種別 | 成果物                            | 配置先                                                                      |
| ---- | --------------------------------- | --------------------------------------------------------------------------- |
| 更新 | FR-04 verify 契約ファイルへの追記 | `references/` 配下の FR-04 関連ファイル（aiworkflow-requirements スキル内） |

---

## 3. どのように実行するか（How）

### 前提条件

- `SkillCreatorVerificationEngine` の実装（`apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts`）を参照して check ID の実態を確認する
- `aiworkflow-requirements` スキルの `references/` 配下を確認し、FR-04 verify 契約の現在の記述を把握する

### 推奨アプローチ

1. `SkillCreatorVerificationEngine.ts` を読み、全 check ID（L1-001〜L1-005、L2-001〜L2-007）の定義・判定ロジックを確認する
2. `aiworkflow-requirements` の `resource-map` / `quick-reference` を確認し、FR-04 verify 契約ファイルの場所を特定する
3. FR-04 verify 契約ファイルに Layer 1/2 check ID の定義セクションを追記する
4. check ID の形式（L{N}-{NNN}）を Layer 命名規則として明文化する

### check ID 体系の概要（追記内容の参考）

`SkillCreatorVerificationEngine` で定義されている check ID:

**Layer 1（構造検証）:**

- L1-001: SKILL.md 存在確認
- L1-002: `## Trigger` セクション存在確認
- L1-003: `## 概要` セクション存在確認
- L1-004: agents/ ディレクトリ存在確認
- L1-005: agent spec ファイル存在確認

**Layer 2（コンテンツ検証）:**

- L2-001〜L2-007: コンテンツレベルの詳細検証（実装コードを確認して正確な内容を記載すること）

---

## 4. 実行手順（Phase 構成）

### Phase 1: 現状調査

- `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts` を読み、全 check ID とその判定ロジックを把握する
- `aiworkflow-requirements` スキル内の `resource-map` または `quick-reference` を確認し、FR-04 verify 契約ファイルの場所を特定する
- FR-04 verify 契約の現在の記述を確認し、追記箇所を決定する

### Phase 2: 追記内容の設計

- Layer 1 チェック ID（L1-001〜L1-005）の定義表を作成する
- Layer 2 チェック ID（L2-001〜L2-007）の定義表を作成する
- Layer 命名規則（L{N}-{NNN} 形式）のドキュメントを設計する

### Phase 3: 仕様書追記

- FR-04 verify 契約ファイルに Layer 1/2 check ID セクションを追記する
- 各 check ID の検証内容・合否判定基準・対応エラーメッセージを記載する
- Layer 命名規則を「将来の Layer 3/4 実装ガイドライン」として明文化する

### Phase 4: 検証・コミット

- 追記内容が `SkillCreatorVerificationEngine.ts` の実装と一致していることを確認する
- Markdown 構文が正しいことを確認する
- 変更をコミットする

---

## 5. 完了条件チェックリスト

- [ ] FR-04 verify 契約ファイルに Layer 1 check ID（L1-001〜L1-005）の定義が記載されている
- [ ] FR-04 verify 契約ファイルに Layer 2 check ID（L2-001〜L2-007）の定義が記載されている
- [ ] 各 check ID の検証内容・合否判定基準が明記されている
- [ ] Layer 命名規則（L{N}-{NNN} 形式）が仕様書に明文化されている
- [ ] 追記内容が `SkillCreatorVerificationEngine.ts` の実装と一致している
- [ ] Markdown 構文が正しい

---

## 6. 検証方法

### 確認手順

```bash
# SkillCreatorVerificationEngine の check ID を確認
grep -n "L[12]-[0-9]\{3\}" \
  apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts

# aiworkflow-requirements の FR-04 関連ファイルを確認
ls .claude/skills/aiworkflow-requirements/references/

# 追記後の FR-04 ファイルで check ID が記載されていることを確認
grep -n "L[12]-[0-9]\{3\}" <FR-04-verify契約ファイルのパス>
```

### テストケース

| #   | テストケース                           | 入力条件                                         | 期待結果                                |
| --- | -------------------------------------- | ------------------------------------------------ | --------------------------------------- |
| 1   | L1 check ID がすべて記載されていること | 追記後の FR-04 verify 契約ファイル               | L1-001〜L1-005 が定義表に含まれている   |
| 2   | L2 check ID がすべて記載されていること | 追記後の FR-04 verify 契約ファイル               | L2-001〜L2-007 が定義表に含まれている   |
| 3   | 実装との一致確認                       | SkillCreatorVerificationEngine.ts との突き合わせ | check ID の数と内容が実装と一致している |

---

## 7. リスクと対策

| リスク                                | 影響度 | 発生確率 | 対策                                                                      |
| ------------------------------------- | ------ | -------- | ------------------------------------------------------------------------- |
| L2 check ID の正確な数が不明          | 中     | 中       | Phase 1 で `SkillCreatorVerificationEngine.ts` を精読して確定する         |
| FR-04 verify 契約ファイルの場所が不明 | 中     | 中       | `aiworkflow-requirements` の `resource-map` を起点に確認する              |
| 追記内容と実装の乖離                  | 高     | 低       | 追記後に `SkillCreatorVerificationEngine.ts` と突き合わせて確認する       |
| 将来の Layer 拡張で命名規則が変更     | 低     | 低       | L{N}-{NNN} 形式を柔軟な拡張が可能な形で定義し、固定的な番号範囲は設けない |

---

## 8. 参照情報

### ソースコード

- `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts` — check ID 体系の実装（参照元）
- `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorVerificationEngine.test.ts` — テストコード（check ID の使用例）

### 仕様書・ルール

- `docs/30-workflows/step-09-par-task-p0-01-verify-execution-engine-layer12/outputs/phase-12/skill-feedback-report.md` — 本タスク発見の根拠
- `docs/30-workflows/step-09-par-task-p0-01-verify-execution-engine-layer12/outputs/phase-12/system-spec-update-summary.md` — TASK-P0-01 の仕様書更新記録
- `.claude/skills/aiworkflow-requirements/` — 更新対象のスキルディレクトリ

### 関連タスク

- TASK-P0-01: `SkillCreatorVerificationEngine` Layer 1/2 実装（本タスクの前提）
- task-imp-artifacts-status-sync-003: artifacts.json Phase ステータス同期（同時並行可能）

---

## 9. 備考

### 補足事項

- 本タスクは TASK-P0-01 のスコープ外として意図的に分離された。TASK-P0-01 の作業中に仕様書更新まで行うとスコープが広がりすぎるため、Phase 12 完了後の後続タスクとして記録された。
- `skill-feedback-report.md` には「resource-map への参照追加」も提案されているが、本タスクのスコープは check ID 体系の追記のみとする。resource-map 更新が必要な場合は別タスクとして分離すること。
- check ID の正確な数と内容は Phase 1 の現状調査で確定すること。本仕様書に記載した「L1-001〜L1-005」「L2-001〜L2-007」は Phase 12 成果物から推定した値であり、実装コードとの突き合わせを必ず行うこと。
- FR-04 verify 契約ファイルが `references/` の複数ファイルに分散している場合は、最も適切なファイルを選択して追記する。新規ファイルの作成は最終手段とする。
