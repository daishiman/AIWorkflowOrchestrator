# Phase 11: 手動テスト - タスク仕様書

## メタ情報

| 項目       | 内容                                                     |
| ---------- | -------------------------------------------------------- |
| Phase      | 11                                                       |
| Phase名    | 手動テスト                                               |
| タスクID   | UT-W3-E2E-WIZARD-TRACKING-UI-REACH-001                   |
| 機能名     | スキルウィザード trackEvent の E2E UI 到達確認テスト追加 |
| タスク種別 | E2E テスト追加（NON_VISUAL）                             |
| 評価方針   | **NON_VISUAL（UI コンポーネント変更なし）**              |
| 前提Phase  | Phase 10                                                 |
| 後続Phase  | Phase 12                                                 |
| ステータス | 完了                                                     |
| 作成日     | 2026-04-12                                               |

---

## 目的

Phase 4〜9 で実施した自動テスト（E2E）・ツールチェックの結果を primary evidence として整理し、
E2E テスト追加タスクとして適切な手動確認チェックリストを完了させる。

---

## VISUAL / NON_VISUAL 判定

本 Phase では、手動テストの証跡取得方針を以下の基準で判定する。

### 判定基準

| 判定条件                              | 判定結果   |
| ------------------------------------- | ---------- |
| UI コンポーネントへの視覚的変更がある | VISUAL     |
| UI コンポーネントの変更がない         | NON_VISUAL |

### 本タスクの判定

**本タスクは E2E テスト追加タスクである。**

- 変更対象: `apps/desktop/e2e/skill-wizard-tracking.spec.ts`、`apps/desktop/e2e/helpers/wizard-tracking-stub.ts`、`apps/desktop/e2e/helpers/trackEvent.e2e-stub.ts`、`.github/workflows/ci.yml`、`apps/desktop/vite.e2e.config.ts`
- UI コンポーネント自体の変更: なし
- Electron アプリ起動での確認: **可能**（SkillWizard コンポーネントを手動操作し、trackEvent の発火を開発者ツールで確認可能）

**判定結果**: **NON_VISUAL（UI コンポーネント変更なし）**

このタスクは E2E テストコード・設定ファイルのみの変更であり、証跡の主ソースは
E2E 実行結果と HTML レポートである。`outputs/phase-11/screenshots/` は原則空でよく、
UI 変更が入った場合のみ補助証跡を追加する。

---

## 手動テスト方針

### Electron アプリ起動が可能な場合（参考確認）

1. `pnpm --filter @repo/desktop dev` で Electron アプリを起動する
2. SkillWizard を手動操作し、以下のイベントが発火されることを開発者ツールで確認する:
   - ウィザード表示時の trackEvent
   - ステップ進行時の trackEvent
   - キャンセル時の trackEvent
   - 完了時の trackEvent
3. 必要に応じて補助証跡を取得する（このタスクでは必須ではない）

### Electron アプリ起動が不可能な場合（代替証跡）

「実地操作不可」を `manual-test-result.md` に明記し、以下を代替証跡として記録する:

| 証跡種別              | コマンド / 確認方法                                                         | 確認内容                                    |
| --------------------- | --------------------------------------------------------------------------- | ------------------------------------------- |
| E2E テスト実行結果    | `pnpm --filter @repo/desktop test:e2e -- e2e/skill-wizard-tracking.spec.ts` | 全テストケース PASS を確認                  |
| Playwright トレース   | `pnpm --filter @repo/desktop test:e2e -- --reporter=html`                   | HTML レポートをスクリーンショットで証跡記録 |
| TypeScript 型チェック | `pnpm --filter @repo/desktop typecheck`                                     | 型エラーなしであること                      |
| Lint チェック         | `pnpm --filter @repo/desktop lint`                                          | lint エラーなしであること                   |
| スタブ混入確認        | `grep -r "wizard-tracking-stub\|trackEvent.e2e-stub" apps/desktop/src/`     | 本番コードへの混入 0 件                     |

### `manual-test-result.md` メタ情報への必須記載事項

`outputs/phase-11/manual-test-result.md` の冒頭メタ情報セクションに以下を必ず明記すること:

