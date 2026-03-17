# import/export/fork/share 整合方針書

## メタ情報

| 項目       | 内容                                                                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 文書       | Phase 1 - Task 5 成果物                                                                                                                           |
| タスクID   | TASK-SKILL-LIFECYCLE-08                                                                                                                           |
| 作成日     | 2026-03-17                                                                                                                                        |
| 依存タスク | TASK-SKILL-LIFECYCLE-05, TASK-SKILL-LIFECYCLE-06, TASK-SKILL-LIFECYCLE-07, TASK-9E, TASK-9F                                                       |
| 参照仕様   | `interfaces-agent-sdk-skill-reference.md`（TASK-9E fork型契約）、`interfaces-agent-sdk-skill-reference-share-debug-analytics.md`（TASK-9F共有型） |

---

## 1. 操作定義

### 1.1 import（公開スキルをローカルに取り込む）

**目的**: Skill Center に公開されているスキルを自分のローカル環境に取り込む。

**対象条件**:

- `visibility="public"` のスキルのみインポート可能
- `visibility="team"` のスキルは直接インポート不可。作成者から共有招待を受け、`shared_with` に自分のユーザーIDが追加されて初めてアクセス可能となる（共有招待経由でのみ参照可能）

**実行後の状態変化**:

- インポート後の `visibility`: 自動的に `"local"` に設定する
- インポート後の `importedVersion`: インポート時点のバージョン文字列（semver形式）をローカルメタデータに記録する。例: `"importedVersion": "1.3.2"`
- 自動更新は行わない。新バージョンが公開されても `importedVersion` は変わらない（手動更新操作で更新する）

**依存解決**:

- インポート対象スキルの `dependencies` フィールドが空配列でない場合、各エントリについてインポート先に依存スキルが存在するか確認する
- 不足している依存スキルが1件以上ある場合、「依存スキル X（バージョン `minVersion` 以上 `maxVersion` 未満）もインポートしますか？」のダイアログを表示する
- ユーザーが「インポートする」を選択した場合は依存スキルを順次インポートし、「スキップ」を選択した場合は依存スキルなしでインポートを続行する（動作保証外として警告を表示する）
- 依存解決の成功条件: `dependencies` フィールドの全エントリについて、インポート先に `skillId` が存在し `minVersion <= installedVersion < maxVersion` を満たす場合

**再公開制限**:

- インポートした `local` スキルをそのまま再公開することはできない
- 再公開が必要な場合は、fork 操作を経て独立したスキルとして公開フローを実行する

---

### 1.2 export（ローカルスキルをパッケージ化する）

**目的**: スキルをポータブルなパッケージファイルとして書き出し、他の環境へのインポートや手動配布を可能にする。

**対象条件**:

- `visibility` の値（`local` / `team` / `public`）に関係なく全スキルで実行可能

**出力形式**:

- ファイル名: `{skill-name}@{version}.skillpkg`（例: `my-analyzer@1.2.0.skillpkg`）
- フォーマット: JSON形式のzipアーカイブ

**パッケージに含まれるフィールド**:

| フィールド                                    | 含む/除く | 理由                                                  |
| --------------------------------------------- | --------- | ----------------------------------------------------- |
| `metadata`（`visibility` を除く全フィールド） | 含む      | スキルの識別・説明情報として必要                      |
| `promptTemplate`                              | 含む      | スキルの実行内容                                      |
| `config`                                      | 含む      | 実行設定                                              |
| `inputSchema`                                 | 含む      | インターフェース契約                                  |
| `outputSchema`                                | 含む      | インターフェース契約                                  |
| `visibility`                                  | **除く**  | インポート先環境でデフォルト `"local"` を設定するため |
| `shared_with`                                 | **除く**  | ユーザーIDは環境依存情報のため                        |
| `importedVersion`                             | **除く**  | インポート時に新規に記録されるため                    |

**インポート先での動作**:

