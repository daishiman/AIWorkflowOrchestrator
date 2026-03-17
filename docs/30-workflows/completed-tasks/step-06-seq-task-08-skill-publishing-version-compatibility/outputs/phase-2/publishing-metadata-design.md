# 公開レベルメタデータ設計書

## メタ情報

| 項目      | 内容                                                                                      |
| --------- | ----------------------------------------------------------------------------------------- |
| 文書      | Phase 2 - Task 1 成果物                                                                   |
| タスクID  | TASK-SKILL-LIFECYCLE-08                                                                   |
| 作成日    | 2026-03-17                                                                                |
| 受入基準  | AC-1                                                                                      |
| 前提Phase | Phase 1（要件定義）`outputs/phase-1/publishing-levels.md`                                 |
| 設計対象  | `SkillVisibility` 型・`SkillPublishingMetadata` インターフェース・StateChart・UI 表示仕様 |
| 型配置先  | `packages/shared/src/skill/publishing-types.ts`                                           |

---

## 1. 概要

本設計書は、スキルの公開レベルを表す型定義および関連インターフェースを設計する。Phase 1（`outputs/phase-1/publishing-levels.md`）で定義した3段階の公開レベル（`local` / `team` / `public`）を TypeScript 型として形式化し、UI 表示仕様・状態遷移・DI 境界配置・Zustand スライス設計を確立する。

設計の基本方針:

- `SkillVisibility` と `SkillPublishingMetadata` は `packages/shared` に配置し、Main プロセスと Renderer プロセスの両方から参照可能にする（DIP 準拠）
- 公開レベルごとの必須フィールドをユニオン型で型安全に表現し、バリデーション層での実行時チェックと組み合わせて使用する
- P31 準拠の個別セレクタパターンで Zustand スライスを設計する
- P42 準拠の3段バリデーションを全文字列フィールドに適用する
- P60 準拠の IPC レスポンス形式（`{ success, data/error }` wrapper）を採用する
- P61 準拠で IPC ハンドラ引数はインターフェース型とし、具象クラスへの依存を持たない

---

## 2. 型定義

### 2.1 SkillVisibility 型定義

```typescript
/**
 * スキルの公開レベルを表す型。
 * - "local" : 作成者のローカル環境のみ。Skill Center に表示されない
 * - "team"  : 指定ワークスペースメンバーに表示・実行可能
 * - "public": Skill Center の公開カタログに掲載。全ユーザーが検索・インポート可能
 *
 * デフォルト値: "local"（新規作成スキルは必ず "local" から開始する）
 * ファイル配置: packages/shared/src/skill/publishing-types.ts
 */
type SkillVisibility = "local" | "team" | "public";
```

### 2.2 SkillPublishingMetadata インターフェース（識別ユニオン型）

Phase 1 要件（各公開レベルの必須/任意フィールド定義）を識別ユニオン型として表現する。各レベルを独立したインターフェースとして定義し、コンパイル時の型安全を確保する。

