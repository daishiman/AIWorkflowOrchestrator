# バージョン・互換性要件定義書

## メタ情報

| 項目       | 内容                                                                      |
| ---------- | ------------------------------------------------------------------------- |
| 文書       | Phase 1 - Task 2 成果物                                                   |
| タスクID   | TASK-SKILL-LIFECYCLE-08                                                   |
| 作成日     | 2026-03-17                                                                |
| 受入基準   | AC-2                                                                      |
| 依存タスク | TASK-SKILL-LIFECYCLE-05, TASK-SKILL-LIFECYCLE-06, TASK-SKILL-LIFECYCLE-07 |

---

## 1. semver ルール定義

スキルのバージョン番号は `MAJOR.MINOR.PATCH` 形式（例: `1.2.3`）とする。各セグメントは0以上の整数であり、リリース時に増加する。

### 1.1 major バージョン増加条件

以下のいずれか1件以上が検出された場合、`major` バージョンを増加しなければならない。増加時は `minor` と `patch` を `0` にリセットする。

| 条件ID | 判定条件                                                                   | 具体例                                                |
| ------ | -------------------------------------------------------------------------- | ----------------------------------------------------- |
| M-1    | `SkillConfig.inputSchema` の `required` 配列に新しいフィールドが追加された | `required: ["query"]` → `required: ["query", "lang"]` |
| M-2    | `SkillConfig.inputSchema` の既存フィールドの `type` が変更された           | `{ type: "string" }` → `{ type: "integer" }`          |
| M-3    | `SkillConfig.inputSchema` の既存フィールドが削除された                     | `properties.query` が定義から消えた                   |
| M-4    | `SkillConfig.outputSchema` の既存フィールドの `type` が変更された          | `{ type: "string" }` → `{ type: "object" }`           |
| M-5    | `SkillConfig.outputSchema` の既存フィールドが削除された                    | `properties.result` が定義から消えた                  |

**判定式**（いずれか1件でも `true` なら breaking change）:

```
isBreakingChange =
  inputSchema.required に新フィールドが追加されたか（条件M-1）
  || inputSchema の既存フィールドの type が変更されたか（条件M-2）
  || inputSchema の既存フィールドが削除されたか（条件M-3）
  || outputSchema の既存フィールドの type が変更されたか（条件M-4）
  || outputSchema の既存フィールドが削除されたか（条件M-5）
```

### 1.2 minor バージョン増加条件

以下のいずれか1件以上が検出され、かつ条件M-1〜M-5のいずれにも該当しない場合、`minor` バージョンを増加する。増加時は `patch` を `0` にリセットする。

| 条件ID | 判定条件                                                                                                                                       | 具体例                                                 |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| N-1    | `SkillConfig.inputSchema` の `properties` に新しいフィールドが追加され、かつそのフィールドが `required` 配列に含まれない（任意フィールド追加） | `properties.format` が新規追加され `required` に非登録 |
| N-2    | `SkillConfig.outputSchema` の `properties` に新しいフィールドが追加された                                                                      | `properties.metadata` が新規追加                       |

**判定式**:

```
isMinorChange =
  !isBreakingChange
  && (
    inputSchema.properties に required 非登録フィールドが追加されたか（条件N-1）
    || outputSchema.properties に新フィールドが追加されたか（条件N-2）
  )
```

### 1.3 patch バージョン増加条件

以下の全条件を満たす場合、`patch` バージョンを増加する。

| 条件ID | 判定条件                                                                                    |
| ------ | ------------------------------------------------------------------------------------------- |
| P-1    | 条件M-1〜M-5 のいずれにも該当しない                                                         |
| P-2    | 条件N-1〜N-2 のいずれにも該当しない                                                         |
| P-3    | `SkillConfig.promptTemplate` のテキスト内容のみ変更された（入出力インターフェース変更なし） |

**典型的なpatch変更**: プロンプト文章の言い回し修正、誤字修正、出力形式の説明文の改善など、`inputSchema` および `outputSchema` を一切変更しない修正。

---

## 2. schema 互換性チェック仕様

### 2.1 チェックトリガー

互換性チェックは以下のタイミングに自動実行する。

