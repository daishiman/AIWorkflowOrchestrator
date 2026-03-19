# 実装パターン総合ガイド

## 概要
この親仕様書はアーキテクチャ全体像の入口であり、詳細レイヤー / surface / support は child companion へ分離した。
旧連番 suffix の reference child は semantic filename へ移行済み。旧 filename と current filename の対応や migration 根拠が必要なときは `legacy-ordinal-family-register.md` を参照する。

## 仕様書インデックス
| ファイル | 役割 | 主な見出し |
| --- | --- | --- |
| [architecture-implementation-patterns-core.md](architecture-implementation-patterns-core.md) | core specification | 概要 / フロントエンド実装パターン / バックエンド実装パターン / 共有パッケージ実装パターン |
| [architecture-implementation-patterns-details.md](architecture-implementation-patterns-details.md) | detail specification | デスクトップ（Electron）実装パターン |
| [architecture-implementation-patterns-advanced.md](architecture-implementation-patterns-advanced.md) | advanced specification | デスクトップ（Electron）実装パターン / パフォーマンス最適化パターン / セキュリティ実装パターン |
| [architecture-implementation-patterns-reference.md](architecture-implementation-patterns-reference.md) | reference bundle (testing foundation) | テスト実装パターン |
| [architecture-implementation-patterns-reference-ipc-contract-audits.md](architecture-implementation-patterns-reference-ipc-contract-audits.md) | reference bundle (IPC data contracts / naming audit / unassigned scope) | IPC データフロー型ギャップパターン（UT-IPC-DATA-FLOW-TYPE-GAPS-001 2026-02-24実装） / IPCチャネル命名監査の運用パターン（UT-IPC-CHANNEL-NAMING-AUDIT-001 2026-02-25実施） / 未タスク監査スコープ分離パターン（UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001） / 共有型インポート標準パターン（TASK-10A-D） |
| [architecture-implementation-patterns-reference-agent-view-selector-migration.md](architecture-implementation-patterns-reference-agent-view-selector-migration.md) | reference bundle (AgentView / selector migration / renderer boundary) | AgentView Enhancement 実装パターン（TASK-UI-03 2026-03-07実装） / 直接IPC→Store個別セレクタ移行 / Renderer 境界 providers 正規化パターン |
| [architecture-implementation-patterns-reference-ipc-fallback-validation.md](architecture-implementation-patterns-reference-ipc-fallback-validation.md) | reference bundle (IPC fallback helper / validation follow-up / Electron menu) | IPC Fallback Handler DRYヘルパーパターン（TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001 2026-03-08実装） / Electron role ベースメニューパターン（TASK-FIX-ELECTRON-APP-MENU-ZOOM-001 2026-03-16実装） |
| [architecture-implementation-patterns-reference-ipc-drift-detection.md](architecture-implementation-patterns-reference-ipc-drift-detection.md) | reference bundle (IPC drift auto-detection) | S-IPC-AUTO: IPC契約ドリフト自動検出パターン（UT-TASK06-007 2026-03-18実装） |
| [architecture-implementation-patterns-history.md](architecture-implementation-patterns-history.md) | history bundle | 関連ドキュメント / 変更履歴 |

## 利用順序
- まずこの親仕様書で対象 child companion を選ぶ。
- 実装や契約の詳細は `core` / `details` / `advanced` 系を読む。
- 完了タスク、変更履歴、補助情報は `history` / `archive` 系を読む。

## 関連ドキュメント
- `indexes/quick-reference.md`
- `indexes/resource-map.md`
