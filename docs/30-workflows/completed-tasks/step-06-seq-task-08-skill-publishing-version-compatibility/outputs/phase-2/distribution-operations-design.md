# 配布操作設計書: import / export / fork / share の責務境界

## メタ情報

| 項目       | 内容                                                                                                                                |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 文書       | Phase 2 - タスク4 成果物                                                                                                            |
| タスクID   | TASK-SKILL-LIFECYCLE-08                                                                                                             |
| 作成日     | 2026-03-17                                                                                                                          |
| 依存成果物 | `outputs/phase-1/distribution-alignment.md`, `outputs/phase-1/skill-center-registration.md`, `outputs/phase-1/publishing-levels.md` |
| 参照仕様   | `phase-2-design.md` タスク4、`interfaces-agent-sdk-skill-reference-share-debug-analytics.md`（TASK-9F）、`skill-fork.ts`（TASK-9E） |

---

## 1. 概要

本設計書は `SkillDistributionService` インターフェースを中心に、スキルの 4 つの配布操作（import / export / fork / share）の責務境界、入出力型定義、フロー設計、IPC チャンネル定義、バリデーション仕様、競合ケース対応を記述する。

Phase 1 の `distribution-alignment.md` が「何を」行うかを定義したのに対し、本設計書は「どのように」実現するかをインターフェース契約として定義する。プロダクションコードは作成しない。

### 設計スコープ

| スコープ内                                                  | スコープ外                                               |
| ----------------------------------------------------------- | -------------------------------------------------------- |
| `SkillDistributionService` の型定義・インターフェース設計   | 具象クラス `DefaultSkillDistributionService` の実装      |
| 4 操作のフロー設計（シーケンス記述）                        | `skill-creator:fork` チャンネル（SkillCreator 固有処理） |
| IPC チャンネル定数・ハンドラ登録関数の型定義                | Renderer コンポーネントの実装                            |
| P42 準拠バリデーション仕様・P60 準拠レスポンス wrapper 定義 | Store（Zustand）の実装                                   |

---

## 2. 型定義

### 2.1 共通 IPC レスポンス wrapper（P60 準拠）

全 `skill:distribution:*` チャンネルのレスポンスを以下の wrapper 形式で統一する。テスト作成時（Phase 4）は `result.error.code` でアサーションを記述する（`result.code` ではない）。

```typescript
type IpcResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };
```

### 2.2 import 操作の型定義

```typescript
/**
 * importSkill の入力オプション。
 * 配置先: packages/shared/src/types/skill-distribution.ts
 */
interface ImportOptions {
  /**
   * 依存スキルを自動解決するか。
   * false の場合は依存なしでインポートし警告ラベルを付与する。
   */
  autoResolveDependencies: boolean;
  /**
   * インポート先ディレクトリ（省略時はデフォルトスキルディレクトリを使用）。
   * P42 準拠: 指定する場合は非空文字列かつ trim 後も非空であること。
   */
  targetDirectory?: string;
}

/**
 * importSkill の成功時レスポンス。
 * IpcResponse<ImportResult> の data フィールドとして返す。
 * 配置先: packages/shared/src/types/skill-distribution.ts
 */
interface ImportResult {
  /** インポートされたスキルの ID（UUID v4） */
  skillId: string;
  /** インポート完了日時（ISO 8601 形式、例: "2026-03-17T07:20:46.000Z"） */
  importedAt: string;
  /**
   * 自動解決した依存スキル ID の配列。
   * autoResolveDependencies=false の場合は空配列。
   */
  resolvedDependencies: string[];
}
```

### 2.3 export 操作の型定義

```typescript
/**
 * exportSkill の入力オプション。
 * 配置先: packages/shared/src/types/skill-distribution.ts
 */
interface ExportOptions {
  /** メタデータ（name, description, tags 等）をパッケージに含めるか */
  includeMetadata: boolean;
  /**
   * 出力フォーマット。現在は ".skill" 形式（zip アーカイブ）のみ対応。
   * 将来的に "json" 等を追加する場合は union 型を拡張する。
   */
  format: "skill-package";
}

/**
 * exportSkill の成功時レスポンス。
 * IpcResponse<ExportPackage> の data フィールドとして返す。
 * 配置先: packages/shared/src/types/skill-distribution.ts
 */
interface ExportPackage {
  /** 生成されたファイル名（例: "my-analyzer@1.2.0.skillpkg"） */
  fileName: string;
  /** ファイルサイズ（バイト単位） */
  size: number;
  /** SHA-256 チェックサム（16 進数文字列、64 文字） */
  checksum: string;
}
```

### 2.4 fork 操作の型定義

```typescript
/**
 * forkSkill の成功時レスポンス。
 * IpcResponse<ForkResult> の data フィールドとして返す。
 * 配置先: packages/shared/src/types/skill-distribution.ts
 *
 * 注: TASK-9E の SkillForkResult との関係
 *   - SkillForkResult.newSkillPath は SkillForker の内部実装レイヤーで使用する
 *   - ForkResult はより上位の配布操作レイヤーの型であり、newSkillId（UUID）を返す
 *   - 内部的には SkillForker が SkillForkOptions + SkillForkMetadata を生成する
 */
interface ForkResult {
  /** 生成された新スキルの ID（UUID v4） */
  newSkillId: string;
  /** fork 元スキルの参照 ID（forkedFrom.skillId に相当） */
  parentRef: string;
  /** fork 完了日時（ISO 8601 形式） */
  forkedAt: string;
}
```

