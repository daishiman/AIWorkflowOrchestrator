# 検索・置換機能 パフォーマンス改善 - タスク指示書

## メタ情報

| 項目             | 内容                                             |
| ---------------- | ------------------------------------------------ |
| タスクID         | PERF-SR-001                                      |
| タスク名         | 検索・置換機能の並列処理実装                     |
| 分類             | パフォーマンス                                   |
| 対象機能         | WorkspaceSearchService / WorkspaceReplaceService |
| 優先度           | 高                                               |
| 見積もり規模     | 小規模                                           |
| ステータス       | 未実施                                           |
| 発見元           | Phase 7 - 最終レビューゲート                     |
| 発見日           | 2025-12-12                                       |
| 発見エージェント | .claude/agents/code-quality.md                                    |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

検索・置換機能のT-07-1最終レビューにおいて、.claude/agents/code-quality.mdエージェントが`WorkspaceSearchService`および`WorkspaceReplaceService`の並列処理実装の欠如を指摘した。現在の実装では、複数ファイルの処理が順次実行されており、大量ファイル処理時にパフォーマンスボトルネックとなる。

### 1.2 問題点・課題

- **順次処理による遅延**: 現在、ファイル処理は`for`ループで順次実行されており、I/O待ち時間が累積する
- **リソース非効率**: Node.jsの非同期I/O能力を活かしきれていない
- **ユーザー体験の低下**: 大規模プロジェクトでの検索・置換操作に時間がかかる

### 1.3 放置した場合の影響

- 100ファイル以上のプロジェクトで検索・置換操作が著しく遅くなる
- 競合製品（VS Code等）と比較してパフォーマンスが劣る
- ユーザー満足度の低下とアプリケーション離脱リスクの増加

---

## 2. 何を達成するか（What）

### 2.1 目的

`p-limit`パッケージを使用して、ファイル処理の並列実行を制御し、検索・置換操作のパフォーマンスを向上させる。

### 2.2 最終ゴール

- `WorkspaceSearchService.search()`が並列処理で複数ファイルを検索
- `WorkspaceReplaceService.replace()`が並列処理で複数ファイルを置換
- 同時実行数を適切に制限（デフォルト: 10）してシステムリソースを保護

### 2.3 スコープ

#### 含むもの

- `WorkspaceSearchService`への並列処理追加
- `WorkspaceReplaceService`への並列処理追加
- `p-limit`パッケージの導入
- 同時実行数の設定オプション追加
- 既存テストの更新
- 並列処理のテスト追加

#### 含まないもの

- UIコンポーネントの変更
- プログレスバーの実装（別タスク）
- キャンセル機能の実装（別タスク）

### 2.4 成果物

| 種別   | 成果物                            | 配置先                                                                    |
| ------ | --------------------------------- | ------------------------------------------------------------------------- |
| 機能   | 改修されたWorkspaceSearchService  | `apps/desktop/src/main/search/WorkspaceSearchService.ts`                  |
| 機能   | 改修されたWorkspaceReplaceService | `apps/desktop/src/main/replace/WorkspaceReplaceService.ts`                |
| テスト | 並列処理テスト                    | `apps/desktop/src/main/search/__tests__/WorkspaceSearchService.test.ts`   |
| テスト | 並列処理テスト                    | `apps/desktop/src/main/replace/__tests__/WorkspaceReplaceService.test.ts` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- 検索・置換機能のPhase 6品質ゲート通過済み
- 既存テストが全て成功していること
- Node.js環境でpnpmが利用可能であること

### 3.2 依存タスク

- なし（独立して実行可能）

### 3.3 必要な知識・スキル

- TypeScript
- Node.js非同期処理（Promise.all, async/await）
- `p-limit`パッケージの使用方法
- Vitestによるユニットテスト

### 3.4 推奨アプローチ

1. `p-limit`パッケージをdesktopパッケージに追加
2. 並列処理のヘルパー関数を作成
3. WorkspaceSearchServiceに並列処理を適用
4. WorkspaceReplaceServiceに並列処理を適用
5. 同時実行数を設定可能にするオプションを追加
6. テストを追加・更新

