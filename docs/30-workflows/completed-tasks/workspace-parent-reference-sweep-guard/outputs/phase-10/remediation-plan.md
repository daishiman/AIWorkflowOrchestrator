# 是正計画

## 即時是正

不要。Phase 10 時点で blocker はない。

## 継続ルール

1. aiworkflow-requirements を更新したら `generate-index -> rsync -> diff -qr -> guard` を直列実行する。
2. Workspace parent reference に新規ファイル種別が増えたら、先に `outputs/phase-2/sweep-manifest-design.md` と validator の `FILE_CHECKS` を同時更新する。
3. completed workflow 移管後は pointer docs と legacy index の status を同一ターンで更新する。
