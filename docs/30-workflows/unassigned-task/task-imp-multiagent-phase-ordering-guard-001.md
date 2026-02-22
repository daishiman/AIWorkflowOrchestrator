# マルチエージェントPhase依存順序ガード - タスク指示書

## メタ情報

```yaml
issue_number: 855
```

## メタ情報

| 項目         | 内容                                           |
| ------------ | ---------------------------------------------- |
| タスクID     | UT-IMP-MULTIAGENT-PHASE-ORDERING-GUARD-001     |
| タスク名     | マルチエージェントPhase依存順序ガード          |
| 分類         | 改善                                           |
| 対象機能     | task-specification-creator executeワークフロー |
| 優先度       | 中                                             |
| 見積もり規模 | 中規模                                         |
| ステータス   | 未実施                                         |
| 発見元       | Phase実行プロセス                              |
| 発見日       | 2026-02-21                                     |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UT-FIX-SKILL-REMOVE-INTERFACE-001タスクの初回実行時に、task-specification-creatorのexecuteモードで5つのエージェントを並列起動してPhase 1-12を実行したところ、Phase依存順序が守られなかった。

現在のtask-specification-creatorスキル（`.claude/rules/05-task-execution.md`）では「Phase 1-3 / Phase 4-7 / Phase 8-10 / Phase 11 / Phase 12の並列実行」を推奨しているが、グループ間の依存順序を強制するメカニズムが存在しない。各Phaseグループを個別のエージェントに割り当てて並列起動した場合、先行グループの完了を待たずに後続グループが実行を開始する。

### 1.2 問題点・課題

| #   | 問題                                                  | 具体的な影響                                                                                                                                                   |
| --- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Phaseグループ間の依存順序が強制されない               | Phase 4-7エージェント（テスト作成→カバレッジ確認）がPhase 1-3エージェント（要件定義→設計レビュー）より先に完了し、「要件定義前に実装」という原則違反が発生した |
| 2   | Phase 3（設計レビューゲート）の結果が後続に伝播しない | 設計レビューでMAJOR判定が出た場合、Phase 4以降のエージェントが既に実行中のため手戻りコストが増大する                                                           |
| 3   | Phase 10（最終レビューゲート）の結果が反映されない    | 最終レビューでCRITICAL判定が出ても、Phase 11-12が既に進行中となる可能性がある                                                                                  |
| 4   | TaskツールのblockedByが起動タイミングに間に合わない   | タスク作成順序のずれにより、blockedBy設定前にエージェントが実行を開始するケースがある                                                                          |

### 1.3 放置した場合の影響

- **品質リスク**: 要件定義・設計レビュー前にテストコードや実装が生成され、要件と乖離した成果物が作成される
- **手戻りコスト増大**: Phase 3/Phase 10のレビューゲートでMAJOR/CRITICAL判定が出た場合、後続グループの成果物が全て無駄になる
- **ワークフローの信頼性低下**: Phase 1-13の段階的品質保証プロセスが形骸化し、タスク実行の再現性が失われる
- **ユーザー信頼の毀損**: 「要件定義よりも先に実装したらダメ」というフィードバックが示すように、開発プロセスの基本原則への違反が可視化される

---

## 2. 何を達成するか（What）

### 2.1 目的

task-specification-creatorのexecuteワークフローに「Phase Group Barrier」メカニズムを追加し、複数エージェントによるPhase並列実行時にグループ間の依存順序を強制する。

### 2.2 最終ゴール

1. Phase Group間の依存順序が自動的に強制される（Group A完了前にGroup Bが開始されない）
2. Phase 3（設計レビューゲート）のPASS判定がGroup B開始の前提条件として組み込まれる
3. Phase 10（最終レビューゲート）のPASS判定がGroup D開始の前提条件として組み込まれる
4. Group内のPhaseは引き続き並列実行可能であり、効率性が維持される

### 2.3 スコープ

#### 含むもの

- Phase Group定義の明文化（Group A〜E）
- Phase Group Barrierメカニズムの設計と実装
- TaskツールのblockedByを活用した依存チェーン自動設定ロジック
- レビューゲート判定（Phase 3/Phase 10）の次Group開始条件への組み込み
- execute-workflow.mdの更新（Barrierメカニズムの手順追加）
- patterns.mdへの失敗パターン追加（Phase依存順序違反）