- `.skillpkg` ファイルをインポートした場合、`visibility` はデフォルト `"local"` が設定される
- 再公開する場合は通常の公開フロー（`PublishEligibility` チェック含む）を実行する

---

### 1.3 fork（既存スキルから派生スキルを作成する）

**目的**: 既存スキルをベースに、独自の改変を加えた派生スキルを作成する。

**対象条件**:

- `visibility="public"` のスキル
- `visibility="team"` で自分のユーザーIDが `shared_with` に含まれるスキル
- 上記いずれにも該当しないスキルは fork 不可

**実行後のメタデータ**:

fork 後のスキルに以下のフィールドを自動付与する:

```
forkedFrom: {
  skillId: string,    // フォーク元スキルの一意識別子
  version: string,    // フォーク時点のバージョン（semver）
  author: string      // フォーク元スキルの作成者ID
}
```

**実行後の状態変化**:

- fork 後の `visibility`: 自動的に `"local"` に設定する
- fork 後のスキルは独立したスキルとして扱われる

**依存バージョン制約**:

- fork 後スキルの `dependencies` フィールドに、fork 元スキルへの依存エントリを設定する
- `minVersion`: fork 時点のバージョン（例: `"1.2.0"`）
- `maxVersion`: fork 元の次の major バージョン未満（例: fork 時点が `"1.2.0"` であれば `"<2.0.0"`）

**安全性契約の引き継ぎなし**:

- fork 元スキルが持つ `SkillSafetyContract` は fork 後スキルに引き継がない
- fork 後スキルを公開する場合は、新規に `PublishEligibility` チェック（Task-06 / Task-07 接続）を実行する

**TASK-9E `SkillForkOptions` との整合**:

`SkillForkOptions`（`packages/shared/src/types/skill-fork.ts`）のフィールドと本操作定義の対応:

| `SkillForkOptions` フィールド   | 本操作定義での扱い                                   |
| ------------------------------- | ---------------------------------------------------- |
| `sourceSkill: string`           | fork 元スキル名（`forkedFrom.skillId` の参照元）     |
| `newName: string`               | fork 後スキル名                                      |
| `description?: string`          | 省略時は fork 元の説明を維持                         |
| `copyAgents: boolean`           | agents/ ディレクトリコピー有無                       |
| `copyReferences: boolean`       | references/ ディレクトリコピー有無                   |
| `copyScripts: boolean`          | scripts/ ディレクトリコピー有無                      |
| `copyAssets: boolean`           | assets/ ディレクトリコピー有無                       |
| `modifyAllowedTools?: string[]` | allowed-tools の上書き（省略時は fork 元設定を維持） |

`SkillForkResult`（同ファイル）のフィールドと本操作定義の対応:

| `SkillForkResult` フィールド | 本操作定義での扱い                                   |
| ---------------------------- | ---------------------------------------------------- |
| `success: boolean`           | fork 成功フラグ                                      |
| `newSkillPath: string`       | fork 後スキルのディレクトリパス                      |
| `copiedFiles: string[]`      | コピーされたファイルの相対パス一覧                   |
| `warnings?: string[]`        | 非致命的な問題（安全性契約引き継ぎなし警告等）を含む |

`SkillForkMetadata`（同ファイル）のフィールドと本操作定義の対応:

| `SkillForkMetadata` フィールド | 本操作定義での扱い                             |
| ------------------------------ | ---------------------------------------------- |
| `forkedFrom: string`           | fork 元スキル名（`forkedFrom.skillId` に対応） |
| `forkedAt: string`             | fork 日時（ISO 8601形式）                      |
| `originalDescription?: string` | fork 元スキルの説明文（記録用）                |

> 注: `SkillForkMetadata` は `fork-metadata.json` として fork 後スキルのディレクトリに保存される。`forkedFrom.version` と `forkedFrom.author` は本仕様で追加定義するフィールドであり、Phase 5 実装時に `SkillForkMetadata` の拡張として設計する。