| トリガー                 | 説明                                                                           |
| ------------------------ | ------------------------------------------------------------------------------ |
| 新バージョン公開操作時   | 作成者が「公開する」または「バージョンを更新して公開」ボタンをクリックした直後 |
| バージョン番号変更保存時 | スキルエディタでバージョン番号フィールドを変更して保存した直後                 |

チェックは同期的に実行し、結果をUIに即時反映する。チェック結果が出るまで公開操作のボタンは非活性状態を維持する。

### 2.2 チェック対象

チェック対象は現行バージョンと新バージョンの `SkillConfig.inputSchema` および `SkillConfig.outputSchema` のdiffとする。diffの解析対象は以下のフィールドに限定する。

| チェック対象フィールド | 格納場所                                                  | 解析内容                               |
| ---------------------- | --------------------------------------------------------- | -------------------------------------- |
| `required` 配列        | `inputSchema.required`                                    | 新バージョンで追加されたエントリを検出 |
| `properties[key].type` | `inputSchema.properties` および `outputSchema.properties` | 既存キーのtype値の変更を検出           |
| `properties` キー集合  | `inputSchema.properties` および `outputSchema.properties` | 既存キーの消失を検出                   |

**スコープ外**（チェック対象外）:

- `promptTemplate` の内容変更
- `description` フィールドの変更
- `SkillMetadata` の `tags`、`license`、`author` フィールドの変更
- `inputSchema.properties[key].description` の変更

### 2.3 Breaking Change 判定条件

以下のいずれか1件以上を検出した場合、breaking change と判定する。

| 判定ID | 検出条件                                                                                                                    | 判定結果                               |
| ------ | --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| BC-1   | 旧バージョンの `inputSchema.required` に含まれていたエントリが新バージョンで削除された                                      | non-breaking（required削除は後方互換） |
| BC-2   | 新バージョンの `inputSchema.required` に旧バージョンに存在しないエントリが追加された                                        | **breaking change（M-1）**             |
| BC-3   | 旧バージョンの `inputSchema.properties` に存在するキー `k` について、`properties[k].type` が新バージョンで異なる値になった  | **breaking change（M-2）**             |
| BC-4   | 旧バージョンの `inputSchema.properties` に存在するキー `k` が新バージョンの `properties` に存在しない                       | **breaking change（M-3）**             |
| BC-5   | 旧バージョンの `outputSchema.properties` に存在するキー `k` について、`properties[k].type` が新バージョンで異なる値になった | **breaking change（M-4）**             |
| BC-6   | 旧バージョンの `outputSchema.properties` に存在するキー `k` が新バージョンの `properties` に存在しない                      | **breaking change（M-5）**             |

> 注意: BC-1（required削除）は breaking change ではない。`required` からの削除は呼び出し元にとって後方互換であるため、minor または patch バージョン増加を推奨する。

### 2.4 チェック結果のアクション

| チェック結果                                                                               | バージョン変化 | アクション                                                                                                                                        |
| ------------------------------------------------------------------------------------------ | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| breaking change が1件以上検出された && バージョン増加が `minor` または `patch` である      | 不一致         | **公開操作をブロック**。エラーメッセージを表示: `「breaking changeが検出されました。majorバージョンを増加してください」`                          |
| breaking change が1件以上検出された && バージョン増加が `major` である                     | 一致           | チェック通過。公開フローを継続する                                                                                                                |
| breaking change が0件 && minor 変更が1件以上検出された && バージョン増加が `patch` である  | 不一致         | **警告**を表示: `「後方互換の変更が検出されました。minorバージョンの増加を推奨します」`。作成者が無視して公開することは許容する（ブロックしない） |
| breaking change が0件 && minor 変更が0件 && バージョン増加が `major` または `minor` である | 過大           | **情報メッセージ**を表示: `「変更内容はpatchバージョンの増加が適切です」`。ブロックしない                                                         |
| いずれにも該当しない                                                                       | 正常           | チェック通過。公開フローを継続する                                                                                                                |

---

## 3. 依存バージョン制約

### 3.1 fork 時の依存記録

スキルAがスキルBを fork した場合、スキルAの `SkillConfig.dependencies` フィールドに以下の形式でエントリを追加する。