### 2.5 share 操作の型定義

```typescript
/**
 * shareSkill の入力オプション。
 * 配置先: packages/shared/src/types/skill-distribution.ts
 */
interface ShareOptions {
  /**
   * 共有リンクの有効期限（秒単位の正の整数）。
   * P42 準拠バリデーション: expiresIn > 0 かつ整数であること。
   * 例: 86400（24 時間）、604800（7 日間）
   */
  expiresIn: number;
  /** 共有先への付与権限 */
  permissions: "read" | "read-write";
}

/**
 * shareSkill の成功時レスポンス。
 * IpcResponse<ShareLink> の data フィールドとして返す。
 * 配置先: packages/shared/src/types/skill-distribution.ts
 */
interface ShareLink {
  /** アクセス用 URL（例: "https://skill-center.example.com/share/{token}"） */
  url: string;
  /** 共有先チームの ID */
  teamId: string;
  /** 有効期限（ISO 8601 形式） */
  expiresAt: string;
  /** JWT 形式のアクセストークン（有効期限・権限・teamId をペイロードに含む） */
  token: string;
}
```

### 2.6 SkillDistributionService インターフェース

```typescript
/**
 * 4 つの配布操作を提供するサービスインターフェース。
 * 配置先: packages/shared/src/types/skill-distribution.ts
 *
 * P61 準拠: registerSkillDistributionHandlers の引数型はこのインターフェースとする。
 * 具象クラス DefaultSkillDistributionService を引数に取らない。
 */
interface SkillDistributionService {
  /**
   * Skill Center（または URL で指定されたソース）からスキルをローカル環境にインポートする。
   *
   * @param sourceUrl - インポート元 URL（非空文字列、P42 準拠 3 段バリデーション対象）
   * @param options   - インポートオプション
   * @returns           IpcResponse<ImportResult>
   */
  importSkill(sourceUrl: string, options: ImportOptions): Promise<ImportResult>;

  /**
   * ローカルスキルを .skill パッケージファイルとしてエクスポートする。
   *
   * @param skillId - エクスポート対象スキルの ID（非空文字列、P42 準拠 3 段バリデーション対象）
   * @param options - エクスポートオプション
   * @returns         IpcResponse<ExportPackage>
   */
  exportSkill(skillId: string, options: ExportOptions): Promise<ExportPackage>;

  /**
   * 既存スキルから独立した派生スキルを作成する（fork）。
   * fork 後のスキルは visibility="local"、バージョン="0.1.0"、
   * SkillSafetyContract 引き継ぎなし、parentRef に元スキル ID を保持する。
   *
   * @param skillId - fork 元スキルの ID（非空文字列、P42 準拠 3 段バリデーション対象）
   * @param newName - 新スキル名（非空文字列・既存スキルと重複不可、P42 準拠 3 段バリデーション対象）
   * @returns         IpcResponse<ForkResult>
   */
  forkSkill(skillId: string, newName: string): Promise<ForkResult>;

  /**
   * スキルをチームに共有する。共有リンク（有効期限付き JWT）を生成して返す。
   *
   * @param skillId - 共有対象スキルの ID（非空文字列、P42 準拠 3 段バリデーション対象）
   * @param teamId  - 共有先チームの ID（非空文字列、P42 準拠 3 段バリデーション対象）
   * @param options - 共有オプション（expiresIn: 正の整数）
   * @returns         IpcResponse<ShareLink>
   */
  shareSkill(
    skillId: string,
    teamId: string,
    options: ShareOptions,
  ): Promise<ShareLink>;
}
```

### 2.7 エラーコード定数

```typescript
/**
 * SkillDistributionService が返すエラーコードの定義。
 * 配置先: packages/shared/src/types/skill-distribution.ts
 *
 * エラーカテゴリ（02-code-quality.md 参照）:
 *   1000-1999: Validation Error（バリデーション失敗）
 *   2000-2999: Business Error（業務ルール違反）
 *   4000-4999: Infrastructure Error（外部サービス障害等）
 */
const SKILL_DISTRIBUTION_ERROR_CODES = {
  // Validation Error
  VALIDATION_ERROR: "SKILL_DIST_VALIDATION_ERROR",
  // Business Error
  DEPENDENCY_ERROR: "SKILL_DIST_DEPENDENCY_ERROR",
  DEPENDENCY_VERSION_ERROR: "SKILL_DIST_DEPENDENCY_VERSION_ERROR",
  IMPORT_BLOCKED_TEAM_SKILL: "SKILL_DIST_IMPORT_BLOCKED_TEAM",
  DUPLICATE_NAME_ERROR: "SKILL_DIST_DUPLICATE_NAME_ERROR",
  NOT_FOUND_ERROR: "SKILL_DIST_NOT_FOUND_ERROR",
  SHARE_EXPIRED: "SKILL_DIST_SHARE_EXPIRED",
  FORK_NOT_ALLOWED: "SKILL_DIST_FORK_NOT_ALLOWED",
  EXPORT_LOCK_ERROR: "SKILL_DIST_EXPORT_LOCK_ERROR",
  // Infrastructure Error
  NETWORK_ERROR: "SKILL_DIST_NETWORK_ERROR",
} as const;

type SkillDistributionErrorCode =
  (typeof SKILL_DISTRIBUTION_ERROR_CODES)[keyof typeof SKILL_DISTRIBUTION_ERROR_CODES];
```

