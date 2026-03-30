# Phase 1: 要件定義

## メタ情報

| 項目      | 内容                                                 |
| --------- | ---------------------------------------------------- |
| Phase     | 1                                                    |
| 名称      | 要件定義                                             |
| 前提Phase | なし                                                 |
| 成果物    | 機能要件一覧、非機能要件一覧、受け入れ基準、調査結果 |

## 目的

AgentView の Permission API アクセスバグの修正に必要な要件を明文化し、受け入れ基準を定義する。エージェント権限モード（`getMode`/`setMode`）が preload に未実装であることを調査で確認し、修正範囲を確定する。

## 実行タスク

### タスク 1-1: 現状の API 不整合を調査する

以下のコマンドを実行して、preload に `getMode` / `setMode` / `getRemembered` / `clearRemembered` が存在しないことを確認する：

```bash
grep -rn "getMode\|setMode\|getRemembered\|clearRemembered" apps/desktop/src/preload/
grep -rn "permissionAPI\|PermissionAPI" apps/desktop/src/preload/
```

**確認すべき事項**:

- `preload/index.ts` に `getMode` メソッドが定義されていないこと
- `preload/types.ts` の `PermissionAPI` interface に `getMode` が含まれていないこと
- `preload/index.ts` の `permissionAPI` オブジェクトが `getAllowedTools`, `revokeTool`, `clearAll` の3メソッドのみであること

### タスク 1-2: AgentPermissionMode の使用箇所を洗い出す

```bash
grep -rn "AgentPermissionMode" apps/desktop/src/renderer/
```

以下のファイルで使用されていることを確認する：

- `views/AgentView/index.tsx` - state 定義と handler
- `components/organisms/AgentView/types.ts` - 型定義
- `components/organisms/AgentView/AdvancedSettingsPanel.tsx` - UI 表示
- `components/organisms/AgentView/__tests__/AdvancedSettingsPanel.test.tsx` - テスト

### タスク 1-3: エージェント権限モード機能の必要性を判断する

AgentView の AdvancedSettingsPanel には「許可モード」セレクタ（default / acceptEdits / bypassPermissions / plan）が存在する。この機能は preload / main process に対応する IPC ハンドラが存在しないため、以下のいずれかを決定する：

**決定**: 権限モード UI をローカル state のみで維持する（IPC 連携なし）

**根拠**:

- preload に `getMode`/`setMode` が実装されていない
- main process に対応する IPC ハンドラが存在しない
- 権限モードの永続化は別タスク（TASK-AGENT-PERM-MODE）として切り出す
- 本タスクのスコープはランタイムエラーの解消に限定する

### タスク 1-4: `rememberedCount` と `getAllowedTools()` の対応を確定する

現在の `loadPermissions()` は `getRemembered()` の戻り値の配列長を `rememberedCount` にセットしている。修正後は `getAllowedTools()` の戻り値 `{ tools: AllowedToolEntry[] }` の `tools.length` を `rememberedCount` にセットする。

## 機能要件 (FR)

### FR-01: getPermissionApi() の API パス修正

`window.electronAPI.permissions` へのアクセスを `window.permissionAPI` に変更する。

**変更対象**: `apps/desktop/src/renderer/views/AgentView/index.tsx` 84-90行

### FR-02: ローカル PermissionApi 型の削除

`index.tsx` 77-82行のローカル `PermissionApi` 型定義を削除し、`preload/types.ts` の `PermissionAPI` 型を使用する。

**変更対象**: `apps/desktop/src/renderer/views/AgentView/index.tsx` 77-82行

### FR-03: loadPermissions() の修正

`getRemembered()` を `getAllowedTools()` に変更し、`getMode()` 呼び出しを削除する。

**変更対象**: `apps/desktop/src/renderer/views/AgentView/index.tsx` 260-293行

### FR-04: handlePermissionModeChange() の修正

`setMode()` の IPC 呼び出しを削除し、ローカル state のみで管理する。

**変更対象**: `apps/desktop/src/renderer/views/AgentView/index.tsx` 523-544行

### FR-05: handleResetRemembered() の修正

`clearRemembered()` を `window.permissionAPI.clearAll()` に変更する。

**変更対象**: `apps/desktop/src/renderer/views/AgentView/index.tsx` 546-565行

## 非機能要件 (NFR)

### NFR-01: 型安全性

- TypeScript コンパイルが `apps/desktop` パッケージで PASS すること
- `window.permissionAPI` の型が `preload/types.ts` の `PermissionAPI` と一致すること

### NFR-02: テスト維持

- 既存の AgentView テスト（`AgentView.test.tsx`, `AgentView.layout.test.tsx`, `AgentView.cta.test.tsx`, `AgentView.coverage.test.tsx`）が全て PASS すること
- 既存の `AdvancedSettingsPanel.test.tsx` が全て PASS すること

### NFR-03: UI 挙動維持