#### 含まないもの

- Phase 1-13の個別Phase内容の変更
- task-specification-creator以外のスキルへの影響
- TaskツールAPI自体の拡張
- Claude Code本体の機能変更

### 2.4 成果物

| #   | 成果物                                    | 説明                                                        |
| --- | ----------------------------------------- | ----------------------------------------------------------- |
| 1   | `execute-workflow.md` 更新                | Phase Group Barrierの手順・ルール追加                       |
| 2   | `patterns.md` 更新                        | Phase依存順序違反の失敗パターン追加                         |
| 3   | `phase-templates.md` 更新                 | Phase Group定義テーブルの追加                               |
| 4   | `05-task-execution.md` 更新               | 並列実行の推奨セクションにBarrierメカニズム記述追加         |
| 5   | Phase Group Barrierプロンプトテンプレート | エージェント起動時に使用するGroup依存チェーン設定プロンプト |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- task-specification-creatorスキルの現在のexecuteワークフローを理解していること
- TaskツールのblockedByパラメータの動作を理解していること
- Phase 3（設計レビューゲート）とPhase 10（最終レビューゲート）の判定基準を理解していること

### 3.2 依存タスク

| 依存                              | 種別     | 理由                                  |
| --------------------------------- | -------- | ------------------------------------- |
| UT-FIX-SKILL-REMOVE-INTERFACE-001 | 完了済み | Phase依存順序違反が発見された元タスク |

### 3.3 必要な知識

- **task-specification-creator executeワークフロー**: `.claude/skills/task-specification-creator/references/execute-workflow.md` に記載のPhase実行手順
- **TaskツールAPI**: `blockedBy`パラメータによるタスク間依存制御
- **レビューゲート基準**: `.claude/skills/task-specification-creator/references/review-gate-criteria.md` に記載のPASS/MINOR/MAJOR/CRITICAL判定基準
- **Claude Code Teamメカニズム**: TeamCreate/TaskCreate/SendMessageによるマルチエージェント協調

### 3.4 推奨アプローチ

#### 3.4.1 Phase Group定義

以下の5つのPhase Groupを定義する:

| Group | Phase範囲  | 名称                       | 依存先Group | ゲート条件                               |
| ----- | ---------- | -------------------------- | ----------- | ---------------------------------------- |
| A     | Phase 1-3  | 要件定義・設計・レビュー   | なし        | なし（最初に実行）                       |
| B     | Phase 4-7  | テスト・実装・カバレッジ   | A           | Group A完了 かつ Phase 3 PASS/MINOR判定  |
| C     | Phase 8-10 | リファクタリング・品質検証 | B           | Group B完了                              |
| D     | Phase 11   | 手動テスト                 | C           | Group C完了 かつ Phase 10 PASS/MINOR判定 |
| E     | Phase 12   | ドキュメント               | C           | Group C完了 かつ Phase 10 PASS/MINOR判定 |

- Group D と Group E は Group C 完了後に並列実行可能
- Phase 3でMAJOR判定の場合、Phase 1またはPhase 2へ戻る（Group B以降は起動しない）
- Phase 10でMAJOR/CRITICAL判定の場合、影響範囲に応じてPhase 1-5へ戻る（Group D/Eは起動しない）

#### 3.4.2 Barrierメカニズムの実装方式

**方式: Sequential Group Launch with Barrier Check**

エージェントを5つ同時起動するのではなく、Group単位で順次起動する:

1. **Group A起動**: Phase 1-3エージェントを起動
2. **Barrier A→B**: Group A完了を確認し、Phase 3のレビューゲート判定を確認
   - PASS/MINOR → Group Bを起動
   - MAJOR → Phase 1またはPhase 2へ戻る（Group A内で再実行）
3. **Group B起動**: Phase 4-7エージェントを起動
4. **Barrier B→C**: Group B完了を確認し、Group Cを起動
5. **Group C起動**: Phase 8-10エージェントを起動
6. **Barrier C→D/E**: Group C完了を確認し、Phase 10のレビューゲート判定を確認
   - PASS/MINOR → Group D と Group E を並列起動
   - MAJOR/CRITICAL → 影響範囲に応じた戻り先へ移行
7. **Group D/E並列起動**: Phase 11エージェントとPhase 12エージェントを並列起動

#### 3.4.3 TaskツールblockedByの活用