```typescript
/**
 * 全レベル共通の基底インターフェース。
 * 各サブ型に継承される共通フィールドを定義する。
 */
interface SkillPublishingMetadataBase {
  /** スキル名（全レベル必須）。1文字以上100文字以下の非空文字列 */
  name: string;

  /** スキルの説明（全レベル必須）。20文字以上500文字以下の非空文字列 */
  description: string;

  /**
   * バージョン番号（全レベル必須）。semver 形式（例: "1.2.3"）に準拠。
   * 正規表現: /^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?(\+[a-zA-Z0-9.]+)?$/
   */
  version: string;
}

/**
 * local レベルのメタデータ。
 * 作成者のローカル環境のみで使用する最小限のフィールドを持つ。
 */
interface LocalMetadata extends SkillPublishingMetadataBase {
  visibility: "local";
}

/**
 * team レベルのメタデータ。
 * local の全フィールドに加え、チーム共有に必要なフィールドを追加する。
 */
interface TeamMetadata extends SkillPublishingMetadataBase {
  visibility: "team";

  /** 作成者識別子（team レベルから必須）。ユーザーID 文字列。1〜200文字 */
  author: string;

  /**
   * タグ一覧（team レベルから必須）。
   * 各タグは1〜50文字の非空文字列。最大10件。要素の重複不可。
   */
  tags: string[];

  /** チームID（team レベル必須）。対象ワークスペースのチームID 文字列。1〜200文字 */
  teamId: string;
}

/**
 * public レベルのメタデータ。
 * team の全フィールドに加え、Skill Center 公開に必要なフィールドを追加する。
 */
interface PublicMetadata extends SkillPublishingMetadataBase {
  visibility: "public";

  /** 作成者識別子（public レベル必須）。ユーザーID 文字列。1〜200文字 */
  author: string;

  /**
   * タグ一覧（public レベル必須）。
   * 各タグは1〜50文字の非空文字列。最大10件。要素の重複不可。
   */
  tags: string[];

  /** チームID（public レベル必須）。対象ワークスペースのチームID 文字列。1〜200文字 */
  teamId: string;

  /**
   * ライセンス識別子（public レベル必須）。例: "MIT", "Apache-2.0", "CC-BY-4.0"。
   * 一度 public に昇格した後は変更不可（取り下げ後の再公開時にのみ変更可能）。
   * 1〜100文字の非空文字列。
   */
  license: string;

  /**
   * README 本文（public レベル必須）。Markdown 形式。
   * 100文字以上10000文字以下。
   */
  readme: string;

  /**
   * 変更履歴本文（public レベル必須）。Markdown 形式。
   * Keep a Changelog 形式を推奨。1文字以上5000文字以下。
   */
  changelog: string;

  /**
   * 動作保証する最小アプリバージョン（public レベル必須）。
   * semver 形式（例: "2.0.0"）。
   */
  minAppVersion: string;

  /**
   * スキルのソースコードリポジトリ URL（public レベル任意）。
   * https:// または http:// で始まる URL 文字列。
   */
  repository?: string;
}

/**
 * スキルの公開レベルに応じたメタデータを表す識別ユニオン型。
 * `visibility` フィールドで型を絞り込む（discriminated union）。
 *
 * ファイル配置: packages/shared/src/skill/publishing-types.ts
 *
 * @example
 * function handleMetadata(meta: SkillPublishingMetadata) {
 *   if (meta.visibility === "public") {
 *     // PublicMetadata として型が絞り込まれる
 *     console.log(meta.license); // コンパイルエラーなし
 *   }
 * }
 */
type SkillPublishingMetadata = LocalMetadata | TeamMetadata | PublicMetadata;
```

### 2.3 バリデーション関連型定義

```typescript
/**
 * 文字列フィールドの3段バリデーション（P42 準拠）。
 * 1段目: typeof チェック
 * 2段目: 空文字列チェック（=== ""）
 * 3段目: トリム後の空文字列チェック（.trim() === ""）
 */
function isValidString(value: unknown): value is string {
  return typeof value === "string" && value !== "" && value.trim() !== "";
}

/**
 * IPC レスポンス形式（P60 準拠: { success, data/error } wrapper）。
 * 全 IPC ハンドラは本形式でレスポンスを返す。
 */
type IpcResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };

/**
 * フィルタ状態の型定義（VisibilityFilter）。
 * "all" はフィルタなし（全件表示）を表す。
 */
type VisibilityFilter = SkillVisibility | "all";

/** フィルタの初期値 */
const DEFAULT_VISIBILITY_FILTER: VisibilityFilter = "all";
```

---

## 3. StateChart（状態遷移設計）

### 3.1 状態定義

| 状態 ID        | 状態名     | `visibility` 値 | 説明                                                                                             |
| -------------- | ---------- | --------------- | ------------------------------------------------------------------------------------------------ |
| `S_LOCAL`      | local      | `"local"`       | 作成者のローカル環境のみ。初期状態                                                               |
| `S_TEAM`       | team       | `"team"`        | チームメンバーに公開済み                                                                         |
| `S_PUBLIC`     | public     | `"public"`      | Skill Center に掲載済み                                                                          |
| `S_DEPRECATED` | deprecated | `"team"`        | 公開停止申請中（Skill Center から非表示。インポート済みユーザーには影響なし）                    |
| `S_REMOVED`    | removed    | -               | Skill Center から完全削除済み（`deprecated` から30日経過後に作成者が削除操作を実行した場合のみ） |

