# 公開レベル定義書

## メタ情報

| 項目     | 内容                    |
| -------- | ----------------------- |
| 文書     | Phase 1 - Task 1 成果物 |
| タスクID | TASK-SKILL-LIFECYCLE-08 |
| 作成日   | 2026-03-17              |
| 受入基準 | AC-1                    |

---

## 1. 公開レベル定義

スキルには3段階の公開レベルが存在する。新規作成スキルは全て `local` から開始する。

### 1.1 local（ローカル）

- **概要**: 作成者のローカル環境のみで実行可能なレベル。
- **可視性**: Skill Center に表示されない。作成者本人のみが参照・実行できる。
- **metadata 設定値**: `visibility: "local"`
- **用途**: 開発中・未完成・個人用スキルの保管

### 1.2 team（チーム）

- **概要**: 作成者が明示的に指定したワークスペースメンバーに限定して表示・実行可能なレベル。
- **可視性**: `shared_with` リストに含まれるユーザーID（1件以上）のメンバーのみが参照・実行できる。Skill Center の公開カタログには掲載されない。
- **metadata 設定値**: `visibility: "team"`、`shared_with: string[]`（共有先ユーザーIDの配列、1件以上必須）
- **用途**: チーム内レビュー・検証・限定配布

### 1.3 public（公開）

- **概要**: Skill Center の公開カタログに掲載され、全ユーザーが検索・インポート可能なレベル。
- **可視性**: 全ユーザーが参照・インポートできる。
- **metadata 設定値**:
  - `visibility: "public"`
  - `author: string`（作成者の識別子、必須）
  - `license: string`（ライセンス識別子、必須）
  - `tags: string[]`（タグ配列、1件以上・最大10件）
- **用途**: 広く再利用を促進するスキルの公開配布

---

## 2. metadata 必須フィールドマトリクス

| フィールド    | local |      team       |          public           | 備考                                            |
| ------------- | :---: | :-------------: | :-----------------------: | ----------------------------------------------- |
| `name`        | 必須  |      必須       |           必須            | スキル識別名                                    |
| `description` | 必須  |      必須       |           必須            | スキルの説明文                                  |
| `version`     | 必須  |      必須       |           必須            | セマンティックバージョン（例: `"1.0.0"`）       |
| `visibility`  | 必須  |      必須       |           必須            | `"local"` / `"team"` / `"public"` のいずれか    |
| `shared_with` | 不要  | 必須（1件以上） |      必須（1件以上）      | 共有先ユーザーIDの配列                          |
| `author`      | 不要  |      不要       |           必須            | 作成者の識別子                                  |
| `license`     | 不要  |      不要       |           必須            | ライセンス識別子（例: `"MIT"`, `"Apache-2.0"`） |
| `tags`        | 不要  |      不要       | 必須（1件以上、最大10件） | カタログ検索用タグ配列                          |

> **注**: `team` レベルで `shared_with` が空配列（`[]`）の場合、バリデーションエラーとして拒否する。

---

## 3. 状態遷移条件

### 3.1 昇格条件

#### local → team

以下の条件を**全て満たした場合**にのみ昇格を許可する。

| #   | 条件                                                       | 判定値                                 |
| --- | ---------------------------------------------------------- | -------------------------------------- |
| 1   | 作成者が明示的に共有操作（`publish` アクション）を実行した | アクション種別 `= "share"`             |
| 2   | `shared_with` に有効なユーザーIDが1件以上指定されている    | `shared_with.length >= 1`              |
| 3   | `shared_with` の各要素が空文字列でない                     | 全要素について `element.trim() !== ""` |

#### team → public

以下の条件を**全て満たした場合**にのみ昇格ボタンが活性化し、昇格を許可する。

