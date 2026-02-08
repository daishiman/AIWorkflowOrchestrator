# SkillExecutionRequest/Response 型統一 - タスク指示書

## メタ情報

```yaml
issue_number: 742
```

## メタ情報

| 項目         | 内容                                                  |
| ------------ | ----------------------------------------------------- |
| タスクID     | TASK-FIX-1-3                                          |
| タスク名     | SkillExecutionRequest/Response の型統一               |
| 分類         | リファクタリング                                      |
| 対象機能     | Skill System                                          |
| 優先度       | 中                                                    |
| 見積もり規模 | 小規模                                                |
| ステータス   | 未着手                                                |
| 発見元       | TASK-FIX-1-2（SkillExecutor型クリーンアップ）Phase 10 |
| 発見日       | 2026-02-07                                            |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-FIX-1-2（SkillExecutor型クリーンアップ）の実装において、SkillExecutorのローカル型を
`packages/shared` の正本型に移行する作業を行った。その過程で、SkillExecutionRequest と
SkillExecutionResponse に互換性の課題が発見された。

### 1.2 問題点・課題

- **フィールド名の不一致**: SkillExecutor内の `SkillExecutionRequest` は `skillId` フィールドを使用しているが、正本型は `skillName` フィールドを使用している
- **型の拡張が必要**: 正本型をそのまま使用すると、既存のSkillExecutorの内部ロジックを大幅に変更する必要がある
- **二重定義の問題**: 同じ概念を表す型が2箇所に存在し、保守性を低下させている

### 1.3 放置した場合の影響

- 型定義の二重管理によるメンテナンスコストの増加
- 将来の機能追加時にどちらの型を使用すべきか混乱が生じる
- 型安全性が損なわれ、ランタイムエラーのリスクが増加

---

## 2. 何を達成するか（What）

### 2.1 目的

SkillExecutorの `SkillExecutionRequest` と `SkillExecutionResponse` を
`packages/shared` の正本型に完全に統一する。

### 2.2 最終ゴール

- 正本型（`packages/shared`）にSkillExecutorが必要とするフィールドを追加
- SkillExecutor内のローカル型定義を削除
- 全ての呼び出し元で正本型を使用

### 2.3 スコープ

#### 含むもの

- `packages/shared/src/types/skill.ts` の SkillExecutionRequest 型拡張
- `packages/shared/src/types/skill.ts` の SkillExecutionResponse 型確認・拡張
- SkillExecutor内のローカル型削除
- 呼び出し元の型参照更新

#### 含まないもの

- SkillExecutorのビジネスロジック変更
- IPC Handler層の実装変更
- 新規機能追加

### 2.4 成果物

| 成果物              | 説明                                        |
| ------------------- | ------------------------------------------- |
| 正本型更新          | `packages/shared/src/types/skill.ts` の修正 |
| SkillExecutor型削除 | ローカル型定義の削除                        |
| 型移行テスト        | 型互換性を検証するテストケース              |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-FIX-1-2（SkillExecutor型クリーンアップ）完了

### 3.2 依存タスク

| タスクID     | タスク名                      | ステータス |
| ------------ | ----------------------------- | ---------- |
| TASK-FIX-1-2 | SkillExecutor型クリーンアップ | 完了       |

### 3.3 必要な知識

- TypeScript型システム（Union型、オプショナルフィールド）
- packages/shared の型エクスポート構造
- SkillExecutorの内部処理フロー

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

| 課題               | 詳細                                                       | 解決策                                                   |
| ------------------ | ---------------------------------------------------------- | -------------------------------------------------------- |
| フィールド名不一致 | ローカル: `skillId` / 正本: `skillName`                    | オプショナルフィールドとして両方をサポートする過渡的対応 |
| error型差異        | ローカル: `SkillExecutionError`（構造体） / 正本: `string` | 正本型を拡張してエラー構造体をサポート                   |
| Response互換性     | 結果フィールドの型差異                                     | 正本型のフィールドをオプショナルとして追加               |

### 3.6 推奨アプローチ

