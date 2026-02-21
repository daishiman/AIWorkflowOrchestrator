# Phase 1 要件定義書: skill:import IPCハンドラ・Preloadインターフェース不整合修正

## メタ情報

| 項目         | 値                                                          |
| ------------ | ----------------------------------------------------------- |
| タスクID     | UT-FIX-SKILL-IMPORT-INTERFACE-001                           |
| タスク名     | skill:import IPCハンドラ・Preloadインターフェース不整合修正 |
| Phase        | 1（要件定義）                                               |
| 分類         | バグ修正                                                    |
| 対象機能     | スキルインポート機能                                        |
| 優先度       | 高（毎起動時エラー発生、再現率100%）                        |
| 見積もり規模 | 小規模（2-4時間）                                           |
| 作成日       | 2026-02-21                                                  |
| 前Phase依存  | なし                                                        |

---

## 1. 問題の根本原因分析

### 1.1 不整合の所在

| レイヤー     | ファイル                                     | 行番号  | 期待する引数             | 実際に受け取る引数    |
| ------------ | -------------------------------------------- | ------- | ------------------------ | --------------------- |
| Main Process | `apps/desktop/src/main/ipc/skillHandlers.ts` | 120-138 | `{ skillIds: string[] }` | --                    |
| Preload      | `apps/desktop/src/preload/skill-api.ts`      | 261-262 | --                       | `string`（skillName） |

Main Processのハンドラが **オブジェクト形式** `{ skillIds: string[] }` の引数を期待しているのに対し、Preload側の `skill-api.ts` は **単一の文字列** `skillName` をそのまま `safeInvoke` 経由で渡している。この乖離により、ハンドラ内部で `args?.skillIds` が `undefined` となり、`Array.isArray(undefined)` が `false` を返してバリデーションエラーが発生する。

### 1.2 根本原因（P23パターン: API二重定義の型管理複雑性）

本問題は P23パターン の典型的な再発事例である。ハンドラ実装時に「複数一括インポート」を想定して `{ skillIds: string[] }` 形式で設計したが、Preload側は単一スキルインポートのUI設計に基づいて `string` 直接渡しで実装された。コンパイル時にはPreload層がモック化されるため型不整合が検出されず、ランタイムで初めて顕在化する。

IPCチャンネルの引数仕様を変更する際に同時更新が必要な3箇所:

1. Main Process ハンドラ（`skillHandlers.ts`）
2. Preload API（`skill-api.ts`）
3. Preload 型定義（`types.ts` / `types.d.ts`）

今回は1と2の間で引数形式の契約が乖離していたことが直接原因である。

---

## 2. エラー発生メカニズム（呼び出しチェーン図）

```
Renderer:  window.electronAPI.skill.import("my-skill")
  |
  v
Preload:   safeInvoke(IPC_CHANNELS.SKILL_IMPORT, "my-skill")
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
           文字列 "my-skill" を第2引数としてそのまま渡す
  |
  v
Main:      ipcMain.handle("skill:import", async (event, args) => { ... })
           args = "my-skill"                       <-- args は文字列
           !Array.isArray(args?.skillIds)           <-- args.skillIds = undefined
           Array.isArray(undefined) === false       <-- バリデーション失敗
  |
  v
結果:      VALIDATION_ERROR: "skillIds must be an array"
```

**再現条件**: `pnpm --filter @repo/desktop dev` でアプリを起動し、スキルインポート操作を実行するたびに100%再現する（2026-02-21実機確認: 5回実行 → 5回エラー）。

---

## 3. skill:remove との対比表（P44パターン）

P44パターンとして、`skill:import` と `skill:remove` の両方で同一構造のインターフェース不整合が存在する。

| 項目             | skill:import（本タスク）         | skill:remove（UT-FIX-SKILL-REMOVE-INTERFACE-001） |
| ---------------- | -------------------------------- | ------------------------------------------------- |
| ハンドラ期待引数 | `{ skillIds: string[] }`（配列） | `{ skillId: string }`（オブジェクト）             |
| Preload渡し形式  | `string`（skillName）            | `string`（skillName）                             |
| エラーメッセージ | `skillIds must be an array`      | `skillId must be a string`                        |
| 不整合の本質     | 複数一括想定 vs 単一想定         | オブジェクト想定 vs 文字列直接渡し                |
| 修正ステータス   | **未修正**（本タスクで対応）     | **修正済み**（2026-02-20完了）                    |

