# 合成Store Hookの非推奨化・段階的削除 - タスク指示書

## メタ情報

```yaml
issue_number: 784
```

## メタ情報

| 項目         | 内容                                                           |
| ------------ | -------------------------------------------------------------- |
| タスクID     | task-ref-store-hooks-deprecate-composite                       |
| タスク名     | 合成Store Hookの非推奨化・段階的削除                           |
| 分類         | リファクタリング                                               |
| 対象機能     | Zustand Store状態管理                                          |
| 優先度       | 低                                                             |
| 見積もり規模 | 小規模                                                         |
| ステータス   | 未実施                                                         |
| Issue        | #784                                                           |
| 発見元       | UT-STORE-HOOKS-COMPONENT-MIGRATION-001 Phase 12 スコープ外項目 |
| 発見日       | 2026-02-12                                                     |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UT-STORE-HOOKS-COMPONENT-MIGRATION-001（2026-02-12完了）で、P31問題（Zustand Store Hooks無限ループ）の根本対策として30個の個別セレクタHookを実装した。しかし、後方互換性維持のため、合成Store Hook（`useLLMStore()`, `useSkillStore()`, `useAuthModeStore()` 等）は削除せずに残している。

### 1.2 問題点・課題

- 合成Store Hookが残存することで、新規開発者が誤って使用するリスクがある
- 2つのパターン（合成Hook / 個別セレクタ）が共存し、コードレビュー時に判断コストが発生
- `@deprecated` JSDocタグが付与されていないため、IDE上で非推奨であることが可視化されていない

### 1.3 放置した場合の影響

- P31問題の再発（新規コードで合成Hookを使用し、useEffect依存配列に関数を含める）
- コードベースの保守性が低下（2つのパターンが長期間混在）
- レビューガイドラインが曖昧になる

---

## 2. 何を達成するか（What）

### 2.1 目的

合成Store Hookに `@deprecated` JSDocタグを付与し、将来的な完全削除の準備を行う。

### 2.2 最終ゴール

- 全合成Store Hookに `@deprecated` タグが付与されている
- ESLintルール `no-restricted-imports` で合成Hook使用時に警告が出る
- 移行ガイドが記載されている（各合成Hookに対応する個別セレクタの一覧）

### 2.3 スコープ

#### 含むもの

- `apps/desktop/src/renderer/store/index.ts` の合成Store Hookへの `@deprecated` 付与
- ESLintルール追加（合成Hook使用時の警告）
- 移行ガイドのコードコメントへの記載

#### 含まないもの

- 合成Store Hookの完全削除（全コンポーネント移行完了後に実施）
- 個別セレクタHookの追加（別タスク: task-imp-store-hooks-remaining-migration）
- Store構造（Slice）の変更

### 2.4 成果物

| 成果物                  | 説明                                     |
| ----------------------- | ---------------------------------------- |
| @deprecated付き合成Hook | 非推奨マーク付きの合成Store Hook定義     |
| ESLintルール            | no-restricted-imports設定                |
| 移行ガイド（コメント）  | 各合成Hookに対応する個別セレクタの対照表 |
| Phase 1-12 成果物       | 各Phaseの標準出力ドキュメント            |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- UT-STORE-HOOKS-COMPONENT-MIGRATION-001が完了していること（✅ 完了済み）
- task-imp-store-hooks-remaining-migration が完了していること（推奨だが必須ではない）

### 3.2 依存タスク

| タスクID                                 | 状態    | 依存種別 |
| ---------------------------------------- | ------- | -------- |
| UT-STORE-HOOKS-COMPONENT-MIGRATION-001   | ✅ 完了 | 必須     |
| task-imp-store-hooks-remaining-migration | 未実施  | 推奨     |

### 3.3 必要な知識

- JSDoc `@deprecated` タグの記法
- ESLint `no-restricted-imports` ルールの設定方法
- Zustandの合成Hookと個別セレクタHookの対応関係

### 3.4 推奨アプローチ

1. store/index.ts で合成Store Hookに `@deprecated` JSDocと移行先コメントを追加
2. `.eslintrc` に `no-restricted-imports` ルールを追加して合成Hook使用時に警告
3. 全テストが引き続きPASSすることを確認

### 3.5 実装課題と解決策（UT-STORE-HOOKS-COMPONENT-MIGRATION-001からの学び）

| 課題                                 | 原因                                  | 解決策                                                           | 参照                       |
| ------------------------------------ | ------------------------------------- | ---------------------------------------------------------------- | -------------------------- |
| 合成Hookの使用箇所が広範             | 歴史的に合成Hookが推奨パターンだった  | grep で全使用箇所を特定し、段階的に非推奨化                      | lessons-learned.md         |
| ESLintルール追加による既存コード警告 | 未移行コンポーネントで警告が大量発生  | `// eslint-disable-next-line` で一時的に抑制し、移行タスクで解消 | patterns.md                |
| @deprecated付与後の下流影響          | 型定義の変更が不要だが、IDEの挙動変化 | @deprecated はランタイム影響なし、IDE警告のみ                    | TypeScript公式ドキュメント |

