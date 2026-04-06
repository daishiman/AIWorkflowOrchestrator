# Phase 5 実装記録 — TASK-UI-03 Skill Creator IPC 二重経路統合

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 5                            |
| タスク名   | TASK-UI-03 IPC 二重経路統合  |
| 採用方針   | 方針 B（明確な分離契約）     |
| 作成日     | 2026-04-06                   |
| ステータス | 仕様記述完了（実装反映済み） |

---

## 1. 実装対象ファイル一覧

| #   | ファイルパス                                                                          | 区別 | 優先度 |
| --- | ------------------------------------------------------------------------------------- | ---- | ------ |
| 1   | `apps/desktop/src/preload/index.ts`                                                   | 修正 | 高     |
| 2   | `apps/desktop/src/preload/types.ts`                                                   | 修正 | 高     |
| 3   | `apps/desktop/src/renderer/components/organisms/AgentView/GovernanceSummaryPanel.tsx` | 修正 | 高     |
| 4   | `apps/desktop/src/renderer/components/skill/ImprovementProposalPanel.tsx`             | 修正 | 高     |
| 5   | `apps/desktop/src/main/ipc/creatorHandlers.ts`                                        | 修正 | 高     |
| 6   | `packages/shared/src/types/skillCreator.ts`                                           | 修正 | 低     |

新規作成ファイルはない。既存6ファイルの修正のみ。

---

## 2. 各ファイルの変更仕様

### 2-1. `apps/desktop/src/preload/index.ts`

**変更内容**:

- `electronAPI` オブジェクトのプロパティから `skillCreator` および `skillCreatorSession` の2つのプロパティ定義を削除する。
  - 削除対象の行（現在 line 427-428）:
    - `skillCreator: skillCreatorAPI,`
    - `skillCreatorSession: skillCreatorSessionAPI,`
- これにより `electronAPI` 経由での Skill Creator アクセス経路を廃止し、直接公開している `window.skillCreatorAPI` / `window.skillCreatorSessionAPI` のみを残す。
- `contextBridge.exposeInMainWorld` の呼び出しブロック（line 639-643）はそのまま維持する（`skillCreatorAPI` と `skillCreatorSessionAPI` は引き続き独立公開する）。
- fallback ブロック（non-isolated context, line 666-673）についても同様に、`skillCreatorAPI` と `skillCreatorSessionAPI` の独立公開行はそのまま維持する。

**変更のポイント**:

- `electronAPI` はレガシーな間接アクセス経路。直接公開（`window.skillCreatorAPI`）への一本化が目的。
- `import` 文（line 594-596: `skillCreatorAPI`、`skillCreatorSessionAPI` の import）は `electronAPI` への代入が消えた後も `contextBridge.exposeInMainWorld` に渡す用途で残るため、削除不要。

---

### 2-2. `apps/desktop/src/preload/types.ts`

**変更内容**:

- `ElectronAPI` インターフェース（line 1050-1260 付近）から以下の2プロパティ定義を削除する。
  - `skillCreator: import("./skill-creator-api").SkillCreatorAPI;`（現在 line 1255）
  - `skillCreatorSession: import("./skill-creator-session-api").SkillCreatorSessionAPI;`（現在 line 1256）
- コメント行 `// Skill Creator API (TASK-9B-H)` も合わせて削除する（line 1254）。
- グローバル `Window` 型宣言ブロック（line 1840-1855）はそのまま維持する。`skillCreatorAPI` と `skillCreatorSessionAPI` は引き続き直接公開 API として `Window` に定義されているため変更不要。

**変更のポイント**:

- `ElectronAPI` 型から除去することで、TypeScript の型レベルでも `window.electronAPI.skillCreator` へのアクセスをコンパイルエラーとして検出できるようにする。

---

### 2-3. `apps/desktop/src/renderer/components/organisms/AgentView/GovernanceSummaryPanel.tsx`

**変更内容**:

- `getGovernanceApi()` ヘルパー関数（line 18-24）の参照先を `window.electronAPI.skillCreator` から `window.skillCreatorAPI` に変更する。
  - 変更前: `window.electronAPI?.skillCreator` を返す
  - 変更後: `window.skillCreatorAPI` を返す
