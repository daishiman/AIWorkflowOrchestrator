# スキル名バリデーション正規表現の shared 定数一元化 - タスク指示書

## メタ情報

```yaml
issue_number: 1976
task_id: UT-FIX-IPC-SKILL-NAME-PATTERN-CENTRALIZATION-001
task_name: スキル名バリデーション正規表現の shared 定数一元化
category: リファクタリング
target_feature: SkillService / init_skill.js / packages/shared 定数
priority: 中
scale: 中規模
status: 未実施
created_date: 2026-04-06
```

| 項目         | 内容                                                                                 |
| ------------ | ------------------------------------------------------------------------------------ |
| タスクID     | UT-FIX-IPC-SKILL-NAME-PATTERN-CENTRALIZATION-001                                     |
| タスク名     | スキル名バリデーション正規表現の shared 定数一元化                                   |
| 分類         | リファクタリング                                                                     |
| 対象機能     | SkillService / init_skill.js / packages/shared 定数                                  |
| 優先度       | 中                                                                                   |
| 見積もり規模 | 中規模（5 ステップ正規化フロー・2 ファイル参照差し替え・shared ビルド更新）          |
| ステータス   | 未実施                                                                               |
| 発見元       | TASK-FIX-IPC-SKILL-NAME-001 Phase 12 / task-4-untasked-report.md UT-01（2026-04-06） |
| 発見日       | 2026-04-06                                                                           |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-FIX-IPC-SKILL-NAME-001（2026-04-06）では、`SkillService.ts` の `toWizardSkillName()` が生成するスキル名が IPC 経由で渡された際に kebab-case 正規化が二重適用されるバグを修正した。その修正の中で、スキル名バリデーションルールとして使われる正規表現 `/^[a-z0-9]+(-[a-z0-9]+)*$/` が 2 箇所に分散していることが判明した。

- `apps/desktop/src/main/services/skill/SkillService.ts` の `toWizardSkillName()` メソッドのコメント
- `.claude/skills/skill-creator/scripts/init_skill.js` の `validateSkillName()` 関数

変更最小性の観点からこの一元化は TASK-FIX-IPC-SKILL-NAME-001 のスコープ外とし、本タスクに切り出した。

### 1.2 問題点・課題

1. **同型の正規表現が 2 箇所に分散している**: `SkillService.ts` の変換ロジックと `init_skill.js` のバリデーションは同一の命名ルール（kebab-case: 小文字英数字とハイフン）に基づくが、正規表現を個別に定義している。命名ルールの定義が 2 箇所に存在する「重複した知識」の状態。

2. **変更時の同期漏れリスク**: 将来的に命名ルールが変更された場合（例: アンダースコアを許可する、最大長に制約を加える等）、両ファイルを同時に更新する必要がある。どちらかを忘れると、ウィザード入力とスクリプト検証で異なる結果が生じ、気づきにくいバグになる。

3. **参照方法の非対称性**: `SkillService.ts` は TypeScript / ESM 環境だが、`init_skill.js` は CommonJS の Node.js スクリプトであり、共有パッケージからの参照方法が異なる。これが過去に一元化を困難にしていた要因でもある。

### 1.3 放置した場合の影響

- 命名ルール変更時に片方のファイルだけが更新され、ウィザードとスクリプトで許可文字が食い違うバグが潜在する
- 「どちらが正しい定義か」がコードを読んだだけでは判断できなくなる（単一の信頼源の喪失）
- 今後 `init_skill.js` が追加のバリデーションルールを導入した場合に `SkillService.ts` との乖離が拡大する

---

## 2. 何を達成するか（What）

### 2.1 目的

`SKILL_NAME_PATTERN` 定数を `packages/shared/src/constants/skillName.ts` に一元定義し、`SkillService.ts` と `init_skill.js` の両方が単一の信頼源を参照する構造にする。

### 2.2 最終ゴール

1. `packages/shared/src/constants/skillName.ts` が `SKILL_NAME_PATTERN` を export している
2. `SkillService.ts` の `toWizardSkillName()` コメントおよびバリデーション箇所が上記定数を参照している
3. `.claude/skills/skill-creator/scripts/init_skill.js` の `validateSkillName()` が上記定数を参照している
4. `packages/shared` のビルド設定・`index.ts` に `skillName` 定数が追加されている
5. 全テスト PASS・typecheck PASS・lint PASS

### 2.3 スコープ

#### 含むもの

