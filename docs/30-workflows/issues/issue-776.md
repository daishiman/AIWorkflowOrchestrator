# [#776] "[UT-FIX-7-1-002] skillHandlers.ts 機能別分割"

## メタ情報

```yaml
task_id: UT-FIX-7-1-002
task_name: skillHandlers.ts 機能別分割
category: リファクタリング
target_feature: スキル管理 IPC ハンドラー
priority: 低
scale: 中規模
status: 未実施
source_phase: -
created_date: 2026-02-11
dependencies: []
spec_path: /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260209-202059-wt2/docs/30-workflows/completed-tasks/unassigned-task/task-ut-fix-7-1-002-skillhandlers-split.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

skillHandlers.ts は現在 455 行あり、以下の複数ドメインのハンドラーが混在している：

1. **基本的なスキル管理**（list, scan, getImported, import, remove, get-detail）
2. **スキル実行関連**（execute, abort, get-status）
3. **TASK-9C スキル改善機能**（analyze, improve, optimize, optimize:variants, optimize:evaluate）

単一責務原則（SRP）に反し、ファイルの保守性・可読性が低下している。

### 1.2 問題点・課題

- 1 ファイルに 15 個の IPC ハンドラーが集中している
- スキル実行とスキル改善は異なるドメインであり、変更理由が異なる
- ファイルが大きくなるにつれ、コードナビゲーションが困難になる
- テストファイルも肥大化する傾向がある

### 1.3 放置した場合の影響

- 新しいハンドラー追加時にファイルがさらに肥大化
- 関連するテストファイルも 500 行以上になる可能性
- チーム開発時のマージコンフリクトが増加
- コードレビューの負荷増大

---

## 2. 何を達成するか（What）

### 2.1 目的

skillHandlers.ts を機能別に分割し、単一責務原則に準拠した構造にリファクタリングする。

### 2.2 最終ゴール

- 機能別に 3 つのハンドラーファイルに分割される
- 各ファイルが 200 行以下になる
- 既存の動作が維持される（テスト全 PASS）
- インデックスファイルで統一的にエクスポートされる

### 2.3 スコープ

#### 含むもの

- skillHandlers.ts の分割
- 対応するテストファイルの分割
- インデックスファイルの作成・更新

#### 含まないもの

- IPC チャンネルの追加・削除
- ハンドラーのロジック変更
- Preload/Renderer 側の変更

### 2.4 成果物

| 成果物                     | パス                                                                           |
| -------------------------- | ------------------------------------------------------------------------------ |
| スキル管理ハンドラー       | `apps/desktop/src/main/ipc/skillHandlers.ts`（基本管理のみ）                   |
| スキル実行ハンドラー       | `apps/desktop/src/main/ipc/skillExecutionHandlers.ts`（新規）                  |
| スキル改善ハンドラー       | `apps/desktop/src/main/ipc/skillImprovementHandlers.ts`（新規）                |
| インデックス               | `apps/desktop/src/main/ipc/skill/index.ts`（新規）                             |
| 分割後テスト（スキル管理） | `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`                    |
| 分割後テスト（実行）       | `apps/desktop/src/main/ipc/__tests__/skillExecutionHandlers.test.ts`（新規）   |
| 分割後テスト（改善）       | `apps/desktop/src/main/ipc/__tests__/skillImprovementHandlers.test.ts`（新規） |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION が完了していること
- 既存テストが全て PASS していること

### 3.2 依存タスク

| タスクID                              | 依存内容             |
| ------------------------------------- | -------------------- |
| TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION | 対象コードの実装完了 |

### 3.3 必要な知識

- Electron IPC ハンドラーパターン
- TypeScript モジュール分割
- Jest/Vitest テストファイル構成

### 3.4 システム仕様書参照

| 仕様書                      | 参照セクション       |
| --------------------------- | -------------------- |
| `01-architecture.md`        | 単一責務原則（SRP）  |
| `arch-electron-services.md` | IPC ハンドラー構成   |
| `04-electron-security.md`   | IPC セキュリティ原則 |

### 3.5 実装課題と解決策（TASK-FIX-7-1からの学び）

TASK-FIX-7-1-EXECUTE-SKILL-DELEGATIONの実装で遭遇した課題と解決策を記録する。
このタスクを実行する際の参考情報として活用すること。

#### 課題1: Setter Injection パターンの選択

| 観点    | 内容                                                                                                               |
| ------- | ------------------------------------------------------------------------------------------------------------------ |
| 問題    | SkillExecutorはBrowserWindowを必要とするため、skillHandlers.ts内でSkillServiceのコンストラクタ時点では生成できない |
| 解決策  | Setter Injection パターンを採用。`skillService.setSkillExecutor(executor)`でハンドラー登録時に注入                 |
| 参照    | `architecture-implementation-patterns.md` - Setter Injection パターン                                              |
| Pitfall | `06-known-pitfalls.md#P32` - 遅延初期化DI                                                                          |

