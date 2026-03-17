# Skill Center フロー設計書

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| 文書       | Phase 2 - Task 3 成果物          |
| タスクID   | TASK-SKILL-LIFECYCLE-08          |
| 作成日     | 2026-03-17                       |
| 受入基準   | AC-4                             |
| 対象フロー | 登録・更新・公開停止             |
| lane構成   | UI / IPC / Main（3 lane に制限） |

---

## 1. 概要

本設計書は Skill Center への登録・更新・公開停止の3つのライフサイクルフローを定義する。

- **登録フロー**: ローカルスキルを `public` visibility に昇格し Skill Center カタログへ掲載する
- **更新フロー**: 既存公開スキルの新バージョンをアップロードし、互換性チェック結果に応じて自動/手動承認で公開する
- **公開停止フロー**: deprecation notice 掲載（30 日 grace period）を経て removal を実行する。緊急停止は grace period なしで即時削除する

各フローは 3 lane（UI / IPC / Main）のシーケンス図で記述し、IPC チャンネルは `P60` 準拠の `IpcResponse<T>` wrapper で統一する。ハンドラ登録関数の引数はインターフェース型とし具象クラスへの依存を排除する（`P61` 準拠）。

---

## 2. 型定義

### 2.1 基本型

```typescript
/** スキルの公開レベル */
type SkillVisibility = "local" | "team" | "public";

/** semver 準拠バージョン文字列（例: "1.2.3"） */
type SemverString = string;
```

### 2.2 SkillRegistryService インターフェース関連型

```typescript
/**
 * register() の戻り値。
 * IPC レスポンスは IpcResponse<RegisterResult> でラップされる（P60 準拠）。
 */
interface RegisterResult {
  /** 登録されたスキルの一意識別子 */
  skillId: string;
  /** Skill Center カタログ掲載完了日時（ISO 8601） */
  registeredAt: string;
  /** 登録後の visibility（通常は "public"） */
  visibility: SkillVisibility;
}

/**
 * update() の newVersion 引数型。
 * 新バージョンのメタデータと変更履歴を保持する。
 */
interface SkillVersion {
  /** 新バージョン番号（semver 準拠、例: "2.0.0"） */
  version: SemverString;
  /** 変更内容の説明（1 文字以上） */
  changelog: string;
  /** 更新後のメタデータ */
  metadata: SkillPublishingMetadata;
}

/**
 * update() の戻り値。
 */
interface UpdateResult {
  /** 更新対象スキルの ID */
  skillId: string;
  /** 更新前のバージョン（semver） */
  oldVersion: SemverString;
  /** 更新後のバージョン（semver） */
  newVersion: SemverString;
  /** 互換性チェック結果 */
  compatibilityResult: CompatibilityCheckResult;
  /** 更新完了日時（ISO 8601） */
  updatedAt: string;
}

/**
 * deprecate() の notice 引数型。
 */
interface DeprecationNotice {
  /**
   * 公開停止の理由。
   * 1 文字以上 50 文字以下（P42 準拠）。
   * 条件: reason.trim().length >= 1 && reason.trim().length <= 50
   */
  reason: string;
  /** 移行先の推奨スキル ID（任意） */
  alternativeSkillId?: string;
  /**
   * grace period の日数（デフォルト: 30）。
   * emergency 停止の場合は 0 を設定する。
   */
  gracePeriodDays: number;
}

/**
 * remove() のオプション引数。
 */
interface RemoveOptions {
  /** true の場合、30 日 grace period チェックをスキップ（緊急停止） */
  emergency?: boolean;
}
```

### 2.3 SkillRegistryService インターフェース