- `packages/shared/src/constants/skillName.ts` の新規作成
- `packages/shared/src/constants/index.ts` への export 追加
- `apps/desktop/src/main/services/skill/SkillService.ts` の参照更新
- `.claude/skills/skill-creator/scripts/init_skill.js` の参照更新
- `.agents/skills/skill-creator/scripts/init_skill.js` の mirror 同期
- `@repo/shared` ビルド設定の検証（CommonJS / ESM 両対応の確認）
- 影響範囲テスト（既存テストの回帰確認）

#### 含まないもの

- スキル名の最大長バリデーション強化（別途 `UT-FIX-SKILL-NAME-LENGTH-VALIDATION-001` として検討）
- 日本語入力時のリアルタイムプレビュー UX 改善（`UT-FIX-SKILL-NAME-JAPANESE-INPUT-UX-001` で管理）
- `init_skill.js` の全面 TypeScript 化
- `validateSkillName()` のロジック変更（形式のみ変更、動作は変えない）

### 2.4 成果物

| 成果物                                                         | 種別   |
| -------------------------------------------------------------- | ------ |
| `packages/shared/src/constants/skillName.ts`（新規）           | 実装   |
| `packages/shared/src/constants/index.ts`（更新）               | 実装   |
| `apps/desktop/src/main/services/skill/SkillService.ts`（更新） | 実装   |
| `.claude/skills/skill-creator/scripts/init_skill.js`（更新）   | 実装   |
| `.agents/skills/skill-creator/scripts/init_skill.js`（更新）   | mirror |
| テスト更新（既存テスト回帰確認）                               | テスト |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `packages/shared` が `@repo/shared` パッケージとして monorepo に組み込まれていること
- `apps/desktop` が `@repo/shared` を依存関係として持っていること
- `pnpm build --filter @repo/shared` が正常に通ること
- `.claude/skills/` と `.agents/skills/` の mirror 関係が成立していること

### 3.2 依存タスク

- なし（TASK-FIX-IPC-SKILL-NAME-001 は完了済み）

### 3.3 必要な知識

- `packages/shared` の TypeScript / ESM ビルド設定（`tsup` / `tsconfig.json`）
- `.claude/skills/skill-creator/scripts/init_skill.js` が CommonJS (`require`) を使用している点
- monorepo での `@repo/shared` の依存解決方法（`pnpm workspace:*`）
- `init_skill.js` が Node.js スクリプトとして直接実行されるため、`require('@repo/shared')` が機能するには CJS ビルド成果物が必要

### 3.4 推奨アプローチ

1. **定数定義**: `packages/shared/src/constants/skillName.ts` に `SKILL_NAME_PATTERN` と `MAX_SKILL_NAME_LENGTH` を export する
2. **ビルド確認**: `pnpm --filter @repo/shared build` で CJS / ESM 両方の成果物が出力されることを確認
3. **TypeScript 側更新**: `SkillService.ts` を `@repo/shared` からインポートするよう更新
4. **スクリプト側更新**: `init_skill.js` を `require('@repo/shared')` でインポートするよう更新。ビルド成果物のパスが正しいか `dist/` を確認する
5. **テスト実行**: 既存のすべての関連テストを実行して回帰がないことを確認

### 3.5 苦戦箇所（TASK-FIX-IPC-SKILL-NAME-001 からの引き継ぎ）

| 苦戦箇所                          | 詳細                                                                                                                                                                                                                         | 解決策                                                                                                                                              |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 苦戦1: 正規表現の分散定義         | `SkillService.ts` の `toWizardSkillName()` と `init_skill.js` が同型のバリデーションルール `/^[a-z0-9]+(-[a-z0-9]+)*$/` を個別に保持している。命名ルール変更時に両ファイルを同期して更新する必要があり、見落としリスクがある | `packages/shared/src/constants/skillName.ts` に `SKILL_NAME_PATTERN` 定数を定義し、両ファイルから参照する                                           |
| 苦戦2: monorepo での CJS 依存解決 | `@repo/shared` パッケージのビルド設定・エクスポートを更新する必要があるが、monorepo の依存関係解決で `scripts/init_skill.js` が共有パッケージを参照できるかの検証が必要                                                      | `pnpm --filter @repo/shared build` 後に CJS ビルド成果物 (`dist/index.cjs` 等) の存在を確認し、`require('@repo/shared')` が解決できることを検証する |
| 教訓                              | 文字列変換ロジックの定数は「shared/constants」に一元化し、UI/API/スクリプト全箇所から参照すべき                                                                                                                              | 新規定数追加時は CJS/ESM 両方のビルド出力を確認してから参照先を更新する                                                                             |

---

## 4. 実行手順

### Phase 構成

