---
task_id: TASK-RALLY-009
task_name: getSkillCreatorApi()型ガード強化
task_type: NON_VISUAL
category: improvement
status: not_started
current_phase: 1
created_date: 2026-04-21
---

# TASK-RALLY-009: getSkillCreatorApi()型ガード強化

## メタ情報

| 項目                | 値                                                  |
| ------------------- | --------------------------------------------------- |
| タスクID            | TASK-RALLY-009                                      |
| 機能名              | スキルクリエイター ラリー機能 API型ガード強化       |
| 作成日              | 2026-04-21                                          |
| 実行形態            | par                                                 |
| 依存タスク          | なし（Wave 2・並列実行可）                          |
| 衝突ドメイン        | ipc・preloadドメイン（SkillLifecyclePanelと非衝突） |
| implementation_mode | new                                                 |

## 目的

`SkillLifecyclePanel.tsx` に定義されている `getSkillCreatorApi()` と `getSessionResumeApi()` は、同一の `window.skillCreatorAPI` オブジェクトをそれぞれ `SkillCreatorRuntimeApi` 型と `SessionResumeApi` 型として `as` キャストで参照している。

型ガードなしの `as` キャストは実行時に `undefined` を型安全な値として扱ってしまうリスクがあり、Electron のプリロードが正しく読み込まれていない環境（開発中・テスト環境・プリロードロード前）では実行時エラーが型チェックでは検出されずにサイレントに発生する。

本タスクでは型ガード関数を実装し、呼び出し時点で必要なメソッドの存在を runtime で検証することで `as` キャストをランタイム検証に置き換える。また `getSkillCreatorApi()` と `getSessionResumeApi()` が同一オブジェクトを異なる型で参照している構造的な問題に対して、型定義と実装の整合を取る。

## スコープ

### 含む

- `SkillLifecyclePanel.tsx` の `getSkillCreatorApi()` 関数への型ガード実装
- `SkillLifecyclePanel.tsx` の `getSessionResumeApi()` 関数への型ガード実装
- `apps/desktop/src/preload/skill-creator-api.ts` の型定義・エクスポート状況の確認と必要な修正
- 型ガード関数内で必要なメソッドの存在を runtime で検証する実装
- プリロードなし環境で呼んだとき適切なエラーまたは null が返ることの確認

### 含まない

- `getSkillCreatorApi()` / `getSessionResumeApi()` の呼び出し箇所の変更（型ガード関数自体のみを変更する）
- IPC チャンネルの変更
- SkillLifecyclePanel の状態管理ロジックの変更
- commit / push / PR 実行

## Phase 1: 要件定義

### 受け入れ基準

- AC-1: `getSkillCreatorApi()` に必須メソッド（`submitWorkflowInput` 等）の存在チェックが実装されていること
- AC-2: `getSessionResumeApi()` に必須メソッドの存在チェックが実装されていること
- AC-3: `window.skillCreatorAPI` が undefined の場合、型ガード関数が `null` を返す（または適切な Error を throw する）こと
- AC-4: 必須メソッドが存在しない不完全なオブジェクトが渡された場合に型ガードが失敗すること
- AC-5: `as` キャストを用いた不安全な型アサーションが両関数から除去されていること
- AC-6: `pnpm typecheck` がエラーなしで通過すること
- AC-7: `pnpm lint` がエラーなしで通過すること

### P50チェック

対象ファイルの現状実装を確認する：

```bash
# getSkillCreatorApi / getSessionResumeApi の現状確認
grep -n -A 12 "function getSkillCreatorApi\|function getSessionResumeApi" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx

# window 型定義の確認
grep -rn "skillCreatorAPI\|SkillCreatorRuntimeApi\|SessionResumeApi" \
  apps/desktop/src/preload/skill-creator-api.ts | head -20

# 呼び出し箇所の一覧
grep -n "getSkillCreatorApi()\|getSessionResumeApi()" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx

# SkillCreatorRuntimeApi の型定義確認
grep -rn "SkillCreatorRuntimeApi\|SessionResumeApi" \
  packages/shared/src/types/ apps/desktop/src/preload/ | head -20
```

## Phase 2: 設計

### 変更箇所

#### 現状（型ガードなし）