両者に共通する構造的問題:

- ハンドラ側とPreload側で引数形式の設計方針が異なる
- コンパイル時にはPreloadのモック化により不整合が検出されない
- ランタイムで初めてバリデーションエラーとして顕在化する

---

## 4. 影響範囲

### 4.1 変更必要ファイル（2件）

| ファイル                                                                | 影響内容                                            |
| ----------------------------------------------------------------------- | --------------------------------------------------- |
| `apps/desktop/src/main/ipc/skillHandlers.ts` (行120-138)                | ハンドラの引数シグネチャ修正、3段バリデーション追加 |
| `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts` (行633-740) | テストの引数形式を修正後の仕様に合わせる            |

### 4.2 変更不要ファイル（4件）

| ファイル                                               | 確認結果                                                                                           |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/preload/skill-api.ts` (行261-262)    | 既に `safeInvoke(channel, skillName)` で文字列を正しく渡しており変更不要                           |
| `apps/desktop/src/preload/__tests__/skill-api.test.ts` | 既に文字列引数を期待するテストで正しく記述されており変更不要                                       |
| `packages/shared/src/agent/types.ts`                   | `skill:import` に関連する型定義が存在しないため変更不要                                            |
| `apps/desktop/src/preload/types.ts`                    | `import` メソッドは `(skillName: string) => Promise<ImportedSkill>` で正しく定義されており変更不要 |

---

## 5. 機能要件と検証方法

| ID   | 受入基準                                                                      | 検証方法                                                     |
| ---- | ----------------------------------------------------------------------------- | ------------------------------------------------------------ |
| FR-1 | `skill:import` を文字列引数で呼び出した場合にバリデーションエラーが発生しない | テスト SH-IMP-01 PASSで検証                                  |
| FR-2 | `skillService.importSkills` に正しいスキル名が配列として渡される              | テスト SH-IMP-01 で `toHaveBeenCalledWith([skillName])` 検証 |
| FR-3 | 存在しないスキル名での呼び出しがサービス層で適切に処理される                  | テスト SH-IMP-04 PASSで検証                                  |

### FR-1 詳細

修正後のハンドラは `string` 型の `skillName` を直接受け取り、P42準拠の3段バリデーションを通過した後に `skillService.importSkills([skillName])` として配列化して渡す。Preload側から渡される文字列がそのまま受け入れられるため、従来の `VALIDATION_ERROR: "skillIds must be an array"` は発生しなくなる。

### FR-2 詳細

ハンドラ内部で `[skillName]` として配列に変換した上で `skillService.importSkills()` に渡すことで、サービス層の既存インターフェース（`string[]` 引数）との互換性を維持する。

### FR-3 詳細

存在しないスキル名が渡された場合、ハンドラのバリデーションは通過するが、サービス層（`skillService.importSkills`）が適切にエラーハンドリングを行う。ハンドラ側ではスキルの存在確認は行わず、責務を分離する。

---

## 6. 品質要件と検証方法

| ID   | 受入基準                                                             | 検証方法                                               |
| ---- | -------------------------------------------------------------------- | ------------------------------------------------------ |
| QR-1 | P42準拠の3段バリデーション（型チェック → 空文字列 → トリム空文字列） | テスト SH-IMP-02, SH-IMP-03, SH-IMP-05, SH-IMP-06 PASS |
| QR-2 | `validateIpcSender` によるセキュリティ検証が維持される               | テスト SH-IMP-07, SH-IMP-08 PASS                       |
| QR-3 | カバレッジ基準: Line >= 80%, Branch >= 60%, Function >= 80%          | Phase 7 カバレッジレポートで検証                       |
| QR-4 | `pnpm typecheck` が通る                                              | Phase 9 品質検証で実行                                 |
| QR-5 | skill:import 以外の全テストにリグレッションがない                    | Phase 9 全テスト実行で検証                             |

### QR-1 詳細: 3段バリデーション

```typescript
// P42準拠の3段バリデーション
if (typeof skillName !== "string" || skillName.trim() === "") {
  throw {
    code: "VALIDATION_ERROR",
    message: "skillName must be a non-empty string",
  };
}
```

以下の入力パターンを拒否する:

- `undefined` / `null` / `123` / `[]` / `{}` -- 型チェックで拒否
- `""` -- 空文字列チェックで拒否
- `"   "` -- `.trim()` チェックで拒否

### QR-2 詳細: セキュリティ検証

`validateIpcSender` による送信元ウィンドウ検証は既存実装から変更しない。引数バリデーションの修正は `validateIpcSender` の後段で行われるため、セキュリティ層への影響はない。

---

## 7. 非スコープ

| 項目                              | 理由                                                  |
| --------------------------------- | ----------------------------------------------------- |
| skill:remove の修正               | 別タスク UT-FIX-SKILL-REMOVE-INTERFACE-001 で修正済み |
| 他の skill:\* ハンドラの修正      | 本タスクのスコープ外（skill:import のみ対象）         |
| Preload側（`skill-api.ts`）の変更 | 既に正しい実装のため変更不要                          |
| Preload型定義（`types.ts`）の変更 | 既に正しい型定義のため変更不要                        |
| 新規機能の追加                    | バグ修正タスクのため機能追加は含まない                |
| 一括インポート機能の実装          | 将来的に必要な場合は別チャンネルで対応                |
| IPC引数形式の全体標準化           | 本タスクのスコープを超える体系的改善課題              |

---

## 8. リスクと対策

| リスク                                                   | 影響度 | 発生確率 | 対策                                                         |
| -------------------------------------------------------- | ------ | -------- | ------------------------------------------------------------ |
| `skillService.importSkills()` が配列引数のみ受け取り可能 | 中     | 中       | ハンドラ内部で `[skillName]` として配列化してから渡す        |
| Preload側の型定義との不整合                              | 中     | 中       | P32準拠で `preload/types.ts` と `shared/types.ts` を同時確認 |
| インターフェース修正後も他箇所で不整合が残る             | 低     | 低       | P23準拠で3箇所同時更新を確認、修正後にランタイムテストで検証 |
| テストのモック設定が不完全                               | 低     | 低       | テストで実際のIPC通信パスの引数形式を検証する                |

---

## 9. 完了条件チェックリスト

### 根本原因分析

- [x] 不整合の所在（Main Process / Preload のファイル・行番号）が特定されている
- [x] エラー発生メカニズムが呼び出しチェーン図で記述されている
- [x] 根本原因が P23 パターン（API二重定義の型管理複雑性）として特定されている
- [x] skill:remove との対比表（P44パターン）が記載されている

### 影響範囲

- [x] 変更必要ファイル2件（`skillHandlers.ts`, `skillHandlers.test.ts`）が列挙されている
- [x] 変更不要ファイル4件（`skill-api.ts`, `skill-api.test.ts`, `shared/types.ts`, `preload/types.ts`）が列挙され、不要理由が記載されている

### 受入基準

- [x] 機能要件（FR-1 ~ FR-3）が検証方法付きで定義されている
- [x] 品質要件（QR-1 ~ QR-5）が検証方法付きで定義されている
- [x] 非スコープが明示されている

---

## 参照資料

| 資料                                                                                      | 用途                                          |
| ----------------------------------------------------------------------------------------- | --------------------------------------------- |
| `.claude/rules/06-known-pitfalls.md#P23`                                                  | API二重定義の型管理複雑性                     |
| `.claude/rules/06-known-pitfalls.md#P42`                                                  | 文字列引数の `.trim()` バリデーション漏れ     |
| `.claude/rules/06-known-pitfalls.md#P44`                                                  | skill:import/remove IPCインターフェース不整合 |
| `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`             | P23/P32/P42/P44 の統合チェックリスト          |
| `docs/30-workflows/completed-tasks/ut-fix-skill-remove-interface/phase-1-requirements.md` | 同一パターン（P44）の先行修正タスク           |

---

## 次Phase

Phase 2（設計）へ進む。修正方針（アプローチA: ハンドラ側をPreload側に合わせる）のインターフェース設計を行う。
