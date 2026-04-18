# Lessons Learned: TASK-SW-STREAM-001 / skill-creator-service-progress-callback

## メタ情報

| 項目     | 値                                                           |
| -------- | ------------------------------------------------------------ |
| タスクID | TASK-SW-STREAM-001                                           |
| 機能名   | skill-creator-service-progress-callback                      |
| 日付     | 2026-04-16                                                   |
| ファイル | `SkillCreatorService.ts` / `SkillCreatorService.progress.test.ts` |

---

## L-STREAM-001: optional callback パターンの設計判断

### 背景

`SkillCreatorService.createSkill()` に進捗通知機能を追加する際、既存の呼び出し元（`skillCreatorHandlers.ts`）を壊さずに拡張する必要があった。

### 解決策

`onProgress?` をオプショナル引数として末尾に追加する。

```typescript
async createSkill(
  options: SkillCreatorOptions,
  onProgress?: (progress: SkillCreatorProgressData) => void,
): Promise<string>
```

- `onProgress` 省略時は従来通り動作（後方互換）
- コールバックは try/catch で包まない（例外を呼び出し元に伝播させる設計）

### 教訓

- **main process 内部 API への optional callback 追加**は、既存呼び出し元に無影響で進捗通知を実現する最小コスト設計。
- コールバックの例外を握りつぶさない設計は、失敗を呼び出し元に見せたい main process API に適している。
- `onProgress` 未指定でも正常完了するテストは、オプショナル引数の回帰防止として再利用しやすい。

---

## L-STREAM-002: SkillCreatorProgressData 型の shared 移動を低優先度にした理由

### 背景

`SkillCreatorProgressData` 型を `packages/shared/` へ移動すべきか判断が必要だった。

### 判断

**Low 優先度（現時点では local 定義で十分）** とした。

理由:
- `SkillCreatorService` は main process 内部 API であり、renderer 側はこのタスクの対象外。
- shared 移動は `TASK-SW-STREAM-002`（IPC 配線）完了後に効果が出る。
- IPC 接続前に shared 移動すると破壊範囲が広がり、テストへの影響が出る。

### 教訓

- **型定義の shared 移動は IPC 配線タスクと同波で行う**のが適切。先行移動は破壊範囲を不必要に広げる。
- 現状は local 型として `SkillCreatorService.ts` 内に定義し、後続タスクで段階的に移動する。

---

## L-STREAM-003: 5段階 progress 設計の考え方

### 背景

進捗フェーズの段階数・パーセンテージ・メッセージをどう設計するか判断が必要だった。

### 決定内容

```typescript
type SkillCreatorProgressData = {
  phase: "planning" | "generating-skill" | "generating-agents" | "validating" | "done";
  percentage: number; // 10 | 40 | 70 | 90 | 100
  message: string;   // 日本語の進捗メッセージ
};
```

5段階固定にした理由:
- 仕様とテストの対応が追いやすい（期待値が明確）
- mode 別（collaborative/orchestrate 等）の詳細化は FUP-03 として分離

### 教訓

- **段階を固定するとテストの期待値が一元化**でき、回帰防止が容易になる。
- magic string / number の散在を避けるため、将来的に `PROGRESS_PHASES` オブジェクト等で定数化する（FUP-02）。
- mode 別の進捗フロー詳細化は、基本設計を固めてから別タスクで対応する（FUP-03、Medium 優先度）。

---

## L-STREAM-FUP-03: PROGRESS_FLOWS 単一集約パターン（TASK-SW-STREAM-FUP-03 / 2026-04-18）

### 背景

TASK-SW-STREAM-001 で実装した 5 段階フロー（planning → generating-skill → generating-agents → validating → done）は `create` モード専用だった。他モード（collaborative / orchestrate / update / improve-prompt）では不正確なメッセージが表示される問題があった。

### 解決策

`SkillCreatorService.ts` 内に `PROGRESS_FLOWS` 定数を単一定義として置き、`emitProgress(phase: string)` がフェーズ名で進捗データを解決する設計にした。

```typescript
const PROGRESS_FLOWS: Record<SkillCreatorMode, readonly SkillCreatorProgressData[]> = {
  create:         [...],
  collaborative:  [...],
  orchestrate:    [...],
  update:         [...],
  "improve-prompt": [...],
};

const emitProgress = (phase: string): void => {
  const step = flow.find((s) => s.phase === phase);
  if (step) onProgress?.({ ...step });
};
```

### 教訓

- **`PROGRESS_FLOWS` を `SkillCreatorService.ts` の単一定数として集約**することで、将来モードを追加・変更してもフロー定義が散在しない。
- private workflow methods（`runCollaborativeWorkflow` 等）は progress literal を持たず業務ロジックに集中することで責務分離が明確になる。
- `createSkill()` を orchestration point として固定すると、どのモードでも progress emit のタイミングを一箇所で把握できる。
- renderer 側の `useStreamingProgress.ts` が unknown phase を `planning` に吸収する問題は別責務（→ TASK-SC-08）として formalize した。

---

## 再利用メモ（skill-feedback-report.md より抽出）

- 14 テストの progress スイートは、shared 移動や定数化の変更でも最小差分で追従できる構造。
- UI を触らず CLI だけで build / typecheck / vitest を確認する進め方は、non-visual タスクに向いている。
- `onProgress` 未指定でも正常完了するテストは、オプショナル引数の回帰防止として再利用しやすいパターン。

---

## 後続タスク・未タスク

| ID     | 内容                                                            | 優先度  | 状態              |
| ------ | --------------------------------------------------------------- | ------- | ----------------- |
| FUP-01 | `SkillCreatorProgressData` を shared へ移動                     | Low     | open              |
| FUP-02 | progress の phase/percentage/message を定数化                   | Low     | open              |
| FUP-03 | mode 別に progress の詳細を変える                               | Medium  | **完了（2026-04-18）** |
| FUP-04 | renderer 側の useStreamingProgress mode-specific phase mapping  | Medium  | open（TASK-SC-08） |
| 後続   | TASK-SW-STREAM-002（IPC 配線）                                  | -       | -                 |
