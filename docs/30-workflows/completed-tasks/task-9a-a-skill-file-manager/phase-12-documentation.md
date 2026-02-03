# Phase 12: ドキュメント更新

## 1. Task 1: 実装ガイド作成

### 1.1 Part 1: 概念説明（中学生レベル）

**対象読者**: 初学者・非技術者

#### SkillFileManager とは？

**日常の例え話**:
スマートフォンのフォトアルバムアプリを想像してください。

- **読み込み**: アルバムから写真を見る
- **書き込み**: 写真を編集して保存する（編集前の写真は自動でバックアップ）
- **作成**: 新しい写真をアルバムに追加する
- **削除**: 写真を削除する（ゴミ箱に移動されるので復元可能）
- **バックアップ一覧**: ゴミ箱や編集履歴を見る
- **復元**: ゴミ箱や編集履歴から写真を元に戻す

SkillFileManager は、この「フォトアルバムアプリ」のように、スキルファイルを安全に管理するための機能です。

#### なぜ必要？

1. **誤って削除しても大丈夫**: 削除前に自動でバックアップが作られる
2. **編集履歴が残る**: 書き込み前の内容がバックアップされる
3. **安全に管理**: 重要なファイル（Claude CLIのスキル）は編集できないように保護

#### 2つのスキルフォルダ

| フォルダ                | 役割                 | 編集     |
| ----------------------- | -------------------- | -------- |
| `~/.aiworkflow/skills/` | あなたが作ったスキル | できる   |
| `~/.claude/skills/`     | Claude公式のスキル   | できない |

### 1.2 Part 2: 技術的詳細（開発者レベル）

**対象読者**: 開発者・技術者

#### インターフェース定義

```typescript
interface SkillFileManagerOptions {
  aiworkflowSkillsDir?: string; // デフォルト: ~/.aiworkflow/skills/
  claudeSkillsDir?: string; // デフォルト: ~/.claude/skills/
}

interface BackupInfo {
  filename: string; // バックアップファイル名
  relativePath: string; // スキルディレクトリからの相対パス
  originalPath: string; // 元ファイルのパス
  type: "backup" | "deleted"; // バックアップ種別
  timestamp: number; // タイムスタンプ（ミリ秒）
  createdAt: Date; // 作成日時
}
```

#### API シグネチャ

| メソッド      | シグネチャ                                                                    | 説明             |
| ------------- | ----------------------------------------------------------------------------- | ---------------- |
| readFile      | `(skillName: string, relativePath: string) => Promise<string>`                | ファイル読み込み |
| writeFile     | `(skillName: string, relativePath: string, content: string) => Promise<void>` | ファイル書き込み |
| createFile    | `(skillName: string, relativePath: string, content: string) => Promise<void>` | ファイル作成     |
| deleteFile    | `(skillName: string, relativePath: string) => Promise<void>`                  | ファイル削除     |
| listBackups   | `(skillName: string) => Promise<BackupInfo[]>`                                | バックアップ一覧 |
| restoreBackup | `(skillName: string, backupPath: string) => Promise<void>`                    | バックアップ復元 |
| isReadonly    | `(skillName: string) => Promise<boolean>`                                     | 読み取り専用判定 |

#### エラークラス

| エラークラス       | エラーコード            | 発生条件                       |
| ------------------ | ----------------------- | ------------------------------ |
| SkillNotFoundError | SKILL_NOT_FOUND         | スキルディレクトリが存在しない |
| ReadonlySkillError | READONLY_SKILL          | 読み取り専用スキルへの書き込み |
| PathTraversalError | PATH_TRAVERSAL_DETECTED | パストラバーサル検出           |
| FileExistsError    | FILE_ALREADY_EXISTS     | createFile で既存ファイルあり  |
| FileNotFoundError  | FILE_NOT_FOUND          | 操作対象ファイルが存在しない   |

#### 使用例

```typescript
import { SkillFileManager } from "./services/skill";

const manager = new SkillFileManager();

// ファイル読み込み
const content = await manager.readFile("my-skill", "references/guide.md");

// ファイル書き込み（バックアップ自動作成）
await manager.writeFile(
  "my-skill",
  "references/guide.md",
  "# Updated Guide\n...",
);

// バックアップ一覧取得
const backups = await manager.listBackups("my-skill");
console.log(backups);
// [{ filename: 'guide.md.backup.1738500000000', type: 'backup', ... }]

// バックアップから復元
await manager.restoreBackup(
  "my-skill",
  "references/guide.md.backup.1738500000000",
);
```