```markdown
## テスト方針メタ情報

| 項目                                | 内容                                                      |
| ----------------------------------- | --------------------------------------------------------- |
| 評価方針                            | VISUAL / NON_VISUAL（判定結果を記載）                     |
| 証跡の主ソース（自動テスト名/件数） | E2E テスト N件 / typecheck / lint / Playwright トレース   |
| Electron 起動状況                   | 起動可 / 実地操作不可（理由を記載）                       |
| スクリーンショット取得              | 取得済み / 実地操作不可のため代替証跡を使用（理由を記載） |
```

---

## 実行タスク

> **Task / Step 分離ルール**: このセクションには plan のみを書く。実行結果は `outputs/phase-11/` へ記録する。

### タスク1: VISUAL / NON_VISUAL 判定の実施と記録

**目的**: 本タスクの手動テスト評価方針を確定し、証跡取得方針を明確にする

**実行手順**:

1. 本 Phase の「VISUAL / NON_VISUAL 判定」セクションの基準に従い判定を実施する
2. Electron アプリ起動環境が利用可能かを確認する
3. 判定結果と証跡取得方針を `outputs/phase-11/manual-test-result.md` のメタ情報セクションに記録する

**期待される成果物**:

- `outputs/phase-11/manual-test-result.md`（メタ情報セクションのみ記録）

---

### タスク2: Electron アプリ起動・手動操作によるイベント発火確認

**目的**: Electron アプリを実際に起動し、SkillWizard の手動操作で trackEvent が発火されることを確認する

**実行手順（Electron 起動可能な場合）**:

1. Electron アプリを起動する:

```bash
pnpm --filter @repo/desktop dev
```

2. SkillWizard を開き、以下の操作を順番に実施する:
   - ウィザード表示（開発者ツールのコンソールで `trackEvent` ログを確認）
   - 次のステップへ進む（`trackEvent` が発火されることを確認）
   - キャンセルボタンを押す（`trackEvent` が発火されることを確認）
   - ウィザードを最後まで完了させる（`trackEvent` が発火されることを確認）
3. 必要に応じて Playwright の HTML レポートを取得する:

```bash
pnpm --filter @repo/desktop test:e2e -- e2e/skill-wizard-tracking.spec.ts --headed
```

4. 証跡（HTML レポート・Playwright トレース）を `outputs/phase-11/screenshots/` に保存する
5. 操作結果を `outputs/phase-11/manual-test-result.md` に記録する

**実行手順（Electron 起動不可の場合）**:

1. 「実地操作不可」を `outputs/phase-11/manual-test-result.md` に明記する
2. 代替証跡として E2E テスト HTML レポートを取得する:

```bash
pnpm --filter @repo/desktop test:e2e -- e2e/skill-wizard-tracking.spec.ts --reporter=html
```

3. HTML レポートまたは補助証跡を `outputs/phase-11/screenshots/` に保存する
4. 代替証跡の取得状況を `outputs/phase-11/manual-test-result.md` に記録する

**期待される成果物**:

- `outputs/phase-11/manual-test-result.md`（操作結果・証跡記録）
- `outputs/phase-11/screenshots/`（HTML レポート・補助証跡）

---

### タスク3: 手動確認チェックリスト実施

**目的**: 自動テストでは確認できない観点を手動で確認する

**実行手順**:

1. 以下の手動確認チェックリストを実施する
2. 確認結果を `outputs/phase-11/manual-test-checklist.md` に記録する

**手動確認チェックリスト**:

- [ ] `skill-wizard-tracking.spec.ts` のテストケースが AC-1〜AC-7 の各受け入れ基準に対応していること
- [ ] `wizard-tracking-stub.ts` のスタブが本番の `trackEvent` インターフェースと型整合していること
- [ ] Vite E2E 設定（`apps/desktop/vite.e2e.config.ts`）に trackEvent alias 設定が追加されていること
- [ ] CI 設定（`.github/workflows/ci.yml`）に E2E テスト実行ステップが追加されていること
- [ ] CI 設定で E2E テスト失敗時に PR がブロックされる設定になっていること
- [ ] テストケースのコメント・命名が意図を明確に表現していること
- [ ] スタブが `e2e/` ディレクトリ内にのみ存在し、本番コードに混入していないこと

**期待される成果物**:

- `outputs/phase-11/manual-test-checklist.md`

---

### タスク4: 発見された問題の記録

**目的**: 手動確認で発見された問題（MINOR 指摘等）を記録する

**実行手順**:

1. タスク2・タスク3 で発見した問題点を列挙する
2. 問題の重大度（MINOR / MAJOR / CRITICAL）を判定する
3. MINOR 指摘は未タスク化の対象として記録する
4. `outputs/phase-11/discovered-issues.md` に記録する