---

## 3. 責務マトリクス

| 操作   | 入力                           | 出力                                | バージョン関係                                                                                                                                                 | メタデータ処理                                                                                                                                                          | 競合ケース                                                                                                                                   |
| ------ | ------------------------------ | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| import | Skill Center URL（sourceUrl）  | ローカルスキル（ImportResult）      | 参照コピー。`importedAt` に取り込み時刻を記録する。自動更新なし（手動更新操作が必要）。                                                                        | 元メタデータ（name, description, tags 等）を保持する。`visibility` は `"local"` に強制上書き。`shared_with` / `importedVersion` はインポート先が新規設定する。          | 同名スキルが既存の場合: 確認ダイアログを表示する。ユーザーが「上書き」を選択した場合のみ続行する。                                           |
| export | ローカルスキル ID（skillId）   | パッケージファイル（ExportPackage） | 独立バージョン。エクスポート時点のバージョンをファイル名に付与する（例: `my-skill@1.2.0.skillpkg`）。SHA-256 チェックサムを付与する。                          | `visibility` / `shared_with` / `importedVersion` は除外する（インポート先環境依存のため）。その他メタデータ（name, description, tags, version 等）はそのまま付与する。  | エクスポート中にスキルが更新された場合: エクスポート開始時にロックを取得し、エクスポート完了後に解放する（`EXPORT_LOCK_ERROR` でブロック）。 |
| fork   | fork 元スキル ID・新スキル名   | 新スキル（ForkResult）              | 独立バージョン。新スキルは `0.1.0` からリセット。fork 元への依存バージョン制約（`minVersion=fork 時点のバージョン`、`maxVersion=<次の major`）を自動設定する。 | `parentRef` に fork 元スキル ID を設定する。UUID v4 で新 ID を付与する。`SkillSafetyContract` は引き継がない。`forkedAt` を ISO 8601 で記録する。                       | 同名 fork が既存の場合: 新スキル名にサフィックス `_fork_{n}` を自動付与する（例: `my-skill_fork_2`）。ユーザーに付与後の名前を提示する。     |
| share  | スキル ID・チーム ID・有効期限 | 共有リンク（ShareLink）             | 同一バージョン。スキルの現在バージョンをそのまま共有する。バージョン固定ではなく、スキル更新後も同じ URL でアクセス可能。                                      | `teamId` ベースのアクセス制御。`permissions` フィールドで `read` / `read-write` を設定する。JWT ペイロードに `teamId`, `skillId`, `expiresAt`, `permissions` を含める。 | 有効期限切れの場合: アクセス試行時に `SHARE_EXPIRED` エラーを返す。定期クリーンアップジョブで物理削除する。                                  |

### 操作間の関係性

- **import と fork の違い**: import は元スキルのメタデータをそのまま保持してローカルに配置する。fork は `parentRef` を保持しつつ新しいスキル ID を発行し、独立した管理下に置く。
- **export と share の違い**: export はスキルをパッケージファイル（`.skill` 形式）として出力しオフライン配布を可能にする。share は `teamId` に紐づく有効期限付きリンクを発行しオンライン共有を実現する。
- **バージョン独立性の有無**: import・share はバージョン関係を元スキルに依存する（参照コピー / 同一バージョン）。export・fork は元スキルとバージョンを切り離し独立管理する。

---

## 4. 各操作のフロー設計

### 4.1 import の依存解決フロー

**シーケンス（lane: UI / IPC / Main）:**

```
Start
  |
  UI: ユーザーが「インポート」を選択し sourceUrl を入力する
  |
  UI → IPC: skill:distribution:import チャンネルへ送信
            { sourceUrl: string, options: ImportOptions }
  |
  IPC → Main: SkillDistributionService.importSkill(sourceUrl, options) を呼び出す
  |
  Main: [バリデーション] sourceUrl が非空文字列・trim 後も非空であることを確認する
    ├─ 失敗 → IpcResponse<ImportResult>
    |          { success: false, error: { code: "SKILL_DIST_VALIDATION_ERROR", message: "..." } }
    |          を返す → End
    └─ 成功 → 次のステップへ
  |
  Main: [ダウンロード] sourceUrl からスキルメタデータ・ファイルをダウンロードする
    ├─ 失敗（ネットワークエラー）→
    |    { success: false, error: { code: "SKILL_DIST_NETWORK_ERROR", ... } } → End
    └─ 成功 → 次のステップへ
  |
  Main: [visibility チェック] skill.visibility === "public" を確認する
    ├─ team スキル →
    |    { success: false, error: { code: "SKILL_DIST_IMPORT_BLOCKED_TEAM", ... } } → End
    └─ public スキル → 次のステップへ
  |
  Main: [ローカル配置] スキルファイルを targetDirectory（またはデフォルトディレクトリ）に配置する
  |
  Main: [依存チェック] skill.dependencies の全エントリについて依存解決を試みる
    |
    ├─ 全依存が満足済み → resolvedDependencies = [] → 有効化ステップへ
    |
    └─ 未解決の依存が存在する場合:
         |
         ├─ options.autoResolveDependencies === true の場合:
         |    Main: 未解決の依存スキルを再帰的にインポートする
         |    Main: resolvedDependencies に解決済みスキル ID を追加する
         |    └─ 有効化ステップへ
         |
         └─ options.autoResolveDependencies === false の場合:
              IPC → UI: 依存確認ダイアログを表示する
                        「以下の依存スキルもインポートしますか？{依存スキル一覧}」
              |
              ├─ ユーザーが「インポートする」を選択:
              |    Main: 依存スキルを再帰的にインポートする
              |    └─ 有効化ステップへ
              |
              └─ ユーザーが「スキップ」を選択:
                   Main: 依存なしでインポートを続行する（警告ラベルを付与する）
                   └─ 有効化ステップへ
  |
  Main: [有効化] スキルを有効状態にする
        importedAt（ISO 8601）を記録する
        ImportResult を生成する: { skillId, importedAt, resolvedDependencies }
  |
  Main → IPC → UI: IpcResponse<ImportResult> { success: true, data: ImportResult } を返す
  |
End
```

