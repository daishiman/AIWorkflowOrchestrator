# テスト仕様書

## メタ情報

| 項目                 | 値                                                                                 |
| -------------------- | ---------------------------------------------------------------------------------- |
| タスクID             | UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001                                         |
| Phase                | 4（テスト作成 -- TDD Red）                                                         |
| 作成日               | 2026-02-26                                                                         |
| テストフレームワーク | Vitest 2.x (Node.js ESM)                                                           |
| テスト対象           | `.claude/skills/skill-creator/scripts/quick_validate.js` の `validateSkill()` 関数 |
| テストファイル       | `.claude/skills/skill-creator/scripts/__tests__/quick_validate.test.js`            |
| フィクスチャ         | `.claude/skills/skill-creator/scripts/__tests__/fixtures/`（10ディレクトリ）       |
| テスト総数           | 45                                                                                 |

## 1. テスト設計方針

### 1.1 テストの位置づけ

本タスクは**運用改善タスク**であるため、プロダクションコード（React コンポーネント、IPC ハンドラ等）のテストではなく、**検証スクリプトの動作確認テスト**として実施する。

テストの目的:

1. `quick_validate.js` の8検証項目が正しく動作することを確認する
2. 異常入力に対して期待される Error/Warning が出力されることを確認する
3. Phase 5 で実装する Warning 3段階分類機能のテストケースを先行定義する（TDD Red）
4. 運用フロー（Phase 12 検証手順）の実行可能性を確認する

### 1.2 対象外

- `quick_validate.js` のコード変更（スコープ外）
- TypeScript コンパイル・型チェック（本タスクは JS スクリプトのテスト）
- E2E テスト・UI テスト

### 1.3 TDD Red/Green/Refactor の関係

| Phase | TDD段階 | 内容                                                                                                      |
| ----- | ------- | --------------------------------------------------------------------------------------------------------- |
| 4     | Red     | テストケースを定義する。既存機能テストは PASS、新規 Warning 分類テストは FAIL が期待される                |
| 5     | Green   | Warning 3段階分類機能を実装し、全テストが PASS になるようにする                                           |
| 6     | 拡充    | カバレッジ不足箇所のテスト追加（65文字name、1025文字description、角括弧description 等の専用フィクスチャ） |

### 1.4 テスト方針

| 方針             | 内容                                                                                          |
| ---------------- | --------------------------------------------------------------------------------------------- |
| TDD Red          | テストを先に設計し、Phase 5 の実装後に全件 PASS を目指す                                      |
| 独立性           | 各テストケースは独立して実行可能（テスト間で状態を共有しない: P9 対策）                       |
| ESM 対応         | `quick_validate.js` が ESM で書かれているため、テストも ESM で実行する                        |
| フィクスチャ駆動 | 模擬スキルディレクトリをフィクスチャとして作成し、検証対象の入力とする                        |
| 出力解析         | スクリプトの stdout/stderr を解析し、Error/Warning/Pass 件数と終了コードで判定する            |
| 要件追跡         | 全 FR/NFR/AC に対してテストケースが存在することを保証する（トレーサビリティマトリクスで管理） |

## 2. テストアーキテクチャ

### 2.1 テスト実行環境

| 項目                 | 値                                                                                      |
| -------------------- | --------------------------------------------------------------------------------------- |
| ランタイム           | Node.js v18以上（ESM モード）                                                           |
| テストフレームワーク | Vitest 2.x                                                                              |
| テストランナー       | `pnpm vitest run .claude/skills/skill-creator/scripts/__tests__/quick_validate.test.js` |
| 実行タイムアウト     | 30秒（1コマンドあたり）                                                                 |

### 2.2 テスト構造

