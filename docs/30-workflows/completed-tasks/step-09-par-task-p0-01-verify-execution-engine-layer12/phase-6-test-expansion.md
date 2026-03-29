# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                              |
| ------ | ------------------------------- |
| Phase  | 6                               |
| 機能名 | verify-execution-engine-layer12 |
| 作成日 | 2026-03-29                      |

## 目的

部分的な構造、破損ファイル、権限不足、symlink、大規模ディレクトリ等の edge case を補う。

## 実行タスク

- 部分構造 edge case を追加する
- 破損ファイル edge case を追加する
- file system 異常 edge case を追加する
- 境界値 edge case を追加する

## 参照資料

| 資料名              | パス                                     | 説明           |
| ------------------- | ---------------------------------------- | -------------- |
| Phase 4 test matrix | `outputs/phase-4/test-matrix.md`         | baseline suite |
| Phase 5 実装        | `phase-5-implementation.md`              | validator 実装 |
| layer check catalog | `outputs/phase-2/layer-check-catalog.md` | チェック ID    |

## 実行手順

### ステップ1: 部分構造 edge case を追加する

- SKILL.md のみ存在し agents/ なし — Layer 1 部分 fail、Layer 2 SKILL.md チェックは実行
- agents/ のみ存在し SKILL.md なし — Layer 1 部分 fail、Layer 2 SKILL.md チェックはスキップ
- agents/ 配下に `.md` 以外のファイルのみ — Layer 2 agent チェックは該当なし（pass 扱い or skip）
- 空の SKILL.md — Layer 1 pass（存在する）、Layer 2 全フィールド fail

### ステップ2: 破損ファイル edge case を追加する

- SKILL.md がバイナリファイル — Layer 2 は graceful に fail（crash しない）
- output-schema.json が空ファイル — Layer 2 JSON parse fail
- output-schema.json が truncated JSON — Layer 2 JSON parse fail
- agents/ 配下の `.md` が 0 バイト — Layer 2 heading なし（error）

### ステップ3: file system 異常 edge case を追加する

- skill ディレクトリ自体が存在しない — 全チェック fail、graceful error
- skill ディレクトリへの読み取り権限なし — graceful error handling
- symlink が broken — existence check で fail

### ステップ4: 境界値 edge case を追加する

- agents/ 配下に 100+ ファイル — 性能劣化がないこと
- SKILL.md が 10MB — 読み込みタイムアウトしないこと
- ディレクトリ名に日本語・スペースを含む — パス処理が正常

## 統合テスト連携

- Phase 7 で edge case の coverage を集計する。
- Phase 9 で graceful error handling が crash を防げていることを確認する。

## 成果物

| 成果物         | パス                        | 説明                 |
| -------------- | --------------------------- | -------------------- |
| test expansion | `phase-6-test-expansion.md` | edge case 方針と一覧 |

## 完了条件

- [ ] 部分構造の edge case が定義されている
- [ ] 破損ファイルの edge case が定義されている
- [ ] file system 異常の edge case が定義されている
- [ ] 境界値の edge case が定義されている
- [ ] **本Phase内の全タスクを100%実行完了**