---

### 1.4 share（チーム内共有時のアクセス制御）

**目的**: 自分のスキルを特定のチームメンバーに限定公開する。

**操作主体**: スキルの作成者（`author`）のみが share 操作を実行できる。

**操作内容**:

- 作成者が `shared_with` フィールドにユーザーIDを追加することで、そのユーザーがスキルにアクセス可能になる
- `shared_with` への追加と同時に `visibility` を `"local"` から `"team"` に変更する

**共有先ユーザーへの通知**:

- 共有時にアプリ内通知を送信する
- 通知内容: 「ユーザー {作成者名} がスキル {スキル名} をあなたと共有しました」

**共有解除**:

- 作成者が `shared_with` からユーザーIDを削除することで共有を解除する
- 削除後、対象ユーザーの Skill Center からスキルが非表示になる
- 削除後の `shared_with` が空配列になった場合、`visibility` を `"team"` から `"local"` に自動変更する
- 共有解除はローカルにインポート済みのコピーには影響しない（コピーは `visibility="local"` として残存し続ける）

---

## 2. visibility 状態遷移マトリクス

| 操作                                 | 操作前の `visibility`                      | 操作後の `visibility` | 条件                                                      |
| ------------------------------------ | ------------------------------------------ | --------------------- | --------------------------------------------------------- |
| import                               | `"public"`                                 | `"local"`             | 常に適用                                                  |
| import                               | `"team"`                                   | 操作不可              | 直接インポート禁止。共有招待経由のみ                      |
| import（.skillpkg）                  | 存在しない                                 | `"local"`             | パッケージにはフィールドなし。デフォルト設定              |
| export                               | 任意                                       | ファイルに含めない    | `visibility` フィールドは除外                             |
| fork                                 | `"public"`                                 | `"local"`             | 常に適用                                                  |
| fork                                 | `"team"`（`shared_with` に自分が含まれる） | `"local"`             | 常に適用                                                  |
| fork                                 | `"local"`（自分が作成者）                  | `"local"`             | 自分のローカルスキルをfork可能                            |
| share（`shared_with` 追加）          | `"local"`                                  | `"team"`              | `shared_with` に1件以上追加時                             |
| share（`shared_with` 追加）          | `"team"`                                   | `"team"`              | 変化なし（追加のみ）                                      |
| share（`shared_with` 全削除）        | `"team"`                                   | `"local"`             | `shared_with` が空配列になった場合                        |
| publish（公開昇格）                  | `"team"` または `"local"`                  | `"public"`            | `PublishEligibility.isBlocked === false` かつ作成者が確認 |
| deprecate（取り下げ）                | `"public"`                                 | `"team"`              | 作成者または管理者が取り下げ操作を実行                    |
| emergency withdrawal（緊急取り下げ） | `"public"`                                 | `"local"`             | P1/P2インシデント時。管理者が強制変更                     |

---

## 3. 依存解決仕様

### 3.1 import 時の依存解決

**依存解決アルゴリズム**:

1. インポート対象スキルの `dependencies` フィールドの全エントリを取得する
2. 各エントリについて、インポート先の `SkillRegistry` に `skillId` が存在するか確認する
3. 存在する場合、インストール済みバージョンが `minVersion <= installedVersion < maxVersion` を満たすか確認する
4. 不足エントリ（存在しない、またはバージョン制約を満たさない）を列挙する
5. 不足エントリが1件以上ある場合、ダイアログを表示する:
   - 「このスキルは以下の依存スキルを必要とします:」
   - 不足スキルごとに「スキル名（バージョン制約）」を列挙
   - ボタン: 「依存スキルもインポートする」 / 「このスキルのみインポートする（動作保証なし）」
6. 「依存スキルもインポートする」選択時: 依存スキルを再帰的にインポートする（依存の依存も解決する）
7. 「このスキルのみインポートする」選択時: 依存解決を行わずインポートを続行し、警告ラベルを付与する