| Phase | 名称             | ステータス | 概要                                           |
| ----- | ---------------- | ---------- | ---------------------------------------------- |
| 1     | 要件定義         | open       | スコープ・受入条件・命名規則の確認             |
| 2     | 設計             | open       | ファイル構成・インターフェース設計             |
| 3     | 設計レビュー     | open       | Phase 4 進行可否の判定                         |
| 4     | テスト作成       | open       | テストマトリクス・Red フェーズ                 |
| 5     | 実装             | open       | 定数定義・参照更新・ビルド確認                 |
| 6     | テスト拡充       | open       | 失敗パス・回帰ガード追加                       |
| 7     | カバレッジ確認   | open       | 変更ファイルのカバレッジ実測                   |
| 8     | リファクタリング | open       | 重複除去・命名統一                             |
| 9     | 品質検証         | open       | typecheck / lint / test 一括検証               |
| 10    | 最終レビュー     | open       | 受入条件チェック・blocker 判定                 |
| 11    | 手動テスト       | open       | NON_VISUAL: 自動テスト結果を代替証跡として記録 |
| 12    | ドキュメント     | open       | 実装ガイド（Part 1/2）・仕様同期・未タスク     |
| 13    | PR 作成          | open       | ユーザー明示承認後のみ実施                     |

---

### Phase 1: 要件定義

**ステータス**: open

#### 目的

スコープ・受入条件・既存コードの命名規則を確定する。

#### 手順

1. `apps/desktop/src/main/services/skill/SkillService.ts` の `toWizardSkillName()` を読み込み、現在の正規表現定義と変換フロー（5 ステップ）を記録する
2. `.claude/skills/skill-creator/scripts/init_skill.js` の `validateSkillName()` を読み込み、正規表現定義を記録する
3. `packages/shared/src/constants/index.ts` を読み込み、既存の export 構造を把握する
4. `packages/shared` の `package.json` / `tsup.config.ts` を確認し、CJS / ESM 両方のビルドが設定されているか確認する
5. タスク分類を明記する: **NON_VISUAL タスク**（UI 変更なし・バックエンド定数リファクタリング）

#### 確認事項

- [ ] 2 つの正規表現が完全に同一の文字列であることを確認（`/^[a-z0-9]+(-[a-z0-9]+)*$/`）
- [ ] `packages/shared` が CJS / ESM 両方をビルドすることを確認
- [ ] `apps/desktop` が `@repo/shared` を `package.json` で依存宣言していることを確認

#### 完了条件

- 2 箇所の正規表現定義の現状が文書化されている
- `packages/shared` のビルド設定の CJS 対応状況が確認されている
- タスク分類（NON_VISUAL）が明記されている

---

### Phase 2: 設計

**ステータス**: open

#### 目的

新規ファイル構成・定数の型設計・各ファイルの変更内容を設計する。

#### 変更ファイル一覧

| ファイル                                               | 変更種別 | 変更内容                                                     |
| ------------------------------------------------------ | -------- | ------------------------------------------------------------ |
| `packages/shared/src/constants/skillName.ts`           | 新規作成 | `SKILL_NAME_PATTERN`・`MAX_SKILL_NAME_LENGTH` の export 定義 |
| `packages/shared/src/constants/index.ts`               | 修正     | `skillName.ts` からのエクスポート追加                        |
| `apps/desktop/src/main/services/skill/SkillService.ts` | 修正     | `@repo/shared` からの import・コメント更新                   |
| `.claude/skills/skill-creator/scripts/init_skill.js`   | 修正     | `require('@repo/shared')` からの定数参照                     |
| `.agents/skills/skill-creator/scripts/init_skill.js`   | 修正     | `.claude` 側と同内容で mirror 同期                           |

#### 設計詳細

**`skillName.ts` の設計案**:

```typescript
/**
 * スキル名に関する定数
 *
 * @see apps/desktop/src/main/services/skill/SkillService.ts の toWizardSkillName()
 * @see .claude/skills/skill-creator/scripts/init_skill.js の validateSkillName()
 */

/** スキル名として有効な形式の正規表現（kebab-case: 小文字英数字とハイフン） */
export const SKILL_NAME_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** スキル名の最大文字数 */
export const MAX_SKILL_NAME_LENGTH = 64;
```

**`init_skill.js` の変更方針**:

- `require('@repo/shared')` で `SKILL_NAME_PATTERN` と `MAX_SKILL_NAME_LENGTH` を取得
- `validateSkillName()` 内のハードコード正規表現をインポート定数に差し替え
- CJS ビルド成果物（`dist/index.cjs` 等）の存在前提を確認してから変更する

#### 完了条件