Team/Task機能でBarrierを実現する手順:

```
1. TeamCreate でチームを作成
2. Group A のタスクを TaskCreate で作成（blockedByなし）
3. Group B のタスクを TaskCreate で作成（blockedByにGroup Aのタスクを指定）
4. Group C のタスクを TaskCreate で作成（blockedByにGroup Bのタスクを指定）
5. Group D/E のタスクを TaskCreate で作成（blockedByにGroup Cのタスクを指定）
6. Group A のエージェントを Task tool で起動
7. Group A 完了後、レビューゲート判定を確認してから Group B のエージェントを起動
   （blockedByが解消されるまでGroup Bエージェントは待機）
```

重要: **全タスクの作成をエージェント起動前に完了させる**。これにより、blockedBy設定が確実に反映された状態でエージェントが開始される。

#### 3.4.4 プロンプトテンプレートへの組み込み

executeワークフローのプロンプトテンプレートに以下のBarrier指示を追加する:

```
## Phase Group Barrier ルール

1. Phase Groupは以下の順序で実行すること:
   Group A (1-3) → Group B (4-7) → Group C (8-10) → Group D (11) / Group E (12)

2. 次のGroupを開始する前に、前のGroupの全Phaseが完了していることを確認すること

3. レビューゲート確認:
   - Phase 3完了後: PASS/MINOR判定を確認してからGroup Bを開始
   - Phase 10完了後: PASS/MINOR判定を確認してからGroup D/Eを開始

4. MAJOR/CRITICAL判定の場合は戻り先Phaseへ移行し、後続Groupは起動しないこと
```

### 3.5 実装課題と解決策（親タスクからの教訓）

UT-FIX-SKILL-REMOVE-INTERFACE-001の初回実行で以下の課題が判明した。本タスクの設計にこれらの教訓を反映する。

#### 課題1: blockedBy設定前のエージェント実行開始

| 項目     | 内容                                                                                                                                                                                  |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題     | TaskツールのblockedByパラメータを使用してPhaseグループ間の依存を設定したが、5エージェント並列起動時にタスク作成の順序がずれ、blockedBy設定前にエージェントが実行を開始した            |
| 発見経緯 | 5つのエージェントを同時起動した直後、Phase 4-7エージェントがPhase 1-3の完了を待たずにテストコード生成を開始した。タスク依存関係の設定が間に合わなかった                               |
| 解決策   | 全タスク（Group A〜E）の作成とblockedBy設定を**エージェント起動前に完了**させる。タスク作成フェーズとエージェント起動フェーズを明確に分離する                                         |
| 教訓     | TaskツールのblockedByは「タスク作成時に設定する」ものであり、エージェントと同時に設定すると競合状態が発生する。タスクグラフの構築を先に完了させてからエージェントを起動する順序が重要 |

#### 課題2: 要件定義前のテストコード生成

| 項目     | 内容                                                                                                                                                               |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 課題     | 5エージェント同時起動は効率的だが、Phase 1が完了する前にPhase 4のテストコードが生成され、要件と乖離したテストが作成されるリスクがあった                            |
| 発見経緯 | Phase 4-7エージェントがPhase 1-3エージェントより先に完了し、ユーザーから「要件定義よりも先に実装したらダメ」というフィードバックを受けた                           |
| 解決策   | Phase Group Barrierメカニズムにより、Group A（Phase 1-3）の完了をGroup B（Phase 4-7）の開始条件として強制する。設計レビュー（Phase 3）のPASS判定も開始条件に含める |
| 教訓     | 並列実行の効率性と段階的品質保証はトレードオフの関係にある。Group内の並列は安全だが、Group間の並列は品質リスクを生む。Barrierによるグループ間制御が必要            |

#### 課題3: 並列効率と依存順序の両立困難

| 項目     | 内容                                                                                                                                                                                     |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題     | 2回目の実行ではPhase依存チェーンを厳守して順次実行したが、並列実行の効率メリットを活かせなかった                                                                                         |
| 発見経緯 | 初回の失敗を受け、全Phaseを1エージェントで順次実行する方式に切り替えた。依存順序は守られたが、並列化による時間短縮効果が失われた                                                         |
| 解決策   | Group内のPhaseは並列実行可能な設計を維持する。Group A内のPhase 1→2→3は順次だが、Group B内のPhase 4と5は並列可能（テスト作成と実装は独立性が高い場合）。Group D/EのPhase 11と12は並列可能 |
| 教訓     | 「全部並列」でも「全部順次」でもなく、「Group間は順次、Group内は並列」というハイブリッド方式が最適解。Barrier粒度をGroup単位に設定することで、安全性と効率性を両立できる                 |