```typescript
function getSkillCreatorApi(): SkillCreatorRuntimeApi | null {
  const runtimeWindow = window as Window & {
    electronAPI?: { skillCreator?: SkillCreatorRuntimeApi };
    skillCreatorAPI?: SkillCreatorRuntimeApi;
  };
  // as キャストのみ。メソッド存在チェックなし
  return (
    runtimeWindow.skillCreatorAPI ??
    runtimeWindow.electronAPI?.skillCreator ??
    null
  );
}

function getSessionResumeApi(): SessionResumeApi | null {
  const w = window as unknown as Window & {
    skillCreatorAPI?: SessionResumeApi;
    electronAPI?: { skillCreator?: SessionResumeApi };
  };
  // 同一オブジェクトを別の型で as キャスト。runtime 検証なし
  return w.skillCreatorAPI ?? w.electronAPI?.skillCreator ?? null;
}
```

#### 変更後

```typescript
/**
 * SkillCreatorRuntimeApi の型ガード。
 * 必須メソッドの存在を runtime で検証し、不完全なオブジェクトを排除する。
 */
function isSkillCreatorRuntimeApi(obj: unknown): obj is SkillCreatorRuntimeApi {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof (obj as Record<string, unknown>).submitWorkflowInput ===
      "function" &&
    typeof (obj as Record<string, unknown>).getWorkflowState === "function" &&
    typeof (obj as Record<string, unknown>).onWorkflowStateChanged ===
      "function"
  );
}

/**
 * SessionResumeApi の型ガード。
 * 必須メソッドの存在を runtime で検証する。
 */
function isSessionResumeApi(obj: unknown): obj is SessionResumeApi {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof (obj as Record<string, unknown>).resumeSession === "function"
    // SessionResumeApi の必須メソッドを実際の型定義に合わせて列挙する
  );
}

function getSkillCreatorApi(): SkillCreatorRuntimeApi | null {
  const runtimeWindow = window as Window & {
    electronAPI?: { skillCreator?: unknown };
    skillCreatorAPI?: unknown;
  };
  const candidate =
    runtimeWindow.skillCreatorAPI ?? runtimeWindow.electronAPI?.skillCreator;
  if (isSkillCreatorRuntimeApi(candidate)) {
    return candidate;
  }
  return null;
}

function getSessionResumeApi(): SessionResumeApi | null {
  const runtimeWindow = window as Window & {
    electronAPI?: { skillCreator?: unknown };
    skillCreatorAPI?: unknown;
  };
  const candidate =
    runtimeWindow.skillCreatorAPI ?? runtimeWindow.electronAPI?.skillCreator;
  if (isSessionResumeApi(candidate)) {
    return candidate;
  }
  return null;
}
```

**設計判断の根拠**：

- 型ガード関数（`is` predicate）を使うことで TypeScript の型システムとランタイム検証が一致する
- `as` キャストを `unknown` 経由の候補取得 + 型ガードに変えることで「型が合わないオブジェクトが渡された場合は null を返す」という安全な挙動になる
- `getSkillCreatorApi()` と `getSessionResumeApi()` が同一オブジェクトを参照していても、それぞれが必要なメソッドを個別に検証するため、型の混在リスクを最小化できる
- 呼び出し側のコード（`if (!skillCreatorApi?.submitWorkflowInput)` 等）は変更不要

### 注意事項

実装前に `SkillCreatorRuntimeApi` と `SessionResumeApi` の型定義（必須メソッド一覧）を `packages/shared/src/types/` または `apps/desktop/src/preload/skill-creator-api.ts` で確認し、型ガード内のメソッド名を正確に合わせる。

### 検証方法

1. 単体テストでプリロードなし環境（`window.skillCreatorAPI = undefined`）のとき `null` が返ることを確認
2. 単体テストで `submitWorkflowInput` のみ存在する不完全オブジェクトのとき型ガードが失敗することを確認
3. 単体テストで完全な API オブジェクトのとき型ガードが成功することを確認
4. `pnpm typecheck` でエラーなしを確認
5. `pnpm lint` でエラーなしを確認

## Phase 3: 実装計画

1. `SkillCreatorRuntimeApi` と `SessionResumeApi` の型定義を確認し、必須メソッド一覧を把握する
2. `isSkillCreatorRuntimeApi` 型ガード関数を実装する
3. `isSessionResumeApi` 型ガード関数を実装する
4. `getSkillCreatorApi()` を型ガードを使う形に書き換える
5. `getSessionResumeApi()` を型ガードを使う形に書き換える
6. `apps/desktop/src/preload/skill-creator-api.ts` の型定義・エクスポートに不整合がある場合は修正する
7. 単体テストを作成する
8. `pnpm typecheck` と `pnpm lint` を実行して品質を確認する

