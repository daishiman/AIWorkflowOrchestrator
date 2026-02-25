# UT-IMP-PHASE12-IMPLEMENTATION-GUIDE-QUALITY-GATE-001: Phase 12 実装ガイド必須要件の品質ゲート化

## メタ情報

```yaml
issue_number: 900
```

## メタ情報

| 項目         | 値                                                                   |
| ------------ | -------------------------------------------------------------------- |
| タスクID     | UT-IMP-PHASE12-IMPLEMENTATION-GUIDE-QUALITY-GATE-001                 |
| タスク名     | Phase 12 実装ガイド必須要件の品質ゲート化                            |
| 分類         | 改善                                                                 |
| 対象機能     | `task-specification-creator` Phase 12 Task 1（implementation-guide） |
| 優先度       | 中                                                                   |
| 見積もり規模 | 中規模                                                               |
| ステータス   | 未実施                                                               |
| 発見元       | UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001 Phase 12（実装苦戦箇所）   |
| 発見日       | 2026-02-25                                                           |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`implementation-guide.md` は Part 1/Part 2 のセクション存在だけでは要件達成にならず、内容品質（理由先行、日常例え、型/API/エッジケース明記）が不足すると再監査で差し戻される。

### 1.2 問題点・課題

- 現在の検証は「見出しの有無」中心で、内容必須要件の欠落を検知しにくい
- Part 1（非専門向け）と Part 2（技術者向け）の境界が曖昧になりやすい
- チェックリスト更新と本文更新が分離され、完了判定の一貫性が崩れる

### 1.3 放置した場合の影響

- Phase 12 完了判定の再現性が低下し、レビュー往復が増える
- 初学者向け説明が機能せず、ナレッジ共有の価値が低下する
- 同種タスクで毎回同じ修正を繰り返す

---

## 2. 何を達成するか（What）

### 2.1 目的

Phase 12 Task 1 の必須要件を機械検証し、`implementation-guide.md` の品質を安定化する。

### 2.2 最終ゴール

1. Part 1/Part 2 の内容必須要件（理由先行/日常例え/型/API/エッジケース/設定項目）を検証するルールを定義する
2. ルールを `validate-phase-output.js` もしくは専用スクリプトに統合する
3. `phase-12-documentation.md` チェックリストと本文の同期を検証可能にする

### 2.3 スコープ

#### 含むもの

- Phase 12 Task 1 の内容品質ルール定義
- 品質ゲート用スクリプト/検証ロジックの追加
- `task-specification-creator` ガイド更新

#### 含まないもの

- 既存全ワークフローの `implementation-guide.md` 一括改修
- Part 1/Part 2 テンプレートの全面再設計

### 2.4 成果物

- 品質ゲート定義（チェック項目）
- 検証スクリプト更新
- ガイド/テンプレート更新（必要箇所）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `task-specification-creator` の Phase 12仕様（Task 1必須要件）を参照できること
- 既存 `validate-phase-output.js` の実行環境があること

### 3.2 依存タスク

- `task-phase12-output-validation.md`（Part 1/Part 2 セクション存在検証の既存改善）

### 3.3 必要な知識

- Phase 12 Task 1 要件（Part 1/Part 2）
- ドキュメント静的検証の実装方針
- 未タスク検出と台帳更新ルール

### 3.4 推奨アプローチ

- まず「必須語句/必須要素」の最小ルールを定義する
- 既存検証に段階導入（warning→error）して移行コストを管理する
- チェックリストと本文の同時更新を機械的に確認する

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                      | 発見経緯                                                           | 解決策                                           | 教訓                                         |
| ----------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------ | -------------------------------------------- |
| Part 1 の日常例え・理由先行が不足しやすい | 見出しは存在しても内容不足で再監査差し戻しが発生した               | Part 1 専用の必須要素をチェック項目化した        | 「章がある」だけでは品質保証にならない       |
| Part 2 の型/API/エッジケース記載漏れ      | 技術詳細の粒度が揃わず、再利用性が低下した                         | 型/API/エラーハンドリング/設定項目を必須化した   | 実装ガイドは再実装可能な粒度まで具体化が必要 |
| チェックリストと本文の不一致              | `phase-12-documentation.md` が完了でも本文が未更新の状態が発生した | チェックリスト完了と本文更新の同時検証を導入した | 完了判定は成果物実体との突合が必須           |