- それに伴い、`SkillCreatorGovernanceApi` ローカル型定義（line 12-14）は維持するが、型の取得元を `window.skillCreatorAPI` から推論するよう記述を調整する。あるいはインポート型 `SkillCreatorAPI` を直接使うよう切り替えても可。
- line 93 のエラーメッセージ文字列 `"window.electronAPI.skillCreator.getGovernanceState が利用できません"` を `"skillCreatorAPI.getGovernanceState が利用できません"` に変更する（利用不能時のユーザー向けメッセージの正確性向上）。

**変更のポイント**:

- `window.electronAPI?.skillCreator` は廃止経路。`window.skillCreatorAPI` が正式な Runtime IPC 一次導線。
- `getGovernanceState` メソッドは `SkillCreatorAPI`（`skill-creator-api.ts` の line 228-230）に定義済みのため、実装側の変更は不要。

---

### 2-4. `apps/desktop/src/renderer/components/skill/ImprovementProposalPanel.tsx`

**変更内容**:

- `handleApply` コールバック内（line 73）の呼び出しを `window.electronAPI.skillCreator.applyRuntimeImprovement(...)` から `window.skillCreatorAPI.applyRuntimeImprovement(...)` に変更する。

**変更のポイント**:

- `applyRuntimeImprovement` メソッドは `SkillCreatorAPI`（`skill-creator-api.ts` の line 196 付近）に定義済みのため、メソッドシグネチャは変わらない。引数・戻り値の型に差異はない。
- `window.electronAPI` の型参照が消えることで、TypeScript が明示的に `SkillCreatorAPI` 型を参照するようになり型安全性が向上する。

---

### 2-5. `apps/desktop/src/main/ipc/creatorHandlers.ts`

**変更内容**:

- line 254-287 の `ipcMain.handle(IPC_CHANNELS.SKILL_CREATOR_GET_ADAPTER_STATUS, ...)` ブロックを丸ごと削除する。
  - これは line 219-252 と完全に同一内容の重複 `ipcMain.handle` 登録であり、Electron では同一チャネルに対して2回 `ipcMain.handle` を呼び出すと2番目の登録が無視される（または警告が出る）。
  - 1つ目の登録（line 219-252）を正規登録として維持する。
- `unregisterRuntimeSkillCreatorHandlers()` 関数（line 745-768）の `ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_GET_ADAPTER_STATUS)` は1回のみ呼ばれるため、変更不要。

**変更のポイント**:

- Electron は `ipcMain.handle` で同一チャネルを2回登録しても自動的にエラーを投げないが、本来意図しない重複登録はバグの温床になる。
- register/unregister の対称性（後述セクション3参照）のため、ハンドラー登録は1回であるべき。

---

### 2-6. `packages/shared/src/types/skillCreator.ts`

**変更内容**:

- 既存の型定義コードは一切変更しない（型の追加・削除・リネームなし）。
- 型グループの境界を明示するセクション区切りコメントを追加する。具体的には以下3か所にコメントブロックを挿入する。
  1. Session IPC 型グループの開始前に次のコメントを追加:

     ```
     // ============================================
     // Session IPC 型（会話フロー: startSession / ANSWER / QUESTION_RECEIVED）
     // 使用場面: SkillCreatorConversationPanel, TASK-SDK-SC-01 系
     // ============================================
     ```

  2. Runtime IPC 型グループの開始前に次のコメントを追加:

     ```
     // ============================================
     // Runtime IPC 型（ワークフロー状態: plan / execute / verify / improve）
     // 使用場面: SkillCreatorWorkflowPanel, TASK-9B-H / TASK-P0-08 系
     // ============================================
     ```

  3. Session Resume 型グループの開始前に次のコメントを追加:
     ```
     // ============================================
     // Session Resume 型（セッション一覧・再開・削除）
     // 使用場面: SkillCreatorSessionList, TASK-SDK-SC-01 系
     // ============================================
     ```

