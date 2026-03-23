# UT-LLM-MOD-01-004: システム仕様書の旧モデルIDテーブル更新

## メタ情報

| 項目         | 値                                       |
| ------------ | ---------------------------------------- |
| タスクID     | UT-LLM-MOD-01-004                        |
| 由来         | TASK-LLM-MOD-01 30種思考法分析・漏れ検出 |
| 優先度       | 中                                       |
| 発見日       | 2026-03-23                               |
| issue_number | 1523                                     |

## 目的

`PROVIDER_CONFIGS` のモデル定義を最新化した後、`references/` 配下のシステム仕様書に残存する旧モデルIDのテーブル・コードサンプルを現行モデルIDに同期する。仕様書と実装の乖離（ドリフト）を解消し、開発者が仕様書を参照する際の混乱を防止する。

## 苦戦箇所・知見

- **旧モデルIDの散在箇所が多い**: `grep` で9ファイルにヒット。テーブル形式・コードサンプル・説明文中など出現パターンが複数ある
- **一部は意図的な旧ID参照**: `arch-state-management-*.md` の `DEFAULT_CONFIG` は GAP-03 パターンの説明用サンプルであり、コードを更新するだけでなくコンテキスト（「旧IDがフォールバックに使われるリスク」）の説明も維持する必要がある
- **LLM関連以外のファイル**（`technology-backend.md`, `rag-desktop-state.md`, `master-design.md` 等）にも旧IDが含まれるため、更新範囲の判断基準を事前に決めることが重要

## 対象ファイル（9ファイル）

| ファイル                                                  | 更新内容                                           |
| --------------------------------------------------------- | -------------------------------------------------- |
| `references/interfaces-llm.md`                            | 対応LLMプロバイダーテーブルのモデル例を最新化      |
| `references/ui-ux-llm-selector.md`                        | プロバイダーとモデル一覧テーブルのモデルIDを最新化 |
| `references/arch-state-management-core.md`                | DEFAULT_CONFIG コードサンプルのコメント更新        |
| `references/arch-state-management-reference-selectors.md` | 同上                                               |
| `references/technology-backend.md`                        | 対応モデル例の更新                                 |
| `references/technology-devops-core.md`                    | CI/CDパイプラインのモデル参照更新                  |
| `references/rag-desktop-state.md`                         | RAG設定のモデル参照更新                            |
| `references/master-design.md`                             | マスタ設計書のモデル例更新                         |
| `references/lessons-learned-ipc-preload-runtime.md`       | 教訓コードサンプルの文脈保持しつつ注釈追加         |

## 完了条件

- [ ] 上記9ファイルの旧モデルIDが現行モデルIDに更新または注釈追加されている
- [ ] GAP-03 説明用サンプル等の意図的な旧ID参照は、注釈でコンテキストを維持
- [ ] `grep -rn "gpt-4o\|gpt-5.2\|claude-3-5-sonnet\|gemini-1.5\|grok-beta" references/` の結果が0件または意図的残存のみ
- [ ] `node scripts/generate-index.js` で topic-map.md を再生成
