# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 3                                         |
| 機能名     | UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001 |
| タスク名   | workflow close-out parity guard           |
| 前提Phase  | Phase 1, Phase 2                          |
| 後続Phase  | Phase 4                                   |
| 作成日     | 2026-04-19                                |
| ステータス | completed                                 |

## 目的

Phase 1（要件）と Phase 2（設計）が Phase 4（テスト作成）以降に耐える粒度・整合性を満たしているかを判定する。MAJOR 不備があれば Phase 2 へ戻し、MINOR のみなら Phase 4 へ進む。

## 実行タスク

1. Phase 1 成果物のレビュー（AC 整合性・drift baseline の再現可能性）
2. Phase 2 成果物のレビュー（アルゴリズム決定論性・CLI 契約・atomic 性・責務境界）
3. レビューゲート判定（PASS / MINOR / MAJOR）
4. MINOR は Phase 4 以降で是正、MAJOR は Phase 2 へ差戻し
5. ゲート判定結果の成果物化

## 参照資料

### Phase 1-2 成果物

| 資料名                          | パス                                                 | 確認項目                   |
| ------------------------------- | ---------------------------------------------------- | -------------------------- |
| Phase 1 要件定義書              | `outputs/phase-1/requirements.md`                    | AC-1〜AC-7 の具体性        |
| Phase 1 受け入れ基準            | `outputs/phase-1/acceptance-criteria.md`             | 検証可能性                 |
| Phase 1 drift baseline          | `outputs/phase-1/drift-inventory.md`                 | baseline 再現可能性        |
| Phase 2 parity アルゴリズム     | `outputs/phase-2/parity-algorithm-design.md`         | 決定論性・境界条件網羅     |
| Phase 2 validator 配置設計      | `outputs/phase-2/validator-placement-design.md`      | CLI / JSON 契約の一意性    |
| Phase 2 complete-phase 拡張設計 | `outputs/phase-2/complete-phase-extension-design.md` | atomic / rollback の実現性 |
| Phase 2 checklist ゲート設計    | `outputs/phase-2/checklist-gate-design.md`           | 文言の再利用性             |

### レビュー基準