### 3.2 昇格遷移条件

#### `S_LOCAL` → `S_TEAM`（local から team へ昇格）

昇格ボタンが活性化される条件（全て AND 条件）:

| #   | 条件                                                            | テスト可能な条件式                                                                                                           |
| --- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 1   | `name` が非空文字列（1〜100文字）                               | `isValidString(name) && name.trim().length >= 1 && name.trim().length <= 100`                                                |
| 2   | `description` が20文字以上500文字以下                           | `isValidString(description) && description.trim().length >= 20`                                                              |
| 3   | `version` が semver 形式に一致                                  | `/^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?(\+[a-zA-Z0-9.]+)?$/.test(version)`                                                         |
| 4   | `author` が非空文字列（1〜200文字）                             | `isValidString(author)`                                                                                                      |
| 5   | `tags` が配列で1件以上・各タグが1〜50文字の非空文字列・最大10件 | `Array.isArray(tags) && tags.length >= 1 && tags.length <= 10 && tags.every(t => isValidString(t) && t.trim().length <= 50)` |
| 6   | `teamId` が非空文字列（1〜200文字）                             | `isValidString(teamId)`                                                                                                      |
| 7   | 互換性チェックが PASS している                                  | `compatibilityResult.passed === true`                                                                                        |

昇格操作の実行者制約:

- `metadata.visibility === "local"` の場合のみ操作可能
- 作成者（`author`）のみ昇格操作を実行できる

#### `S_TEAM` → `S_PUBLIC`（team から public へ昇格）

昇格ボタンが活性化される条件（全て AND 条件）:

| #   | 条件                                                            | テスト可能な条件式                                                                    |
| --- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| 1   | team 昇格条件（1〜7）を全て満たす                               | 上記条件を全て満たす                                                                  |
| 2   | `license` が非空文字列（1〜100文字）                            | `isValidString(license)`                                                              |
| 3   | `readme` が100文字以上10000文字以下                             | `isValidString(readme) && readme.trim().length >= 100`                                |
| 4   | `changelog` が非空文字列（1〜5000文字）                         | `isValidString(changelog)`                                                            |
| 5   | `minAppVersion` が semver 形式に一致                            | `/^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?(\+[a-zA-Z0-9.]+)?$/.test(minAppVersion)`            |
| 6   | `SkillSafetyContract.maxRiskLevel` が `"low"` または `"medium"` | `safetyContract.maxRiskLevel === "low" \|\| safetyContract.maxRiskLevel === "medium"` |
| 7   | `AggregateView.testPassRate >= 0.8`                             | `aggregateView.testPassRate >= 0.8`                                                   |
| 8   | SafetyGate approved（管理者による公開承認を取得済み）           | `safetyGateApproval.approved === true`                                                |

昇格操作の実行者制約:

- `metadata.visibility === "team"` の場合のみ操作可能
- 作成者（`author`）のみ昇格操作を実行できる

### 3.3 降格遷移条件

#### `S_PUBLIC` → `S_DEPRECATED`（public から deprecated へ遷移）

遷移が発生する条件（いずれかを満たす場合）:

| 条件  | 種別         | テスト可能な条件式                                                                           |
| ----- | ------------ | -------------------------------------------------------------------------------------------- |
| 条件A | 通常取り下げ | `requestorRole === "author" && unpublishAction === "request_approval"`                       |
| 条件B | 緊急取り下げ | `incidentLevel === "P1" \|\| incidentLevel === "P2"` （30日猶予なし・即時 `S_LOCAL` へ移行） |

遷移後の挙動:

- 通常取り下げ: `metadata.visibility` を `"team"` に設定する（Skill Center の検索結果に「取り下げ済み」ラベルを表示）
- 緊急取り下げ: `metadata.visibility` を `"local"` に強制変更する（`security-operations.md` P1/P2 インシデントレベルに基づく）
- インポート済みのユーザーのローカルコピーには影響しない

#### `S_TEAM` → `S_LOCAL`（team から local へ降格）

降格が発生する条件（いずれかを満たす場合）:

| 条件  | テスト可能な条件式                                                    |
| ----- | --------------------------------------------------------------------- |
| 条件A | `requestorRole === "author" && unshareAction === "demote_to_local"`   |
| 条件B | `teamId` が無効化された場合: `teamIdValidationResult.valid === false` |

#### `S_PUBLIC` → `S_LOCAL`（緊急取り下げ時の直接降格）

`incidentLevel === "P1" || incidentLevel === "P2"` の場合、`S_TEAM` をスキップして直接 `S_LOCAL` へ降格する。

#### `S_DEPRECATED` → `S_REMOVED`（deprecated から removed へ遷移）

遷移が発生する条件（全て AND 条件）:

| #   | テスト可能な条件式                                                                                           |
| --- | ------------------------------------------------------------------------------------------------------------ |
| 1   | `Date.now() - deprecatedAt >= 30 * 24 * 60 * 60 * 1000`（deprecatedAt から30日以上経過）                     |
| 2   | 作成者が明示的な削除操作を実行した: `requestorRole === "author" && removeAction === "confirm_remove"`        |
| 3   | 削除前の確認ダイアログを承認した: `removalConfirmation.importedUserCount` が UI に表示され、作成者が承認した |

#### `S_DEPRECATED` → `S_PUBLIC`（deprecated から public へ復活）

遷移が発生する条件（全て AND 条件）:

| #   | テスト可能な条件式                                                                             |
| --- | ---------------------------------------------------------------------------------------------- |
| 1   | `metadata.visibility === "team"`（deprecated 状態は visibility が "team"）                     |
| 2   | 作成者が「再公開する」操作を実行した: `requestorRole === "author" && republishAction === true` |
| 3   | `S_TEAM` → `S_PUBLIC` の昇格条件（全8条件）を再度全て満たす                                    |

### 3.4 StateChart 図

```
           [新規作成]
               |
               v
         +----------+
         | S_LOCAL  |<-----------+
         | (local)  |            | 条件B: teamId無効化
         +----------+            | 条件A: 作成者が取り下げ
               |                 |
  team昇格条件 |                 |
  (1〜7) 全OK  |                 |
               v                 |
         +----------+------------+
         |  S_TEAM  |
         |  (team)  |
         +----------+
               |
 public昇格条件|
 (1〜8) 全OK  |
               v
         +----------+       条件A: 通常取り下げ申請承認
         | S_PUBLIC |------------------------------------> S_DEPRECATED
         | (public) |                                          |
         +----------+<-- 再公開（昇格条件 1〜8 再評価）        |
               |                                         30日経過 +
               |                                         作成者削除操作確認
               |                                              |
               | 条件B: 緊急取り下げ                          v
               +----------------------------> S_LOCAL   S_REMOVED
                   (S_TEAM をスキップ)                  （終端状態）

【ガード条件サマリー】
  S_LOCAL → S_TEAM : 条件1〜7（全 AND）
  S_TEAM  → S_PUBLIC: 条件1〜8（全 AND）+ SafetyGate approved
  S_PUBLIC → S_DEPRECATED: 条件A（通常）または 条件B（緊急）
  S_PUBLIC → S_LOCAL: 緊急取り下げ（P1/P2 インシデント）のみ
  S_TEAM   → S_LOCAL: 条件A（作成者操作）または 条件B（teamId無効化）
  S_DEPRECATED → S_PUBLIC: 昇格条件1〜8 + 再公開操作
  S_DEPRECATED → S_REMOVED: 30日経過 + 作成者確認（全 AND）
```

---

## 4. UI 表示仕様

### 4.1 バッジ

Skill Center のスキルカード・詳細画面に表示するバッジ仕様。Apple HIG System Colors 準拠。

| visibility | バッジ表示テキスト | 背景色（Tailwind）           | テキスト色（Tailwind）         | Apple HIG 色名           |
| ---------- | ------------------ | ---------------------------- | ------------------------------ | ------------------------ |
| `"local"`  | `ローカル`         | `bg-[var(--status-neutral)]` | `text-[var(--text-secondary)]` | systemGray（中性グレー） |
| `"team"`   | `チーム`           | `bg-[var(--status-info)]`    | `text-[var(--text-inverse)]`   | systemBlue               |
| `"public"` | `公開`             | `bg-[var(--status-success)]` | `text-[var(--text-inverse)]`   | systemGreen              |