---

## 4. 実行手順

### Phase構成

本タスクはPhase 1-13のフルサイクルで実行する（小規模のためPhase 6-7は軽量）。

### Phase 1: 要件定義

#### 目的

非推奨化対象の合成Store Hookの特定

#### 手順

1. `grep -rn "export const use.*Store" apps/desktop/src/renderer/store/index.ts` で合成Hook一覧を取得
2. 各合成Hookの使用箇所数を確認
3. 非推奨化の影響範囲を文書化

#### 成果物

- 要件定義書（対象Hook一覧、影響範囲）

### Phase 4-5: テスト作成・実装

#### 目的

@deprecated付与とESLintルール追加

#### 手順

1. 各合成Store Hookに `@deprecated` JSDocを追加:
   ```typescript
   /**
    * @deprecated 個別セレクタHookを使用してください。
    * 移行先: useLLMProviders(), useLLMFetchProviders() 等
    * 参照: arch-state-management.md P31対策セクション
    */
   export const useLLMStore = () => { ... };
   ```
2. ESLintルールに `no-restricted-imports` を追加
3. テストでdeprecation警告が出ることを確認

#### 完了条件

- 全合成Store Hookに `@deprecated` タグが付与されている
- ESLintで合成Hook使用時に警告が表示される
- 全テストPASS

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 全合成Store Hookに `@deprecated` JSDocが付与されている
- [ ] 各 `@deprecated` コメントに移行先の個別セレクタが記載されている
- [ ] ESLint `no-restricted-imports` ルールが設定されている
- [ ] 合成Hook使用時にIDE上で取り消し線が表示される

### 品質要件

- [ ] 全テストPASS（既存テストに影響なし）
- [ ] ESLint / TypeScript型チェックエラーなし
- [ ] ランタイム動作に変更なし

### ドキュメント要件

- [ ] Phase 12 実装ガイド（Part 1: 中学生レベル / Part 2: 開発者向け）
- [ ] LOGS.md × 2 更新
- [ ] SKILL.md × 2 更新
- [ ] documentation-changelog.md 作成

---

## 6. 検証方法

### テストケース

| テストケース                           | 期待結果                                 |
| -------------------------------------- | ---------------------------------------- |
| 合成Hook使用箇所でESLint警告が出ること | `no-restricted-imports` 警告が出力される |
| @deprecatedタグがIDEで認識されること   | 取り消し線が表示される                   |
| 全既存テストがPASSすること             | テスト結果に変更なし                     |
| ランタイム動作に変更がないこと         | 手動テストで全画面正常動作               |

### 検証手順

1. `pnpm --filter @repo/desktop test` でユニットテスト実行
2. `pnpm lint` でESLint警告の出力確認
3. `pnpm typecheck` で型チェック
4. 手動テスト: 各画面の正常動作を確認

---

## 7. リスクと対策

| リスク                       | 影響度 | 発生確率 | 対策                                      |
| ---------------------------- | ------ | -------- | ----------------------------------------- |
| ESLintルール追加で大量の警告 | 低     | 高       | 未移行コンポーネントでは一時的にdisable   |
| @deprecated付与によるCI失敗  | 低     | 低       | @deprecatedはTypeScriptエラーではなく警告 |
| 開発者が警告を無視する       | 中     | 中       | コードレビューガイドラインに明記          |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                                                                    | 用途                       |
| ------------------------------------------------------------------------------- | -------------------------- |
| `.claude/rules/03-state-management.md`                                          | Zustand設計原則            |
| `.claude/rules/06-known-pitfalls.md` (P31)                                      | 無限ループ問題の詳細       |
| `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`    | P31対策セクション          |
| `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`          | 実装時の苦戦箇所           |
| `docs/30-workflows/completed-tasks/UT-STORE-HOOKS-COMPONENT-MIGRATION-001/`     | 先行移行タスクの全成果物   |
| `docs/30-workflows/unassigned-task/task-imp-store-hooks-remaining-migration.md` | 残コンポーネント移行タスク |

### 参考資料

- [TypeScript @deprecated JSDoc](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html#deprecated)
- [ESLint no-restricted-imports](https://eslint.org/docs/latest/rules/no-restricted-imports)

---

## 9. 備考

### 先行タスクからの教訓

1. **段階的アプローチが有効**: 全削除ではなく、まず@deprecated付与 → 移行完了後に削除の2段階
2. **ESLintルールで使用を検出**: grepだけでなく、ESLintルールで継続的に使用を監視
3. **Phase 12の落とし穴**: LOGS.md × 2、SKILL.md × 2 の更新漏れに注意（P1, P25再発パターン）

### 補足事項

- 本タスクは task-imp-store-hooks-remaining-migration の完了後に実行することを推奨
- 合成Hookの完全削除は、全コンポーネント移行確認後に別タスクとして実施
