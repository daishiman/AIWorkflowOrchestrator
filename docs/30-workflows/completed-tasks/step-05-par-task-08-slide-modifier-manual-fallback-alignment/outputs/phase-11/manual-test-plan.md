# Phase 11: 手動テスト計画

## メタ情報

| 項目     | 内容                                                  |
| -------- | ----------------------------------------------------- |
| タスクID | TASK-IMP-SLIDE-MODIFIER-MANUAL-FALLBACK-ALIGNMENT-001 |
| Phase    | 11                                                    |
| 作成日   | 2026-03-23                                            |
| タイプ   | 設計タスク（プロダクションコード変更なし）            |

## 注記

本タスクはプロダクションコード変更を含まない設計タスクであるため、
Phase 11 の手動テストは「設計 walkthrough」として実施する。
実際の UI テスト（Electron アプリ起動・操作）は UT-SLIDE-UI-001 で実施する。

---

## 1. UX-07 TC-ID Walkthrough 計画

### TC-01: UX-07-S01（synced 状態の画面確認）

| 項目         | 内容                                                                                                                                  |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| TC-ID        | UX-07-S01                                                                                                                             |
| 状態         | synced                                                                                                                                |
| 前提条件     | slide が正常に同期完了した直後                                                                                                        |
| 確認事項     | progress row のみが表示され、他の3領域（guidance block, fallback card, terminal launcher）が非表示                                    |
| 設計根拠     | contract-matrix.md セクション2 の表示マトリクス（synced 行）                                                                          |
| Walkthrough  | 表示マトリクスを目視で確認。synced 列が progress row のみ show                                                                        |
| 実装時の手順 | 1. Electron アプリを起動 / 2. slide 同期を正常完了させる / 3. SlideWorkspace の表示を確認 / 4. DevTools で DOM 構造を検査             |
| 期待結果     | `data-testid="guidance-block"`, `data-testid="fallback-card"`, `data-testid="terminal-launcher"` が DOM に存在しないか `display:none` |

### TC-02: UX-07-S02（running 状態の画面確認）

| 項目         | 内容                                                                                                                      |
| ------------ | ------------------------------------------------------------------------------------------------------------------------- |
| TC-ID        | UX-07-S02                                                                                                                 |
| 状態         | running                                                                                                                   |
| 前提条件     | slide 同期が開始された直後（startSync アクション発火後）                                                                  |
| 確認事項     | progress row が表示され、実行中インジケータ（アニメーション）が表示される                                                 |
| 設計根拠     | contract-matrix.md セクション2（running 行: progress row = show）                                                         |
| Walkthrough  | 表示マトリクスを目視で確認。running 列が progress row のみ show                                                           |
| 実装時の手順 | 1. slide 同期を開始 / 2. startSync アクション発火直後のスナップショットを確認 / 3. アニメーションインジケータの存在を確認 |
| 期待結果     | `data-testid="progress-row"` が表示状態、アニメーション CSS クラスが付与されている                                        |

### TC-03: UX-07-S03（degraded 状態の画面確認）

| 項目         | 内容                                                                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| TC-ID        | UX-07-S03                                                                                                                                         |
| 状態         | degraded                                                                                                                                          |
| 前提条件     | reportDegradation アクションが発火された直後                                                                                                      |
| 確認事項     | progress row + guidance block + fallback card が表示。fallback card の CTA ボタンが操作可能                                                       |
| 設計根拠     | contract-matrix.md セクション2（degraded 行）                                                                                                     |
| Walkthrough  | 表示マトリクスを目視で確認。degraded 列で guidance block / fallback card が show、terminal launcher が hide                                       |
| 実装時の手順 | 1. slide 同期を開始 / 2. 品質低下を意図的に発生させる / 3. degraded 状態に遷移することを確認 / 4. fallback card の CTA ボタンをクリック可能か確認 |
| 期待結果     | `data-testid="guidance-block"` と `data-testid="fallback-card"` が表示。`data-testid="terminal-launcher"` が非表示                                |

### TC-04: UX-07-S04（guidance 状態の画面確認）

| 項目         | 内容                                                                                                                                  |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| TC-ID        | UX-07-S04                                                                                                                             |
| 状態         | guidance                                                                                                                              |
| 前提条件     | requestGuidance アクションが発火された直後（fallback card の CTA クリック後）                                                         |
| 確認事項     | progress row + guidance block + terminal launcher が表示。fallback card が非表示                                                      |
| 設計根拠     | contract-matrix.md セクション2（guidance 行）                                                                                         |
| Walkthrough  | 表示マトリクスを目視で確認。guidance 列で guidance block / terminal launcher が show、fallback card が hide                           |
| 実装時の手順 | 1. degraded 状態から fallback card の CTA をクリック / 2. guidance 状態に遷移することを確認 / 3. terminal launcher ボタンの存在を確認 |
| 期待結果     | `data-testid="guidance-block"` と `data-testid="terminal-launcher"` が表示。`data-testid="fallback-card"` が非表示                    |

### TC-05: UX-07-S05（fallback CTA クリック後の遷移確認）

| 項目         | 内容                                                                                                                                                                         |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TC-ID        | UX-07-S05                                                                                                                                                                    |
| 状態         | fallback（degraded → guidance の遷移確認）                                                                                                                                   |
| 前提条件     | degraded 状態で fallback card が表示されている                                                                                                                               |
| 確認事項     | fallback card の CTA クリック後に guidance 状態に遷移する                                                                                                                    |
| 設計根拠     | contract-matrix.md セクション2（Action 契約: requestGuidance）                                                                                                               |
| Walkthrough  | Action 契約テーブルを目視で確認。requestGuidance: degraded → guidance                                                                                                        |
| 実装時の手順 | 1. degraded 状態に遷移 / 2. fallback card の CTA ボタンをクリック / 3. guidance 状態への遷移アニメーションを確認 / 4. DevTools でストア状態を確認（uiStatus === 'guidance'） |
| 期待結果     | ストアの `uiStatus` が `'guidance'` に変化。画面が TC-04 と同じ表示状態になる                                                                                                |

---

## 2. 不正遷移 Walkthrough 計画

設計タスクとして、不正遷移が設計ドキュメントに正しく定義されているかを確認する。

| 不正遷移パターン    | 設計での禁止理由                  | 設計ドキュメントでの確認箇所   |
| ------------------- | --------------------------------- | ------------------------------ |
| synced → degraded   | 実行せずに degraded にはならない  | contract-matrix.md セクション1 |
| synced → guidance   | 実行せずに guidance にはならない  | contract-matrix.md セクション1 |
| guidance → degraded | guidance から品質低下に後退しない | contract-matrix.md セクション1 |
| degraded → running  | P62 準拠: 自動再実行禁止          | contract-matrix.md セクション1 |

**Walkthrough 確認**: 各禁止パターンに「理由」が明記されていることを contract-matrix.md で目視確認する。
全4パターンに理由が記載されていることを確認済み（Phase 3 で確認）。

---

## 3. 実装タスク（UT-SLIDE-UI-001）向け手動テスト指示

以下は UT-SLIDE-UI-001 実施時のテスト手順として引き継ぐ。

```
1. pnpm --filter @repo/desktop dev でアプリを起動
2. SlideWorkspace コンポーネントが表示される画面に遷移
3. TC-01〜TC-05 を順番に実施
4. 各 TC で screenshot を取得し、screenshot-plan.json の capture 対象と照合
5. 不正遷移が発生しないことを確認（DevTools のストア状態を監視）
6. discovered-issues.md に発見事項を記録
```