**テスト可能な条件式（Phase 1 準拠）:**

```
import 可能判定: skill.visibility === "public"
import 後 visibility: importedSkill.visibility === "local"
import 後 importedVersion: importedSkill.importedVersion === skill.version
依存解決成功条件:
  skill.dependencies.every(dep =>
    registry.has(dep.skillId) &&
    semver.satisfies(
      registry.get(dep.skillId).version,
      ">=" + dep.minVersion + " " + dep.maxVersion
    )
  )
```

---

### 4.2 export のパッケージングフロー

**シーケンス（lane: UI / IPC / Main）:**

```
Start
  |
  UI: ユーザーがスキルを選択し「エクスポート」をクリックする
      メタデータ入力ダイアログ（includeMetadata=true の場合）を表示する
  |
  UI → IPC: skill:distribution:export チャンネルへ送信
            { skillId: string, options: ExportOptions }
  |
  IPC → Main: SkillDistributionService.exportSkill(skillId, options) を呼び出す
  |
  Main: [バリデーション] skillId が非空文字列・trim 後も非空であることを確認する
    ├─ 失敗 → { success: false, error: { code: "SKILL_DIST_VALIDATION_ERROR", ... } } → End
    └─ 成功 → 次のステップへ
  |
  Main: [スキル存在確認] skillId に対応するスキルが存在するか確認する
    ├─ 不存在 → { success: false, error: { code: "SKILL_DIST_NOT_FOUND_ERROR", ... } } → End
    └─ 存在 → 次のステップへ
  |
  Main: [エクスポートロック取得] エクスポート中の更新を防ぐためロックを取得する
    ├─ 取得失敗（別のエクスポートが進行中）→
    |    { success: false, error: { code: "SKILL_DIST_EXPORT_LOCK_ERROR", ... } } → End
    └─ 取得成功 → 次のステップへ
  |
  Main: [メタデータ付与]
        includeMetadata=true: name, description, tags, version 等を付与する
        除外フィールド: visibility, shared_with, importedVersion
  |
  Main: [バリデーション] 必須フィールド（name, version）が存在することを確認する
  |
  Main: [パッケージ生成]
        ファイル名: {skill-name}@{version}.skillpkg（zip アーカイブ）
        SHA-256 チェックサムを計算する
        ExportPackage を生成する: { fileName, size, checksum }
  |
  Main: [エクスポートロック解放]
  |
  Main → IPC → UI: IpcResponse<ExportPackage> { success: true, data: ExportPackage } を返す
  |
  UI: ファイル保存ダイアログを表示する
  |
End
```

**パッケージフィールド包含/除外ルール（Phase 1 準拠）:**

| フィールド                                    | 含む/除く | 理由                                                  |
| --------------------------------------------- | --------- | ----------------------------------------------------- |
| `metadata`（`visibility` を除く全フィールド） | 含む      | スキルの識別・説明情報として必要                      |
| `promptTemplate`                              | 含む      | スキルの実行内容                                      |
| `config`                                      | 含む      | 実行設定                                              |
| `inputSchema`                                 | 含む      | インターフェース契約                                  |
| `outputSchema`                                | 含む      | インターフェース契約                                  |
| `visibility`                                  | **除く**  | インポート先環境でデフォルト `"local"` を設定するため |
| `shared_with`                                 | **除く**  | ユーザー ID は環境依存情報のため                      |
| `importedVersion`                             | **除く**  | インポート時に新規に記録されるため                    |

---

### 4.3 fork のバージョン分岐フロー

**シーケンス（lane: UI / IPC / Main）:**