---

## 4. 実行手順

### Phase構成

- Phase A: 要件ルール定義
- Phase B: 検証ロジック実装
- Phase C: 運用反映と検証

### Phase A: 要件ルール定義

#### 目的

Task 1 の品質要件を機械判定可能な形式へ落とし込む。

#### 手順

1. Part 1/Part 2 の必須要件をチェック項目へ分解する
2. 判定基準（必須語句・セクション・表/コードブロック）を定義する
3. fail 条件と warning 条件を決定する

#### 成果物

- 品質ルール定義書

#### 完了条件

- ルールに基づいて pass/fail が一意に判定できる

### Phase B: 検証ロジック実装

#### 目的

品質ルールを自動検証へ組み込む。

#### 手順

1. 既存 `validate-phase-output.js` へチェックを追加する
2. 代表的なNGパターンのテストケースを追加する
3. 検証結果メッセージを改善する

#### 成果物

- 更新済み検証スクリプト
- テストケース

#### 完了条件

- NGパターンが正しく fail として検出される

### Phase C: 運用反映と検証

#### 目的

Phase 12運用へ品質ゲートを定着させる。

#### 手順

1. `phase-11-12-guide.md` / `phase-templates.md` に新チェックを反映する
2. サンプルワークフローで検証を実行する
3. 検出結果と修正方法をドキュメント化する

#### 成果物

- 更新済みガイド
- 検証ログ

#### 完了条件

- ルール運用で差し戻し対象を事前検出できる

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] Part 1/Part 2 の内容必須要件が機械検証できる
- [ ] 不足内容を具体的メッセージで出力できる
- [ ] 既存 Phase 12 検証フローに統合されている

### 品質要件

- [ ] 検証ルールが過検出/未検出にならないようテストされている
- [ ] 既存ワークフローへの互換性が維持されている
- [ ] 失敗時の修正ガイドが明記されている

### ドキュメント要件

- [ ] `task-specification-creator` の関連ガイドが更新されている
- [ ] システム仕様書側の未タスク台帳に登録されている

---

## 6. 検証方法

### テストケース

- Case 1: 理想的な `implementation-guide.md` で PASS
- Case 2: Part 1 から日常例えを削除して FAIL
- Case 3: Part 2 から型定義/API記述を削除して FAIL

### 検証手順

1. `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js <workflow-dir>`
2. `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow <workflow-dir> --strict --json`
3. `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`

---

## 7. リスクと対策

| リスク                                 | 影響度 | 発生確率 | 対策                                            |
| -------------------------------------- | ------ | -------- | ----------------------------------------------- |
| 判定ルールが厳しすぎて誤検出する       | 中     | 中       | warning モード導入後に error 化する             |
| 判定ルールが緩く抜け漏れが残る         | 中     | 中       | 再監査差し戻し事例を回帰テスト化する            |
| ドキュメント表現の多様性に追従できない | 低     | 中       | 必須要件は構造 + キーワードの複合条件で判定する |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`
- `.claude/skills/task-specification-creator/references/phase-templates.md`
- `.claude/skills/task-specification-creator/references/spec-update-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `docs/30-workflows/completed-tasks/ut-fix-skill-ipc-response-consistency-001/outputs/phase-12/implementation-guide.md`

### 参考資料

- `.claude/skills/task-specification-creator/scripts/validate-phase-output.js`
- `.claude/skills/task-specification-creator/assets/implementation-guide-template.md`
- `docs/30-workflows/unassigned-task/task-phase12-output-validation.md`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
implementation-guide.md は作成されていたが、Part 1（中学生向け日常例え・理由先行）と
Part 2（型/API/エッジケース/設定項目）の必須要件が不足していた。
```

### 補足事項

- 本タスクは「内容品質ゲート」の追加が目的であり、個別プロダクト機能の実装変更は対象外とする。
