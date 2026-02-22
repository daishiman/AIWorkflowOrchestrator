# 実装ガイド: UT-FIX-SKILL-IMPORT-ID-MISMATCH-001

## メタ情報

| 項目     | 値                                        |
| -------- | ----------------------------------------- |
| タスクID | UT-FIX-SKILL-IMPORT-ID-MISMATCH-001       |
| 機能名   | SkillImportDialog skill.id→skill.name修正 |
| 作成日   | 2026-02-22                                |
| Phase    | 12（ドキュメント）                        |

---

## Part 1: 概念説明（中学生レベル）

### 日常の例え話 --- 商品名 vs バーコード番号

お店で飲み物を買う場面を想像してください。

あなたは「りんごジュースをください」と店員さんに注文します。店員さんは「りんごジュース」という**商品名**を聞けば、棚のどこにあるかすぐ分かります。

ところが、もしあなたが「`4902555123456` をください」とバーコード番号で注文したらどうなるでしょうか。店員さんはその番号だけでは商品を見つけられません。番号を商品名に変換するシステムがレジにはありますが、**店員さんの頭の中には番号と商品名の対応表がありません**。結果として「その番号の商品は見つかりません」と言われてしまいます。

今回直したバグは、まさにこの問題と同じです。

- **商品名** = スキルの「名前」（例: `task-specification-creator`）
- **バーコード番号** = スキルの「ID」（例: `a478b3e7c728cd18`、SHA-256ハッシュの先頭16文字）
- **店員さん** = インポート処理を行うバックエンド（`getSkillByName()` 関数）

SkillImportDialog（スキルを選ぶ画面）が、インポート処理に「バーコード番号（ハッシュID）」を渡していました。しかしインポート処理は「商品名（スキル名）」でスキルを探す仕組みです。そのため、どのスキルをインポートしようとしても、必ず「見つかりません」というエラーになっていました。

### なぜこのバグが起きたか

SkillImportDialog コンポーネントは、スキルの一覧を画面に表示する際に `skill.id` を使っています。`skill.id` はSHA-256ハッシュの先頭16文字で、コンピュータがスキルを一意に識別するための内部管理用の値です（バーコード番号のようなもの）。

一方、スキルをインポートする処理（IPC経由でMain Processへ送信）は `skill.name`（人間が読める名前、例: `task-specification-creator`）を受け取る設計です。

問題は、SkillImportDialog の「インポートボタン」を押したとき、選択されたスキルの `skill.id` をそのままインポート処理に渡していたことです。インポート処理は受け取った値を「名前」として検索しますが、渡されたのは「ハッシュID」なので、当然見つかりません。結果として、スキルインポートが100%失敗していました。

### 何を直したか

`skill.id` を渡していた1箇所を `skill.name` に変更しました。変更したのは Renderer プロセス（画面表示を担当する部分）の3ファイルだけです。

1. **SkillImportDialog/index.tsx**: インポート実行時に `skill.id` の配列ではなく `skill.name` の配列を渡すように変更
2. **AgentView/index.tsx**: 受け取る引数の名前を `skillIds` から `skillNames` に変更（中身の処理は同じ）
3. **テストファイル**: 期待する値を `skill.id` ではなく `skill.name` に修正し、新しいテストを追加

重要なのは、**スキルの選択管理（チェックボックスの状態）やインポート済み判定には、引き続き `skill.id` を使っている**ということです。変更したのは「インポート処理に渡す値」だけです。

---

## Part 2: 開発者向け実装詳細

### 1. 変更前/変更後のインターフェース定義

#### 変更前

```typescript
// SkillImportDialog/index.tsx
export interface SkillImportDialogProps {
  // ...
  onImport: (skillIds: string[]) => void; // skill.id（ハッシュ値）の配列
}
```

```typescript
// handleImport（変更前）
const handleImport = () => {
  onImport(Array.from(selectedIds)); // selectedIds は Set<string> で skill.id を格納
  onClose();
};
```

#### 変更後

```typescript
// SkillImportDialog/index.tsx
export interface SkillImportDialogProps {
  // ...
  onImport: (skillNames: string[]) => void; // skill.name（人間可読名）の配列
}
```

```typescript
// handleImport（変更後）
const handleImport = () => {
  const selectedNames = availableSkills
    .filter((skill) => selectedIds.has(skill.id))
    .map((skill) => skill.name);
  onImport(selectedNames);
  onClose();
};
```

### 2. データフロー図

#### 修正前（バグ）

