# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase      | 2                                |
| Phase名    | 設計                             |
| 前提Phase  | Phase 1                          |
| 後続Phase  | Phase 3                          |
| ステータス | 未実施                           |
| 作成日     | 2026-02-12                       |
| 機能名     | UT-STORE-HOOKS-TEST-REFACTOR-001 |

---

## 目的

agentSlice.selectors.test.tsのrenderHookパターンへの移行設計を行い、既存のauthModeSlice/llmSliceテストパターンとの統一方針を策定する。

## 背景

Phase 1で特定した移行対象（agentSlice.selectors.test.ts）に対し、既に成功しているauthModeSlice/llmSliceのrenderHookパターンを参考に、移行設計を行う。

---

## 実行タスク

### タスク1: 既存renderHookパターンの分析

**目的**: authModeSlice/llmSliceテストの共通パターンを抽出し、agentSliceへの適用方針を策定

**実行手順**:

1. authModeSlice.selectors.test.tsのテスト構造を分析
   - importパターン
   - beforeEachでのStore初期化方法
   - renderHookの使い方
   - 参照安定性テストのパターン
   - 無限ループ防止テストのパターン
2. llmSlice.selectors.test.tsの同様の分析
3. 共通パターンの抽出

### タスク2: agentSlice移行設計

**目的**: agentSlice.selectors.test.tsの具体的な移行計画を策定

**実行手順**:

1. agentSliceテストのカテゴリ別移行方針を決定:
   - CAT-01（状態セレクタ初期値）: getState() → renderHook
   - CAT-02（状態セレクタ値取得）: getState() → renderHook + act()
   - CAT-03（アクションセレクタ存在）: getState() → renderHook
   - CAT-04（アクション実行）: getState() → renderHook + act()
   - CAT-05（参照安定性）: 独自パターン → authMode/llmパターン統一
   - CAT-06（再レンダー最適化）: 維持または強化
   - CAT-07（無限ループ防止）: **意味的変化あり** -- 現在はZustand API直接テスト（getState関数の安定性）だが、renderHook移行後はReactライフサイクルテスト（Hook返却値の安定性）に変わる。テスト名の見直しが必要
   - CAT-08（非同期アクション）: getState() → renderHook + act() + waitFor
   - CAT-09（エラーハンドリング）: getState() → renderHook + act()

2. テストユーティリティの共通化設計:
   - resetStore() 関数の統一
   - createMockElectronAPI() の統一
   - renderHookヘルパーの検討

3. electronAPI mockのスコープ拡張設計:
   - 現在のagentSliceテストは `window.electronAPI.skill` のみmock
   - renderHook移行後は `useAppStore` 経由のため、electronAPI全体（authMode + llm + skill 3セクション）のmockが必要
   - authModeSlice/llmSliceテストのmockパターンを参考に、共通化を設計

4. afterEachでのcleanup()追加設計:
   - renderHookはReactコンポーネントをマウントするため、テスト後のクリーンアップが必要
   - `@testing-library/react` の `cleanup()` をafterEachに追加

### タスク3: テストファイル構造設計

**目的**: 移行後のテストファイル構造を設計

**設計方針**:

```typescript
// agentSlice.selectors.test.ts 移行後の構造
import { renderHook, act, cleanup } from "@testing-library/react";
import { useAppStore } from "../../appStore";
// 個別セレクタHook群のimport（23個）

describe("AgentSlice セレクタHook テスト", () => {
  beforeEach(() => {
    // resetStore()でストアをリセット
    // mockElectronAPIの設定（authMode + llm + skill 3セクション）
  });

  afterEach(() => {
    cleanup(); // renderHookのクリーンアップ
    vi.restoreAllMocks(); // モック完全復元（clearではなくrestore）
  });

  describe("状態セレクタ（13個）", () => {
    // renderHook(() => useXxx()) パターン
  });

  describe("アクションセレクタ（10個）", () => {
    // renderHook(() => useXxxAction()) パターン
  });

  describe("参照安定性", () => {
    // rerender() で同一参照を検証
  });

  describe("無限ループ防止（P31対策）", () => {
    // 状態変更後のアクション参照安定性テスト
    // ※ Reactライフサイクルでの検証に変更
  });

  describe("非同期アクション", () => {
    // renderHook + act + waitFor パターン
  });

  describe("エクスポート検証", () => {
    // 全23個のHookがindex.tsからexportされていることを確認
  });
});
```

---

## 参照資料

| 参照資料                     | パス                                                                               | 内容                      |
| ---------------------------- | ---------------------------------------------------------------------------------- | ------------------------- |
| Phase 1成果物                | `outputs/phase-1/requirements.md`                                                  | 要件定義・移行対象        |
| agentSliceテスト（移行対象） | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.selectors.test.ts`    | 現在のgetState()パターン  |
| authModeSliceテスト（手本）  | `apps/desktop/src/renderer/store/slices/__tests__/authModeSlice.selectors.test.ts` | renderHookパターンの手本  |
| llmSliceテスト（手本）       | `apps/desktop/src/renderer/store/slices/__tests__/llmSlice.selectors.test.ts`      | renderHookパターンの手本  |
| 状態管理ルール               | `.claude/rules/03-state-management.md`                                             | Zustand設計原則           |
| 過去の教訓                   | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`             | 1 selector = 1 field 原則 |
| 状態管理仕様                 | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`       | 個別セレクタカタログ      |

---

## 統合テスト連携

- テストユーティリティの共通化設計（resetStore, createMockElectronAPI）
- 3つのSliceテスト間のパターン統一方針

---

## 成果物

| 成果物           | パス                                  | 説明                           |
| ---------------- | ------------------------------------- | ------------------------------ |
| 移行設計書       | `outputs/phase-2/migration-design.md` | renderHook移行の詳細設計       |
| テスト構造設計書 | `outputs/phase-2/test-structure.md`   | 移行後のテストファイル構造設計 |

---

## 完了条件

- [ ] 既存renderHookパターン（authMode/llm）の分析が完了
- [ ] agentSliceの全カテゴリ（CAT-01〜CAT-09）の移行方針が決定
- [ ] テストファイル構造設計が完了
- [ ] テストユーティリティの共通化方針が決定
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 次のPhase

完了後、以下のファイルを実行してください:
`docs/30-workflows/UT-STORE-HOOKS-TEST-REFACTOR-001/phase-3-design-review.md`
