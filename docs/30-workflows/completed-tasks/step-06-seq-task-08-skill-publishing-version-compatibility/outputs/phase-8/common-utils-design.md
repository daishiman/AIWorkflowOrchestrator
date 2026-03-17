# 共通 metadata アクセスユーティリティ設計

## メタ情報

| 項目       | 内容                                                                           |
| ---------- | ------------------------------------------------------------------------------ |
| 文書       | Phase 8 - タスク3 成果物                                                       |
| タスクID   | TASK-SKILL-LIFECYCLE-08                                                        |
| 作成日     | 2026-03-17                                                                     |
| 依存成果物 | `outputs/phase-5/type-definitions.md`、`outputs/phase-5/service-interfaces.md` |
| 適用規則   | 過剰な抽象化を避ける（3箇所以上の使用箇所がある場合のみユーティリティ抽出）    |

---

## 目的

公開レベル遷移・互換性チェック・公開可否判定の3箇所で共通して使われる metadata アクセスパターンを特定し、共通ユーティリティ関数として設計する。3箇所以上の使用箇所があることを確認してから抽出する。

---

## 1. 共通アクセスパターンの調査

### 1.1 使用箇所の特定

以下の3箇所で「visibility に応じた必須フィールドの充足確認」が共通パターンとして出現する。

| #   | 使用箇所                                     | Phase 2 設計書                     | 具体的な処理                                                                                       |
| --- | -------------------------------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------- |
| 1   | 公開レベル遷移（S_LOCAL → S_TEAM 昇格条件）  | publishing-metadata-design.md §3.2 | visibility が "team" の場合、author / tags / teamId が非空であることを確認する                     |
| 2   | 公開レベル遷移（S_TEAM → S_PUBLIC 昇格条件） | publishing-metadata-design.md §3.2 | visibility が "public" の場合、license / readme / changelog / minAppVersion が揃っていることを確認 |
| 3   | スキル登録（SkillRegistryService.register）  | service-interfaces.md §1           | metadata の visibility に応じた全必須フィールドが揃っていることを事前条件として検証する            |
| 4   | IPC バリデーション（REGISTER チャンネル）    | ipc-channel-definitions.md §7      | P42 準拠3段バリデーションを visibility 別の必須フィールドに適用する                                |

4箇所で共通パターンが確認されたため、ユーティリティ抽出の基準（3箇所以上）を満たす。

### 1.2 共通パターンの分析

全箇所で以下の2ステップが共通する。

1. 指定された visibility に対して必須フィールド名の一覧を取得する
2. metadata オブジェクトの各必須フィールドが非空文字列（P42 準拠3段バリデーション通過）であることを確認する

---

## 2. ユーティリティ関数設計

### 2.1 配置先

`packages/shared/src/skill/metadata-utils.ts`（新規ファイル）

配置根拠: Main プロセス（SkillRegistryService のバリデーション）と Renderer プロセス（昇格ボタンの活性化条件判定）の両方から参照するため `packages/shared` に配置する。

### 2.2 getRequiredFields 関数

```typescript
/**
 * 指定された公開レベルに対して必須となるフィールド名の配列を返す。
 *
 * @param visibility - 対象の公開レベル
 * @returns 必須フィールド名の配列（keyof SkillPublishingMetadata の部分集合）
 *
 * 返却値の対応表:
 * - "local"  → ["name", "description", "version"]
 * - "team"   → ["name", "description", "version", "author", "tags", "teamId"]
 * - "public" → ["name", "description", "version", "author", "tags", "teamId",
 *                "license", "readme", "changelog", "minAppVersion"]
 *
 * 配置先: packages/shared/src/skill/metadata-utils.ts
 */
function getRequiredFields(visibility: SkillVisibility): string[] {
  const base = ["name", "description", "version"];
  if (visibility === "local") return base;

  const team = [...base, "author", "tags", "teamId"];
  if (visibility === "team") return team;

  return [...team, "license", "readme", "changelog", "minAppVersion"];
}
```

### 2.3 checkMetadataCompleteness 関数

