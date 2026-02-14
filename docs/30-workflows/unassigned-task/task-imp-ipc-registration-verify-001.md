# IPC ハンドラ登録整合性自動検証テスト - タスク指示書

## メタ情報

```yaml
issue_number: 821
```

## メタ情報

| 項目         | 内容                                                       |
| ------------ | ---------------------------------------------------------- |
| タスクID     | task-imp-ipc-registration-verify-001                       |
| タスク名     | IPC ハンドラ登録整合性自動検証テスト                       |
| 分類         | 改善                                                       |
| 対象機能     | IPC ハンドラ登録・解除の整合性                             |
| 優先度       | 中                                                         |
| 見積もり規模 | 小規模                                                     |
| ステータス   | 未実施                                                     |
| 発見元       | UT-FIX-IPC-HANDLER-DOUBLE-REG-001 Phase 12（実装苦戦箇所） |
| 発見日       | 2026-02-14                                                 |
| 関連タスク   | UT-FIX-IPC-HANDLER-DOUBLE-REG-001                          |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UT-FIX-IPC-HANDLER-DOUBLE-REG-001 で `unregisterAllIpcHandlers()` を実装し、`Object.values(IPC_CHANNELS)` で全チャンネルを走査する設計にした。この設計により、`IPC_CHANNELS` に新しいチャンネルを追加するだけで自動的に解除対象に含まれる。

しかし、**`registerAllIpcHandlers()` 内のハンドラ登録関数と `IPC_CHANNELS` 定数の整合性を自動検証するテストが存在しない**。将来、新しい IPC ハンドラを追加する際に以下のケースが発生する可能性がある:

1. `IPC_CHANNELS` にチャンネルを追加したが、`registerAllIpcHandlers()` 内で登録関数を呼び忘れた
2. `registerAllIpcHandlers()` に登録関数を追加したが、`IPC_CHANNELS` に定数を追加し忘れた
3. ハンドラ登録で使用するチャンネル名が `IPC_CHANNELS` の値と一致しない

### 1.2 問題点・課題

| 問題点                                                    | 影響                                       |
| --------------------------------------------------------- | ------------------------------------------ |
| `IPC_CHANNELS` と実際の登録ハンドラの整合性が未検証       | 新規チャンネル追加時に不整合が検出されない |
| `registerAllIpcHandlers()` の網羅性が手動確認のみ         | ヒューマンエラーによる登録漏れリスク       |
| `unregisterAllIpcHandlers()` の走査が `IPC_CHANNELS` 依存 | 定数に含まれないチャンネルは解除されない   |

### 1.3 放置した場合の影響

| 影響                                                    | 深刻度 |
| ------------------------------------------------------- | ------ |
| 新規 IPC ハンドラ追加時の二重登録バグ再発               | 高     |
| `unregisterAllIpcHandlers()` が一部チャンネルを解除漏れ | 中     |
| macOS activate イベントでの部分的なハンドラ未登録       | 中     |
| チャンネル定数とハンドラの乖離がレビューで見落とされる  | 中     |

---

## 2. 何を達成するか（What）

### 2.1 目的

`IPC_CHANNELS` 定数と `registerAllIpcHandlers()` のハンドラ登録の整合性を自動検証するテストを追加し、将来の IPC ハンドラ追加時に不整合を CI で自動検出する。

### 2.2 最終ゴール

| ゴール                                                      | 検証方法           |
| ----------------------------------------------------------- | ------------------ |
| IPC_CHANNELS の全チャンネルにハンドラが登録されている       | テスト実行         |
| 登録されたハンドラが IPC_CHANNELS に含まれている            | テスト実行         |
| 新規チャンネル追加時にテストが失敗して不整合を検出する      | テスト追加時の検証 |
| 条件分岐ハンドラ（Auth/AuthFallback）の分岐が検証されている | テスト実行         |

### 2.3 スコープ

#### 含むもの

- `IPC_CHANNELS` と登録ハンドラの整合性テスト
- 条件分岐ハンドラ（Supabase設定有無）の分岐テスト
- `registerAllIpcHandlers()` → `unregisterAllIpcHandlers()` のラウンドトリップテスト

#### 含まないもの

- 各ハンドラの機能テスト（既存テストでカバー済み）
- Renderer Process 側のテスト
- E2E テスト

### 2.4 成果物

| 成果物                     | ファイルパス                                                             |
| -------------------------- | ------------------------------------------------------------------------ |
| 整合性検証テスト           | `apps/desktop/src/main/ipc/__tests__/ipc-registration-integrity.test.ts` |
| テスト用ヘルパー（必要時） | `apps/desktop/src/main/ipc/__tests__/helpers/registration-inspector.ts`  |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

| 条件                                     | 確認方法                  |
| ---------------------------------------- | ------------------------- |
| UT-FIX-IPC-HANDLER-DOUBLE-REG-001 が完了 | artifacts.json で確認     |
| `unregisterAllIpcHandlers()` が実装済み  | `ipc/index.ts` で確認     |
| IPC_CHANNELS 定数がフラット構造である    | `channels.ts` で確認      |
| Vitest テスト環境が設定済み              | `vitest.config.ts` で確認 |

