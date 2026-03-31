# Phase 8: リファクタリング

## メタ情報

| 項目   | 値                                       |
| ------ | ---------------------------------------- |
| Phase  | 8                                        |
| 機能名 | TASK-FIX-BETTER-SQLITE3-ELECTRON-ABI-001 |
| 作成日 | 2026-03-31                               |

## 目的

`rebuild:native` スクリプトの内容を精査し、改善の余地を検討する。今回の修正（`postinstall` 追加1行）はすでに最小構成であるため、リファクタリングの主眼は「スクリプトの堅牢性・保守性の確認」に置く。

## 現状の rebuild:native スクリプト確認

```json
"rebuild:native": "pnpm rebuild better-sqlite3 && (pnpm rebuild esbuild || true)"
```

### 現状分析

| 観点                   | 評価         | 詳細                                                                                   |
| ---------------------- | ------------ | -------------------------------------------------------------------------------------- |
| 可読性                 | 良好         | 対象パッケージが明示されており意図が明確                                               |
| 冪等性                 | 良好         | 何度実行しても同じ結果になる                                                           |
| エラーハンドリング     | 基本的       | `&&` により `better-sqlite3` の rebuild 失敗時は `esbuild` の rebuild がスキップされる |
| プラットフォーム互換性 | 良好         | pnpm rebuild は cross-platform                                                         |
| 将来の拡張性           | 検討余地あり | native addon が増えた場合、スクリプトへの追記が必要                                    |

## 改善の余地の検討

### 検討事項 1: esbuild の rebuild は必須か

`esbuild` は native addon を持つが、Electron での実行時に ABI 不一致が問題になるケースは `better-sqlite3` ほど頻繁ではない。ただし、将来的な安全のために含めておく現在の方針は妥当。

**判断: 現状維持**

### 検討事項 2: `electron-rebuild` ツールの使用

`electron-rebuild` パッケージを使用すると、`node_modules` 内の全 native addon を自動検出して rebuild できる。

```json
// 代替案（採用しない）
"rebuild:native": "electron-rebuild"
```

**採用しない理由**:

- `electron-rebuild` は追加の devDependency が必要
- 現在の `better-sqlite3` と `esbuild` の2つに限定した explicit な指定の方が、対象が明確で予期しない rebuild を防げる
- 変更量最小の方針と整合しない

**判断: 現状維持**

### 検討事項 3: postinstall のエラー時の挙動

ビルドツールチェーン（Xcode Command Line Tools 等）が未インストールの場合、`postinstall` が失敗する。この場合、`pnpm install` 全体が失敗するように見える。

```json
// 失敗時もインストールを継続させる場合（採用しない）
"postinstall": "pnpm rebuild:native || echo '[WARNING] rebuild:native failed. Run manually later.'"
```

**採用しない理由**:

- エラーをサイレントにすると、ABI 不一致の根本原因が見えにくくなる
- 失敗した場合は明確にエラーを出して開発者に通知すべき（Phase 3 レビュー済みの方針）

**判断: 現状維持**

## リファクタリング結果

今回のリファクタリング検討で実施する変更なし。

`rebuild:native` スクリプトは現状で適切に設計されており、`postinstall` からの呼び出し（Phase 5 で追加済み）により再発防止が完成している。

補足: ここでいう再発防止は「install 後の rebuild 取り忘れ」を主に指す。`NODE_ABI` と `ELECTRON_ABI` が異なるケースでは Electron 向け rebuild が別途必要になる可能性があり、Phase 11 の手動テストで検知して follow-up で扱う。

## 将来の保守に向けた注意事項

| 状況                                        | 対処方針                                                                                                                                                                                    |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Electron メジャーバージョンアップ           | `postinstall` が自動で rebuild を走らせるため、多くのケースで手順追加は不要。ただし ABI が変わる/差が出る場合は Phase 11 で検知し、Electron 向け rebuild を follow-up として formalize する |
| `better-sqlite3` のメジャーバージョンアップ | ABI 互換性テスト（Phase 4/6）で検出できる                                                                                                                                                   |
| 新たな native addon の追加                  | `rebuild:native` に `&& pnpm rebuild <pkg>` を追記する                                                                                                                                      |
| CI での rebuild 失敗                        | `node-gyp` 依存のため、ビルドツールチェーンの有無を CI 設定で確認する                                                                                                                       |

## 成果物

変更なし（リファクタリング不要の判断）

## 完了条件

- [ ] `rebuild:native` スクリプトの内容が精査されている
- [ ] `electron-rebuild` ツールへの移行は不要と判断されている
- [ ] `postinstall` のエラー時挙動（サイレント化しない方針）が確認されている
- [ ] 将来の保守に向けた注意事項が記録されている
- [ ] リファクタリング変更なしの判断根拠が文書化されている