**期待される成果物**:

- `outputs/phase-11/discovered-issues.md`

---

## 参照資料

| 参照資料                   | パス                                                              | 内容                           |
| -------------------------- | ----------------------------------------------------------------- | ------------------------------ |
| Phase 10 最終レビュー結果  | `outputs/phase-10/final-review-result.md`                         | 最終レビューゲートの判定結果   |
| E2E テスト実装ファイル     | `apps/desktop/e2e/skill-wizard-tracking.spec.ts`                  | 手動確認対象テストコード       |
| E2E スタブヘルパー         | `apps/desktop/e2e/helpers/wizard-tracking-stub.ts`                | 型整合確認対象スタブ           |
| Vite E2E 設定              | `apps/desktop/vite.e2e.config.ts`                                 | 設定確認対象                   |
| CI 設定ファイル            | `.github/workflows/ci.yml`                                        | E2E テスト実行ステップ確認対象 |
| unassigned-task-guidelines | `docs/30-workflows/unassigned-task/unassigned-task-guidelines.md` | MINOR 指摘の未タスク化ルール   |

---

## 成果物

| 成果物                   | パス                                        | 内容                                                          |
| ------------------------ | ------------------------------------------- | ------------------------------------------------------------- |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`    | VISUAL/NON_VISUAL 判定・Electron 操作結果・代替証跡・メタ情報 |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md` | 手動確認項目の実施結果（PASS/FAIL）                           |
| スクリーンショット       | `outputs/phase-11/screenshots/`             | NON_VISUAL のため原則空。UI 変更がある場合のみ補助証跡を保存  |
| 発見された問題           | `outputs/phase-11/discovered-issues.md`     | 手動確認で発見された問題点・MINOR 指摘の未タスク化記録        |

---

## 統合テスト連携

- E2E テスト（Playwright）の実行結果が primary evidence となること
- Electron アプリ起動可能な場合でも、UI 変更がないためスクリーンショットは必須ではない
- 起動不可の場合は「実地操作不可」を明記し、Playwright HTML レポートを代替証跡とすること

---

## 完了条件

- [ ] VISUAL / NON_VISUAL 判定を実施し、`manual-test-result.md` のメタ情報に記録されていること
- [ ] Electron 起動による手動操作またはその不可理由と代替証跡が記録されていること
- [ ] Playwright HTML レポートまたは補助証跡が `outputs/phase-11/screenshots/` に記録されていること
- [ ] 手動確認チェックリストの全項目が PASS していること
- [ ] `manual-test-result.md` のメタ情報に「証跡の主ソース」と「Electron 起動状況」が明記されていること
- [ ] `outputs/phase-11/manual-test-checklist.md` が作成されていること
- [ ] `outputs/phase-11/manual-test-result.md` が作成されていること
- [ ] `outputs/phase-11/discovered-issues.md` が作成されていること
- [ ] 本Phase内の全タスクを100%実行完了

---

## タスク100%実行確認【必須】

- [ ] タスク1（VISUAL / NON_VISUAL 判定の実施と記録）を100%完了し、完了を明記した
- [ ] タスク2（Electron アプリ起動・手動操作）を100%完了し、証跡を取得した（または不可理由を明記した）
- [ ] タスク3（手動確認チェックリスト実施）を100%完了し、完了を明記した
- [ ] タスク4（発見された問題の記録）を100%完了し、完了を明記した
- [ ] 全成果物（`manual-test-result.md` / `manual-test-checklist.md` / `screenshots/` / `discovered-issues.md`）が生成されていることを確認した

---

## 依存関係

- **前提**: Phase 10 が完了していること（最終レビューゲート PASS）
- **後続**: Phase 12（ドキュメント更新）へ進む

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 11 実行記録

### 実行タスク

- VISUAL / NON_VISUAL 判定: [判定結果]
- Electron アプリ起動・手動操作: [起動可/不可 + 結果]
- 手動確認チェックリスト実施: [PASS/FAIL]
- 発見された問題の記録: [件数]

### 発見事項

- 良かった点:
- 問題点（MINOR指摘）:
- 未タスク化した指摘:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次Phase

完了後、以下のファイルを実行してください:

`docs/30-workflows/UT-W3-E2E-WIZARD-TRACKING-UI-REACH-001/phase-12-documentation.md`
