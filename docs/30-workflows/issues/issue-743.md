# [#743] "[TASK-FIX-1-5] SkillMetadata の型統一"

## メタ情報

```yaml
task_id: TASK-FIX-1-5
task_name: SkillMetadata の型統一
category: リファクタリング
target_feature: Skill System
priority: 低
scale: 小規模
status: 未着手
source_phase: TASK-FIX-1-2（SkillExecutor型クリーンアップ）Phase 10
created_date: 2026-02-07
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-fix-1-5-skillmetadata-unification.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未着手 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-FIX-1-2（SkillExecutor型クリーンアップ）の実装において、SkillMetadata の
型定義に差異が発見された。SkillExecutor内には簡易版の SkillMetadata が定義されているが、
`packages/shared` には詳細版が存在する。

### 1.2 問題点・課題

- **型定義の二重管理**: SkillExecutor内の簡易版と正本の詳細版が併存
- **フィールドの不足**: 簡易版は必要最小限のフィールドのみを持ち、詳細情報が欠落
- **型の不整合リスク**: 両者が独立して変更されると不整合が発生

### 1.3 放置した場合の影響

- スキルメタデータの一部情報がSkillExecutorで利用できない
- 型定義の二重管理によるメンテナンスコスト増加
- 将来の機能追加時に両方の型を更新する必要がある

---

## 2. 何を達成するか（What）

### 2.1 目的

SkillExecutorの `SkillMetadata` を `packages/shared` の正本型に統一し、
型定義の一元管理を実現する。

### 2.2 最終ゴール

- SkillExecutor内のローカル SkillMetadata 型を削除
- 正本型を使用するように移行
- 不足フィールドがある場合は正本型を拡張

### 2.3 スコープ

#### 含むもの

- SkillExecutor内のローカル SkillMetadata 型の削除
- 正本型のインポートと使用
- 必要に応じて正本型の拡張
- 関連テストの更新

#### 含まないもの

- スキルメタデータの新規フィールド追加（別タスク）
- SkillScanner のメタデータ収集ロジック変更
- UI層のメタデータ表示変更

### 2.4 成果物

| 成果物            | 説明                                        |
| ----------------- | ------------------------------------------- |
| 正本型確認/拡張   | `packages/shared/src/types/skill.ts` の確認 |
| SkillExecutor更新 | ローカル型削除と正本型使用                  |
| テスト更新        | 型互換性テストケース                        |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-FIX-1-2（SkillExecutor型クリーンアップ）完了

### 3.2 依存タスク

| タスクID     | タスク名                      | ステータス |
| ------------ | ----------------------------- | ---------- |
| TASK-FIX-1-2 | SkillExecutor型クリーンアップ | 完了       |

### 3.3 必要な知識

- TypeScript インターフェース設計
- packages/shared の型エクスポート構造
- スキルメタデータの各フィールドの意味

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

| 課題            | 詳細                                                                | 解決策                                                   |
| --------------- | ------------------------------------------------------------------- | -------------------------------------------------------- |
| 構造差異        | ローカル: 簡易版（3フィールド） / 正本: 詳細版（11フィールド）      | 正本型を使用し、未使用フィールドはオプショナルとして許容 |
| 必須/任意の差異 | ローカル: `version?` / 正本: `version` 必須                         | デフォルト値 "0.0.0" を設定                              |
| 追加フィールド  | 正本に `author`, `tags`, `permissions`, `createdAt`, `updatedAt` 等 | オプショナルフィールドとして段階的に活用                 |

### 3.6 推奨アプローチ

1. 簡易版と詳細版のフィールド差分を分析
2. SkillExecutorで必要なフィールドを特定
3. 正本型が全てカバーしていれば単純置換
4. 不足があれば正本型を拡張

---

## 4. 実行手順

### Phase 1: 型比較分析

1. SkillExecutor内の SkillMetadata フィールドを列挙
2. 正本型の SkillMetadata フィールドを列挙
3. 差分を明確化

```typescript
// 簡易版（SkillExecutor内）
interface SkillMetadata {
  name: string;
  description: string;
  version?: string;
}

