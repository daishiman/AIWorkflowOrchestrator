# Phase 3: 設計レビュー

Phase 1（現状分析）と Phase 2（解決策設計）の整合性・タスク粒度・漏れを検査し、実装タスクID案を確定する。

---

## 1. Phase 1・2 の整合性チェック

### 問題1 (Streaming進捗) の整合性

| 観点             | Phase 1 の記述                                                | Phase 2 の記述                                                    | 判定 |
| ---------------- | ------------------------------------------------------------- | ----------------------------------------------------------------- | ---- |
| 根本原因         | `sendSkillCreatorProgress()` の呼び出し元が存在しない（:692） | `SKILL_CREATOR_CREATE` ハンドラー（:276）でコールバック接続が欠落 | 一致 |
| 修正対象         | `skillCreatorHandlers.ts` および `SkillCreatorService.ts`     | 同上 + コールバック引数の追加                                     | 一致 |
| フロント側の状態 | 変更不要（`useStreamingProgress.ts` は正しく実装済み）        | フロント側は変更不要と明記                                        | 一致 |
| 影響範囲         | `GenerateStep.tsx` のプログレスバーが常に初期状態             | 接続すれば解消できると評価                                        | 一致 |

**判定: 整合**

補足: Phase 2 でコールバック引数の型を `{ phase: string; percentage: number; message: string }` とした。これは `useStreamingProgress.ts:62-68` の `StreamingProgressApi.onProgress` の引数型と完全に一致しており、型安全性が確保されている。

### 問題2 (キャンセル処理) の整合性

| 観点           | Phase 1 の記述                                                                 | Phase 2 の記述                                            | 判定 |
| -------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------- | ---- |
| 根本原因       | IPC チャンネルと Preload メソッドが存在しない                                  | `SKILL_CREATOR_CANCEL` チャンネルを shared に追加する方針 | 一致 |
| 修正層         | shared channels / Preload / メインプロセス / フロント の全4層                  | 4層すべてに修正を割り当て（CANCEL-001〜004）              | 一致 |
| コメントの誤記 | `:30` の「AbortController.abort() でメインプロセス側も中断される」は将来の意図 | IPC 呼び出しを追加することで正しい動作にする              | 一致 |

**判定: 整合**

補足: Phase 2 の解決策B（Preload への追加）で `ALLOWED_INVOKE_CHANNELS` への追加が必要と明記されている。Phase 1 では触れていない点だが、`safeInvoke` の仕組み（`invokeWithTimeout` がホワイトリスト検証を行う）を踏まえると必須の対応であり、Phase 2 が Phase 1 を正しく補完している。

### 問題3 (structurePlan未統合) の整合性

| 観点              | Phase 1 の記述                                                                       | Phase 2 の記述                                                                | 判定                                   |
| ----------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- | -------------------------------------- |
| 根本原因          | `:126` の `void structurePlan` が意図的なプレースホルダー                            | 同上を特定した上で接続方法を設計                                              | 一致                                   |
| 追加問題          | `runCreateWorkflow` の `purpose` / `agents` フィールドに意味的に誤った値が入っている | TASK-SW-STRUCT-001 で先に出力仕様を修正し、その後 STRUCT-002 で接続すると定義 | 一致（Phase 2 が追加問題を正しく分解） |
| LLM呼び出しの要否 | Phase 1 では言及なし                                                                 | Phase 2 リスク2として LLM 統合を別タスクへ分離する方針を記載                  | 補完（矛盾なし）                       |

**判定: 整合**

### 問題4 (TODO) の整合性

| 観点         | Phase 1 の記述                                              | Phase 2 の記述                                   | 判定                           |
| ------------ | ----------------------------------------------------------- | ------------------------------------------------ | ------------------------------ |
| 現状         | UIとして正常機能、Low優先度                                 | 完了状況確認 + コメント整理として1タスクに収める | 一致                           |
| 対象タスクID | `UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001` の完了状況が不明 | 確認を前提に2択の対応方針を提示                  | 一致（不確定要素を適切に分岐） |

**判定: 整合**

---

## 2. タスク粒度の適切性チェック

### 評価基準

各タスクが「単独で実装・レビュー・テストができる」最小単位であるかを評価する。