```typescript
interface SkillDependency {
  skillId: string; // fork 元スキルの一意識別子
  minVersion: string; // fork 時点のバージョン（semver 文字列、例: "1.2.0"）
  maxVersion: string; // 互換性の上限（semver 範囲文字列、例: "<2.0.0"）
}
```

`dependencies` フィールドの型は `SkillDependency[]` とし、fork 元が複数存在する場合は複数エントリを含む。

**記録のタイミング**: fork 操作を実行した直後、作成者が保存する前に自動設定する。作成者による手動変更は禁止しない（ただし、UIは自動設定値を初期値として表示する）。

### 3.2 バージョン範囲計算

`minVersion` と `maxVersion` は以下のルールで自動計算する。

| フィールド   | 計算ルール                                                                                                       | 例（fork 時点のバージョンが `1.2.3` の場合） |
| ------------ | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `minVersion` | fork 時点のバージョンをそのまま使用する                                                                          | `"1.2.3"`                                    |
| `maxVersion` | fork 時点のバージョンの `MAJOR` に1を加算し、`MINOR` と `PATCH` を `0` に設定して `"<"` プレフィックスを付与する | `"<2.0.0"`                                   |

**計算式**:

```
fork 時点のバージョン = "X.Y.Z"
minVersion = "X.Y.Z"
maxVersion = "<" + (X+1) + ".0.0"
```

**具体例**:

| fork 時点のバージョン | minVersion | maxVersion | 意味                            |
| --------------------- | ---------- | ---------- | ------------------------------- |
| `"1.0.0"`             | `"1.0.0"`  | `"<2.0.0"` | 1.x 系と互換                    |
| `"1.2.3"`             | `"1.2.3"`  | `"<2.0.0"` | 1.2.3 以上かつ 2.0.0 未満と互換 |
| `"3.5.1"`             | `"3.5.1"`  | `"<4.0.0"` | 3.x 系と互換                    |
| `"0.9.0"`             | `"0.9.0"`  | `"<1.0.0"` | 0.x 系と互換                    |

**import 時の依存解決の検証条件**: `dependencies` フィールドの全エントリについて、インポート先に `skillId` が存在し、インストール済みバージョン `v` が `minVersion <= v < maxVersion` を満たす場合に依存解決成功とする。

---

## 4. 後方互換性の保証範囲

### 4.1 公開レベル別保持ポリシー

公開レベルに応じて、過去バージョンの保持期間が異なる。

| 公開レベル | 保持世代数 | 具体的な保持対象                                                                         | 削除タイミング                                                                    |
| ---------- | ---------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `public`   | 過去2世代  | 最新 `MAJOR` バージョンが `N` の場合、`N-1` および `N-2` の最新 `MINOR.PATCH` を保持する | `N-3` 以前の `MAJOR` バージョンは新バージョン公開時に `deprecated` 状態に変更する |
| `team`     | 過去1世代  | 最新 `MAJOR` バージョンが `N` の場合、`N-1` の最新 `MINOR.PATCH` を保持する              | `N-2` 以前の `MAJOR` バージョンは新バージョン公開時に `deprecated` 状態に変更する |
| `local`    | 0世代      | 保持しない。最新バージョンのみ存在する                                                   | バージョンを更新した時点で旧バージョンは上書き削除される                          |

**具体例（`public` レベル、最新バージョンが `v3.1.0` の場合）**:

| バージョン系列         | 状態                                                         |
| ---------------------- | ------------------------------------------------------------ |
| `v3.1.0`（最新）       | active                                                       |
| `v3.0.x`（最新のもの） | active（同一 MAJOR 内の旧バージョンは保持）                  |
| `v2.x`（最新のもの）   | active（1世代前 MAJOR として保持）                           |
| `v1.x`（最新のもの）   | deprecated（2世代前 MAJOR として保持、但し deprecated 状態） |
| `v0.x` 以前            | 削除対象（3世代以上前）                                      |

### 4.2 バージョン削除条件

以下の全条件を満たした場合にのみ、バージョンをSkill Centerカタログから完全削除できる。

