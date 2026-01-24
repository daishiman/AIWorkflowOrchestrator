# 依存関係確認チェックリスト

## メタ情報

| 項目     | 内容              |
| -------- | ----------------- |
| タスクID | TASK-2A           |
| フェーズ | Phase 1: 要件定義 |
| 作成日   | 2026-01-24        |
| 機能名   | SkillScanner 実装 |

---

## 1. TASK-1-1 依存確認

### 1.1 成果物の存在確認

| チェック項目                                | 状態 | 備考                   |
| ------------------------------------------- | ---- | ---------------------- |
| `packages/shared/src/types/skill.ts` の存在 | ✅   | ファイル存在を確認済み |
| `@repo/shared` パッケージが利用可能         | ✅   | モノレポ構成で利用可能 |

### 1.2 必要な型定義の確認

| 型名             | 存在 | 定義内容                               |
| ---------------- | ---- | -------------------------------------- |
| SkillMetadata    | ✅   | スキルの完全なメタデータ（L249-285）   |
| SkillSubResource | ✅   | サブディレクトリ内リソース（L230-242） |
| SkillOtherFile   | ✅   | その他ファイル情報（L215-224）         |

### 1.3 型定義の詳細確認

#### SkillMetadata

```typescript
export interface SkillMetadata {
  name: string; // ✅ スキル識別子
  description: string; // ✅ スキル説明
  allowedTools?: string[]; // ✅ 許可ツール
  path: string; // ✅ ディレクトリパス
  updatedAt: Date; // ✅ 更新日時
  agents: SkillSubResource[]; // ✅ agents/配下
  references: SkillSubResource[]; // ✅ references/配下
  scripts: SkillSubResource[]; // ✅ scripts/配下
  assets: SkillSubResource[]; // ✅ assets/配下
  schemas: SkillSubResource[]; // ✅ schemas/配下
  indexes: SkillSubResource[]; // ✅ indexes/配下
  otherFiles: SkillOtherFile[]; // ✅ その他ファイル
}
```

**評価**: 要件を満たしている

#### SkillSubResource

```typescript
export interface SkillSubResource {
  filename: string; // ✅ ファイル名
  relativePath: string; // ✅ 相対パス
  description?: string; // ✅ 説明（オプション）
  size: number; // ✅ ファイルサイズ
}
```

**評価**: 要件を満たしている

#### SkillOtherFile

```typescript
export interface SkillOtherFile {
  filename: string; // ✅ ファイル名
  type: "evals" | "logs" | "package" | "other"; // ✅ ファイルタイプ
  size: number; // ✅ ファイルサイズ
}
```

**評価**: 要件を満たしている

---

## 2. 追加要件の検討

### 2.1 readonly フラグの追加

**現状**: `SkillMetadata` に `readonly` フラグが存在しない

**対応方針**:
実装時に SkillMetadata を拡張した型を使用するか、型定義を更新する

```typescript
// 方式1: 実装時に拡張
interface SkillMetadataWithReadonly extends SkillMetadata {
  readonly: boolean;
}

// 方式2: TASK-1-1 の型を更新（推奨）
// SkillMetadata に readonly?: boolean を追加
```

**結論**: Phase 5（実装）で対応。必要に応じて型定義の更新を検討。

---

## 3. 外部ライブラリ依存

| ライブラリ  | バージョン | 用途                    | 確認状態 |
| ----------- | ---------- | ----------------------- | -------- |
| yaml        | ^2.x       | YAML Frontmatter パース | 要確認   |
| fs/promises | Node.js    | ファイル操作            | ✅       |
| path        | Node.js    | パス操作                | ✅       |

### yaml ライブラリの確認

```bash
# 確認コマンド
pnpm --filter @repo/desktop list yaml
```

**注意**: yaml ライブラリがインストールされていない場合は Phase 5 で追加する

---

## 4. ディレクトリ構造の確認

### 4.1 実装先

| パス                                                   | 種別         |
| ------------------------------------------------------ | ------------ |
| `apps/desktop/src/main/services/skill/`                | サービス     |
| `apps/desktop/src/main/services/skill/SkillScanner.ts` | 実装         |
| `apps/desktop/src/main/services/skill/__tests__/`      | テスト       |
| `apps/desktop/src/main/services/skill/__fixtures__/`   | フィクスチャ |
| `apps/desktop/src/main/services/skill/index.ts`        | バレル       |

### 4.2 ディレクトリ存在確認

Phase 4（テスト作成）で必要なディレクトリを作成する。

---

## 5. 確認結果サマリー

| 項目                | 状態 | 備考                             |
| ------------------- | ---- | -------------------------------- |
| TASK-1-1 完了確認   | ✅   | 型定義が存在                     |
| SkillMetadata 型    | ✅   | 要件を満たす                     |
| SkillSubResource 型 | ✅   | 要件を満たす                     |
| SkillOtherFile 型   | ✅   | 要件を満たす                     |
| readonly フラグ     | ⚠️   | 型定義に追加が必要（実装時対応） |
| yaml ライブラリ     | 📋   | Phase 5 で確認・追加             |
| 実装先ディレクトリ  | 📋   | Phase 4 で作成                   |

---

## 6. 結論

TASK-1-1 の型定義は SkillScanner の実装要件を**ほぼ満たしている**。

**対応事項**:

1. `readonly` フラグは実装時に対応（型拡張または型定義更新）
2. `yaml` ライブラリは Phase 5 で確認・追加

**Phase 2 への移行**: **可能**

---

## 変更履歴

| Version | Date       | Changes  |
| ------- | ---------- | -------- |
| 1.0.0   | 2026-01-24 | 初版作成 |
