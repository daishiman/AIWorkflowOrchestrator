# 実装ガイド: PermissionDialogツールリスクレベル・セキュリティメタデータ表示

## メタ情報

| 項目   | 内容                                  |
| ------ | ------------------------------------- |
| Phase  | 12                                    |
| 機能名 | task-imp-permission-tool-metadata-001 |
| Issue  | #606                                  |
| 作成日 | 2026-01-31                            |

---

# Part 1: 初学者・中学生レベルの概念説明

## なぜ必要か

スマートフォンのアプリがカメラや位置情報にアクセスする許可を求めるとき、「このアプリはカメラを使いたがっています」と表示されますよね。でも、「カメラを使う」と「連絡先を全部読む」では危険度が全然違います。

この機能は、AIが使うツール（道具）ごとに**「安全度」のラベル**を付けて、信号機のように色で教えてくれるものです。

## 何をするか

AIエージェントがコンピューターの操作をするとき、「この操作をしていいですか？」とユーザーに確認を求めます。そのとき、**操作がどれくらい危険か**を色付きのラベルで表示します。

## どう動くか

ツールごとに4段階の安全度ラベルが付いています:

- **緑（Low / 安全）**: ファイルを読むだけ、検索するだけ。データを変えたりしません
- **黄色（Medium / 注意）**: ファイルを書き換えたり、インターネットからデータを取ったりします
- **オレンジ（High / 危険）**: コンピューターにコマンド（命令）を送ります。何でもできてしまう可能性があります
- **赤（Critical / 非常に危険）**: 最も危険な操作です（現在はこのレベルのツールは定義されていません）

### 具体的な例

- AIが「ファイルの中身を見せて」と言ったとき → **緑色のラベル**が出て、「安全な操作ですよ」と分かる
- AIが「新しいファイルを作りたい」と言ったとき → **黄色のラベル**が出て、「注意が必要です」と分かる
- AIが「コマンドを実行したい」と言ったとき → **オレンジのラベル**が出て、「よく確認してから許可してください」と分かる

### なぜ色で表示するの？

- 色は一瞬で「危険度」が分かる（信号機と同じ）
- 色だけでなくテキスト（Low/Medium/High/Critical）も一緒に表示するので、色が見えにくい人にも分かる
- 画面読み上げソフト（スクリーンリーダー）を使う人には「リスクレベル: High」と音声で伝わる

---

# Part 2: 技術者レベルの詳細説明

## モジュール構成

```
apps/desktop/src/renderer/components/skill/
├── toolMetadata.ts          ← 新規作成（リスクレベル・セキュリティ影響定義）
├── PermissionDialog.tsx     ← 修正（リスクバッジ統合）
└── permissionDescriptions.ts  （既存・変更なし）
```

## インターフェース/型定義

```typescript
/** リスクレベル型 */
export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

/** ツールメタデータ型 */
export interface ToolMetadata {
  riskLevel: RiskLevel;
  securityImpact: string;
}
```

## 公開API

```typescript
/** ツール名からリスクレベルを取得。未定義ツール → 'Medium' */
getRiskLevel(toolName: string): RiskLevel

/** ツール名からセキュリティ影響テキストを取得。未定義ツール → 'ツールを実行します' */
getSecurityImpact(toolName: string): string

/** ツール名からメタデータ全体を取得。未定義ツール → DEFAULT_METADATA */
getToolMetadata(toolName: string): ToolMetadata
```

## 使用例

```typescript
import {
  getRiskLevel,
  getSecurityImpact,
  getToolMetadata,
} from "./toolMetadata";

// 個別取得
const level = getRiskLevel("Bash"); // → 'High'
const impact = getSecurityImpact("Bash"); // → 'システムコマンドを実行します。任意のコード実行が可能です'

// メタデータ全体取得
const meta = getToolMetadata("Read");
// → { riskLevel: 'Low', securityImpact: 'ファイルの内容を読み取ります' }

// 未定義ツール（フォールバック）
const unknown = getToolMetadata("UnknownTool");
// → { riskLevel: 'Medium', securityImpact: 'ツールを実行します' }
```

## デフォルト値

未定義ツールに対するフォールバック:

```typescript
const DEFAULT_METADATA: ToolMetadata = {
  riskLevel: "Medium",
  securityImpact: "ツールを実行します",
};
```

## ツール定義一覧（12ツール）

| ツール名     | リスクレベル | セキュリティ影響テキスト                                 |
| ------------ | ------------ | -------------------------------------------------------- |
| Bash         | High         | システムコマンドを実行します。任意のコード実行が可能です |
| Read         | Low          | ファイルの内容を読み取ります                             |
| Write        | Medium       | ファイルに新しい内容を書き込みます                       |
| Edit         | Medium       | 既存ファイルの内容を変更します                           |
| Glob         | Low          | ファイルパターンで検索します                             |
| Grep         | Low          | テキスト内容を検索します                                 |
| WebSearch    | Low          | Web検索を実行します                                      |
| Task         | Medium       | サブタスクを実行します                                   |
| NotebookEdit | Medium       | Jupyterノートブックを編集します                          |
| WebFetch     | Medium       | Webコンテンツを取得します                                |
| Skill        | Medium       | スキルを実行します                                       |
| AskUser      | Low          | ユーザーに確認を行います                                 |

## Tailwind CSSクラスマッピング

PermissionDialog.tsxの`RISK_LEVEL_STYLES`定数:

| RiskLevel | 背景色        | テキスト色      | ボーダー色        |
| --------- | ------------- | --------------- | ----------------- |
| Low       | bg-green-100  | text-green-800  | border-green-200  |
| Medium    | bg-yellow-100 | text-yellow-800 | border-yellow-200 |
| High      | bg-orange-100 | text-orange-800 | border-orange-200 |
| Critical  | bg-red-100    | text-red-800    | border-red-200    |

WCAGコントラスト比: 全レベルで6.4:1以上（AA基準4.5:1を満たす）

## エラーハンドリング

- 未定義ツール名 → `DEFAULT_METADATA`（Medium）を返す
- 空文字列 → `DEFAULT_METADATA`を返す
- `null`/`undefined` → TypeScriptの型チェックで防止（引数は`string`型）
- TOOL_METADATAはオブジェクトリテラルの定数で、プロトタイプ汚染リスクなし

## PermissionDialogへの統合

リスクバッジはツール名バッジの右横にインライン表示:

```
[ツール: 💻 Bash] [High]     ← ツールバッジ + リスクバッジ
コマンドを実行しようとしています: ls -la  ← 人間可読説明文
システムコマンドを実行します。任意のコード実行が可能です  ← セキュリティ影響テキスト
[詳細を隠す ▲]               ← 既存の詳細トグル
```

アクセシビリティ: `aria-label="リスクレベル: {level}"`でスクリーンリーダー対応

## テスト構成

| テストファイル                     | テスト数 | 内容                                      |
| ---------------------------------- | -------- | ----------------------------------------- |
| toolMetadata.test.ts               | 37       | 純関数テスト（12ツール+エッジケース）     |
| PermissionDialog.metadata.test.tsx | 19       | UIバッジ表示・色・a11y・回帰テスト        |
| **合計**                           | **56**   | カバレッジ: Lines/Branches/Functions 100% |