```
SkillImportDialog
  selectedIds: Set<string> = {"a478b3e7c728cd18"}  ← skill.id
                |
                v
  onImport(["a478b3e7c728cd18"])  ← skill.id をそのまま渡す
                |
                v
AgentView
  handleImport(skillIds: string[])
    for (const skillId of skillIds)
      importSkillAction(skillId)        ← "a478b3e7c728cd18" を渡す
                |
                v
electronAPI.skill.import("a478b3e7c728cd18")
                |
                v
IPC skill:import (skillName: string)    ← ハンドラは skillName を期待
                |
                v
getSkillByName("a478b3e7c728cd18")      ← 名前として検索
                |
                v
              null                       ← 不一致: ハッシュIDは名前ではない
                |
                v
           IMPORT_ERROR                  ← 100%失敗
```

#### 修正後（正常）

```
SkillImportDialog
  selectedIds: Set<string> = {"a478b3e7c728cd18"}  ← skill.id（内部管理用、変更なし）
                |
                v
  availableSkills.filter(s => selectedIds.has(s.id)).map(s => s.name)
                |
                v
  onImport(["task-specification-creator"])  ← skill.name に変換して渡す
                |
                v
AgentView
  handleImport(skillNames: string[])
    for (const skillName of skillNames)
      importSkillAction(skillName)           ← "task-specification-creator" を渡す
                |
                v
electronAPI.skill.import("task-specification-creator")
                |
                v
IPC skill:import (skillName: string)         ← ハンドラが期待する skillName と一致
                |
                v
getSkillByName("task-specification-creator") ← 名前として検索
                |
                v
          Skill オブジェクト                  ← 一致: 正しくスキルを取得
                |
                v
          インポート成功
```

### 3. 変更箇所の一覧テーブル

