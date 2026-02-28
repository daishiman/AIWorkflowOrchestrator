# Phase 2 成果物: アーキテクチャ設計書 -- SkillForker クラス設計

## メタ情報

| 項目     | 値                 |
| -------- | ------------------ |
| Phase    | 2                  |
| 機能名   | TASK-9E-skill-fork |
| タスクID | TASK-9E            |
| 作成日   | 2026-02-28         |

---

## 1. SkillForker クラス設計

### 1.1 クラス概要

`SkillForker` は、既存スキルのディレクトリ構造をコピーし、SKILL.md の Frontmatter を更新して新スキルを作成するファイルシステム操作専用クラスである。IPC ハンドラや BrowserWindow への依存は持たず、`SkillService` 経由で呼び出される。

**配置先**: `apps/desktop/src/main/services/skill/SkillForker.ts`

### 1.2 クラス構成

```typescript
import {
  SkillForkOptions,
  SkillForkResult,
  SkillForkMetadata,
} from "@repo/shared/types/skill-fork";
import * as fs from "fs/promises";
import * as path from "path";

export class SkillForker {
  constructor(private skillsDir: string) {}

  // -- 公開メソッド --

  /**
   * 既存スキルをフォークして新スキルを作成する
   *
   * 処理フロー:
   *   1. パストラバーサル検証
   *   2. フォーク元存在確認
   *   3. 同名スキル存在チェック
   *   4. ディレクトリ作成
   *   5. SKILL.md のコピー+更新（try/catch ロールバック保護開始）
   *   6. サブディレクトリの選択的コピー
   *   7. フォークメタデータ書き込み
   *   8. SkillForkResult 返却
   *
   * @throws SkillForkError フォーク失敗時（ロールバック済み）
   */
  async fork(options: SkillForkOptions): Promise<SkillForkResult>;

  // -- 非公開メソッド --

  /**
   * SKILL.md の Frontmatter を更新する
   *
   * 更新フィールド:
   *   - name -> options.newName
   *   - description -> options.description（指定時のみ）
   *   - forked-from -> options.sourceSkill
   *   - allowed-tools -> options.modifyAllowedTools（指定時のみ）
   */
  private modifySkillMd(content: string, options: SkillForkOptions): string;

  /**
   * サブディレクトリを再帰的にコピーする
   * @returns コピーされたファイルの相対パス一覧
   */
  private copyDirectory(
    src: string,
    dest: string,
    subDir: string,
  ): Promise<string[]>;

  /**
   * フォークメタデータを JSON ファイルとして書き込む
   * ファイル名: fork-metadata.json
   */
  private writeForkMetadata(
    destPath: string,
    metadata: SkillForkMetadata,
  ): Promise<void>;

  /**
   * パスの存在確認（ディレクトリ）
   * fs.access で存在チェックし、例外時は false を返す
   */
  private exists(dirPath: string): Promise<boolean>;

  /**
   * Frontmatter のパース
   * --- で囲まれた YAML 部分をオブジェクトとして抽出する
   *
   * @returns frontmatter: キーバリューオブジェクト, body: 本文
   */
  private parseFrontmatter(content: string): {
    frontmatter: Record<string, unknown>;
    body: string;
  };

  /**
   * Frontmatter のシリアライズ
   * オブジェクトを YAML 形式の Frontmatter に変換し、本文と結合する
   */
  private serializeFrontmatter(
    frontmatter: Record<string, unknown>,
    body: string,
  ): string;

  /**
   * パストラバーサル検証
   *
   * 検証内容:
   *   1. path.resolve(skillsDir, name) を計算
   *   2. 結果が skillsDir 配下であることを startsWith で検証
   *   3. skillsDir 外を参照している場合は SkillForkError(1003) をスロー
   *
   * @throws SkillForkError(1003) パストラバーサル検出時
   */
  private validatePath(name: string): void;

  /**
   * ロールバック処理
   * フォーク途中でエラーが発生した場合、作成途中のディレクトリを削除する
   *
   * fs.rm(destPath, { recursive: true, force: true }) を使用
   */
  private rollback(destPath: string): Promise<void>;
}
```