- 変更ファイル一覧が確定している
- `skillName.ts` の export インターフェースが設計されている
- `init_skill.js` の `require()` パスが確認されている

---

### Phase 3: 設計レビュー

**ステータス**: open

#### 目的

Phase 2 の設計が正しく、Phase 4 に進んでよいか判定する。

#### レビュー観点

| 観点         | 確認内容                                                               | 判定 |
| ------------ | ---------------------------------------------------------------------- | ---- |
| 単一責務     | `skillName.ts` がスキル名に関する定数のみを持つか                      | open |
| CJS 互換性   | `@repo/shared` の CJS ビルドが `init_skill.js` から参照できるか        | open |
| 後方互換性   | 既存の `validateSkillName()` の動作が変わらないか                      | open |
| mirror 対応  | `.claude` と `.agents` の両方の `init_skill.js` を更新する計画があるか | open |
| スコープ境界 | `validateSkillName()` のロジック変更を含まないことが明確か             | open |

#### 完了条件

- 全観点が PASS または MINOR（許容範囲）と判定されている
- BLOCKER がある場合は Phase 2 に戻り設計を修正している

---

### Phase 4: テスト作成

**ステータス**: open

#### 目的

`SKILL_NAME_PATTERN` の動作を保証するテストを TDD Red 状態で作成する。

#### テストマトリクス

| テスト ID | テスト対象                       | 入力                            | 期待値             | 種別 |
| --------- | -------------------------------- | ------------------------------- | ------------------ | ---- |
| TC-01     | `SKILL_NAME_PATTERN` 正常系      | `"my-skill"`                    | マッチする         | 単体 |
| TC-02     | `SKILL_NAME_PATTERN` 正常系      | `"myskill"`                     | マッチする         | 単体 |
| TC-03     | `SKILL_NAME_PATTERN` 正常系      | `"my-skill-2"`                  | マッチする         | 単体 |
| TC-04     | `SKILL_NAME_PATTERN` 異常系      | `"my_skill"`（アンダースコア）  | マッチしない       | 単体 |
| TC-05     | `SKILL_NAME_PATTERN` 異常系      | `"-my-skill"`（先頭ハイフン）   | マッチしない       | 単体 |
| TC-06     | `SKILL_NAME_PATTERN` 異常系      | `"my-skill-"`（末尾ハイフン）   | マッチしない       | 単体 |
| TC-07     | `SKILL_NAME_PATTERN` 異常系      | `"MY-SKILL"`（大文字）          | マッチしない       | 単体 |
| TC-08     | `SKILL_NAME_PATTERN` 異常系      | `""`（空文字）                  | マッチしない       | 単体 |
| TC-09     | `SKILL_NAME_PATTERN` 異常系      | `"スキル"`（日本語）            | マッチしない       | 単体 |
| TC-10     | `MAX_SKILL_NAME_LENGTH` の値確認 | —                               | `64`               | 単体 |
| TC-11     | `SkillService` 回帰確認          | `toWizardSkillName("my skill")` | `"my-skill"`       | 統合 |
| TC-12     | `validateSkillName` 回帰確認     | `"valid-name"`                  | `{ valid: true }`  | 統合 |
| TC-13     | `validateSkillName` 回帰確認     | `"INVALID"`                     | `{ valid: false }` | 統合 |

#### テストファイル配置

- `packages/shared/src/constants/skillName.test.ts`（新規作成）
- 既存の `SkillService` テスト（回帰確認）

#### 注意事項

- Phase 1 で確認した命名規則（kebab-case の定義）と整合しているか Phase 4 着手前に再確認すること
- `init_skill.js` は CommonJS スクリプトのため、Vitest での直接テストが難しい場合は統合パス（`SkillService` 経由）での検証を優先する

#### 完了条件

- テストが Red 状態（実装前に失敗する）で作成されている
- テストマトリクスの全 TC が仕様書に記録されている

---

### Phase 5: 実装

**ステータス**: open

#### 目的

設計に従って定数定義・参照更新・ビルド確認を行う。

#### 実装計画

**新規作成ファイル**:

- `packages/shared/src/constants/skillName.ts`

**修正ファイル**:

- `packages/shared/src/constants/index.ts`
- `apps/desktop/src/main/services/skill/SkillService.ts`
- `.claude/skills/skill-creator/scripts/init_skill.js`
- `.agents/skills/skill-creator/scripts/init_skill.js`（mirror）

#### 実装手順

