# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                      |
| ---------- | ------------------------- |
| Phase      | 6                         |
| Phase名    | テスト拡充                |
| 前提Phase  | Phase 5（実装）           |
| 後続Phase  | Phase 7（カバレッジ確認） |
| ステータス | 未実施                    |
| 作成日     | 2026-01-24                |
| 機能名     | SkillImportStore          |

---

## 目的

Phase 5 の実装に対し、エッジケース・異常系・境界値のテストを追加する。
テストカバレッジ目標（Line 80%+, Branch 60%+）達成に向けてテストを拡充する。

## 背景

基本的なテストだけでは、実運用時に発生する様々なケースをカバーできない。
エッジケースや異常系のテストを追加することで、堅牢な実装を保証する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: エッジケーステストの追加

**目的**: 境界値・特殊ケースのテストを追加する

**実行手順**:

1. 空文字列のスキル名でのテスト
2. 特殊文字を含むスキル名でのテスト
3. 同じスキルの重複インポートテスト
4. 存在しないスキルへの操作テスト

**テストケース**:

```typescript
describe("edge cases", () => {
  it("should handle empty skill name gracefully", () => {
    // 空文字列でエラーにならないか
  });

  it("should handle special characters in skill name", () => {
    // 日本語、記号などを含むスキル名
    skillImportStore.addImport("日本語スキル");
    expect(skillImportStore.exists("日本語スキル")).toBe(true);
  });

  it("should handle duplicate import", () => {
    skillImportStore.addImport("test-skill");
    skillImportStore.addImport("test-skill");
    // 上書きされるか、エラーになるか
  });

  it("should handle operations on non-existent skill", () => {
    // 存在しないスキルへの updateLastUsed
    skillImportStore.updateLastUsed("non-existent");
    // エラーにならないことを確認
  });
});
```

**期待される成果物**:

- `outputs/phase-6/edge-case-tests.md`

---

### タスク2: 異常系テストの追加

**目的**: エラーハンドリングのテストを追加する

**実行手順**:

1. 破損データでの初期化テスト
2. ディスク書き込みエラーのテスト（モック使用）
3. 不正な値でのテスト
4. 型不整合のテスト

**テストケース**:

```typescript
describe("error handling", () => {
  it("should handle corrupted store data", () => {
    // 破損データでもデフォルト値で動作
  });

  it("should handle invalid settings values", () => {
    // 不正な値が設定されても動作
    skillImportStore.updateSettings("test-skill", {
      autoApproveReadOnly: "invalid" as unknown as boolean,
    });
  });

  it("should handle missing fields in stored data", () => {
    // フィールドが欠けているデータでも動作
  });
});
```

**期待される成果物**:

- `outputs/phase-6/error-handling-tests.md`

---

### タスク3: 権限管理の詳細テスト

**目的**: 権限管理機能の詳細なテストを追加する

**実行手順**:

1. 複数ツールへの権限記憶テスト
2. 権限上書きテスト
3. スキル削除時の権限クリアテスト
4. rememberPermissions=false の動作テスト

**テストケース**:

```typescript
describe("permission management - detailed", () => {
  it("should remember permissions for multiple tools", () => {
    skillImportStore.rememberPermission("skill", "Read", "allow");
    skillImportStore.rememberPermission("skill", "Write", "deny");
    skillImportStore.rememberPermission("skill", "Edit", "allow");

    expect(skillImportStore.getRememberedPermission("skill", "Read")).toBe(
      "allow",
    );
    expect(skillImportStore.getRememberedPermission("skill", "Write")).toBe(
      "deny",
    );
    expect(skillImportStore.getRememberedPermission("skill", "Edit")).toBe(
      "allow",
    );
  });

  it("should overwrite existing permission", () => {
    skillImportStore.rememberPermission("skill", "Read", "allow");
    skillImportStore.rememberPermission("skill", "Read", "deny");
    expect(skillImportStore.getRememberedPermission("skill", "Read")).toBe(
      "deny",
    );
  });

  it("should clear permissions when skill is removed", () => {
    skillImportStore.addImport("skill");
    skillImportStore.rememberPermission("skill", "Read", "allow");
    skillImportStore.removeImport("skill");
    expect(
      skillImportStore.getRememberedPermission("skill", "Read"),
    ).toBeUndefined();
  });
});
```

**期待される成果物**:

- `outputs/phase-6/permission-detailed-tests.md`

---

### タスク4: キャッシュ管理の詳細テスト