```typescript
/**
 * Skill Center ライフサイクルを管理するサービスのインターフェース。
 * IPC ハンドラ登録関数 registerSkillPublishingHandlers は
 * このインターフェース型を引数に取る（P61 準拠 / DIP 遵守）。
 */
interface SkillRegistryService {
  /**
   * スキルを Skill Center に登録する。
   * visibility が "public" の場合、license は必須。
   * バリデーション失敗時は IpcResponse.success = false を返す。
   */
  register(metadata: SkillPublishingMetadata): Promise<RegisterResult>;

  /**
   * 既存スキルのメタデータ・バージョンを更新する。
   * breaking change がある場合は major バンプが必要。
   * 旧バージョンユーザーへの in-app 通知は本メソッド内で送信する。
   */
  update(skillId: string, newVersion: SkillVersion): Promise<UpdateResult>;

  /**
   * スキルを非推奨状態に移行し、grace period を開始する。
   * notice.reason は 1 文字以上 50 文字以下であること（P42 準拠）。
   * notice.gracePeriodDays のデフォルト値は 30。
   */
  deprecate(skillId: string, notice: DeprecationNotice): Promise<void>;

  /**
   * スキルを Skill Center カタログから完全削除する。
   * options.emergency !== true の場合: deprecate 完了後 30 日が経過していること。
   * options.emergency = true の場合: grace period チェックをスキップする。
   */
  remove(skillId: string, options?: RemoveOptions): Promise<void>;

  /**
   * 指定スキルに依存する上位スキルの ID 一覧を返す。
   * 推移的依存（transitive）も含む。
   */
  getDependents(skillId: string): Promise<string[]>;
}
```

### 2.4 IPC レスポンス wrapper 型（P60 準拠）

```typescript
/**
 * 全 skill:publishing:* チャンネルの統一レスポンス wrapper（P60 準拠）。
 * テスト側のアサーションは result.error.code で行う（result.code ではない）。
 */
type IpcResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };
```

---

## 3. 登録フロー

### 3.1 シーケンス図

```
[登録フロー: visibility を local → public に昇格する]

UI                          IPC                         Main
|                            |                            |
| -- (1) メタデータ入力 ---> |                            |
|    name, description,      |                            |
|    tags, license           |                            |
|                            |                            |
| -- (2) 登録リクエスト ---> |                            |
|    skill:publishing:register                            |
|                            | -- validate args --------> |
|                            |    P42: name.trim() !== "" |
|                            |    P42: license.trim() !== "" (public 時)|
|                            |                            |
|                            | -- SkillRegistryService -->|
|                            |    .register(metadata)     |
|                            |                            |
|                            |     [Step 2: バリデーション]|
|                            |                            | -- スキーマ検証
|                            |                            |    (必須フィールド充足確認)
|                            |                            |
|                            |                            | -- 安全性チェック
|                            |                            |    (SafetyGate 結果参照)
|                            |                            |
|                            |     [バリデーション失敗]   |
|                            | <-- { success: false,      |
|                            |      error: {              |
|                            |        code: "VALIDATION_ERROR",
|                            |        message: "..."      |
|                            |      }                     |
|                            |    }                       |
| <-- エラー表示 ----------- |                            |
|                            |                            |
|                            |     [バリデーション成功]   |
|                            | <-- { success: true,       |
|                            |      data: {               |
|                            |        previewReady: true, |
|                            |        metadata: {...}     |
|                            |      }                     |
|                            |    }                       |
|                            |                            |
| <-- (3) プレビュー画面表示 |                            |
|    メタデータ確認 UI 表示   |                            |
|                            |                            |
| -- (4) 公開確定 ---------->|                            |
|    skill:publishing:confirm|                            |
|                            | -- confirmRegistration --> |
|                            |                            | -- visibility = "public" に遷移
|                            |                            | -- Skill Center カタログ掲載
|                            |                            | -- registeredAt = now() 記録
|                            |                            |
|                            | <-- { success: true,       |
|                            |      data: {               |
|                            |        skillId: "...",     |
|                            |        registeredAt: "ISO",|
|                            |        visibility: "public"|
|                            |      }                     |
|                            |    }                       |
| <-- (5) 完了表示 --------- |                            |

[End]
```

### 3.2 各 Step 詳細

#### Step 1: メタデータ入力

| フィールド  | 型       | 必須                  | バリデーション                                  |
| ----------- | -------- | --------------------- | ----------------------------------------------- |
| name        | string   | 必須                  | P42: `typeof === "string"` かつ `trim() !== ""` |
| description | string   | 必須                  | P42: `typeof === "string"` かつ `trim() !== ""` |
| tags        | string[] | 任意                  | 各要素が 1〜50 文字。最大 10 件                 |
| license     | string   | 必須（public 昇格時） | P42: `typeof === "string"` かつ `trim() !== ""` |