### TASK-SW-STREAM-001

- **責務**: `SkillCreatorService.createSkill` にコールバック引数を追加し、処理の節目で呼び出す
- **変更ファイル数**: 1（`SkillCreatorService.ts`）
- **テスト更新**: `createSkill` を呼ぶテストでモック引数の型更新が必要
- **完結性**: コールバック引数はオプショナルのため、単独でマージ可能
- **判定: 適切**

### TASK-SW-STREAM-002

- **責務**: `skillCreatorHandlers.ts` で `createSkill` 呼び出し箇所にコールバックを接続
- **変更ファイル数**: 1（`skillCreatorHandlers.ts`）
- **前提**: STREAM-001 完了後（コールバック引数が存在することが前提）
- **完結性**: 依存関係が明確で単独でレビュー可能
- **判定: 適切**

### TASK-SW-CANCEL-001

- **責務**: `packages/shared/src/ipc/channels.ts` にチャンネル定数を1行追加
- **変更ファイル数**: 1（shared）
- **完結性**: 非常に小さく、単独でマージ可能
- **判定: 適切（ただし小さすぎる点は許容範囲）**

### TASK-SW-CANCEL-002

- **責務**: Preload API に `cancelGeneration` メソッドとインターフェース定義を追加
- **変更ファイル数**: 1（`skill-creator-api.ts`）、`channels.ts` の `ALLOWED_INVOKE_CHANNELS` 更新も含む
- **注意**: `ALLOWED_INVOKE_CHANNELS` への追加は `channels.ts` の変更を伴うため、変更ファイルは実質2ファイル
- **判定: 適切**

### TASK-SW-CANCEL-003

- **責務**: `SkillCreatorService` にキャンセルフラグ追加 + `skillCreatorHandlers.ts` にハンドラー追加
- **変更ファイル数**: 2（`SkillCreatorService.ts` + `skillCreatorHandlers.ts`）
- **懸念**: 2ファイルにまたがる点で粒度がやや大きい
- **推奨**: `SkillCreatorService` のキャンセル機能追加と、ハンドラーへの配線を別タスクに分割することも可能だが、この2ファイルは密結合しており一括レビューが望ましいため現状の粒度を維持
- **判定: 適切（やや大きいが許容範囲）**

### TASK-SW-CANCEL-004

- **責務**: `useCancelGeneration.ts` のみを変更して IPC 呼び出しを追加
- **変更ファイル数**: 1
- **完結性**: CANCEL-003 完了後に単独実施可能
- **判定: 適切**

### TASK-SW-STRUCT-001

- **責務**: `runCreateWorkflow` の `purpose` / `agents` フィールドを意味的に正しい値に修正
- **変更ファイル数**: 1（`SkillCreatorService.ts`）
- **完結性**: STRUCT-002 の前提として独立して完結可能
- **判定: 適切**

### TASK-SW-STRUCT-002

- **責務**: `:126` の `void structurePlan` 削除 + SKILL.md 生成の `plan` オブジェクトを `structurePlan` ベースに切り替え
- **変更ファイル数**: 1（`SkillCreatorService.ts`）
- **完結性**: STRUCT-001 完了後に単独実施可能
- **判定: 適切**

### TASK-SW-TODO-001

- **責務**: `UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001` 完了状況確認 + TODOコメント整理
- **変更ファイル数**: 1（`ConversationRoundStep.tsx`）、コメント整理のみ
- **判定: 適切**

---

## 3. 漏れている観点のチェック

### 3.1 テスト更新の扱い

Phase 2 はリスク1として「テストコードとモックの更新が必要」と述べているが、テスト更新を各タスクに含めるか別タスクにするかが明示されていない。

**判断**: 各実装タスク（STREAM-001、CANCEL-003、STRUCT-002）に対応テスト更新を含めることを前提とする。テストは実装の完了条件の一部として扱う。

### 3.2 `startGeneration()` の AbortSignal 利用

`useCancelGeneration.ts:19-23` の `startGeneration()` は `AbortSignal` を返すが、返却された `AbortSignal` が呼び出し元でどう使われているかを確認していない。

確認が必要な点:

- `AbortSignal` が `skillCreatorAPI.createSkill()` の呼び出しに渡されているか
- `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx:237` で `cancelGeneration` を使用しているが、`startGeneration` の戻り値を利用している箇所があるか

**リスク**: `AbortSignal` が現在フロント内でも活用されていない場合、TASK-SW-CANCEL-004 の実装だけで十分だが、活用されている場合は接続ロジックの変更が生じる。

**対応**: TASK-SW-CANCEL-003 の実装前に `startGeneration` の利用箇所を確認する作業を TASK-SW-CANCEL-003 のスコープに含める。

### 3.3 `unregisterSkillCreatorHandlers` へのキャンセルハンドラー解除

`apps/desktop/src/main/ipc/skillCreatorHandlers.ts:708-723` の `unregisterSkillCreatorHandlers()` に `SKILL_CREATOR_CANCEL` の `removeHandler` を追加する必要がある。Phase 2 では言及がない。

**対応**: TASK-SW-CANCEL-003 のスコープに `unregisterSkillCreatorHandlers()` への追加を明示的に含める。

### 3.4 型定義ファイルへの反映

`apps/desktop/src/preload/types.ts:1865` に `skillCreatorAPI: import("./skill-creator-api").SkillCreatorAPI;` が定義されているため、`SkillCreatorAPI` インターフェースに `cancelGeneration` を追加すれば型は自動で伝播する。明示的な追加作業は不要。

**判断**: 追加タスク不要（TASK-SW-CANCEL-002 の一部として自動的に対応される）。

### 3.5 `GenerateStep.tsx` の props との接続

Phase 1 の影響範囲で指摘したように `GenerateStep.tsx` は `stage` / `percent` / `message` を props として受け取る純粋なコンポーネントで、データは `useStreamingProgress()` フックから供給される。`SkillCreateWizard.tsx` 内での `streaming` 変数（`useStreamingProgress()` の戻り値）が `GenerateStep` に渡されているかを確認していない。

**確認事項**: `SkillCreateWizard.tsx` で `streaming.stage` / `streaming.percent` / `streaming.message` が `GenerateStep` に渡されているか。接続されていなければ TASK-SW-STREAM-002 のスコープに追加が必要。

---

## 4. 最終タスクID案の確定

### 確定タスクID一覧

| タスクID           | 問題  | 優先度 | 前提タスク | 修正対象ファイル                                    |
| ------------------ | ----- | ------ | ---------- | --------------------------------------------------- |
| TASK-SW-STREAM-001 | 問題1 | High   | なし       | `SkillCreatorService.ts`                            |
| TASK-SW-STREAM-002 | 問題1 | High   | STREAM-001 | `skillCreatorHandlers.ts`                           |
| TASK-SW-CANCEL-001 | 問題2 | High   | なし       | `packages/shared/src/ipc/channels.ts`               |
| TASK-SW-CANCEL-002 | 問題2 | High   | CANCEL-001 | `skill-creator-api.ts`、`preload/channels.ts`       |
| TASK-SW-CANCEL-003 | 問題2 | High   | CANCEL-002 | `SkillCreatorService.ts`、`skillCreatorHandlers.ts` |
| TASK-SW-CANCEL-004 | 問題2 | High   | CANCEL-003 | `useCancelGeneration.ts`                            |
| TASK-SW-STRUCT-001 | 問題3 | High   | なし       | `SkillCreatorService.ts`                            |
| TASK-SW-STRUCT-002 | 問題3 | High   | STRUCT-001 | `SkillCreatorService.ts`                            |
| TASK-SW-TODO-001   | 問題4 | Low    | なし       | `ConversationRoundStep.tsx`                         |

### 実施順序の推奨

ファイル衝突ドメイン:

- `SkillCreatorService.ts` 共有書き込み面: `TASK-SW-STREAM-001` / `TASK-SW-STRUCT-001` / `TASK-SW-STRUCT-002` / `TASK-SW-CANCEL-003`
- `skillCreatorHandlers.ts` 共有書き込み面: `TASK-SW-STREAM-002` / `TASK-SW-CANCEL-003`
- 上記ドメイン内のタスクは、依存関係がなく見えても同時編集を避けるため同一ワーカーにまとめるか直列化する
- `TASK-SW-CANCEL-001` / `TASK-SW-CANCEL-002` / `TASK-SW-CANCEL-004` / `TASK-SW-TODO-001` は共有書き込み面から外れるため、前提タスク充足後の並列候補として維持する