### 1.3 メソッド責務マトリクス

| メソッド               | 責務                                   | 入力                        | 出力                   | 例外                 |
| ---------------------- | -------------------------------------- | --------------------------- | ---------------------- | -------------------- |
| `fork`                 | フォーク処理全体のオーケストレーション | `SkillForkOptions`          | `SkillForkResult`      | SkillForkError       |
| `modifySkillMd`        | SKILL.md の Frontmatter 更新           | content, SkillForkOptions   | 更新後の content       | なし（純粋関数）     |
| `copyDirectory`        | サブディレクトリの再帰コピー           | src, dest, subDir           | コピー済みファイル一覧 | SkillForkError(4002) |
| `writeForkMetadata`    | fork-metadata.json の書き込み          | destPath, SkillForkMetadata | void                   | SkillForkError(4003) |
| `exists`               | ディレクトリ存在確認                   | dirPath                     | boolean                | なし                 |
| `parseFrontmatter`     | YAML Frontmatter のパース              | content                     | { frontmatter, body }  | なし                 |
| `serializeFrontmatter` | Frontmatter のシリアライズ             | frontmatter, body           | content                | なし                 |
| `validatePath`         | パストラバーサル防止検証               | name                        | void                   | SkillForkError(1003) |
| `rollback`             | 作成途中ディレクトリの削除             | destPath                    | void                   | ログ出力のみ         |

---

## 2. 依存関係

### 2.1 依存関係テーブル

| 依存先                  | 注入方式              | 用途                           | テスト時の対応                   |
| ----------------------- | --------------------- | ------------------------------ | -------------------------------- |
| `skillsDir` (string)    | Constructor Injection | スキルディレクトリのルートパス | テスト用の一時ディレクトリを指定 |
| `fs/promises` (Node.js) | 直接 import           | ファイルシステム操作           | vi.mock でモック化               |
| `path` (Node.js)        | 直接 import           | パス操作                       | モック不要（純粋関数）           |

### 2.2 設計判断

SkillForker はファイルシステム操作のみを担当するため、以下の設計判断を採用した。

**BrowserWindow への非依存**: SkillForker は IPC レスポンスの送信やウィンドウ操作を行わない。そのため BrowserWindow への依存は不要であり、Constructor Injection で `skillsDir` のみを受け取る単純な設計とした。P34（遅延初期化パターン）は適用不要。

**SkillService 経由の呼び出し**: SkillForker は SkillService のメソッド `forkSkill()` 経由で呼び出される。IPC ハンドラから直接呼び出さないことで、サービス層の責務分離を維持する。

**fs/promises の直接 import**: テスト時は `vi.mock("fs/promises")` でモック化する。DI による注入は過剰設計と判断した。

---

## 3. エラー処理戦略

### 3.1 エラーコード体系

| エラー種別             | エラーコード | カテゴリ             | リトライ | ロールバック | 対応                           |
| ---------------------- | ------------ | -------------------- | -------- | ------------ | ------------------------------ |
| フォーク元スキル不存在 | 1001         | Validation Error     | 不可     | 不要         | バリデーションエラーを返す     |
| 同名スキル存在         | 1002         | Validation Error     | 不可     | 不要         | バリデーションエラーを返す     |
| パストラバーサル検出   | 1003         | Validation Error     | 不可     | 不要         | バリデーションエラーを返す     |
| 引数バリデーション失敗 | 1004         | Validation Error     | 不可     | 不要         | バリデーションエラーを返す     |
| SKILL.md 読み取り失敗  | 4001         | Infrastructure Error | 可能     | 実行         | ディレクトリ削除後エラーを返す |
| ディレクトリコピー失敗 | 4002         | Infrastructure Error | 可能     | 実行         | ディレクトリ削除後エラーを返す |
| メタデータ書き込み失敗 | 4003         | Infrastructure Error | 可能     | 実行         | ディレクトリ削除後エラーを返す |
| ディレクトリ作成失敗   | 4004         | Infrastructure Error | 可能     | 実行         | ディレクトリ削除後エラーを返す |