UI コンポーネントは `SkillPublishingForm` が担い、入力値をローカル状態で保持する。確定ボタン押下で `skill:publishing:register` チャンネルへ送信する。

#### Step 2: 自動バリデーション（Main プロセス）

Main プロセス内で以下を順番に実行する。

1. **IPC 引数バリデーション（P42 準拠）**: `metadata.name` の型チェック → 空文字列チェック → `trim()` 後空文字列チェックの 3 段バリデーション。`visibility === "public"` の場合は `metadata.license` にも同様の 3 段バリデーションを適用する。
2. **スキーマ検証**: 必須フィールドが全て入力済みかを確認。未入力フィールドは `missingFields` 配列に収集し `VALIDATION_ERROR` を返す。
3. **安全性チェック**: `SafetyGate` の結果（`SafetyGateResult`）を参照し、`overallGrade` が `critical` の場合は `SAFETY_GATE_BLOCKED` エラーを返す。

バリデーション失敗時はフローをここで停止し、`IpcResponse.success = false` を返す。成功時のみ Step 3 へ進む。

#### Step 3: プレビュー確認画面

UI は `SkillPublishingPreview` コンポーネントを表示する。表示内容:

- 入力済みメタデータの読み取り専用表示
- 公開後の Skill Center カード表示プレビュー
- 「戻って修正」ボタン（Step 1 に戻る）
- 「公開する」ボタン（Step 4 へ進む）

#### Step 4: 公開確定

`skill:publishing:confirm` チャンネルへ確定リクエストを送信する。Main プロセスは:

1. `visibility` フィールドを `"public"` に変更する。
2. Skill Center カタログへのエントリを作成する（`catalogEntry` テーブルへの登録）。
3. `registeredAt` に現在時刻（ISO 8601）を設定する。
4. `RegisterResult`（`skillId`, `registeredAt`, `visibility`）を返す。

#### Step 5: 完了表示

UI は `RegisterResult.registeredAt` を含む完了通知を表示する。

---

## 4. 更新フロー

### 4.1 シーケンス図

```
[更新フロー: 既存公開スキルの新バージョンをアップロード]

UI                          IPC                         Main
|                            |                            |
| -- 新バージョン選択 ------> |                           |
|    + 更新内容入力           |                           |
|    (newVersion, changelog, metadata)                   |
|                            |                            |
| -- skill:publishing:update>|                            |
|                            | -- validate args --------> |
|                            |    P42: skillId.trim() !== ""|
|                            |    P42: newVersion.version.trim() !== ""|
|                            |    semver 正規表現準拠チェック|
|                            |                            |
|                            | -- SkillRegistryService -->|
|                            |    .update(skillId,        |
|                            |      newVersion)           |
|                            |                            |
|                            |     [互換性チェック実行]   |
|                            |                            | -- CompatibilityChecker.check()
|                            |                            |    (旧スキーマ vs 新スキーマ)
|                            |                            |
|                            |     [compatible / minor-incompatible の場合]
|                            |                            | -- 自動承認
|                            |                            | -- 新バージョン公開
|                            |                            | -- updatedAt = now() 記録
|                            |                            |
|                            | <-- { success: true,       |
|                            |      data: {               |
|                            |        skillId: "...",     |
|                            |        oldVersion: "1.0.0",|
|                            |        newVersion: "1.1.0",|
|                            |        compatibilityResult: {...},
|                            |        updatedAt: "ISO"    |
|                            |      }                     |
|                            |    }                       |
| <-- 公開完了通知 --------- |                            |
|                            |                            |
|                            |     [breaking の場合]      |
|                            |                            | -- major バンプ済み確認
|                            |                            |
|                            |     [major バンプ未実施]   |
|                            | <-- { success: false,      |
|                            |      error: {              |
|                            |        code: "BREAKING_CHANGE_ERROR",
|                            |        message: "major バンプが必要"
|                            |      }                     |
|                            |    }                       |
| <-- breaking change 警告   |                            |
|    + バージョン修正を促す   |                            |
|                            |                            |
|                            |     [major バンプ済み]     |
|                            |                            | -- 手動承認キュー登録
|                            |                            | -- 旧バージョンユーザーへ
|                            |                            |    in-app 通知送信
|                            |                            | -- updatedAt = now() 記録
|                            | <-- { success: true,       |
|                            |      data: {               |
|                            |        skillId: "...",     |
|                            |        oldVersion: "1.0.0",|
|                            |        newVersion: "2.0.0",|
|                            |        compatibilityResult: {level: "breaking", ...},
|                            |        updatedAt: "ISO"    |
|                            |      }                     |
|                            |    }                       |
| <-- 承認待ち状態表示 ------ |                            |

[End]
```

