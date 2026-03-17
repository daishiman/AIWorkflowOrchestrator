# AllowedToolEntryV2 PermissionStore 適用 - タスク指示書

## メタ情報

```yaml
issue_number: 1297
```

## メタ情報

| 項目         | 内容                                                                    |
| ------------ | ----------------------------------------------------------------------- |
| タスクID     | UT-06-002                                                               |
| タスク名     | AllowedToolEntryV2 PermissionStore 適用                                 |
| 分類         | 実装                                                                    |
| 対象機能     | PermissionStore / electron-store 永続化 / Trust & Permission Governance |
| 優先度       | 高                                                                      |
| 見積もり規模 | 中規模                                                                  |
| ステータス   | 未実施                                                                  |
| 依存タスク   | TASK-SKILL-LIFECYCLE-08                                                 |
| 発見元       | TASK-SKILL-LIFECYCLE-06 Phase 12（未タスク検出）                        |
| 発見日       | 2026-03-16                                                              |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-SKILL-LIFECYCLE-06 の Phase 5 で設計された `AllowedToolEntryV2` と `PermissionStore` インターフェースが定義されたが、`electron-store` への永続化ロジック（read / write / clear-session-entries）の具体的な実装と、セッション終了タイミングの IPC 定義が未完了である。

### 1.2 問題点・課題

- `PermissionStore` の `read` / `write` / `clearSessionEntries` メソッドの実装が不在
- セッション終了時（アプリ終了、スキル実行完了等）のセッションスコープエントリのクリアタイミングが未定義
- IPC チャンネル `permission:clear-session` の定義と登録が未実装
- `electron-store` スキーマに `AllowedToolEntryV2` 配列の定義が不足している可能性がある

### 1.3 放置した場合の影響

- 権限判断の永続化が機能しないため、ユーザーが毎回権限確認を受ける
- セッションスコープの権限エントリが意図せず残留する
- TASK-SKILL-LIFECYCLE-08 での PermissionDialog 実装が PermissionStore に依存するため、後続実装がブロックされる

---

## 2. 何を達成するか（What）

### 2.1 目的

`AllowedToolEntryV2` 型を使用した `PermissionStore` の永続化ロジックを `electron-store` ベースで実装し、セッション終了 IPC を定義する。

### 2.2 最終ゴール

- `PermissionStore` の `read` / `write` / `clearSessionEntries` が実装されている
- `electron-store` スキーマに `allowedTools: AllowedToolEntryV2[]` が定義されている
- IPC チャンネル `permission:clear-session` が登録されている
- セッション終了タイミング（アプリ終了 / スキル実行完了）でセッションエントリがクリアされる
- 単体テストが追加されている

### 2.3 スコープ

#### 含むもの

- `PermissionStore` 実装クラスの作成
- `electron-store` スキーマ更新
- IPC チャンネル `permission:clear-session` の定義と登録
- セッション終了フックの実装

#### 含まないもの

- `PermissionDialog` コンポーネント実装（TASK-SKILL-LIFECYCLE-08 のスコープ）
- `SafetyGate` との統合（UT-06-003 のスコープ）

### 2.4 成果物

- `apps/desktop/src/main/stores/permission-store.ts`（新規）
- 更新された `apps/desktop/src/main/ipc/handlers/permission.ts`（IPC チャンネル追加）
- 更新された `apps/desktop/src/main/ipc/channels.ts`（チャンネル定数追加）
- テストファイル `apps/desktop/src/main/stores/permission-store.test.ts`

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-SKILL-LIFECYCLE-06 が完了していること
- Phase 5 の `permission-store-interface.ts` が参照可能であること

### 3.2 依存タスク

| タスクID                | タスク名                           | ステータス |
| ----------------------- | ---------------------------------- | ---------- |
| TASK-SKILL-LIFECYCLE-06 | Trust & Permission Governance      | 完了       |
| TASK-SKILL-LIFECYCLE-08 | PermissionDialog UI 実装（後続）   | 未実施     |
| UT-06-006               | high × time_24h テスト追加（後続） | 未実施     |
| UT-06-007               | high × time_7d テスト追加（後続）  | 未実施     |

### 3.3 必要な知識

- `electron-store` の使用方法（スキーマ定義、型安全な read/write）
- Electron Main Process での IPC ハンドラ登録パターン
- セッション管理（アプリライフサイクルイベント）

### 3.4 推奨アプローチ

Phase 5 の `outputs/phase-5/permission-store-interface.ts` を参照し、以下のパターンで実装する。

```typescript
// apps/desktop/src/main/stores/permission-store.ts

import Store from "electron-store";
import type { AllowedToolEntryV2 } from "@repo/shared";

interface PermissionStoreSchema {
  allowedTools: AllowedToolEntryV2[];
}

export class PermissionStore {
  private store: Store<PermissionStoreSchema>;

  constructor() {
    this.store = new Store<PermissionStoreSchema>({
      name: "permission-store",
      defaults: { allowedTools: [] },
    });
  }

  read(toolName: string, skillName: string): AllowedToolEntryV2 | undefined {
    const entries = this.store.get("allowedTools");
    return entries.find(
      (e) => e.toolName === toolName && e.skillName === skillName,
    );
  }

  write(entry: AllowedToolEntryV2): void {
    const entries = this.store.get("allowedTools");
    const index = entries.findIndex(
      (e) => e.toolName === entry.toolName && e.skillName === entry.skillName,
    );
    if (index >= 0) {
      entries[index] = entry;
    } else {
      entries.push(entry);
    }
    this.store.set("allowedTools", entries);
  }

  clearSessionEntries(): void {
    const entries = this.store.get("allowedTools");
    this.store.set(
      "allowedTools",
      entries.filter((e) => e.scope !== "session"),
    );
  }
}
```