// 詳細版（正本）
interface SkillMetadata {
  name: string;
  description: string;
  version: string;
  author?: string;
  tags?: string[];
  permissions?: SkillPermission[];
  // ... その他のフィールド
}
```

### Phase 2: 型移行判定

| パターン                 | 対応                 |
| ------------------------ | -------------------- |
| 正本が簡易版を包含       | 単純置換             |
| 正本に不足フィールドあり | 正本型を拡張         |
| フィールド名の不一致     | マッピング処理を追加 |

### Phase 3: 実装

1. ローカル型定義を削除
2. 正本型をインポート
3. TypeScriptコンパイルエラーを解消
4. 必要に応じてオプショナルフィールドの初期値を設定

### Phase 4: テスト・検証

1. 既存テストが全てパスすることを確認
2. 型互換性テストを追加
3. スキル一覧表示のE2E動作確認

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] SkillExecutor内のローカル型が削除されている
- [ ] 正本型を使用している
- [ ] TypeScriptコンパイルエラーがない
- [ ] スキルメタデータが正しく表示される

### 品質要件

- [ ] 既存テストが全てパス
- [ ] 型カバレッジが維持されている
- [ ] コードレビューをパス

### ドキュメント要件

- [ ] 型フィールドにJSDocコメントが記載されている
- [ ] CHANGELOG への記録

---

## 6. 検証方法

### テストケース

| #   | テストケース                   | 期待結果                         |
| --- | ------------------------------ | -------------------------------- |
| 1   | スキルメタデータの読み込み     | 全フィールドが正しく読み込まれる |
| 2   | オプショナルフィールドが未定義 | エラーなく処理される             |
| 3   | スキル一覧表示                 | メタデータが正しく表示される     |
| 4   | 型定義のコンパイルチェック     | エラーなし                       |

### 検証手順

1. `pnpm typecheck` でコンパイルエラーがないことを確認
2. `pnpm test` で全テストがパスすることを確認
3. 開発環境でスキル一覧表示を確認

---

## 7. リスクと対策

| リスク                  | 影響度 | 発生確率 | 対策                 |
| ----------------------- | ------ | -------- | -------------------- |
| フィールド名の不一致    | 中     | 低       | マッピング処理で対応 |
| オプショナル/必須の違い | 低     | 中       | デフォルト値の設定   |
| 正本型のフィールド不足  | 中     | 低       | 正本型を拡張         |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント       | パス                                                             |
| ------------------ | ---------------------------------------------------------------- |
| Skill型定義        | `packages/shared/src/types/skill.ts`                             |
| SkillScanner仕様   | `aiworkflow-requirements/references/interfaces-skill-scanner.md` |
| TASK-FIX-1-2成果物 | `docs/30-workflows/TASK-FIX-1-2-skillexecutor-type-cleanup/`     |

### 関連タスク

| タスクID     | 関係 | 説明                                   |
| ------------ | ---- | -------------------------------------- |
| TASK-FIX-1-2 | 先行 | SkillExecutor型クリーンアップ          |
| TASK-FIX-1-3 | 並行 | SkillExecutionRequest/Response 統一    |
| TASK-FIX-1-4 | 並行 | SkillStreamMessage Discriminated Union |

---

## 9. 備考

### 発見元の原文

```
Phase 10レビューにて検出:
- SkillExecutor内のSkillMetadataは簡易版（name, description, version のみ）
- 正本は詳細版（author, tags, permissions 等を含む）
- 対応: 正本型を使用するよう修正
```

### 補足事項

- 本タスクは優先度「低」であり、即時対応は不要
- TASK-FIX-1-3、TASK-FIX-1-4 と同時に実施することで効率化が期待できる
- SkillScannerがメタデータを収集する際のフィールド対応も確認すること

### 簡易版と詳細版の想定差分

| フィールド  | 簡易版 | 詳細版 | 備考                 |
| ----------- | ------ | ------ | -------------------- |
| name        | 必須   | 必須   | 一致                 |
| description | 必須   | 必須   | 一致                 |
| version     | 任意   | 必須   | デフォルト値 "0.0.0" |
| author      | なし   | 任意   | 追加フィールド       |
| tags        | なし   | 任意   | 追加フィールド       |
| permissions | なし   | 任意   | 追加フィールド       |
| createdAt   | なし   | 任意   | 追加フィールド       |
| updatedAt   | なし   | 任意   | 追加フィールド       |