### 3.2 依存タスク

| タスクID                          | ステータス |
| --------------------------------- | ---------- |
| UT-FIX-IPC-HANDLER-DOUBLE-REG-001 | 完了       |

### 3.3 必要な知識

| 知識領域                  | 重要度 |
| ------------------------- | ------ |
| Vitest モック             | 高     |
| Electron ipcMain API      | 高     |
| IPC_CHANNELS 定数構造     | 高     |
| TypeScript リフレクション | 中     |

### 3.4 推奨アプローチ

**アプローチ: ipcMain.handle/on のスパイ検証**

`vi.spyOn(ipcMain, 'handle')` と `vi.spyOn(ipcMain, 'on')` でハンドラ登録呼び出しをキャプチャし、登録されたチャンネル名の集合と `IPC_CHANNELS` の値集合を比較する。

```typescript
// 推奨テストパターン例
describe("IPC registration integrity", () => {
  it("全 IPC_CHANNELS にハンドラが登録されていること", () => {
    const handleSpy = vi.spyOn(ipcMain, "handle");
    const onSpy = vi.spyOn(ipcMain, "on");

    registerAllIpcHandlers(mockWindow);

    const registeredChannels = new Set([
      ...handleSpy.mock.calls.map((call) => call[0]),
      ...onSpy.mock.calls.map((call) => call[0]),
    ]);

    const expectedChannels = new Set(Object.values(IPC_CHANNELS));

    // 全 IPC_CHANNELS が登録されていること
    for (const channel of expectedChannels) {
      expect(registeredChannels.has(channel)).toBe(true);
    }
  });
});
```

| 利点                           | 欠点                               |
| ------------------------------ | ---------------------------------- |
| 実装が簡潔                     | 条件分岐ハンドラの網羅に工夫が必要 |
| 新規チャンネル追加時に自動検出 | ipcMain モックのセットアップが必要 |
| CI で自動実行可能              | -                                  |

### 3.5 実装上の注意点（親タスクからの教訓）

以下は UT-FIX-IPC-HANDLER-DOUBLE-REG-001 の実装で苦戦した箇所であり、本タスクでも同様の課題に直面する可能性が高い。

#### 教訓 1: Supabase 条件分岐ハンドラの取り扱い

`registerAllIpcHandlers()` 内では Supabase の設定有無に応じて `registerAuthHandlers()` または `registerAuthFallbackHandlers()` が条件分岐で呼ばれる。整合性テストでは**両方の分岐パスで登録されるチャンネルの和集合**が `IPC_CHANNELS` と一致することを検証する必要がある。

```typescript
// 条件分岐の存在を考慮
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
if (supabaseUrl && supabaseAnonKey) {
  registerAuthHandlers(mainWindow); // 認証チャンネル登録
} else {
  registerAuthFallbackHandlers(); // フォールバック登録
}
```

#### 教訓 2: `ipcMain.handle()` の二重登録テスト時の注意

テスト内で `registerAllIpcHandlers()` を複数回呼ぶ場合、`ipcMain.handle()` は同一チャンネルへの二重登録で例外を送出する。テスト間で必ず `unregisterAllIpcHandlers()` を `beforeEach` / `afterEach` で呼び出してリセットすること。

#### 教訓 3: `IPC_CHANNELS` のフラット構造前提

`Object.values(IPC_CHANNELS)` が全チャンネル名の配列を返す前提で設計されている。テストでもこの前提を検証し、将来のネスト化に備えるアサーションを含めること。

```typescript
// IPC_CHANNELS がフラット構造であることの検証
it("IPC_CHANNELS の値がすべて文字列であること", () => {
  for (const value of Object.values(IPC_CHANNELS)) {
    expect(typeof value).toBe("string");
  }
});
```

#### 教訓 4: テスト間の状態リーク防止（P9）

IPC ハンドラのテストではモジュールスコープの `themeWatcherUnsubscribe` 等の状態がテスト間でリークしやすい。`beforeEach` で必ず全ハンドラを解除し、状態をリセットすること。

---

## 4. 実行手順

### Phase 構成

| Phase | 名称         | 主要タスク                                             |
| ----- | ------------ | ------------------------------------------------------ |
| 1     | 要件定義     | テストケース設計、IPC_CHANNELS 構造の確認              |
| 2     | 設計         | テストアーキテクチャ設計                               |
| 3     | 設計レビュー | テスト設計の妥当性検証                                 |
| 4     | テスト作成   | 整合性検証テストの実装                                 |
| 5     | 実装         | テスト用ヘルパーの実装（必要に応じて）                 |
| 6-9   | 品質検証     | テスト拡充・カバレッジ確認・リファクタリング・品質検証 |
| 10    | 最終レビュー | テスト品質の多角的検証                                 |
| 11    | 手動テスト   | 新規チャンネル追加シミュレーション                     |
| 12    | ドキュメント | テスト追加の実装ガイド、システム仕様書更新             |
| 13    | 完了         | PR準備                                                 |

### Phase 4: テスト実装

#### 推奨テストケース