---

## 4. 実行手順

### Phase 1: PermissionStore 実装

#### 目的

`electron-store` を使用した `PermissionStore` クラスを実装する。

#### 手順

1. Phase 5 の `outputs/phase-5/permission-store-interface.ts` で `AllowedToolEntryV2` の型定義を確認
2. `apps/desktop/src/main/stores/permission-store.ts` を新規作成
3. `read` / `write` / `clearSessionEntries` メソッドを実装
4. `pnpm typecheck` で型エラーがないことを確認

#### 成果物

- `apps/desktop/src/main/stores/permission-store.ts`

#### 完了条件

- [ ] `PermissionStore` クラスが実装されている
- [ ] `read` / `write` / `clearSessionEntries` が正しく動作する
- [ ] 型エラーが 0 件

### Phase 2: IPC チャンネル定義と登録

#### 目的

`permission:clear-session` IPC チャンネルを定義・登録し、セッション終了フックを実装する。

#### 手順

1. `apps/desktop/src/main/ipc/channels.ts` に `PERMISSION_CLEAR_SESSION` チャンネル定数を追加
2. `apps/desktop/src/main/ipc/handlers/permission.ts` にハンドラを追加
3. アプリ終了イベント（`before-quit`）で `clearSessionEntries` を呼び出すフックを追加
4. IPC 契約チェックリスト（ipc-contract-checklist.md）の Phase 1-6 を実施

#### 成果物

- 更新された `channels.ts`
- 更新された `permission.ts`

#### 完了条件

- [ ] `permission:clear-session` チャンネルが登録されている
- [ ] アプリ終了時に `clearSessionEntries` が呼び出される
- [ ] P42 準拠の 3 段バリデーションが適用されている

### Phase 3: テスト追加

#### 目的

`PermissionStore` の各メソッドを検証するテストを追加する。

#### 手順

1. `apps/desktop/src/main/stores/permission-store.test.ts` を作成
2. `read` / `write` / `clearSessionEntries` のテストケースを追加
3. session / permanent / time スコープの組み合わせを検証
4. `pnpm --filter @repo/desktop test` を実行して全テスト PASS を確認

#### 成果物

- `apps/desktop/src/main/stores/permission-store.test.ts`

#### 完了条件

- [ ] 全テストが PASS する
- [ ] `clearSessionEntries` が session スコープのみ削除することを検証するテストがある

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `PermissionStore.read()` が toolName + skillName で検索できる
- [ ] `PermissionStore.write()` が既存エントリを上書き、新規エントリを追加できる
- [ ] `PermissionStore.clearSessionEntries()` が session スコープのみ削除できる
- [ ] `permission:clear-session` IPC チャンネルが登録されている
- [ ] アプリ終了時にセッションエントリがクリアされる

### 品質要件

- [ ] TypeScript 型エラーが 0 件
- [ ] ESLint エラーが 0 件
- [ ] 単体テストが PASS する
- [ ] IPC 契約チェックリスト（Phase 1-6）完了

### ドキュメント要件

- [ ] 各メソッドに JSDoc コメントが付与されている

---

## 6. 検証方法

### テストコマンド

```bash
pnpm --filter @repo/desktop test src/main/stores/permission-store.test.ts
```

### 検証手順

1. テストが全 PASS すること
2. `clearSessionEntries` 後に session スコープのエントリが 0 件になること
3. permanent / time スコープのエントリが `clearSessionEntries` 後も残ること

---

## 7. リスクと対策

| リスク                                          | 影響度 | 発生確率 | 対策                                                            |
| ----------------------------------------------- | ------ | -------- | --------------------------------------------------------------- |
| electron-store スキーマ変更による既存データ破損 | 高     | 低       | migration ロジックを追加する                                    |
| セッション終了タイミングの競合                  | 中     | 中       | `before-quit` イベントで同期的に clearSessionEntries を呼び出す |

---

## 8. 参照情報

### 関連ドキュメント

| 参照資料                   | パス                                                                                                                                                |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 5 PermissionStore IF | `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-5/permission-store-interface.ts` |
| Phase 2 設計書             | `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-2/`                              |
| IPC 契約チェックリスト     | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`                                                                       |

---

## 9. 備考

### 関連タスク

| タスクID  | 関係性                                       |
| --------- | -------------------------------------------- |
| UT-06-003 | 後続（SafetyGate が PermissionStore を使用） |
| UT-06-006 | 後続（high × time_24h テスト追加）           |
| UT-06-007 | 後続（high × time_7d テスト追加）            |

### 補足事項

- P42 準拠の 3 段バリデーション（型チェック → 空文字列 → トリム空文字列）を IPC ハンドラに適用すること
- `electron-store` の型安全な使用のため、スキーマ定義は `schema` オプションで明示すること
