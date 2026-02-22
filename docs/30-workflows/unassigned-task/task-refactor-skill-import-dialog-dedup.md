# UT-REFACTOR-SKILL-IMPORT-DIALOG-DEDUP-001 - SkillImportDialog同名コンポーネント解消 タスク指示書

## メタ情報

```yaml
issue_number: 868
```

## メタ情報

| 項目         | 内容                                                                              |
| ------------ | --------------------------------------------------------------------------------- |
| タスクID     | UT-REFACTOR-SKILL-IMPORT-DIALOG-DEDUP-001                                         |
| タスク名     | SkillImportDialog同名コンポーネント解消（コンポーネント命名重複リファクタリング） |
| 分類         | リファクタリング                                                                  |
| 対象機能     | スキル管理UI（SkillImportDialog）                                                 |
| 優先度       | 低                                                                                |
| 見積もり規模 | 小規模                                                                            |
| ステータス   | 未実施                                                                            |
| 発見元       | UT-FIX-SKILL-IMPORT-ID-MISMATCH-001 実装苦戦箇所#1（2026-02-22）                  |
| 発見日       | 2026-02-22                                                                        |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UT-FIX-SKILL-IMPORT-ID-MISMATCH-001の実装調査時、プロジェクト内に同名の`SkillImportDialog`コンポーネントが2つ存在することが判明し、調査の混乱を招いた。

| パス                                                                         | 責務                                            | Atomic Design分類            |
| ---------------------------------------------------------------------------- | ----------------------------------------------- | ---------------------------- |
| `apps/desktop/src/renderer/components/skill/SkillImportDialog.tsx`           | スキルインポートUI（旧実装または別バリアント）  | なし（`skill/`ディレクトリ） |
| `apps/desktop/src/renderer/components/organisms/SkillImportDialog/index.tsx` | スキルインポートダイアログ（Atomic Design準拠） | organisms                    |

最初に誤って`components/skill/SkillImportDialog.tsx`を調査し、バグが見つからず困惑した。実際のバグは`components/organisms/SkillImportDialog/index.tsx`に存在していた。

### 1.2 問題点・課題

1. **調査時の混乱**: `SkillImportDialog`でグローバル検索すると2つのファイルがヒットし、どちらが実際に使用されているコンポーネントか判断に時間がかかる
2. **命名の曖昧さ**: 同じ名前で異なる責務のコンポーネントが存在すると、import文の誤りや意図しないコンポーネント使用が発生しうる
3. **Atomic Design原則との整合性**: `components/skill/`はAtomic Design分類に含まれないディレクトリ構造であり、プロジェクト規約（01-architecture.md: Feature Cohesion + Atomic Design）との不整合がある

### 1.3 放置した場合の影響

- **将来のバグ調査の効率低下**: 同名コンポーネントがある限り、調査のたびに「どちらのSkillImportDialogか」の判別が必要
- **import誤りのリスク**: IDEの自動インポートが誤ったコンポーネントを選択する可能性がある
- **新規開発者の混乱**: プロジェクトに参加した開発者が2つの同名コンポーネントの使い分けを理解するコストが発生する

---

## 2. 何を達成するか（What）

### 2.1 目的

`SkillImportDialog`の命名重複を解消し、各コンポーネントの責務を名前から明確に識別できるようにする。

### 2.2 最終ゴール

1. プロジェクト内に`SkillImportDialog`という名前のコンポーネントが1つだけ存在する
2. もう一方のコンポーネントは責務に応じた固有名に改名されている、または不要であれば削除されている
3. 全テストがPASS、全import文が正しいコンポーネントを参照している

### 2.3 スコープ

#### 含むもの

- `components/skill/SkillImportDialog.tsx`と`components/organisms/SkillImportDialog/`の責務分析
- 不要な方の削除、または命名変更
- import文の更新
- 関連テストの更新

#### 含まないもの

- コンポーネントの機能追加・変更
- SkillImportDialogの内部ロジック修正（UT-FIX-SKILL-IMPORT-ID-MISMATCH-001で完了済み）
- Branded Type導入（UT-TYPE-SKILL-IDENTIFIER-BRANDED-001で管理）