```
Start
  |
  UI: ユーザーが公開スキルの「fork する」ボタンをクリックする
      新スキル名入力フォームを表示する
  |
  UI → IPC: skill:distribution:fork チャンネルへ送信
            { skillId: string, newName: string }
  |
  IPC → Main: SkillDistributionService.forkSkill(skillId, newName) を呼び出す
  |
  Main: [バリデーション]
        skillId: 非空文字列・trim 後も非空であることを確認する
        newName: 非空文字列・trim 後も非空であることを確認する
    ├─ 失敗 → { success: false, error: { code: "SKILL_DIST_VALIDATION_ERROR", ... } } → End
    └─ 成功 → 次のステップへ
  |
  Main: [fork 権限チェック]
        skill.visibility === "public"
        OR (skill.visibility === "team" AND skill.shared_with.includes(currentUserId))
        OR (skill.visibility === "local" AND skill.author === currentUserId)
    ├─ 権限なし →
    |    { success: false, error: { code: "SKILL_DIST_FORK_NOT_ALLOWED", ... } } → End
    └─ 権限あり → 次のステップへ
  |
  Main: [重複名チェック] newName と同名のスキルが既存するか確認する
    ├─ 重複あり → 自動サフィックス付与:
    |              newName_fork_2, newName_fork_3 … の形式で一意名を生成する
    |              UI に「{自動付与名}として作成します」を提示する
    └─ 重複なし → そのまま続行する
  |
  Main: [fork 元スキルの参照を parentRef に保持]
        parentRef = skillId（fork 元スキルの ID）
  |
  Main: [新スキル ID 生成] UUID v4 で newSkillId を生成する
  |
  Main: [バージョンリセット] 新スキルのバージョンを "0.1.0" にリセットする
  |
  Main: [fork 元依存バージョン制約を設定]
        dependencies に以下を追加する:
          { skillId: skillId, minVersion: forkSourceVersion, maxVersion: "<" + nextMajor }
        例: fork 元が "1.2.0" なら maxVersion = "<2.0.0"
  |
  Main: [SkillSafetyContract を除外]
        fork 後スキルには safetyContract を引き継がない（= undefined にする）
  |
  Main: [forkedAt 記録] ISO 8601 形式で現在時刻を記録する
  |
  Main: [fork-metadata.json を生成]
        SkillForkMetadata（TASK-9E 型）を生成・保存する:
          { forkedFrom: skillId, forkedAt: ISO8601,
            forkedFromVersion: version, forkedFromAuthor: author }
        注: forkedFromVersion / forkedFromAuthor は Phase 5 で SkillForkMetadata に追加するフィールド
  |
  Main: [visibility を "local" に設定]
  |
  Main → IPC → UI:
    IpcResponse<ForkResult> { success: true, data: { newSkillId, parentRef, forkedAt } }
  |
  UI: fork 完了通知を表示する（「スキル {newName} を作成しました」）
  |
End
```

**TASK-9E `SkillForkResult` との関係:**

`skill:distribution:fork` チャンネルは内部で `skill:fork`（TASK-9E `SkillForker`）を呼び出す。`SkillForker` が返す `SkillForkResult.newSkillPath` から `newSkillId` を解決する変換レイヤーを `DefaultSkillDistributionService` が担う（Phase 5 実装時に設計する）。

---

### 4.4 share のアクセス制御フロー

**シーケンス（lane: UI / IPC / Main）:**

```
Start
  |
  UI: ユーザーがスキルの「共有」ボタンをクリックする
      チーム ID 入力・有効期限・権限を設定する
  |
  UI → IPC: skill:distribution:share チャンネルへ送信
            { skillId: string, teamId: string, options: ShareOptions }
  |
  IPC → Main: SkillDistributionService.shareSkill(skillId, teamId, options) を呼び出す
  |
  Main: [バリデーション]
        skillId:           非空文字列・trim 後も非空であることを確認する
        teamId:            非空文字列・trim 後も非空であることを確認する
        options.expiresIn: 正の整数（> 0 かつ Number.isInteger）であることを確認する
    ├─ 失敗 → { success: false, error: { code: "SKILL_DIST_VALIDATION_ERROR", ... } } → End
    └─ 成功 → 次のステップへ
  |
  Main: [スキル存在確認] skillId に対応するスキルが存在するか確認する
    ├─ 不存在 → { success: false, error: { code: "SKILL_DIST_NOT_FOUND_ERROR", ... } } → End
    └─ 存在 → 次のステップへ
  |
  Main: [操作主体確認] 現在のユーザーがスキルの作成者（author）であるか確認する
    ├─ 非作成者 →
    |    { success: false,
    |      error: { code: "SKILL_DIST_VALIDATION_ERROR",
    |               message: "share は作成者のみ実行可能" } } → End
    └─ 作成者 → 次のステップへ
  |
  Main: [teamId ベース権限管理]
        teamId に対応するチームが存在することを確認する（チーム管理サービスと連携）
  |
  Main: [JWT 共有リンク生成]
        JWT ペイロード: { skillId, teamId, permissions, iat, exp }
        exp = 現在時刻 + options.expiresIn（秒）
        ShareLink を生成する:
          { url, teamId, expiresAt: ISO8601, token: JWT }
  |
  Main: [visibility の自動設定]
        skill.shared_with に teamId を追加する
        skill.shared_with.length > 0 の場合、skill.visibility を "team" に設定する
  |
  Main: [共有先への通知]
        チームメンバーへのアプリ内通知を送信する:
        「ユーザー {author} がスキル {skillName} をチーム {teamId} と共有しました」
  |
  Main → IPC → UI: IpcResponse<ShareLink> { success: true, data: ShareLink } を返す
  |
  UI: 共有リンクをコピーボタン付きで表示する
  |
End

[有効期限切れのアクセス時:]
  アクセス試行 → JWT 検証 → exp < 現在時刻
    → { success: false, error: { code: "SKILL_DIST_SHARE_EXPIRED", ... } }
    → 定期クリーンアップジョブ（1 日 1 回）で期限切れリンクを物理削除する

[共有解除時:]
  skill.shared_with から teamId を削除する
  skill.shared_with.length === 0 の場合、skill.visibility を "local" に戻す
  ローカルにインポート済みのコピーには影響しない（コピーは visibility="local" のまま残存）
```