---

## 4. 実行手順

### Phase構成

本タスクはtask-specification-creatorスキル自体の改善タスクであり、以下の4 Phaseで実行する:

| Phase | 名称                 | 目的                                                  |
| ----- | -------------------- | ----------------------------------------------------- |
| 1     | 現状分析             | 現在のexecuteワークフローと並列実行の問題点を整理する |
| 2     | ガードメカニズム設計 | Phase Group Barrierメカニズムの詳細設計を行う         |
| 3     | 実装                 | 仕様書・テンプレート・ルールファイルを更新する        |
| 4     | 検証                 | 更新内容の整合性と実効性を検証する                    |

### Phase 1: 現状分析

#### 目的

現在のexecuteワークフローにおけるPhase並列実行の仕組みと問題点を整理し、改善ポイントを明確化する。

#### 手順

1. `.claude/skills/task-specification-creator/references/execute-workflow.md` を読み、現在の並列実行推奨セクションの内容を確認する
2. `.claude/rules/05-task-execution.md` の「並列実行の推奨」セクションの記述を確認する
3. `.claude/skills/task-specification-creator/references/phase-templates.md` のPhase間依存関係を確認する
4. `.claude/skills/task-specification-creator/references/review-gate-criteria.md` のゲート判定フローを確認する
5. UT-FIX-SKILL-REMOVE-INTERFACE-001の実行ログ（初回・2回目）から具体的な問題事象を整理する

#### 成果物

- 現状分析レポート（Phase依存関係マップ、問題事象一覧）

#### 完了条件

- [ ] 現在の並列実行推奨の記述箇所が全て特定されている
- [ ] 問題事象（依存順序違反の具体例）が3件以上列挙されている
- [ ] レビューゲート判定が並列実行に与える影響が整理されている

### Phase 2: ガードメカニズム設計

#### 目的

Phase Group Barrierメカニズムの詳細設計を行い、既存のワークフローとの統合方針を決定する。

#### 手順

1. Phase Group定義（Group A〜E）を確定する
2. Barrier Check の判定ロジックを設計する（レビューゲート判定の組み込み方法）
3. TaskツールblockedByとの連携方法を設計する（タスク作成→依存設定→エージェント起動の順序）
4. エージェント起動プロンプトテンプレートにBarrierルールを追加する設計を行う
5. 異常系フロー（MAJOR/CRITICAL判定時の戻りフロー）を設計する

#### 成果物

- Phase Group Barrier設計書（Group定義、Barrier条件、異常系フロー図）

#### 完了条件

- [ ] 5つのPhase Group定義が確定している
- [ ] 各Barrier条件（ゲート判定含む）が明記されている
- [ ] 異常系フロー（MAJOR/CRITICAL時の戻り先）が設計されている
- [ ] TaskツールblockedByの使用手順が具体的に記述されている

### Phase 3: 実装

#### 目的

設計に基づき、仕様書・テンプレート・ルールファイルを更新する。

#### 手順

1. `execute-workflow.md` に「Phase Group Barrier」セクションを追加する
   - Group定義テーブル
   - Barrier Check手順（Sequential Group Launch）
   - レビューゲート判定の統合方法
   - 異常系フロー（戻りフロー）
2. `phase-templates.md` にPhase Group定義テーブルを追加する
3. `patterns.md` の失敗パターンセクションに「Phase依存順序違反」を追加する
   - 状況: 5エージェント並列でPhase 1-12を実行
   - 問題: Phase 4-7がPhase 1-3より先に完了
   - 解決: Phase Group Barrierメカニズム
4. `05-task-execution.md` の「並列実行の推奨」セクションを更新する
   - Group間はBarrier制御必須の記述を追加
   - Group内の並列実行は引き続き推奨の旨を記述
5. エージェント起動プロンプトテンプレートにBarrierルール指示を追加する

#### 成果物

- 更新された `execute-workflow.md`
- 更新された `phase-templates.md`
- 更新された `patterns.md`
- 更新された `05-task-execution.md`
- Phase Group Barrierプロンプトテンプレート