**テスト可能な成功条件**:

```
dependencies の全エントリ e について:
  SkillRegistry.has(e.skillId) === true
  AND semver.satisfies(SkillRegistry.get(e.skillId).version, `>=${e.minVersion} ${e.maxVersion}`) === true
```

**エラーコード**:

- `2001`: 依存スキルが存在しないため解決不能（`Business Error` 帯）
- `2002`: 依存スキルのバージョンが制約を満たさない（`Business Error` 帯）

---

### 3.2 fork 時の依存バージョン制約

**制約設定ルール**:

fork 操作実行時に fork 後スキルの `dependencies` フィールドに以下を自動設定する:

```json
{
  "skillId": "{forkedFrom.skillId}",
  "minVersion": "{fork時点のfork元バージョン}",
  "maxVersion": "<{fork元のnext major バージョン}"
}
```

**計算例**:

| fork 元のバージョン | `minVersion` | `maxVersion` |
| ------------------- | ------------ | ------------ |
| `"1.2.0"`           | `"1.2.0"`    | `"<2.0.0"`   |
| `"2.0.0"`           | `"2.0.0"`    | `"<3.0.0"`   |
| `"0.9.5"`           | `"0.9.5"`    | `"<1.0.0"`   |

**意味**: fork 元が major バージョンアップ（breaking change）した場合、fork 後スキルの依存制約が「範囲外」となり、利用者に更新または再 fork を促すことができる。

---

## 4. TASK-9E fork 型契約との整合

### 4.1 SkillForkOptions / SkillForkResult / SkillForkMetadata

TASK-9E が実装した型（`packages/shared/src/types/skill-fork.ts`）と本仕様の操作定義の整合点を以下に示す。

**整合済みの点**:

| 本仕様の要件                | TASK-9E 型での実現方法                           | 整合状態 |
| --------------------------- | ------------------------------------------------ | -------- |
| fork 元のスキル名を記録する | `SkillForkMetadata.forkedFrom: string`           | 整合     |
| fork 日時を記録する         | `SkillForkMetadata.forkedAt: string`（ISO 8601） | 整合     |
| 新スキル名を指定する        | `SkillForkOptions.newName: string`               | 整合     |
| 説明文を上書きできる        | `SkillForkOptions.description?: string`          | 整合     |
| fork 結果のパスを返す       | `SkillForkResult.newSkillPath: string`           | 整合     |
| 非致命的な問題を警告で返す  | `SkillForkResult.warnings?: string[]`            | 整合     |

**本仕様で追加定義が必要なフィールド（Phase 5 で `SkillForkMetadata` を拡張する）**:

| フィールド          | 型       | 目的                    | 現状                         |
| ------------------- | -------- | ----------------------- | ---------------------------- |
| `forkedFromVersion` | `string` | fork 元バージョンの記録 | `SkillForkMetadata` に未定義 |
| `forkedFromAuthor`  | `string` | fork 元作成者IDの記録   | `SkillForkMetadata` に未定義 |

> Phase 5 実装時に `SkillForkMetadata` に上記2フィールドを追加する。`forkedFrom` フィールド（既存）はスキル名の参照に使用し続ける。

---

### 4.2 skill:fork / skill-creator:fork 責務境界

TASK-9E が確立した2つの IPC 契約の責務境界を以下の通り確認し、本仕様の fork 操作定義に適用する。

| IPC 契約             | 担当サービス                    | 責務                                                                                                               | 本仕様での位置付け                                  |
| -------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------- |
| `skill:fork`         | `SkillForker`                   | Skill API ドメインのフォーク実体処理。ファイルのコピー、`SkillForkMetadata` の生成・保存、`SkillForkResult` の返却 | **本仕様の「fork 操作」はこちらを経由する**         |
| `skill-creator:fork` | `SkillCreatorService.forkSkill` | SkillCreator ワークフロー上の派生作成補助。forkテンプレートからの新規スキル生成                                    | 本仕様のスコープ外（SkillCreator ワークフロー固有） |

