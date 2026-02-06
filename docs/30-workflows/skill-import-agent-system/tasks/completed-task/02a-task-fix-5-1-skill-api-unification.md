# SkillAPI統一 - タスク指示書

## メタ情報

| 項目         | 内容                                 |
| ------------ | ------------------------------------ |
| タスクID     | TASK-FIX-5-1-SKILL-API-UNIFICATION   |
| タスク名     | SkillAPI二重定義の解消（仕様書準拠） |
| 分類         | リファクタリング                     |
| 対象機能     | Preload SkillAPI                     |
| 優先度       | 高                                   |
| 見積もり規模 | 中規模                               |
| ステータス   | 未実施                               |
| 実行順序     | 02a（並列可能 — グループ01完了後）   |
| 発見元       | 無限ループ問題調査（Phase 12相当）   |
| 発見日       | 2026-02-03                           |
| 関連Phase    | Phase 5（TASK-5-1の前提修正）        |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

スキル管理機能が複数のTASK（TASK-3, 4, 7, 9C）で段階的に拡張された結果、2つの独立したskillAPI定義が存在している。仕様書（Phase 5-1）では単一のSkillAPIを定義するが、現在は異なるインターフェースが混在。

### 1.2 問題点・課題

| 問題                                  | 影響                           |
| ------------------------------------- | ------------------------------ |
| 同じ機能に対して2つのAPIが存在        | 呼び出し元によって動作が異なる |
| 戻り値の型が統一されていない          | `OperationResult<T>` vs 直接型 |
| `execute()`メソッドのシグネチャ不一致 | 入力形式が異なる               |
| スタブ実装と実装の混在                | 一部APIが動作しない            |

**execute()メソッドのシグネチャ差異**:

```typescript
// preload/skill-api.ts
execute: (request: SkillExecutionRequest) => Promise<SkillExecutionResponse>;

// renderer/preload/index.ts
execute: (skillId: string, params?: Record<string, unknown>) =>
  Promise<OperationResult<SkillRunResult>>;
```

**使用パターンの分離**:
| 呼び出し元 | 使用API | 経路 |
|-----------|---------|------|
| useSkillExecution | window.skillAPI | preload/skill-api.ts |
| AgentView | skillAPI (import) | renderer/preload/index.ts |
| ChatPanel/skillSlice | window.electronAPI.skill | preload/skill-api.ts |

### 1.3 放置した場合の影響

- 新機能追加時にどちらのAPIに追加すべきか不明確
- バグ修正時に両方のAPIを修正する必要があり、漏れが発生
- テストの複雑化
- 開発者のオンボーディングコスト増大

---

## 2. 何を達成するか（What）

### 2.1 目的

2つのskillAPIを1つの統合されたAPIに統一し、明確なインターフェースを提供する。

### 2.2 最終ゴール

1. 単一の`skillAPI`がすべてのスキル操作を提供
2. 一貫した戻り値型（`SkillExecutionResponse`等）
3. `window.electronAPI.skill`のみで公開（`window.skillAPI`は廃止検討）
4. `renderer/preload/index.ts`のskillAPI定義を削除

### 2.3 スコープ

#### 含むもの

- `renderer/preload/index.ts`と`preload/skill-api.ts`の統合
- 戻り値型の統一
- 公開方法の一本化
- 関連する呼び出し元の修正

#### 含まないもの

- Main ProcessのIPCハンドラの変更
- 新機能の追加
- 状態管理の変更（それはTASK-FIX-6-1で実施）

### 2.4 成果物

| 成果物         | 説明                       |
| -------------- | -------------------------- |
| 統合skillAPI   | 単一のAPI実装              |
| 型定義更新     | `@repo/shared`の型定義更新 |
| 呼び出し元修正 | 旧API→新APIの移行          |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-FIX-1-1-TYPE-ALIGNMENT完了
- TASK-FIX-4-1-IPC-CONSOLIDATION完了

### 3.2 依存タスク

- TASK-FIX-1-1-TYPE-ALIGNMENT（型定義が統一されていること）
- TASK-FIX-4-1-IPC-CONSOLIDATION（IPCチャンネルが統一されていること）

### 3.3 必要な知識

- Electron Preload Script
- TypeScript型定義
- Contextual Typing

### 3.4 推奨アプローチ

1. `preload/skill-api.ts`をベースに拡張
2. 仕様書のインターフェースに準拠
3. 段階的に呼び出し元を移行
4. 旧APIを削除

