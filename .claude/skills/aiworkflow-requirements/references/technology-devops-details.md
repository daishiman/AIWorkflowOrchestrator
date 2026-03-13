# DevOps技術スタック（パッケージ管理・CI/CD） / detail specification

> 親仕様書: [technology-devops.md](technology-devops.md)
> 役割: detail specification

## マイグレーション計画

### 短期 (2025 Q1-Q2)

- [ ] React 19の新機能を全面活用
- [ ] Next.js 15のPPRを本番有効化
- [x] ESLint 9 Flat Configへの移行完了（TASK-CI-FIX-001: apps/backend 完了 2026-01-29）

### 中期 (2025 Q3-Q4)

- [ ] Tailwind CSS 4.0への移行
- [ ] Electron版の開発開始
- [ ] React Compilerの本番導入

### 長期 (2026)

- [ ] Node.js 24 LTSへの移行
- [ ] 次期Next.jsメジャーバージョン対応

---

## CI最適化パターン（TASK-OPT-CI-TEST-PARALLEL-001 2026-02-02追加）

### テストシャーディング

大量のテストファイルを複数のシャードに分割して並列実行する。

| パターン | 適用条件 | 効果 |
| -------- | -------- | ---- |
| matrixシャード | テストファイル100件以上 | 実行時間をシャード数で分割 |
| maxForks増加 | I/Oバウンドテスト | CPUコア×2まで並列度向上可能 |
| fileParallelism | メモリ8GB以上 | ファイル間並列実行 |

### キャッシュ戦略

| キャッシュ対象 | キー設計 | 効果 |
| -------------- | -------- | ---- |
| pnpmストア | OS + lockfileハッシュ | 依存インストール高速化 |
| sharedビルド成果物 | OS + src/** + lockfileハッシュ | ビルドスキップ |
| Nextキャッシュ | OS + Git SHA | 増分ビルド |

### 条件分岐パターン

| 条件 | 適用 | 理由 |
| ---- | ---- | ---- |
| PR時 | カバレッジ計測スキップ | 高速フィードバック |
| main push時 | カバレッジ計測実行 | 品質メトリクス収集 |
| cache-hit時 | ビルドスキップ | 重複作業回避 |

---