- セクション区切りのための「型の分類対象」は以下を想定する（既存定義の先頭から判断する）:
  - Session IPC 型: `UserInputAnswer`、`SkillCreatorSessionQuestion`、`SkillCreatorSessionMessage` 等の会話フロー型
  - Runtime IPC 型: `SkillCreatorWorkflowUiSnapshot`、`RuntimeSkillCreatorPlanResponse`、`SkillCreatorGovernanceState` 等のワークフロー状態型
  - Session Resume 型: `SkillCreatorSessionListItem`、`SkillCreatorSessionResumeResult` 等のセッション管理型

---

## 3. IPC ハンドラー register/unregister ペアの確認結果

対象ファイル: `apps/desktop/src/main/ipc/creatorHandlers.ts`

| チャネル定数                             | register（line） | unregister（line） | 対称性   | 重複                                |
| ---------------------------------------- | ---------------- | ------------------ | -------- | ----------------------------------- |
| `SKILL_CREATOR_PLAN`                     | 177              | 752                | OK       | なし                                |
| `SKILL_CREATOR_GET_ADAPTER_STATUS`       | 219 / **254**    | 753                | **重複** | **あり（line 254-287 を削除対象）** |
| `SKILL_CREATOR_EXECUTE_PLAN`             | 289              | 754                | OK       | なし                                |
| `SKILL_CREATOR_GET_WORKFLOW_STATE`       | （後続）         | 755                | OK       | なし                                |
| `SKILL_CREATOR_SUBMIT_USER_INPUT`        | （後続）         | 756                | OK       | なし                                |
| `SKILL_CREATOR_IMPROVE_SKILL`            | （後続）         | 757                | OK       | なし                                |
| `SKILL_CREATOR_APPLY_IMPROVEMENT`        | （後続）         | 758                | OK       | なし                                |
| `SKILL_CREATOR_GET_VERIFY_DETAIL`        | （後続）         | 759                | OK       | なし                                |
| `SKILL_CREATOR_REVERIFY_WORKFLOW`        | （後続）         | 760                | OK       | なし                                |
| `SKILL_CREATOR_NORMALIZE_SDK_MESSAGES`   | （後続）         | 761                | OK       | なし                                |
| `SKILL_CREATOR_LIST_SESSIONS`            | （後続）         | 762                | OK       | なし                                |
| `SKILL_CREATOR_GET_SESSION_DETAIL`       | （後続）         | 763                | OK       | なし                                |
| `SKILL_CREATOR_RESUME_SESSION`           | （後続）         | 764                | OK       | なし                                |
| `SKILL_CREATOR_DELETE_SESSION`           | （後続）         | 765                | OK       | なし                                |
| `SKILL_CREATOR_CLEANUP_EXPIRED_SESSIONS` | （後続）         | 766                | OK       | なし                                |
| `SKILL_CREATOR_GET_GOVERNANCE_STATE`     | （後続）         | 767                | OK       | なし                                |

**結論**: `SKILL_CREATOR_GET_ADAPTER_STATUS` のみ register が重複している。line 254-287 の2番目の登録ブロックを削除することで対称性が回復する。unregister は1回（line 753）のため変更不要。

---

## 4. 既存テストへの影響範囲

### 4-1. `GovernanceSummaryPanel.test.tsx` の影響

ファイルパス: `apps/desktop/src/renderer/components/organisms/AgentView/__tests__/GovernanceSummaryPanel.test.tsx`

**現状**: テスト内の `setupMockApi()` ヘルパーが `window.electronAPI` に `{ skillCreator: { getGovernanceState: mockFn } }` をセットアップしている（line 49-54）。

**影響テストケース**:

- `TC-R-11`: `window.electronAPI.skillCreator が未定義の場合はローディング表示`（line 221-231）

このテストは `window.electronAPI.skillCreator` が存在しない場合のフォールバックを検証している。`GovernanceSummaryPanel.tsx` の `getGovernanceApi()` が `window.skillCreatorAPI` を参照するよう変更された後は、このテストの `setupMockApi` の実装を変更する必要がある。

**修正方針（TC-R-11）**:

- `setupMockApi()` ヘルパーのモックセット先を `window.electronAPI.skillCreator` から `window.skillCreatorAPI` に変更する。
  - 変更前: `Object.defineProperty(window, "electronAPI", { value: { skillCreator: { getGovernanceState: mockFn } }, ... })`
  - 変更後: `Object.defineProperty(window, "skillCreatorAPI", { value: { getGovernanceState: mockFn }, ... })`
- `TC-R-11` は `window.electronAPI` に `skillCreator` キーを持たないオブジェクトを設定するテスト。変更後は `window.skillCreatorAPI` 自体が未定義（または `getGovernanceState` を持たない）場合の挙動をテストするよう書き換える。
  - 変更前: `Object.defineProperty(window, "electronAPI", { value: {}, ... })` — `skillCreator` キーが存在しない
  - 変更後: `Reflect.deleteProperty(window, "skillCreatorAPI")` — `skillCreatorAPI` 自体を削除してローディング表示を検証

**影響のないテストケース**:

- TC-R-01 〜 TC-R-10、TC-R-12 〜 TC-R-14: `setupMockApi` を通じてモックを設定しているが、変更後は全て `window.skillCreatorAPI` を経由するため、`setupMockApi` のモックセット先を変えるだけで動作する。テストの検証ロジック自体は変更不要。

### 4-2. `ImprovementProposalPanel` 関連テスト

`ImprovementProposalPanel.tsx` の変更（`window.electronAPI.skillCreator` → `window.skillCreatorAPI`）に伴い、対応するテストファイルでモックセット先を変更する必要がある。

- 変更前のモック: `window.electronAPI = { skillCreator: { applyRuntimeImprovement: mockFn } }`
- 変更後のモック: `window.skillCreatorAPI = { applyRuntimeImprovement: mockFn, ...rest }`

### 4-3. その他テストへの波及

- `GovernanceSummaryPanel.tsx` / `ImprovementProposalPanel.tsx` 以外のコンポーネントで `window.electronAPI.skillCreator` を参照している箇所はコードベース全体で確認済みの結果なし（本番コードのみ2箇所が対象）。
- `preload/index.ts` 側の変更はレンダラー側には直接影響しない（contextBridge の再公開構造は変わらないため）。

---

## 5. ElectronAPI 型定義の更新仕様

対象ファイル: `apps/desktop/src/preload/types.ts`

### 削除対象（`ElectronAPI` インターフェース）

```
// Skill Creator API (TASK-9B-H)   ← このコメント行も削除
skillCreator: import("./skill-creator-api").SkillCreatorAPI;
skillCreatorSession: import("./skill-creator-session-api").SkillCreatorSessionAPI;
```

### 維持対象（グローバル `Window` 型宣言）

以下は変更しない。直接公開 API の型定義であり、廃止対象ではない。

```
interface Window {
  // ...
  skillCreatorAPI: import("./skill-creator-api").SkillCreatorAPI;        // 維持
  skillCreatorSessionAPI: import("./skill-creator-session-api").SkillCreatorSessionAPI; // 維持
}
```

### 型変更の影響確認

- `ElectronAPI` から `skillCreator` / `skillCreatorSession` を削除した後、`window.electronAPI.skillCreator` を参照しているコードはすべて TypeScript のコンパイルエラーになる。これにより移行漏れが検出可能になる。
- 本実装対象の2ファイル（`GovernanceSummaryPanel.tsx` と `ImprovementProposalPanel.tsx`）を修正することで、コンパイルエラーはゼロになる想定。

---

## 6. 実装順序の推奨

依存関係を考慮した推奨実装順序を以下に示す。

### ステップ 1: `creatorHandlers.ts` の重複ハンドラー削除（単独変更・副作用なし）

`SKILL_CREATOR_GET_ADAPTER_STATUS` の2番目の `ipcMain.handle` ブロック（line 254-287）を削除する。この変更はレンダラー側・型定義側に依存しないため、最初に実施する。

### ステップ 2: `skillCreator.ts` のコメント追加（単独変更・副作用なし）