1. `packages/shared/src/constants/skillName.ts` を新規作成し、`SKILL_NAME_PATTERN` と `MAX_SKILL_NAME_LENGTH` を export する
2. `packages/shared/src/constants/index.ts` に `skillName.ts` からのエクスポートを追加する
3. `pnpm --filter @repo/shared build` を実行し、CJS / ESM 両方のビルド成果物が生成されることを確認する
4. `apps/desktop/src/main/services/skill/SkillService.ts` で `@repo/shared` から `SKILL_NAME_PATTERN` をインポートし、コメントを更新する
5. `.claude/skills/skill-creator/scripts/init_skill.js` で `require('@repo/shared')` を追加し、`validateSkillName()` のハードコード正規表現を定数に差し替える
6. `.agents/skills/skill-creator/scripts/init_skill.js` を `.claude` 側と同じ内容で mirror 同期する

#### 完了条件

- `pnpm --filter @repo/shared build` が PASS している
- `pnpm --filter @repo/desktop typecheck` が PASS している
- テスト（Phase 4 で作成した TC 全件）が Green になっている

---

### Phase 6: テスト拡充

**ステータス**: open

#### 目的

失敗パス・回帰ガード・エッジケースのテストを追加する。

#### 追加テスト観点

| 観点                                  | 内容                                                                      |
| ------------------------------------- | ------------------------------------------------------------------------- |
| `SKILL_NAME_PATTERN` エクスポート確認 | `@repo/shared` のエントリから正しく import できることを確認               |
| `init_skill.js` の CJS 参照           | 実際に `require('@repo/shared')` で `SKILL_NAME_PATTERN` が取得できること |
| ビルド成果物の存在確認                | `packages/shared/dist/` に CJS ビルドが存在することの回帰確認             |
| 境界値テスト                          | 64 文字ちょうど・65 文字のスキル名での `validateSkillName` の動作確認     |

#### 完了条件

- 失敗パスのテストが追加されている
- エッジケース（境界値）が網羅されている

---

### Phase 7: カバレッジ確認

**ステータス**: open

#### 目的

変更した関数・ブロックのカバレッジを実測する。

#### 対象ファイル

- `packages/shared/src/constants/skillName.ts`（新規）: line 100% / branch 100% を目標
- `apps/desktop/src/main/services/skill/SkillService.ts` の `toWizardSkillName()` 関数: 変更箇所の branch カバレッジ確認

#### コマンド

```bash
pnpm --filter @repo/shared test -- --coverage --reporter=verbose
```

#### 完了条件

- `skillName.ts` の line カバレッジ・branch カバレッジの実測値が記録されている
- `toWizardSkillName()` 周辺の既存カバレッジが低下していないことが確認されている

---

### Phase 8: リファクタリング

**ステータス**: open

#### 目的

実装後の重複・命名ドリフト・不要なコメントを除去する。

#### リファクタリング観点

| 対象                             | Before                                        | After                                 | 理由               |
| -------------------------------- | --------------------------------------------- | ------------------------------------- | ------------------ |
| `SkillService.ts` のコメント     | バリデーション規則を直接コメントに記述        | `SKILL_NAME_PATTERN` 参照に言及       | 単一の信頼源を明示 |
| `init_skill.js` のインライン定数 | `if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name))` | `if (!SKILL_NAME_PATTERN.test(name))` | 定数参照に統一     |
| `skillName.ts` の JSDoc          | —                                             | 参照元ファイルへの `@see` を追記      | 文脈の自己文書化   |

#### 完了条件

- リファクタリング内容が Before/After/理由テーブルで記録されている
- typecheck / lint が PASS している

---

### Phase 9: 品質検証

**ステータス**: open

#### 目的

typecheck / lint / test / build を一括実行し、全て PASS することを確認する。

#### 実行コマンド

```bash
# typecheck
pnpm --filter @repo/shared typecheck
pnpm --filter @repo/desktop typecheck

# lint
pnpm --filter @repo/shared lint
pnpm --filter @repo/desktop lint

# test
pnpm --filter @repo/shared test
pnpm --filter @repo/desktop test -- --reporter=verbose

# build
pnpm --filter @repo/shared build
```

#### 完了条件

- 全コマンドが PASS している
- FAIL があった場合は原因を特定し修正している

---

### Phase 10: 最終レビュー

**ステータス**: open

#### 目的

受入条件を全て満たしているか最終確認し、blocker を判定する。

#### 受入条件チェック

| 受入条件                                                               | 判定 |
| ---------------------------------------------------------------------- | ---- |
| `SKILL_NAME_PATTERN` の定義が `packages/shared` 1 箇所に集約されている | open |
| `SkillService.ts` が `@repo/shared` から定数を参照している             | open |
| `init_skill.js` が `@repo/shared` から定数を参照している               | open |
| `validateSkillName()` の動作が変更前後で一致する（回帰なし）           | open |
| typecheck PASS                                                         | open |
| lint PASS                                                              | open |
| 全テスト PASS                                                          | open |
| `.agents` mirror が `.claude` と同一内容                               | open |