### 4.2 互換性チェック連携

互換性チェックは `CompatibilityChecker`（タスク2 設計書参照）の結果を受け取り、以下のルールで更新可否を判定する。

| CompatibilityLevel   | 判定             | 処理                                                                                                                        |
| -------------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `compatible`         | 自動承認         | 新バージョンを即時公開                                                                                                      |
| `minor-incompatible` | 自動承認         | 新バージョンを即時公開。警告メッセージをカタログに付与                                                                      |
| `breaking`           | major バンプ確認 | `newVersion.major > currentVersion.major` であれば手動承認キューへ登録。未満の場合は `BREAKING_CHANGE_ERROR` を返しブロック |

#### breaking change 時の in-app 通知

`breaking` と判定され、かつ `major` バンプ済みの場合、Main プロセスは以下を実行する:

1. `getDependents(skillId)` で旧バージョンを使用中のスキル一覧を取得する。
2. 各依存スキルのオーナーに対し `in-app 通知`（`Notification` テーブルへの INSERT）を送信する。
3. 通知内容: `"スキル <name> の v<X> は破壊的変更を含む新バージョン v<Y> がリリース予定です。依存スキルの更新をご検討ください。"`

---

## 5. 公開停止フロー

### 5.1 通常停止シーケンス

```
[通常停止フロー: 30 日 grace period 付き段階的停止]

UI                          IPC                         Main
|                            |                            |
| -- 公開停止申請 ---------->|                            |
|    (reason, gracePeriodDays=30)                        |
|                            |                            |
| -- skill:publishing:deprecate                          |
|                            | -- validate args --------> |
|                            |    P42: skillId.trim() !== ""|
|                            |    notice.reason: 1-50 文字|
|                            |    notice.gracePeriodDays >= 0|
|                            |                            |
|                            |     [依存スキル影響分析]   |
|                            | -- SkillRegistryService -->|
|                            |    .getDependents(skillId) |
|                            |                            |
|                            | <-- dependentSkills[]      |
|                            |                            |
|                            | <-- { success: true,       |
|                            |      data: {               |
|                            |        dependents: [...],  |
|                            |        gracePeriodDays: 30 |
|                            |      }                     |
|                            |    }                       |
|                            |                            |
| <-- 依存スキル一覧表示 ---- |                            |
|    (影響を受けるスキルを確認)                          |
|                            |                            |
| -- 停止確定 ------------> |                             |
|    skill:publishing:deprecate:confirm                  |
|                            |                            |
|                            | -- .deprecate(skillId,    |
|                            |      notice) -----------> |
|                            |                            | -- deprecation notice 掲載
|                            |                            |    (カタログに deprecated バッジ)
|                            |                            | -- grace period 開始
|                            |                            |    (deprecatedAt = now())
|                            |                            | -- 依存スキルオーナーへ通知
|                            |                            |
|                            | <-- { success: true,       |
|                            |      data: {               |
|                            |        status: "deprecated",|
|                            |        removalScheduledAt: "YYYY-MM-DD"
|                            |      }                     |
|                            |    }                       |
| <-- 停止完了・スケジュール表示
|                            |                            |
|   [30 日後: grace period 終了]
|                            |                            |
| -- 削除実行 ------------> |                             |
|    skill:publishing:remove |                            |
|                            | -- validate args --------> |
|                            |    P42: skillId.trim() !== ""|
|                            |    deprecate 完了後 30 日経過確認
|                            |                            |
|                            | -- .remove(skillId) -----> |
|                            |                            | -- カタログから完全削除
|                            |                            |
|                            | <-- { success: true,       |
|                            |      data: {               |
|                            |        removed: true       |
|                            |      }                     |
|                            |    }                       |
| <-- 削除完了通知 --------- |                            |

[End]
```

