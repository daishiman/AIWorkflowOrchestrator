# TASK-RT-05-PHASE11: multi_select Phase 11 手動テスト証跡取得

## メタ情報

```yaml
task_id: TASK-RT-05-PHASE11
task_name: multi_select Phase 11 手動テスト証跡取得
category: manual-testing / verification
target_feature: multi_select UI（SkillCreator workflow ユーザー入力種別）
priority: HIGH
scale: 小規模
status: 未実施
source_phase: TASK-RT-05 Phase 12 unassigned-task-detection（2026-03-30）
created_date: 2026-03-30
dependencies: [TASK-RT-05]
issue_number: 1755
```

| 項目         | 内容                                                |
| ------------ | --------------------------------------------------- |
| タスクID     | TASK-RT-05-PHASE11                                  |
| タスク名     | multi_select Phase 11 手動テスト証跡取得            |
| 分類         | manual-testing / verification                       |
| 対象機能     | SkillLifecyclePanel の multi_select 複数選択入力 UI |
| 優先度       | HIGH                                                |
| 見積もり規模 | 小規模                                              |
| ステータス   | 未実施                                              |
| 発見元       | TASK-RT-05 Phase 12 unassigned-task-detection       |
| 発見日       | 2026-03-30                                          |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-RT-05 で実装した `multi_select` UIのPhase 11 手動テストが未実施のままである。
`docs/30-workflows/step-09-par-task-rt-05-multi-select-user-input-kind/outputs/phase-11/manual-test-result.md`
の全シナリオ（M11-1〜M11-4）が `PENDING` 状態であり、スクリーンショット証跡が一切取得されていない。

TASK-RT-05 のコード実装（型定義・engine validation・renderer の checkbox UI）は完了しているが、
Phase 11 手動テストが未完了のため Phase 12 の完全完了状態に到達していない。

### 1.2 問題点・課題

- M11-1: `multi_select` request 時の checkbox 群表示が実機で未確認
- M11-2: 複数選択 submit 後の `selectedOptionIds` payload 内容が実機で未確認
- M11-3: kind 切替時の stale selection リセット動作が実機で未確認
- M11-4: 既存 4 kind（`single_select` / `free_text` / `secret` / `confirm`）の非破壊動作が実機で未確認

### 1.3 苦戦ポイント（将来の同様課題解決のための知見）

#### 苦戦ポイント 1: multi_select が表示されるシナリオへのナビゲーション手順

SkillCreator workflow は段階的なステップ進行型UIのため、`multi_select` 入力UIは
特定ステップまで進行しないと表示されない。単純にアプリを起動しただけでは `multi_select` の
`awaitingUserInput` 状態は再現できない。

**対策**: SkillCreator の interview フロー内で `kind: "multi_select"` を含む
`UserInputRequest` が発行されるタイミングまで手動操作でワークフローを進める。
または開発モードのデバッグAPIや Storybook 経由で状態を直接注入することを検討する。

具体的には以下の手順でナビゲートする:

1. Electron アプリを `pnpm --filter @repo/desktop dev` で起動
2. SkillCenter から `+ 新規スキル作成` を選択しSkillCreator を開く
3. スキルの interview ステップが `awaitingUserInput` フェーズに入るまで進める
4. ワークフローエンジンが `multi_select` kind のリクエストを発行するステップに到達する

#### 苦戦ポイント 2: スクリーンショット保存先の確認

Phase仕様書で指定される保存パスが事前に存在しない場合、スクリーンショット採取後に
ファイル配置に迷う。また `screenshots/` ディレクトリが空のまま残ると validator error になる
（NON_VISUAL の場合は `.gitkeep` を削除してディレクトリごと除外する必要がある）。

**対策**: 作業開始前に以下のパスの存在を確認・作成しておく:

```
docs/30-workflows/step-09-par-task-rt-05-multi-select-user-input-kind/outputs/phase-11/screenshots/
```

---

## 2. 何を達成するか（What）

### 2.1 目的

Electron アプリを起動して `multi_select` UIを手動操作し、4つのテストシナリオ（M11-1〜M11-4）の
スクリーンショット証跡を取得・記録する。`manual-test-result.md` の全シナリオを
`PENDING` から実施済み状態に更新する。

### 2.2 受入条件