```
.claude/skills/skill-creator/scripts/__tests__/
  quick_validate.test.js        -- テストコード（45テスト）
  fixtures/
    valid-skill/                -- 全検証項目パスの正常スキル
      SKILL.md
      references/
        test-ref.md
    no-skill-md/                -- SKILL.md なし
      .gitkeep
    over-limit/                 -- 501行 SKILL.md
      SKILL.md
    no-frontmatter/             -- frontmatter なし
      SKILL.md
    invalid-name/               -- 不正な name（キャメルケース）
      SKILL.md
    forbidden-files/            -- README.md が存在
      SKILL.md
      README.md
    unlinked-refs/              -- references/ に未リンクファイル
      SKILL.md
      references/
        unlinked-file.md
    boundary-500-lines/         -- ちょうど500行
      SKILL.md
    boundary-64-name/           -- ちょうど64文字 name
      SKILL.md
    boundary-1024-desc/         -- ちょうど1024文字 description
      SKILL.md
```

### 2.3 テスト実行方式

テストは `quick_validate.js` を `execSync` で子プロセスとして実行し、以下の3つの出力を解析する:

1. **stdout**: 検証結果の構造化テキスト（Pass/Warning/Error の件数含む）
2. **stderr**: Error メッセージ
3. **exitCode**: 終了コード（0: 成功, 4: 検証失敗）

直接の関数インポートではなく CLI インターフェース経由でテストする理由:

1. `quick_validate.js` は `process.exit()` を使用するため、直接インポートするとテストプロセスが終了する
2. CLI 経由により、実際の運用条件（コマンドライン実行）と同一の環境で検証できる
3. stdout/stderr/exitCode の3チャネル全てをテスト対象にできる

### 2.4 テストヘルパー関数

| 関数                       | 役割                                                      |
| -------------------------- | --------------------------------------------------------- |
| `runValidate(fixtureName)` | 指定フィクスチャに対して `quick_validate.js` を実行する   |
| `countErrors(output)`      | 出力から Error 件数を正規表現 `/(\d+)エラー/` で抽出する  |
| `countWarnings(output)`    | 出力から Warning 件数を正規表現 `/(\d+)警告/` で抽出する  |
| `countPassed(output)`      | 出力から Pass 件数を正規表現 `/(\d+)項目パス/` で抽出する |
| `findProjectRoot()`        | worktree 対応のプロジェクトルート検出                     |

### 2.5 テストカテゴリ

| カテゴリ        | テストID 範囲                  | 件数   | 内容                                                       |
| --------------- | ------------------------------ | ------ | ---------------------------------------------------------- |
| 正常系          | TC-N-001 〜 TC-N-014           | 14     | 8検証項目の個別パス確認 + 全体パス確認                     |
| 異常系          | TC-E-001 〜 TC-E-012           | 12     | 各検証項目の異常入力に対するError/Warning検出              |
| 境界値          | TC-B-001 〜 TC-B-003           | 3      | 500行/64文字/1024文字の境界値                              |
| 運用フロー      | TC-OP-001 〜 TC-OP-004         | 4      | 正規経路コマンド完走、結果解釈一意性、fallback確認、識別性 |
| Warning分類     | TC-WC-001 〜 TC-WC-006         | 6      | Error/Warning分類、集計精度、クリーン状態                  |
| Warning新規分類 | TC-WC-NEW-001 〜 TC-WC-NEW-002 | 2      | 3段階分類ラベル出力（Phase 5 実装予定 -- FAIL期待）        |
| NFR             | TS-008, TS-009, TS-010, TS-011 | 4      | 再現性、識別可能性、実行速度、後方互換                     |
| **合計**        |                                | **45** |                                                            |

## 3. フィクスチャ構成

### 3.1 フィクスチャ一覧（10ディレクトリ）

