# SKILL_NAME_PATTERN shared定数集約 - タスク指示書

## メタ情報

```yaml
issue_number: 1965
```

## メタ情報

| 項目         | 内容                                                            |
| ------------ | --------------------------------------------------------------- |
| タスクID     | UT-SKILL-NAME-PATTERN-001                                       |
| タスク名     | SKILL_NAME_PATTERN を shared 定数へ集約                         |
| 分類         | リファクタリング                                                |
| 対象機能     | スキル名バリデーション                                          |
| 優先度       | 中                                                              |
| 見積もり規模 | 小規模                                                          |
| ステータス   | 未実施                                                          |
| 発見元       | Phase 12（fix-creator-handler-duplicate-skill-name-validation） |
| 発見日       | 2026-04-06                                                      |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`apps/desktop/src/main/services/skill/SkillService.ts` の `toWizardSkillName()` と
`.agents/skills/skill-creator/scripts/init_skill.js` の両方が、スキル名バリデーション用の
正規表現 `/^[a-z0-9]+(-[a-z0-9]+)*$/` を独立して定義している。

今回の Bug Fix（fix-creator-handler-duplicate-skill-name-validation）で、
両者の仕様が乖離していたことが発覚し修正した。`SkillService.ts` が日本語・大文字・
アンダースコアを許容していたのに対し、`init_skill.js` は許容しないという不整合が
スキル作成失敗の根本原因の一つだった。

### 1.2 問題点・課題

- **重複定義**: 同一ルール `/^[a-z0-9]+(-[a-z0-9]+)*$/` が2箇所以上に存在する
- **同期コスト**: 将来的にスキル名ルールが変更される場合、全箇所を手動で同期する必要がある
- **乖離リスク**: 片方のみ変更された場合、今回と同様のバリデーション不一致が再発する
- **テスト重複**: 同じルールに対するテストが複数箇所に分散する

### 1.3 放置した場合の影響

- スキル名ルールの変更時に同期漏れが発生し、バリデーション不整合バグが再発する
- 将来的にスキル名ルールが仕様変更された際、`SkillService.ts` と `init_skill.js` の
  どちらかのみ変更されて本番バグにつながる可能性がある

---

## 2. 何を達成するか（What）

### 2.1 目的

スキル名の正規表現パターンと変換ロジックを `packages/shared` に一元化し、
`SkillService.ts` と `init_skill.js` の両方から参照する構造にする。

### 2.2 最終ゴール

- `packages/shared/src/constants/skillName.ts`（新規）に `SKILL_NAME_PATTERN` 定数を定義
- `SkillService.ts` が `packages/shared` からインポートして使用している
- `init_skill.js`（または TypeScript 化）が同じ定数を参照している
- ルール変更時の修正が1箇所で完結する

### 2.3 スコープ

#### 含むもの

- `packages/shared/src/constants/skillName.ts` の新規作成
- `SKILL_NAME_PATTERN` 定数のエクスポート
- `SkillService.ts` のインポート変更
- 既存テストの参照先更新

#### 含まないもの

- `init_skill.js` のTypeScript化（別タスク）
- `toWizardSkillName()` のロジック変更
- スキル名ルール自体の仕様変更
- `packages/shared` 以外のパッケージへの定数追加

### 2.4 成果物

- `packages/shared/src/constants/skillName.ts`（新規）
- 更新済み `SkillService.ts`
- 更新済みテストファイル

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `fix-creator-handler-duplicate-skill-name-validation` の Bug Fix が main にマージ済み
- `packages/shared` のビルド環境が正常に動作していること

### 3.2 依存タスク

- なし（独立タスク）

### 3.3 必要な知識

- TypeScript モジュール解決（`packages/shared` から `apps/desktop` へのパッケージ参照）
- pnpm monorepo の依存関係設定（`package.json` の `dependencies`）
- `SkillService.ts` の `toWizardSkillName()` メソッドの動作

### 3.4 推奨アプローチ

1. `packages/shared/src/constants/skillName.ts` に定数を定義
2. `packages/shared/src/index.ts` からエクスポート
3. `apps/desktop/package.json` で `@repo/shared` が既に依存に含まれていることを確認
4. `SkillService.ts` で定数をインポートして置き換え
5. テストを更新して変更が透過的なことを確認

---

## 4. 実行手順

### Phase構成

Phase 1（調査）→ Phase 2（実装）→ Phase 3（テスト）→ Phase 4（ドキュメント）

### Phase 1: 現状調査

#### 目的

全重複定義箇所とインポートパスを確認する。

#### 手順

