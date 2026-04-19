# Phase 2: 設計

## メタ情報

| 項目       | 内容                                                                        |
| ---------- | --------------------------------------------------------------------------- |
| Phase      | 2                                                                           |
| 機能名     | TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE                                      |
| タスク名   | onProgressコールバック接続・useStreamingProgressモード別phaseマッピング拡張 |
| 前提Phase  | Phase 1                                                                     |
| 後続Phase  | Phase 3                                                                     |
| 作成日     | 2026-04-19                                                                  |
| ステータス | pending                                                                     |

## 目的

`onProgress` IPC接続とモード別 phase → stage マッピング拡張を満たす設計境界と依存関係を固定する。
`create` モード以外のモードでプログレス表示が退行しない状態を設計レベルで保証する。

## 背景

`useStreamingProgress.ts` の `PHASE_TO_STAGE` マップは `create` モード専用の5段階のみであり、
mode-specific な phase 名を `planning` に吸収してしまう。また `onProgress` コールバックが
Renderer 側に未接続のため、Main プロセスからの progress 通知が UI に届かない。

## SubAgentチーム編成

| SubAgent   | 関心ごと        | 主担当                             |
| ---------- | --------------- | ---------------------------------- |
| SubAgent-A | Main/IPC責務    | onProgress IPC配線・ライフサイクル |
| SubAgent-B | Preload/API契約 | SkillCreatorAPI型契約・公開境界    |
| SubAgent-C | Renderer/UX契約 | phaseマッピング・表示整合          |
| SubAgent-D | 統合監査        | 矛盾・漏れ・整合・依存判定         |

## 実行タスク

- 責務境界設計: Main/Preload/Rendererの責務を重複なしで定義する
- 契約設計: onProgress IPC引数/戻り値/エラー契約を単一形状に定義する
- phaseマッピング設計: モード別phase→stageマッピング拡張方針を定義する
- 依存設計: 依存Phaseと更新対象仕様書の結合点を定義する

## アーキテクチャ設計

### topology図

```
[Main Process]
  SkillCreatorService.executePlan()
    ↓ phase/percentage/message 通知
  webContents.send(SKILL_CREATOR_PROGRESS, data)
    ↓ IPC Push（SKILL_CREATOR_PROGRESSチャンネル）

[Preload]
  skill-creator-api.ts
    safeOn(SKILL_CREATOR_PROGRESS, callback)
    → onProgress(callback) として公開
    ↓ contextBridge 経由

[Renderer]
  SkillLifecyclePanel.tsx / useSkillLLMGeneration.ts
    window.skillCreatorAPI.onProgress((data) => {
      dispatch(setGenerationProgress(data))
    })
    ↓ Store更新
  generationProgressSlice.ts
    state.generationProgress = { phase, percentage, message }
    ↓ セレクタ経由
  GenerateStep.tsx
    generationProgress.message を aria-live="polite" で動的表示
    ↓ 表示
  useStreamingProgress.ts
    PHASE_TO_STAGE_MAP[phase] → StreamingGenerationStage
    ↓ ステージ変換
  プログレスバー/ステージUI更新
```

### 変更概要

| ファイル                     | 変更内容                                        | 変更種別 |
| ---------------------------- | ----------------------------------------------- | -------- |
| `useStreamingProgress.ts`    | PHASE_TO_STAGEマップをモード別に拡張            | 機能改善 |
| `generationProgressSlice.ts` | stage型拡張確認・必要に応じて追加               | 型拡張   |
| `SkillLifecyclePanel.tsx`    | onProgressコールバック接続（useEffect内）       | 機能実装 |
| `useSkillLLMGeneration.ts`   | 代替onProgress接続先（LifecyclePanel非採用時）  | 機能実装 |
| `GenerateStep.tsx`           | 静的テキスト→generationProgress.message動的表示 | UI改善   |
| `skill-creator-api.ts`       | onProgress型定義確認（変更なしの場合あり）      | 型確認   |

## SubAgent lane設計

### SubAgent-A: Main/IPC責務

- SKILL_CREATOR_PROGRESSチャンネルの送信元（SkillCreatorService）確認
- webContents.send呼び出しタイミングとライフサイクルを確認
- Main側の実装変更は不要（TASK-SW-STREAM-FUP-03で完了済み）

### SubAgent-B: Preload/API契約

- `skill-creator-api.ts` の `SkillCreatorProgress` 型契約確認
- `safeOn` パターンによるリスナー登録方式を確認
- onProgressコールバックの公開API形式を確認
- 型不備がある場合は型定義を修正

### SubAgent-C: Renderer/UX契約

- `useStreamingProgress.ts` のPHASE_TO_STAGEマップ拡張実装
- `SkillLifecyclePanel.tsx` または `useSkillLLMGeneration.ts` へのonProgress接続
- `GenerateStep.tsx` の動的テキスト表示切り替え
- useEffect cleanupでリスナー解除を実装

### SubAgent-D: 統合監査

