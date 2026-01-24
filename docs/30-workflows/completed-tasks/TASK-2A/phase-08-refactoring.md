# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 8                               |
| Phase名    | リファクタリング                |
| 前提Phase  | Phase 7（テストカバレッジ確認） |
| 後続Phase  | Phase 9（品質保証）             |
| ステータス | 未実施                          |
| 作成日     | 2026-01-24                      |
| 機能名     | TASK-2A: SkillScanner           |

---

## 目的

TDD（テスト駆動開発）の Refactor フェーズとして、テストを維持しながらコードの品質を改善する。重複の除去、命名の改善、構造の最適化を行う。

## 背景

Phase 5 で「テストを通す最小限の実装」を行った。本フェーズでは、テストの Green 状態を維持しながら、コードの可読性・保守性・拡張性を向上させる。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: コード品質分析

**目的**: 現在のコードの改善ポイントを特定する

**実行手順**:

1. `SkillScanner.ts` を確認し、以下の観点で分析する：

| 観点             | 確認項目                                       | 問題箇所 |
| ---------------- | ---------------------------------------------- | -------- |
| 重複コード       | 同じロジックが複数箇所にないか                 |          |
| 命名             | 変数・メソッド名が意図を正確に表しているか     |          |
| 関数の長さ       | 1つの関数が長すぎないか（目安: 20行以内）      |          |
| ネストの深さ     | ネストが深すぎないか（目安: 3段階以内）        |          |
| マジックナンバー | 意味のない数値がハードコードされていないか     |          |
| エラーメッセージ | エラーメッセージが明確か                       |          |
| コメント         | 必要なコメントがあるか、不要なコメントがないか |          |

2. `outputs/phase-08/code-analysis.md` に分析結果を記録する

**期待される成果物**:

- `outputs/phase-08/code-analysis.md`

---

### タスク2: 定数の抽出

**目的**: マジックナンバーや文字列を定数として抽出する

**実行手順**:

1. 以下の定数を抽出する：

```typescript
// サブディレクトリ名の定数化
const SUB_DIRECTORIES = [
  "agents",
  "references",
  "scripts",
  "assets",
  "schemas",
  "indexes",
] as const;

// 既知のその他ファイル
const OTHER_FILES: Array<{ filename: string; type: SkillOtherFile["type"] }> = [
  { filename: "EVALS.json", type: "evals" },
  { filename: "LOGS.md", type: "logs" },
  { filename: "package.json", type: "package" },
];

// デフォルトパス
const DEFAULT_AIWORKFLOW_SKILLS_DIR = ".aiworkflow/skills";
const DEFAULT_CLAUDE_SKILLS_DIR = ".claude/skills";
```

2. 定数を使用するようにコードを修正する

**期待される成果物**:

- 定数の抽出と適用

---

### タスク3: メソッドの分割

**目的**: 長いメソッドを適切な粒度に分割する

**実行手順**:

1. `parseSkill` メソッドが長い場合、以下のように分割を検討する：

```typescript
private async parseSkill(
  skillPath: string,
  skillMdPath: string,
  readonly: boolean
): Promise<SkillMetadata | null> {
  try {
    const content = await this.readSkillMd(skillMdPath);
    const { frontmatter, body } = this.parseFrontmatter(content);
    const subResources = await this.scanAllSubDirectories(skillPath);
    const otherFiles = await this.scanOtherFiles(skillPath);

    return this.buildSkillMetadata(
      skillPath,
      skillMdPath,
      readonly,
      frontmatter,
      subResources,
      otherFiles
    );
  } catch (error) {
    this.logSkipWarning(skillPath, error);
    return null;
  }
}

private async readSkillMd(skillMdPath: string): Promise<string> {
  return fs.readFile(skillMdPath, 'utf-8');
}

private async scanAllSubDirectories(skillPath: string): Promise<SubResources> {
  const [agents, references, scripts, assets, schemas, indexes] =
    await Promise.all(
      SUB_DIRECTORIES.map(dir => this.scanSubDirectory(skillPath, dir))
    );
  return { agents, references, scripts, assets, schemas, indexes };
}
```

2. 分割後もテストが通ることを確認する

**期待される成果物**:

- メソッドの分割と適用

---

### タスク4: エラーハンドリングの改善

**目的**: エラーハンドリングを一貫性のある形式に改善する

**実行手順**:

1. 以下のパターンでエラーハンドリングを統一する：

```typescript
// カスタムエラークラスの検討
class SkillScanError extends Error {
  constructor(
    message: string,
    public readonly skillPath: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'SkillScanError';
  }
}

// ログ出力の統一
private logWarning(message: string, context?: Record<string, unknown>): void {
  console.warn(`[SkillScanner] ${message}`, context ?? '');
}
```

2. 改善後もテストが通ることを確認する

**期待される成果物**:

- エラーハンドリングの改善

---

### タスク5: 型安全性の強化

**目的**: 型安全性を向上させる

**実行手順**:

1. 以下の型安全性改善を行う：

```typescript
// frontmatter のパース結果に型を追加
interface SkillFrontmatter {
  name?: string;
  description?: string;
  'allowed-tools'?: string[];
  [key: string]: unknown;
}

private parseFrontmatter(content: string): {
  frontmatter: SkillFrontmatter;
  body: string;
} {
  // ...
}

// サブリソースの型を明確化
type SubDirectoryType = typeof SUB_DIRECTORIES[number];
```

2. 型エラーが発生しないことを確認する

**期待される成果物**:

- 型安全性の強化

---

### タスク6: リファクタリング後のテスト実行

**目的**: リファクタリング後もテストが全て通ることを確認する

**実行手順**:

1. テストを実行する：

```bash
pnpm --filter @repo/desktop test -- --run apps/desktop/src/main/services/skill/__tests__/SkillScanner.test.ts
```

2. 全テストが成功することを確認する

3. `outputs/phase-08/refactoring-result.md` に結果を記録する

**期待される成果物**:

- `outputs/phase-08/refactoring-result.md`

---

## 参照資料

| 参照資料       | パス                                                   | 内容                 |
| -------------- | ------------------------------------------------------ | -------------------- |
| Phase 5 実装   | `apps/desktop/src/main/services/skill/SkillScanner.ts` | リファクタリング対象 |
| Phase 7 テスト | `apps/desktop/src/main/services/skill/__tests__/`      | テストコード         |

---

## 成果物

| 成果物                   | パス                                                   | 内容               |
| ------------------------ | ------------------------------------------------------ | ------------------ |
| リファクタリング後コード | `apps/desktop/src/main/services/skill/SkillScanner.ts` | 品質改善後のコード |
| コード分析               | `outputs/phase-08/code-analysis.md`                    | 改善ポイント分析   |
| リファクタリング結果     | `outputs/phase-08/refactoring-result.md`               | テスト実行結果     |

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test -- --run apps/desktop/src/main/services/skill/__tests__/SkillScanner.test.ts
```

**確認項目**:

- [ ] リファクタリング後もテストが成功することを確認

---

## 統合テスト連携

**Phase 8 では統合テストへの影響を確認**:

- API（メソッドシグネチャ）が変更されていないこと
- エクスポートが維持されていること

---

## 完了条件

- [ ] コード品質分析が完了している
- [ ] 定数が適切に抽出されている
- [ ] 長いメソッドが適切に分割されている
- [ ] エラーハンドリングが改善されている
- [ ] 型安全性が強化されている
- [ ] リファクタリング後も全テストが成功している

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 7（テストカバレッジ確認）が完了していること
- **後続**: Phase 9（品質保証）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-import-agent-system/tasks/TASK-2A/phase-09-quality.md`