| ID   | 受入条件                                                                                                      |
| ---- | ------------------------------------------------------------------------------------------------------------- |
| AC-1 | M11-1: SkillCreator workflow で `multi_select` 問い合わせUIが正しく表示される（checkbox 群が表示される）      |
| AC-2 | M11-2: チェックボックス複数選択後の submit payload が仕様通り（`selectedOptionIds` に選択した id が含まれる） |
| AC-3 | M11-3: request の kind 切替時に stale selection がリセットされる（前の選択状態が残らない）                    |
| AC-4 | M11-4: 既存 4 kind（`single_select` / `free_text` / `secret` / `confirm`）が非破壊で動作する                  |

### 2.3 スコープ

#### 含むもの

- M11-1〜M11-4 の手動 walkthrough 実施とスクリーンショット採取
- `outputs/phase-11/` への証跡ファイル配置
- `manual-test-result.md` の更新（全シナリオ結果記録）

#### 含まないもの

- 新規コードの実装（Phase 5 で完了済み）
- 自動テストの追加（Phase 4/6 で完了済み）
- `min_selection` / `max_selection` 等の新規プロパティ検証（スコープ外）

---

## 3. 実行手順（Phase構成）

### Phase 1: 事前確認

1. タスク仕様書 `docs/30-workflows/step-09-par-task-rt-05-multi-select-user-input-kind/index.md` を読む
2. Phase 11 仕様 `phase-11-manual-test.md` を読み、シナリオ M11-1〜M11-4 の内容を把握する
3. 既存の `outputs/phase-11/manual-test-result.md` を読み、現在の PENDING 状態を確認する
4. `outputs/phase-11/manual-test-checklist.md` を確認し、実施すべき項目を把握する
5. コード実装 `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` を読み、
   `multi_select` の実装箇所（checkbox 群の state と submit 分岐）を確認する

### Phase 2: 環境準備（Electronアプリ起動）

1. 作業ディレクトリのルートで依存関係が最新か確認する:
   ```bash
   pnpm install
   ```
2. Electron アプリを開発モードで起動する:
   ```bash
   pnpm --filter @repo/desktop dev
   ```
3. スクリーンショット保存先ディレクトリが存在するか確認し、なければ作成する:
   ```bash
   mkdir -p docs/30-workflows/step-09-par-task-rt-05-multi-select-user-input-kind/outputs/phase-11/screenshots
   ```
4. アプリが正常に起動し、SkillCenter が表示されることを確認する

### Phase 3: M11-1 テスト実施・スクリーンショット採取

**シナリオ**: `multi_select` request を開くと複数候補が checkbox 群で表示される

1. SkillCenter から `+ 新規スキル作成` を選択し SkillCreator を起動する
2. スキルの interview ステップを進め、`awaitingUserInput` かつ `kind: "multi_select"` のフェーズに到達する
3. checkbox 群が表示されていることを目視確認する
4. スクリーンショットを採取し、以下に保存する:
   ```
   outputs/phase-11/screenshots/m11-1-multi-select-display.png
   ```
5. 期待結果: 複数の候補が checkbox 付きリストで表示されており、submit ボタンが存在する

### Phase 4: M11-2 テスト実施・スクリーンショット採取

**シナリオ**: 2件選択して送信すると payload が複数 id を保持する

1. M11-1 の状態から複数のチェックボックスを選択する（2件以上）
2. submit ボタンを押す
3. 開発者ツールまたはコンソールで送信された payload を確認する:
   - `selectedOptionIds` フィールドが配列として存在する
   - 選択した option の id が配列に含まれている
4. submit 直前と送信後のスクリーンショットを採取し保存する:
   ```
   outputs/phase-11/screenshots/m11-2-submit-before.png
   outputs/phase-11/screenshots/m11-2-payload-confirmed.png
   ```
5. 期待結果: `selectedOptionIds: ["<id1>", "<id2>"]` 形式の payload が送信される

### Phase 5: M11-3 テスト実施（kind 切替 reset 確認）

**シナリオ**: kind を切り替えたとき前の選択 state が残らない

1. `multi_select` で何かを選択した後、別の kind（例: `single_select`）に切り替える
2. 再度 `multi_select` に戻ったとき、前の選択が残っていないことを確認する
3. スクリーンショットを採取し保存する:
   ```
   outputs/phase-11/screenshots/m11-3-kind-switch-reset.png
   ```
4. 期待結果: kind 切替後は選択状態がリセットされており、空の状態からチェックボックスが表示される

### Phase 6: M11-4 テスト実施（既存 kind 非破壊確認）

**シナリオ**: 既存 4 kind を順に確認し挙動差分がない