| 条件ID | 削除条件                                                                                                        |
| ------ | --------------------------------------------------------------------------------------------------------------- |
| D-1    | 対象バージョンが `deprecated` 状態であること                                                                    |
| D-2    | `deprecated` 状態に変更されてから30日以上経過していること（`public` および `team` レベル）                      |
| D-3    | 作成者が明示的な削除操作を実行し、「インポート済みユーザー数: N人」の確認ダイアログで「削除する」を選択したこと |
| D-4    | セキュリティインシデント（P1/P2レベル）を除く通常削除の場合、30日猶予を適用すること                             |

**例外（緊急削除）**: セキュリティ脆弱性が発見された場合は条件D-2（30日猶予）を適用せず、管理者権限で即時 `local` に強制降格する。この場合は `security-operations.md` のP1/P2インシデント対応フローに従う。

---

## 5. テスト可能な条件式サマリー

Phase 5（実装）およびPhase 4（テスト作成）で直接コード化できる条件式をまとめる。

### 5.1 semver バージョン増加の必要性チェック

```typescript
// breaking change の判定（いずれかが true なら major バージョン増加必須）
isBreakingChange(oldSchema: JSONSchema, newSchema: JSONSchema): boolean {
  // M-1: required 配列に新フィールドが追加されたか
  const newRequired = (newSchema.required ?? []).filter(
    f => !(oldSchema.required ?? []).includes(f)
  );
  if (newRequired.length > 0) return true;

  // M-2: 既存フィールドの type が変更されたか
  const oldInputProps = Object.keys(oldSchema.properties ?? {});
  for (const key of oldInputProps) {
    if (
      newSchema.properties?.[key] !== undefined &&
      newSchema.properties[key].type !== oldSchema.properties[key].type
    ) {
      return true;
    }
  }

  // M-3: 既存フィールドが削除されたか
  for (const key of oldInputProps) {
    if (newSchema.properties?.[key] === undefined) return true;
  }

  return false;
}
```

### 5.2 公開操作ブロック判定

```typescript
// breaking change が検出されたにもかかわらず major が増加していない場合、公開をブロックする
shouldBlockPublish(
  oldVersion: string,
  newVersion: string,
  oldInputSchema: JSONSchema,
  newInputSchema: JSONSchema,
  oldOutputSchema: JSONSchema,
  newOutputSchema: JSONSchema,
): boolean {
  const hasBreaking =
    isBreakingChange(oldInputSchema, newInputSchema) ||
    isBreakingChange(oldOutputSchema, newOutputSchema);
  if (!hasBreaking) return false;

  const [oldMajor] = oldVersion.split(".").map(Number);
  const [newMajor] = newVersion.split(".").map(Number);
  return newMajor <= oldMajor; // major が増加していなければブロック
}
// shouldBlockPublish が true の場合のエラーメッセージ:
// "breaking changeが検出されました。majorバージョンを増加してください"
```

### 5.3 依存バージョン制約の充足チェック

```typescript
// import 時の依存解決成功条件
isDependencySatisfied(
  dep: SkillDependency,
  installedVersion: string,
): boolean {
  // minVersion <= installedVersion かつ installedVersion < maxVersion（"<X.0.0" 形式）
  const [minMaj, minMin, minPatch] = dep.minVersion.split(".").map(Number);
  const [instMaj, instMin, instPatch] = installedVersion.split(".").map(Number);
  const maxMaj = Number(dep.maxVersion.replace("<", "").split(".")[0]);

  const meetsMin =
    instMaj > minMaj ||
    (instMaj === minMaj && instMin > minMin) ||
    (instMaj === minMaj && instMin === minMin && instPatch >= minPatch);
  const meetsMax = instMaj < maxMaj;

  return meetsMin && meetsMax;
}
```

### 5.4 後方互換性保持対象の判定

```typescript
// 公開レベルに応じた保持対象の判定
shouldRetainVersion(
  currentLatestMajor: number,
  targetMajor: number,
  visibility: "public" | "team" | "local",
): boolean {
  if (visibility === "local") return false;           // local は旧バージョン保持なし
  if (visibility === "team") {
    return targetMajor >= currentLatestMajor - 1;    // 過去1世代まで
  }
  if (visibility === "public") {
    return targetMajor >= currentLatestMajor - 2;    // 過去2世代まで
  }
  return false;
}
```

---

## 6. 検証可能性

本定義書の各要件が正しく実装されたことを確認するためのテストシナリオを示す。

