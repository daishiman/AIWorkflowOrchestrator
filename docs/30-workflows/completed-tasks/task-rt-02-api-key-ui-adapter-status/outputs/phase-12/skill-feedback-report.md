# スキルフィードバックレポート

## 対象

- `task-specification-creator`
- `aiworkflow-requirements`

## フィードバック

### 1. verification-report の PASS 条件が弱い

- 現状: `outputs/verification-report.md` は Phase 11/12 の実ファイル欠落があっても PASS を出している
- 改善案: UI task では `outputs/phase-11/screenshots/` と `implementation-guide.md` の存在を hard fail 条件にする

### 2. source workflow と outputs の drift 検知が不足

- 現状: `index.md` / `phase-*.md` と `outputs/phase-*.md` が真逆の設計でも gate を通過した
- 改善案: Phase 2 / 5 / 10 / 12 で architecture keyword 差分を機械検知する

### 3. Step 2 判定の current fact 監査が必要

- 現状: 「新規 public contract 追加なし」と書かれた task で、実際は preload / shared / IPC 追加が branch 上に存在した
- 改善案: `preload/channels.ts` と `packages/shared/src/types` の差分有無を Step 2 判定へ組み込む
