# タスク仕様書: AbortSignal を他の長時間 store action（analyzeSkill / autoImproveSkill）へ横展開

## メタ情報

```yaml
issue_number: 2411
task_id: UT-CANCEL-005-01
task_name: AbortSignal を他の長時間 store action（analyzeSkill / autoImproveSkill）へ横展開
category: 改善
priority: 中
scale: 中規模
status: 未実施
created_date: 2026-04-22
dependencies: [UT-CANCEL-004-01]
```

| 項目         | 内容                         |
| ------------ | ---------------------------- |
| タスクID     | UT-CANCEL-005-01             |
| ステータス   | 未実施                       |
| 優先度       | 中                           |
| 規模         | 中規模                       |
| 見積もり工数 | M                            |
| 依存タスク   | UT-CANCEL-004-01（完了済み） |
| 作成日       | 2026-04-22                   |

## 概要

UT-CANCEL-004-01 で確立した「`signal?: AbortSignal` を store action の引数として受け取り、Renderer ガード（`if (signal?.aborted) return`）で消費する」設計パターンを、`analyzeSkill` および `autoImproveSkill` アクションへ横展開する。これにより、スキル分析・全自動改善フローでもユーザーがキャンセル操作を行った際に Renderer 層で即時中断できるようになる。

## 背景・動機

現在 `agentSlice.ts` の `createSkill` は `signal?: AbortSignal` を受け取り Renderer ガードを実装している（UT-CANCEL-004-01 完了済み）。しかし同じく長時間実行となり得る `analyzeSkill` と `autoImproveSkill` には signal 引数が存在しない。

```
[現状の signal 対応状況]
createSkill       → signal?: AbortSignal  ✅ 実装済み（UT-CANCEL-004-01）
analyzeSkill      → signal 引数なし       ❌ 未対応
autoImproveSkill  → signal 引数なし       ❌ 未対応
applySkillImprovements → signal 引数なし  ❌ 未対応（参考：今回スコープ外）
```

ユーザーが分析・自動改善中にキャンセルボタンを押しても、Renderer 側の AbortSignal が `analyzeSkill` / `autoImproveSkill` に届かず、ガードが機能しない。Main 層の IPC キャンセルは動作するが、Renderer Store 層の早期リターンが効かないため UX が不整合になる。

## スコープ

### 含む

- `agentSlice.ts` の `analyzeSkill` 型定義（line 360 付近）に `signal?: AbortSignal` を追加
- `agentSlice.ts` の `autoImproveSkill` 型定義（line 367 付近）に `signal?: AbortSignal` を追加
- `analyzeSkill` 実装（line 1093 付近）への signal Renderer ガード追加
- `autoImproveSkill` 実装（line 1174 付近）への signal Renderer ガード追加
- `analyzeSkill` 内の `window.electronAPI.skill.analyze()` 呼び出し後に signal チェックを挟む（autoImprove 内の再 analyze も同様）
- `analyzeSkill` / `autoImproveSkill` を呼び出しているコンポーネントへの signal 受け渡し実装
- 型チェック（`pnpm --filter @repo/desktop typecheck`）によるシグネチャ整合確認
- 対応テストファイルへの signal ガードパステスト追加

### 含まない

- `applySkillImprovements` への signal 追加（中断時の部分適用による不整合リスクがあるため別タスクで検討）
- Preload IPC ブリッジ層（`window.electronAPI.skill.analyze` / `autoImprove`）のシグネチャ変更
- Main 側 AbortController との新規接続（既存の Main キャンセル機構は維持）
- `useCancelGeneration` フックの仕様変更

## 受け入れ条件

- [ ] `agentSlice.ts` の `analyzeSkill` 型定義が `signal?: AbortSignal` を受け取る
- [ ] `agentSlice.ts` の `autoImproveSkill` 型定義が `signal?: AbortSignal` を受け取る
- [ ] `analyzeSkill` 実装の先頭で `if (signal?.aborted) return;` ガードが存在する
- [ ] `autoImproveSkill` 実装の先頭で `if (signal?.aborted) return;` ガードが存在する
- [ ] `analyzeSkill` 内の `window.electronAPI.skill.analyze()` 呼び出し後にも signal チェックが存在する（非同期待機後のガード）
- [ ] `autoImproveSkill` 内の再分析（`window.electronAPI.skill.analyze()` 二次呼び出し）前後にも signal チェックが存在する
- [ ] signal を渡していない既存呼び出し元でも型エラーが発生しない（オプショナル引数）
- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなしで完了する
- [ ] `analyzeSkill` に signal=aborted を渡した場合に即時リターンするユニットテストが PASS する
- [ ] `autoImproveSkill` に signal=aborted を渡した場合に即時リターンするユニットテストが PASS する
- [ ] signal=undefined（省略）の場合も従来どおり動作する既存テストが全て PASS する

## 技術的詳細

### 実装アプローチ

UT-CANCEL-004-01 で確立したパターンをそのまま踏襲する。

**型定義変更（agentSlice.ts line 360 / 367 付近）:**

```typescript
// 変更前
analyzeSkill: (skillName: string) => Promise<void>;
autoImproveSkill: (skillName: string) => Promise<void>;

// 変更後
analyzeSkill: (skillName: string, signal?: AbortSignal) => Promise<void>;
autoImproveSkill: (skillName: string, signal?: AbortSignal) => Promise<void>;
```

