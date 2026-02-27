# Phase 8 ScheduleStore バリデーション抽出分析

## 分析対象

- `apps/desktop/src/main/services/skill/ScheduleStore.ts`（162行）

## 分析日時

2026-02-27（Phase 8-9 統合検証時に再分析）

## 分析結果

### add / update でのバリデーション重複

| メソッド     | バリデーション内容                         | 重複有無 |
| ------------ | ------------------------------------------ | -------- |
| add          | デフォルト値設定のみ（バリデーションなし） | -        |
| update       | findIndex + -1 チェック                    | 重複あり |
| delete       | findIndex + -1 チェック                    | 重複あり |
| addRunResult | findIndex + -1 チェック                    | 重複あり |

- add と update でスケジュール種別固有のバリデーション（cron式、interval範囲）は実行していない。これらのバリデーションは IPC ハンドラー層と SkillScheduler 層で実施されている。
- ScheduleStore はデータストアとして CRUD に専念しており、ビジネスバリデーションはサービス層に委譲している（SRP 適合）。

### findIndex + -1 チェックの重複

`update`, `delete`, `addRunResult` の3メソッドで以下の完全同一パターンが繰り返されていた:

```typescript
const index = this.schedules.findIndex((s) => s.id === id);
if (index === -1) {
  throw new Error(`Schedule not found: ${id}`);
}
```

3行 x 3箇所 = 9行の重複。仕様書の判断基準（3行以上の同一コードが3箇所以上）に該当。

## 実施済みリファクタリング

### findIndexOrThrow プライベートメソッドの抽出

```typescript
private findIndexOrThrow(id: string): number {
  const index = this.schedules.findIndex((s) => s.id === id);
  if (index === -1) {
    throw new Error(`Schedule not found: ${id}`);
  }
  return index;
}
```

### 変更箇所

| メソッド     | 変更内容                                          |
| ------------ | ------------------------------------------------- |
| update       | `findIndex + if` を `findIndexOrThrow(id)` に置換 |
| delete       | `findIndex + if` を `findIndexOrThrow(id)` に置換 |
| addRunResult | `findIndex + if` を `findIndexOrThrow(id)` に置換 |

### 抽出効果

- 重複コード 9行を 1メソッド（6行）に集約
- エラーメッセージの一貫性を保証（変更は1箇所で完結）
- テスト D-07, D-09 の「存在しないIDで例外」テストが引き続き PASS

## P19対策（データ復元バリデーション）の検証

コンストラクタでの復元バリデーション（L41-49）が適切に実装されていることを確認:

```typescript
const raw: unknown = this.store.get("scheduledSkills");
this.schedules = Array.isArray(raw)
  ? raw.filter(
      (item): item is ScheduledSkill =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as Record<string, unknown>).id === "string",
    )
  : [];
```

- `Array.isArray()` チェック: 配列でないデータ（文字列、null、数値、undefined）を空配列にフォールバック
- 要素フィルタリング: `id` フィールドが文字列でない不正要素を除外
- テスト D-14, D-15, DB-05 で網羅的に検証済み

## 見送りとした項目

| 項目                                  | 見送り理由                                                                         |
| ------------------------------------- | ---------------------------------------------------------------------------------- |
| add/update 共通バリデーション関数     | add はバリデーションなし、update はスキーマバリデーションなしで共通化対象がない    |
| P19対策バリデーションの関数化         | コンストラクタでの復元バリデーションは1箇所のみで抽出メリットなし                  |
| electron-store 読み込みバリデーション | ScheduleStore のバリデーションはデータ層に限定されており、関数化は過剰抽象化になる |
| runHistory 制約の定数化               | `MAX_RUN_HISTORY=100` として既に定数化済み                                         |

## コードメトリクス

| 指標                 | 値                                                        |
| -------------------- | --------------------------------------------------------- |
| 総行数               | 162行                                                     |
| パブリックメソッド   | 5個（getAll, getById, add, update, delete, addRunResult） |
| プライベートメソッド | 2個（findIndexOrThrow, persist）                          |
| 定数                 | 1個（MAX_RUN_HISTORY = 100）                              |

## テスト結果

- ScheduleStore テスト: 20/20 PASS
- リファクタリング前後で振る舞いの変更なし