---

## 4. 実行手順

### Phase構成

```
Phase 0: 要件確認（省略可 - 本指示書で明確）
Phase 3: テスト作成 (TDD: Red)
Phase 4: 実装 (TDD: Green)
Phase 5: リファクタリング (TDD: Refactor)
Phase 6: 品質保証
```

### Phase 3: テスト作成 (TDD: Red)

#### 目的

並列処理の動作を検証するテストを作成する。

#### Claude Code スラッシュコマンド

> ターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:generate-unit-tests apps/desktop/src/main/search/WorkspaceSearchService.ts
/ai:generate-unit-tests apps/desktop/src/main/replace/WorkspaceReplaceService.ts
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェントリスト（動的選定）

- **エージェント**: .claude/agents/unit-tester.md
- **選定理由**: ユニットテスト作成の専門家であり、並列処理のテストケース設計に最適
- **代替候補**: .claude/agents/frontend-tester.md（E2Eが必要な場合）
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキルリスト（動的選定）

| スキル名                | 活用方法                                           | 選定理由                 |
| ----------------------- | -------------------------------------------------- | ------------------------ |
| .claude/skills/tdd-principles/SKILL.md          | Red-Green-Refactorサイクルの遵守                   | TDDの原則に従うため      |
| .claude/skills/test-doubles/SKILL.md            | モック・スタブの活用                               | 並列処理のテストで必要   |
| .claude/skills/boundary-value-analysis/SKILL.md | 境界値テスト（0ファイル、1ファイル、多数ファイル） | 並列処理の境界条件を検証 |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

- 並列処理テストケース（WorkspaceSearchService）
- 並列処理テストケース（WorkspaceReplaceService）

#### 完了条件

- [ ] 並列処理のテストケースが作成されている
- [ ] テストがRed状態（失敗）であることを確認

---

### Phase 4: 実装 (TDD: Green)

#### 目的

テストを成功させるための最小限の並列処理実装を行う。

#### Claude Code スラッシュコマンド

```
/ai:refactor apps/desktop/src/main/search/WorkspaceSearchService.ts
/ai:refactor apps/desktop/src/main/replace/WorkspaceReplaceService.ts
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェントリスト（動的選定）

- **エージェント**: .claude/agents/logic-dev.md
- **選定理由**: ビジネスロジック実装の専門家であり、非同期処理パターンに精通
- **代替候補**: .claude/agents/repo-dev.md（リポジトリ層が関係する場合）
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキルリスト（動的選定）

| スキル名             | 活用方法                     | 選定理由                   |
| -------------------- | ---------------------------- | -------------------------- |
| .claude/skills/network-resilience/SKILL.md   | 並列処理のエラーハンドリング | 部分的失敗への対応         |
| .claude/skills/type-safety-patterns/SKILL.md | 型安全な実装                 | TypeScriptの型システム活用 |

- **参照**: `.claude/skills/skill_list.md`

#### 実装コード例

```typescript
// WorkspaceSearchService.ts
import pLimit from 'p-limit';

interface SearchConfig {
  concurrency?: number; // デフォルト: 10
}

async search(options: SearchOptions, config: SearchConfig = {}): Promise<SearchResult[]> {
  const limit = pLimit(config.concurrency ?? 10);
  const filePaths = await this.globResolver.resolve(options.pattern);

  const promises = filePaths.map(filePath =>
    limit(() => this.searchService.search(filePath, options))
  );

  const results = await Promise.all(promises);
  return results.flat();
}
```

#### 成果物

- 並列処理が実装されたWorkspaceSearchService
- 並列処理が実装されたWorkspaceReplaceService

#### 完了条件

- [ ] p-limitパッケージが追加されている
- [ ] 並列処理が実装されている
- [ ] テストがGreen状態（成功）であることを確認

---

### Phase 5: リファクタリング (TDD: Refactor)

#### 目的

コード品質を改善しつつ、テストが継続して成功することを確認する。

#### Claude Code スラッシュコマンド

```
/ai:refactor apps/desktop/src/main/search/WorkspaceSearchService.ts
/ai:analyze-code-quality apps/desktop/src/main/search/
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェントリスト（動的選定）

