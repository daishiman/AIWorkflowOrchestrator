# SkillStreamMessage Discriminated Union 移行 - タスク指示書

## メタ情報

```yaml
issue_number: 741
```

## メタ情報

| 項目         | 内容                                                  |
| ------------ | ----------------------------------------------------- |
| タスクID     | TASK-FIX-1-4                                          |
| タスク名     | SkillStreamMessage の Discriminated Union 移行        |
| 分類         | リファクタリング                                      |
| 対象機能     | Skill System                                          |
| 優先度       | 中                                                    |
| 見積もり規模 | 中規模                                                |
| ステータス   | 未着手                                                |
| 発見元       | TASK-FIX-1-2（SkillExecutor型クリーンアップ）Phase 10 |
| 発見日       | 2026-02-07                                            |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-FIX-1-2（SkillExecutor型クリーンアップ）の実装において、SkillStreamMessage の
型設計に不一致が発見された。SkillExecutorは単純な `type` フィールドを持つ型を使用
しているが、正本型は Discriminated Union パターンを採用している。

### 1.2 問題点・課題

- **型設計の不一致**: SkillExecutor内の `SkillStreamMessage` は単純型（`type: 'text' | 'tool_use' | ...`）を使用
- **正本型との乖離**: `packages/shared` の正本型は Discriminated Union パターン（`{ type: 'text'; content: string } | { type: 'tool_use'; toolName: string; ... }`）を採用
- **型安全性の低下**: 単純型では各 `type` に対応するペイロードの型チェックが不十分

### 1.3 放置した場合の影響

- `type` と対応するペイロードの組み合わせミスがコンパイル時に検出されない
- メッセージ処理時の switch/case 文で型推論が効かない
- 将来の新しいメッセージタイプ追加時に網羅性チェックが機能しない

---

## 2. 何を達成するか（What）

### 2.1 目的

SkillExecutorの `SkillStreamMessage` を正本型の Discriminated Union パターンに
完全移行し、型安全性を向上させる。

### 2.2 最終ゴール

- SkillExecutorが正本型の Discriminated Union を使用
- switch/case 文での型推論が正常に機能
- 網羅性チェック（exhaustive check）が有効化

### 2.3 スコープ

#### 含むもの

- SkillExecutor内のローカル SkillStreamMessage 型の削除
- 正本型のインポートと使用
- メッセージ処理ロジックの Discriminated Union 対応
- 関連テストの更新

#### 含まないもの

- 新しいメッセージタイプの追加
- IPC Handler層の大規模変更
- UI層のメッセージ表示ロジック変更

### 2.4 成果物

| 成果物            | 説明                                       |
| ----------------- | ------------------------------------------ |
| SkillExecutor更新 | Discriminated Union 対応したメッセージ処理 |
| 型ガード関数      | 必要に応じて型ガード関数を追加             |
| テスト更新        | 各メッセージタイプのテストケース           |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-FIX-1-2（SkillExecutor型クリーンアップ）完了
- `packages/shared` の SkillStreamMessage Discriminated Union が定義済み

### 3.2 依存タスク

| タスクID     | タスク名                      | ステータス |
| ------------ | ----------------------------- | ---------- |
| TASK-FIX-1-2 | SkillExecutor型クリーンアップ | 完了       |

### 3.3 必要な知識

- TypeScript Discriminated Unions
- 型ガード関数（Type Guards）
- Exhaustive check パターン

### 3.4 システム仕様書参照（aiworkflow-requirements）

本タスクの実装に際して、以下のシステム仕様書を参照すること：

| 仕様書       | パス                                                 | 参照理由                     |
| ------------ | ---------------------------------------------------- | ---------------------------- |
| 型定義仕様   | `references/interfaces-agent-sdk-skill.md`           | 型の正式仕様と完了タスク記録 |
| 型移行記録   | `references/skill-executor-type-migration.md`        | TASK-FIX-1-2の詳細と学び     |
| 実装パターン | `references/architecture-implementation-patterns.md` | 型統合パターン               |
| 品質基準     | `references/quality-requirements.md`                 | テストカバレッジ基準         |

### 3.5 実装課題と解決策（TASK-FIX-1-2からの学び）

TASK-FIX-1-2の実装で得られた知見を本タスクに適用する：

| 課題                     | 解決策                                                         | 教訓                                                  |
| ------------------------ | -------------------------------------------------------------- | ----------------------------------------------------- |
| 型の差異特定が煩雑       | 型比較表を作成し、フィールド名・型・オプショナル性を整理       | 移行前に「型比較表」を作成する                        |
| index.tsエクスポート漏れ | 型追加時に必ずindex.tsも同時更新。`pnpm typecheck`で即座に検証 | チェックリスト: 1.型定義追加→2.export追加→3.typecheck |
| テスト互換性確認         | 型移行専用テストファイル（\*.type-migration.test.ts）を作成    | リファクタリング時は「移行テスト」を別ファイルで作成  |

**適用推奨パターン**:

- skill-creator patterns.mdの「型移行パターン」セクション（TM-S1〜S3, TM-F1〜F2）を参照
- 完全一致型を優先移行し、差異ありの型は段階的に対応

**本タスク固有の課題**:

| 課題             | 詳細                                                                                                 | 解決策                                                       |
| ---------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| 構造差異         | ローカル: 単純型 / 正本: Discriminated Union                                                         | Discriminated Unionへの段階的移行                            |
| type値の差異     | ローカル: `text/tool_use/error/complete/retry` / 正本: `assistant/tool_use/tool_result/status/error` | type値のマッピングレイヤーを作成、または正本型に合わせて統一 |
| ペイロード型差異 | 各type毎のペイロード構造が異なる                                                                     | BaseStreamMessage抽出パターンを参考に共通フィールドを抽出    |