**呼び出しフロー（本仕様）**:

```
ユーザーが「fork する」を選択
  → Renderer: skillAPI.forkSkill(SkillForkOptions) を呼び出す
  → Preload: skill:fork チャンネル経由で Main Process へ転送
  → Main Process: SkillForker が処理を実行
    → ファイルコピー
    → fork-metadata.json を生成（SkillForkMetadata + 拡張フィールド）
    → forkedFrom / forkedFromVersion / forkedFromAuthor を設定
    → visibility を "local" に設定
    → dependencies に fork 元バージョン制約を追加
  → SkillForkResult を返却
  → Renderer: 完了通知を表示
```

**注意**: `skill-creator:fork` は forkテンプレートからの新規スキル生成という異なる責務を持つ。本仕様の「公開スキルを元に派生スキルを作成する」という意味の fork は必ず `skill:fork` を使用し、`skill-creator:fork` と混同しない。

---

## 5. 状態遷移図（テキストベース）

### 5.1 スキルのライフサイクル全体像

```
[新規作成]
    |
    v
[local] <---(降格)--- [team] <---(降格)--- [public]
    |                   |                     |
    | share操作          | publish操作           | deprecate操作
    | (shared_with追加)  | (PublishEligibility  | (visibility: public→team)
    |                   |  チェック通過)         |
    v                   v                     |
  [team]             [public]                 v
    |                                       [team]（取り下げ済みラベル）
    | 全shared_with削除                        |
    v                                         | removal（30日後 + 明示削除）
  [local]                                     v
                                           [削除済み]

緊急取り下げ（P1/P2インシデント）:
  [public] -------> [local]（30日猶予なし、即時）
```

### 5.2 import 操作の状態遷移

```
Skill Center（visibility="public"）
    |
    | import 操作
    v
[インポート先のローカル環境]
    |
    | visibility が "public" から "local" に変更
    | importedVersion = インポート時のバージョン（固定）
    v
[local スキルとして保存]
    |
    |（再公開したい場合）
    v
  fork → 独立スキルとして公開フローへ
```

### 5.3 export / import（.skillpkg）の状態遷移

```
[任意のスキル（visibility: local/team/public）]
    |
    | export 操作
    v
[skill-name@version.skillpkg]
（visibility フィールドは含まれない）
    |
    | .skillpkg ファイルを別環境でインポート
    v
[インポート先のローカル環境]
    |
    | visibility = "local"（デフォルト設定）
    v
[local スキルとして保存]
```

### 5.4 fork 操作の状態遷移

```
[public スキル] または [team スキル（自分が shared_with に含まれる）]
    |
    | fork 操作
    v
[fork 後スキル]
    |
    | visibility = "local"（自動設定）
    | forkedFrom = { skillId, version, author }
    | dependencies に fork 元バージョン制約を追加
    | SkillSafetyContract は引き継がない
    v
[local スキルとして保存]
    |
    |（公開したい場合）
    v
PublishEligibility チェック → 公開フロー
```

### 5.5 share 操作の状態遷移

```
[local スキル]
    |
    | share 操作（shared_with にユーザーID追加）
    v
[team スキル]
    |
    | 共有先ユーザーへ通知（「ユーザーXがスキルYをあなたと共有しました」）
    |
    | 全 shared_with を削除した場合
    v
[local スキル]（visibility が team から local に戻る）

[注] 共有解除はインポート済みのコピーに影響しない
```

---

## 6. フロー完結性の検証

### 6.1 import → fork → publish フロー

このフローが完結することを以下の通り確認する。

**ステップ 1: import**