```typescript
describe("IPC ハンドラ登録整合性", () => {
  // TC-1: 全チャンネルに対してハンドラが登録されている
  it("IPC_CHANNELS の全チャンネルにハンドラが登録されていること");

  // TC-2: 登録チャンネルが IPC_CHANNELS に含まれている（逆方向検証）
  it("登録されたチャンネルが全て IPC_CHANNELS に定義されていること");

  // TC-3: 条件分岐ハンドラの網羅
  it("Supabase設定ありの場合: 認証ハンドラが登録されること");
  it("Supabase設定なしの場合: フォールバックハンドラが登録されること");

  // TC-4: ラウンドトリップテスト
  it("register→unregister でハンドラが全解除されること");

  // TC-5: IPC_CHANNELS 構造検証
  it("IPC_CHANNELS の値がすべて文字列であること");
  it("IPC_CHANNELS に重複する値がないこと");
});
```

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `IPC_CHANNELS` の全チャンネルにハンドラが登録されていることを検証するテストがある
- [ ] 登録チャンネルが `IPC_CHANNELS` に含まれていることを検証するテストがある
- [ ] Supabase 条件分岐の両パスが検証されている
- [ ] register → unregister のラウンドトリップが検証されている
- [ ] `IPC_CHANNELS` の構造検証（フラット、文字列値、重複なし）がある

### 品質要件

- [ ] テストカバレッジ 90% 以上
- [ ] 型安全（`any` 型なし）
- [ ] テスト間の状態リークがない（`beforeEach` / `afterEach` でリセット）

### ドキュメント要件

- [ ] テスト追加の意図が実装ガイドに記載されている
- [ ] 新規チャンネル追加時の手順にテスト更新の確認が含まれている

---

## 6. 検証方法

### テストケース

| テストケース                                              | 期待結果                                      |
| --------------------------------------------------------- | --------------------------------------------- |
| 全 IPC_CHANNELS チャンネルのハンドラ登録確認              | 全チャンネルに対して handle/on が呼ばれている |
| IPC_CHANNELS に存在しないチャンネルの登録検出             | テストが失敗してアラートされる                |
| Supabase設定あり/なしの両分岐                             | 各分岐で正しいハンドラが登録される            |
| register→unregister→register の再登録                     | 例外なしで再登録が成功する                    |
| IPC_CHANNELS にダミーチャンネルを追加した場合のテスト失敗 | テストが新規チャンネルの未登録を検出する      |

### 検証手順

1. `cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/ipc-registration-integrity.test.ts` でテスト実行
2. IPC_CHANNELS にダミーチャンネルを一時追加し、テストが失敗することを確認
3. `pnpm --filter @repo/desktop exec tsc --noEmit` で型チェック

---

## 7. リスクと対策

| リスク                             | 影響度 | 発生確率 | 対策                                                        |
| ---------------------------------- | ------ | -------- | ----------------------------------------------------------- |
| ipcMain モックのセットアップが複雑 | 低     | 中       | 既存テスト（`ipc-double-registration.test.ts`）を参考にする |
| 条件分岐ハンドラの環境変数モック   | 低     | 中       | `vi.stubEnv()` で Supabase 環境変数を制御                   |
| テストが実装詳細に強く依存         | 中     | 低       | チャンネル名の集合比較のみで実装の内部構造に依存しない      |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                 | パス                                                                                                            |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------- |
| 既存 IPC 二重登録テスト      | `apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts`                                           |
| IPC セキュリティ仕様         | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                                    |
| アーキテクチャ実装パターン   | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`                     |
| 親タスク設計ドキュメント     | `docs/30-workflows/completed-tasks/UT-FIX-IPC-HANDLER-DOUBLE-REG-001/outputs/phase-2/design-document.md`        |
| 親タスクスキルフィードバック | `docs/30-workflows/completed-tasks/UT-FIX-IPC-HANDLER-DOUBLE-REG-001/outputs/phase-12/skill-feedback-report.md` |

### 参考資料

| 資料                  | 内容                                                |
| --------------------- | --------------------------------------------------- |
| Vitest spy API        | `vi.spyOn()`, `mock.calls`                          |
| Electron ipcMain API  | `handle()`, `on()`, `removeHandler()`               |
| P9 (テスト状態リーク) | `06-known-pitfalls.md` のモジュールスコープ変数対策 |

---

## 9. 備考

### 発見元の原文（スキルフィードバックレポート Section 2.2）

> `Object.values(IPC_CHANNELS)` で全チャンネル名を配列として取得することで、ハードコードされたチャンネル名に頼らず全チャンネルの一括操作が可能。チャンネル追加時の unregister 漏れを自動的に防止できる設計パターン。

### 補足事項

- 本テストは「IPC ハンドラ追加時のリグレッション防止」が主目的
- 既存の `ipc-double-registration.test.ts`（7テスト）は二重登録防止の動作テスト。本タスクは定数と登録関数の整合性テストであり、観点が異なる
- テスト実装は Vitest の spy 機能を使用し、ipcMain の実際の登録ロジックは実行しない（モック環境）
- 本タスクの完了により、IPC ハンドラの追加・削除時に CI で自動的に整合性が検証される