| ファイル                                                                                                | 変更箇所                   | 変更前                                                             | 変更後                                                                                                               |
| ------------------------------------------------------------------------------------------------------- | -------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/renderer/components/organisms/SkillImportDialog/index.tsx`                            | Props型定義 `onImport`     | `(skillIds: string[]) => void`                                     | `(skillNames: string[]) => void`                                                                                     |
| `apps/desktop/src/renderer/components/organisms/SkillImportDialog/index.tsx`                            | Props JSDOCコメント        | `インポートハンドラ`                                               | `インポートハンドラ（スキル名の配列を受け取る）`                                                                     |
| `apps/desktop/src/renderer/components/organisms/SkillImportDialog/index.tsx`                            | `handleImport` 内の値取得  | `onImport(Array.from(selectedIds))`                                | `const selectedNames = availableSkills.filter(s => selectedIds.has(s.id)).map(s => s.name); onImport(selectedNames)` |
| `apps/desktop/src/renderer/views/AgentView/index.tsx`                                                   | `handleImport` 引数名      | `skillIds: string[]`                                               | `skillNames: string[]`                                                                                               |
| `apps/desktop/src/renderer/views/AgentView/index.tsx`                                                   | `handleImport` ループ変数  | `for (const skillId of skillIds)`                                  | `for (const skillName of skillNames)`                                                                                |
| `apps/desktop/src/renderer/views/AgentView/__tests__/AgentView.test.tsx`                                | テスト期待値（成功ケース） | `mockImportSkill` に `skill.id`（`"import-skill-1"` 等）が渡される | `mockImportSkill` に `skill.name`（`"ImportableSkill"` 等）が渡される                                                |
| `apps/desktop/src/renderer/components/organisms/SkillImportDialog/__tests__/SkillImportDialog.test.tsx` | テスト追加（Phase 4）      | なし                                                               | 5件の id→name 変換検証テスト追加                                                                                     |
| `apps/desktop/src/renderer/components/organisms/SkillImportDialog/__tests__/SkillImportDialog.test.tsx` | テスト追加（Phase 6）      | なし                                                               | 4件のエッジケーステスト追加                                                                                          |

### 4. id/name の設計分離ポイント

SkillImportDialog コンポーネント内では、`skill.id` と `skill.name` が明確に使い分けられている。修正箇所は `onImport` の出力値のみであり、内部のID管理ロジックは一切変更していない。

| 用途                             | 使用するフィールド                       | 変更有無                 | コード箇所                                                            |
| -------------------------------- | ---------------------------------------- | ------------------------ | --------------------------------------------------------------------- |
| コンポーネント内部の選択状態管理 | `skill.id`（`selectedIds: Set<string>`） | 変更なし                 | `handleToggleSkill(skill.id)`                                         |
| インポート済み判定               | `skill.id`                               | 変更なし                 | `importedSkillIds.includes(skill.id)`                                 |
| React key                        | `skill.id`                               | 変更なし                 | `key={skill.id}`                                                      |
| チェックボックス状態判定         | `skill.id`                               | 変更なし                 | `selectedIds.has(skill.id)`                                           |
| **onImport 出力値**              | **`skill.name`**                         | **変更あり（修正箇所）** | `availableSkills.filter(s => selectedIds.has(s.id)).map(s => s.name)` |

この設計により、以下の利点が維持される。

- **一意性管理**: `skill.id`（SHA-256ハッシュプレフィックス）はスキルを一意に識別するために最適。同名スキルが存在する可能性がある場合でもIDで区別できる
- **IPC契約準拠**: Main Process の `getSkillByName()` は `skill.name` を引数に取るため、IPC境界では `skill.name` を渡す必要がある（P44/P45対策）
- **関心の分離**: UIの選択管理（内部）とビジネスロジック（外部）で異なる識別子を使い分ける

### 5. テスト戦略

#### テスト構成

SkillImportDialog のテストファイル（`SkillImportDialog.test.tsx`）は以下の構成となっている。

| describe グループ                                  | テスト件数 | 追加Phase                          |
| -------------------------------------------------- | ---------- | ---------------------------------- |
| 表示制御                                           | 3件        | 既存                               |
| スキル一覧                                         | 3件        | 既存                               |
| スキル選択                                         | 3件        | 既存                               |
| インポート                                         | 4件        | 既存（1件は Phase 4 で期待値修正） |
| キャンセル                                         | 3件        | 既存                               |
| 検索                                               | 1件        | 既存                               |
| アクセシビリティ                                   | 3件        | 既存                               |
| エッジケース                                       | 6件        | 既存（一部 Phase 6 で追加）        |
| id→name変換（UT-FIX-SKILL-IMPORT-ID-MISMATCH-001） | 9件        | Phase 4: 5件、Phase 6: 4件         |
| **合計**                                           | **35件**   |                                    |

#### カバレッジ結果

| 指標       | 結果             | 最低基準 | 推奨基準 | 判定         |
| ---------- | ---------------- | -------- | -------- | ------------ |
| Statements | 98.84% (170/172) | 80%      | 90%      | 推奨基準超過 |
| Functions  | 100.00% (5/5)    | 80%      | 90%      | 推奨基準超過 |
| Branches   | 97.14% (34/35)   | 60%      | 70%      | 推奨基準超過 |

#### 主要テストケース

##### Phase 4 で追加した id→name 変換テスト（5件）

1. **単一スキル選択時に onImport に skill.name が渡される**: `skill.id` ではなく `skill.name` が `onImport` コールバックに渡されることを検証
2. **複数スキル選択時に全ての skill.name が渡される**: 2つのスキルを選択した場合に両方の `skill.name` が含まれ、`skill.id` が含まれないことを検証
3. **importedSkillIds 判定は skill.id ベースで維持される**: インポート済み判定が `skill.id` で行われることを検証（内部ロジックの回帰確認）
4. **onImport に渡される値に skill.id が含まれない**: `onImport` の引数に `skill.id` が含まれていないことを明示的に検証
5. **インポート済みスキルを除外して未インポートのみ name を渡す**: 一部がインポート済みの場合、未インポートスキルの `skill.name` のみが渡されることを検証

##### Phase 6 で追加したエッジケーステスト（4件）

1. **選択なしの場合に onImport は呼ばれない（ボタンが disabled）**: 未選択時にインポートボタンが無効化されることを検証
2. **availableSkills が空の場合にインポートボタンが disabled**: スキルが0件の場合の動作を検証
3. **選択後に onClose も呼ばれる**: インポート実行後にダイアログが閉じることを検証
4. **インポート後に選択をリセットする**: 再度ダイアログを開いた時に選択状態がリセットされることを検証

### 6. 関連する既知の落とし穴（Pitfalls）

| Pitfall | タイトル                                           | 本タスクとの関連                                                                                                 |
| ------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| P44     | skill:import/remove IPC インターフェース不整合     | 本タスクのバグの直接的な原因パターン。ハンドラが期待する引数とPreload/Rendererが渡す値の不一致                   |
| P45     | IPC 引数命名の契約ドリフト（skillId vs skillName） | `skillIds` という変数名で `skill.id`（ハッシュ値）を渡していた命名上の問題。`skillNames` にリネームして解消      |
| P42     | 文字列引数の .trim() バリデーション漏れ            | IPC ハンドラ側で skill.name に対して 3段バリデーションが適用済み。本タスクの変更により正しく機能するようになった |
| P23     | API 二重定義の型管理複雑性                         | 本タスクは Renderer 層のみの変更だが、Preload/Main の型定義との整合性を Phase 10 で検証                          |
| P39     | happy-dom 環境での userEvent 非互換                | テスト追加時に `fireEvent` を使用（`userEvent` は使用禁止）                                                      |