#### MINOR 指摘の扱い

- MINOR 指摘は未タスクとして切り出し、本タスクの完了はブロックしない

#### 完了条件

- BLOCKER が 0 件
- MINOR 指摘が未タスクとして記録されている

---

### Phase 11: 手動テスト

**ステータス**: open

**タスク分類**: NON_VISUAL（表示層変更なし・バックエンド定数リファクタリング）

#### 目的

NON_VISUAL タスクのため、自動テスト結果を primary evidence として記録する。スクリーンショットは不要。

#### 証跡方針

- screenshot は不要（NON_VISUAL）
- vitest / typecheck / lint の実行結果を primary evidence として `manual-test-result.md` に記録する
- スクリーンショットを作らない理由: UI 変更が一切ないため

#### 確認項目

| 確認内容                                             | 確認方法                         |
| ---------------------------------------------------- | -------------------------------- |
| スキル作成フロー（ウィザード）が正常に動作する       | 既存の統合テストで回帰なしを確認 |
| `init_skill.js` でのスキル名バリデーションが動作する | 単体テスト TC-12・TC-13 で確認   |
| `@repo/shared` からの import が解決される            | typecheck PASS で確認            |

#### 完了条件

- `manual-test-result.md` に証跡の主ソース（テスト名・件数）と NON_VISUAL 理由が明記されている
- 全テスト PASS が記録されている

---

### Phase 12: ドキュメント

**ステータス**: open

#### 目的

実装ガイド（Part 1/2）・システム仕様更新・未タスク検出・スキルフィードバックを完了する。

---

#### Task 12-1: 実装ガイド作成（Part 1 + Part 2）

##### Part 1: 中学生でも理解できる説明

**日常の例え話: 学校のルールブックを 1 冊に統一する**

あなたの学校では「スキル名」にどんな文字が使えるかというルールがあります。このルールは「小文字アルファベットと数字、ハイフン（-）だけ使える、先頭や末尾にハイフンはダメ」というものです。

ところが今まで、このルールが 2 つの場所に別々に書かれていました。

- 1 つ目: 「スキル作成画面」を動かすプログラム（`SkillService.ts`）
- 2 つ目: スキルのフォルダを作るツール（`init_skill.js`）

これは「体育館の規則」が体育館の壁にも保健室にも貼られている状態です。もしルールを変えるとき、片方だけ変えて片方を忘れると、場所によって違うルールになってしまいます。

このタスクでは、ルールを「共有のルールブック」（`packages/shared/src/constants/skillName.ts`）1 冊にまとめ、どちらのプログラムもそのルールブックを参照するように変えます。これで「どこか 1 箇所を直せば全部に反映される」安全な状態になります。

##### Part 2: 技術者向けの説明

**変更概要**

`/^[a-z0-9]+(-[a-z0-9]+)*$/` という正規表現が `SkillService.ts` と `init_skill.js` の 2 箇所に分散していたため、`packages/shared/src/constants/skillName.ts` に一元化した。

**インターフェース（TypeScript）**

```typescript
// packages/shared/src/constants/skillName.ts
export const SKILL_NAME_PATTERN: RegExp = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const MAX_SKILL_NAME_LENGTH: number = 64;
```

**使用例 (TypeScript)**

```typescript
import { SKILL_NAME_PATTERN, MAX_SKILL_NAME_LENGTH } from "@repo/shared";

// バリデーション
const isValid = SKILL_NAME_PATTERN.test("my-skill"); // true
const tooLong = "x".repeat(MAX_SKILL_NAME_LENGTH + 1);
```

**使用例 (CommonJS / init_skill.js)**

```javascript
const { SKILL_NAME_PATTERN, MAX_SKILL_NAME_LENGTH } = require("@repo/shared");

function validateSkillName(name) {
  if (!name) return { valid: false, error: "スキル名が指定されていません" };
  if (name.length > MAX_SKILL_NAME_LENGTH) {
    return {
      valid: false,
      error: `スキル名は${MAX_SKILL_NAME_LENGTH}文字以内である必要があります`,
    };
  }
  if (!SKILL_NAME_PATTERN.test(name)) {
    return {
      valid: false,
      error:
        "スキル名はハイフンケース（小文字、数字、ハイフン）である必要があります",
    };
  }
  return { valid: true };
}
```