1. `grep -r "a-z0-9" apps/ packages/` でパターン定義箇所を全列挙
2. `packages/shared/src/constants/` が存在するか確認
3. `apps/desktop/package.json` で `@repo/shared` の依存が設定済みか確認

#### 成果物

重複箇所一覧リスト

#### 完了条件

全重複定義箇所が特定されている

---

### Phase 2: 定数の一元化実装

#### 目的

`packages/shared` に `SKILL_NAME_PATTERN` を定義し、既存コードから参照させる。

#### 手順

1. `packages/shared/src/constants/skillName.ts` を新規作成:
   ```typescript
   export const SKILL_NAME_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
   export const SKILL_NAME_MAX_LENGTH = 50;
   ```
2. `packages/shared/src/index.ts` に追加エクスポート
3. `SkillService.ts` の直接定義を削除してインポートに変更
4. `pnpm --filter @repo/shared build` でビルド確認

#### 成果物

- `packages/shared/src/constants/skillName.ts`
- 更新済み `SkillService.ts`

#### 完了条件

`pnpm --filter @repo/desktop typecheck` がエラーなく通過する

---

### Phase 3: テスト更新・確認

#### 目的

既存テストが引き続き全パス することを確認する。

#### 手順

1. `pnpm --filter @repo/desktop test` を実行
2. `toWizardSkillName()` に関するテスト11件（SS-TWSN-01〜11）が全パスすることを確認
3. 必要であればテスト内の正規表現参照を定数インポートに変更

#### 成果物

テスト全パス確認

#### 完了条件

全テストがグリーン

---

### Phase 4: ドキュメント更新

#### 目的

仕様書の参照先を更新する。

#### 手順

1. `docs/00-requirements/18-skills.md` の §3.2.2.1 に定数参照先を追記
2. Phase 12 の実装ガイドに定数一元化の記載を追加

#### 成果物

更新済み仕様書

#### 完了条件

定数の参照先が仕様書に記載されている

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `SKILL_NAME_PATTERN` が `packages/shared/src/constants/skillName.ts` に定義されている
- [ ] `SkillService.ts` が直接定義を削除し shared からインポートしている
- [ ] `pnpm --filter @repo/desktop typecheck` がパスする

### 品質要件

- [ ] 既存テスト SS-TWSN-01〜11 が全パス
- [ ] ESLint エラーなし

### ドキュメント要件

- [ ] `docs/00-requirements/18-skills.md` の §3.2.2.1 に定数参照先の記載がある

---

## 6. 検証方法

### テストケース

| テストID       | 内容                                                    |
| -------------- | ------------------------------------------------------- |
| SS-TWSN-01〜11 | `toWizardSkillName()` 変換テスト                        |
| 新規: CONST-01 | `SKILL_NAME_PATTERN` のインポートが正常に解決されること |

### 検証手順

```bash
pnpm --filter @repo/shared build
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop test
```

---

## 7. リスクと対策

| リスク                                          | 影響度 | 発生確率 | 対策                                                                 |
| ----------------------------------------------- | ------ | -------- | -------------------------------------------------------------------- |
| `packages/shared` ビルド設定の変更が必要になる  | 中     | 低       | Phase 1 で `packages/shared/src/index.ts` の現状を確認してから進める |
| `init_skill.js` への適用が困難（CJS/ESM不整合） | 低     | 中       | `init_skill.js` は別タスクとして切り出す                             |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/00-requirements/18-skills.md` §3.2.2.1 スキル名正規化ルール
- `apps/desktop/src/main/services/skill/SkillService.ts` `toWizardSkillName()`
- `docs/30-workflows/fix-creator-handler-duplicate-skill-name-validation/` タスク仕様書

### 参考資料

- 完了済みタスク: `docs/30-workflows/completed-tasks/` 内の shared 定数移行タスク（あれば）

---

## 9. 備考

### 苦戦箇所（発見元タスクより）

今回の Bug Fix（fix-creator-handler-duplicate-skill-name-validation）で、`SkillService.ts` と
`init_skill.js` のスキル名バリデーション仕様が乖離していたことが判明した。
`SkillService.ts` は `/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF_-]/g` で
日本語・大文字を許容していたが、`init_skill.js` は `/^[a-z0-9]+(-[a-z0-9]+)*$/` で
拒否していた。これを Bug Fix スコープ最小化のため「`SkillService.ts` 側を修正して
`init_skill.js` に合わせる」方針で解決した。本タスクはその後続対応として、
共通定数化による再発防止を目的とする。

### 補足事項

`init_skill.js` を TypeScript 化する場合は別タスクを立てること。
`packages/shared` への定数追加のみであれば変更範囲は非常に小さい（小規模）。