### 5.2 緊急停止シーケンス

セキュリティインシデント等で grace period を省略する必要がある場合のフロー。`security-operations.md` の P1/P2 インシデントレベルと接続する。

```
[緊急停止フロー: grace period なし即時削除]

UI                          IPC                         Main
|                            |                            |
| -- 緊急停止申請 ---------->|                            |
|    (reason, gracePeriodDays=0, emergency=true)         |
|                            |                            |
| -- skill:publishing:remove |                            |
|    { emergency: true }     |                            |
|                            | -- validate args --------> |
|                            |    P42: skillId.trim() !== ""|
|                            |    emergency = true の場合: |
|                            |    grace period チェックをスキップ
|                            |                            |
|                            | -- .remove(skillId,       |
|                            |    { emergency: true }) -->|
|                            |                            | -- 即時カタログ削除
|                            |                            | -- 依存スキルへ即時通知
|                            |                            |    (緊急停止通知)
|                            |                            |
|                            | <-- { success: true,       |
|                            |      data: {               |
|                            |        removed: true,      |
|                            |        emergency: true     |
|                            |      }                     |
|                            |    }                       |
| <-- 即時削除完了通知 ------ |                            |

[End]
```

緊急停止は管理者権限を持つユーザーのみ実行可能。`emergency` フラグが `true` の場合、Main プロセスは `deprecatedAt` チェックをスキップし即時削除する。

### 5.3 依存スキル影響分析

公開停止申請時（確定前）に UI へ依存スキル一覧を提示する。

#### 表示情報

| 項目             | 内容                                           |
| ---------------- | ---------------------------------------------- |
| 依存スキル名     | 取り下げ対象スキルに依存するスキルの名前       |
| 依存元バージョン | 使用中のバージョン（semver range）             |
| オーナー情報     | 依存スキルのオーナーユーザー名                 |
| 影響度           | `direct`（直接依存）/ `transitive`（間接依存） |

#### 処理フロー

1. `getDependents(skillId)` を呼び出し、依存スキル ID の配列を取得する。
2. 各依存スキルの詳細情報（名前・バージョン・オーナー）を取得する。
3. 推移的依存（依存の依存）を BFS で探索し、影響範囲全体を返す。
4. UI は「依存スキルが N 件あります。停止すると以下のスキルが影響を受けます」と表示する。
5. ユーザーが「影響を確認した上で停止する」を確認した場合のみ停止確定を受け付ける。

#### grace period 取り消し

grace period 経過前に停止を取り消すことができる。取り消し操作は `skill:publishing:register:confirm` チャンネルを再度呼び出す（visibility を `"deprecated"` から `"public"` に戻す）。

---

## 6. IPC チャンネル定義

### 6.1 チャンネル定数

```typescript
/**
 * skill:publishing:* チャンネル名定数（ハードコード文字列禁止・P27 準拠）。
 */
const SKILL_PUBLISHING_CHANNELS = {
  /** スキル登録リクエスト（バリデーション + プレビューデータ取得） */
  REGISTER: "skill:publishing:register",
  /** プレビュー確認後の公開確定 */
  CONFIRM: "skill:publishing:confirm",
  /** バージョン更新（互換性チェック含む） */
  UPDATE: "skill:publishing:update",
  /** 公開停止申請（依存スキル影響分析 + 停止実行） */
  DEPRECATE: "skill:publishing:deprecate",
  /** カタログ削除（通常: grace period 経過後 / 緊急: emergency=true） */
  REMOVE: "skill:publishing:remove",
  /** 依存スキル一覧取得 */
  GET_DEPENDENTS: "skill:publishing:get-dependents",
  /** 互換性チェック（更新前の事前チェック用） */
  CHECK_COMPATIBILITY: "skill:publishing:check-compatibility",
} as const;
```