### 3.2 SkillForkError クラス

```typescript
/**
 * スキルフォーク処理専用のエラークラス
 *
 * エラーコード体系:
 *   - 1000番台: Validation Error（バリデーション失敗、リトライ不可）
 *   - 4000番台: Infrastructure Error（FS操作失敗、リトライ可能）
 *
 * sanitizeErrorMessage() の対象:
 *   - 1000番台: メッセージにパス情報を含めない設計のためサニタイズは低影響
 *   - 4000番台: FS操作エラーの元メッセージにパス情報が含まれる場合がある
 */
export class SkillForkError extends Error {
  constructor(
    message: string,
    public readonly code: number,
    public readonly isRetryable: boolean = false,
  ) {
    super(message);
    this.name = "SkillForkError";
  }
}
```

### 3.3 エラー分類と IPC レスポンスの対応

| エラーコード範囲 | IPC レスポンス形式                                      | Renderer 側の表示               |
| ---------------- | ------------------------------------------------------- | ------------------------------- |
| 1000-1999        | `{ success: false, error: "ユーザー向けメッセージ" }`   | エラーダイアログに表示          |
| 4000-4999        | `{ success: false, error: "サニタイズ済みメッセージ" }` | エラーダイアログ + リトライ提案 |

---

## 4. ロールバック設計

### 4.1 ロールバック対象範囲

ロールバックはフォーク先ディレクトリの削除のみを行う。フォーク元スキルのファイルは一切変更しない。

### 4.2 ロールバックフロー

```
fork() 処理フロー:
  1. validatePath(sourceSkill)        <- 失敗時: throw SkillForkError(1003)
  2. validatePath(newName)            <- 失敗時: throw SkillForkError(1003)
  3. exists(sourcePath)               <- 不存在: throw SkillForkError(1001)
  4. exists(destPath)                 <- 存在: throw SkillForkError(1002)
  5. mkdir(destPath, { recursive: true })
     |-- 失敗時: throw SkillForkError(4004)（ロールバック不要）
     +-- 成功時: 次へ

  -- ここから try/catch でロールバック保護 --

  6. readFile(sourcePath/SKILL.md)
     -> modifySkillMd(content, options)
     -> writeFile(destPath/SKILL.md, modifiedContent)

  7. copyAgents === true の場合:
     -> copyDirectory(sourcePath, destPath, "agents")

  8. copyReferences === true の場合:
     -> copyDirectory(sourcePath, destPath, "references")

  9. copyScripts === true の場合:
     -> copyDirectory(sourcePath, destPath, "scripts")

  10. copyAssets === true の場合:
      -> copyDirectory(sourcePath, destPath, "assets")

  11. writeForkMetadata(destPath, metadata)

  -- catch: rollback(destPath) --
      -> fs.rm(destPath, { recursive: true, force: true })
      -> throw SkillForkError (元のエラーコードを保持)

  12. return SkillForkResult
```

### 4.3 ロールバック実装の注意点

- `rollback()` 自体がエラーをスローする可能性がある。その場合はログ出力のみ行い、元のエラーを再スローする
- `fs.rm` の `force: true` オプションにより、ディレクトリが存在しない場合もエラーにならない
- ロールバック後のエラーメッセージには、ロールバックが実行されたことを含める

```typescript
private async rollback(destPath: string): Promise<void> {
  try {
    await fs.rm(destPath, { recursive: true, force: true });
    log.info(`[SkillForker] Rolled back: ${destPath}`);
  } catch (rollbackError) {
    // ロールバック自体の失敗はログのみ記録
    log.error(`[SkillForker] Rollback failed for ${destPath}:`, rollbackError);
  }
}
```

### 4.4 ロールバック対象と非対象の明確化