CSS 変数のライト/ダークモード対応（Apple HIG 準拠）:

```css
/* ライトモード */
:root {
  --status-neutral: #e5e5ea; /* Apple systemGray5 */
  --status-info: #007aff; /* Apple systemBlue */
  --status-success: #34c759; /* Apple systemGreen */
  --text-secondary: rgba(60, 60, 67, 0.6); /* Apple secondaryLabel */
  --text-inverse: #ffffff;
}

/* ダークモード */
@media (prefers-color-scheme: dark) {
  :root {
    --status-neutral: #2c2c2e; /* Apple tertiarySystemBackground */
    --status-info: #0a84ff; /* Apple systemBlue (dark) */
    --status-success: #30d158; /* Apple systemGreen (dark) */
    --text-secondary: rgba(
      235,
      235,
      245,
      0.6
    ); /* Apple secondaryLabel (dark) */
    --text-inverse: #ffffff;
  }
}
```

バッジの Record 定数（P47 準拠: テスト側で import して期待値を生成するため export する）:

```typescript
/**
 * visibility ごとのバッジスタイル定数。
 * テスト側でこの定数を import して期待値を生成する（P47 準拠）。
 * ファイル配置: packages/shared/src/skill/publishing-types.ts
 */
export const visibilityBadgeStyles: Record<
  SkillVisibility,
  { label: string; className: string }
> = {
  local: {
    label: "ローカル",
    className: "bg-[var(--status-neutral)] text-[var(--text-secondary)]",
  },
  team: {
    label: "チーム",
    className: "bg-[var(--status-info)] text-[var(--text-inverse)]",
  },
  public: {
    label: "公開",
    className: "bg-[var(--status-success)] text-[var(--text-inverse)]",
  },
};
```

### 4.2 アイコン

Skill Center のスキルカード・詳細画面に表示するアイコン仕様。アイコンライブラリは `lucide-react` を使用する。

| visibility | アイコン（lucide-react） | 意味                       | aria-label             |
| ---------- | ------------------------ | -------------------------- | ---------------------- |
| `"local"`  | `<Lock />`               | 南京錠（非公開）           | `"ローカル（非公開）"` |
| `"team"`   | `<Users />`              | 人物グループ（チーム共有） | `"チーム公開"`         |
| `"public"` | `<Globe />`              | 地球儀（全体公開）         | `"公開"`               |

アイコンの Record 定数（P47 準拠）:

```typescript
import { Lock, Users, Globe, LucideIcon } from "lucide-react";

/**
 * visibility ごとのアイコン定数。
 * テスト側でこの定数を import して期待値を生成する（P47 準拠）。
 */
export const visibilityIcons: Record<
  SkillVisibility,
  { icon: LucideIcon; ariaLabel: string }
> = {
  local: { icon: Lock, ariaLabel: "ローカル（非公開）" },
  team: { icon: Users, ariaLabel: "チーム公開" },
  public: { icon: Globe, ariaLabel: "公開" },
};
```

### 4.3 フィルタ

Skill Center 一覧画面の visibility ドロップダウンフィルタ仕様。

#### ドロップダウン選択肢

| 選択肢ラベル   | フィルタ条件              | 表示対象                                    |
| -------------- | ------------------------- | ------------------------------------------- |
| `すべて`       | なし（全件表示）          | local / team / public の全スキル            |
| `公開のみ`     | `visibility === "public"` | public スキルのみ                           |
| `チームのみ`   | `visibility === "team"`   | team スキルのみ（自分が閲覧権限を持つもの） |
| `ローカルのみ` | `visibility === "local"`  | local スキルのみ（自分が作成したもの）      |

#### フィルタ UI コンポーネント仕様

- コンポーネント種別: `<select>` または Radix UI `Select` コンポーネント
- 配置位置: Skill Center 一覧ヘッダー右上のツールバー
- アクセシビリティ: `aria-label="公開レベルでフィルタ"` を付与
- 選択変更時のハンドラ: `onVisibilityFilterChange(filter: VisibilityFilter) => void`
- フィルタ変更は URL クエリパラメータ `?visibility=<value>` に反映する（ページ共有可能にするため）

---