#### セキュリティ考慮事項

1. **パストラバーサル防止**: `../` を含むパスは自動で拒否
2. **読み取り専用保護**: `~/.claude/skills/` への書き込みは全て拒否
3. **シンボリックリンク検証**: リンク先がベースパス外なら拒否

## 2. Task 2: システム仕様書更新

### 2.1 Step 1-A: タスク完了記録

**更新対象ファイル**:

| ファイル                             | 更新内容                         |
| ------------------------------------ | -------------------------------- |
| `interfaces-agent-sdk-skill.md`      | 完了タスクセクションに追加       |
| `aiworkflow-requirements/LOGS.md`    | 完了記録追加                     |
| `task-specification-creator/LOGS.md` | 完了記録追加                     |
| `topic-map.md`                       | 新規エントリ追加（必要に応じて） |

**完了記録フォーマット**:

```markdown
### TASK-9A-A SkillFileManager 実装

**完了日**: YYYY-MM-DD
**テスト数**: XX
**カバレッジ**: XX%

**成果物**:
| 種類 | パス |
|------|------|
| 実装 | `apps/desktop/src/main/services/skill/SkillFileManager.ts` |
| テスト | `apps/desktop/src/main/services/skill/__tests__/SkillFileManager.test.ts` |

**関連ドキュメント**:

- [実装ガイド](path/to/implementation-guide.md)
```

### 2.2 Step 1-B: 実装状況テーブル更新

**確認対象ファイル**:

| ファイル                        | 確認項目                           |
| ------------------------------- | ---------------------------------- |
| `interfaces-agent-sdk-skill.md` | SkillFileManager API追加           |
| `arch-electron-services.md`     | サービス一覧にSkillFileManager追加 |

### 2.3 Step 1-C: 関連タスクテーブル更新

**確認対象ファイル**:

| ファイル                        | 更新項目                        |
| ------------------------------- | ------------------------------- |
| `interfaces-agent-sdk-skill.md` | 関連タスクのステータス更新      |
| 元タスク仕様書                  | ステータスを「completed」に更新 |

**Grepによる漏れ防止**:

```bash
grep -rn "TASK-9A-A" .claude/skills/aiworkflow-requirements/references/
grep -rn "SkillFileManager" .claude/skills/aiworkflow-requirements/references/
```

### 2.4 Step 1-D: topic-map.md再生成【⚠️見落としやすい】

**必須実行**:

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

**確認**:

- [ ] 再生成されたtopic-map.mdに新規セクションの行番号が正しく反映されている

### 2.5 Step 1-E: 未タスク指示書作成・配置【1件以上検出時は必須】

**Task 4で1件以上検出された場合**:

| 作業                                  | 配置先                                                               |
| ------------------------------------- | -------------------------------------------------------------------- |
| 未タスク指示書作成（9セクション形式） | `docs/30-workflows/unassigned-task/task-*.md`                        |
| task-workflow.md残課題テーブル登録    | `.claude/skills/aiworkflow-requirements/references/task-workflow.md` |
| 関連仕様書の残課題テーブル登録        | `interfaces-agent-sdk-skill.md` 等                                   |

### 2.6 Step 1完了チェックリスト【必須確認】

**Phase 12 Task 2完了前に以下を全て確認**:

```markdown
## Step 1-A: タスク完了記録

- [ ] 該当仕様書の「完了タスク」テーブルにタスクIDと完了日を追加した
- [ ] 「タスク完了ステータス更新」セクションの**詳細テンプレート**で完了記録を追加した
  - [ ] テスト結果サマリー表（機能/エラーハンドリング/アクセシビリティ/統合テスト）
  - [ ] 成果物テーブル（テスト結果レポート/実装ガイド等）
- [ ] 「関連ドキュメント」セクションに実装ガイドリンクを追加した
- [ ] 「変更履歴」にバージョン番号を追記した

## Step 1-B: 実装状況テーブル更新

- [ ] 該当仕様書に「実装状況」テーブルがある場合、該当行を「完了」に更新した

## Step 1-C: 関連タスクテーブル更新

- [ ] Grepで該当タスクIDを検索し、全ての記載箇所を確認した
- [ ] 該当タスクのステータスを「**完了**」に更新した

## Step 1-D: topic-map.md再生成

- [ ] `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行した

