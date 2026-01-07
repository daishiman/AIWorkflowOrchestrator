# Codecov設定設計 - CI/CDカバレッジ閾値統合

## メタ情報

| 項目   | 内容                      |
| ------ | ------------------------- |
| 作成日 | 2026-01-05                |
| 作成者 | Claude Opus 4.5           |
| Phase  | 2                         |
| 機能名 | cicd-coverage-integration |

---

## 1. codecov.yml 完全設計

```yaml
# Codecov設定ファイル
# ドキュメント: https://docs.codecov.com/docs/codecov-yaml

codecov:
  require_ci_to_pass: true
  notify:
    wait_for_ci: true

coverage:
  precision: 2
  round: down
  range: "70...100"
  status:
    project:
      default:
        target: 80%
        threshold: 1%
        if_ci_failed: error
    patch:
      default:
        target: 80%
        threshold: 1%
        if_ci_failed: error

parsers:
  gcov:
    branch_detection:
      conditional: yes
      loop: yes
      method: no
      macro: no

comment:
  layout: "reach,diff,flags,files"
  behavior: default
  require_changes: true
  require_base: false
  require_head: true

flags:
  shared:
    paths:
      - packages/shared/
    carryforward: true
  desktop:
    paths:
      - apps/desktop/
    carryforward: true
```

---

## 2. 設定項目詳細

### 2.1 codecov セクション

| 設定項目           | 値   | 説明                                 |
| ------------------ | ---- | ------------------------------------ |
| require_ci_to_pass | true | CIがパスしないとステータス更新しない |
| notify.wait_for_ci | true | CIの完了を待ってから通知             |

### 2.2 coverage.status セクション

#### project（プロジェクト全体）

| 設定項目     | 値    | 説明                             |
| ------------ | ----- | -------------------------------- |
| target       | 80%   | プロジェクト全体のカバレッジ閾値 |
| threshold    | 1%    | 許容される誤差範囲               |
| if_ci_failed | error | CI失敗時はエラーとして報告       |

#### patch（PR変更部分）

| 設定項目     | 値    | 説明                       |
| ------------ | ----- | -------------------------- |
| target       | 80%   | PR変更部分のカバレッジ閾値 |
| threshold    | 1%    | 許容される誤差範囲         |
| if_ci_failed | error | CI失敗時はエラーとして報告 |

### 2.3 comment セクション

| 設定項目        | 値                     | 説明                           |
| --------------- | ---------------------- | ------------------------------ |
| layout          | reach,diff,flags,files | コメント表示項目               |
| behavior        | default                | 既存コメントを更新             |
| require_changes | true                   | 変更がある場合のみコメント     |
| require_base    | false                  | ベースブランチのレポートは不要 |
| require_head    | true                   | HEADのレポートは必須           |

### 2.4 flags セクション

| フラグ名 | パス             | carryforward | 説明             |
| -------- | ---------------- | ------------ | ---------------- |
| shared   | packages/shared/ | true         | sharedパッケージ |
| desktop  | apps/desktop/    | true         | desktopアプリ    |

**carryforward**: 前回のカバレッジを引き継ぎ（一部のみ更新時）

---

## 3. 閾値設計根拠

### 3.1 80%を選択した理由

| 理由               | 説明                                       |
| ------------------ | ------------------------------------------ |
| 業界標準           | 多くのプロジェクトで採用される一般的な閾値 |
| 現実的な達成目標   | 100%は非現実的、70%は低すぎる              |
| 既存設定との整合性 | desktop vitest.configで80%設定済み         |

### 3.2 threshold 1%の意味

- カバレッジ計算の誤差を考慮
- 79%は失敗、79.5%は許容
- 厳格すぎない柔軟性を確保

---

## 4. コメント表示設計

### 4.1 layout項目

| 項目  | 説明                 |
| ----- | -------------------- |
| reach | カバレッジ到達率     |
| diff  | 変更前後の差分       |
| flags | フラグ別カバレッジ   |
| files | ファイル別カバレッジ |

### 4.2 コメント例

```markdown
## Coverage Report

| Flag    | Coverage | Δ     |
| ------- | -------- | ----- |
| shared  | 85.2%    | +1.2% |
| desktop | 82.1%    | -0.5% |

### Files Changed

| File                    | Coverage | Δ    |
| ----------------------- | -------- | ---- |
| src/utils/helper.ts     | 100%     | +10% |
| src/components/Form.tsx | 75%      | -5%  |
```

---

## 5. ステータスチェック設計

### 5.1 GitHub PRステータス

| ステータス名    | 条件                      |
| --------------- | ------------------------- |
| codecov/project | プロジェクト全体が80%以上 |
| codecov/patch   | PR変更部分が80%以上       |

### 5.2 マージ条件

```
PRマージ可能条件:
- codecov/project: ✅ passing
- codecov/patch: ✅ passing
- CI workflow: ✅ passing
```

---

## 6. 将来の拡張性

### 6.1 追加可能な設定

| 設定                 | 用途                   |
| -------------------- | ---------------------- |
| ignore               | カバレッジ除外パス     |
| github_checks        | GitHubチェック詳細設定 |
| slack                | Slack通知              |
| component_management | コンポーネント分析     |