## 5. DI 境界配置テーブル

### 5.1 型・定数の配置先

```
packages/
  shared/
    src/
      skill/
        publishing-types.ts    ← 以下を定義・export する
                                  - SkillVisibility
                                  - SkillPublishingMetadataBase
                                  - LocalMetadata
                                  - TeamMetadata
                                  - PublicMetadata
                                  - SkillPublishingMetadata（ユニオン型）
                                  - VisibilityFilter
                                  - DEFAULT_VISIBILITY_FILTER
                                  - visibilityBadgeStyles
                                  - visibilityIcons
```

`packages/shared/src/index.ts` からの re-export:

```typescript
export type {
  SkillVisibility,
  SkillPublishingMetadata,
  SkillPublishingMetadataBase,
  LocalMetadata,
  TeamMetadata,
  PublicMetadata,
  VisibilityFilter,
} from "./skill/publishing-types";

export {
  visibilityBadgeStyles,
  visibilityIcons,
  DEFAULT_VISIBILITY_FILTER,
} from "./skill/publishing-types";
```

### 5.2 配置判断根拠

| 型・定数名                | レイヤー跨ぎ           | 配置先            | 根拠                                                                     |
| ------------------------- | ---------------------- | ----------------- | ------------------------------------------------------------------------ |
| `SkillVisibility`         | Main + Renderer        | `packages/shared` | SkillRegistryService（Main）と UI コンポーネント（Renderer）の両方が参照 |
| `SkillPublishingMetadata` | Main + Renderer        | `packages/shared` | IPC チャンネルの引数・戻り値として Main↔Renderer 間を流れる              |
| `LocalMetadata`           | Main + Renderer        | `packages/shared` | ユニオン型の構成要素。識別ユニオンとして shared に統一配置               |
| `TeamMetadata`            | Main + Renderer        | `packages/shared` | 同上                                                                     |
| `PublicMetadata`          | Main + Renderer        | `packages/shared` | 同上                                                                     |
| `VisibilityFilter`        | Renderer（Store+UI）   | `packages/shared` | 将来の web アプリでも利用可能性があるため shared に配置                  |
| `visibilityBadgeStyles`   | Renderer（テスト含む） | `packages/shared` | P47 準拠（テスト側が import して期待値を生成するため）                   |
| `visibilityIcons`         | Renderer（テスト含む） | `packages/shared` | P47 準拠（同上）                                                         |

### 5.3 IPC ハンドラの依存先（P61 準拠）

P61 違反（DIP 違反）を防ぐため、IPC ハンドラ登録関数の引数型は必ずインターフェース型とする。

```typescript
// P61 準拠: 具象クラスではなくインターフェースを引数に取る

// 正しい設計
export function registerSkillPublishingHandlers(
  skillRegistryService: SkillRegistryServicePort, // インターフェース
): void {
  /* ... */
}

// 禁止（P61 違反）
// export function registerSkillPublishingHandlers(
//   skillRegistryService: DefaultSkillRegistryService, // 具象クラス → 禁止
// ): void { /* ... */ }
```

---

## 6. Zustand publishingSlice 設計

P31 準拠の個別セレクタパターンで設計する。合成 Hook（`usePublishingStore()`）の戻り値関数を `useEffect` の依存配列に含めると無限ループが発生するため、個別セレクタのみを公開する。

### 6.1 スライス状態定義

```typescript
/**
 * 公開操作のための Zustand スライス。
 * ファイル配置: apps/desktop/src/renderer/store/slices/publishingSlice.ts
 */
interface PublishingSlice {
  /** 現在の公開レベル。デフォルト値: "local" */
  currentVisibility: SkillVisibility;

  /** 現在編集中の公開メタデータ。null の場合は未選択状態 */
  metadata: SkillPublishingMetadata | null;

  /** 公開操作の実行中フラグ */
  isPublishing: boolean;

  /** 公開操作のエラーメッセージ。null の場合はエラーなし */
  publishingError: string | null;
}
```

### 6.2 アクション定義

