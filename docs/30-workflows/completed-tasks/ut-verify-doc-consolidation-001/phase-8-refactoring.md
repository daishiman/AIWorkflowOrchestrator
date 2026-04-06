# Phase 8: ドキュメント整合性改善 - UT-VERIFY-DOC-CONSOLIDATION-001

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 8                               |
| Phase名    | ドキュメント整合性改善          |
| 前提Phase  | Phase 7                         |
| 後続Phase  | Phase 9                         |
| ステータス | 未実施                          |
| 作成日     | 2026-04-06                      |
| 機能名     | ut-verify-doc-consolidation-001 |

---

## 目的

Phase 5〜7 の変更内容を見直し、ラベル形式の統一性・責務分離セクションの表現品質・ドキュメントスタイルの一貫性を改善する。

---

## 実行タスク

### タスク1: ラベル形式の統一確認と修正

**目的**: 4ファイルに付与したラベルが統一形式であることを確認し、不統一があれば修正する

**実行手順**:

1. 以下の4ファイルの `> 区分:` 記述を読み、形式が統一されているか確認する:
   - `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`
   - `.claude/skills/aiworkflow-requirements/references/task-workflow-active.md`
   - `.claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md`
   - `.claude/skills/aiworkflow-requirements/references/task-workflow.md`（インデックステーブルの「区分」列）

2. 統一基準:
   - `> 区分:` のコロンの後に半角スペース1つ
   - 括弧内の英語表記は `（）` 全角括弧を使用
   - `task-workflow.md` テーブルの区分値は「正本」「履歴」「契約仕様」の3種類のみ

3. 不統一が見つかった場合は修正する

**期待される成果物**:

- ラベル統一確認メモ（`outputs/phase-8/label-consistency-check.md`）

---

### タスク2: 責務分離セクションの表現改善

**目的**: 責務比較表と説明テキストの表現を見直し、正確性・読みやすさを向上させる

**実行手順**:

1. 責務分離セクションを追記したファイルを読む
2. 比較表の「責務」列の記述が簡潔かつ正確かを確認する
3. 責務分離の原則説明テキストが論理的に整合しているか確認する:
   - `verifySkill()` → Facade の公開 API、ガバナンスフック付き
   - `verifyAndImproveLoop()` → severity 判定と improve ループ制御
   - `verify()` → Engine 内部の検証ロジック本体

4. 説明の重複や矛盾があれば修正する

**期待される成果物**:

- 責務分離セクション改善メモ（`outputs/phase-8/responsibility-section-review.md`）

---

### タスク3: ドキュメントスタイル整合性確認

**目的**: 変更内容が既存ドキュメントのスタイルと統一されているか確認する

**実行手順**:

1. 各ファイルの変更箇所と変更していない箇所のスタイル（見出しレベル・blockquote 記法・テーブル書式）が統一されているか確認する
2. 見出し文言の変更がアンカーリンクに影響していないかを確認する（`task-workflow.md` のリンクは特に注意）
3. blockquote（`>`）記法の後の改行・空行が他の記述と統一されているか確認する

**期待される成果物**:

- スタイル整合性確認メモ（`outputs/phase-8/style-consistency-check.md`）

---

## 参照資料

| 参照資料                            | パス                                                                                    | 内容                       |
| ----------------------------------- | --------------------------------------------------------------------------------------- | -------------------------- |
| task-workflow-active.md             | `.claude/skills/aiworkflow-requirements/references/task-workflow-active.md`             | 正本ラベル追記済み         |
| task-workflow-completed.md          | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`          | 履歴ラベル追記済み         |
| interfaces-skill-verify-contract.md | `.claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md` | 責務分離セクション追記済み |

---

## 成果物

| 成果物                     | パス                                               | 内容                      |
| -------------------------- | -------------------------------------------------- | ------------------------- |
| ラベル統一確認メモ         | `outputs/phase-8/label-consistency-check.md`       | 4ファイルのラベル統一状況 |
| 責務分離セクション改善メモ | `outputs/phase-8/responsibility-section-review.md` | 表現改善の記録            |
| スタイル整合性確認メモ     | `outputs/phase-8/style-consistency-check.md`       | スタイル統一状況          |

---

## 完了条件

- [ ] 4ファイルのラベル形式が統一されている
- [ ] 責務比較表の内容が正確で読みやすい
- [ ] アンカーリンクが破損していない
- [ ] `outputs/phase-8/` に成果物が生成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 7（変更網羅性確認）が完了していること
- **後続**: Phase 9（品質保証）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/ut-verify-doc-consolidation-001/phase-9-quality-assurance.md`