### 6.2 チャンネル一覧

| チャンネル名                           | 方向      | 処理                                                    | 引数型                                           | 戻り値型                                                                    |
| -------------------------------------- | --------- | ------------------------------------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------- |
| `skill:publishing:register`            | UI → Main | スキル登録リクエスト（バリデーション + プレビュー取得） | `SkillPublishingMetadata`                        | `IpcResponse<{ previewReady: boolean; metadata: SkillPublishingMetadata }>` |
| `skill:publishing:confirm`             | UI → Main | プレビュー確認後の公開確定                              | `{ skillId: string }`                            | `IpcResponse<RegisterResult>`                                               |
| `skill:publishing:update`              | UI → Main | バージョン更新（互換性チェック含む）                    | `{ skillId: string; newVersion: SkillVersion }`  | `IpcResponse<UpdateResult>`                                                 |
| `skill:publishing:deprecate`           | UI → Main | 公開停止申請（影響分析 + 停止）                         | `{ skillId: string; notice: DeprecationNotice }` | `IpcResponse<{ status: "deprecated"; removalScheduledAt: string }>`         |
| `skill:publishing:remove`              | UI → Main | カタログ削除                                            | `{ skillId: string; options?: RemoveOptions }`   | `IpcResponse<{ removed: boolean; emergency?: boolean }>`                    |
| `skill:publishing:get-dependents`      | UI → Main | 依存スキル一覧取得                                      | `{ skillId: string }`                            | `IpcResponse<{ dependents: string[] }>`                                     |
| `skill:publishing:check-compatibility` | UI → Main | 互換性チェック（更新前事前確認）                        | `{ skillId: string; newVersion: SkillVersion }`  | `IpcResponse<CompatibilityCheckResult>`                                     |

### 6.3 エラーコード一覧

| エラーコード              | 発生チャンネル                                   | 意味                                             |
| ------------------------- | ------------------------------------------------ | ------------------------------------------------ |
| `VALIDATION_ERROR`        | register / confirm / update / deprecate / remove | 引数バリデーション失敗（空文字・型不一致）       |
| `INVALID_SEMVER_ERROR`    | update / check-compatibility                     | newVersion が semver 形式に準拠していない        |
| `BREAKING_CHANGE_ERROR`   | update                                           | breaking change があるが major バンプが未実施    |
| `SAFETY_GATE_BLOCKED`     | register                                         | SafetyGate による公開ブロック（critical リスク） |
| `REMOVAL_TOO_EARLY_ERROR` | remove                                           | deprecate 後 30 日が経過していない               |
| `NOT_FOUND_ERROR`         | update / deprecate / remove / get-dependents     | 指定 skillId のスキルが存在しない                |
| `INTERNAL_ERROR`          | 全チャンネル                                     | 予期しない内部エラー                             |

---

## 7. コマンドバリデーションマトリクス

各メソッドで実施する P42 準拠（3 段バリデーション: 型チェック → 空文字列 → trim 後空文字列）のバリデーション。