- **エージェント**: .claude/agents/code-quality.md
- **選定理由**: コード品質改善の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキルリスト（動的選定）

| スキル名               | 活用方法           | 選定理由       |
| ---------------------- | ------------------ | -------------- |
| .claude/skills/refactoring-techniques/SKILL.md | 重複排除、命名改善 | コード品質向上 |
| .claude/skills/clean-code-practices/SKILL.md   | 可読性向上         | 保守性確保     |

- **参照**: `.claude/skills/skill_list.md`

#### 完了条件

- [ ] コードの重複が排除されている
- [ ] 命名が適切である
- [ ] リファクタリング後もテストが成功する

---

### Phase 6: 品質保証

#### 目的

品質基準を満たすことを検証する。

#### Claude Code スラッシュコマンド

```
/ai:run-all-tests --coverage
/ai:lint --fix
/ai:analyze-code-quality apps/desktop/src/main/
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェントリスト（動的選定）

- **エージェント**: .claude/agents/code-quality.md, .claude/agents/sec-auditor.md
- **選定理由**: 品質とセキュリティの両面から検証
- **参照**: `.claude/agents/agent_list.md`

#### 完了条件

- [ ] 全テスト成功
- [ ] カバレッジ80%以上維持
- [ ] Lintエラーなし
- [ ] 型エラーなし

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] WorkspaceSearchServiceで並列検索が動作する
- [ ] WorkspaceReplaceServiceで並列置換が動作する
- [ ] 同時実行数が設定可能である
- [ ] エラー時に適切に処理される

### 品質要件

- [ ] 全テストが成功する
- [ ] カバレッジが80%以上を維持
- [ ] Lint/型チェックがクリア
- [ ] 循環的複雑度が10未満

### ドキュメント要件

- [ ] 並列処理の設定オプションがコメントで説明されている

---

## 6. 検証方法

### テストケース

1. 並列処理で複数ファイルが検索される
2. 同時実行数制限が正しく機能する
3. 一部ファイルでエラーが発生しても他のファイルは処理される
4. 0ファイル、1ファイル、100ファイル以上でも正常動作する

### 検証手順

```bash
# テスト実行
pnpm --filter @repo/desktop test:run

# 特定テストのみ実行
pnpm --filter @repo/desktop test:run WorkspaceSearchService
pnpm --filter @repo/desktop test:run WorkspaceReplaceService
```

---

## 7. リスクと対策

| リスク               | 影響度 | 発生確率 | 対策                                   |
| -------------------- | ------ | -------- | -------------------------------------- |
| メモリ使用量増加     | 中     | 低       | 同時実行数を適切に制限（デフォルト10） |
| ファイルハンドル枯渇 | 高     | 低       | p-limitで同時オープン数を制限          |
| 部分的失敗の処理漏れ | 中     | 中       | Promise.allSettledの検討               |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/search-replace/task-step07-final-review.md` - 最終レビューレポート
- `docs/30-workflows/search-replace/task-step06-quality-report.md` - 品質レポート

### 参考資料

- [p-limit GitHub](https://github.com/sindresorhus/p-limit) - 並列処理制限ライブラリ
- [Node.js fs promises](https://nodejs.org/api/fs.html#fspromisesapi) - 非同期ファイル操作

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
| 優先度 | ファイル                   | 問題                     | 推奨対策                      |
| HIGH   | WorkspaceReplaceService.ts | 並列処理の欠如           | `p-limit`による並列処理実装   |
| HIGH   | WorkspaceSearchService.ts  | 並列処理の欠如           | 同上                          |
```

### 補足事項

- パフォーマンス測定（ベンチマーク）は別タスクとして検討可能
- プログレスバー表示との統合は将来的に検討
