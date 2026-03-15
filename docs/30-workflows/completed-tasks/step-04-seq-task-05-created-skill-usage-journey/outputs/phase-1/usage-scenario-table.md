# Phase 1 利用シナリオ表

## メタ情報

| 項目     | 値                         |
| -------- | -------------------------- |
| タスクID | TASK-SKILL-LIFECYCLE-05    |
| タスク名 | 作成済みスキルを使う主導線 |
| Phase    | 1                          |
| 作成日   | 2026-03-15                 |

## 1. シナリオ一覧

| ID  | シナリオ名         | 英語名        | 開始地点                     | 完了地点           |
| --- | ------------------ | ------------- | ---------------------------- | ------------------ |
| A   | 作成直後に使う     | Immediate Use | Skill Creator 完了 → EP-1 後 | Agent で実行完了   |
| B   | あとから使う       | Deferred Use  | Skill Center 保存済み一覧    | Agent で実行完了   |
| C   | 履歴から再利用する | History Reuse | Agent 実行履歴一覧           | Agent で再実行完了 |

## 2. シナリオA: 作成直後に使う（Immediate Use）

### 2.1 フロー詳細

```
[Skill Creator 完了]
    |
    v
[EP-1 採点完了] → ScoringGateResult 取得
    |
    +-- gate = NEEDS_IMPROVEMENT (0-59)
    |       → 「利用不可」CTA disabled
    |       → 「改善する」CTA → SkillAnalysisView
    |
    +-- gate = SAVE_ALLOWED (60-79)
    |       → 「保存して後で使う」CTA → Skill Center へ保存
    |       → 「改善してから使う」CTA → SkillAnalysisView
    |       → 改善推奨バナー表示
    |
    +-- gate = USE_ALLOWED (80-99)
    |       → 「今すぐ使う」CTA → Workspace → Agent
    |       → 「保存して後で使う」CTA → Skill Center へ保存
    |
    +-- gate = RECOMMENDED (100)
            → 「今すぐ使う」CTA（ハイライト）→ Workspace → Agent
            → 推奨バッジ表示
            → 「改善を推奨」CTA は非表示
```

### 2.2 CTA マトリクス（シナリオA）

| ScoringGate       | 今すぐ使う          | 保存して後で使う | 改善してから使う | 改善を推奨 |
| ----------------- | ------------------- | ---------------- | ---------------- | ---------- |
| NEEDS_IMPROVEMENT | disabled            | disabled         | primary          | -          |
| SAVE_ALLOWED      | disabled            | primary          | secondary        | visible    |
| USE_ALLOWED       | primary             | secondary        | -                | -          |
| RECOMMENDED       | primary (highlight) | secondary        | -                | -          |

### 2.3 前提条件

| 条件                 | 内容                                     |
| -------------------- | ---------------------------------------- |
| Skill Creator 完了   | スキルの prompt / description が確定済み |
| EP-1 採点完了        | ScoringGateResult が取得済み             |
| ScoringGate 判定済み | canSave / canUse フラグが確定済み        |

## 3. シナリオB: あとから使う（Deferred Use）

### 3.1 フロー詳細

```
[Skill Center]
    |
    +-- 一覧表示（グリッド）
    |       → SkillCard に ScoringGate バッジ表示
    |       → ソート: 最終更新日 / スコア順
    |       → フィルタ: ScoringGate / カテゴリ
    |
    +-- 検索バー
    |       → スキル名 / 説明 / タグで検索
    |
    +-- おすすめセクション
    |       → USE_ALLOWED 以上のスキルのみ表示
    |       → スコア x 利用頻度でソート
    |
    +-- 最近使ったスキル
    |       → 最終使用日時でソート
    |
    +-- お気に入り
            → ユーザーがスター付けしたスキル
    |
    v
[SkillCard クリック]
    |
    v
[SkillDetailPanel]
    → 総合スコア + 5軸 breakdown
    → 「使う」CTA（canUse = true の場合有効）
    → 「改善する」CTA（常時表示）
    |
    v
[「使う」CTA クリック]
    |
    +-- 推奨経路: Workspace（EP-3 評価バナー）→ Agent（実行）
    |
    +-- 省略経路: Agent へ直接遷移（文脈不要時）
```

### 3.2 発見導線の詳細

