# 認証・セキュリティ アーキテクチャ設計

## 概要
この親仕様書はアーキテクチャ全体像の入口であり、詳細レイヤー / surface / support は child companion へ分離した。

## 仕様書インデックス
| ファイル | 役割 | 主な見出し |
| --- | --- | --- |
| [architecture-auth-security-core.md](architecture-auth-security-core.md) | core specification | セッション自動リフレッシュ（TASK-AUTH-SESSION-REFRESH-001） / 認証アーキテクチャ（Supabase + Electron） / セキュリティアーキテクチャ / RAGパイプラインアーキテクチャ |
| [architecture-auth-security-details.md](architecture-auth-security-details.md) | detail specification | 実装時の苦戦した箇所・知見 |
| [architecture-auth-security-history.md](architecture-auth-security-history.md) | history bundle | 変更履歴 / 完了タスク / 関連ドキュメント |

## 利用順序
- まずこの親仕様書で対象 child companion を選ぶ。
- 実装や契約の詳細は `core` / `details` / `advanced` 系を読む。
- 完了タスク、変更履歴、補助情報は `history` / `archive` 系を読む。

## 関連ドキュメント
- `indexes/quick-reference.md`
- `indexes/resource-map.md`
