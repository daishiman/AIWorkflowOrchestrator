# SkillCreator Layer3/4チェックの日本語ラベルマッピング追加 - タスク指示書

## メタ情報

```yaml
issue_number: 1858
```

## メタ情報

| 項目         | 内容                                                         |
| ------------ | ------------------------------------------------------------ |
| タスクID     | UT-SDK-L34-UI-DISPLAY-LABEL-001                              |
| タスク名     | SkillCreator Layer3/4チェックの日本語ラベルマッピング追加    |
| 分類         | 改善                                                         |
| 対象機能     | SkillLifecyclePanel (renderer side) - verify detail 補助表示 |
| 優先度       | 低                                                           |
| 見積もり規模 | 小規模                                                       |
| ステータス   | 未実施                                                       |
| 発見元       | Phase 3レビュー（UT-SDK-L34-UI-DISPLAY-001 の関連課題）      |
| 発見日       | 2026-04-03                                                   |
| 依存タスク   | #1820（Layer3/4 UI表示拡張の完了後に着手推奨）               |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

現在の `SkillLifecyclePanel.tsx` は、Layer3/4 の検証結果を `L3-001` や `L4-003` のような
技術的な check ID と summary で表示している。
開発者には十分でも、レビュー時やスクリーンショット確認時には「この ID が何を表すのか」を
瞬時に把握しにくい。

### 1.2 問題点・課題

- `check.id` だけでは、UI 画像や Issue コメントを見た人が意味を追いにくい
- summary は詳細である一方、短い見出しとしてはやや長い
- Layer3/4 の検証内容を会話ベースで共有する際に、check ID と意味の対応を都度説明する必要がある

### 1.3 放置した場合の影響

- レビュー時に check ID の意味を毎回説明する手間が増える
- スクリーンショットや Issue の文脈が読みづらくなる
- backend の実装名と UI 表示の意味づけが分離され、将来の保守時に追跡しづらくなる

---

## 2. 何を達成するか（What）

### 2.1 目的

Layer3/4 の各 check に対して、日本語の短い説明ラベルを UI 上で補助表示する。
既存の `check.id`、`check.summary`、severity 表示は維持する。

### 2.2 最終ゴール

- `L3-001` などの check ID に対応する日本語ラベルが定義される
- ラベルは `SkillLifecyclePanel` の verify detail で確認できる
- summary はそのまま保持し、ラベル追加で既存表示を壊さない
- 新しい Layer3/4 check が増えたとき、ラベル追加漏れをテストで検出できる

### 2.3 スコープ

#### 含むもの

- check ID → 日本語ラベルの mapping 定数追加
- verify detail の check card への補助ラベル表示
- label mapping のテスト追加
- 既存 Layer1/2 表示への影響確認

#### 含まないもの

- backend の check 定義変更
- check.summary の日本語翻訳全面対応
- severity フィルタ機能
- Layer 別グルーピング自体の再設計

### 2.4 成果物

| 成果物                    | 説明                                                   |
| ------------------------- | ------------------------------------------------------ |
| 日本語ラベル mapping 定数 | `SkillLifecyclePanel.tsx` もしくは補助モジュールに追加 |
| 補助ラベル UI             | check card 内に短い日本語説明を表示                    |
| テスト                    | ラベル表示と未定義時のフォールバックを確認             |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- UT-SDK-L34-UI-DISPLAY-001 が完了していること
- check ID と summary の表示が既に安定していること
- UI 表示のみで完結し、IPC や backend を変更しないこと

### 3.2 依存タスク

| タスクID                  | タスク名            | 状態     |
| ------------------------- | ------------------- | -------- |
| UT-SDK-L34-UI-DISPLAY-001 | Layer3/4 UI表示拡張 | 完了待ち |

### 3.3 必要な知識

- React コンポーネントの補助表示設計
- TypeScript の `Record` 型
- 既存の verify detail 表示レイアウト

### 3.4 推奨アプローチ

- check ID ごとのラベル mapping を 1 箇所に集約する
- UI では summary を主、ラベルを補助にする
- ラベルが未定義でも表示崩れしないようにフォールバック文字列を持たせる

---

## 4. 実行手順

### Phase 構成

| Phase | 名称         | 概要                                 |
| ----- | ------------ | ------------------------------------ |
| 1     | 要件整理     | 表示場所とラベル形式を確定する       |
| 2     | 実装         | mapping 定数と補助ラベルを追加する   |
| 3     | テスト       | ラベル表示とフォールバックを確認する |
| 4     | ドキュメント | 変更内容と関連タスクを記録する       |

### Phase 1: 要件整理

#### 目的

どの check ID にどの粒度の日本語ラベルを出すかを決める。

#### 手順

1. Layer3/4 の check ID 一覧を確認する
2. UI 上で表示するラベルの文量を決める
3. 補助ラベルの表示位置を決める
4. 未定義 ID のフォールバックを決める

#### 完了条件

- 表示対象の check ID 範囲が固定されている
- ラベルの長さと表示位置が定義されている

### Phase 2: 実装

#### 目的

mapping 定数と補助ラベル表示を追加する。

#### 手順

1. `Record<check.id, label>` 形式の mapping を追加する
2. check card に日本語ラベルを表示する
3. 未定義 ID ではフォールバック表示にする

#### 完了条件

- 日本語ラベルが 1 箇所の定義から取得される
- 既存の check ID / summary / severity 表示が壊れない

### Phase 3: テスト

#### 目的

ラベル表示が安定していることを検証する。

#### 手順

1. Layer3/4 の代表 check でラベル表示を確認する
2. 未定義 ID のフォールバックを確認する
3. 既存 Layer1/2 表示に影響がないことを確認する

### Phase 4: ドキュメント

#### 目的

関連タスクと変更内容を後で追跡できるようにする。

#### 手順

1. 変更理由を Phase 12 の記録に残す
2. 関連 issue と task spec のリンクを整理する

---

## 5. 完了条件

- [ ] 日本語ラベル mapping が 1 箇所に定義されている
- [ ] check card に補助ラベルが表示される
- [ ] 未定義 check ID でも表示崩れがない
- [ ] 既存の Layer1/2 表示に影響がない
- [ ] テストが追加されている

## 6. 検証方法

### テストケース

- `L3-001` に対応する日本語ラベルが表示される
- `L4-001` に対応する日本語ラベルが表示される
- 未定義 ID ではフォールバック文言が表示される

### 検証手順

1. `pnpm --filter @repo/desktop test:run -- SkillLifecyclePanel`
2. `pnpm --filter @repo/desktop typecheck`

## 7. リスクと対策

| リスク                         | 影響 | 対策                                     |
| ------------------------------ | ---- | ---------------------------------------- |
| ラベルが増えて UI が煩雑になる | 中   | 補助表示に限定し、summary を主表示にする |
| check ID とラベルが乖離する    | 中   | 1 箇所定義とテストで drift を抑える      |

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/unassigned-task/task-skill-creator-layer34-ui-display.md`
- `docs/30-workflows/task-ut-sdk-l34-ui-display-001/index.md`
- `docs/30-workflows/task-ut-sdk-l34-ui-display-001/phase-3-design-review.md`

### 参考資料

- `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`
- `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`

## 9. 備考

### 苦戦箇所

- check ID の意味を UI に載せすぎると、summary と重複してしまう
- 日本語ラベルは説明用であり、backend の識別子を置き換えるものではない