| メソッド    | 対象引数                 | バリデーション内容                                                                                     | エラーコード              |
| ----------- | ------------------------ | ------------------------------------------------------------------------------------------------------ | ------------------------- |
| `register`  | `metadata.name`          | `typeof metadata.name === "string"` かつ `metadata.name !== ""` かつ `metadata.name.trim() !== ""`     | `VALIDATION_ERROR`        |
| `register`  | `metadata.license`       | visibility が `"public"` の場合: `typeof === "string"` かつ `!== ""` かつ `.trim() !== ""`             | `VALIDATION_ERROR`        |
| `update`    | `skillId`                | `typeof skillId === "string"` かつ `skillId !== ""` かつ `skillId.trim() !== ""`                       | `VALIDATION_ERROR`        |
| `update`    | `newVersion.version`     | `typeof === "string"` かつ `!== ""` かつ `.trim() !== ""` かつ semver 正規表現 `/^\d+\.\d+\.\d+/` 準拠 | `INVALID_SEMVER_ERROR`    |
| `update`    | 互換性チェック結果       | `level === "breaking"` の場合: `newVersion.major > currentVersion.major` であること                    | `BREAKING_CHANGE_ERROR`   |
| `deprecate` | `skillId`                | `typeof skillId === "string"` かつ `skillId !== ""` かつ `skillId.trim() !== ""`                       | `VALIDATION_ERROR`        |
| `deprecate` | `notice.reason`          | `typeof === "string"` かつ `reason.trim().length >= 1` かつ `reason.trim().length <= 50`               | `VALIDATION_ERROR`        |
| `remove`    | `skillId`                | `typeof skillId === "string"` かつ `skillId !== ""` かつ `skillId.trim() !== ""`                       | `VALIDATION_ERROR`        |
| `remove`    | grace period（非緊急時） | `options?.emergency !== true` の場合: `deprecatedAt + 30 days <= now()`                                | `REMOVAL_TOO_EARLY_ERROR` |

---

## 8. DI 境界配置テーブル

型の配置先を以下の判断フローで決定する（phase-2-design.md の DI 境界の型配置判断テーブル準拠）。

| 型名                        | 配置先                                          | 理由                                                                  |
| --------------------------- | ----------------------------------------------- | --------------------------------------------------------------------- |
| `SkillRegistryService`      | `apps/desktop/src/main/ports/`                  | Port インターフェース。具象クラスは同ディレクトリの実装ファイルに配置 |
| `SkillPublishingMetadata`   | `packages/shared/src/skill/types.ts`            | Renderer（UI フォーム）と Main（サービス）の両方で参照するため        |
| `RegisterResult`            | `packages/shared/src/skill/types.ts`            | IPC レスポンス data 型として Renderer が参照するため                  |
| `UpdateResult`              | `packages/shared/src/skill/types.ts`            | IPC レスポンス data 型として Renderer が参照するため                  |
| `DeprecationNotice`         | `packages/shared/src/skill/types.ts`            | IPC 引数型として Renderer が参照するため                              |
| `SkillVersion`              | `packages/shared/src/skill/types.ts`            | IPC 引数型として Renderer が参照するため                              |
| `RemoveOptions`             | `packages/shared/src/skill/types.ts`            | IPC 引数型として Renderer が参照するため                              |
| `SkillVisibility`           | `packages/shared/src/skill/types.ts`            | Renderer と Main で共有。Store の状態型としても使用                   |
| `CompatibilityCheckResult`  | `apps/desktop/src/main/ports/`（Port と同階層） | Registry と Distribution の両サービスが参照。Main 内部で完結する      |
| `IpcResponse<T>`            | `packages/shared/src/ipc/types.ts`              | 全 IPC チャンネルで使用。Renderer・Preload・Main の全レイヤー共有     |
| `SKILL_PUBLISHING_CHANNELS` | `packages/shared/src/ipc/channels.ts`           | Preload（contextBridge 登録）と Main（ハンドラ登録）で参照するため    |

### 8.1 IPC ハンドラ登録関数（P61 準拠）

```typescript
/**
 * IPC ハンドラ登録関数。
 * 引数型は SkillRegistryService と CompatibilityChecker のインターフェースであり、
 * 具象クラスを直接取らない（P61 準拠 / DIP 遵守）。
 * これによりテスト時にモックを注入可能。
 */
function registerSkillPublishingHandlers(
  registryService: SkillRegistryService,
  compatibilityChecker: CompatibilityChecker,
): void {
  ipcMain.handle(
    SKILL_PUBLISHING_CHANNELS.REGISTER,
    async (
      event,
      metadata: SkillPublishingMetadata,
    ): Promise<IpcResponse<unknown>> => {
      // P42 準拠: 3 段バリデーション
      if (
        typeof metadata?.name !== "string" ||
        metadata.name === "" ||
        metadata.name.trim() === ""
      ) {
        return {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "name は必須です" },
        };
      }
      // ... 以降の実装は Phase 5 で行う
    },
  );

  ipcMain.handle(
    SKILL_PUBLISHING_CHANNELS.CHECK_COMPATIBILITY,
    async (
      event,
      args: { skillId: string; newVersion: SkillVersion },
    ): Promise<IpcResponse<CompatibilityCheckResult>> => {
      // P42 準拠: skillId 3 段バリデーション
      if (
        typeof args?.skillId !== "string" ||
        args.skillId === "" ||
        args.skillId.trim() === ""
      ) {
        return {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "skillId は必須です" },
        };
      }
      // ... 以降の実装は Phase 5 で行う
    },
  );
}
```

