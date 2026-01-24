# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 8                                 |
| Phase名    | リファクタリング（TDD: Refactor） |
| 前提Phase  | Phase 7（カバレッジ確認）         |
| 後続Phase  | Phase 9（品質保証）               |
| ステータス | 未実施                            |
| 作成日     | 2026-01-24                        |
| 機能名     | SkillImportStore                  |

---

## 目的

TDD の Refactor フェーズとして、テストを維持しながらコード品質を向上させる。
可読性、保守性、パフォーマンスの改善を行う。

## 背景

TDD では、テストが成功した後にリファクタリングを行う。
テストがあることで、リファクタリング後も動作が保証される。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: コード品質分析

**目的**: 現在のコード品質を分析し、改善ポイントを特定する

**実行手順**:

1. `apps/desktop/src/main/settings/skillImportStore.ts` を読み込む
2. コード臭（Code Smell）を特定する
3. 改善優先度を決定する

**分析観点**:

| 観点             | 確認内容                       |
| ---------------- | ------------------------------ |
| 重複コード       | 同じロジックが複数箇所にないか |
| 長い関数         | 関数が長すぎないか（20行以上） |
| 複雑な条件分岐   | ネストが深すぎないか           |
| マジックナンバー | 定数化されていない値がないか   |
| 命名             | 変数・関数名が適切か           |
| 型定義           | 型が適切に定義されているか     |

**期待される成果物**:

- `outputs/phase-8/code-quality-analysis.md`

---

### タスク2: 重複コードの抽出

**目的**: 重複しているコードを共通関数に抽出する

**実行手順**:

1. ストア操作の共通パターンを特定する
2. ヘルパー関数を作成する
3. 重複箇所を置き換える
4. テストがパスすることを確認する

**改善例**:

```typescript
// Before: 重複したストア操作
const importedSkills = store.get("importedSkills");
// ... 操作 ...
store.set("importedSkills", importedSkills);

// After: ヘルパー関数
function updateImportedSkills(
  updater: (skills: Record<string, ImportedSkillData>) => void,
): void {
  const importedSkills = store.get("importedSkills");
  updater(importedSkills);
  store.set("importedSkills", importedSkills);
}
```

**期待される成果物**:

- `outputs/phase-8/duplication-removal.md`

---

### タスク3: 関数分割・責務分離

**目的**: 長い関数を分割し、単一責務にする

**実行手順**:

1. 20行を超える関数を特定する
2. 責務ごとに分割する
3. 分割した関数をテストする
4. 全テストがパスすることを確認する

**期待される成果物**:

- `outputs/phase-8/function-decomposition.md`

---

### タスク4: 型定義の改善

**目的**: 型定義を改善し、型安全性を向上させる

**実行手順**:

1. any 型の使用箇所を特定する
2. より具体的な型に置き換える
3. ユーティリティ型を活用する
4. 型チェックがパスすることを確認する

**改善観点**:

| 観点         | 改善内容             |
| ------------ | -------------------- |
| any 型の排除 | 具体的な型に置き換え |
| ユニオン型   | 適切な型の組み合わせ |
| ジェネリクス | 再利用可能な型定義   |
| readonly     | 不変性の明示         |

**期待される成果物**:

- `outputs/phase-8/type-improvements.md`

---

### タスク5: パフォーマンス改善

**目的**: 不要な処理を削減し、パフォーマンスを向上させる

**実行手順**:

1. 不要なストア読み書きを特定する
2. キャッシュ戦略を確認する
3. 最適化を実施する
4. テストがパスすることを確認する

**改善観点**:

| 観点               | 改善内容                           |
| ------------------ | ---------------------------------- |
| 不要な読み込み     | 複数回の読み込みを1回にまとめる    |
| 不要な書き込み     | 変更がない場合は書き込みをスキップ |
| オブジェクトコピー | 不要な深いコピーを避ける           |

**期待される成果物**:

- `outputs/phase-8/performance-improvements.md`

---

## 参照資料

| 参照資料       | パス                                                                | 内容         |
| -------------- | ------------------------------------------------------------------- | ------------ |
| 実装ファイル   | `apps/desktop/src/main/settings/skillImportStore.ts`                | 実装コード   |
| 既存パターン   | `apps/desktop/src/main/settings/slideSettingsStore.ts`              | 参考パターン |
| テストファイル | `apps/desktop/src/main/settings/__tests__/skillImportStore.test.ts` | テストコード |

---

## 成果物

| 成果物         | パス                                          | 内容     |
| -------------- | --------------------------------------------- | -------- |
| 品質分析       | `outputs/phase-8/code-quality-analysis.md`    | 分析結果 |
| 重複除去       | `outputs/phase-8/duplication-removal.md`      | 改善内容 |
| 関数分割       | `outputs/phase-8/function-decomposition.md`   | 改善内容 |
| 型改善         | `outputs/phase-8/type-improvements.md`        | 改善内容 |
| パフォーマンス | `outputs/phase-8/performance-improvements.md` | 改善内容 |

---

## 統合テスト連携

> リファクタ後の統合テスト継続成功を確認する

| 確認項目         | 基準                   |
| ---------------- | ---------------------- |
| 全ユニットテスト | 100% パス              |
| 全統合テスト     | 100% パス              |
| カバレッジ維持   | リファクタ前と同等以上 |

---

## TDD検証

### TDD サイクル確認

```bash
# リファクタリング中は継続的にテスト実行
pnpm --filter @repo/desktop test -- skillImportStore --watch
```

**確認項目**:

- [ ] リファクタリング後もテストが成功することを確認

---

## 完了条件

- [ ] コード品質分析が完了している
- [ ] 重複コードが抽出・共通化されている
- [ ] 長い関数が分割されている
- [ ] 型定義が改善されている
- [ ] パフォーマンス改善が実施されている
- [ ] 全てのテストがパスしている
- [ ] カバレッジが維持されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（5タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物（5ファイル）が全て生成されていることを確認
- [ ] テストが継続してGreen状態であることを確認

---

## 依存関係

- **前提**: Phase 7 が完了していること
- **後続**: Phase 9（品質保証）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-import-agent-system/tasks/task-2b-skill-import-store/phase-9-quality.md`