**実装変更（analyzeSkill 先頭ガード）:**

```typescript
analyzeSkill: async (skillName: string, signal?: AbortSignal) => {
  if (typeof skillName !== "string" || skillName.trim() === "") {
    set({ skillError: "スキル名が無効です" });
    return;
  }
  // Renderer ガード: IPC 非シリアライズ制約により Renderer 層で消費
  if (signal?.aborted) return;
  set({ isAnalyzing: true, ... });
  try {
    ...
    const result = await window.electronAPI.skill.analyze(skillName.trim());
    // 非同期待機後の 2 次ガード
    if (signal?.aborted) {
      set({ isAnalyzing: false });
      return;
    }
    set({ currentAnalysis: result, isAnalyzing: false, ... });
  } catch (error) { ... }
},
```

**autoImproveSkill も同様に:**

- 先頭ガード（`if (signal?.aborted) return;`）
- `window.electronAPI.skill.autoImprove()` 呼び出し後ガード
- 再分析 `window.electronAPI.skill.analyze()` 呼び出し後ガード

### 呼び出し元コンポーネント特定

`analyzeSkill` / `autoImproveSkill` を呼び出しているコンポーネントを grep で特定し、`useCancelGeneration` の `startGeneration()` が使われている場合は戻り値（AbortSignal）を受け取って渡す。使われていない場合はオプショナルのまま後続タスクで対応する。

### IPC シリアライズ制約

`AbortSignal` はシリアライズ不可のため IPC（`window.electronAPI`）には渡せない。Renderer ガードで消費する設計を維持する。この制約は `createSkill` 実装時と同一であり、既知の設計上の制限として受け入れる。

### 設計上の注意点

- `analyzeSkill` は `autoImproveSkill` / `applySkillImprovements` の内部からも呼ばれる（再分析）。これらの内部呼び出しには signal を透過させる（同一 signal で連鎖中断を実現）。
- `isAnalyzing` / `isImproving` フラグは signal 中断時も必ず `false` にリセットする（ローディング表示が固まらないよう）。

## 苦戦箇所・知見（同種の課題への備忘）

| 項目                       | 内容                                                                                                                                                                                                                         |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IPC シリアライズ壁         | `AbortSignal` は構造化クローンアルゴリズムでシリアライズ不可。IPC 境界では signal をそのまま渡せないため、Renderer 層のガードで「呼び出し前」と「非同期待機後」の2点でチェックする設計が必要                                 |
| 非同期待機後の 2 次ガード  | IPC 呼び出し（`await window.electronAPI.skill.analyze()`）は signal を認識しないため、await 完了後に再度 `signal?.aborted` を確認しないと中断が遅延する。特に analyzeSkill→autoImprove の連鎖では各 await 後にチェックが必要 |
| Vitest worktree mismatch   | worktree 環境では esbuild host/binary の mismatch により targeted test run が blocked になる既知制約がある。テスト実行は `pnpm typecheck` によるシグネチャ確認を最優先とし、テストは CI 環境での確認に委ねる                 |
| フラグリセット漏れ         | signal 中断時に `isAnalyzing` / `isImproving` を `false` に戻し忘れると、以降の操作でローディングスピナーが永続する。中断パスの `set({ isAnalyzing: false })` を必ず入れること                                               |
| オプショナル引数の後方互換 | `signal?: AbortSignal` はオプショナルのため既存の呼び出し元は変更不要。ただし呼び出し元に `useCancelGeneration` が存在する場合は積極的に signal を渡すよう修正する                                                           |

## フェーズ計画

- **Phase 1: 要件定義** — 本仕様書の確認・呼び出し元コンポーネントの洗い出し
- **Phase 2: 設計** — analyzeSkill・autoImproveSkill の signal チェックポイント設計、連鎖 analyze の signal 透過設計
- **Phase 3: agentSlice.ts 型定義更新** — analyzeSkill・autoImproveSkill 型シグネチャへの `signal?: AbortSignal` 追加
- **Phase 4: analyzeSkill 実装更新** — 先頭ガード・非同期待機後ガードの追加、フラグリセット確認
- **Phase 5: autoImproveSkill 実装更新** — 先頭ガード・autoImprove 後ガード・再分析後ガードの追加
- **Phase 6: 呼び出し元コンポーネント更新** — signal を受け取って渡しているコンポーネントの修正（`useCancelGeneration.startGeneration()` の戻り値を渡す）
- **Phase 7: 型チェック** — `pnpm --filter @repo/desktop typecheck` を実行しエラーがないことを確認
- **Phase 8: ユニットテスト追加** — signal=aborted ケースの Renderer ガードテスト追加（analyzeSkill・autoImproveSkill 各1件）
- **Phase 9: 既存テスト非回帰確認** — signal=undefined ケースで既存テストが PASS することを確認
- **Phase 10: リファクタリング・コードレビュー** — signal チェックの重複排除・可読性向上
- **Phase 11: CI 確認** — GitHub Actions での typecheck・test パス確認
- **Phase 12: ドキュメント更新** — 本タスク成果物の Phase 12 ドキュメント作成・LOGS.md 更新
- **Phase 13: 完了処理** — タスクステータスを completed に更新・次の横展開対象（applySkillImprovements 等）の unassigned task 作成検討
