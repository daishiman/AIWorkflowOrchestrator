# Phase 12: 実装ガイド（Part 1 中学生レベル + Part 2 開発者向け）

## メタ情報

| 項目       | 値                                              |
| ---------- | ----------------------------------------------- |
| Phase      | 12                                              |
| タスクID   | TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID           |
| タスク種別 | NON_VISUAL code task                            |
| 対象読者   | Part 1 = 初学者・中学生レベル / Part 2 = 開発者 |

---

## Part 1: なぜ必要か・何をするか（中学生レベル）

### なぜ必要か

同じ放送設備を複数の人が同時に使うとき、あて先がないと誰向けの連絡か分からなくなります。この task は progress 通知にあて先札を付けて、別の作業の進み具合が混ざらないようにするために必要です。

### たとえば、学校の校内放送を思い浮かべてみよう

学校では、スピーカーから全教室に同時にお知らせが流れることがあります。もし「3 年 A 組の人、職員室に来てね」というアナウンスを、3 年 A 組でも 3 年 B 組でも 2 年 C 組でもみんな同じスピーカーで聞いてしまうと、どのクラスに向けたお知らせなのか分からなくなってしまいます。

そこで、放送では必ず「○○組の△△さん」と**宛先札（あてさきふだ）**を付けてアナウンスします。すると、自分のクラスや名前が呼ばれたときだけ「あ、これは自分あてだ」と分かりますね。

### このタスクで直したいこと

今のアプリでは、スキルを作っているときの進捗（「計画中」「作成中」「検証中」など）が、すべて同じ校内放送のようなチャンネル（`skill-creator:progress`）で流れています。でも、宛先札が付いていないので、**もし同時に複数のスキルを作り始めたら、どの進捗がどのスキルの分なのか分からなくなってしまう**という問題があります。

### 何をするか

- **progress payload（校内放送の中身）** に、`planId`（= 宛先札）と `requestId`（= お知らせの通し番号）を付け加えます
- **`useStreamingProgress`（= 受信係）** は「自分の planId と一致する放送だけ受け取る」ルールを持たせます
- **一致しない放送は静かに無視する** ので、画面が混線しません

### 今回作ったもの

- `SkillCreatorProgress` の tracking ID 拡張
- Main 側 createSkill progress への `planId` / `requestId` 付与
- `useStreamingProgress(options?: { planId?: string })` の filter
- Hook / Main 送信の targeted test 追加

### 例えで対応関係を整理すると

| 学校の校内放送         | このアプリ                                  |
| ---------------------- | ------------------------------------------- |
| スピーカー（放送設備） | `skill-creator:progress` IPC チャンネル     |
| アナウンスの中身       | progress payload                            |
| 宛先札（○○組○○さん）   | `planId`（どのスキル生成の通知か）          |
| お知らせの通し番号     | `requestId`（同じ planId でも回ごとに識別） |
| 受信係（先生・生徒）   | `useStreamingProgress` Hook                 |
| 「自分あて以外は無視」 | Hook の `options.planId` フィルタ           |

### なぜ optional（任意）にするの？

古いコードは宛先札を付けずに放送する人もいるかもしれません（= 後方互換）。急に「宛先札必須」にすると、古い呼び出しが全部エラーになってしまいます。なので、

- **宛先札なしの放送も今まで通り受け入れる**（= `planId` 未設定でも OK）
- **受信側も `options.planId` を指定しなければ全部受け取る**（= 古い UI そのまま動く）

という二段構えで、少しずつ安全に切り替えられるようにします。

---

## Part 2: 開発者向け技術詳細

### TypeScript 型シグネチャ（変更後の想定）

```ts
// apps/desktop/src/preload/skill-creator-api.ts
export interface SkillCreatorProgress {
  phase: string;
  percentage: number;
  message: string;
  planId?: string; // ★ 追加: どの plan の progress か識別する
  requestId?: string; // ★ 追加: 同一 plan 内の再実行区別（監査 / デバッグ用）
}
```

```ts
// apps/desktop/src/renderer/hooks/useStreamingProgress.ts
export interface UseStreamingProgressOptions {
  planId?: string; // ★ 追加: 受信フィルタ条件（未指定なら全通知受け入れ）
}

export function useStreamingProgress(
  options?: UseStreamingProgressOptions,
): UseStreamingProgressReturn;
```

### Hook filter 擬似コード

```ts
const cleanup = api.onProgress((progress) => {
  // ★ 追加: planId フィルタ（後方互換 + 一致判定）
  if (options?.planId !== undefined && progress.planId !== undefined) {
    if (options.planId !== progress.planId) {
      return; // miss: スキップ
    }
  }
  // progress.planId 未設定 or options.planId 未指定 → 既存通り受け入れ

  if (progress.phase === "error") {
    /* ...既存処理 */
  }
  updateProgress({
    stage: mapPhaseToStage(progress.phase),
    percent: progress.percentage,
    message: progress.message,
  });
});
```

