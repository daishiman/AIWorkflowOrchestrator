# Phase 12: 実装ガイド

## 対象タスク

TASK-RT-03 Skill Creation Result Panel

## メタ情報

| 項目   | 内容                                                                            |
| ------ | ------------------------------------------------------------------------------- |
| 対象   | `SkillCreationResultPanel` / `ExecuteResultDetailPanel` / `SkillLifecyclePanel` |
| 目的   | plan / execute / verify の結果を 1 つの面で見せる                               |
| 作成日 | 2026-04-06                                                                      |

---

## Part 1: 中学生レベル

### なぜ必要か

スキルを作る作業は、料理でいうと「献立を決める」「実際に作る」「味見して直す」の 3 段階があります。  
もし最初の献立だけ見えて、材料や味見の結果が見えなければ、どこで失敗したのか分かりません。

今回の画面は、その 3 段階の結果を 1 つの箱にまとめて見せるために必要です。  
そうすることで、作業がうまくいったか、どこで止まったか、次に何をすればいいかがすぐ分かります。

### 日常生活の例え

たとえば、学校の提出物を「下書き」「清書」「先生の確認」の 3 段で考えると分かりやすいです。  
下書きだけ見ていても、清書が終わったか、先生が直しを入れたかは分かりません。  
そこで、3 つの結果を 1 冊のノートにまとめておけば、あとで見返したときに流れが一目で分かります。

### 何をするか

`SkillCreationResultPanel` は、3 つの結果を順番に並べて見せます。

1. `PlanResultDetailPanel` で「作る前の計画」を見せる
2. `ExecuteResultDetailPanel` で「実際に作った内容」を見せる
3. `VerifyResultDetailPanel` で「確認した結果」を見せる

verify 取得に失敗したときは `VerifyResultDetailPanel` の error banner を使って再試行できるようにし、new prepare 開始時は古い plan / execute / verify の表示をまとめて破棄します。

さらに、画面の上では「進行中」「Plan完了」「実行失敗」「検証中」「検証失敗」「完了」のような全体ラベルを出して、今どの段階かを一言で分かるようにしています。

### 今回作ったもの

| 日本語               | 英語                     | 役割                   |
| -------------------- | ------------------------ | ---------------------- |
| スキル生成結果パネル | SkillCreationResultPanel | 3 つの結果をまとめる箱 |
| 計画結果パネル       | PlanResultDetailPanel    | 作る前の計画を表示     |
| 実行結果パネル       | ExecuteResultDetailPanel | 実際に作った内容を表示 |
| 確認結果パネル       | VerifyResultDetailPanel  | 品質確認の結果を表示   |

### Phase 11 スクリーンショット参照

UI の確認は `outputs/phase-11/screenshots/` を正本にします。

| ファイル                                                 | 内容      |
| -------------------------------------------------------- | --------- |
| `outputs/phase-11/screenshots/ss-01-initial-state.png`   | 初期状態  |
| `outputs/phase-11/screenshots/ss-02-plan-complete.png`   | Plan 完了 |
| `outputs/phase-11/screenshots/ss-03-execute-success.png` | 実行成功  |
| `outputs/phase-11/screenshots/ss-04-verify-pass.png`     | 検証成功  |
| `outputs/phase-11/screenshots/ss-05-verify-fail.png`     | 検証失敗  |
| `outputs/phase-11/screenshots/ss-06-execute-fail.png`    | 実行失敗  |

---

## Part 2: 技術者レベル

### 型定義

```ts
import type {
  RuntimeSkillCreatorExecuteResult,
  RuntimeSkillCreatorPlanResult,
  RuntimeSkillCreatorVerifyDetail,
} from "@repo/shared/types";

export interface SkillCreationResultPanelProps {
  planResult: RuntimeSkillCreatorPlanResult | null;
  executeResult: RuntimeSkillCreatorExecuteResult | null;
  verifyDetail: RuntimeSkillCreatorVerifyDetail | null;
  verifyError?: string | null;
  onClose?: () => void;
  onReverify?: () => void;
  onRetryVerify?: () => void;
  isReverifying?: boolean;
  isVerifyDetailLoading?: boolean;
}
```

### APIシグネチャ