### 6.1 semver ルールのテストシナリオ

| シナリオID | 操作                                                                            | 旧バージョン | 変更内容        | 期待する必要バージョン  |
| ---------- | ------------------------------------------------------------------------------- | ------------ | --------------- | ----------------------- |
| V-1        | `inputSchema.required` に `"lang"` を追加                                       | `1.2.3`      | M-1 該当        | `major` 増加（`2.0.0`） |
| V-2        | `inputSchema.properties.query.type` を `"string"` から `"array"` に変更         | `1.2.3`      | M-2 該当        | `major` 増加（`2.0.0`） |
| V-3        | `inputSchema.properties.query` を削除                                           | `1.2.3`      | M-3 該当        | `major` 増加（`2.0.0`） |
| V-4        | `outputSchema.properties.result.type` を `"string"` から `"object"` に変更      | `1.2.3`      | M-4 該当        | `major` 増加（`2.0.0`） |
| V-5        | `outputSchema.properties.result` を削除                                         | `1.2.3`      | M-5 該当        | `major` 増加（`2.0.0`） |
| V-6        | `inputSchema.properties.format` を任意フィールドとして追加（required に非登録） | `1.2.3`      | N-1 該当        | `minor` 増加（`1.3.0`） |
| V-7        | `outputSchema.properties.metadata` を追加                                       | `1.2.3`      | N-2 該当        | `minor` 増加（`1.3.0`） |
| V-8        | `promptTemplate` のテキストのみ修正                                             | `1.2.3`      | P-1〜P-3 全該当 | `patch` 増加（`1.2.4`） |

### 6.2 公開ブロックのテストシナリオ

| シナリオID | breaking change | 指定バージョン増加                | 期待するアクション                      |
| ---------- | --------------- | --------------------------------- | --------------------------------------- |
| B-1        | M-1 検出        | `patch` 増加（`1.2.3` → `1.2.4`） | **公開ブロック** + エラーメッセージ表示 |
| B-2        | M-3 検出        | `minor` 増加（`1.2.3` → `1.3.0`） | **公開ブロック** + エラーメッセージ表示 |
| B-3        | M-2 検出        | `major` 増加（`1.2.3` → `2.0.0`） | **チェック通過**（ブロックしない）      |
| B-4        | 検出なし        | `patch` 増加（`1.2.3` → `1.2.4`） | **チェック通過**（ブロックしない）      |

### 6.3 依存バージョン制約のテストシナリオ

| シナリオID | fork 時点のバージョン | minVersion | maxVersion | installedVersion | 依存解決結果                       |
| ---------- | --------------------- | ---------- | ---------- | ---------------- | ---------------------------------- |
| D-1        | `1.2.0`               | `"1.2.0"`  | `"<2.0.0"` | `"1.5.0"`        | **成功**（1.2.0 <= 1.5.0 < 2.0.0） |
| D-2        | `1.2.0`               | `"1.2.0"`  | `"<2.0.0"` | `"1.1.9"`        | **失敗**（1.1.9 < 1.2.0）          |
| D-3        | `1.2.0`               | `"1.2.0"`  | `"<2.0.0"` | `"2.0.0"`        | **失敗**（2.0.0 >= 2.0.0）         |
| D-4        | `3.5.1`               | `"3.5.1"`  | `"<4.0.0"` | `"3.5.1"`        | **成功**（同一バージョン）         |

### 6.4 後方互換性保持のテストシナリオ

| シナリオID | visibility | 最新 MAJOR | 対象 MAJOR | shouldRetainVersion の期待値    |
| ---------- | ---------- | ---------- | ---------- | ------------------------------- |
| R-1        | `public`   | `3`        | `3`        | `true`（最新）                  |
| R-2        | `public`   | `3`        | `2`        | `true`（過去1世代）             |
| R-3        | `public`   | `3`        | `1`        | `true`（過去2世代）             |
| R-4        | `public`   | `3`        | `0`        | `false`（過去3世代以上）        |
| R-5        | `team`     | `3`        | `2`        | `true`（過去1世代）             |
| R-6        | `team`     | `3`        | `1`        | `false`（過去2世代以上）        |
| R-7        | `local`    | `任意`     | `任意`     | `false`（旧バージョン保持なし） |
