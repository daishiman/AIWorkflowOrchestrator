# W1-par-02d: SkillLifecyclePanel テキストエリア削除・ウィザード遷移化 - 実装ガイド

## Part 1: かんたんな説明

### なぜ必要か

スキルを作るときは、最初のメモが最後まで正しく伝わる必要があります。途中でそのメモが消えると、次の工程で何を実行すべきか分からなくなります。

たとえば、レストランの注文票を厨房までそのまま渡さず、途中で別の人が内容を書き直してしまうと、完成品がずれてしまいます。今回の `skillSpec` は、その注文票にあたる大事な情報です。

### 何をしたか

- 画面の古い入力欄をなくし、1 つの「スキル作成ウィザードを開く →」ボタンにまとめました
- 作成した計画の内容を `skillSpec` として保管し、実行するときにそのまま使うようにしました
- 途中で別の文字列にすり替わらないように、実行時は「今の画面」ではなく「保存してある計画の内容」を使います

### 変更前 / 変更後

| 項目         | 変更前                               | 変更後                      |
| ------------ | ------------------------------------ | --------------------------- |
| 入口         | テキストエリアに入力してから進む     | ウィザードを開いて作る      |
| 実行時の材料 | 画面に残っている文字列に依存しやすい | 保存した `skillSpec` を使う |
| 見た目       | 旧入力欄と旧ボタンが並ぶ             | 1 つの導線に整理される      |

### たとえば

たとえば、宿題の答えをノートに書いたあと、そのノートをしまってしまっても、清書した答えを別に保存しておけば見返せます。今回の `skillSpec` も同じで、作った内容を画面の一時入力ではなく計画結果に保存しておくことで、実行時に迷わなくなります。

## Part 2: 技術詳細

### 1. 削除したコード要素

| 要素                             | 理由                                                    |
| -------------------------------- | ------------------------------------------------------- |
| `approvedSkillSpec` の独立 state | 計画結果に `skillSpec` を持たせれば重複管理が不要だから |
| 古い request 系の流れ            | ウィザード導線へ一本化したため                          |
| 旧 UI 前提の実装コメント         | 今の契約に合わないため                                  |

### 2. 追加した仕様

| 項目                                  | 内容                                                        |
| ------------------------------------- | ----------------------------------------------------------- |
| `PlanResult.skillSpec`                | 計画結果に canonical なスキル仕様を保持する                 |
| `SkillCreateWizard` の execute 処理   | `storePlanResult.skillSpec` を優先して `executePlan` へ渡す |
| `SkillLifecyclePanel` の execute 処理 | `activePlanResult.skillSpec` をそのまま使う                 |
| 画面の起点                            | `onOpenSkillWizard` でウィザードを開く                      |

### 3. Props インターフェース変更

#### Before

```ts
interface SkillLifecyclePanelProps {
  onClose: () => void;
}
```

#### After

```ts
interface SkillLifecyclePanelProps {
  onClose: () => void;
  onOpenWizard?: () => void;
  onOpenSkillWizard?: () => void;
  skillName?: string;
}
```

### 4. 呼び出し元への影響

- `App.tsx` と `SkillManagementPanel.tsx` は `onOpenSkillWizard` を渡す必要がある
- テスト側は `skill-lifecycle-open-wizard-button` を前提に更新する
- `SkillCreateWizard` は `PlanResult` に含まれる `skillSpec` を保持したまま実行する

### 5. 変更最小化原則

- 画面の入口は 1 個のボタンに集約した
- 実行の基準値は新しい state を増やさず、計画結果の `skillSpec` に寄せた
- 既存の `executePlan(planId, skillSpec)` 契約は変えていない

### 6. current contract と target delta

| 観点     | current contract                               | target delta                   |
| -------- | ---------------------------------------------- | ------------------------------ |
| 画面入口 | `SkillLifecyclePanel` からウィザードを起動する | 変更なし、明示化だけ行う       |
| 実行入力 | 計画結果の `skillSpec` を使う                  | `skillSpec` の保持経路を明確化 |
| 状態管理 | 画面の一時 state に依存しやすい                | 計画結果を正本にする           |

### 7. data-testid 変更一覧

| 種別 | data-testid                          |
| ---- | ------------------------------------ |
| 削除 | `skill-lifecycle-request-input`      |
| 削除 | `skill-lifecycle-create-button`      |
| 削除 | `skill-lifecycle-prepare-button`     |
| 追加 | `skill-lifecycle-open-wizard-button` |

### 8. TypeScript の型定義

| 型                                 | 変更内容                                                  |
| ---------------------------------- | --------------------------------------------------------- |
| `PlanResult`                       | `skillSpec?: string` を追加                               |
| `RuntimeSkillCreatorPlanResponse`  | 既に `skillSpec` を持つので、変換時に落とさないようにした |
| `SkillCreateWizard` の runtime api | `executePlan(planId, skillSpec, ...)` を維持              |

### 9. API シグネチャ

```ts
executePlan?: (
  planId: string,
  skillSpec: string,
  authMode?: string,
  apiKey?: string,
) => Promise<...>
```

### 10. 使用例

```ts
const canonicalSkillSpec = activePlanResult?.skillSpec ?? formData.purpose;

await skillCreatorApi.executePlan(planId, canonicalSkillSpec);
```

### 11. エッジケース

| ケース             | 対応                                         |
| ------------------ | -------------------------------------------- |
| `skillSpec` が空   | `executePlan` に渡す前に計画側の値を確認する |
| `terminal_handoff` | 実行ボタンを出さず、案内カードへ誘導する     |
| 計画結果が未設定   | 実行ボタン自体を表示しない                   |

### 12. 設定値 / 参照ファイル

| 項目                 | 値                                                                                                                                                                                      |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 主要ボタン           | `lifecycleButtonStyles.primary`                                                                                                                                                         |
| 主要導線のボタン文言 | `スキル作成ウィザードを開く →`                                                                                                                                                          |
| 画面証跡の参照       | `outputs/phase-11/manual-test-report.md` / `outputs/phase-11/ui-sanity-visual-review.md` / `outputs/phase-11/screenshot-coverage.md` / `outputs/phase-11/phase11-capture-metadata.json` |

### 13. 画面証跡の補足

Playwright harness により PNG も取得できた。視覚レビューの正本は `outputs/phase-11/` 配下の手動テスト成果物に置く。