#### 完了条件

- [ ] `execute-workflow.md` にPhase Group Barrierセクションが追加されている
- [ ] `phase-templates.md` にGroup定義テーブルが追加されている
- [ ] `patterns.md` にPhase依存順序違反の失敗パターンが追加されている
- [ ] `05-task-execution.md` の並列実行セクションがBarrier制御の記述を含んでいる
- [ ] プロンプトテンプレートにBarrierルール指示が含まれている

### Phase 4: 検証

#### 目的

更新内容の整合性を検証し、Barrierメカニズムが実効性を持つことを確認する。

#### 手順

1. 更新された全ファイルの内容整合性を確認する（Group定義が全ファイルで一致しているか）
2. Barrierメカニズムの手順を読み上げ検証する（手順どおりに実行した場合、依存順序が守られるか）
3. 異常系フロー（MAJOR/CRITICAL判定）のシナリオを検証する
4. 既存のPhase 1-13概要テーブルとの矛盾がないか確認する
5. レビューゲート基準（review-gate-criteria.md）との整合性を確認する

#### 成果物

- 検証結果レポート

#### 完了条件

- [ ] 全更新ファイルのGroup定義が一致している
- [ ] 正常系シナリオ（PASS判定）で依存順序が守られることが確認されている
- [ ] 異常系シナリオ（MAJOR/CRITICAL判定）で戻りフローが正しく機能することが確認されている
- [ ] 既存のPhase 1-13概要テーブルとの矛盾がない

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] Phase Group定義（Group A〜E）がexecute-workflow.mdに明記されている
- [ ] Phase Group Barrierメカニズムの手順がexecute-workflow.mdに記載されている
- [ ] Phase 3（設計レビューゲート）のPASS判定がGroup B開始条件に組み込まれている
- [ ] Phase 10（最終レビューゲート）のPASS判定がGroup D/E開始条件に組み込まれている
- [ ] TaskツールblockedByの使用手順が具体的に記載されている
- [ ] 異常系フロー（MAJOR/CRITICAL判定時の戻りフロー）が記載されている
- [ ] Group内の並列実行可能性が維持されている

### 品質要件

- [ ] 100人中100人が同じ理解でBarrierメカニズムを実行できる粒度で記述されている
- [ ] patterns.mdにPhase依存順序違反の失敗パターンが追加されている
- [ ] 既存のPhase 1-13ワークフローとの整合性が確認されている
- [ ] レビューゲート基準との整合性が確認されている

### ドキュメント要件

- [ ] execute-workflow.mdが更新されている
- [ ] phase-templates.mdが更新されている
- [ ] patterns.mdが更新されている
- [ ] 05-task-execution.mdが更新されている
- [ ] エージェント起動プロンプトテンプレートが作成されている

---

## 6. 検証方法

### テストケース

#### TC-1: 正常系 - PASS判定フロー

```
1. Group A（Phase 1-3）を実行する
2. Phase 3でPASS判定が出ることを確認する
3. Group B（Phase 4-7）が開始されることを確認する
4. Group B完了後、Group C（Phase 8-10）が開始されることを確認する
5. Phase 10でPASS判定が出ることを確認する
6. Group D（Phase 11）とGroup E（Phase 12）が並列で開始されることを確認する
```

期待結果: 全Groupが依存順序どおりに実行され、全Phase完了

#### TC-2: 異常系 - Phase 3 MAJOR判定フロー

```
1. Group A（Phase 1-3）を実行する
2. Phase 3でMAJOR判定が出る
3. Group Bが起動されないことを確認する
4. Phase 1またはPhase 2への戻りが実行されることを確認する
```

期待結果: Group Bは起動されず、Group A内で修正→再レビューが実行される

#### TC-3: 異常系 - Phase 10 CRITICAL判定フロー

```
1. Group A→B→Cの順で正常に完了する
2. Phase 10でCRITICAL判定が出る
3. Group D/Eが起動されないことを確認する
4. Phase 1への戻りが実行されることを確認する
```

期待結果: Group D/Eは起動されず、Phase 1から再実行される

#### TC-4: Barrier制御 - blockedBy設定の事前完了

```
1. 全Groupのタスクを先に作成する（TaskCreate × 5）
2. blockedBy設定が全タスクに反映されていることを確認する（TaskList）
3. Group Aのエージェントのみを起動する
4. Group B〜Eのタスクがblocked状態であることを確認する
```