| #   | 条件                                                        | 判定値                                                 | 参照元         |
| --- | ----------------------------------------------------------- | ------------------------------------------------------ | -------------- |
| 1   | `SkillSafetyContract.maxRiskLevel` が `"medium"` 以下である | `maxRiskLevel` が `"low"` または `"medium"` のいずれか | Task-06 成果物 |
| 2   | `AggregateView.testPassRate` が80%以上である                | `testPassRate >= 0.80`                                 | Task-07 成果物 |
| 3   | `author` フィールドが設定されている                         | `author.trim() !== ""`                                 | metadata       |
| 4   | `license` フィールドが設定されている                        | `license.trim() !== ""`                                | metadata       |
| 5   | `tags` に有効なタグが1件以上かつ10件以下である              | `tags.length >= 1 && tags.length <= 10`                | metadata       |

> **注**: 条件1・2のいずれかを満たさない場合、昇格ボタンは非活性（disabled）状態を維持する。

### 3.2 降格条件

以下の条件を**いずれか満たした場合**に即時降格を許可する。

| 遷移              | 実行者               | 操作                                         | 反映タイミング           |
| ----------------- | -------------------- | -------------------------------------------- | ------------------------ |
| `public` → `team` | 作成者 または 管理者 | 取り下げ操作（`unpublish` アクション）を実行 | 操作完了と同時に即時反映 |
| `team` → `local`  | 作成者 または 管理者 | 共有解除操作（`unshare` アクション）を実行   | 操作完了と同時に即時反映 |

> **注**: 降格後、`shared_with` の内容は保持されるが `visibility` 値が変更される。`public` から `team` へ降格した場合、`license` フィールドの変更は不可（「4. 権限マトリクス」参照）。

### 3.3 デフォルト値

| フィールド    | デフォルト値   | 適用タイミング   |
| ------------- | -------------- | ---------------- |
| `visibility`  | `"local"`      | スキル新規作成時 |
| `shared_with` | `[]`（空配列） | スキル新規作成時 |
| `tags`        | `[]`（空配列） | スキル新規作成時 |

---

## 4. 権限マトリクス

| フィールド                                        | 作成者（author） |          管理者           | その他ユーザー |
| ------------------------------------------------- | :--------------: | :-----------------------: | :------------: |
| `visibility` の変更                               |        可        |           不可            |      不可      |
| `shared_with` への追加                            |        可        |           不可            |      不可      |
| `shared_with` からの削除                          |        可        |           不可            |      不可      |
| `tags` の追加                                     |  可（全レベル）  | 可（`public` レベルのみ） |      不可      |
| `tags` の削除                                     |  可（全レベル）  |           不可            |      不可      |
| `license` の変更（`public` 昇格前）               |        可        |           不可            |      不可      |
| `license` の変更（`public` 昇格後）               |       不可       |           不可            |      不可      |
| `license` の変更（`public` 取り下げ後の再公開時） |        可        |           不可            |      不可      |

> **制約詳細**:
>
> - `visibility` フィールドは作成者のみが変更可能。管理者であっても直接変更は不可。
> - `license` フィールドは一度 `public` に昇格した後は変更不可となる。取り下げ（`public` → `team`）を経て再度 `public` へ昇格する操作の際にのみ変更が許可される。
> - 管理者が `public` レベルのスキルに `tags` を追加した場合、その tag の削除は管理者を含む全ユーザーが不可（作成者のみが削除可能という一般ルールの例外として、管理者追加タグは削除不可とする）。

---

## 5. 状態遷移図

```
                    作成者: share アクション
                    shared_with.length >= 1
  ┌─────────┐ ─────────────────────────────────────> ┌─────────┐
  │  local  │                                         │  team   │
  └─────────┘ <───────────────────────────────────── └─────────┘
       ^        作成者/管理者: unshare アクション（即時）      |
       |                                                       |
       |                                          作成者: publish アクション
       |                                          maxRiskLevel in {"low","medium"}
       |                                          testPassRate >= 0.80
       |                                          author.trim() != ""
       |                                          license.trim() != ""
       |                                          1 <= tags.length <= 10
       |                                                       |
       |                                                       v
       |                                              ┌─────────────┐
       |  ※ local への直接降格は不可                  │   public    │
       |  （public → team → local の順を踏む）        └─────────────┘
       |                                                       |
       |              作成者/管理者: unpublish アクション（即時）
       |                                                       |
       └───────────────── team ──────────────────────────────┘
                      （team 経由で降格）

【凡例】
  ──> : 昇格（条件を全て満たす場合のみ許可）
  <── : 降格（作成者または管理者が取り下げ/共有解除操作を実行した場合に即時反映）
```