---

## 5. IPC チャンネル定義

```typescript
/**
 * SkillDistributionService の IPC チャンネル定数。
 * 配置先: packages/shared/src/constants/ipc-channels.ts（既存定数に追加）
 *
 * P27 準拠: チャンネル名は定数で参照し、ハードコード文字列を使用しない。
 * P42 準拠: 全チャンネルのハンドラで 3 段バリデーション
 *           （型チェック → 空文字列 → トリム空文字列）を実施する。
 * P61 準拠: ハンドラ登録関数 registerSkillDistributionHandlers の引数型は
 *           SkillDistributionService（インターフェース）とする。
 */
const SKILL_DISTRIBUTION_CHANNELS = {
  IMPORT: "skill:distribution:import",
  EXPORT: "skill:distribution:export",
  FORK: "skill:distribution:fork",
  SHARE: "skill:distribution:share",
} as const;

type SkillDistributionChannel =
  (typeof SKILL_DISTRIBUTION_CHANNELS)[keyof typeof SKILL_DISTRIBUTION_CHANNELS];
```

### IPC ハンドラ登録関数（P61 準拠）

```typescript
/**
 * SkillDistributionService の IPC ハンドラを登録する。
 *
 * P61 準拠: 引数型はインターフェース SkillDistributionService とする。
 *           具象クラス DefaultSkillDistributionService を直接引数に取らない。
 *
 * @param distributionService - SkillDistributionService インターフェースの実装
 */
function registerSkillDistributionHandlers(
  distributionService: SkillDistributionService,
): void;
```

### IPC ハンドラ実装パターン（P60 / P42 準拠スニペット）

```typescript
// skill:distribution:import ハンドラの実装パターン例（Phase 5 参考）
ipcMain.handle(
  SKILL_DISTRIBUTION_CHANNELS.IMPORT,
  async (
    _event,
    sourceUrl: string,
    options: ImportOptions,
  ): Promise<IpcResponse<ImportResult>> => {
    // P42 準拠 3 段バリデーション
    if (
      typeof sourceUrl !== "string" ||
      sourceUrl === "" ||
      sourceUrl.trim() === ""
    ) {
      return {
        success: false,
        error: {
          code: SKILL_DISTRIBUTION_ERROR_CODES.VALIDATION_ERROR,
          message: "sourceUrl must be a non-empty string",
        },
      };
    }
    try {
      const result = await distributionService.importSkill(sourceUrl, options);
      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        error: {
          code: SKILL_DISTRIBUTION_ERROR_CODES.NETWORK_ERROR,
          message: "Failed to import skill",
        },
      };
    }
  },
);
```

---

## 6. コマンドバリデーションマトリクス

P42 準拠の 3 段バリデーション（型チェック → 空文字列 → トリム空文字列）を全文字列入力に適用する。

| メソッド      | 入力パラメータ             | バリデーション（P42 3 段）                                                                                                   | 追加業務ルール                                                                                                       | 失敗時のエラーコード                                                |
| ------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `importSkill` | `sourceUrl: string`        | `typeof sourceUrl !== "string"` → NG / `sourceUrl === ""` → NG / `sourceUrl.trim() === ""` → NG                              | 依存スキルが全てインストール済み、またはユーザーが `autoResolveDependencies` / 手動承認で対応済みであること          | `VALIDATION_ERROR`, `DEPENDENCY_ERROR`, `IMPORT_BLOCKED_TEAM_SKILL` |
| `importSkill` | `options.targetDirectory?` | 指定ある場合: `typeof !== "string"` → NG / `=== ""` → NG / `.trim() === ""` → NG。省略時はデフォルトディレクトリを使用する。 | なし                                                                                                                 | `VALIDATION_ERROR`                                                  |
| `exportSkill` | `skillId: string`          | `typeof skillId !== "string"` → NG / `skillId === ""` → NG / `skillId.trim() === ""` → NG                                    | `skillId` に対応するスキルが存在すること                                                                             | `VALIDATION_ERROR`, `NOT_FOUND_ERROR`, `EXPORT_LOCK_ERROR`          |
| `forkSkill`   | `skillId: string`          | `typeof skillId !== "string"` → NG / `skillId === ""` → NG / `skillId.trim() === ""` → NG                                    | fork 権限（visibility === "public" または team かつ `shared_with` に含まれる、または自分のローカルスキル）を持つこと | `VALIDATION_ERROR`, `NOT_FOUND_ERROR`, `FORK_NOT_ALLOWED`           |
| `forkSkill`   | `newName: string`          | `typeof newName !== "string"` → NG / `newName === ""` → NG / `newName.trim() === ""` → NG                                    | 既存スキルと同名の場合は自動サフィックス付与（エラーではなく自動補正）                                               | `VALIDATION_ERROR`                                                  |
| `shareSkill`  | `skillId: string`          | `typeof skillId !== "string"` → NG / `skillId === ""` → NG / `skillId.trim() === ""` → NG                                    | 操作主体が作成者（author）であること                                                                                 | `VALIDATION_ERROR`, `NOT_FOUND_ERROR`                               |
| `shareSkill`  | `teamId: string`           | `typeof teamId !== "string"` → NG / `teamId === ""` → NG / `teamId.trim() === ""` → NG                                       | `teamId` に対応するチームが存在すること                                                                              | `VALIDATION_ERROR`                                                  |
| `shareSkill`  | `options.expiresIn`        | `typeof options.expiresIn !== "number"` → NG / `options.expiresIn <= 0` → NG / `!Number.isInteger(options.expiresIn)` → NG   | expiresIn は正の整数（秒単位）であること                                                                             | `VALIDATION_ERROR`                                                  |