---

## 9. Phase 1 参照トレーサビリティ

本設計書の各要素が Phase 1 の受入基準（AC-1〜AC-4）および実行タスクのどの記述に対応するかを記録する。

| 本設計書の要素                         | Phase 1 受入基準 | Phase 1 タスク参照箇所                                                                                                      |
| -------------------------------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `SkillRegistryService.register()`      | AC-4             | Task 4 Step 2「登録フロー（新規公開）を定義する」Step 1〜6                                                                  |
| `SkillRegistryService.update()`        | AC-4             | Task 4 Step 3「更新フロー（新バージョン公開）を定義する」Step 1〜5                                                          |
| `SkillRegistryService.deprecate()`     | AC-4             | Task 4 Step 4「取り下げフロー」deprecation セクション                                                                       |
| `SkillRegistryService.remove()`        | AC-4             | Task 4 Step 4「取り下げフロー」removal セクション・緊急取り下げセクション                                                   |
| `SkillRegistryService.getDependents()` | AC-4             | Task 4 Step 4「インポート済みユーザー数：N人を表示」                                                                        |
| `DeprecationNotice.gracePeriodDays`    | AC-4             | Task 4 Step 4「取り下げ後30日が経過した後」`gracePeriodDays: number` として型定義                                           |
| `DeprecationNotice.alternativeSkillId` | AC-4             | Task 4 Step 4 取り下げフロー（代替スキル誘導の要件を設計レベルで拡張）                                                      |
| `RegisterResult.registeredAt`          | AC-4             | Task 4 Step 2 Step 6「Skill Center カタログへの反映を行う」登録日時の記録                                                   |
| `UpdateResult.oldVersion / newVersion` | AC-2             | Task 2 semver ルール「major/minor/patch バージョン増加」バージョン遷移の記録                                                |
| `UpdateResult.compatibilityResult`     | AC-2             | Task 2「schema 互換性チェック仕様」`CompatibilityCheckResult` 型との接続                                                    |
| breaking change 時の手動承認           | AC-2             | Task 2「`major` バージョン増加なしに breaking change を含む場合、公開操作をブロック」                                       |
| 30 日 grace period                     | AC-4             | Task 4 Step 4「削除（removal）: 取り下げ後30日が経過した後」                                                                |
| 緊急停止フロー（emergency = true）     | AC-4             | Task 4 Step 4「緊急取り下げ（emergency withdrawal）: セキュリティ脆弱性が発見された場合、30日猶予なしで即時非公開化」       |
| `SAFETY_GATE_BLOCKED` エラー           | AC-3             | Task 3「公開ブロック条件: `SkillSafetyContract.maxRiskLevel` が `critical` または `high` の場合、公開操作を完全にブロック」 |
| P42 準拠 3 段バリデーション            | AC-4             | Task 4 全フロー + 統合テスト連携セクション「テスト可能な条件式で記述する」                                                  |
| P60 準拠 IpcResponse wrapper           | AC-4             | phase-2-design.md「IPC レスポンス形式」セクション                                                                           |
| P61 準拠 インターフェース依存          | AC-4             | phase-2-design.md「IPC ハンドラの依存先確認」セクション                                                                     |
| `SKILL_PUBLISHING_CHANNELS` 定数       | AC-4             | phase-2-design.md「DI 境界の型配置判断」+ P27「Preload ハードコード文字列の見落とし」                                       |
| 依存スキル影響分析（BFS 探索）         | AC-4             | Task 4 Step 4「削除前に『インポート済みユーザー数：N人』を表示し確認を求める」                                              |