1. `single_select` の入力UIが表示され、ラジオボタン形式で1件選択できることを確認する
2. `free_text` の入力UIが表示され、テキスト入力できることを確認する
3. `secret` の入力UIが表示され、マスク表示のテキスト入力できることを確認する
4. `confirm` の入力UIが表示され、確認ダイアログが表示されることを確認する
5. 各 kind の確認スクリーンショットを採取し保存する:
   ```
   outputs/phase-11/screenshots/m11-4-single-select.png
   outputs/phase-11/screenshots/m11-4-free-text.png
   outputs/phase-11/screenshots/m11-4-secret.png
   outputs/phase-11/screenshots/m11-4-confirm.png
   ```
6. 期待結果: 4 kind すべてが TASK-RT-05 実装前と同じ挙動で動作する

### Phase 7: 証跡ファイルの整理・記録

1. `outputs/phase-11/screenshots/` に採取した画像ファイルが存在することを確認する
2. 画像ファイル名と対応するシナリオを `manual-test-result.md` に記録する
3. 発見した問題点があれば `discovered-issues.md` に追記する

### Phase 8: 完了確認・manual-test-result.md 更新

`docs/30-workflows/step-09-par-task-rt-05-multi-select-user-input-kind/outputs/phase-11/manual-test-result.md`
を以下の形式で更新する:

```markdown
## 実施モード

- workflow status: `implemented`
- 検証手段: 手動 walkthrough 実施 / スクリーンショット採取
- 実施日: YYYY-MM-DD

## 記録欄

| シナリオ | 結果 | スクリーンショット                         | メモ                             |
| -------- | ---- | ------------------------------------------ | -------------------------------- |
| M11-1    | PASS | screenshots/m11-1-multi-select-display.png | checkbox 群が正常表示            |
| M11-2    | PASS | screenshots/m11-2-payload-confirmed.png    | selectedOptionIds に複数 id あり |
| M11-3    | PASS | screenshots/m11-3-kind-switch-reset.png    | stale selection なし             |
| M11-4    | PASS | screenshots/m11-4-\*.png                   | 既存 4 kind 非破壊確認           |
```

### Phase 9: 品質確認

1. 全 4 シナリオの結果が `PASS` または適切な `FAIL` + 理由付きで記録されていることを確認する
2. スクリーンショットが `outputs/phase-11/screenshots/` に存在することを確認する
3. FAIL が存在する場合は `discovered-issues.md` に blocker として記録し、
   対応タスクを `unassigned-task/` に作成する

### Phase 10: スキル仕様反映

1. 本手動テストで発見した知見（ナビゲーション手順、保存パスのルール）を
   `task-specification-creator` のフィードバックとして記録する
2. 類似 Phase 11 タスクの作業効率向上のために、SkillCreator ナビゲーション手順を
   `references/phase-11-screenshot-guide.md` に追記することを検討する

### Phase 11: 完了報告

1. `docs/30-workflows/step-09-par-task-rt-05-multi-select-user-input-kind/outputs/phase-11/manual-test-report.md`
   を更新し、Phase 11 完了として記録する
2. Phase 12 close-out の再開条件が整ったことを確認する（全シナリオ証跡取得済み）

---

## 4. 成果物

| 成果物               | パス                                     | 説明                     |
| -------------------- | ---------------------------------------- | ------------------------ |
| スクリーンショット群 | `outputs/phase-11/screenshots/m11-*.png` | 各シナリオの UI 証跡     |
| 手動テスト結果       | `outputs/phase-11/manual-test-result.md` | 全シナリオの実施結果記録 |
| 手動テストレポート   | `outputs/phase-11/manual-test-report.md` | Phase 11 完了レポート    |
| 発見課題（あれば）   | `outputs/phase-11/discovered-issues.md`  | blocker / note 記録      |

> パスのベースディレクトリ: `docs/30-workflows/step-09-par-task-rt-05-multi-select-user-input-kind/`

---

## 5. 参照情報

- タスク仕様書: `docs/30-workflows/step-09-par-task-rt-05-multi-select-user-input-kind/index.md`
- Phase 11 仕様: `docs/30-workflows/step-09-par-task-rt-05-multi-select-user-input-kind/phase-11-manual-test.md`
- 現在の結果: `docs/30-workflows/step-09-par-task-rt-05-multi-select-user-input-kind/outputs/phase-11/manual-test-result.md`
- 実装ファイル: `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`
- 型定義: `packages/shared/src/types/skillCreator.ts`
- Phase 11 screenshot ガイド: `.claude/skills/task-specification-creator/references/phase-11-screenshot-guide.md`