---

## 7. 競合ケース対応

### 7.1 import: 同名スキルが既存の場合

| ケース                             | 対応                                                                                                                                                                                                                        |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| インポート先に同名スキルが存在する | UI 側で「同名のスキル {name} が既存します。上書きしますか？」確認ダイアログを表示する。ユーザーが「上書き」を選択した場合のみインポートを続行する。「キャンセル」の場合は処理を中断する。                                   |
| インポート済みスキルの再公開要求   | `importedVersion` フィールドが存在する場合は公開操作をブロックする（`PublishCheckService` が担当。本サービスのスコープ外）。エラーメッセージ: 「インポートしたスキルは直接公開できません。fork してから公開してください」。 |

### 7.2 export: エクスポート中の更新競合

| ケース                                           | 対応                                                                                                                                                                                                                                |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| エクスポート中にスキルの編集・保存が行われた場合 | エクスポート開始時にスキル ID をキーとしたロックを取得する。ロック中の編集操作はブロックし「エクスポート完了後に編集してください」を表示する。エクスポート完了後にロックを解放する。ロック取得失敗時は `EXPORT_LOCK_ERROR` を返す。 |

### 7.3 fork: 同名スキルが既存の場合

| ケース                       | 対応                                                                                                                                                                                                      |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| newName が既存スキル名と重複 | エラーではなく自動サフィックス付与で解決する。付与ルール: `{newName}_fork_2` → `_fork_3` → … と一意になるまでインクリメントする。自動付与後の名前を UI に提示し、ユーザーが確認した後に fork を実行する。 |

### 7.4 share: 有効期限切れ・共有解除

| ケース                                   | 対応                                                                                                                                                                                            |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 有効期限切れのリンクへのアクセス         | `SHARE_EXPIRED` エラーコードを返す。定期クリーンアップジョブ（1 日 1 回）で期限切れリンクを物理削除する。                                                                                       |
| 共有解除（`shared_with` 全削除）         | `shared_with.length === 0` になった場合、`visibility` を `"team"` から `"local"` に自動変更する。既存の共有リンク（JWT）は即時失効させる（JWT 失効リストへの追加、または短い TTL 設定で対応）。 |
| ローカルにインポート済みのコピーへの影響 | 共有解除はインポート済みのコピー（`visibility="local"`）には影響しない。コピーはそのままローカルスキルとして残存する。                                                                          |

---

## 8. DI 境界配置テーブル

| 型名                              | 配置先                                                                    | 根拠（phase-2-design.md DI 境界判断フロー準拠）                                |
| --------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `ImportOptions`                   | `packages/shared/src/types/skill-distribution.ts`                         | Main↔Renderer レイヤー間で共有するため `packages/shared` に配置する            |
| `ImportResult`                    | `packages/shared/src/types/skill-distribution.ts`                         | 同上                                                                           |
| `ExportOptions`                   | `packages/shared/src/types/skill-distribution.ts`                         | 同上                                                                           |
| `ExportPackage`                   | `packages/shared/src/types/skill-distribution.ts`                         | 同上                                                                           |
| `ForkResult`                      | `packages/shared/src/types/skill-distribution.ts`                         | 同上                                                                           |
| `ShareOptions`                    | `packages/shared/src/types/skill-distribution.ts`                         | 同上                                                                           |
| `ShareLink`                       | `packages/shared/src/types/skill-distribution.ts`                         | 同上                                                                           |
| `SkillDistributionService`        | `packages/shared/src/types/skill-distribution.ts`                         | レイヤー跨ぎの参照（Main サービス実装 + テストモック + Preload 型定義で使用）  |
| `SKILL_DISTRIBUTION_CHANNELS`     | `packages/shared/src/constants/ipc-channels.ts`                           | `SkillRegistryService` の `SKILL_PUBLISHING_CHANNELS` と同一ファイルに追加する |
| `SKILL_DISTRIBUTION_ERROR_CODES`  | `packages/shared/src/types/skill-distribution.ts`                         | Main・Renderer 両側でエラーコード参照が必要                                    |
| `IpcResponse<T>`                  | `packages/shared/src/types/ipc-response.ts`（既存または新規）             | 全 IPC チャンネルで共有するため `packages/shared` に配置する                   |
| `DefaultSkillDistributionService` | `apps/desktop/src/main/services/skill/DefaultSkillDistributionService.ts` | 具象クラスのため Main Process のみが使用する。`packages/shared` には配置しない |
| エクスポートロック内部状態        | `DefaultSkillDistributionService` と同ファイル内                          | 具象クラスのみが使用する内部型のため同ファイル内に定義する                     |

### IPC ハンドラ依存方向の確認（P61 準拠）

```
registerSkillDistributionHandlers(distributionService: SkillDistributionService)
                                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                                         インターフェース（Port）に依存する
                                                         具象クラス DefaultSkillDistributionService には依存しない
```

---

