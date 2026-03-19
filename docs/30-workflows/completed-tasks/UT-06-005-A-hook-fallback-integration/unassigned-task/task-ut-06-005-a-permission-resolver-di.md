# SkillExecutor 内 PermissionResolver の DIP 準拠 DI 化 - タスク指示書

## メタ情報

```yaml
issue_number: 1295
```

| 項目         | 内容                                                  |
| ------------ | ----------------------------------------------------- |
| タスクID     | UT-06-005-A-PERMISSION-RESOLVER-DI                    |
| タスク名     | SkillExecutor 内 PermissionResolver の DIP 準拠 DI 化 |
| 分類         | リファクタリング（設計負債解消）                      |
| 対象機能     | SkillExecutor / PermissionResolver                    |
| 優先度       | 中                                                    |
| 見積もり規模 | 小規模                                                |
| ステータス   | 未実施                                                |
| 発見元       | UT-06-005-A Phase 12 コード品質分析（2026-03-17）     |
| 発見日       | 2026-03-17                                            |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`SkillExecutor` は Permission フロー（abort/skip/retry/timeout フォールバック）を実現するため、
`PermissionResolver` クラスに強く依存している。しかし現在のコンストラクタでは、
`PermissionStore` は `IPermissionStore` インターフェース経由で DI されているのに対し、
`PermissionResolver` は `new PermissionResolver()` と具象クラスを直接生成している非対称な状態にある。

```typescript
// apps/desktop/src/main/services/skill/SkillExecutor.ts L517-526
constructor(
  mainWindow: BrowserWindow,
  permissionStore?: IPermissionStore,  // インターフェース経由（DI 済み）
  authKeyService?: IAuthKeyService,
) {
  this.mainWindow = mainWindow;
  this.permissionResolver = new PermissionResolver(); // 具象クラス直接生成（DIP 違反）
  this.permissionStore = permissionStore ?? new PermissionStore();
  this.authKeyService = authKeyService ?? null;
}
```

### 1.2 問題点・課題

1. **DIP 違反**: `SkillExecutor` が具象クラス `PermissionResolver` に直接依存しており、
   上位モジュールが下位モジュールの実装詳細を知ることになる
2. **テストのモック困難**: テストコードで `PermissionResolver` の動作をモック差し替えできず、
   テストに実際の IPC 通信が必要になる
3. **設計の非対称性**: `IPermissionStore` は DI 済みだが `PermissionResolver` は未対応であり、
   コードを読む際の一貫性が損なわれる
4. **既知 Pitfall P61 の再現**: IPC ハンドラの DIP 違反と同パターンが SkillExecutor にも存在する

### 1.3 放置した場合の影響

- `PermissionResolver` の実装を変更するたびに `SkillExecutor` 側のテストが影響を受ける
- 将来、`PermissionResolver` の異なる実装（例: リモート権限サービス連携）を導入する際に
  `SkillExecutor` の変更が必要になる
- 設計負債が蓄積し、テスト可能性が低下し続ける

---

## 2. 何を達成するか（What）

### 2.1 目的

`IPermissionResolver` インターフェースを抽出し、`SkillExecutor` のコンストラクタで
`PermissionResolver` をオプションの DI として受け取れるようにする。
`PermissionStore` の DI パターンと対称の設計にする。

### 2.2 最終ゴール

- `IPermissionResolver` インターフェースが `PermissionResolver.ts` に追加されている
- `SkillExecutor` コンストラクタが `permissionResolver?: IPermissionResolver` を受け取る
- 未指定時は `new PermissionResolver()` でデフォルト生成する（後方互換）
- テストで `mockPermissionResolver` を差し込んで IPC 通信なしで検証できる
- 既存のすべてのテストが引き続き PASS する

### 2.3 スコープ

#### 含むもの

- `IPermissionResolver` インターフェース定義の抽出
- `SkillExecutor` コンストラクタへの `permissionResolver` オプション引数追加
- 既存テストへの `mockPermissionResolver` 差し込み対応
- `PermissionResolver` クラスが `IPermissionResolver` を実装することの明示

#### 含まないもの

- `PermissionResolver` の内部ロジック変更
- 新規 Permission フロー機能追加
- `PermissionStore` の実装変更
- `@repo/shared` への型公開（ローカル定義で十分）