| #   | ディレクトリ名        | 目的                                     | 含まれるファイル                      | SKILL.md 行数 | name 文字数 | description 文字数 |
| --- | --------------------- | ---------------------------------------- | ------------------------------------- | ------------- | ----------- | ------------------ |
| 1   | `valid-skill/`        | 全8検証項目をパスする正常スキル          | SKILL.md, references/test-ref.md      | 21            | 11          | 可変               |
| 2   | `no-skill-md/`        | SKILL.md 不在のテスト                    | .gitkeep のみ                         | -             | -           | -                  |
| 3   | `over-limit/`         | 501行の SKILL.md（行数制限超過）         | SKILL.md (501行)                      | 501           | 10          | 可変               |
| 4   | `no-frontmatter/`     | YAML frontmatter なしの SKILL.md         | SKILL.md (--- ブロックなし)           | 6             | -           | -                  |
| 5   | `invalid-name/`       | キャメルケース name（`MyInvalidSkill`）  | SKILL.md                              | 12            | 14          | 可変               |
| 6   | `forbidden-files/`    | README.md が存在するスキル               | SKILL.md, README.md                   | 12            | 15          | 可変               |
| 7   | `unlinked-refs/`      | references/ に未リンクファイルが存在     | SKILL.md, references/unlinked-file.md | 12            | 13          | 可変               |
| 8   | `boundary-500-lines/` | ちょうど500行の SKILL.md（境界値）       | SKILL.md (500行)                      | 500           | 18          | 可変               |
| 9   | `boundary-64-name/`   | ちょうど64文字の name（境界値）          | SKILL.md                              | 16            | 64          | 可変               |
| 10  | `boundary-1024-desc/` | ちょうど1024文字の description（境界値） | SKILL.md                              | 9             | 18          | 1024               |

### 3.2 フィクスチャ設計原則

- 各フィクスチャは**1つの検証項目のみ**を異常にし、他の項目は正常な状態を維持する
- 境界値フィクスチャは、制限値ちょうどの入力（パスすべきケース）を用意する
- 制限値+1 の入力（FAIL するケース）は Phase 6 で専用フィクスチャを追加する
- フィクスチャの SKILL.md は全て有効な YAML フロントマター形式（異常系を除く）
- フィクスチャ間で依存関係を持たない（独立性）
- Phase 6（テスト拡充）でも再利用可能な構成とする

## 4. Phase 4 テスト結果の期待値

### 4.1 PASS 期待テスト（43件）

既存の `quick_validate.js` の機能に対するテスト。現行スクリプトで全て PASS する。

### 4.2 FAIL 期待テスト（2件）

Phase 5 で実装予定の Warning 3段階分類機能に対するテスト:

| テストID      | テスト名                                 | FAIL 理由                                    |
| ------------- | ---------------------------------------- | -------------------------------------------- |
| TC-WC-NEW-001 | Warning 出力に severity レベルが含まれる | 現行スクリプトは severity ラベルを出力しない |
| TC-WC-NEW-002 | Warning 分類の集計サマリが出力される     | 現行スクリプトは分類ごとの集計を出力しない   |

## 5. Phase 3 MINOR 指摘のテスト反映

Phase 3 で検出された MINOR 指摘 M-1, M-2, M-3 について、Phase 5 で対応する際にテストが正しく機能するよう、テスト設計に反映している:

| 指摘 | 内容                                         | テストへの反映                                                                      |
| ---- | -------------------------------------------- | ----------------------------------------------------------------------------------- |
| M-1  | 初回実行時の判定フロー注記追加               | TC-WC-003 で初回実行時の参照リンク Warning が「許容候補」として分類されることを検証 |
| M-2  | fallback コマンドから `--verbose` を削除     | TC-OP-003 で fallback 経路の存在を確認（`--verbose` は正規経路のみ使用）            |
| M-3  | 許容条件を大規模 references スキル共通に汎化 | TC-WC-003 でスキル固有ではなく汎用的な「未リンク reference は Warning」を検証       |

## 6. テスト実行方法

```bash
# Vitest で実行（推奨）
pnpm vitest run .claude/skills/skill-creator/scripts/__tests__/quick_validate.test.js

# verbose モードで実行
pnpm vitest run .claude/skills/skill-creator/scripts/__tests__/quick_validate.test.js --reporter=verbose
```

## 7. Phase 間連携

| 連携先Phase | 引き継ぎ事項                                                                       |
| ----------- | ---------------------------------------------------------------------------------- |
| Phase 5     | FAIL テスト（TC-WC-NEW-001, TC-WC-NEW-002）を PASS にするための実装を行う          |
| Phase 6     | 65文字name、1025文字description、角括弧description の専用フィクスチャを追加する    |
| Phase 7     | テストカバレッジ基準（Line 80%以上、Branch 60%以上、Function 80%以上）の充足を確認 |