---

## 4. 実行手順

### Phase構成

Phase 1-13の標準フローに従う。

### Step 1: 両APIの比較分析

#### 目的

2つのAPIの差異を完全に把握

#### 手順

1. `preload/skill-api.ts`の全メソッドをリストアップ（13個）
2. `renderer/preload/index.ts`の全メソッドをリストアップ（6個）
3. 重複・差異を分析
4. 統一方針を決定

#### 成果物

- API比較分析表

### Step 2: 統一インターフェース設計

#### 目的

仕様書に準拠した統一APIを設計

#### 手順

1. 仕様書（specification.md §4）のAPI定義を確認
2. 両APIの機能をマージ
3. 統一インターフェースを定義

**統一インターフェース案**:

```typescript
interface SkillAPI {
  // 一覧・管理
  list: () => Promise<SkillMetadata[]>;
  getImported: () => Promise<ImportedSkill[]>;
  import: (skillIds: string[]) => Promise<void>;
  remove: (skillId: string) => Promise<void>;
  rescan: () => Promise<SkillMetadata[]>;

  // 実行
  execute: (request: SkillExecutionRequest) => Promise<SkillExecutionResponse>;
  abort: (executionId: string) => Promise<boolean>;
  getExecutionStatus: (executionId: string) => Promise<ExecutionInfo | null>;

  // イベント
  onStream: (callback: (message: SkillStreamMessage) => void) => () => void;
  onComplete: (callback: (data: { executionId: string }) => void) => () => void;
  onError: (
    callback: (data: { executionId: string; error: string }) => void,
  ) => () => void;

  // 権限
  onPermissionRequest: (
    callback: (request: SkillPermissionRequest) => void,
  ) => () => void;
  sendPermissionResponse: (
    response: PermissionResponse,
  ) => Promise<{ success: boolean }>;
}
```

#### 成果物

- 統一API設計書

### Step 3: 実装の統合

#### 目的

単一のAPI実装を作成

#### 手順

1. `preload/skill-api.ts`を更新
2. `renderer/preload/index.ts`のskillAPI部分を削除
3. 型定義を更新

#### 成果物

- 統合された`skill-api.ts`

### Step 4: 呼び出し元の移行

#### 目的

全ての呼び出し元を新APIに移行

#### 手順

1. `grep -rn "skillAPI\." apps/desktop/src/renderer/`で使用箇所を特定
2. AgentView、ChatPanel、useSkillExecution等を修正
3. テスト実行

#### 成果物

- 修正された呼び出し元

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 単一のskillAPIですべてのスキル操作が可能
- [ ] 既存の全呼び出し元が新APIを使用
- [ ] 旧API（renderer/preload/index.tsのskillAPI）が削除されている

### 品質要件

- [ ] 全テストがPASS
- [ ] 型安全性が確保されている
- [ ] カバレッジ80%以上

### ドキュメント要件

- [ ] API仕様書が更新されている

---

## 6. 検証方法

### テストケース

1. 全skillAPIメソッドの動作確認
2. エラーハンドリングの確認
3. ストリーミング・権限APIの動作確認

### 検証手順

1. 単体テスト実行
2. E2Eテスト実行
3. 手動での動作確認

---

## 7. リスクと対策

| リスク               | 影響度 | 発生確率 | 対策                         |
| -------------------- | ------ | -------- | ---------------------------- |
| 呼び出し元の修正漏れ | 高     | 中       | grepで全呼び出しを特定       |
| 型の不整合           | 中     | 中       | TypeScriptの厳格モードで検出 |
| テスト不足           | 中     | 低       | カバレッジ監視               |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/skill-import-agent-system/specification.md` §4（API定義）
- `apps/desktop/src/preload/skill-api.ts`
- `apps/desktop/src/renderer/preload/index.ts`

### 参考資料

- Electron Preload Script Best Practices

---

## 9. 備考

### 発見経緯

無限ループ問題の調査中に、`skill-api.ts`のスタブ実装が原因で`skillSlice`からの呼び出しが失敗していることを発見。2つのAPIの存在が根本原因であることを特定。

### 補足事項

このタスクはTASK-5-1（SkillAPI）の前提となる修正タスク。TASK-5-1では仕様書に基づく完全なAPIを実装するが、本タスクでは既存の重複を解消する。

TASK-FIX-4-1-IPC-CONSOLIDATIONと合わせて実施することで効率的。