### 2.4 成果物

| 成果物                             | パス                                    |
| ---------------------------------- | --------------------------------------- |
| リファクタリング済みコンポーネント | `apps/desktop/src/renderer/components/` |
| 更新されたimport文                 | 参照元コンポーネント全般                |
| 更新されたテスト                   | 関連テストファイル                      |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- UT-FIX-SKILL-IMPORT-ID-MISMATCH-001が完了していること（済み）
- 全テストがPASSしていること

### 3.2 依存タスク

- なし（独立して実行可能）

### 3.3 必要な知識

- React コンポーネント構造
- Atomic Design パターン（atoms / molecules / organisms）
- TypeScript import/export
- Vitest テスト

### 3.4 推奨アプローチ

1. **調査フェーズ**: 両コンポーネントの使用箇所を`grep -rn "SkillImportDialog" apps/desktop/src/ --include="*.tsx" --include="*.ts"`で列挙
2. **判定フェーズ**:
   - `components/skill/SkillImportDialog.tsx`が未使用 → 削除
   - 両方使用されている場合 → `components/skill/`側を`SkillQuickImport`等の固有名に改名
3. **実行フェーズ**: 削除または改名 + import文更新 + テスト更新

### 3.5 実装課題と解決策（UT-FIX-SKILL-IMPORT-ID-MISMATCH-001の教訓）

本タスクの発見元であるUT-FIX-SKILL-IMPORT-ID-MISMATCH-001の実装で苦戦した箇所を以下に記録する。

| #   | 苦戦箇所                                 | 原因                                                                                                                          | 解決策                                                                             | 本タスクへの適用                                            |
| --- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| 1   | **同名コンポーネントの調査混乱**         | `components/skill/SkillImportDialog`と`components/organisms/SkillImportDialog`の2つが存在し、最初に誤ったコンポーネントを調査 | `grep -rn "SkillImportDialog" --include="*.tsx"`で全ファイルを列挙してから調査開始 | **本タスクで根本解決** — 同名コンポーネントを解消し再発防止 |
| 2   | **誤解を招くインポート成功ログ**         | `SkillImportManager.importSkills()`がハッシュ値でも成功返却。後続`getSkillByName()`で失敗                                     | IPCハンドラ内の2ステップ変換を追跡し`getSkillByName()`の返却値を確認               | 直接関連なし（参考情報として記録）                          |
| 3   | **importedSkillIdsの二重セマンティクス** | インポート済み検出は`skill.id`（ハッシュ）、インポートアクションは`skill.name`が必要                                          | S14境界変換パターン（`selectedIds.has(s.id) → map(s.name)`）で解決                 | 直接関連なし（UT-TYPE-SKILL-IDENTIFIER-BRANDED-001で管理）  |

### 3.6 システム仕様書参照

| 仕様書                          | 参照セクション                   | 参照理由                       |
| ------------------------------- | -------------------------------- | ------------------------------ |
| `01-architecture.md`            | Atomic Design / Feature Cohesion | コンポーネント配置のルール確認 |
| `interfaces-agent-sdk-skill.md` | Skill Dashboard型定義            | SkillImportDialogの仕様確認    |
| `06-known-pitfalls.md`          | P44                              | 同名コンポーネント混乱の教訓   |

---

## 4. 実行手順

### Phase構成

本タスクは小規模リファクタリングのため、簡略Phase構成とする。

| Phase | 名称                     | 目的                       |
| ----- | ------------------------ | -------------------------- |
| 1-3   | 調査・設計・レビュー     | 使用状況分析と対応方針決定 |
| 4-5   | テスト・実装             | 削除/改名の実行            |
| 6-10  | テスト拡充・品質保証     | 全テストPASS確認           |
| 11-12 | 手動テスト・ドキュメント | UI動作確認、仕様書更新     |
| 13    | 完了                     | PR作成                     |

### Phase 1-3: 調査・設計

#### 目的

両コンポーネントの使用状況を分析し、対応方針を決定する。

#### 手順

