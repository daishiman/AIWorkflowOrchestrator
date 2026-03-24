# UT-IMP-SESSION-DOCK-CREDENTIAL-PATTERN-EXTEND-001: CREDENTIAL_PATTERNS 拡張

## メタ情報

| 項目       | 内容                                                                          |
| ---------- | ----------------------------------------------------------------------------- |
| 未タスクID | UT-IMP-SESSION-DOCK-CREDENTIAL-PATTERN-EXTEND-001                             |
| 発見元     | TASK-IMP-SESSION-DOCK-ARTIFACT-BRIDGE-001 Phase 10 MN-10-02 / Phase 9 RISK-04 |
| 優先度     | 中                                                                            |
| 分類       | 機能拡張                                                                      |
| 対応時期   | 実装タスク Phase 5                                                            |

## 概要

transcript share の credential sanitize で使用する CREDENTIAL_PATTERNS に AWS / GCP / Azure のキー形式を追加する。現在は基本的なパターン（API key、token 等）のみ対応しており、クラウドプロバイダー固有のキー形式が漏れる可能性がある。

## 対応方針

- AWS Access Key ID (`AKIA...`) パターンを追加
- GCP Service Account JSON key パターンを追加
- Azure Storage Account Key パターンを追加
- 各パターンのユニットテストを追加

## 対象ファイル

- credential sanitize 実装ファイル（実装タスクで確定）
- 関連テストファイル

## 受入基準

- [ ] AWS Access Key ID (`AKIA...`) パターンが CREDENTIAL_PATTERNS に追加されている
- [ ] GCP Service Account JSON key パターンが追加されている
- [ ] Azure Storage Account Key パターンが追加されている
- [ ] 各パターンのユニットテストが追加されている
- [ ] 既存の基本パターン（API key、token）のテストが引き続き PASS する

## 依存関係

- 親タスク: TASK-IMP-SESSION-DOCK-ARTIFACT-BRIDGE-001
- 前提: credential sanitize 実装ファイルの存在（実装タスクで確定）

## 開発知見・苦戦箇所

- 当初 backlog に「reopen restore 時の認証バリデーション」と記載されたが、実際の内容は「transcript share の credential sanitize」であった（セマンティクスドリフト、Round 2 GAP-B で修正済み）
- CREDENTIAL_PATTERNS の正規表現は偽陽性（正常テキストの誤マスク）と偽陰性（機密情報の漏洩）のバランスが重要。各クラウドプロバイダーのキー形式を公式ドキュメントから確認すること

## 関連仕様書

- `docs/30-workflows/completed-tasks/step-02-seq-task-02-session-dock-artifact-bridge/outputs/phase-2/artifact-bridge-design.md`
- `docs/30-workflows/completed-tasks/step-02-seq-task-02-session-dock-artifact-bridge/outputs/phase-10/final-review-report.md`