- 3 SubAgentの成果物を統合し矛盾・漏れ・整合・依存を判定
- AC-1〜AC-6 の充足確認
- 依存タスク（TASK-SW-STREAM-FUP-03, TASK-SW-STREAM-002）との整合確認

## 実装設計

### PHASE_TO_STAGEマップのモード別拡張方針

現在の `PHASE_TO_STAGE` は `create` モード専用の5段階のみ。
拡張方針として **フラットマップ方式** を採用する（モードをキーに階層化せず、全phase名を1つのマップで管理）。

理由: phase名はモード間で重複しない命名規則になっているため、フラットマップで管理しても衝突しない。

```typescript
// 拡張後のPHASE_TO_STAGE（設計案）
const PHASE_TO_STAGE: Record<string, StreamingGenerationStage> = {
  // create モード（既存）
  planning: "planning",
  "generating-skill": "generating-skill",
  "generating-agents": "generating-agents",
  validating: "validating",
  done: "done",

  // update モード
  "loading-skill": "planning",
  analyzing: "planning",

  // collaborative / orchestrate / improve-prompt モード
  "engine-selection": "planning",
  improving: "generating-skill",
};
// 未知のphaseはフォールバック（"planning"）を維持
```

**モード別phase→stageマッピング方針:**

| モード         | phase名            | マップ先stage    | 理由                             |
| -------------- | ------------------ | ---------------- | -------------------------------- |
| update         | `loading-skill`    | planning         | 読み込みは準備段階               |
| update         | `analyzing`        | planning         | 分析は planning クラスタ         |
| collaborative  | `planning`         | planning         | 既存 create と同じ入口           |
| orchestrate    | `engine-selection` | planning         | 実行エンジン選択は最初の意思決定 |
| improve-prompt | `improving`        | generating-skill | 改善本体を生成フェーズとして扱う |

**mode-specific stage追加の要否:**

既存の `StreamingGenerationStage` 型（idle/planning/generating-skill/generating-agents/validating/done/error/cancelled）に
新規stageを追加する必要はない。`loading-skill` / `analyzing` / `engine-selection` / `improving` を既存stageへ写像し、UI側の複雑性を増やさずに current facts へ追従する。

### onProgress接続パターン

**接続先の選択:**

`SkillLifecyclePanel.tsx` を優先的な接続先とする。
理由: `executePlan` 呼び出しを管理するコンポーネントであり、アンマウント時クリーンアップが自然に実装できる。
`useSkillLLMGeneration.ts` はフック単位の責務分離が必要な場合の代替とする。

**接続パターン（useEffect）:**

```typescript
useEffect(() => {
  if (!isGenerating) return;

  const unsubscribe = window.skillCreatorAPI.onProgress((data) => {
    dispatch(setGenerationProgress(data));
  });

  return () => {
    unsubscribe(); // リスナー解除（P5: 二重登録防止）
  };
}, [isGenerating, dispatch]);
```

**isGeneratingガードとの協調:**

- `isGenerating=true` の間のみ `onProgress` リスナーを登録する
- `isGenerating` が `false` に転向した時点でリスナーを解除する
- これにより生成完了後の遅延通知による不正な状態遷移を防止する

### GenerateStep.txsの動的表示

```tsx
// 変更前: 静的テキスト
<p>計画を生成中...</p>

// 変更後: generationProgress.messageを動的表示
<p aria-live="polite">
  {generationProgress?.message ?? "生成中..."}
</p>
```

## IPC設計

### safeOnパターン（既存パターンの踏襲）

```typescript
// skill-creator-api.ts（Preload）
onProgress: (callback: (data: SkillCreatorProgress) => void) => {
  return safeOn(SKILL_CREATOR_PROGRESS, (_event, data) => {
    callback(data);
  });
},
```

- `safeOn` はリスナーを登録し、解除関数を返す
- 返却された解除関数を useEffect の cleanup で呼び出す
- SKILL_CREATOR_PROGRESSチャンネルは TASK-SW-STREAM-002 で既設
- P5（リスナー二重登録）防止: useEffect の依存配列に `isGenerating` を含め、
  `isGenerating=true` 開始時のみリスナーを登録し、終了時に解除する

### SkillCreatorProgress型

```typescript
// skill-creator-api.ts（既存）
export interface SkillCreatorProgress {
  phase: string; // "loading-skill" / "analyzing" / "engine-selection" 等のphase名
  percentage: number; // 進捗率（0-100）
  message: string; // UIに表示するメッセージテキスト
}
```

## テスト戦略

### モード別マッピングのユニットテスト方針