**ビルド設定の注意点**

`packages/shared` の `tsup.config.ts` が CJS / ESM 両方を出力していることを前提とする。`init_skill.js` は Node.js の CommonJS スクリプトであるため、`dist/index.cjs` が存在することが必須条件となる。

---

#### Task 12-2: システム仕様書更新

**Step 1-A**: タスク完了記録

- `docs/30-workflows/task-workflow-completed.md` に UT-FIX-IPC-SKILL-NAME-PATTERN-CENTRALIZATION-001 完了記録を追加する
- `task-specification-creator/LOGS.md` と `aiworkflow-requirements/LOGS.md` の両方を更新する

**Step 1-B**: 実装状況テーブル更新

- `task-workflow-backlog.md` の当タスクのステータスを `completed` に更新する

**Step 1-C**: 関連タスクテーブル更新

- 本タスク仕様書内の関連タスクテーブルのステータスを current facts に更新する

**Step 2**: 新規インターフェース追加のため更新が必要

- `SKILL_NAME_PATTERN` / `MAX_SKILL_NAME_LENGTH` を `packages/shared` の公開 API として記録する

---

#### Task 12-3: ドキュメント更新履歴作成

- `documentation-changelog.md` に本タスクの変更履歴を記録する

---

#### Task 12-4: 未タスク検出レポート作成（0 件でも出力必須）

以下を確認し、検出された未タスクを記録する（0 件の場合もその旨を記録）。

| ソース            | 確認項目                                                               |
| ----------------- | ---------------------------------------------------------------------- |
| Phase 3 レビュー  | MINOR 判定の指摘事項                                                   |
| Phase 10 レビュー | MINOR 判定の指摘事項                                                   |
| コードコメント    | TODO / FIXME / HACK                                                    |
| スコープ外候補    | `validateSkillName()` のロジック強化・`init_skill.js` の TypeScript 化 |

---

#### Task 12-5: スキルフィードバックレポート作成（改善点なしでも出力必須）

- `outputs/phase-12/skill-feedback-report.md` を作成する
- CJS / ESM 両対応の検証ステップをテンプレートに組み込むべきかを評価する

#### 完了条件

- `implementation-guide.md` が Part 1/2 を満たしている
- Step 1-A〜1-C が記録されている
- `documentation-changelog.md` が作成されている
- `unassigned-task-detection.md` が作成されている（0 件でも可）
- `skill-feedback-report.md` が作成されている

---

### Phase 13: PR 作成

**ステータス**: open

**注意: ユーザーの明示的な承認を得てから実施すること。自動実行しない。**

#### 目的

Phase 1〜12 の成果物をまとめてプルリクエストを作成する。

#### PR 作成条件

- [ ] Phase 1〜12 が全て完了している
- [ ] ユーザーが「PR を作成してください」と明示的に承認している

#### PR 構成案

**タイトル**: `refactor(shared): SKILL_NAME_PATTERN 定数を packages/shared に一元化`

**本文の構成**:

- 変更の背景（2 箇所に分散していた定数の一元化）
- 変更ファイル一覧
- テスト結果サマリー
- 既存動作への影響（なし）

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `SKILL_NAME_PATTERN` の定義が `packages/shared/src/constants/skillName.ts` の 1 箇所に集約されている
- [ ] `SkillService.ts` が `@repo/shared` から定数を参照している
- [ ] `init_skill.js`（`.claude` / `.agents` 両方）が `@repo/shared` から定数を参照している
- [ ] `validateSkillName()` の動作が変更前後で同一である（回帰なし）

### 品質要件

- [ ] typecheck PASS（`@repo/shared` / `@repo/desktop` 両方）
- [ ] lint PASS
- [ ] 全テスト PASS
- [ ] `pnpm --filter @repo/shared build` PASS（CJS / ESM 両方）
- [ ] `skillName.ts` の line / branch カバレッジが記録されている

### ドキュメント要件

- [ ] `implementation-guide.md` が Part 1（中学生レベル）/ Part 2（技術者レベル）を満たしている
- [ ] `documentation-changelog.md` が作成されている
- [ ] `unassigned-task-detection.md` が作成されている（0 件でも可）
- [ ] `skill-feedback-report.md` が作成されている
- [ ] LOGS.md が 2 ファイル（`aiworkflow-requirements/LOGS.md` と `task-specification-creator/LOGS.md`）更新されている

---

## 6. 検証方法

### テストケース一覧

（Phase 4: テスト作成 のテストマトリクスを参照）

### 検証手順