#### 課題2: テストモックの大規模修正

| 観点    | 内容                                                                                                                             |
| ------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 問題    | SkillExecutorをSkillServiceにDIで追加したため、既存の5つのテストファイルにmockSkillExecutorを追加する必要があった                |
| 解決策  | (1) grep -rn で影響範囲を事前調査 (2) 各テストファイルにモックを定義 (3) beforeEachでリセット (4) 標準モック構成をドキュメント化 |
| 参照    | `lessons-learned.md` - テストモックの大規模修正                                                                                  |
| Pitfall | `06-known-pitfalls.md#P33` - DI追加時のテストモック                                                                              |

#### 課題3: ファイル分割時の依存関係

| 観点   | 内容                                                                                       |
| ------ | ------------------------------------------------------------------------------------------ |
| 問題   | skillHandlers.ts を分割する場合、\_skillExecutorInstance等のモジュールレベル変数の共有方法 |
| 解決策 | 分割後は各ファイルでDIパターンを使用し、共有変数を避ける設計を推奨                         |
| 参照   | `01-architecture.md` - 単一責務原則(SRP)                                                   |

#### システム仕様書参照

| 仕様書                                    | 参照セクション   | 適用内容             |
| ----------------------------------------- | ---------------- | -------------------- |
| `architecture-implementation-patterns.md` | Setter Injection | 遅延初期化DIパターン |
| `06-known-pitfalls.md`                    | P32, P33         | DI関連の既知問題     |
| `lessons-learned.md`                      | 全体             | TASK-FIX-7-1の教訓   |

### 3.6 推奨アプローチ

#### 分割構成

```
apps/desktop/src/main/ipc/
├── skill/
│   ├── index.ts                  # 統合エクスポート
│   ├── skillHandlers.ts          # list, scan, getImported, import, remove, get-detail
│   ├── skillExecutionHandlers.ts # execute, abort, get-status
│   └── skillImprovementHandlers.ts # analyze, improve, optimize系
└── __tests__/
    ├── skillHandlers.test.ts
    ├── skillExecutionHandlers.test.ts
    └── skillImprovementHandlers.test.ts
```

#### index.ts の実装

```typescript
export {
  registerSkillHandlers,
  unregisterSkillHandlers,
} from "./skillHandlers";
export {
  registerSkillExecutionHandlers,
  unregisterSkillExecutionHandlers,
} from "./skillExecutionHandlers";
export {
  registerSkillImprovementHandlers,
  unregisterSkillImprovementHandlers,
} from "./skillImprovementHandlers";

// 統合登録関数
export function registerAllSkillHandlers(
  mainWindow: BrowserWindow,
  skillService: SkillService,
): void {
  registerSkillHandlers(mainWindow, skillService);
  registerSkillExecutionHandlers(mainWindow, skillService);
  registerSkillImprovementHandlers(mainWindow, skillService);
}

export function unregisterAllSkillHandlers(): void {
  unregisterSkillHandlers();
  unregisterSkillExecutionHandlers();
  unregisterSkillImprovementHandlers();
}
```