| 状態                                   | ロールバック | 理由                                  |
| -------------------------------------- | ------------ | ------------------------------------- |
| バリデーションエラー（1001-1004）      | 不要         | FS操作がまだ開始されていない          |
| mkdir 失敗（4004）                     | 不要         | ディレクトリが作成されていない        |
| SKILL.md 読み取り/書き込み失敗（4001） | 実行         | destPath ディレクトリが作成済み       |
| ディレクトリコピー失敗（4002）         | 実行         | destPath に部分的なファイルが存在する |
| メタデータ書き込み失敗（4003）         | 実行         | destPath に部分的なファイルが存在する |

---

## 5. SkillService 統合設計

### 5.1 統合方式

SkillForker は SkillService の初期化時に Constructor Injection で生成する。BrowserWindow 等の外部リソースが不要なため、Setter Injection（P34パターン）は適用しない。

```typescript
// apps/desktop/src/main/services/skill/SkillService.ts に追加

export class SkillService {
  private skillForker: SkillForker;

  constructor(
    private skillsDir: string,
    // ... 既存の依存関係
  ) {
    // 初期化時に SkillForker を生成
    this.skillForker = new SkillForker(skillsDir);
  }

  /**
   * スキルをフォークする
   * IPC ハンドラから呼び出される
   *
   * @param options フォークオプション
   * @returns フォーク結果
   */
  async forkSkill(options: SkillForkOptions): Promise<SkillForkResult> {
    return this.skillForker.fork(options);
  }
}
```

### 5.2 SkillService との責務分離

| 責務             | SkillService                       | SkillForker              |
| ---------------- | ---------------------------------- | ------------------------ |
| フォーク処理     | `forkSkill()` でデリゲート         | `fork()` で実処理        |
| スキルスキャン   | `scanAvailableSkills()` 担当       | 担当外                   |
| インポート/削除  | `importSkills()` / `removeSkill()` | 担当外                   |
| ファイルシステム | 担当外（SkillForker に委譲）       | `fs/promises` で直接操作 |
| IPC ハンドラ連携 | ハンドラから呼び出される           | SkillService 経由のみ    |

### 5.3 SkillForker と SkillExecutor の DI パターン比較

| 項目             | SkillForker           | SkillExecutor                        |
| ---------------- | --------------------- | ------------------------------------ |
| 外部リソース依存 | なし                  | BrowserWindow 必要                   |
| DI パターン      | Constructor Injection | Setter Injection（P34）              |
| 初期化タイミング | SkillService 生成時   | `registerSkillHandlers()` 呼び出し時 |
| null チェック    | 不要                  | `if (!this.skillExecutor)` 必要      |

---

## 6. Phase 1 要件との整合性確認

| 要件  | 設計での対応                                                                           | 充足 |
| ----- | -------------------------------------------------------------------------------------- | ---- |
| FR-1  | `fork()` メソッドで全体のオーケストレーションを実行                                    | 充足 |
| FR-2  | `modifySkillMd()` で Frontmatter の name/description/forked-from を更新                | 充足 |
| FR-3  | `copyDirectory()` で copyAgents/copyReferences/copyScripts/copyAssets を選択的にコピー | 充足 |
| FR-4  | `writeForkMetadata()` で fork-metadata.json を生成                                     | 充足 |
| FR-5  | `exists(destPath)` で同名スキルチェック -> Error(1002)                                 | 充足 |
| FR-6  | IPC 契約設計書（別成果物）で対応                                                       | 充足 |
| FR-7  | `modifySkillMd()` で allowed-tools フィールドを更新                                    | 充足 |
| NFR-1 | `copyDirectory()` は `fs.cp` の再帰コピーで高速化                                      | 充足 |
| NFR-2 | ロールバック設計で try/catch + rm -rf を実装                                           | 充足 |
| NFR-3 | `validatePath()` でパストラバーサル防止                                                | 充足 |
| NFR-4 | IPC 契約設計書（別成果物）で P42/P44/P45 準拠                                          | 充足 |