1. 正本型に `skillId` フィールドをオプショナルとして追加
2. SkillExecutor内で `skillId` を優先的に使用するロジックを維持
3. 将来的に `skillName` への完全移行を検討（別タスク）

---

## 4. 実行手順

### Phase 1: 型分析

1. 現在の SkillExecutionRequest の使用箇所を全て特定
2. `skillId` と `skillName` の使い分けパターンを分析
3. 互換性を維持するための型設計を決定

### Phase 2: 正本型拡張

1. `packages/shared/src/types/skill.ts` を更新
2. `skillId?: string` フィールドを SkillExecutionRequest に追加
3. 必要に応じて SkillExecutionResponse も拡張
4. packages/shared のエクスポートを更新

### Phase 3: SkillExecutor更新

1. ローカル型定義を削除
2. 正本型のインポートに置き換え
3. TypeScriptコンパイルエラーを解消

### Phase 4: テスト・検証

1. 既存テストが全てパスすることを確認
2. 型互換性テストを追加
3. E2E動作確認

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 正本型に `skillId` フィールドが追加されている
- [ ] SkillExecutor内のローカル型が削除されている
- [ ] 全ての呼び出し元で正本型を使用している
- [ ] TypeScriptコンパイルエラーがない

### 品質要件

- [ ] 既存テストが全てパス
- [ ] 型カバレッジが維持されている
- [ ] コードレビューをパス

### ドキュメント要件

- [ ] 型変更の理由がコメントで記載されている
- [ ] CHANGELOG への記録

---

## 6. 検証方法

### テストケース

| #   | テストケース                     | 期待結果             |
| --- | -------------------------------- | -------------------- |
| 1   | `skillId` を指定してスキル実行   | 正常に実行される     |
| 2   | `skillName` を指定してスキル実行 | 正常に実行される     |
| 3   | 両方未指定でスキル実行           | バリデーションエラー |
| 4   | 型定義のコンパイルチェック       | エラーなし           |

### 検証手順

1. `pnpm typecheck` でコンパイルエラーがないことを確認
2. `pnpm test` で全テストがパスすることを確認
3. 開発環境でスキル実行のE2E動作確認

---

## 7. リスクと対策

| リスク                 | 影響度 | 発生確率 | 対策                             |
| ---------------------- | ------ | -------- | -------------------------------- |
| 既存コードの破壊的変更 | 高     | 低       | オプショナルフィールドとして追加 |
| 型エクスポートの漏れ   | 中     | 中       | index.ts のエクスポート確認      |
| テスト不足による回帰   | 中     | 低       | 型テストケースの追加             |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント       | パス                                                                  |
| ------------------ | --------------------------------------------------------------------- |
| SkillExecutor仕様  | `aiworkflow-requirements/references/interfaces-agent-sdk-executor.md` |
| Skill型定義        | `packages/shared/src/types/skill.ts`                                  |
| TASK-FIX-1-2成果物 | `docs/30-workflows/TASK-FIX-1-2-skillexecutor-type-cleanup/`          |

### 関連タスク

| タスクID     | 関係 | 説明                                   |
| ------------ | ---- | -------------------------------------- |
| TASK-FIX-1-2 | 先行 | SkillExecutor型クリーンアップ          |
| TASK-FIX-1-4 | 並行 | SkillStreamMessage Discriminated Union |
| TASK-FIX-1-5 | 並行 | SkillMetadata 型統一                   |

---

## 9. 備考

### 発見元の原文

```
Phase 10レビューにて検出:
- SkillExecutor内のSkillExecutionRequestは `skillId` を使用
- 正本型は `skillName` を使用
- 対応: 正本型を拡張して `skillId` フィールドを追加、または呼び出し側を修正
```

### 補足事項

- `skillId` と `skillName` の両方をサポートする過渡的な対応が推奨される
- 長期的には `skillName` への統一を検討するが、これは別タスクとして扱う
- TASK-FIX-1-4、TASK-FIX-1-5 と同時に実施することで効率化が期待できる