```typescript
interface PublishingActions {
  /** 公開レベルを変更する */
  setCurrentVisibility: (visibility: SkillVisibility) => void;

  /** 公開メタデータを更新する */
  setMetadata: (metadata: SkillPublishingMetadata | null) => void;

  /** 公開操作を開始する（isPublishing を true にする） */
  startPublishing: () => void;

  /** 公開操作を完了する（isPublishing を false にする） */
  finishPublishing: (error?: string) => void;

  /** 公開スライスをリセットする（初期状態に戻す） */
  resetPublishing: () => void;
}
```

### 6.3 初期状態

```typescript
const publishingSliceInitialState: PublishingSlice = {
  currentVisibility: "local",
  metadata: null,
  isPublishing: false,
  publishingError: null,
};
```

### 6.4 個別セレクタ（P31 準拠）

P31 対策として、合成 Hook の戻り値関数を `useEffect` 依存配列に含めない。個別セレクタ（`useCurrentVisibility()` 等）を使用する。

```typescript
// 状態セレクタ（参照が安定するため useEffect 依存配列への追加が安全）
export const useCurrentVisibility = () =>
  useAppStore((state) => state.currentVisibility);

export const usePublishingMetadata = () =>
  useAppStore((state) => state.metadata);

export const useIsPublishing = () => useAppStore((state) => state.isPublishing);

export const usePublishingError = () =>
  useAppStore((state) => state.publishingError);

// アクションセレクタ（Zustand アクション参照は安定しているため安全）
export const useSetCurrentVisibility = () =>
  useAppStore((state) => state.setCurrentVisibility);

export const useSetPublishingMetadata = () =>
  useAppStore((state) => state.setMetadata);

export const useStartPublishing = () =>
  useAppStore((state) => state.startPublishing);

export const useFinishPublishing = () =>
  useAppStore((state) => state.finishPublishing);

export const useResetPublishing = () =>
  useAppStore((state) => state.resetPublishing);
```

### 6.5 P48 注意点（派生セレクタの useShallow 適用）

派生セレクタ（`.filter()` / `.map()` で新しい配列参照を返すセレクタ）は `useShallow` を適用しなければ無限ループが発生する（P48 参照）。

```typescript
import { useShallow } from "zustand/react/shallow";

// P48: 配列を返す派生セレクタには useShallow を適用する
export const usePublicMetadataFields = () =>
  useAppStore(
    useShallow((state) => {
      if (state.metadata?.visibility === "public") {
        return {
          tags: state.metadata.tags,
          license: state.metadata.license,
        };
      }
      return null;
    }),
  );
```

---

## 7. Phase 1 参照トレーサビリティ

本設計書の各設計要素と、それが対応する Phase 1 要件の対応関係を示す。