### APIシグネチャ

```ts
skillCreatorAPI.onProgress(
  (progress: {
    phase: string;
    percentage: number;
    message: string;
    planId?: string;
    requestId?: string;
  }) => void,
): () => void;
```

### 使用例

```ts
const streaming = useStreamingProgress({ planId: "skill-create-123" });
```

### 差分確認コマンド

```bash
# 型定義と参照箇所の整合性確認
grep -rn "SkillCreatorProgress" apps/desktop/src/

# Main 側呼び出し元と planId 貫通確認
grep -rn "sendSkillCreatorProgress" apps/desktop/src/main/

# Runtime 経路 emit 漏れ検出
grep -REn 'onProgress|emitProgress|webContents\.send' \
  apps/desktop/src/main/services/runtime/ \
  apps/desktop/src/main/ipc/

# Hook 単体テスト
pnpm --filter @repo/desktop test -- --run useStreamingProgress

# typecheck / lint
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop lint
```

### 後方互換ポリシー

| 状態                                         | 挙動                | 理由                                    |
| -------------------------------------------- | ------------------- | --------------------------------------- |
| `progress.planId` 未設定                     | Hook 側で受け入れる | 既存コード（planId 付与前）を破壊しない |
| `options.planId` 未指定                      | 全通知を受け入れる  | 既存 UI（filter 導入前）を破壊しない    |
| `progress.planId` と `options.planId` 一致   | 受け入れる（match） | 本 task 本来の動作                      |
| `progress.planId` と `options.planId` 不一致 | スキップ（miss）    | 本 task 本来の動作（混線防止）          |

### エラーハンドリング

- `planId` が不一致でも error を投げずに skip する
- `progress.planId` 未設定の legacy payload は受け入れる
- targeted test が環境要因で実行できない場合は Phase 11 `discovered-issues.md` に blocker を記録する

### エッジケース

| ケース                                       | 期待挙動                                                                | 検証テスト              |
| -------------------------------------------- | ----------------------------------------------------------------------- | ----------------------- |
| `progress.planId === ""`（空文字）           | `options.planId` 未指定なら受け入れ、指定ありなら不一致扱い（厳密等価） | 追加シナリオ（Phase 6） |
| `options.planId === ""`（空文字）            | filter 有効、空文字一致以外はスキップ                                   | 追加シナリオ（Phase 6） |
| `progress.planId === undefined`              | 後方互換で受け入れ                                                      | legacy シナリオ         |
| 同一 planId の並行 request（requestId 違い） | 両方受け入れ（本 task 範囲では filter は planId のみ）                  | 既存テスト維持          |
| useEffect 依存配列で planId 変更             | 前 cleanup → 新 listener 登録で漏れなく再購読                           | 追加シナリオ（Phase 6） |

### 設定項目と定数一覧

| 項目                 | 値 / 用途                            |
| -------------------- | ------------------------------------ |
| `options.planId`     | Hook 側の受信フィルタ条件            |
| `progress.planId`    | どの createSkill 実行かを識別する ID |
| `progress.requestId` | 同一実行波の request 単位 ID         |

### テスト構成

- Hook: `useStreamingProgress.test.ts`
- Main IPC: `skillCreatorHandlers.validation.test.ts`
- Main IPC integration: `skillCreatorIpc.integration.test.ts`
- Quality gate: `typecheck` / `lint` / `vitest`

### IPC 契約書との整合

`api-ipc-system-skill-creator.md` の `skill-creator:progress` payload スキーマに `planId?: string` / `requestId?: string` を追記し、`lessons-learned-stream-001-progress-callback.md` にも filter-by-planId 契約を反映済み。

---

## 視覚証跡

本 task は **NON_VISUAL code task** である。UI / UX の視覚要素（レイアウト / 配色 / インタラクション / DOM 構造）に変更はなく、Phase 11 の UI スクリーンショットは**不要**。

代替証跡として以下を参照する。Phase 11 のうち NV-01〜NV-03 は実施済み、NV-05 は環境 blocker により未確定である。

| 代替証跡                              | 参照先                                                   |
| ------------------------------------- | -------------------------------------------------------- |
| Phase 10 最終レビュー結果             | `outputs/phase-10/final-review-result.md`                |
| Phase 11 手動テスト結果（一次ソース） | `outputs/phase-11/manual-test-result.md` の NV-01〜NV-05 |
| Phase 11 チェックリスト               | `outputs/phase-11/manual-test-checklist.md`              |
| Phase 11 発見事項                     | `outputs/phase-11/discovered-issues.md`                  |

## 参照

- `phase-1-requirements.md` AC-1〜AC-9
- `phase-2-design.md` 検証導線
- `.claude/skills/aiworkflow-requirements/references/api-ipc-system-skill-creator.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned-stream-001-progress-callback.md`
- `.claude/skills/aiworkflow-requirements/references/arch-state-management-skill-creator.md`