| 資料名                     | パス                                                                           |
| -------------------------- | ------------------------------------------------------------------------------ |
| review-gate-criteria       | `.claude/skills/task-specification-creator/references/review-gate-criteria.md` |
| quality-standards          | `.claude/skills/task-specification-creator/references/quality-standards.md`    |
| quality-requirements (sys) | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`    |

## 実行手順

1. 4 つのレビュー観点で Phase 1-2 成果物を走査する
2. 発見事項を MAJOR / MINOR / INFO に分類する
3. 判定ルールに基づき PASS / FAIL を決定する
4. FAIL（MAJOR 1 件以上）なら Phase 2 へ差戻し
5. PASS なら Phase 4 へ進む判定書を出力する

## レビュー観点

### 1. 要件完備性

| チェック項目                                                | 基準     | 結果              |
| ----------------------------------------------------------- | -------- | ----------------- |
| AC-1〜AC-7 がすべて検証可能に記述されている                 | PASS必須 | {{PHASE-3で記録}} |
| 非目標（既存 workflow 遡及修正 / テンプレート刷新）が明文化 | PASS必須 | {{PHASE-3で記録}} |
| drift baseline が再現可能な手順で記録されている             | PASS必須 | {{PHASE-3で記録}} |
| エラー分類コード 4 種類がすべて設計に反映されている         | PASS必須 | {{PHASE-3で記録}} |
| 観測対象 S1〜S4 の格納位置規則が一意に決定できる            | PASS必須 | {{PHASE-3で記録}} |

### 2. 設計整合性

| チェック項目                                                                  | 基準     | 結果              |
| ----------------------------------------------------------------------------- | -------- | ----------------- |
| parity 判定アルゴリズムが決定論的（同入力 → 同出力）                          | PASS必須 | {{PHASE-3で記録}} |
| validator が read-only で、writer 責務を兼ねていない                          | PASS必須 | {{PHASE-3で記録}} |
| `complete-phase.js` が S1〜S4 の唯一の書き手になっている                      | PASS必須 | {{PHASE-3で記録}} |
| parity bypass 用の escape hatch を導入しない方針が checklist に明記されている | PASS必須 | {{PHASE-3で記録}} |
| 既存 4 検証（構造/整合性/品質/完全性）と parity 検証が重複していない          | PASS必須 | {{PHASE-3で記録}} |

### 3. テスト可能性

| チェック項目                                                    | 基準     | 結果              |
| --------------------------------------------------------------- | -------- | ----------------- |
| AC ごとに少なくとも 1 本のテストケースが想定できる              | PASS必須 | {{PHASE-3で記録}} |
| drift 系 fixture（正常 / 部分 drift / 欠損 / 不正値）が設計可能 | PASS必須 | {{PHASE-3で記録}} |
| atomic / rollback の回帰テストが設計可能                        | PASS必須 | {{PHASE-3で記録}} |
| `verify-all-specs.js` 組込みの E2E テストが設計可能             | PASS必須 | {{PHASE-3で記録}} |

### 4. 運用性

| チェック項目                                                         | 基準     | 結果              |
| -------------------------------------------------------------------- | -------- | ----------------- |
| drift 検出時の復旧フロー（再実行手順）が記述されている               | PASS必須 | {{PHASE-3で記録}} |
| `phase-12-completion-checklist.md` 差分が既存文言と共存可能          | PASS必須 | {{PHASE-3で記録}} |
| 両 skill の SKILL.md / LOGS.md / `.agents/` ミラーへの反映経路が明示 | PASS必須 | {{PHASE-3で記録}} |
| 既存 workflow への遡及負荷が発生しない（観測のみ）                   | PASS必須 | {{PHASE-3で記録}} |

## レビュー判定ルール

| 判定  | 条件                                                                   | 次アクション       |
| ----- | ---------------------------------------------------------------------- | ------------------ |
| PASS  | 全項目がPASS / 発見事項は MINOR のみ                                   | Phase 4 へ進む     |
| MINOR | 細部の表現揺れ・不足コメント（アルゴリズム本体に影響なし）             | Phase 4 で是正記録 |
| MAJOR | アルゴリズムの曖昧さ / 責務境界の違反 / AC との不整合 / 非目標との矛盾 | Phase 2 へ差戻し   |

## 想定される MAJOR 事項（事前検知リスト）

- validator が `complete-phase.js` から状態を書き戻す設計になっている → 責務境界違反
- `index.md` の Phase 表フォーマットを同時に変更しようとしている → 非目標違反
- S4（phase 本文 frontmatter）の取り出し規則が曖昧（複数テーブルの混在時の優先順位が未定義）
- parity bypass 用フラグの導入や常時許可を示す文言が残っている → 契約逸脱

## 想定される MINOR 事項

- JSON スキーマの `generatedAt` フォーマット未指定（ISO8601 固定を追記）
- 教訓還流先の mirror 同期ステップ粒度不足（Phase 12 で補完可能）
- exit code の連番規則に関する説明不足（追記で対応可能）

## SubAgentチーム編成

| SubAgent   | 担当                                         |
| ---------- | -------------------------------------------- |
| SubAgent-A | 要件完備性レビュー（AC / 非目標）            |
| SubAgent-B | 設計整合性レビュー（アルゴリズム・責務境界） |
| SubAgent-C | テスト可能性レビュー                         |
| SubAgent-D | 運用性レビュー                               |

## 統合テスト連携

本 Phase はゲート判定であり、単体で統合テストを実行しないが、次の引き渡しを厳守する。

| 引き渡し項目                          | 受け手            | 形式                            |
| ------------------------------------- | ----------------- | ------------------------------- |
| PASS 判定結果                         | Phase 4           | `gate-decision.md` の判定サマリ |
| MINOR 発見事項リスト                  | Phase 4           | `gate-decision.md` の是正記録欄 |
| MAJOR 発見事項（あれば）              | Phase 2（差戻し） | 差戻し理由と修正依頼            |
| AC × 設計成果物のトレーサビリティ結果 | Phase 4           | 4 観点レビューの結論            |

Phase 4 は本 Phase で PASS 判定されたアーキテクチャ・CLI 契約・JSON スキーマを前提にテスト fixture を設計する。

## 成果物

- `outputs/phase-3/gate-decision.md`: ゲート判定書（PASS / FAIL, 発見事項, 次アクション）

## 完了条件

- [ ] 4 観点すべてのレビューが完了している
- [ ] 判定ルールに基づき PASS / FAIL が決定している
- [ ] MAJOR 発見事項はすべて Phase 2 へ差戻しされている（本 Phase 内で再着手しない）
- [ ] MINOR 発見事項は Phase 4 で対応される前提で記録されている
- [ ] Phase 4 へ進む明確な判定根拠が残っている

## タスク100%実行確認【必須】

- [ ] 要件完備性チェック完了
- [ ] 設計整合性チェック完了
- [ ] テスト可能性チェック完了
- [ ] 運用性チェック完了
- [ ] 判定書 `gate-decision.md` 出力完了

## 次Phase

PASS の場合 Phase 4（テスト作成）へ進む。MAJOR 判定の場合 Phase 2 へ差戻し。