### 2.4 成果物

- `apps/desktop/src/main/services/skill/PermissionResolver.ts`（`IPermissionResolver` インターフェース追加）
- `apps/desktop/src/main/services/skill/SkillExecutor.ts`（コンストラクタ修正）
- `apps/desktop/src/main/services/skill/__tests__/hooks.test.ts`（mockPermissionResolver 差し込み確認）
- `apps/desktop/src/main/services/skill/__tests__/performance.test.ts`（同上）
- `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.hook-fallback.test.ts`（同上）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- UT-06-005-A（abort/skip/retry/timeout フォールバック実装）が完了していること
- `PermissionResolver` クラスのパブリックメソッドが確定していること
- 既存テストが PASS していること

### 3.2 依存タスク

| タスクID    | タスク名                                            | ステータス |
| ----------- | --------------------------------------------------- | ---------- |
| UT-06-005-A | Permission 拒否時の abort/skip/retry フォールバック | 完了       |
| TASK-3-2    | PermissionResolver 実装                             | 完了       |

### 3.3 必要な知識

- TypeScript インターフェース抽出パターン
- 依存性の逆転原則（DIP）
- Vitest のモック（`vi.fn()`）
- `PermissionResolver` のパブリック API

### 3.4 推奨アプローチ

#### Step 1: IPermissionResolver インターフェース抽出

`PermissionResolver.ts` の先頭に `IPermissionResolver` インターフェースを追加し、
`PermissionResolver` クラスが `implements IPermissionResolver` を明示する。

```typescript
// apps/desktop/src/main/services/skill/PermissionResolver.ts

/** PermissionResolver の DI 用インターフェース */
export interface IPermissionResolver {
  resolve(
    executionId: string,
    requestId: string,
    toolName: string,
    args: Record<string, unknown>,
    mainWindow: BrowserWindow,
    permissionStore: IPermissionStore | null,
  ): Promise<SkillPermissionResponse>;
}

export class PermissionResolver implements IPermissionResolver {
  // 既存の実装はそのまま
}
```

#### Step 2: SkillExecutor コンストラクタ修正

```typescript
// 変更前（DIP 違反）
constructor(
  mainWindow: BrowserWindow,
  permissionStore?: IPermissionStore,
  authKeyService?: IAuthKeyService,
) {
  this.permissionResolver = new PermissionResolver(); // 具象クラス直接依存
  this.permissionStore = permissionStore ?? new PermissionStore();
  this.authKeyService = authKeyService ?? null;
}

// 変更後（DIP 準拠・後方互換あり）
constructor(
  mainWindow: BrowserWindow,
  permissionStore?: IPermissionStore,
  authKeyService?: IAuthKeyService,
  permissionResolver?: IPermissionResolver,
) {
  this.mainWindow = mainWindow;
  this.permissionResolver = permissionResolver ?? new PermissionResolver();
  this.permissionStore = permissionStore ?? new PermissionStore();
  this.authKeyService = authKeyService ?? null;
}
```

> `permissionResolver` は第4引数に追加する。既存の呼び出し元は
> 3引数のままで動作するため後方互換性が維持される。

#### Step 3: フィールド型宣言の修正

```typescript
// 変更前
private permissionResolver: PermissionResolver;

// 変更後
private permissionResolver: IPermissionResolver;
```

#### Step 4: テストへの mockPermissionResolver 差し込み

```typescript
// __tests__/hooks.test.ts の例
const mockPermissionResolver: IPermissionResolver = {
  resolve: vi.fn().mockResolvedValue({ action: "allow" }),
};

const executor = new SkillExecutor(
  mockMainWindow,
  mockPermissionStore,
  mockAuthKeyService,
  mockPermissionResolver, // 第4引数
);
```

---

## 4. 実行手順（Phase 構成）

### Phase 1: インターフェース抽出

**目的**: `IPermissionResolver` インターフェースを定義し、`PermissionResolver` が実装することを明示する

**手順**:

1. `PermissionResolver.ts` の `resolve()` メソッドシグネチャを確認
2. `IPermissionResolver` インターフェースを `PermissionResolver.ts` の先頭に追加
3. `class PermissionResolver implements IPermissionResolver` に変更
4. TypeScript コンパイルエラーがないことを確認

**成果物**:

- `PermissionResolver.ts`（`IPermissionResolver` 追加）

**完了条件**:

- `pnpm --filter @repo/desktop typecheck` が PASS

### Phase 2: SkillExecutor コンストラクタ修正

**目的**: `SkillExecutor` が `IPermissionResolver` を DI で受け取れるようにする

**手順**:

1. `SkillExecutor.ts` の `import` に `IPermissionResolver` を追加
2. フィールド `private permissionResolver: PermissionResolver` を `IPermissionResolver` に変更
3. コンストラクタに第4引数 `permissionResolver?: IPermissionResolver` を追加
4. コンストラクタ内の代入を `permissionResolver ?? new PermissionResolver()` に変更

**成果物**:

- `SkillExecutor.ts`（コンストラクタ修正）

**完了条件**:

- `pnpm --filter @repo/desktop typecheck` が PASS
- 既存テストがすべて PASS

### Phase 3: テスト修正・補完

**目的**: 既存テストを壊さず、新しい DI 引数を活用したテストを追加する

**手順**:

1. 既存テストファイル（hooks.test.ts / performance.test.ts / SkillExecutor.hook-fallback.test.ts）を確認
2. 必要に応じて `mockPermissionResolver` を定義してコンストラクタに渡す
3. `permissionResolver` が未指定の場合のデフォルト動作を確認するテストを追加

**成果物**:

- 更新済みテストファイル群

**完了条件**:

- `pnpm --filter @repo/desktop test` が PASS
- `permissionResolver` DI のテストが少なくとも1件存在する

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `IPermissionResolver` インターフェースが `PermissionResolver.ts` に定義されている
- [ ] `PermissionResolver` クラスが `implements IPermissionResolver` を明示している
- [ ] `SkillExecutor` フィールドの型が `IPermissionResolver` になっている
- [ ] `SkillExecutor` コンストラクタが第4引数 `permissionResolver?: IPermissionResolver` を受け取る
- [ ] 未指定時は `new PermissionResolver()` でデフォルト生成される（後方互換）

### 品質要件

- [ ] `pnpm --filter @repo/desktop typecheck` が PASS
- [ ] `pnpm --filter @repo/desktop test` が PASS（既存テスト含む）
- [ ] `any` 型を使用していない
- [ ] `PermissionResolver` の具象クラス型がフィールド宣言から除去されている

### ドキュメント要件

- [ ] コンストラクタの JSDoc コメントに `permissionResolver` パラメータの説明が追加されている

---

## 6. 検証方法

### テストケーステーブル

| TC-ID     | テスト内容                                            | 期待結果                                |
| --------- | ----------------------------------------------------- | --------------------------------------- |
| TC-DI-001 | `permissionResolver` 未指定でのデフォルト動作         | `new PermissionResolver()` が使用される |
| TC-DI-002 | `mockPermissionResolver` を DI した場合の動作         | モックの `resolve()` が呼ばれる         |
| TC-DI-003 | 既存の `hooks.test.ts` テスト群                       | 全件 PASS                               |
| TC-DI-004 | 既存の `performance.test.ts` テスト群                 | 全件 PASS                               |
| TC-DI-005 | 既存の `SkillExecutor.hook-fallback.test.ts` テスト群 | 全件 PASS                               |
| TC-DI-006 | TypeScript 型チェック                                 | コンパイルエラーなし                    |

### 検証手順

```bash
# 型チェック
pnpm --filter @repo/desktop typecheck

# テスト実行
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/
```

---

## 7. リスクと対策

| リスク                                           | 影響度 | 発生確率 | 対策                                                                |
| ------------------------------------------------ | ------ | -------- | ------------------------------------------------------------------- |
| コンストラクタ第4引数追加による呼び出し元修正    | 低     | 低       | オプション引数のため後方互換。`grep -rn "new SkillExecutor"` で確認 |
| `resolve()` シグネチャの不一致                   | 高     | 低       | インターフェース抽出前に既存メソッドシグネチャを正確に確認          |
| 既存テストの `PermissionResolver` 直接インポート | 中     | 中       | テスト修正時に `IPermissionResolver` 型で受け取るよう変更           |

---

## 8. 参照情報

### システム仕様（aiworkflow-requirements）