---

## 6. テスト可能な条件式サマリー

以下の条件式はそれぞれ独立してユニットテスト可能な形式で定義する。

```typescript
// 6.1 local → team 昇格可否
function canPromoteToTeam(metadata: SkillMetadata): boolean {
  return (
    metadata.visibility === "local" &&
    Array.isArray(metadata.shared_with) &&
    metadata.shared_with.length >= 1 &&
    metadata.shared_with.every((id) => id.trim() !== "")
  );
}

// 6.2 team → public 昇格ボタン活性化可否
function canActivatePublishButton(
  metadata: SkillMetadata,
  safetyContract: SkillSafetyContract,
  aggregateView: AggregateView,
): boolean {
  const riskLevelAllowed =
    safetyContract.maxRiskLevel === "low" ||
    safetyContract.maxRiskLevel === "medium";
  const testPassRateAllowed = aggregateView.testPassRate >= 0.8;
  const authorSet = metadata.author.trim() !== "";
  const licenseSet = metadata.license.trim() !== "";
  const tagsValid =
    Array.isArray(metadata.tags) &&
    metadata.tags.length >= 1 &&
    metadata.tags.length <= 10;

  return (
    metadata.visibility === "team" &&
    riskLevelAllowed &&
    testPassRateAllowed &&
    authorSet &&
    licenseSet &&
    tagsValid
  );
}

// 6.3 public → team 降格可否
function canDemoteToTeam(
  metadata: SkillMetadata,
  requestorRole: "author" | "admin" | "member",
): boolean {
  return (
    metadata.visibility === "public" &&
    (requestorRole === "author" || requestorRole === "admin")
  );
}

// 6.4 team → local 降格可否
function canDemoteToLocal(
  metadata: SkillMetadata,
  requestorRole: "author" | "admin" | "member",
): boolean {
  return (
    metadata.visibility === "team" &&
    (requestorRole === "author" || requestorRole === "admin")
  );
}

// 6.5 license 変更可否
function canChangeLicense(
  metadata: SkillMetadata,
  publishHistory: PublishHistory,
): boolean {
  // public に一度も昇格していない場合は変更可
  if (!publishHistory.hasEverBeenPublic) return true;
  // public から取り下げ済み（現在 team または local）かつ再公開操作中の場合は変更可
  if (
    metadata.visibility !== "public" &&
    publishHistory.isRePublishing === true
  ) {
    return true;
  }
  return false;
}

// 6.6 tags の最大件数チェック
function isTagsCountValid(tags: string[]): boolean {
  return tags.length >= 1 && tags.length <= 10;
}
```

---

## 7. 検証可能性

| 受入基準                                             | 検証方法           | 期待結果                                                                   |
| ---------------------------------------------------- | ------------------ | -------------------------------------------------------------------------- |
| AC-1-1: 3レベルが定義されている                      | 本文書 §1 を参照   | `local` / `team` / `public` の3定義が存在する                              |
| AC-1-2: 昇格条件が数値で明示されている               | 本文書 §3.1 を参照 | `testPassRate >= 0.80`、`tags.length <= 10` など具体的な値が明記されている |
| AC-1-3: 降格条件が即時反映と明示されている           | 本文書 §3.2 を参照 | 「操作完了と同時に即時反映」と明記されている                               |
| AC-1-4: デフォルト値が明示されている                 | 本文書 §3.3 を参照 | 新規作成時の `visibility = "local"` が明記されている                       |
| AC-1-5: 権限マトリクスが曖昧表現なしに定義されている | 本文書 §4 を参照   | 全フィールドで「可」/「不可」が条件付きで明記されている                    |
| AC-1-6: 状態遷移図が双方向を含む                     | 本文書 §5 を参照   | 昇格・降格の両方向が図示されている                                         |
| AC-1-7: 全条件式がテスト可能な形式で記述されている   | 本文書 §6 を参照   | TypeScript 関数として実装可能な条件式が定義されている                      |