## 9. Phase 1 参照トレーサビリティ

本設計書の各設計判断が Phase 1 のどの要件・受入基準に対応するかを示す。

| 本設計書のセクション / 型 / フロー                                                 | Phase 1 参照先                                             | 対応する要件・受入基準                                                                                                      |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `ImportOptions.autoResolveDependencies`                                            | `distribution-alignment.md` § 1.1 依存解決                 | 依存スキルが未インストールの場合は一括インストール確認ダイアログを表示する                                                  |
| `ImportResult.importedAt`（ISO 8601）                                              | `distribution-alignment.md` § 1.1 実行後の状態変化         | `importedVersion`: インポート時点のバージョン文字列をローカルメタデータに記録する                                           |
| `ImportResult.resolvedDependencies`                                                | `distribution-alignment.md` § 3.1 依存解決アルゴリズム     | 解決済み依存スキル一覧を返す                                                                                                |
| `ExportOptions.format: "skill-package"`                                            | `distribution-alignment.md` § 1.2 出力形式                 | ファイル名: `{skill-name}@{version}.skillpkg`（JSON 形式の zip アーカイブ）                                                 |
| `ExportPackage.checksum`（SHA-256）                                                | `skill-center-registration.md`                             | パッケージの完全性検証のためチェックサムを付与する                                                                          |
| `ExportPackage.size`                                                               | `distribution-alignment.md` § 1.2 出力形式                 | ファイルサイズ情報をパッケージ情報に含める                                                                                  |
| 除外フィールド（visibility / shared_with / importedVersion）                       | `distribution-alignment.md` § 1.2 パッケージ包含フィールド | `visibility` / `shared_with` / `importedVersion` はパッケージから除外する                                                   |
| `ForkResult.parentRef`                                                             | `distribution-alignment.md` § 1.3 実行後メタデータ         | `forkedFrom.skillId`: fork 元スキルの一意識別子を記録する                                                                   |
| `ForkResult.forkedAt`（ISO 8601）                                                  | `distribution-alignment.md` § 4.1 SkillForkMetadata        | `SkillForkMetadata.forkedAt: string`（ISO 8601 形式）と整合する                                                             |
| fork フロー: バージョン "0.1.0" リセット                                           | `distribution-alignment.md` § 1.3 実行後の状態変化         | fork 後スキルは独立したスキルとして扱われる（バージョン体系も独立）                                                         |
| fork フロー: `SkillSafetyContract` 引き継ぎなし                                    | `distribution-alignment.md` § 1.3 安全性契約の引き継ぎなし | fork 後スキルを公開する場合は新規に `PublishEligibility` チェックを実行する                                                 |
| `ShareOptions.expiresIn`（正の整数・秒）                                           | `distribution-alignment.md` § 1.4 share 操作               | 共有リンク生成（有効期限付き JWT）                                                                                          |
| `ShareOptions.permissions`（read / read-write）                                    | `distribution-alignment.md` § 1.4 アクセス制御             | teamId ベースの権限管理に加え、操作権限（読み取り専用 / 読み書き）を設定する                                                |
| `ShareLink.teamId`                                                                 | `distribution-alignment.md` § 1.4 アクセス制御             | teamId を持つユーザーのみアクセス可能                                                                                       |
| `ShareLink.expiresAt`（ISO 8601）                                                  | `distribution-alignment.md` § 1.4 share 操作               | 有効期限を明示的に返し、UI での表示を可能にする                                                                             |
| `ShareLink.token`（JWT）                                                           | `distribution-alignment.md` § 1.4 アクセス制御             | teamId ベースの権限管理 → 共有リンク生成（有効期限付き JWT）                                                                |
| share フロー: `shared_with` 全削除 → `visibility="local"` 自動変更                 | `distribution-alignment.md` § 5.5 状態遷移                 | 全 `shared_with` を削除した場合、`visibility` を `"team"` から `"local"` に自動変更する                                     |
| 競合ケース 7.1: 同名スキル上書き確認                                               | `phase-2-design.md` バリデーションマトリクス               | `importSkill`: 同名スキル既存時 → 上書き確認                                                                                |
| 競合ケース 7.3: fork 同名サフィックス自動付与                                      | `phase-2-design.md` バリデーションマトリクス               | `forkSkill`: 同名 fork 既存時 → サフィックス付与                                                                            |
| `SKILL_DISTRIBUTION_CHANNELS` 定数                                                 | `phase-2-design.md` IPC ハンドラの依存先確認               | チャンネル名は `IPC_CHANNELS` 定数で参照する（P27 対策）                                                                    |
| `registerSkillDistributionHandlers(distributionService: SkillDistributionService)` | `phase-2-design.md` DI 境界・P61 準拠                      | ハンドラ引数型はインターフェースであり、具象クラスを直接引数に取らない（P61 準拠）                                          |
| `IpcResponse<T>` wrapper                                                           | `phase-2-design.md` IPC レスポンス形式・P60 準拠           | 全 IPC チャンネルのレスポンスは `{ success: boolean, data/error }` wrapper で統一する（P60 準拠）                           |
| P42 準拠 3 段バリデーション（全文字列入力）                                        | `06-known-pitfalls.md#P42`                                 | 全文字列引数に `.trim() === ""` チェックを追加して 3 段バリデーション（型チェック → 空文字列 → トリム空文字列）を標準化する |