| 本設計書のセクション                | 対応する Phase 1 成果物                                                        | 対応する受入基準 | 対応する具体的要件                                                                  |
| ----------------------------------- | ------------------------------------------------------------------------------ | ---------------- | ----------------------------------------------------------------------------------- |
| 2.1 SkillVisibility 型定義          | `outputs/phase-1/publishing-levels.md` §1（公開レベル定義）                    | AC-1             | 3段階のレベル（local/team/public）定義                                              |
| 2.2 LocalMetadata インターフェース  | `outputs/phase-1/publishing-levels.md` §2（metadata 必須フィールドマトリクス） | AC-1             | local: name/description/version が必須                                              |
| 2.2 TeamMetadata インターフェース   | `outputs/phase-1/publishing-levels.md` §2                                      | AC-1             | team: local全部 + author/tags/teamId が必須                                         |
| 2.2 PublicMetadata インターフェース | `outputs/phase-1/publishing-levels.md` §2                                      | AC-1             | public: team全部 + license/readme/changelog/minAppVersion が必須・repository が任意 |
| 2.3 バリデーションルール            | `outputs/phase-1/publishing-levels.md` §3（状態遷移条件）                      | AC-1             | `description` は20文字以上、`tags` は最大10件 等の制約値                            |
| 3.2 `S_TEAM` → `S_PUBLIC` 条件6     | `outputs/phase-1/safety-gate-connection.md` §3（公開ブロック条件）             | AC-3             | `maxRiskLevel` が `"high"` または `"critical"` の場合は昇格ブロック                 |
| 3.2 `S_TEAM` → `S_PUBLIC` 条件7     | `outputs/phase-1/safety-gate-connection.md` §3（公開警告条件）                 | AC-3             | `testPassRate >= 0.8` を公開昇格条件に組み込む                                      |
| 3.3 降格遷移条件（条件B 緊急）      | `outputs/phase-1/skill-center-registration.md` §4（緊急取り下げフロー）        | AC-4             | P1/P2 インシデント時の即時 `S_LOCAL` 移行・30日猶予なし                             |
| 3.3 `S_DEPRECATED` → `S_REMOVED`    | `outputs/phase-1/skill-center-registration.md` §4（取り下げフロー）            | AC-4             | deprecated から30日経過後、作成者の明示的削除操作でのみ `S_REMOVED` へ遷移          |
| 4.1 バッジ仕様                      | `outputs/phase-1/publishing-levels.md` §1（各レベルの概要）                    | AC-1             | local（グレー）/ team（ブルー）/ public（グリーン）の視覚的識別                     |
| 4.2 アイコン仕様                    | `outputs/phase-1/publishing-levels.md` §1                                      | AC-1             | 南京錠(local) / 人物グループ(team) / 地球儀(public) の意味的アイコン                |
| 4.3 フィルタ仕様                    | `outputs/phase-1/skill-center-registration.md` §5（カテゴリ/タグ体系）         | AC-4             | Skill Center 一覧での visibility ドロップダウンフィルタ                             |
| 5.2 DI 境界配置テーブル             | `outputs/phase-1/publishing-levels.md` §2                                      | AC-1             | `SkillVisibility` / `SkillPublishingMetadata` のレイヤー跨ぎ共有                    |
| 6.1 PublishingSlice 状態定義        | `outputs/phase-1/publishing-levels.md` §3（デフォルト値）                      | AC-1             | `currentVisibility` のデフォルト値は `"local"`（新規作成スキルは local から開始）   |
| 6.4 個別セレクタ（P31 準拠）        | Phase 1 で言及なし（実装パターン制約）                                         | -                | P31 パターン対策（合成 Hook 無限ループ防止）として設計時に適用                      |

### Phase 1 受入基準との対応確認

| 受入基準                                | 対応状況 | 対応箇所                                                                                    |
| --------------------------------------- | :------: | ------------------------------------------------------------------------------------------- |
| AC-1（共有/公開レベルが定義されている） | 対応済み | §2.1〜2.2（型定義）、§3（StateChart）、§5.2（DI配置）                                       |
| AC-2（バージョン/互換性ルール）         | 部分対応 | §3.2 条件7（互換性 PASS を昇格条件に含める）。詳細は `compatibility-check-design.md` に委譲 |
| AC-3（安全性・観測指標の接続）          | 部分対応 | §3.2 条件6〜7（昇格ガード条件）。詳細は `publish-readiness-design.md` に委譲                |
| AC-4（Skill Center 登録方針）           | 部分対応 | §3.3（取り下げ・緊急取り下げ遷移）。詳細は `skill-center-flow-design.md` に委譲             |

---

## 8. 未解決事項と後続タスクへの引き継ぎ

| ID  | 未解決事項                                                                       | 影響範囲                       | 後続対応                                                                                                                  |
| --- | -------------------------------------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| U-1 | `deprecated` 状態を `SkillVisibility` 型に含めるか否か（現在は `"team"` で代替） | IPC レスポンス・Store スライス | Phase 3（設計レビュー）で判断。含める場合は `type SkillVisibility = "local" \| "team" \| "public" \| "deprecated"` に変更 |
| U-2 | `minAppVersion` の検証ロジックにおける現在のアプリバージョンとの比較実装         | Phase 5（実装）                | `compatibility-check-design.md` との接続点。Phase 5 でアダプタを設計                                                      |
| U-3 | `repository` URL の到達可能性チェック（外部 HTTP リクエスト）の要否              | セキュリティ・パフォーマンス   | Phase 3 レビューで判断。本設計では形式バリデーション（正規表現）のみとする                                                |
| U-4 | `SafetyGateApproval` の型定義と IPC チャンネル名の確定                           | Phase 5（実装）・IPC 設計      | `publish-readiness-design.md` で定義する予定。本設計では `safetyGateApproval.approved === true` という条件式のみを規定    |