---

## 4. 実行手順

### Phase構成

標準 Phase 1-13 に従う。

### Phase 2: 設計

#### 目的

分割境界の確定とファイル構成の設計

#### 手順

1. 現在の skillHandlers.ts のハンドラー一覧を整理
2. 機能別グループを確定（管理/実行/改善）
3. 共通依存（mainWindow, skillService 等）の受け渡し方法を設計
4. インデックスファイルの設計

### Phase 5: 実装

#### 手順

1. skill/ ディレクトリを作成
2. skillExecutionHandlers.ts を新規作成（execute, abort, get-status）
3. skillImprovementHandlers.ts を新規作成（analyze, improve, optimize系）
4. skillHandlers.ts を skill/ に移動し、基本管理のみに縮小
5. index.ts で統合エクスポート
6. 呼び出し元（main.ts 等）の更新

### Phase 4/6: テスト

#### 手順

1. 既存テストを機能別に分割
2. 各ファイルのテストが独立して実行可能であることを確認
3. 統合テストで全ハンドラーの動作を検証

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] skillHandlers.ts が 200 行以下になっている
- [ ] skillExecutionHandlers.ts が新規作成されている
- [ ] skillImprovementHandlers.ts が新規作成されている
- [ ] 全 15 ハンドラーが正しく動作する

### 品質要件

- [ ] 既存テストが全て PASS
- [ ] Lint エラーなし
- [ ] 型エラーなし
- [ ] 各ファイルが単一責務を満たす

### ドキュメント要件

- [ ] 各ファイルに JSDoc コメント追加
- [ ] 分割の意図を説明するコメント追加

---

## 6. 検証方法

### テストケース

| #   | テストケース                     | 期待結果             |
| --- | -------------------------------- | -------------------- |
| 1   | skill:list ハンドラー呼び出し    | スキル一覧が返される |
| 2   | skill:execute ハンドラー呼び出し | スキルが実行される   |
| 3   | skill:analyze ハンドラー呼び出し | 分析結果が返される   |
| 4   | 全ハンドラーの登録/解除          | エラーなく完了       |

### 検証手順

1. `pnpm test apps/desktop/src/main/ipc/__tests__/skill*` を実行
2. 全テストが PASS することを確認
3. `pnpm lint` でエラーがないことを確認
4. 開発サーバーでスキル機能が動作することを手動確認

---

## 7. リスクと対策

| リスク                       | 影響度 | 発生確率 | 対策                                 |
| ---------------------------- | ------ | -------- | ------------------------------------ |
| 循環依存の発生               | 中     | 低       | index.ts で依存方向を統一            |
| ハンドラー登録漏れ           | 高     | 低       | 統合テストで全チャンネルを検証       |
| モジュールスコープ変数の分離 | 中     | 中       | \_skillExecutorInstance を適切に共有 |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント            | パス                                         |
| ----------------------- | -------------------------------------------- |
| アーキテクチャルール    | `.claude/rules/01-architecture.md`           |
| Electron セキュリティ   | `.claude/rules/04-electron-security.md`      |
| 現在の skillHandlers.ts | `apps/desktop/src/main/ipc/skillHandlers.ts` |

### 参考資料

- Electron IPC ベストプラクティス
- TypeScript モジュール設計パターン

---

## 9. 備考

### 発見経緯

```
TASK-FIX-7-1 Phase 12 コード品質確認:
skillHandlers.ts が 455 行に達し、3つの異なるドメイン（管理/実行/改善）が混在。
01-architecture.md の単一責務原則に反するため、分割を未タスクとして記録。
```

### 補足事項

- 分割後も `registerSkillHandlers` という名前で統合登録関数を提供し、呼び出し元の変更を最小化
- TASK-9C（スキル改善機能）で追加されたハンドラーが分割のトリガー
- 将来的にスキル作成機能（TASK-9B）のハンドラーが追加される可能性があり、この分割は拡張性向上にも寄与
