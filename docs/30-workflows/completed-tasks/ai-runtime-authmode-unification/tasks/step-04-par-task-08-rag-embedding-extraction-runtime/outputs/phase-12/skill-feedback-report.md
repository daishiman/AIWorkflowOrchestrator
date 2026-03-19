# スキルフィードバックレポート

## メタ情報

| 項目     | 内容                                             |
| -------- | ------------------------------------------------ |
| タスクID | TASK-IMP-RAG-EMBEDDING-EXTRACTION-AI-RUNTIME-001 |
| Phase    | 12                                               |
| 作成日   | 2026-03-19                                       |
| 対象機能 | rag-embedding-extraction-runtime                 |

---

## 1. ワークフロー改善点

### 1.1 P50 チェックの有効性（Phase 1 の先行調査）

**観察**: Phase 1 で P50 チェック（既実装状態の調査）を実施した結果、「新規実装」と「gap 補完」のモードを早期に分離できた。具体的には Embedding Lane（全て implemented）と Index Lane（全て production mock）で対応方針が明確に分かれた。

**効果**: Phase 4-5 を「新規設計 + 既存 gap 補完」モードで開始できたため、不要なコード重複の作成リスクを回避した。

**改善提案**: P50 チェックの結果を Phase 1 requirements-definition.md の冒頭セクションに必ず記載するパターンを標準化する。現在は手順として記載されているが、「P50 結論」セクションのテンプレートを specification-creator の phase-templates.md に追加するとよい。

### 1.2 3 lane 並列調査の効率

**観察**: Phase 2 の SubAgent 分担（Index Agent / Embedding Agent / Search Agent）により、21 surface の capability matrix を 3 レーンに分割して並列調査できた。

**効果**: 各 lane の専門性（job lifecycle / provider API / pipeline orchestration）が異なるため、SubAgent 分担により調査品質が向上した。

**改善提案**: SubAgent 分担の単位を「lane」ではなく「変更パターン（guidance-only化 / 実装補完 / ログ強化）」に変えると、Phase 5 実装時のコンフリクトリスクがさらに低下する可能性がある。現状は lane 境界がファイル境界と一致しているため問題は発生しなかったが、将来的に lane をまたぐコンポーネントが増えた場合に有効。

### 1.3 silent fallback 判定マトリクスの早期確定

**観察**: Phase 2 で SF-01〜SF-09 の「設計意図として承認」「修正対象」「要監視」の 3 分類を確定した。これにより Phase 5 実装時に「どこを変えてよくてどこは変えてはいけないか」が明確だった。

**効果**: SF-04 / SF-06 / SF-08（設計意図として承認）は Phase 5 で変更せず、テストの期待値のみを更新することができた。変更対象（SF-01〜SF-03）のみに実装が集中した。

**改善提案**: 「要監視」カテゴリ（SF-05 / SF-07 / SF-09）に対してはログ記録の義務化まで Phase 2 で設計に含め、Phase 5 の実装スコープとして明示的に追加する方針を標準化する。今回は実施したが、仕様書への明文化が Phase 2 時点では不完全だった。

---

## 2. スキル設計パターンの改善点

### 2.1 guidance-only パターンの標準化提案

**観察**: `guidance-only` レスポンスパターンは今回のタスクで初めて体系化された。IPC handler が production mock を返すのではなく、構造化されたガイダンスメッセージを返すパターンは、他のタスクでも再利用できる。

**提案**: `aiworkflow-requirements/references/` 配下に `patterns-guidance-only.md` を追加し、以下を定義する:

- guidance-only レスポンスの TypeScript 型定義
- `status: "guidance-only"` を返す IPC handler のテンプレート
- register/unregister ペアの実装テンプレート（P5 対策組み込み済み）
- production mock から guidance-only への移行チェックリスト

**優先度**: MEDIUM（同パターンが他 task でも繰り返されることが想定される）

### 2.2 capability matrix のテンプレート化

**観察**: Phase 2 の capability matrix（21 surface）は、今後の新機能追加時にも同様の構造で使いまわせる。

**提案**: `phase-templates.md` の Phase 2 設計テンプレートに capability matrix の雛形（列定義: `runtime capability` / `implementation status` / `api-key required` / `guidance-only fallback`）を追加する。

**優先度**: LOW

### 2.3 silent fallback 是非判定フォームの標準化

**観察**: SF-01〜SF-09 の是非判定で使った「設計意図として承認 / 修正対象 / 要監視」の 3 分類は、他のコードベース調査でも有効なパターン。

**提案**: `references/quality-requirements.md` に「silent fallback 是非判定テンプレート」セクションを追加する。

**優先度**: LOW

### 2.4 未タスク formalize の ID / filename 分離ルール

**観察**: `UT-RAG-08-001`〜`013` は本文メタ情報の正式 ID は正しかった一方で、physical filename に `UT-*` をそのまま使うと `audit-unassigned-tasks --target-file` で naming violation になった。

**提案**: `task-specification-creator` の未タスクガイドに「正式 ID は `UT-*`、physical filename は lowercase `task-...md`」を明記し、`skill-creator` の Phase 12 再監査パターンにも同ルールを追記する。

**優先度**: MEDIUM

---

## 3. ツール・スクリプトの改善点

### 3.1 capability matrix の自動検出スクリプト

**観察**: Phase 1 で 21 surface の inventory を手動で調査した。`grep -rn "TODO\|FIXME" aiHandlers.ts` や `grep -rn "mock\|stub" communityHandlers.ts` を組み合わせて実施したが、これは自動化できる。

**提案**: `scripts/detect-production-mock.js` スクリプトを作成し、以下のパターンを検出する:

- `ipcMain.handle` 内の `return { success: true, data: mockData }` 形式
- `setTimeout(N, () => resolve(fixedValue))` 形式の固定遅延 mock
- 検出結果を capability matrix の `implementation status` 列に自動マッピング

**優先度**: MEDIUM

### 3.2 unregister 漏れの静的検査

**観察**: P5 対策（register/unregister ペア）の確認を Phase 5 で手動で実施した。`ipcMain.handle` を持つファイルに対して `ipcMain.removeHandler` が存在するかを確認する作業。

**提案**: `scripts/validate-ipc-register-pairs.js` スクリプトを作成し、`apps/desktop/src/main/ipc/` 配下の全ファイルに対して register/unregister ペアの存在を静的チェックする。

**優先度**: MEDIUM（P5 はリスクの高い pitfall であり自動化価値が高い）

### 3.3 direct capture preflight failure の記録標準化

**観察**: direct capture は `@esbuild/darwin-arm64` / `darwin-x64` mismatch により失敗し、review board fallback へ切り替えた。fallback 自体は妥当だったが、失敗理由と切替基準を先にテンプレート化しておくと迷いが減る。

**提案**: `skill-creator` に「direct capture を一度だけ preflight 実行し、失敗時は exact command / error / fallback 採用理由を `command-transcript.md` と `lessons-learned-current.md` へ同時記録する」運用を追加する。

**優先度**: MEDIUM

---

## 4. 総括

今回のタスクは「production mock の guidance-only 化」という明確な目標があり、P50 チェックと SF 是非判定マトリクスによって変更スコープが早期に確定できた点が最もよかった。

改善点のうち優先度 MEDIUM の 4 件（guidance-only パターン標準化 / 未タスク filename ルール / IPC register ペア自動検査 / direct capture preflight 標準化）は、今後の同類タスクへの直接的な品質向上につながるため、次のメンテナンスサイクルでの対応を推奨する。

---

_作成: Phase 12 Task 5 — 2026-03-19_