## Phase 4: テスト設計

### 単体テスト（Vitest）

テスト対象: `isSkillCreatorRuntimeApi` / `isSessionResumeApi` 型ガード関数および `getSkillCreatorApi()` / `getSessionResumeApi()` 関数

| テストケース | 内容                                                                         | 期待結果                              |
| ------------ | ---------------------------------------------------------------------------- | ------------------------------------- |
| TC-1         | `window.skillCreatorAPI` が undefined                                        | `getSkillCreatorApi()` が null を返す |
| TC-2         | `window.skillCreatorAPI` が空オブジェクト `{}`                               | `getSkillCreatorApi()` が null を返す |
| TC-3         | `window.skillCreatorAPI` が必須メソッドの一部を持つオブジェクト              | 型ガードが失敗し null を返す          |
| TC-4         | `window.skillCreatorAPI` が全必須メソッドを持つオブジェクト                  | 型ガードが成功し オブジェクトを返す   |
| TC-5         | `window.skillCreatorAPI` が null                                             | `getSkillCreatorApi()` が null を返す |
| TC-6         | `getSessionResumeApi()` に SessionResumeApi の必須メソッドを持つオブジェクト | 型ガードが成功し オブジェクトを返す   |
| TC-7         | `window.electronAPI?.skillCreator` にフォールバックするケース                | electronAPI 経由でオブジェクトが返る  |

## Phase 5: 実装

Phase 3 の手順に従い実装する。

実装時の注意点：

- 型ガード内で検証するメソッド名は実際の型定義（`SkillCreatorRuntimeApi`・`SessionResumeApi`）と完全に一致させる
- 過剰な検証（全プロパティを検証する）は避け、「呼び出し側が実際に使う必須メソッド」のみを検証する
- `window` への `as unknown as ...` キャストは候補オブジェクト取得の1回のみに限定し、型ガード後は安全な型を使用する
- RALLY-004 で整理された型定義（deprecated フィールド含む）と整合する

## Phase 12: ドキュメント

### 変更内容のドキュメント化

- `isSkillCreatorRuntimeApi` / `isSessionResumeApi` 関数に JSDoc コメントを追加し、「なぜ型ガードが必要か」を説明する
- `getSkillCreatorApi()` / `getSessionResumeApi()` に「runtime 型ガードを通過したオブジェクトのみ返す」旨のコメントを追加する

中学生レベルの概念説明：

TypeScript の「型」はコードを書くときの約束事です。でも、プログラムが実際に動く時（runtime）には、その約束が守られているかは確認されません。`as` キャスト（型アサーション）は「これはこの型だと信じて！」と TypeScript に伝える方法ですが、もし実際には違う型だったとしても、エラーにならずそのまま動いてしまいます。型ガード関数（`is` を使う関数）は「本当にこの型かどうか、実際のメソッドが存在するかを確かめる」関数です。本タスクでは「信じるだけ」から「確かめてから使う」に変更することで、プリロードが読み込まれていない環境でも安全に動作するようにします。

## Phase 13: 完了確認

### 完了条件

- [ ] `isSkillCreatorRuntimeApi` 型ガード関数が実装されている
- [ ] `isSessionResumeApi` 型ガード関数が実装されている
- [ ] `getSkillCreatorApi()` が型ガードを使用し、`as` キャストに依存していない
- [ ] `getSessionResumeApi()` が型ガードを使用し、`as` キャストに依存していない
- [ ] `window.skillCreatorAPI` が undefined の場合に `null` が返ることが確認できる
- [ ] 単体テスト TC-1〜TC-7 がすべて PASS している
- [ ] `pnpm typecheck` がエラーなしで通過している
- [ ] `pnpm lint` がエラーなしで通過している

### タスク100%実行確認【必須】

- [ ] Phase 1〜12 完了
- [ ] 受け入れ基準 AC-1〜AC-7 全PASS
- [ ] 本タスクは Wave 2 並列実行可。SkillLifecyclePanel の状態管理ロジックを変更しないため RALLY-005〜008 との衝突なし
