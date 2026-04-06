# verify 関連ドキュメントの正本・履歴分離と責務分離明示 - タスク指示書

## メタ情報

```yaml
issue_number: 1916
```

## メタ情報

| 項目         | 内容                                                  |
| ------------ | ----------------------------------------------------- |
| タスクID     | UT-VERIFY-DOC-CONSOLIDATION-001                       |
| タスク名     | verify 関連ドキュメントの正本・履歴分離と責務分離明示 |
| 分類         | 改善                                                  |
| 対象機能     | aiworkflow-requirements / verify ドキュメント         |
| 優先度       | 中                                                    |
| 見積もり規模 | 小規模                                                |
| ステータス   | 完了                                                  |
| 完了日       | 2026-04-06                                            |
| 発見元       | TASK-P0-01 Phase 12 skill-feedback-report             |
| 発見日       | 2026-04-04                                            |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-P0-01（verify 実行エンジン Layer 1/2 コア + Layer 3/4 互換）の Phase 12 skill-feedback-report において、verify 関連ドキュメントの構造的課題が指摘された。現在、verify に関する情報は以下の 3 ファイルに分散している:

- `task-workflow.md` — タスク実行仕様書生成ガイド（親仕様書・インデックス）
- `task-workflow-completed.md` — 完了タスクの実行記録（completed records）
- `interfaces-skill-verify-contract.md` — verify 契約の Check ID 体系・Layer 定義

これら 3 ファイルの役割境界が曖昧であり、「どのファイルが正本（current contract）で、どのファイルが履歴記録（history record）か」を即座に判別できない状態にある。

### 1.2 問題点

1. **正本・履歴の判別困難**: `task-workflow.md` と `task-workflow-completed.md` の見出しレベルで current contract と history record が明確に区別されていない。実行者がどちらのファイルを参照・更新すべきか判断に時間を要する。
2. **責務分離の未明示**: `verifySkill()` は `RuntimeSkillCreatorVerifyCheck[]` 配列を返却する責務、`verifyAndImproveLoop()` は severity に基づく pass/fail ルーティングの責務を持つが、この責務分離が `task-workflow` 側のドキュメントに明示されていない。
3. **artifacts.json の同期手戻り**: root と outputs 配下の parity 同期において、正本がどちらか判別できずに手戻りが発生した実績がある。

### 1.3 放置時の影響

- 後続タスクで verify 関連作業を行う際、毎回「どのファイルを更新すべきか」を調査するオーバーヘッドが発生する
- 複数人が並行作業する場合、正本と履歴を取り違えた更新によるコンフリクトやデータ不整合が起きやすい
- `verifySkill()` と `verifyAndImproveLoop()` の責務境界が不明確なまま拡張が進み、責務の混在や不適切な呼び出しパターンが定着するリスクがある

---

## 2. 何を達成するか（What）

### 2.1 目的

verify 関連ドキュメント群において、正本（current contract）と履歴（history record）の境界を見出しレベルで明確化し、`verifySkill()` / `verifyAndImproveLoop()` の責務分離をドキュメントに明示する。

### 2.2 最終ゴール

1. 各ドキュメントの冒頭に「このファイルの役割」を 1 行で明記し、正本か履歴かを即座に判別可能にする
2. `interfaces-skill-verify-contract.md` に verify エンジンの責務分離セクションを追加する
3. `interfaces-skill-verify-contract.md` に current contract としての位置づけを明示する

### 2.3 スコープ

**対象:**

- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow-active.md`
- `.claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md`

**対象外:**

- verify エンジン本体のコード変更（`SkillCreatorVerificationEngine.ts` など）
- テストコードの変更
- 新規ドキュメントファイルの追加（既存ファイルの改善のみ）

### 2.4 成果物

| #   | 成果物                                                   | 形式     |
| --- | -------------------------------------------------------- | -------- |
| 1   | 正本・履歴の役割ラベルが見出しに追加された各ドキュメント | Markdown |
| 2   | verify 責務分離セクション（task-workflow 系に追記）      | Markdown |
| 3   | 各ファイル冒頭の役割明記（1 行サマリー）                 | Markdown |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `.claude/skills/aiworkflow-requirements/references/` 配下の対象ファイルが最新の main ブランチと同期されていること
- `interfaces-skill-verify-contract.md` の Check ID 体系（L1-001 〜 L4-003、全 19 件）が確定していること
- `RuntimeSkillCreatorFacade.ts` の `verifySkill()`（294行目）と `verifyAndImproveLoop()`（352行目）の現行実装を把握していること（これらは `SkillCreatorVerificationEngine.ts` ではなく Facade に実装されている）

### 3.2 依存タスク

| タスクID   | 関係                                                      | 状態 |
| ---------- | --------------------------------------------------------- | ---- |
| TASK-P0-01 | 発見元（verify エンジン Layer 1/2 コア + Layer 3/4 互換） | 完了 |
| TASK-P0-02 | verify -> improve -> re-verify 閉ループ                   | 完了 |

### 3.3 必要な知識

- `task-workflow.md` のインデックス構造と child companion の関係
- `RuntimeSkillCreatorFacade` のパブリック API（`verifySkill()` / `verifyAndImproveLoop()`）の責務
  - `verifySkill()`: 内部で `verificationEngine.verify(skillDir)` を呼び出し `RuntimeSkillCreatorVerifyCheck[]` を返す
  - `verifyAndImproveLoop()`: 検証結果の severity に基づいて improve ループを制御する
  - ※ これらのメソッドは `RuntimeSkillCreatorFacade.ts` に実装されており、`SkillCreatorVerificationEngine.ts` ではない
- `SkillCreatorVerificationEngine.verify()` が返す Check 配列構造と Layer 定義（19 件）
- `artifacts.json` root / outputs parity の概念

### 3.4 推奨アプローチ

1. **トップダウン方式**: まず `task-workflow.md` のインデックステーブルに「正本 / 履歴」列を追加し、全体像を整理してから個別ファイルを更新する
2. **見出しラベル統一**: 各ファイルの H1 または冒頭メタ情報に `[正本]` `[履歴]` `[契約仕様]` などのラベルを統一形式で付与する
3. **責務分離は表形式**: `verifySkill()` と `verifyAndImproveLoop()` の責務を比較表として記載し、一目で違いがわかるようにする

---

## 4. 実行手順

### Phase 1: 現状調査と設計（目安: 15分）

**目的:** 対象ドキュメントの現状構造を把握し、改善方針を確定する

**手順:**

1. `task-workflow.md` のインデックステーブルを読み、各 child companion の現在の役割記述（`> 役割:` 形式）を確認する
2. `task-workflow-completed.md` 冒頭の `> 役割: completed records` 記述を確認し、「区分: 履歴記録」の追記が必要かを判断する
3. `task-workflow-active.md` 冒頭の `> 役割: active guide` 記述を確認し、「区分: 正本」の追記が必要かを判断する
4. `interfaces-skill-verify-contract.md` の概要セクションを確認し、current contract としての明示有無を確認する
5. `RuntimeSkillCreatorFacade.ts` の `verifySkill()`（294行目）と `verifyAndImproveLoop()`（352行目）のシグネチャと責務を確認する
   - `verifySkill()` は `verificationEngine.verify()` を内部で呼び出すラッパーである点を把握する
6. 改善方針（ラベル形式、挿入位置、責務分離セクションの構成）を確定する

**成果物:**

- 改善方針メモ（改善対象箇所と変更内容の一覧）

**完了条件:**

- [ ] 全対象ファイルの現状構造を確認済み
- [ ] 改善方針が確定している

### Phase 2: 正本・履歴ラベルの付与（目安: 20分）

**目的:** 各ドキュメントに正本・履歴の役割ラベルを見出しレベルで明記する

**手順:**

1. `task-workflow.md` のインデックステーブルに「区分」列を追加し、各ファイルの正本 / 履歴 / 契約仕様を明記する
2. `task-workflow-completed.md` の冒頭に `> 区分: 履歴記録（history record）` を追記する
3. `task-workflow-active.md` の冒頭に `> 区分: 正本（current contract）` を追記する
4. `interfaces-skill-verify-contract.md` の冒頭に `> 区分: 契約仕様（current contract / Check ID 体系）` を追記する

**成果物:**

- 役割ラベルが付与された各ドキュメント

**完了条件:**

- [ ] 全対象ファイルに役割ラベルが付与されている
- [ ] インデックステーブルに「区分」列が追加されている

### Phase 3: 責務分離セクションの追記（目安: 20分）

**目的:** `verifySkill()` と `verifyAndImproveLoop()` の責務境界をドキュメントに明示する

**手順:**

1. `interfaces-skill-verify-contract.md` に「verify エンジン責務分離」セクションを追加する
2. 以下の責務比較表を記載する（実装は両者とも `RuntimeSkillCreatorFacade.ts` に存在する）:

| 関数名                   | 実装ファイル                        | 責務                                                      | 返却値                                      |
| ------------------------ | ----------------------------------- | --------------------------------------------------------- | ------------------------------------------- |
| `verifySkill()`          | `RuntimeSkillCreatorFacade.ts`      | `verificationEngine.verify()` を呼び出し Check 配列を返す | `RuntimeSkillCreatorVerifyCheck[]`          |
| `verifyAndImproveLoop()` | `RuntimeSkillCreatorFacade.ts`      | 検証結果の severity に基づく improve ループ制御           | `RuntimeSkillCreatorVerifyAndImproveResult` |
| `verify()`               | `SkillCreatorVerificationEngine.ts` | 19 件の Check を 4 Layer で実行し結果を収集する           | `RuntimeSkillCreatorVerifyCheck[]`          |

3. 責務分離の原則として以下を明記する:
   - `verifySkill()` は Facade の公開 API として外部から呼び出され、VerificationEngine の結果をガバナンスフック付きで中継する
   - `verifyAndImproveLoop()` は severity 判定と improve ループ制御を担い、`verifySkill()` を内部で繰り返し呼び出す
   - `verify()` は検証ロジックの本体であり、Facade からのみ呼び出される（外部公開しない）

**成果物:**

- 責務分離セクションが追記されたドキュメント

**完了条件:**

- [ ] 責務比較表が記載されている
- [ ] 責務分離の原則が自然言語で説明されている

### Phase 4: 整合性確認と最終レビュー（目安: 10分）

**目的:** 変更内容の整合性を確認し、既存の参照リンクが破損していないことを検証する

**手順:**

1. `task-workflow.md` のインデックスから各 child companion へのリンクが有効であることを確認する
2. 追加したラベルや区分列の書式が他のドキュメントと統一されていることを確認する
3. `interfaces-skill-verify-contract.md` の Check ID 体系（19 件）に影響がないことを確認する
4. Prettier によるフォーマット確認を行う

**成果物:**

- 整合性確認済みの最終版ドキュメント

**完了条件:**

- [ ] 全リンクが有効である
- [ ] フォーマットが統一されている
- [ ] Check ID 体系に影響がない

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `task-workflow.md` のインデックステーブルに「区分」列（正本 / 履歴 / 契約仕様）が追加されている
- [ ] `task-workflow-completed.md` の冒頭に履歴記録であることが明記されている
- [ ] `task-workflow-active.md` の冒頭に正本であることが明記されている
- [ ] `interfaces-skill-verify-contract.md` の冒頭に契約仕様（current contract）であることが明記されている
- [ ] `verifySkill()` / `verifyAndImproveLoop()` / `verify()` の3関数の実装ファイル・責務・返却値が表形式で明示されている

### 品質要件

- [ ] 既存のリンク参照が破損していない
- [ ] Prettier フォーマットに準拠している
- [ ] 見出しレベルの階層構造が論理的に整合している
- [ ] 追加テキストが既存のドキュメントスタイルと統一されている

### ドキュメント要件

- [ ] 新規ファイルを作成していない（既存ファイルの改善のみ）
- [ ] 変更内容が `task-workflow.md` のインデックスに反映されている

---

## 6. 検証方法

### テストケース

| #   | テストケース                                       | 期待結果                                                                                             |
| --- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| 1   | `task-workflow.md` のインデックステーブルを確認    | 全エントリに「区分」列が存在し値が設定されている                                                     |
| 2   | `task-workflow-completed.md` の冒頭 5 行を確認     | 「履歴記録」を示すラベルが含まれている                                                               |
| 3   | `task-workflow-active.md` の冒頭 5 行を確認        | 「正本」を示すラベルが含まれている                                                                   |
| 4   | `interfaces-skill-verify-contract.md` の冒頭を確認 | 「契約仕様」を示すラベルが含まれている                                                               |
| 5   | 責務分離セクションの比較表を確認                   | `verifySkill()` / `verifyAndImproveLoop()` / `verify()` の実装ファイル・責務・返却値が記載されている |
| 6   | `task-workflow.md` 内のリンクを全件クリック        | 全リンクが有効なファイルを指している                                                                 |

### 検証手順

1. 対象 4 ファイルを開き、冒頭の役割ラベルが統一形式で記載されていることを目視確認する
2. `task-workflow.md` のインデックステーブルに「区分」列があることを確認する
3. 責務分離セクションの比較表が正確であることを `RuntimeSkillCreatorFacade.ts`（`verifySkill` 294行目, `verifyAndImproveLoop` 352行目）のコードと照合する
4. Prettier を実行し差分が出ないことを確認する

---

## 7. リスクと対策

| #   | リスク                                     | 影響度 | 発生確率 | 対策                                                           |
| --- | ------------------------------------------ | ------ | -------- | -------------------------------------------------------------- |
| 1   | 既存リンク参照の破損                       | 中     | 低       | 見出し文言の変更は最小限に留め、既存のアンカーを維持する       |
| 2   | 他の作業者との競合（同ファイルを並行編集） | 中     | 中       | 作業開始前に main ブランチと同期し、変更範囲を事前共有する     |
| 3   | ラベル形式の不統一                         | 低     | 低       | Phase 1 で形式を確定し、全ファイルで同一テンプレートを使用する |
| 4   | 責務分離の記述が実装と乖離                 | 中     | 低       | 記述後にコードのシグネチャと照合する検証ステップを設ける       |

---

## 8. 参照情報

### 関連ドキュメント

| ファイル                                                                                    | 役割                          |
| ------------------------------------------------------------------------------------------- | ----------------------------- |
| `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | 親仕様書・インデックス        |
| `.claude/skills/aiworkflow-requirements/references/task-workflow-active.md`                 | アクティブガイド（正本）      |
| `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`              | 完了記録（履歴）              |
| `.claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md`     | verify 契約 Check ID 体系     |
| `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts`                  | verify エンジン実装           |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                       | Facade（verify 呼び出し元）   |
| `docs/30-workflows/completed-tasks/step-09-par-task-p0-01-verify-execution-engine-layer12/` | TASK-P0-01 成果物ディレクトリ |

### 参考資料

- TASK-P0-01 Phase 12 skill-feedback-report（改善提案の発見元）
- TASK-P0-02 verify -> improve -> re-verify 閉ループ仕様

---

## 9. 備考

### 苦戦箇所（TASK-P0-01 での知見）

artifacts.json の root/outputs parity 同期で手戻りが発生。正本と履歴の判別が困難で更新対象ファイルの選定に迷いが生じた。具体的には:

- `artifacts.json`（root）と `outputs/artifacts.json` のどちらが正本か即座に判別できず、一方を更新した後にもう一方との parity が崩れていることに気づいて手戻りした
- `task-workflow.md` のインデックスには「役割」列が存在するが、「正本か履歴か」という観点での区分がなく、実行者が毎回ファイル内容を読んで判断する必要があった
- `verifySkill()` と `verifyAndImproveLoop()` の責務境界がコード上は明確だが、ドキュメント上に明示されていないため、どちらの関数がどの検証フェーズを担当するか確認に時間を要した

この知見を踏まえ、本タスクでは「見出しレベルでの正本・履歴の明示」と「責務分離の表形式での明示」を改善方針とする。