| 発見方法   | 表示場所                | ソート基準            | フィルタ条件                 | 表示件数 |
| ---------- | ----------------------- | --------------------- | ---------------------------- | -------- |
| 一覧表示   | Skill Center メイン     | 最終更新日 / スコア順 | ScoringGate / カテゴリ       | 全件     |
| 検索       | Skill Center 検索バー   | 関連度                | スキル名 / 説明 / タグ       | 検索結果 |
| おすすめ   | Skill Center トップ     | スコア x 利用頻度     | `USE_ALLOWED` 以上のみ       | 最大6件  |
| 最近使った | Skill Center セクション | 最終使用日時          | なし                         | 最大10件 |
| お気に入り | Skill Center セクション | お気に入り登録日      | ユーザーがスター付けしたもの | 全件     |

### 3.3 前提条件

| 条件                    | 内容                                       |
| ----------------------- | ------------------------------------------ |
| スキル保存済み          | ScoringGate `SAVE_ALLOWED` 以上で保存済み  |
| Skill Center アクセス可 | ナビゲーションから Skill Center に遷移可能 |

## 4. シナリオC: 履歴から再利用する（History Reuse）

### 4.1 フロー詳細

```
[Agent 履歴タブ]
    |
    → 実行履歴一覧（RecentExecutionList）
    → 各エントリ: スキル名 / 実行日時 / ステータス / スコア
    |
    v
[履歴エントリクリック]
    |
    v
[前回コンテキスト復元]
    → 前回の実行パラメータ表示
    → 結果サマリー表示
    → スコア変遷（delta）表示
    |
    +-- 「再実行」CTA → 同じパラメータで Agent 実行
    |
    +-- 「パラメータ変更」→ Workspace でパラメータ調整 → Agent 実行
    |
    +-- 「改善する」CTA → Task03 改善フローへ遷移
```

### 4.2 履歴エントリ表示項目

| 項目               | 型              | 表示形式                            |
| ------------------ | --------------- | ----------------------------------- |
| スキル名           | string          | テキスト                            |
| 実行日時           | Date            | 相対表示（3分前 / 昨日）            |
| 実行ステータス     | ExecutionStatus | アイコン + ラベル（成功/失敗/取消） |
| 実行時スコア       | number          | ScoreGateBadge (compact)            |
| 現在スコアとの差分 | number (delta)  | ScoreDelta（変化がある場合のみ）    |

### 4.3 前提条件

| 条件                  | 内容                                |
| --------------------- | ----------------------------------- |
| 実行履歴が1件以上存在 | ExecutionSummary が Store に存在    |
| Agent 画面アクセス可  | ナビゲーションから Agent に遷移可能 |

## 5. シナリオ横断: 改善フィードバックループ

### 5.1 トリガー条件

| トリガー                 | シナリオ | 遷移先                            |
| ------------------------ | -------- | --------------------------------- |
| 作成直後 gate < 60       | A        | SkillAnalysisView                 |
| 実行結果に不満           | A, B, C  | EP-4 → 改善フロー                 |
| EP-4 で gate < 60        | A, B, C  | SkillAnalysisView（強い誘導）     |
| EP-4 で gate 60-79       | A, B, C  | 改善推奨バナー + 改善ボタン       |
| ユーザーが任意で改善選択 | A, B, C  | Skill Creator / SkillAnalysisView |

### 5.2 改善完了後の復帰経路

| 改善前シナリオ  | 改善完了後の復帰先                   |
| --------------- | ------------------------------------ |
| A（作成直後）   | EP-2 採点 → シナリオA CTA 再表示     |
| B（あとから）   | EP-2 採点 → Skill Center（更新反映） |
| C（履歴再利用） | EP-2 採点 → Agent 履歴（スコア更新） |

## 6. ScoringGate x シナリオ アクセス制御マトリクス

| ScoringGate       | シナリオA 利用可否 | シナリオB 利用可否 | シナリオC 利用可否 |
| ----------------- | ------------------ | ------------------ | ------------------ |
| NEEDS_IMPROVEMENT | 利用不可           | 非表示（未保存）   | 履歴に残らない     |
| SAVE_ALLOWED      | 利用不可（保存可） | 表示あり・利用不可 | 履歴に残らない     |
| USE_ALLOWED       | 利用可             | 表示あり・利用可   | 再利用可           |
| RECOMMENDED       | 利用可（推奨）     | 表示あり・利用可   | 再利用可           |

**注記**: EP-3/EP-4 の評価結果は利用をブロックしない。上記の利用可否は作成時の ScoringGate（EP-1/EP-2）に基づく。