```typescript
/**
 * 指定された公開レベルに対して、metadata の全必須フィールドが充足されているかを検証する。
 * 文字列フィールドには P42 準拠3段バリデーション（型チェック -> 空文字列 -> trim 空文字列）を適用する。
 * tags フィールドは配列の存在確認と要素数チェックを行う。
 *
 * @param metadata - 検証対象の公開メタデータ
 * @param visibility - 対象の公開レベル
 * @returns 検証結果。missing は不足しているフィールド名の配列。空配列の場合は全必須フィールドが充足。
 *
 * 事後条件:
 * - missing.length === 0 の場合、visibility に対する全必須フィールドが非空文字列である
 * - missing.length >= 1 の場合、missing に含まれるフィールドが不足または空文字列である
 *
 * 配置先: packages/shared/src/skill/metadata-utils.ts
 */
function checkMetadataCompleteness(
  metadata: SkillPublishingMetadata,
  visibility: SkillVisibility,
): { missing: string[] } {
  const requiredFields = getRequiredFields(visibility);
  const missing: string[] = [];

  for (const field of requiredFields) {
    if (field === "tags") {
      // tags は配列の存在確認と要素数チェック
      if (
        !("tags" in metadata) ||
        !Array.isArray((metadata as Record<string, unknown>).tags) ||
        ((metadata as Record<string, unknown>).tags as string[]).length === 0
      ) {
        missing.push("tags");
      }
    } else {
      // 文字列フィールドは P42 準拠3段バリデーション
      const value = (metadata as Record<string, unknown>)[field];
      if (typeof value !== "string" || value === "" || value.trim() === "") {
        missing.push(field);
      }
    }
  }

  return { missing };
}
```

---

## 3. 使用箇所への適用設計

### 3.1 公開レベル遷移での使用（Renderer 側）

```typescript
// 昇格ボタン活性化条件の判定
const targetVisibility: SkillVisibility = "team"; // または "public"
const { missing } = checkMetadataCompleteness(metadata, targetVisibility);
const isPromotionReady = missing.length === 0;
```

### 3.2 SkillRegistryService.register での使用（Main 側）

```typescript
// register() の事前条件バリデーション
const { missing } = checkMetadataCompleteness(metadata, metadata.visibility);
if (missing.length > 0) {
  return {
    success: false,
    error: {
      code: "VALIDATION_ERROR",
      message: `以下の必須フィールドが不足しています: ${missing.join(", ")}`,
    },
  };
}
```

### 3.3 IPC ハンドラでの使用（Main 側）

```typescript
// REGISTER チャンネルハンドラの先頭でバリデーション
const { missing } = checkMetadataCompleteness(metadata, metadata.visibility);
if (missing.length > 0) {
  return {
    success: false,
    error: {
      code: "VALIDATION_ERROR",
      message: `必須フィールドが不足しています: ${missing.join(", ")}`,
    },
  };
}
```

---

## 4. packages/shared/src/index.ts からの re-export 計画

```typescript
export {
  getRequiredFields,
  checkMetadataCompleteness,
} from "./skill/metadata-utils";
```

---

## 5. Phase 5 実施済み確認

Phase 5 では `getRequiredFields` / `checkMetadataCompleteness` の抽出は実施されていない。Phase 5 は型定義の確定とインターフェースシグネチャの確定に集中し、ユーティリティ関数の抽出は Phase 8 のリファクタリングスコープとして設計した。

本文書が後続の実装タスクでのユーティリティ関数実装の根拠文書となる。

---

## 6. テスト仕様書への影響

本ユーティリティ関数は Phase 4/6 のテスト仕様書で直接参照されていない。後続の実装タスクで以下のテストを追加する。

| テスト対象                | テスト内容                                                                | 見積テスト数 |
| ------------------------- | ------------------------------------------------------------------------- | ------------ |
| getRequiredFields         | 3レベルそれぞれの戻り値フィールド数と要素名の検証                         | 3            |
| checkMetadataCompleteness | 全必須フィールド充足 / 1フィールド不足 / 空文字列 / trim 後空文字列の検証 | 8            |
| checkMetadataCompleteness | tags 配列の空配列 / 要素なし / 正常値の検証                               | 3            |
| **合計**                  |                                                                           | **14**       |