**目的**: キャッシュ管理機能の詳細なテストを追加する

**実行手順**:

1. キャッシュの有効期限確認テスト
2. 大量スキルのキャッシュテスト
3. キャッシュとインポート状態の整合性テスト
4. 部分的キャッシュ無効化テスト

**テストケース**:

```typescript
describe("cache management - detailed", () => {
  it("should record cache timestamp", () => {
    const before = new Date().toISOString();
    skillImportStore.setCache("skill", mockMetadata);
    const cached = skillImportStore.getCache("skill");
    expect(cached?.cachedAt).toBeDefined();
    expect(new Date(cached!.cachedAt).getTime()).toBeGreaterThanOrEqual(
      new Date(before).getTime(),
    );
  });

  it("should handle multiple skills cache independently", () => {
    skillImportStore.setCache("skill-1", metadata1);
    skillImportStore.setCache("skill-2", metadata2);
    skillImportStore.invalidateCache("skill-1");

    expect(skillImportStore.getCache("skill-1")).toBeUndefined();
    expect(skillImportStore.getCache("skill-2")).toBeDefined();
  });

  it("should clear cache when skill is removed", () => {
    skillImportStore.addImport("skill");
    skillImportStore.setCache("skill", mockMetadata);
    skillImportStore.removeImport("skill");
    expect(skillImportStore.getCache("skill")).toBeUndefined();
  });
});
```

**期待される成果物**:

- `outputs/phase-6/cache-detailed-tests.md`

---

### タスク5: マイグレーション詳細テスト

**目的**: スキーママイグレーションの詳細なテストを追加する

**実行手順**:

1. バージョン0からバージョン1へのマイグレーションテスト
2. 既存データの保持確認テスト
3. 将来のバージョンへの対応テスト
4. マイグレーション失敗時の動作テスト

**テストケース**:

```typescript
describe("schema migration - detailed", () => {
  it("should preserve existing data during migration", () => {
    // v0データを設定
    // マイグレーション実行
    // データが保持されていることを確認
  });

  it("should set default values for new fields", () => {
    // v0データにはない新フィールドがデフォルト値で追加される
  });

  it("should handle future version gracefully", () => {
    // 未知のバージョンでもエラーにならない
  });
});
```

**期待される成果物**:

- `outputs/phase-6/migration-detailed-tests.md`

---

## 参照資料

| 参照資料       | パス                                                                | 内容         |
| -------------- | ------------------------------------------------------------------- | ------------ |
| 実装ファイル   | `apps/desktop/src/main/settings/skillImportStore.ts`                | 実装コード   |
| テストファイル | `apps/desktop/src/main/settings/__tests__/skillImportStore.test.ts` | テストコード |
| テスト設計     | `outputs/phase-2/test-design.md`                                    | テスト設計   |

---

## 成果物

| 成果物               | パス                                           | 内容         |
| -------------------- | ---------------------------------------------- | ------------ |
| エッジケーステスト   | `outputs/phase-6/edge-case-tests.md`           | テストケース |
| 異常系テスト         | `outputs/phase-6/error-handling-tests.md`      | テストケース |
| 権限管理詳細テスト   | `outputs/phase-6/permission-detailed-tests.md` | テストケース |
| キャッシュ詳細テスト | `outputs/phase-6/cache-detailed-tests.md`      | テストケース |
| マイグレーション詳細 | `outputs/phase-6/migration-detailed-tests.md`  | テストケース |

---

## 統合テスト連携

> 統合テストの拡充（全カテゴリのカバレッジ向上）

| テストカテゴリ | 追加テスト                             |
| -------------- | -------------------------------------- |
| IPC連携        | エラー時のIPC応答テスト                |
| データ永続化   | ストアファイル破損時の動作テスト       |
| 状態整合性     | Renderer状態とストア状態の整合性テスト |

---

## 完了条件

- [ ] エッジケーステストが追加されている
- [ ] 異常系テストが追加されている
- [ ] 権限管理の詳細テストが追加されている
- [ ] キャッシュ管理の詳細テストが追加されている
- [ ] マイグレーションの詳細テストが追加されている
- [ ] 全てのテストがパスする
- [ ] テストケース数が Phase 4 より増加している

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（5タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物（5ファイル）が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 5 が完了していること
- **後続**: Phase 7（カバレッジ確認）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-import-agent-system/tasks/task-2b-skill-import-store/phase-7-coverage-check.md`