```ts
function getOverallStatus(
  planResult: RuntimeSkillCreatorPlanResult | null,
  executeResult: RuntimeSkillCreatorExecuteResult | null,
  verifyDetail: RuntimeSkillCreatorVerifyDetail | null,
  isVerifyDetailLoading = false,
  isReverifying = false,
  verifyError: string | null = null,
): "進行中" | "Plan完了" | "実行失敗" | "検証中" | "検証失敗" | "完了";
```

```tsx
<SkillCreationResultPanel
  planResult={rawPlanDetail}
  executeResult={rawExecuteDetail}
  verifyDetail={verifyDetail}
  verifyError={verifyDetailError}
  onReverify={handleReverify}
  onRetryVerify={handleRetryVerifyDetail}
  isReverifying={isReverifying}
  isVerifyDetailLoading={isVerifyDetailLoading}
/>
```

### 使用例

```tsx
const activeStatus = !planResult
  ? "進行中"
  : !executeResult
    ? "Plan完了"
    : !executeResult.success
      ? "実行失敗"
      : isVerifyDetailLoading || isReverifying
        ? "検証中"
        : verifyError
          ? "検証失敗"
          : !verifyDetail || verifyDetail.status === "pending"
            ? "検証中"
            : verifyDetail.status === "fail"
              ? "検証失敗"
              : "完了";

return (
  <SkillCreationResultPanel
    planResult={rawPlanResult}
    executeResult={rawExecuteResult}
    verifyDetail={verifyDetail}
    verifyError={verifyDetailError}
    onReverify={handleReverify}
    onRetryVerify={handleRetryVerifyDetail}
    isReverifying={isReverifying}
    isVerifyDetailLoading={isVerifyDetailLoading}
  />
);
```

### エラーハンドリング

- `planResult` が null のときは空状態ではなく「進行中」として扱う
- `executeResult.success === false` のときは `実行失敗` を優先する
- `verifyDetail.status === "pending"` のときは `検証中` を出す
- `verifyDetail.status === "fail"` のときは `検証失敗` を出し、reverify 導線を残す
- `verifyError` があるときは `VerifyResultDetailPanel` の error banner を出し、`onRetryVerify` で再取得する
- `ExecuteResultDetailPanel` は `persistResult.skillPath` / `persistResult.files` / `persistError` を分けて表示する
- `SkillLifecyclePanel` の prepare 開始時は `clearPlanExecutionState()` 相当で旧 result surface を破棄する

### エッジケース

| ケース                     | 挙動                                                |
| -------------------------- | --------------------------------------------------- |
| 全 props が null           | `結果がまだありません` を表示する                   |
| verify detail が読み込み中 | skeleton を出し、空状態扱いにしない                 |
| execute 成功だが保存失敗   | `persistError` を赤系で別表示する                   |
| verify fail だが再検証不可 | `disabledReason` を表示し、ボタンを disabled にする |

### 設定項目と定数一覧

| 名前                    | 既定値      | 役割                      | 補足                                                                |
| ----------------------- | ----------- | ------------------------- | ------------------------------------------------------------------- |
| `OverallStatus`         | 6 状態      | 全体ラベルの列挙型        | `進行中` / `Plan完了` / `実行失敗` / `検証中` / `検証失敗` / `完了` |
| `OVERALL_STATUS_STYLES` | -           | 状態ごとの色と文言        | badge 表示の正本                                                    |
| `isVerifyDetailLoading` | `false`     | 読み込み中の分岐          | 空状態との混同を避ける                                              |
| `isReverifying`         | `false`     | 再検証中の UI 制御        | ボタンの disabled / 表示文言に使用                                  |
| `verifyError`           | `null`      | verify fetch 失敗 surface | retry banner の source                                              |
| `onRetryVerify`         | `undefined` | verify 再取得トリガー     | error banner の retry ボタンに接続                                  |

### テスト構成

- `SkillCreationResultPanel.test.tsx` で wrapper の 6 状態を確認
- `ExecuteResultDetailPanel.test.tsx` で保存結果 surface を確認
- `SkillLifecyclePanel.test.tsx` で verify detail / severity filter / prepare reset を確認
- `pnpm --filter @repo/desktop typecheck` と targeted vitest で current facts を固定
