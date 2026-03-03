# [#867] "[UT-TYPE-SKILL-IDENTIFIER-BRANDED-001] Skill識別子Branded Type導入（SkillId / SkillName コンパイル時型区別）"

## メタ情報

```yaml
task_id: UT-TYPE-SKILL-IDENTIFIER-BRANDED-001
task_name: Skill識別子Branded Type導入（SkillId / SkillName コンパイル時型区別）
category: 改善
target_feature: スキル管理（Skill Dashboard / SkillImportDialog / AgentView）
priority: 中
scale: 中規模
status: 未実施
source_phase: UT-FIX-SKILL-IMPORT-ID-MISMATCH-001 実装苦戦箇所（2026-02-22）
created_date: 2026-02-22
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-type-skill-identifier-branded.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UT-FIX-SKILL-IMPORT-ID-MISMATCH-001で修正されたバグでは、`SkillImportDialog`が`skill.id`（SHA-256ハッシュプレフィックス、例: `a478b3e7c728cd18`）を`onImport`コールバックに渡していたが、IPCハンドラ（`skill:import`）は`skill.name`（人間可読名、例: `task-specification-creator`）を期待していた。両者はTypeScript上では同じ`string`型であるため、コンパイラがこのミスマッチを検出できなかった。

このバグは100%のスキルインポート失敗を引き起こした。根本原因は、`skill.id`と`skill.name`が型レベルで区別されていないことにある。

### 1.2 問題点・課題

1. **型レベルの区別不在**: `skill.id`（SHA-256ハッシュ）と`skill.name`（人間可読名）は両方とも`string`型。TypeScriptコンパイラはこれらの取り違えを検出できない
2. **暗黙的な変換ポイント**: SkillImportDialogの`handleImport()`内で`selectedIds → selectedNames`への変換が必要だが、この変換の必要性が型からは読み取れない
3. **コードレビューの困難さ**: `skill.id`を渡すべき箇所と`skill.name`を渡すべき箇所の区別が、変数名の命名規約のみに依存している

### 1.3 放置した場合の影響

- **同様のバグ再発リスク**: 新機能追加やリファクタリング時に、`skill.id`と`skill.name`を取り違えるバグが再度発生する可能性がある
- **レビュー負荷の増大**: コードレビューでID/Name取り違えを人力で検出する必要があり、レビュー効率が低下する
- **P44パターンの再発**: IPC境界でのインターフェース不整合（P44）がRenderer層でも発生しうる

---

## 2. 何を達成するか（What）

### 2.1 目的

`skill.id`と`skill.name`をTypeScript Branded Type（またはOpaque Type）で型レベルで区別可能にし、コンパイル時にID/Name取り違えを検出できるようにする。

### 2.2 最終ゴール

1. `SkillId`型と`SkillName`型が定義され、相互に代入不可能
2. `Skill`インターフェースの`id`フィールドが`SkillId`型、`name`フィールドが`SkillName`型
3. 既存のコードが型エラーなくコンパイルされる
4. ID/Nameを取り違えるコードはコンパイルエラーになる

### 2.3 スコープ

#### 含むもの

- `packages/shared/src/types/skill.ts`にBranded Type定義追加
- `Skill`インターフェースの`id`/`name`フィールドの型変更
- SkillImportDialog / AgentView / agentSlice / skillHandlers の型適用
- 型変換ユーティリティ関数（`toSkillId()`, `toSkillName()`）の作成
- 既存テストの型適合化

#### 含まないもの

- IPC引数命名の統一（UT-FIX-SKILL-IPC-NAMING-P45-001で管理）
- `as unknown as Skill[]`型アサーションの解消（UT-FIX-5-1-001で管理）
- SkillImportManager / SkillService の内部ロジック変更

### 2.4 成果物

| 成果物                  | パス                                                                         |
| ----------------------- | ---------------------------------------------------------------------------- |
| Branded Type定義        | `packages/shared/src/types/skill.ts`                                         |
| 型変換ユーティリティ    | `packages/shared/src/types/skill.ts`（同ファイル内）                         |
| SkillImportDialog型適用 | `apps/desktop/src/renderer/components/organisms/SkillImportDialog/index.tsx` |
| AgentView型適用         | `apps/desktop/src/renderer/views/AgentView/index.tsx`                        |
| テスト更新              | 関連テストファイル全般                                                       |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `packages/shared`のビルドが正常に通ること
- 全テスト（10,000+件）がPASSしていること

### 3.2 依存タスク

- なし（独立して実行可能）
- UT-FIX-SKILL-IPC-NAMING-P45-001との並列実行可能（スコープが異なる）

### 3.3 必要な知識

- TypeScript Branded Type / Opaque Typeパターン
- Zustand Store Sliceの型定義
- Electron IPC通信の型システム

### 3.4 推奨アプローチ

Branded Typeパターンを使用する：

```typescript
// packages/shared/src/types/skill.ts
declare const __brand: unique symbol;
type Brand<T, B> = T & { readonly [__brand]: B };