期待結果: エージェント起動前に全タスクの依存関係が確立されている

### 検証手順

1. 更新された仕様書群を読み上げ、手順の抜け漏れがないか確認する
2. 小規模なタスク（1ファイル修正程度）で実際にBarrierメカニズムを適用し、Group間の依存順序が守られることを確認する
3. 意図的にPhase 3でMAJOR判定を出し、Group Bが起動されないことを確認する

---

## 7. リスクと対策

| #   | リスク                                                         | 影響度 | 発生確率 | 対策                                                                                                                |
| --- | -------------------------------------------------------------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------- |
| 1   | Barrierメカニズムが複雑すぎてスキル利用者が理解できない        | 中     | 中       | execute-workflow.mdにシンプルなフローチャートを追加し、手順を5ステップ以内に簡潔化する                              |
| 2   | Group間の待機時間により全体の実行時間が増加する                | 低     | 高       | Group内の並列実行を維持し、Barrier待機は最小限に抑える。Group D/Eの並列実行で部分的に相殺する                       |
| 3   | TaskツールのblockedByメカニズムが将来のAPI変更で動作しなくなる | 中     | 低       | blockedByに依存しないフォールバック手順（手動確認フロー）も文書化する                                               |
| 4   | レビューゲート判定の自動取得が困難（手動確認が必要）           | 低     | 中       | Phase 3/Phase 10の成果物にゲート判定結果を明記するルールを追加し、次Groupのエージェントがプロンプトで参照可能にする |
| 5   | P43（rate limit中断）との複合でBarrier制御が破綻する           | 中     | 低       | 各Group内のエージェントは3ファイル以下/エージェントに分割する（P43教訓の適用）                                      |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                                                                   | 関係     | 説明                                                |
| ------------------------------------------------------------------------------ | -------- | --------------------------------------------------- |
| `.claude/skills/task-specification-creator/references/execute-workflow.md`     | 更新対象 | Phase実行ワークフロー（Barrier追加先）              |
| `.claude/skills/task-specification-creator/references/phase-templates.md`      | 更新対象 | Phase別テンプレート（Group定義追加先）              |
| `.claude/skills/task-specification-creator/references/patterns.md`             | 更新対象 | 失敗パターン集（Phase依存順序違反追加先）           |
| `.claude/rules/05-task-execution.md`                                           | 更新対象 | Phase 1-13概要・並列実行の推奨セクション            |
| `.claude/skills/task-specification-creator/references/review-gate-criteria.md` | 参照     | レビューゲート判定基準（PASS/MINOR/MAJOR/CRITICAL） |

### 関連タスク

| タスクID                          | 関係   | 説明                                  |
| --------------------------------- | ------ | ------------------------------------- |
| UT-FIX-SKILL-REMOVE-INTERFACE-001 | 発見元 | Phase依存順序違反が発見された元タスク |

### 関連Pitfall

| Pitfall ID | タイトル                                 | 関連性                                       |
| ---------- | ---------------------------------------- | -------------------------------------------- |
| P43        | Phase 12サブエージェントのrate limit中断 | 並列実行時のエージェント分割粒度に関する教訓 |

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
UT-FIX-SKILL-REMOVE-INTERFACE-001 初回実行時ユーザーフィードバック:
「要件定義よりも先に実装したらダメ」

発生状況:
- 5つのエージェントを並列起動してPhase 1-12を実行
- Phase 4-7エージェント（テスト作成→カバレッジ確認）がPhase 1-3エージェント（要件定義→設計レビュー）より先に完了
- 要件定義・設計が未確定の状態でテストコードが生成された
```

### 補足事項

- 本指示書は未実施タスクとして `docs/30-workflows/unassigned-task/` に配置する
- 完了時は `completed-tasks/unassigned-task/` へ移管し、`task-workflow.md` の参照先を同時更新する
- 本タスクの成果物はtask-specification-creatorスキルの仕様書（`.claude/skills/`配下）の更新であり、プロダクションコードの変更は含まない
- 2回目の実行では全Phaseを1エージェントで順次実行する方式で成功したが、この方式では並列実行の効率メリットが活かせなかった。本タスクにより「Group間順次・Group内並列」のハイブリッド方式を標準化する