```
フェーズ1（ファイル衝突なしの範囲で並列実施可）:
  TASK-SW-STREAM-001
  TASK-SW-CANCEL-001
  TASK-SW-STRUCT-001

フェーズ2（フェーズ1の各チェーンが完了次第。共有書き込み面ごとに直列化）:
  TASK-SW-STREAM-002  ← STREAM-001 完了後。`skillCreatorHandlers.ts` を共有するため CANCEL-003 と同時実施しない
  TASK-SW-CANCEL-002  ← CANCEL-001 完了後
  TASK-SW-STRUCT-002  ← STRUCT-001 完了後。`SkillCreatorService.ts` を共有するため STREAM-001 / CANCEL-003 と同時実施しない

フェーズ3（共有書き込み面の集約フェーズ）:
  TASK-SW-CANCEL-003  ← CANCEL-002 完了後。`SkillCreatorService.ts` と `skillCreatorHandlers.ts` の両方を共有するため、STREAM-001 / STREAM-002 / STRUCT-001 / STRUCT-002 と同一ワーカーで直列実施する

フェーズ4:
  TASK-SW-CANCEL-004  ← CANCEL-003 完了後

フェーズ5（最後・低優先度）:
  TASK-SW-TODO-001
```

補足:

- `SkillCreatorService.ts` を触る `STREAM-001` / `STRUCT-001` / `STRUCT-002` / `CANCEL-003` は、レビュー競合とマージ競合を避けるため同じワーカーにまとめる構成が最も安全
- `skillCreatorHandlers.ts` を触る `STREAM-002` / `CANCEL-003` も同じワーカーに寄せると、進捗通知配線とキャンセル配線の整合を一度で確認できる

### タスクID 命名規則の確認

既存のタスクIDパターン（コードベース内の `TASK-SC-07-STREAMING-PROGRESS-UI`、`TASK-SC-IMP-CREATE-WORKFLOW-001` など）と照合する。

- `SW` は `Skill Wizard / Skill Workflow` の略記として採用
- `STREAM` / `CANCEL` / `STRUCT` / `TODO` は問題の種類を示す
- 3桁連番は同一問題内の実施順を示す
- フォーマット: `TASK-SW-{カテゴリ}-{3桁連番}` — 既存パターンと一致

### スコープ追加事項（Phase 2 からの更新）

レビューで判明した以下の2点を各タスクのスコープに追加する:

1. **TASK-SW-CANCEL-003 に追加**: `unregisterSkillCreatorHandlers()` への `SKILL_CREATOR_CANCEL` の `removeHandler` 追加
2. **TASK-SW-CANCEL-003 に追加（事前確認）**: `useCancelGeneration.startGeneration()` の戻り値（`AbortSignal`）の利用箇所を確認し、接続ロジックへの影響を評価

---

## 5. 総合評価

| チェック項目        | 結果                                                                            |
| ------------------- | ------------------------------------------------------------------------------- |
| Phase 1・2 の整合性 | 全4問題で整合確認。矛盾なし                                                     |
| タスク粒度の適切性  | 全9タスクが単独実施可能。CANCEL-003 のみわずかに大きいが許容範囲                |
| 漏れている観点      | 3点を発見・対応方針を記述（CANCEL-003 スコープ追加2点、STREAM-002 確認事項1点） |
| タスクID案          | 9タスクを確定。命名規則は既存パターンと一致                                     |

Phase 1・2・3 の設計書3ファイルにより、実装タスク仕様書（Phase 4 以降）の作成に必要な情報が揃った状態である。

---

## 実装反映メモ（2026-04-16）

- `TASK-SW-CANCEL-001`〜`TASK-SW-CANCEL-004` は current worktree で実装済み
- `SkillCreatorService` の abort 伝播、Preload whitelist/API、Main handler、Renderer hook まで cancel chain は接続済み
- `pnpm typecheck` と対象 vitest は PASS しており、設計で確認した 4 層の整合性は実装後も維持されている