| 参照資料                      | パス                                                                                                   | 内容                      |
| ----------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------- |
| Executor コア仕様             | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor-core.md`              | SkillExecutor の設計仕様  |
| Executor 詳細仕様             | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor-details.md`           | コンストラクタ・DI の詳細 |
| Permission フォールバック教訓 | `.claude/skills/aiworkflow-requirements/references/lessons-learned-safety-gate-permission-fallback.md` | P61/P62 パターンの教訓    |
| Permission フォールバック仕様 | `.claude/skills/aiworkflow-requirements/references/workflow-permission-fallback-abort-skip-retry.md`   | フォールバックフロー仕様  |

### 関連ドキュメント

- 対象ファイル: `apps/desktop/src/main/services/skill/SkillExecutor.ts`（L499-526）
- 対象ファイル: `apps/desktop/src/main/services/skill/PermissionResolver.ts`
- 関連テスト: `apps/desktop/src/main/services/skill/__tests__/hooks.test.ts`
- 関連テスト: `apps/desktop/src/main/services/skill/__tests__/performance.test.ts`
- 関連テスト: `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.hook-fallback.test.ts`

---

## 9. 備考

### 関連タスク

| タスクID                     | 関係性                                      |
| ---------------------------- | ------------------------------------------- |
| UT-06-005-A                  | 親タスク（Phase 12 コード品質分析から発見） |
| TASK-3-2                     | 依存（PermissionResolver 実装元）           |
| UT-06-005-A-SANITIZE-ARGS    | 同期（同 Phase 12 で発見された設計負債）    |
| TASK-FIX-IPC-HANDLER-DIP-001 | 同パターン（P61 IPC ハンドラ DIP 違反修正） |

### 苦戦箇所と教訓

以下は UT-06-005-A の実装中に発見された同種課題をまとめた「5分解決カード」である。
同種の DIP 違反に遭遇した際は本カードを参照して対応方針を即座に判断すること。

#### 同種課題の5分解決カード

| #   | 苦戦箇所                                          | Pitfall | 症状                                                                                      | 解決策                                                                 | 所要時間目安 |
| --- | ------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------ |
| 1   | PermissionResolver 具象クラス直接生成（本タスク） | P61     | テストでモック差し替えが困難。IPC 通信なしでテスト不可                                    | `IPermissionResolver` を抽出し、コンストラクタ第4引数で DI             | 30分         |
| 2   | PermissionStore の DI スコープ問題（P62）         | P62(新) | `track()` クロージャ内でインスタンス化した PermissionStore が SafetyGate からアクセス不可 | インスタンス生成を上位スコープに移動し、クロージャ引数で渡す           | 20分         |
| 3   | IPC ハンドラが具象クラスを引数に取る              | P61     | `registerSafetyGateHandlers(gate: DefaultSafetyGate)` でテスタビリティが低下              | 引数型を `SafetyGatePort`（インターフェース）に変更                    | 15分         |
| 4   | `safeRegister` パターン不適合                     | P54     | 戻り値が必要なハンドラを `safeRegister` で囲むと戻り値が取れない                          | 「戻り値要否」を設計時に判断: 不要→`safeRegister`、必要→個別 try-catch | 10分         |
| 5   | 新依存追加時のテストファイル全修正                | P21/P35 | DI 引数追加のたびに既存テスト5ファイル全てにモック追加が必要                              | 事前に `grep -rn "new SkillExecutor"` で影響範囲を特定してから変更     | 20分         |

#### 苦戦箇所6: P62 PermissionStore の DI スコープ問題（新規教訓）

- **発見状況**: UT-06-005-A 実装中、`track()` クロージャ内部で `new PermissionStore()` を
  生成したため、SafetyGate の外部から同インスタンスへアクセスできなかった
- **症状**: `permissionStore.getChoice()` が常に `undefined` を返す（異なるインスタンスを参照）
- **解決策**: PermissionStore のインスタンス生成を `track()` クロージャの外側（上位スコープ）に
  移動し、クロージャの引数として渡すことでスコープを統一した
- **教訓**: クロージャ内でステートフルなオブジェクトを `new` すると、外部からアクセスできない
  プライベートインスタンスになる。DI で共有するインスタンスはクロージャの外で生成すること
- **関連パターン**: P61（IPC ハンドラ DIP 違反）、P34（遅延初期化 DI パターン選択）