- 前提: Skill Center に `visibility="public"` のスキル A（バージョン `"1.2.0"`）が存在する
- 操作: ユーザーがスキル A をインポートする
- 結果: ローカルにスキル A のコピーが作成される（`visibility="local"`、`importedVersion="1.2.0"`）
- 制約確認: インポート済みのスキル A を直接公開しようとすると「インポートしたスキルは直接公開できません。fork してから公開してください」というエラーが表示される（`visibility="local"` かつ `importedVersion` が存在する場合は公開ブロック）

**ステップ 2: fork**

- 前提: ステップ 1 でインポートしたスキル A（`visibility="local"`）が存在する
- 操作: ユーザーがスキル A から fork してスキル B を作成する
- 結果:
  - スキル B が作成される（`visibility="local"`）
  - `forkedFrom = { skillId: "A", version: "1.2.0", author: "original-author-id" }`
  - `dependencies = [{ skillId: "A", minVersion: "1.2.0", maxVersion: "<2.0.0" }]`
  - `SkillSafetyContract` は引き継がれない
  - `fork-metadata.json` が生成される

**ステップ 3: publish**

- 前提: ステップ 2 で作成したスキル B（`visibility="local"`）に改変を加え、以下の状態とする:
  - `SkillSafetyContract.maxRiskLevel` が `"medium"` 以下
  - `AggregateView.testPassRate` が `0.8` 以上
  - `license` フィールドが設定済み
  - `tags` フィールドが1件以上設定済み
  - `description` が20文字以上
- 操作: ユーザーが「公開する」ボタンをクリックする
- 結果:
  - `PublishEligibility.isBlocked === false` が確認される
  - 確認ダイアログが表示される
  - 作成者が確認すると `visibility` が `"public"` に変更される
  - スキル B が Skill Center に掲載される

**フロー完結性の確認結果**: import（`public` → `local`）→ fork（`local` から `local` を新規作成）→ publish（`local` → `public`）のフローが各操作の制約を満たしながら完結することを確認した。

---

### 6.2 share → fork → publish フロー（チーム内スキルの派生公開）

**ステップ 1: share（受信側の視点）**

- 前提: チームメンバーのユーザーXが `visibility="team"` のスキル C を自分（ユーザーY）に共有している（`shared_with` にユーザーYのIDが含まれる）
- 操作: ユーザーYがスキル C を確認する（インポートは不可だが、fork は可能）

**ステップ 2: fork**

- 操作: ユーザーYがスキル C から fork してスキル D を作成する
- 結果: スキル D が `visibility="local"` で作成される（スキル C の `SkillSafetyContract` は引き継がない）

**ステップ 3: publish**

- 操作: ユーザーYがスキル D の `PublishEligibility` チェックを通過させ、公開する
- 結果: スキル D が Skill Center に掲載される

---

## 7. テスト可能な条件式サマリー

本仕様に含まれる全ての判定条件を、実装・テスト可能な条件式として以下にまとめる。

### import 操作

| 条件                                 | 式                                                                                                                                                                |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| import 可能判定                      | `skill.visibility === "public"`                                                                                                                                   |
| team スキルの直接import ブロック     | `skill.visibility === "team"` → エラー（`2003: IMPORT_NOT_ALLOWED_FOR_TEAM_SKILL`）                                                                               |
| import 後 visibility 設定            | `importedSkill.visibility = "local"`                                                                                                                              |
| importedVersion 設定                 | `importedSkill.importedVersion = skill.version`                                                                                                                   |
| 依存解決成功                         | `skill.dependencies.every(dep => registry.has(dep.skillId) && semver.satisfies(registry.get(dep.skillId).version, ">=" + dep.minVersion + " " + dep.maxVersion))` |
| インポート済みスキルの再公開ブロック | `skill.importedVersion !== undefined && skill.visibility === "local"` → 公開操作をブロック                                                                        |

### export 操作