- AdvancedSettingsPanel の許可モードセレクタは UI 上で引き続き操作可能であること（ローカル state のみ）
- 「記憶された許可」の件数表示が `getAllowedTools()` の結果を反映すること
- 「リセット」ボタンが `clearAll()` を呼び出すこと

## 受け入れ基準 (AC)

- AC-01: AgentView を開いたときに `TypeError: Cannot read properties of undefined (reading 'permissions')` が発生しない
- AC-02: `window.permissionAPI.getAllowedTools()` が呼び出され、結果が `rememberedCount` に反映される
- AC-03: 「リセット」ボタンを押すと `window.permissionAPI.clearAll()` が呼び出される
- AC-04: 許可モードセレクタはローカル state で動作し、IPC 呼び出しを行わない
- AC-05: `pnpm --filter @repo/desktop exec tsc --noEmit` が PASS する
- AC-06: `pnpm --filter @repo/desktop test` の AgentView 関連テストが全て PASS する

## 参照資料

### システム仕様（aiworkflow-requirements）

| 資料名                     | パス                                                                         |
| -------------------------- | ---------------------------------------------------------------------------- |
| preload/types.ts           | `apps/desktop/src/preload/types.ts:1746-1762`                                |
| preload/index.ts           | `apps/desktop/src/preload/index.ts:592-611`                                  |
| PermissionSettings（参考） | `apps/desktop/src/renderer/components/settings/PermissionSettings/index.tsx` |
| AgentView                  | `apps/desktop/src/renderer/views/AgentView/index.tsx`                        |

## 成果物

| 成果物     | 配置先                                                                   |
| ---------- | ------------------------------------------------------------------------ |
| 要件定義書 | `docs/30-workflows/agentview-permission-api-fix/phase-1-requirements.md` |

## 完了条件

- [ ] preload に `getMode`/`setMode` が存在しないことを grep で確認した
- [ ] `AgentPermissionMode` の使用箇所を全て洗い出した
- [ ] 権限モード UI をローカル state のみで維持する方針を決定した
- [ ] `rememberedCount` を `getAllowedTools().tools.length` で算出する方針を確定した
- [ ] FR-01 から FR-05、NFR-01 から NFR-03、AC-01 から AC-06 を文書化した

## 統合テスト連携

| 観点           | 内容                                                                                  |
| -------------- | ------------------------------------------------------------------------------------- |
| 既存テスト把握 | AgentView 系既存テストと PermissionSettings 既存テストの差分観点を Phase 4 へ引き継ぐ |
| 受入条件連携   | AC-01〜AC-06 をテストケース ID に写像し、Phase 4〜10 の判定基準を固定する             |
| 手動検証連携   | AC-01〜AC-04 は Phase 11 の実画面検証項目として再掲する                               |

## 多角的チェック観点

| 観点               | 適用 | 理由                                                           |
| ------------------ | ---- | -------------------------------------------------------------- |
| API設計            | ✅   | renderer が preload 契約を誤読しているため                     |
| UI/UX              | ✅   | 許可モード UI を残すが外部永続化は行わないため                 |
| エラーハンドリング | ✅   | preload 未初期化時の graceful degradation を要するため         |
| 依存関係整合       | ✅   | AgentView / preload / PermissionSettings の3者整合が必要なため |

## 実行手順

### ステップ1: 現行実装と仕様の不一致を固定する

`AgentView/index.tsx`、`preload/index.ts`、`preload/types.ts` を照合し、Renderer 側の誤った想定と preload 正本の差分を文章で確定する。

### ステップ2: スコープ境界を確定する

本タスクは Renderer 側バグ修正に限定し、`PermissionAPI` 自体の拡張や `AgentPermissionMode` 永続化は将来タスクへ分離する。

### ステップ3: 受け入れ基準を後続Phaseへ引き継ぐ

AC を Phase 4-11 のテスト、品質、手動確認へ 1:1 でトレースできる形に整える。

## 統合テスト連携

- Phase 4 で `window.permissionAPI` モックを用いた Red テストへ展開する。
- Phase 7 で `AgentView.test.tsx` 系と型チェック結果をまとめてゲート判定する。
- Phase 11 で UI 上の remembered count と reset 動作を手動確認する。

## 多角的チェック観点

| 観点               | 本Phaseでの確認内容                                        |
| ------------------ | ---------------------------------------------------------- |
| API設計            | Renderer が preload 公開面を誤読していないか               |
| UI/UX              | 許可モード UI の存在理由と local state の妥当性            |
| アーキテクチャ     | Renderer / preload / main の責務境界が混ざっていないか     |
| エラーハンドリング | `permissionAPI` 不在でもクラッシュしない前提になっているか |

## サブタスク管理

1. 現状コード調査
2. FR/NFR/AC の整理
3. スコープ外項目の明文化
4. 参照資料の固定
5. 完了条件の確認

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 要件・非機能要件・受け入れ基準が後続Phaseへ引き継げる
- [ ] 参照資料と成果物の名称が `artifacts.json` と整合している

## 次のPhase

Phase 2: 設計
