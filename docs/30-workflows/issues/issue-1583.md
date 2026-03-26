# [#1583] [UT-IMP-SESSION-DOCK-CREDENTIAL-PATTERN-EXTEND-001] CREDENTIAL_PATTERNS 拡張（AWS/GCP/Azure）

## 概要

transcript share の credential sanitize で使用する CREDENTIAL_PATTERNS に AWS / GCP / Azure のキー形式を追加する。現在は基本的なパターン（API key、token 等）のみ対応しており、クラウドプロバイダー固有のキー形式が漏れる可能性がある。

## 対応方針

- AWS Access Key ID (`AKIA...`) パターンを追加
- GCP Service Account JSON key パターンを追加
- Azure Storage Account Key パターンを追加
- 各パターンのユニットテストを追加

## 受入基準

- [ ] AWS Access Key ID パターンが CREDENTIAL_PATTERNS に追加されている
- [ ] GCP Service Account JSON key パターンが追加されている
- [ ] Azure Storage Account Key パターンが追加されている
- [ ] 各パターンのユニットテストが追加されている
- [ ] 既存の基本パターン（API key、token）のテストが引き続き PASS する

## メタ情報

| 項目   | 内容                                                                                     |
| ------ | ---------------------------------------------------------------------------------------- |
| 発見元 | TASK-IMP-SESSION-DOCK-ARTIFACT-BRIDGE-001 Phase 10 MN-10-02                              |
| 優先度 | 中                                                                                       |
| 分類   | 機能拡張                                                                                 |
| 仕様書 | `docs/30-workflows/unassigned-task/UT-IMP-SESSION-DOCK-CREDENTIAL-PATTERN-EXTEND-001.md` |