1. `pnpm --filter @repo/shared test` で TC-01〜TC-10 が PASS することを確認
2. `pnpm --filter @repo/desktop test -- --testPathPattern=SkillService` で TC-11 が PASS することを確認
3. `init_skill.js` を実際に呼び出し（`node .claude/skills/skill-creator/scripts/init_skill.js --help` 等）てエラーなく起動することを確認
4. `pnpm --filter @repo/shared build` で CJS / ESM 両ビルドが生成されることを確認

---

## 7. リスクと対策

| リスク                                                                     | 影響度 | 発生確率 | 対策                                                                                        |
| -------------------------------------------------------------------------- | ------ | -------- | ------------------------------------------------------------------------------------------- |
| `@repo/shared` の CJS ビルドが存在しない                                   | 高     | 中       | Phase 5 実装前に `pnpm --filter @repo/shared build` を実行し、`dist/index.cjs` の存在を確認 |
| `require('@repo/shared')` の解決パスがずれる                               | 高     | 低       | `node_modules/@repo/shared` が workspace リンク経由で正しく解決されるか `pnpm ls` で確認    |
| `init_skill.js` の変更が `.agents` mirror に漏れる                         | 中     | 中       | Phase 5 の手順に `.agents` 更新ステップを明示し、Phase 10 の受入条件でチェック              |
| `MAX_SKILL_NAME_LENGTH` の値が既存コードと食い違う                         | 中     | 低       | Phase 1 で `init_skill.js` の現在値（64）を記録し、定数定義時に一致させる                   |
| `SKILL_NAME_PATTERN` の正規表現に `new RegExp()` を使うと flags が失われる | 低     | 低       | リテラル形式（`/^[a-z0-9]+(-[a-z0-9]+)*$/`）で定義し、flags の変更は行わない                |

---

## 8. 参照情報

### 関連ドキュメント

- `apps/desktop/src/main/services/skill/SkillService.ts` — `toWizardSkillName()` の実装
- `.claude/skills/skill-creator/scripts/init_skill.js` — `validateSkillName()` の実装
- `.agents/skills/skill-creator/scripts/init_skill.js` — mirror（`.claude` 側と同内容であること）
- `packages/shared/src/constants/index.ts` — 既存の定数 export エントリポイント
- `packages/shared/src/constants/security.ts` — 既存定数の参考実装

### 関連タスク

| タスク ID                               | 関係                 | ステータス |
| --------------------------------------- | -------------------- | ---------- |
| TASK-FIX-IPC-SKILL-NAME-001             | 親タスク             | completed  |
| UT-FIX-SKILL-NAME-JAPANESE-INPUT-UX-001 | 兄弟タスク（UX改善） | unassigned |

---

## 9. 備考

### 苦戦箇所【記入必須（実施前は予測として記録）】

| 項目      | 内容                                                                                                                     |
| --------- | ------------------------------------------------------------------------------------------------------------------------ |
| 症状1     | `SkillService.ts` と `init_skill.js` が同型の正規表現を個別保持しており、命名ルール変更時の同期漏れリスクがある          |
| 原因1     | TASK-FIX-IPC-SKILL-NAME-001 では変更最小性を優先し定数一元化をスコープ外としたため分散状態が残った                       |
| 対応1     | `packages/shared/src/constants/skillName.ts` に `SKILL_NAME_PATTERN` を定義し両ファイルから参照するよう変更する          |
| 再発防止1 | 新規バリデーション定数を追加する際は初めから `packages/shared` に置き、各実装からはインポートする設計を徹底する          |
| 症状2     | `init_skill.js`（CommonJS）から `@repo/shared`（ESM / CJS デュアルビルド）を参照するための検証が必要                     |
| 原因2     | monorepo の shared パッケージが CJS 出力を持つか、`require()` で解決できるかは実際にビルドして確認しないと判断できない   |
| 対応2     | Phase 5 実装前に `pnpm --filter @repo/shared build` を実行し `dist/` に CJS ファイルが存在することを確認してから進める   |
| 再発防止2 | 共有パッケージを Node.js スクリプトから利用する場合は「CJS ビルド成果物の存在確認」を Phase 1 の前提条件チェックに含める |

### 補足事項

- `init_skill.js` の TypeScript 化は本タスクのスコープ外。CommonJS のまま定数参照だけを変更する
- `.agents/skills/` は `.claude/skills/` の mirror であるため、`.claude` 側を更新したら必ず `.agents` 側も同一内容で更新する
- `SKILL_NAME_PATTERN` の正規表現の意味: 先頭が小文字英数字で始まり、ハイフンと小文字英数字が続く1段以上のセグメント列（例: `my-skill-123`）