1. `grep -rn "from.*skill/SkillImportDialog\|from.*organisms/SkillImportDialog" apps/desktop/src/ --include="*.tsx" --include="*.ts"` でimport元を列挙
2. 各コンポーネントの使用箇所数とコンテキストを確認
3. 以下の判定:
   - `components/skill/`が未使用 → 削除方針
   - 両方使用 → 責務に基づいた改名方針（改名案: `SkillQuickImport`, `SimpleSkillImport`等）

### Phase 4-5: テスト・実装

#### 目的

決定した方針に基づいてリファクタリングを実行。

#### 手順

1. 既存テストが全PASSすることを確認（ベースライン）
2. 削除の場合: ファイル削除 + 関連テスト削除
3. 改名の場合: コンポーネント名変更 + import文更新 + テスト更新
4. 全テスト再実行 → 全PASS確認

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `SkillImportDialog`という名前のコンポーネントがプロジェクト内に1つだけ存在する
- [ ] 全import文が正しいコンポーネントを参照している
- [ ] UI動作に変更がないことを手動確認

### 品質要件

- [ ] 全テスト（10,000+件）がPASS
- [ ] TypeScript型チェック（`pnpm typecheck`）がエラーなし
- [ ] ESLint（`pnpm lint`）がエラーなし

### ドキュメント要件

- [ ] Phase 12ドキュメント更新完了
- [ ] 実装ガイド作成

---

## 6. 検証方法

### テストケース

| テスト種別 | 内容                                                               | 期待結果                |
| ---------- | ------------------------------------------------------------------ | ----------------------- |
| 検索テスト | `grep -rn "SkillImportDialog" apps/desktop/src/ --include="*.tsx"` | 1ディレクトリのみヒット |
| 回帰テスト | 全テスト実行                                                       | 全PASS                  |
| 手動テスト | スキルインポートダイアログを開いてインポート操作                   | 正常動作                |

### 検証手順

1. `grep -rn "SkillImportDialog" apps/desktop/src/ --include="*.tsx" --include="*.ts"` → 1ディレクトリのコンポーネントのみ
2. `pnpm typecheck` → エラーなし
3. `pnpm --filter @repo/desktop test:run` → 全PASS

---

## 7. リスクと対策

| リスク                                                     | 影響度 | 発生確率 | 対策                                                            |
| ---------------------------------------------------------- | ------ | -------- | --------------------------------------------------------------- |
| `components/skill/SkillImportDialog`が実際に使用されている | 中     | 低       | Phase 1で使用状況を調査。使用されている場合は改名に方針変更     |
| 改名によるimport文の更新漏れ                               | 低     | 中       | `pnpm typecheck`で未解決参照を全検出。IDE一括リネーム機能を活用 |
| テストファイルの更新漏れ                                   | 低     | 低       | テスト全件実行で検出可能                                        |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/completed-tasks/skill-import-id-mismatch-fix/` — 発見元タスクのワークフロー
- `.claude/rules/01-architecture.md` — Atomic Design / Feature Cohesion
- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` — Skill Dashboard型定義

### 参考資料

- Atomic Design by Brad Frost — コンポーネント分類原則
- React File Structure Best Practices — 命名重複回避

### 関連タスク

| タスクID                             | 関連性                                     | ステータス |
| ------------------------------------ | ------------------------------------------ | ---------- |
| UT-FIX-SKILL-IMPORT-ID-MISMATCH-001  | 発見元（調査時に同名コンポーネントで混乱） | 完了       |
| UT-TYPE-SKILL-IDENTIFIER-BRANDED-001 | 同じ発見元からの別観点タスク（型安全性）   | 未実施     |

---

## 9. 備考

### 発見経緯

UT-FIX-SKILL-IMPORT-ID-MISMATCH-001の実装時、`SkillImportDialog`でプロジェクト検索した際に2つのファイルがヒットし、最初に誤ったファイル（`components/skill/SkillImportDialog.tsx`）を調査した。正しいファイル（`components/organisms/SkillImportDialog/index.tsx`）に辿り着くまでに余計な時間を要した。

### 補足事項

- `components/skill/`ディレクトリ自体がAtomic Design分類外であり、本タスクの調査結果次第ではディレクトリ構造の見直しを検討する価値がある
- 本タスクは小規模のため、Phase構成を簡略化している