export type SkillId = Brand<string, "SkillId">;
export type SkillName = Brand<string, "SkillName">;

// 型変換ユーティリティ
export const toSkillId = (value: string): SkillId => value as SkillId;
export const toSkillName = (value: string): SkillName => value as SkillName;

export interface Skill {
  id: SkillId; // SHA-256ハッシュプレフィックス
  name: SkillName; // 人間可読名（ディレクトリ名）
  // ... 他のフィールド
}
```

### 3.5 実装課題と解決策（UT-FIX-SKILL-IMPORT-ID-MISMATCH-001の教訓）

本タスクの発見元であるUT-FIX-SKILL-IMPORT-ID-MISMATCH-001の実装で苦戦した3箇所を以下に記録する。同様の課題に直面した際の解決の参考とすること。

| #   | 苦戦箇所                                 | 原因                                                                                                                                               | 解決策                                                                                                                                                                            | 関連Pitfall |
| --- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| 1   | **同名コンポーネントの調査混乱**         | `components/skill/SkillImportDialog`と`components/organisms/SkillImportDialog`の2つが存在し、最初に誤ったコンポーネントを調査した                  | プロジェクト全体で`grep -rn "SkillImportDialog" --include="*.tsx"`を実行し、全ファイルを列挙してから調査開始。Atomic Design配置（organisms/）の方が実際のダイアログコンポーネント | -           |
| 2   | **誤解を招くインポート成功ログ**         | `SkillImportManager.importSkills()`がSHA-256ハッシュ値でも成功を返す。実際の失敗は後続の`getSkillByName()`で初めて顕在化                           | IPCハンドラ内で`importSkills()`→`getSkillByName()`の2ステップ変換を追跡し、`getSkillByName()`の返却値が`null`になる箇所を特定                                                     | P44         |
| 3   | **importedSkillIdsの二重セマンティクス** | `importedSkillIds`プロパティがインポート済み検出には`skill.id`（ハッシュ）を使い、インポートアクションには`skill.name`が必要という二重の意味を持つ | S14境界変換パターン（`selectedIds.has(s.id) → map(s.name)`）でコンポーネント境界で変換。**本タスク（Branded Type）はこの根本原因を型レベルで解決する**                            | P44, P45    |

### 3.6 システム仕様書参照

| 仕様書                                    | 参照セクション        | 参照理由                          |
| ----------------------------------------- | --------------------- | --------------------------------- |
| `interfaces-agent-sdk-skill.md`           | Skill Dashboard型定義 | `Skill`インターフェースの正本定義 |
| `architecture-implementation-patterns.md` | S14境界変換パターン   | 現在の変換パターンの理解          |
| `06-known-pitfalls.md`                    | P44, P45              | IPC契約ドリフトの教訓             |
| `task-workflow.md`                        | 残課題テーブル        | 関連未タスクとの重複確認          |

---

## 4. 実行手順

### Phase構成

| Phase | 名称                         | 目的                                                          |
| ----- | ---------------------------- | ------------------------------------------------------------- |
| 1-3   | 要件定義・設計・設計レビュー | Branded Typeの設計とインターフェース影響分析                  |
| 4     | テスト作成（TDD: Red）       | 型安全性テスト（ID/Name取り違えがコンパイルエラーになること） |
| 5     | 実装（TDD: Green）           | Branded Type定義と既存コードの型適用                          |
| 6-7   | テスト拡充・カバレッジ確認   | 変換ユーティリティのテスト、既存テスト適合化                  |
| 8     | リファクタリング             | 型変換の冗長性削減                                            |
| 9-10  | 品質保証・最終レビュー       | 全テストPASS確認、型整合性検証                                |
| 11-12 | 手動テスト・ドキュメント     | UI動作確認、仕様書更新                                        |
| 13    | 完了                         | PR作成                                                        |

### Phase 1-3: 要件定義・設計

#### 目的

Branded Typeの影響範囲を特定し、段階的な型適用計画を立てる。

#### 手順

1. `grep -rn "skill\.id\|skill\.name\|skillId\|skillName" apps/desktop/src/ packages/shared/src/`で全使用箇所を列挙
2. 使用箇所を「ID文脈」「Name文脈」「変換境界」の3カテゴリに分類
3. 型変更の波及範囲をファイル単位で特定
4. 段階的適用計画（shared → Renderer → Main）を策定

#### 成果物

- 影響範囲分析レポート
- 段階的型適用計画

### Phase 4: テスト作成（TDD: Red）

#### 目的

Branded Typeの型安全性を検証するテストを先行作成。

#### 手順

1. `SkillId`を`SkillName`引数に渡すとコンパイルエラーになることをtype-testで検証
2. `toSkillId()` / `toSkillName()`変換ユーティリティのテスト作成
3. SkillImportDialogの`handleImport()`で`SkillName[]`を返すことのテスト

### Phase 5: 実装（TDD: Green）

#### 目的

Branded Type定義と既存コードへの型適用。

#### 手順

1. `packages/shared/src/types/skill.ts`にBranded Type定義追加
2. `Skill`インターフェースの`id`/`name`フィールド型変更
3. `@repo/shared`ビルド確認
4. Renderer層コンポーネントの型適用
5. テストファイルの型適合化

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `SkillId`型と`SkillName`型が`packages/shared/src/types/skill.ts`に定義されている
- [ ] `Skill`インターフェースの`id`が`SkillId`型、`name`が`SkillName`型になっている
- [ ] `toSkillId()` / `toSkillName()`ユーティリティ関数が定義されている
- [ ] `SkillId`を`SkillName`パラメータに渡すとコンパイルエラーになる

### 品質要件

- [ ] 全テスト（10,000+件）がPASS
- [ ] TypeScript型チェック（`pnpm typecheck`）がエラーなし
- [ ] Line Coverage 80%以上
- [ ] Branch Coverage 60%以上

### ドキュメント要件

- [ ] `interfaces-agent-sdk-skill.md`にBranded Type仕様を追記
- [ ] Phase 12ドキュメント更新完了
- [ ] 実装ガイドPart 1（中学生レベル）/ Part 2（開発者向け）作成

---

## 6. 検証方法

### テストケース

| テスト種別     | 内容                                         | 期待結果         |
| -------------- | -------------------------------------------- | ---------------- |
| 型テスト       | `SkillId`を`SkillName`に代入                 | コンパイルエラー |
| 型テスト       | `SkillName`を`SkillId`に代入                 | コンパイルエラー |
| ユニットテスト | `toSkillId("abc")`の戻り値型                 | `SkillId`型      |
| ユニットテスト | `toSkillName("abc")`の戻り値型               | `SkillName`型    |
| 統合テスト     | SkillImportDialog onImportコールバック引数型 | `SkillName[]`    |
| 回帰テスト     | 既存全テスト                                 | 全PASS           |

### 検証手順

1. `pnpm --filter @repo/shared build` → エラーなし
2. `pnpm typecheck` → エラーなし
3. `pnpm --filter @repo/desktop test:run` → 全PASS
4. 型テストファイルで意図的にID/Nameを取り違えるコードを書き、コンパイルエラーになることを確認

---

## 7. リスクと対策

| リスク                                                     | 影響度 | 発生確率 | 対策                                                                                      |
| ---------------------------------------------------------- | ------ | -------- | ----------------------------------------------------------------------------------------- |
| Branded Typeが既存コードの多数の箇所で型エラーを引き起こす | 高     | 高       | 段階的に適用（shared → Renderer → Main）。まず`Skill`型のみ変更し、周辺APIは後続で対応    |
| テストファイルでの型適合化が大規模                         | 中     | 高       | テストヘルパー（`createMockSkill()`）にBranded Type対応を集約し、個別テストの変更を最小化 |
| Preload/IPC境界での型変換オーバーヘッド                    | 低     | 低       | Branded Typeはランタイムコストゼロ（コンパイル時のみの型情報）                            |
| P23パターン（型定義の2箇所同時更新）の再発                 | 中     | 中       | `packages/shared`に一元定義し、`preload/types.ts`からre-exportする設計にする              |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/completed-tasks/skill-import-id-mismatch-fix/` — 発見元タスクのワークフロー
- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` — Skill型定義正本
- `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` — S14境界変換パターン
- `.claude/rules/06-known-pitfalls.md` — P44（IPC不整合）, P45（引数命名ドリフト）

### 参考資料

- TypeScript Handbook: Branded Types / Opaque Types
- P44パターン（`06-known-pitfalls.md`）: IPC引数形式不整合
- P45パターン（`06-known-pitfalls.md`）: IPC引数命名の契約ドリフト

### 関連タスク

| タスクID                            | 関連性                                    | ステータス |
| ----------------------------------- | ----------------------------------------- | ---------- |
| UT-FIX-SKILL-IMPORT-ID-MISMATCH-001 | 発見元（skill.id→skill.name取り違えバグ） | 完了       |
| UT-FIX-SKILL-IPC-NAMING-P45-001     | 引数命名統一（本タスクとは独立）          | 未実施     |
| UT-FIX-5-1-001                      | AgentView型アサーション解消               | 未実施     |

---

## 9. 備考

### 発見経緯

UT-FIX-SKILL-IMPORT-ID-MISMATCH-001の実装時に、`skill.id`と`skill.name`の取り違えがTypeScriptコンパイラでは検出できない根本原因を分析した結果、Branded Type導入が最も効果的な再発防止策であると判断した。

### 補足事項

- Branded Typeはランタイムオーバーヘッドゼロ。コンパイル後のJavaScriptは通常の`string`と同一
- `@repo/shared`に一元定義することで、P23パターン（型定義の2箇所同時更新）を回避
- 既存の`importedSkillIds`プロパティ名は変更不要（内部的にはID文脈で使用されるため）