| テスト対象                      | テスト種別 | 検証内容                                            |
| ------------------------------- | ---------- | --------------------------------------------------- |
| PHASE_TO_STAGE（create モード） | unit       | 既存5段階が正しくマッピングされること               |
| PHASE_TO_STAGE（update モード） | unit       | update固有3phaseが正しいstageにマッピングされること |
| PHASE_TO_STAGE（collaborative） | unit       | collaborativeの「準備」phaseが"planning"になること  |
| 未知のphaseフォールバック       | unit       | 未知phaseが"planning"にフォールバックすること       |
| onProgressコールバック接続      | unit/mock  | executePlan中にdispatchが呼ばれること               |
| リスナークリーンアップ          | unit       | isGenerating=falseでリスナーが解除されること        |
| generationProgress Store更新    | unit       | setGenerationProgressがStoreを正しく更新すること    |
| GenerateStep動的表示            | component  | generationProgress.messageが表示に反映されること    |

### テストファイル配置

```
apps/desktop/src/renderer/hooks/__tests__/useStreamingProgress.test.ts
apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx
apps/desktop/src/renderer/components/skill/wizard/__tests__/GenerateStep.test.tsx
```

## 依存整合マトリクス

| 依存タスク                       | 依存内容                                      | 整合確認                                           |
| -------------------------------- | --------------------------------------------- | -------------------------------------------------- |
| TASK-SW-STREAM-FUP-03            | SkillCreatorService のmode-specific phase定義 | Main側phase名と本タスクのマッピングが一致すること  |
| TASK-SW-STREAM-002               | SKILL_CREATOR_PROGRESSチャンネル IPC配線      | チャンネル名・データ形式が一致すること             |
| TASK-SC-06-UI-RUNTIME-CONNECTION | generationProgress Store設計                  | setGenerationProgress/セレクタの形式が一致すること |

### 前提完了確認

- TASK-SW-STREAM-FUP-03: SkillCreatorService側のprogress phaseがmode-specific拡張済みであること
- TASK-SW-STREAM-002: SKILL_CREATOR_PROGRESSチャンネルがIPC配線済みであること
- 上記が未完了の場合、本タスクのIPC接続テストが通らない

## validation path

```
phase → PHASE_TO_STAGE lookup
  → StreamingGenerationStage
  → generationProgressSlice.setState
  → useSelector(selectGenerationProgress)
  → GenerateStep.tsx aria-live表示
  → pnpm typecheck PASS
  → AC-1〜AC-6 全件充足
```

## 参照資料

| 参照資料             | パス                                                         | 説明           |
| -------------------- | ------------------------------------------------------------ | -------------- |
| 要件定義書           | `outputs/phase-1/requirements-definition.md`                 | Phase 1 成果物 |
| 受け入れ基準         | `outputs/phase-1/acceptance-criteria.md`                     | Phase 1 成果物 |
| 仕様抽出結果         | `outputs/phase-1/aiworkflow-requirements-extraction.md`      | Phase 1 成果物 |
| 差分カバレッジ       | `outputs/phase-1/branch-diff-coverage.md`                    | Phase 1 成果物 |
| トレーサビリティ行列 | `outputs/phase-1/implementation-spec-traceability-matrix.md` | Phase 1 成果物 |

## 実行手順

1. 入力成果物（Phase 1の成果物）を確認する。
2. SubAgent-A/B/C を並列実行し、SubAgent-D で統合判定する。
3. 成果物を outputs/phase-2/ に定義する。
4. 完了条件で矛盾・漏れ・整合・依存を判定する。

## 統合テスト連携

- SubAgent-A/B/C の検証ケースを並列で設計する。
- SubAgent-D が統合順序を直列で確定する。
- onProgress IPC経路（SKILL_CREATOR_PROGRESSチャンネル）を統合対象に固定する。
- phase変換・Store更新・UI表示の3層を統合対象とする。
- モード別（create/update/collaborative）で進捗が正しく表示されることを確認する。
- 統合ログは `outputs/phase-2/` に保存する。

## 多角的チェック観点

| 観点     | 確認内容                                                            |
| -------- | ------------------------------------------------------------------- |
| 矛盾     | phase名とstageのマッピングが意味論的に矛盾していないか確認する      |
| 漏れ     | AC-1〜AC-6 が設計に全て反映されているか確認する                     |
| 整合性   | Main側phase名とRenderer側マッピングが一致しているか確認する         |
| 依存関係 | TASK-SW-STREAM-FUP-03/002の完了前提で本設計が成立しているか確認する |

## 成果物

| 成果物             | パス                                               | 説明                     |
| ------------------ | -------------------------------------------------- | ------------------------ |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`           | 層別責務設計             |
| IPC契約設計        | `outputs/phase-2/ipc-contract-design.md`           | onProgress I/O契約       |
| テスト戦略         | `outputs/phase-2/test-strategy.md`                 | モード別マッピングテスト |
| 依存整合マトリクス | `outputs/phase-2/dependency-consistency-matrix.md` | 依存タスク整合確認表     |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 整合性が取れていることを確認
- [ ] 依存関係が取れていることを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. SubAgent-A/B/C の並列作業
3. SubAgent-D の統合判定
4. 成果物出力
5. 完了条件判定

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE
```

## 次のPhase

Phase 3: 設計レビューゲート
