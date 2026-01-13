# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| Phase      | 13                                                   |
| Phase名    | PR作成                                               |
| 前提Phase  | Phase 12                                             |
| 後続Phase  | なし（タスク完了）                                   |
| ステータス | 未実施                                               |
| 作成日     | 2026-01-14                                           |
| 機能名     | FileSelector アクセシビリティ改善（WCAG 2.1 AA準拠） |

---

## 目的

FileSelectorアクセシビリティ改善の全成果物をプルリクエストとして提出する。

## 背景

Phase 12でドキュメント更新が完了した。全ての実装とドキュメントをまとめてPRを作成する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 最終チェック

**目的**: PR作成前に全ての成果物を確認する

**実行手順**:

1. コード品質チェック:

   ```bash
   pnpm lint
   pnpm typecheck
   ```

2. テスト実行:

   ```bash
   pnpm --filter @repo/desktop test
   ```

3. ビルド確認:

   ```bash
   pnpm --filter @repo/desktop build
   ```

4. 成果物確認:
   - [ ] useFocusTrap.ts が存在する
   - [ ] FileSelectorModal.tsx が更新されている
   - [ ] FileSelectorTrigger.tsx が更新されている
   - [ ] FileSelectorFileList.tsx が更新されている
   - [ ] 全テストがパスしている

**期待される成果物**:

- 最終チェック結果

---

### タスク2: ブランチ作成とコミット

**目的**: 変更を適切なブランチにコミットする

**実行手順**:

1. ブランチ作成:

   ```bash
   git checkout -b feat/file-selector-accessibility
   ```

2. 変更をステージング:

   ```bash
   git add apps/desktop/src/renderer/hooks/useFocusTrap.ts
   git add apps/desktop/src/renderer/components/organisms/FileSelector/
   git add apps/desktop/src/renderer/hooks/__tests__/
   ```

3. コミット:

   ```bash
   git commit -m "feat(accessibility): add WCAG 2.1 AA compliance to FileSelector

   - Add useFocusTrap hook for focus management
   - Add aria-expanded, aria-haspopup to FileSelectorTrigger
   - Add role=dialog, aria-modal to FileSelectorModal
   - Add role=listbox, role=option, aria-selected to FileSelectorFileList
   - Add aria-live announcements for selection changes

   Fixes: WCAG 2.4.3 (Focus Order), 4.1.2 (Name, Role, Value), 1.3.1 (Info and Relationships)

   Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
   ```

**期待される成果物**:

- コミット完了

---

### タスク3: プルリクエスト作成

**目的**: GitHub PRを作成する

**実行手順**:

1. プッシュ:

   ```bash
   git push -u origin feat/file-selector-accessibility
   ```

2. PR作成:

   ```bash
   gh pr create --title "feat(accessibility): add WCAG 2.1 AA compliance to FileSelector" --body "$(cat <<'EOF'
   ## Summary

   - Add focus trap implementation for modal dialogs
   - Add comprehensive aria attributes for screen reader support
   - Add keyboard navigation for file list (arrow keys, Home, End)
   - Add aria-live announcements for selection changes

   ## WCAG 2.1 AA Compliance

   | Criterion | Description | Implementation |
   |-----------|-------------|----------------|
   | 2.4.3 | Focus Order | useFocusTrap hook |
   | 4.1.2 | Name, Role, Value | aria-expanded, aria-selected, role attributes |
   | 1.3.1 | Info and Relationships | role=listbox, role=option |
   | 4.1.3 | Status Messages | aria-live announcements |

   ## Test plan

   - [ ] Keyboard navigation works correctly
   - [ ] VoiceOver (macOS) reads all elements correctly
   - [ ] Focus trap works on modal open/close
   - [ ] aria-live announcements are read on selection

   🤖 Generated with [Claude Code](https://claude.com/claude-code)
   EOF
   )"
   ```

**期待される成果物**:

- プルリクエストURL

---

### タスク4: CI確認

**目的**: CIパイプラインの成功を確認する

**実行手順**:

1. CI確認:

   ```bash
   gh pr checks
   ```

2. 全チェックがパスしていることを確認:
   - [ ] Lint
   - [ ] Type Check
   - [ ] Test
   - [ ] Build
   - [ ] Coverage

**期待される成果物**:

- CI結果確認

---

### タスク5: PR詳細記録

**目的**: PR情報を記録する

**実行手順**:

1. PR詳細を outputs/phase-13/pr-details.md に記録:
   - PR番号
   - PR URL
   - CI結果
   - レビュー状況

**期待される成果物**:

- PR詳細（outputs/phase-13/pr-details.md）

---

## 参照資料

| 参照資料            | パス                            | 内容                 |
| ------------------- | ------------------------------- | -------------------- |
| Phase 12成果物      | `outputs/phase-12/`             | ドキュメント更新内容 |
| ai:diff-to-prスキル | `.claude/skills/ai:diff-to-pr/` | PRワークフロー       |

---

## 成果物

| 成果物 | パス                             | 内容         |
| ------ | -------------------------------- | ------------ |
| PR詳細 | `outputs/phase-13/pr-details.md` | PR情報と結果 |

---

## 完了条件

- [ ] 最終チェックが完了している（lint, typecheck, test, build）
- [ ] ブランチが作成されコミットされている
- [ ] PRが作成されている
- [ ] CIが全てパスしている
- [ ] PR詳細が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] タスク完了報告

---

## 依存関係

- **前提**: Phase 12（ドキュメント更新）が完了していること
- **後続**: なし（タスク完了）

---

## タスク完了

このPhaseが完了すると、FILE-SEL-A11Y-001タスクは完了となります。

PRがマージされた後:

1. タスク仕様書フォルダを `docs/30-workflows/completed-tasks/` に移動
2. index.md のステータスを「完了」に更新