## Step 1-E: 未タスク指示書配置

- [ ] 未タスク候補が1件以上の場合、`docs/30-workflows/unassigned-task/` に指示書を配置した
- [ ] `task-workflow.md` の残課題テーブルに登録した

## 必須更新ファイル（全タスク共通）

- [ ] aiworkflow-requirements/LOGS.md を更新した
- [ ] task-specification-creator/LOGS.md を更新した
- [ ] **aiworkflow-requirements/SKILL.md の変更履歴にバージョンを追記した**
- [ ] **task-specification-creator/SKILL.md の変更履歴にバージョンを追記した**
```

### 2.7 Step 2: システム仕様更新（条件付き）

**更新判断**:

| 条件                          | 更新要否 |
| ----------------------------- | -------- |
| 新規インターフェース/型の追加 | 必要     |
| 既存インターフェースの変更    | 必要     |
| 内部実装の詳細変更のみ        | 不要     |

**本タスクの場合**:

| 変更内容                    | 更新要否 | 対象ファイル                  |
| --------------------------- | -------- | ----------------------------- |
| SkillFileManager クラス追加 | 必要     | interfaces-agent-sdk-skill.md |
| BackupInfo 型追加           | 必要     | interfaces-agent-sdk-skill.md |
| エラークラス追加            | 必要     | interfaces-agent-sdk-skill.md |

**⚠️ 更新不要の場合も documentation-changelog.md に「更新なし」と理由を明記すること**

## 3. Task 3: ドキュメント更新履歴作成

**ファイル**: `outputs/phase-12/documentation-changelog.md`

```markdown
# TASK-9A-A ドキュメント更新履歴

## 更新日: YYYY-MM-DD

### 更新ファイル一覧

| ファイル                      | 更新種別 | 内容                     |
| ----------------------------- | -------- | ------------------------ |
| interfaces-agent-sdk-skill.md | 追加     | SkillFileManager API定義 |
| arch-electron-services.md     | 更新     | サービス一覧追加         |
| LOGS.md (×2)                  | 追加     | 完了記録                 |

### artifacts.json更新

Phase 12 完了ステータスを更新。
```

## 4. Task 4: 未タスク検出レポート

**スキャン対象**:

- 元タスク仕様書の「スコープ外」項目
- Phase 3/10 レビュー結果の MINOR 指摘
- Phase 11 手動テストの発見事項
- コードコメント（TODO/FIXME/HACK/XXX）

```bash
# 未タスク検出スクリプト
node scripts/detect-unassigned-tasks.js --scan apps/desktop/src/main/services/skill --output .tmp/unassigned-candidates.json
```

**レポート形式**:

```markdown
# 未タスク検出レポート

## 検出日: YYYY-MM-DD

### 検出結果

| ID  | ソース     | 内容                           | 優先度 | 対応方針   |
| --- | ---------- | ------------------------------ | ------ | ---------- |
| U1  | スコープ外 | バックアップ自動クリーンアップ | 低     | 将来タスク |
| U2  | MINOR指摘  | （あれば記載）                 | -      | 未タスク化 |

### 検出件数: X件

（0件の場合も「検出件数: 0件」と明記）
```

## 5. 完了条件

- [ ] Task 1: 実装ガイド（Part 1 + Part 2）作成完了
- [ ] Task 2: システム仕様書更新 完了
  - [ ] Step 1-A: タスク完了記録（仕様書 + LOGS.md×2）
  - [ ] Step 1-B: 実装状況テーブル更新
  - [ ] Step 1-C: 関連タスクテーブル更新（Grep確認必須）
  - [ ] Step 1-D: topic-map.md再生成
  - [ ] Step 1-E: 未タスク指示書配置（1件以上検出時）
  - [ ] **Step 1完了チェックリスト全項目確認済み**
  - [ ] Step 2: システム仕様更新（条件付き）
  - [ ] **両SKILL.md変更履歴にバージョン追記済み**
- [ ] Task 3: ドキュメント更新履歴作成完了（全Step結果を個別に明記）
- [ ] Task 4: 未タスク検出レポート作成完了（0件でも出力必須）
- [ ] **本Phase内の全タスクを100%実行完了**
