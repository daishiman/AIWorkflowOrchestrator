# UT-IMP-PHASE12-WORKFLOW12-IMPLEMENTATION-GUIDE-001 - Workflow12 実装ガイド欠落是正タスク

## メタ情報

| 項目         | 内容                                                                                |
| ------------ | ----------------------------------------------------------------------------------- |
| タスクID     | UT-IMP-PHASE12-WORKFLOW12-IMPLEMENTATION-GUIDE-001                                  |
| タスク名     | Workflow12（Agent Execute Skill Concurrency Guard）の Phase 12 実装ガイド欠落を是正 |
| 分類         | 改善（ドキュメント補完）                                                            |
| 対象機能     | スキル実行の並行性制御ガード                                                        |
| 優先度       | 中                                                                                  |
| 見積もり規模 | 小規模                                                                              |
| ステータス   | 未実施                                                                              |
| 発見元       | 2026-03-07 branch横断 Phase 12 再監査                                               |
| 発見日       | 2026-03-07                                                                          |
| 依存タスク   | 12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001                               |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001` はスキル実行時の並行性制御（同時実行防止）を実装するタスクだが、構造検証は PASS しているものの Phase 12 必須の `implementation-guide.md` が欠落している。

### 1.2 問題点

- `validate-phase12-implementation-guide` スクリプトが FAIL する
- 並行性制御の設計思想（なぜ必要か、どう動くか）がドキュメント化されていない

### 1.3 放置した場合の影響

- 並行性制御のロジック変更時に設計意図が分からず、デグレが発生するリスク
- 新規開発者がコンカレンシーガードの目的を理解するのに時間がかかる

---

## 2. 何を達成するか（What）

### 2.1 目的

Phase 12 の implementation-guide.md を Part 1/Part 2 構成で作成し、validator PASS にする。

### 2.2 スコープ

#### 含むもの

- `outputs/phase-12/implementation-guide.md` の作成（Part 1: 概念説明 / Part 2: 技術詳細）
- Phase 12 必須成果物の補完（未作成分）
- `artifacts.json` 更新

#### 含まないもの

- 並行性制御の実装コード変更
- 他ワークフローの修正

### 2.3 成果物

- `outputs/phase-12/implementation-guide.md`
- Phase 12 必須成果物の補完分
- 更新された `artifacts.json`

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `task-specification-creator` の Phase 12 テンプレートを参照可能
- 並行性制御の基本概念（mutex, semaphore, lock）の知識

### 3.2 推奨アプローチ

1. Phase 1-5 を読んで並行性制御の設計を理解
2. Part 1: 「銀行のATM」例え（1台のATMに2人同時に操作できない → スキル実行も1つずつ順番に）
3. Part 2: ガード実装の型定義、API、状態遷移、エッジケース（タイムアウト、キャンセル）

### 3.3 実装時の苦戦箇所と解決策（親タスクからの教訓）

| #   | 課題                                        | 発見経緯                                                  | 解決策                                                                     | 教訓（標準ルール）                                                                           |
| --- | ------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| 1   | 並行性制御の「日常例え」が難しい            | mutex/semaphore は日常にない概念                          | ATM、トイレの個室、料理のコンロなど「1つずつしか使えない」リソースで例える | 抽象的な技術概念は「物理的な制約」で例えると伝わりやすい                                     |
| 2   | 構造検証PASSでもPhase 12成果物が欠落        | validator が Phase 構造と Phase 12 成果物を別々にチェック | 両方の validator を必ず実行する                                            | `validate-phase-output` + `validate-phase12-implementation-guide` はセットで実行             |
| 3   | 2パート形式だけ満たして内容不足になるリスク | 過去タスクで Part 2 が型定義の列挙だけだった              | 使用例、エッジケース、エラーハンドリングを必須セクションに含める           | Part 2 は最低6セクション（型定義/API/使用例/エラーハンドリング/エッジケース/定数一覧）を含む |

---

## 4. 実行手順

### Phase 1: 設計理解

1. Phase 1-2 の設計仕様書を Read
2. 並行性制御のアーキテクチャ（ガード配置、状態管理）を把握

### Phase 2: 実装ガイド作成

1. Part 1: 概念説明（中学生レベル）
   - 日常例え: 「銀行のATM」（1人ずつしか使えない）
   - なぜ必要か: スキルが同時に2つ動くとデータが壊れる
   - どう動くか: 「今使用中です」の表示が出て待つ
2. Part 2: 技術詳細
   - 型定義（ConcurrencyGuard, ExecutionLock）
   - API（acquireLock, releaseLock, isLocked）
   - 使用例（executeSkillWithGuard）
   - エラーハンドリング（タイムアウト、デッドロック防止）
   - エッジケース（プロセスクラッシュ時のロック解放）
   - 定数一覧（MAX_CONCURRENT_EXECUTIONS, LOCK_TIMEOUT_MS）

### Phase 3: 成果物補完

1. Phase 12 必須成果物5点の存在確認
2. 欠落分を作成
3. `artifacts.json` 更新

### Phase 4: 検証

1. `validate-phase12-implementation-guide` 実行
2. PASS 確認

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `implementation-guide.md` が Part 1/Part 2 構成で作成されている
- [ ] Part 1 に日常例え（中学生レベル）が含まれている
- [ ] Part 2 に型定義/API/使用例/エラーハンドリング/エッジケース/定数一覧の6セクションが含まれている

### 品質要件

- [ ] `validate-phase12-implementation-guide` が PASS（10/10）
- [ ] `artifacts.json` と `outputs/artifacts.json` が同期

### ドキュメント要件

- [ ] `documentation-changelog.md` に変更内容が記録されている

---

## 6. 検証方法

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001
```

---

## 7. リスクと対策

| リスク                          | 影響度 | 発生確率 | 対策                                                            |
| ------------------------------- | ------ | -------- | --------------------------------------------------------------- |
| 並行性制御の設計意図を誤解      | 中     | 低       | Phase 1-2 の設計仕様書を必ず読んでから執筆                      |
| 2パート形式だけ満たして内容不足 | 中     | 中       | validator 10/10 を完了条件に固定 + Part 2 は6セクション必須     |
| 日常例えが不適切                | 低     | 中       | 「ATM」「トイレの個室」など複数の例えを用意して最適なものを選択 |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001/` — 対象ワークフロー
- `.claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js` — 検証スクリプト

### システム仕様書参照

- `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` — 状態管理パターン
- `.claude/skills/aiworkflow-requirements/references/error-handling.md` — エラーハンドリング
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` — branch横断再監査の教訓

### 既知の落とし穴

- `.claude/rules/06-known-pitfalls.md` — P5（リスナー二重登録）、P13（タイマーテスト無限ループ）

---

## 9. 備考

### 実装方針

- コード変更なし、ドキュメント補完のみ
- Part 1 は「銀行のATMで1人ずつ順番に操作する」の例えで開始
- 並行性制御の概念図（状態遷移: idle → locked → executing → idle）を Part 2 に含める
