# Phase 2: 設計

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 2                     |
| Phase名    | 設計                  |
| 対象機能   | TASK-SW-STREAM-FUP-03 |
| 前提Phase  | Phase 1: 要件定義     |
| 次Phase    | Phase 3: 設計レビュー |
| ステータス | 未実施                |
| 作成日     | 2026-04-17            |

## 目的

モード別 progress flow の単一集約方針を確定し、`SkillCreatorService.ts` の修正範囲を最小化する。

## 設計方針

### アプローチ: progress flow 定義の単一集約

`SkillCreatorService.ts` の内部に mode ごとの progress flow を 1 箇所で定義し、`createSkill()` がその定義を参照して progress を emit する。
`runCollaborativeWorkflow` / `runOrchestrateWorkflow` / `runUpdateWorkflow` / `runImprovePromptWorkflow` は progress payload を持たず、業務ロジックだけを実行する。
`done` は共通終端として `createSkill()` が 1 回だけ発火する。

### 型設計

```typescript
// 既存型（変更なし）
type SkillCreatorProgressData = {
  phase: string;
  percentage: number;
  message: string;
};

type SkillCreatorProgressCallback = (
  progress: SkillCreatorProgressData,
) => void;

type SkillCreatorProgressStep = {
  progress: SkillCreatorProgressData;
  run: () => Promise<void>;
};

type SkillCreatorProgressFlow = readonly SkillCreatorProgressStep[];
```

`PROGRESS_FLOW_BY_MODE` は `create` / `collaborative` / `orchestrate` / `update` / `improve-prompt` の 5 種類を持ち、各 mode の先頭フェーズ・中間フェーズ・終端フェーズを順序付きで表現する。

### orchestration の責務

`createSkill()` は mode を見て progress flow を 1 回だけ解決し、`emitProgressStep` のような共通 helper を通して各 step を順番に実行する。
private method は progress literal を持たず、step の `run` によって呼ばれる業務ロジックだけを担当する。
`update` / `improve-prompt` に専用 private method が存在しない場合は、`createSkill()` 内の mode 分岐に step を置いてよいが、progress contract は必ず flow 定義に閉じる。

### 変更ファイル一覧

| ファイル                               | 変更種別 | 変更内容                                                   |
| -------------------------------------- | -------- | ---------------------------------------------------------- |
| `SkillCreatorService.ts`               | 修正     | progress flow 定義追加・共通 helper 追加・work step の整理 |
| `SkillCreatorService.progress.test.ts` | 新規作成 | mode 別 progress sequence の検証（既存14件は維持）         |

### 依存関係確認

| 確認項目                          | 結果                                                                              |
| --------------------------------- | --------------------------------------------------------------------------------- |
| IPC層への影響                     | なし（onProgress はオプショナル）                                                 |
| Preload層への影響                 | なし                                                                              |
| renderer層への影響                | なし（通知受信側は変更不要）                                                      |
| 共有型（packages/shared）への影響 | なし                                                                              |
| FUP-02（定数化）との重複          | 定数化済みなら参照、未完了なら `SkillCreatorService.ts` 内の private 定義に閉じる |

## 実行タスク

既存成果物と前後 Phase の差分を照合する。

- 受入条件と実装結果の整合を確認する。
- 必要な修正を後続 Phase へ引き継ぐ。

## 参照資料

- `artifacts.json`
- `outputs/artifacts.json`
- 関連する前後 Phase の成果物

## 統合テスト連携

- 検証結果は後続 Phase の品質ゲートへ引き継ぐ。
- 自動テスト結果と矛盾しないことを確認する。

## 成果物

| 成果物                          | パス                                              |
| ------------------------------- | ------------------------------------------------- |
| TASK-SW-STREAM-FUP-03-design.md | `outputs/phase-2/TASK-SW-STREAM-FUP-03-design.md` |

## 完了条件

- [ ] progress flow の単一集約方針が確定している
- [ ] `createSkill()` を orchestration point にする設計が確定している
- [ ] `done` は 1 回だけ発火する方針が確定している

## タスク100%実行確認【必須】

- [ ] progress flow の正本を 1 箇所に決めた
- [ ] private method を progress literal から切り離した
- [ ] `create` モードの回帰を保つ方針を明文化した
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 3: 設計レビュー](./phase-3-design-review.md)