セクション区切りコメントの追加のみ。型定義の変更を伴わないため、いつでも実施可能。ステップ 1 と並行実施も可。

### ステップ 3: `types.ts` の `ElectronAPI` 型から削除

`ElectronAPI` インターフェースから `skillCreator` / `skillCreatorSession` を削除する。この時点でコンパイルエラーが2箇所発生する（`GovernanceSummaryPanel.tsx` と `ImprovementProposalPanel.tsx`）。

### ステップ 4: `GovernanceSummaryPanel.tsx` の修正

`getGovernanceApi()` の参照先を `window.skillCreatorAPI` に変更し、エラーメッセージ文字列を更新する。ステップ 3 のコンパイルエラーが1箇所解消される。

### ステップ 5: `ImprovementProposalPanel.tsx` の修正

`handleApply` 内の呼び出しを `window.skillCreatorAPI.applyRuntimeImprovement(...)` に変更する。ステップ 3 の残り1箇所のコンパイルエラーが解消される。

### ステップ 6: `preload/index.ts` の修正

`electronAPI` オブジェクトから `skillCreator` / `skillCreatorSession` プロパティを削除する。ステップ 3-5 の後に実施する（型定義と実装の整合を取ってから）。

### ステップ 7: テスト修正

`GovernanceSummaryPanel.test.tsx` の `setupMockApi` を `window.skillCreatorAPI` ベースに変更し、`TC-R-11` の検証ロジックを更新する。その他 `ImprovementProposalPanel` 関連テストも同様に対応する。

### ステップ 8: 型チェック・テスト実行

```bash
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop test -- --run
```

---

## 7. 完了条件チェックリスト

### コード変更

- [ ] `preload/index.ts`: `electronAPI.skillCreator` プロパティ削除済み
- [ ] `preload/index.ts`: `electronAPI.skillCreatorSession` プロパティ削除済み
- [ ] `preload/types.ts`: `ElectronAPI.skillCreator` 型定義削除済み
- [ ] `preload/types.ts`: `ElectronAPI.skillCreatorSession` 型定義削除済み
- [ ] `GovernanceSummaryPanel.tsx`: `getGovernanceApi()` が `window.skillCreatorAPI` を返すよう変更済み
- [ ] `GovernanceSummaryPanel.tsx`: エラーメッセージ文字列が `skillCreatorAPI` を参照するよう変更済み
- [ ] `ImprovementProposalPanel.tsx`: `applyRuntimeImprovement` の呼び出しが `window.skillCreatorAPI` 経由に変更済み
- [ ] `creatorHandlers.ts`: `SKILL_CREATOR_GET_ADAPTER_STATUS` の重複 `ipcMain.handle`（line 254-287）削除済み
- [ ] `skillCreator.ts`: Session IPC 型 / Runtime IPC 型 / Session Resume 型のセクション区切りコメント追加済み

### IPC 契約整合性

- [ ] `SKILL_CREATOR_GET_ADAPTER_STATUS` の register が1回のみになっている
- [ ] `unregisterRuntimeSkillCreatorHandlers()` の `removeHandler` リストとの対称性が保たれている
- [ ] `window.electronAPI.skillCreator` を直接参照している本番コードが0件になっている（grep 確認）
- [ ] `window.electronAPI.skillCreatorSession` を直接参照している本番コードが0件になっている（grep 確認）

### 型安全性

- [ ] `pnpm --filter @repo/desktop typecheck` がエラー0件で完了する
- [ ] `ElectronAPI` インターフェース上に `skillCreator` / `skillCreatorSession` が存在しない

### テスト

- [ ] `GovernanceSummaryPanel.test.tsx` の `setupMockApi` が `window.skillCreatorAPI` を使用するよう更新済み
- [ ] `TC-R-11` が `window.skillCreatorAPI` 未定義ケースを検証するよう更新済み
- [ ] `pnpm --filter @repo/desktop test -- --run` が全件 pass する
- [ ] Phase 4 で定義したテストケースが全て pass する

### 成果物

- [ ] 本 `implementation-record.md` が `outputs/phase-5/` に存在する
- [ ] `artifacts.json` が更新されている