| 条件                                   | 式                                                    |
| -------------------------------------- | ----------------------------------------------------- |
| export 対象                            | `true`（全スキルが対象、`visibility` 値に依存しない） |
| パッケージに visibility を含めない     | `exportPackage.metadata.visibility === undefined`     |
| インポート先での visibility デフォルト | `importedFromPkg.visibility = "local"`                |

### fork 操作

| 条件                             | 式                                                                                                              |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| fork 可能判定                    | `skill.visibility === "public" \|\| (skill.visibility === "team" && skill.shared_with.includes(currentUserId))` |
| fork 後 visibility 設定          | `forkedSkill.visibility = "local"`                                                                              |
| forkedFrom 設定                  | `forkedSkill.forkedFrom = { skillId: skill.id, version: skill.version, author: skill.author }`                  |
| 依存バージョン制約 minVersion    | `dep.minVersion = skill.version`                                                                                |
| 依存バージョン制約 maxVersion    | `dep.maxVersion = "<" + semver.inc(skill.version, "major")`                                                     |
| SkillSafetyContract 引き継ぎなし | `forkedSkill.safetyContract === undefined`                                                                      |

### share 操作

| 条件                                 | 式                                                            |
| ------------------------------------ | ------------------------------------------------------------- |
| shared_with 追加後 visibility 変更   | `skill.shared_with.length > 0 → skill.visibility = "team"`    |
| shared_with 全削除後 visibility 変更 | `skill.shared_with.length === 0 → skill.visibility = "local"` |
| 共有解除がローカルコピーに影響しない | `localCopy.visibility === "local"`（変化なし）                |

---

## 8. 検証可能性

本仕様は以下の方針で検証可能性を確保する。

### 8.1 単体テストで検証可能な項目

| 検証項目                                                   | 検証方法                                                                                            |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| import 後 `visibility` が `"local"` になる                 | `importSkill(publicSkill).visibility === "local"` を assert                                         |
| import 後 `importedVersion` が記録される                   | `importSkill(publicSkill).importedVersion === publicSkill.version` を assert                        |
| team スキルを直接 import するとエラーになる                | `importSkill(teamSkill)` が `IMPORT_NOT_ALLOWED_FOR_TEAM_SKILL` エラーを throw することを assert    |
| export パッケージに `visibility` が含まれない              | `exportSkill(skill).metadata.visibility === undefined` を assert                                    |
| fork 後 `visibility` が `"local"` になる                   | `forkSkill(options).then(result => getSkill(result.newSkillPath).visibility === "local")` を assert |
| fork 後 `forkedFrom` が設定される                          | `forkedSkill.forkedFrom.skillId === sourceSkill.id` を assert                                       |
| fork 後に `SkillSafetyContract` が引き継がれない           | `forkedSkill.safetyContract === undefined` を assert                                                |
| 全 `shared_with` 削除後に `visibility` が `"local"` に戻る | `removeAllSharedWith(skill).visibility === "local"` を assert                                       |

### 8.2 統合テストで検証可能な項目

| 検証項目                                                                  | 検証方法                                                                 |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| import → fork → publish フローが完結する                                  | E2Eシナリオで各ステップの `visibility` 遷移が仕様通りであることを確認    |
| 依存スキルありの import で依存解決ダイアログが表示される                  | モック `SkillRegistry`（依存スキルが存在しない）を使用して UI 動作を確認 |
| fork 後の `skill:fork` IPC 呼び出しが `SkillForkOptions` 型契約に準拠する | IPC ハンドラのテストで引数型を検証                                       |

### 8.3 Phase 5 実装時の追加設計事項

- `SkillForkMetadata` に `forkedFromVersion` / `forkedFromAuthor` フィールドを追加する（`packages/shared/src/types/skill-fork.ts`）
- `importedVersion` フィールドを `SkillMetadata` の拡張として定義する（`interfaces-agent-sdk-skill.md` 参照先で更新）
- import 操作で「インポート済みスキルの再公開ブロック」ロジックを `PublishCheckService` に組み込む