### 3.6 推奨アプローチ

1. 正本型の構造を確認し、SkillExecutorの使用パターンと照合
2. ローカル型を削除し、正本型に置き換え
3. switch/case 文を Discriminated Union に対応させる
4. 必要に応じて型ガード関数を作成

---

## 4. 実行手順

### Phase 1: 現状分析

1. SkillExecutor内の SkillStreamMessage 使用箇所を特定
2. 各 `type` 値とペイロードの組み合わせを列挙
3. 正本型との差分を明確化

### Phase 2: 型移行

1. ローカル型定義を削除
2. 正本型をインポート
3. TypeScriptコンパイルエラーを解消

### Phase 3: ロジック更新

1. switch/case 文を Discriminated Union 対応に修正

```typescript
// Before
switch (message.type) {
  case "text":
    console.log(message.content); // any型
    break;
}

// After
switch (message.type) {
  case "text":
    console.log(message.content); // string型として推論
    break;
}
```

2. exhaustive check を追加

```typescript
default:
  const _exhaustive: never = message;
  throw new Error(`Unhandled message type: ${_exhaustive}`);
```

### Phase 4: 型ガード関数（必要な場合）

```typescript
function isTextMessage(msg: SkillStreamMessage): msg is TextStreamMessage {
  return msg.type === "text";
}
```

### Phase 5: テスト・検証

1. 各メッセージタイプのテストケースを作成
2. 型推論が正しく機能することを確認
3. E2E動作確認

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] SkillExecutor内のローカル型が削除されている
- [ ] 正本型の Discriminated Union を使用している
- [ ] switch/case 文で型推論が機能している
- [ ] exhaustive check が有効化されている

### 品質要件

- [ ] 既存テストが全てパス
- [ ] 新規テストケースが追加されている
- [ ] コードレビューをパス

### ドキュメント要件

- [ ] 型ガード関数にJSDocコメントが記載されている
- [ ] CHANGELOG への記録

---

## 6. 検証方法

### テストケース

| #   | テストケース                 | 期待結果                            |
| --- | ---------------------------- | ----------------------------------- |
| 1   | text メッセージの処理        | content が string として型推論      |
| 2   | tool_use メッセージの処理    | toolName, args が正しく型推論       |
| 3   | tool_result メッセージの処理 | result が正しく型推論               |
| 4   | error メッセージの処理       | error が正しく型推論                |
| 5   | 未知のメッセージタイプ       | exhaustive check でコンパイルエラー |

### 検証手順

1. `pnpm typecheck` でコンパイルエラーがないことを確認
2. `pnpm test` で全テストがパスすることを確認
3. 新しいメッセージタイプを追加した場合にコンパイルエラーになることを確認

---

## 7. リスクと対策

| リスク                         | 影響度 | 発生確率 | 対策                     |
| ------------------------------ | ------ | -------- | ------------------------ |
| 正本型とSkillExecutorの不一致  | 高     | 中       | 事前に差分分析を実施     |
| メッセージ処理ロジックの複雑化 | 中     | 低       | 型ガード関数で可読性維持 |
| ランタイムでの型不一致         | 高     | 低       | バリデーション処理の追加 |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                    | パス                                                                       |
| ------------------------------- | -------------------------------------------------------------------------- |
| TypeScript Discriminated Unions | https://www.typescriptlang.org/docs/handbook/unions-and-intersections.html |
| Skill型定義                     | `packages/shared/src/types/skill.ts`                                       |
| TASK-FIX-1-2成果物              | `docs/30-workflows/TASK-FIX-1-2-skillexecutor-type-cleanup/`               |

### 関連タスク

| タスクID     | 関係 | 説明                                |
| ------------ | ---- | ----------------------------------- |
| TASK-FIX-1-2 | 先行 | SkillExecutor型クリーンアップ       |
| TASK-FIX-1-3 | 並行 | SkillExecutionRequest/Response 統一 |
| TASK-FIX-1-5 | 並行 | SkillMetadata 型統一                |

---

## 9. 備考

### 発見元の原文

```
Phase 10レビューにて検出:
- SkillExecutor内は単純型（`type: 'text' | 'tool_use' | ...`）を使用
- 正本型は Discriminated Union パターンを採用
- 対応: 正本型の Discriminated Union パターンに移行
```

### 補足事項

- Discriminated Union により、switch 文内での型推論が自動的に絞り込まれる
- exhaustive check により、新しいメッセージタイプ追加時にコンパイルエラーで検知可能
- TASK-FIX-1-3、TASK-FIX-1-5 と同時に実施することで効率化が期待できる

### Discriminated Union の例

```typescript
// 正本型の構造
type SkillStreamMessage =
  | { type: "text"; content: string }
  | { type: "tool_use"; toolName: string; args: unknown }
  | { type: "tool_result"; toolName: string; result: unknown }
  | { type: "error"; error: string; code?: number };

// 使用例
function handleMessage(msg: SkillStreamMessage) {
  switch (msg.type) {
    case "text":
      // msg は { type: 'text'; content: string } として推論
      console.log(msg.content);
      break;
    case "tool_use":
      // msg は { type: 'tool_use'; toolName: string; args: unknown } として推論
      console.log(msg.toolName, msg.args);
      break;
    // ...
  }
}
```
