# Phase 11: 手動テスト

## 目的

自動テストでは確認しにくい実際の UI 操作・エンドツーエンドの動作を手動で検証する。

---

## 前提条件

- アプリケーションがローカルで起動している
- `RuntimeSkillCreatorFacade.plan()` のログまたは trace を確認できる
- DevTools が使用可能（console.log の確認用）

---

## TASK-P0-07: 手動テスト手順

### シナリオ MT-P7-01: デフォルトエージェント構成での動作確認

1. アプリを起動し、skill-creator ワークフローを開く
2. 生成ボタンでプランを作成する
3. DevTools の Console で `PLAN_RESOURCE_REQUESTS` を使った agent 導出の trace を確認する
4. 生成されたプランに `discover-problem`, `design-workflow`, `plan-structure` が含まれることを確認

### シナリオ MT-P7-02: source of truth 追随の確認

1. テスト用のローカルブランチまたは fixture で `PLAN_RESOURCE_REQUESTS` の agent 順を一時変更する
2. その状態でプランを生成する
3. 生成されたプランが変更後の agent 順に追随していることを確認する
4. agent 以外の request が混ざっても出力に含まれないことを確認する

### シナリオ MT-P7-03: non-agent request の無視確認

1. `PLAN_RESOURCE_REQUESTS` に reference 系 request を含むケースでプランを生成する
2. agent 名導出に reference 系 request が使われていないことを確認する
3. fallback path でも出力が変わらないことを確認する

---

## TASK-SDK-04-U2: 手動テスト手順

### シナリオ MT-S4-01: 基本 execute フローの確認

1. skill-creator UI を開く
2. textarea に「テスト用スキルを作成してください」と入力
3. 「生成」ボタンを押す
4. plan review が表示されることを確認
5. 「実行する」ボタンを押す
6. 正常にスキル生成が開始することを確認

### シナリオ MT-S4-02: drift が起きないことの確認

1. textarea に「スキル A」と入力
2. 「生成」ボタンを押す
3. plan review が表示される
4. textarea の内容を「スキル B」に変更する
5. 「実行する」ボタンを押す
6. DevTools の Network タブで `executePlan` の IPC 呼び出しを確認
7. 渡された `skillSpec` が「スキル A」のプランに基づいていることを確認（「スキル B」ではない）

### シナリオ MT-S4-03: キャンセル後の再生成

1. 「生成」→ plan review → 「キャンセル」を実行
2. textarea が空になっていることを確認
3. 新しい内容を入力して再度「生成」
4. 新しい request snapshot が正しく設定されることを確認

---

## 手動テスト結果記入欄

| シナリオ | 実施日 | 結果 | 備考 |
| -------- | ------ | ---- | ---- |
| MT-P7-01 |        |      |      |
| MT-P7-02 |        |      |      |
| MT-P7-03 |        |      |      |
| MT-S4-01 |        |      |      |
| MT-S4-02 |        |      |      |
| MT-S4-03 |        |      |      |

全シナリオ PASS の場合 → Phase 12 ドキュメント更新へ
