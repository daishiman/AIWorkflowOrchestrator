/**
 * useSkillCenter Hook
 *
 * SkillCenterView のメインロジックフック。
 * フィルタリング、DetailPanel 開閉、ツール追加/削除の非同期操作を管理する。
 *
 * P31 対策: 個別セレクタを使用して Zustand Store から状態を取得する。
 *
 * @module SkillCenterView/hooks/useSkillCenter
 */

import { useState, useMemo, useCallback, useEffect } from "react";
import type { SkillMetadata } from "@repo/shared/types/skill";
import {
  useAppStore,
  useAvailableSkillsMetadata,
  useImportedSkills,
  useIsLoadingSkills,
  useSkillError,
  useSkillFilter,
  useSkillCategory,
  useFetchSkills,
  useImportSkill,
  useRemoveSkill,
  useSetSkillFilter,
  useSetSkillCategory,
} from "../../../store";
import { useFeaturedSkills } from "./useFeaturedSkills";
import type { CategoryId } from "../components/CategoryTabs";

/**
 * カテゴリフィルタリング用のキーワードマップ。
 * Store のカテゴリ値（任意の文字列）に対応するキーワードを定義する。
 */
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  // CategoryTabs の ID ベース
  dev: ["dev", "開発", "build", "ビルド", "test", "テスト", "code", "コード"],
  writing: [
    "doc",
    "ドキュメント",
    "文書",
    "writing",
    "作成",
    "report",
    "レポート",
  ],
  analysis: [
    "analysis",
    "分析",
    "data",
    "データ",
    "review",
    "レビュー",
    "検証",
  ],
  automation: [
    "auto",
    "自動",
    "workflow",
    "ワークフロー",
    "ci",
    "deploy",
    "デプロイ",
  ],
  // SkillCategory 型ベース（Store からの値）
  development: [
    "dev",
    "開発",
    "build",
    "ビルド",
    "code",
    "コード",
    "development",
  ],
  testing: ["test", "テスト", "testing"],
  design: ["design", "設計", "デザイン"],
  documentation: ["doc", "ドキュメント", "文書", "documentation"],
  security: ["security", "セキュリティ"],
  performance: ["perf", "パフォーマンス", "performance"],
  other: [],
};

function normalizeSearchText(value: unknown): string {
  return String(value ?? "").toLowerCase();
}

/**
 * スキルがカテゴリに一致するか判定する。
 */
function matchesCategory(skill: SkillMetadata, categoryValue: string): boolean {
  if (categoryValue === "all") return true;

  const keywords = CATEGORY_KEYWORDS[categoryValue];
  if (!keywords) return true; // 未知のカテゴリは全て表示

  if (categoryValue === "other") {
    // "other" は他のどのカテゴリにも属さないスキル
    const allKeywords = Object.entries(CATEGORY_KEYWORDS)
      .filter(([key]) => key !== "other")
      .flatMap(([, words]) => words);
    const desc = normalizeSearchText(skill.description);
    const name = normalizeSearchText(skill.name);
    return !allKeywords.some((kw) => desc.includes(kw) || name.includes(kw));
  }

  const desc = normalizeSearchText(skill.description);
  const name = normalizeSearchText(skill.name);
  return keywords.some((kw) => desc.includes(kw) || name.includes(kw));
}

/**
 * useSkillCenter の戻り値型
 */
export interface UseSkillCenterReturn {
  // Store 状態
  availableSkills: SkillMetadata[];
  importedSkills: ReturnType<typeof useImportedSkills>;
  isLoading: boolean;
  error: string | null;
  filter: string;
  category: string | null;

  // ローカル状態
  isDetailOpen: boolean;
  detailSkillName: string | null;
  isDeleteConfirmOpen: boolean;
  deleteTargetSkillName: string | null;
  addingSkills: Map<string, boolean>;

  // 計算値
  filteredSkills: SkillMetadata[];
  featuredSkills: SkillMetadata[];
  importedSkillNames: string[];

  // ナビゲーション
  navigateToSkillCreate: () => void;
  navigateToWorkspace: () => void;
  navigateToSkillAnalysis: () => void;
  handleEditSkill: (skillName: string) => void;
  handleAnalyzeSkill: (skillName: string) => void;

  // ハンドラ
  handleAddSkill: (skillName: string) => Promise<void>;
  handleRemoveSkill: (skillName: string) => Promise<void>;
  handleOpenDetail: (skillName: string) => void;
  handleCloseDetail: () => void;
  handleConfirmDelete: () => Promise<void>;
  handleCancelDelete: () => void;
  handleRequestDelete: (skillName: string) => void;
  handleSetFilter: (value: string) => void;
  handleSetCategory: (categoryId: CategoryId) => void;
}

/**
 * SkillCenterView のメインロジックフック。
 */
export function useSkillCenter(): UseSkillCenterReturn {
  // --- ナビゲーション ---
  const setCurrentView = useAppStore((state) => state.setCurrentView);
  const setCurrentSkillName = useAppStore((state) => state.setCurrentSkillName);

  const navigateToSkillCreate = useCallback(
    () => setCurrentView("skillCreate"),
    [setCurrentView],
  );
  const navigateToWorkspace = useCallback(
    () => setCurrentView("workspace"),
    [setCurrentView],
  );
  const navigateToSkillAnalysis = useCallback(
    () => setCurrentView("skillAnalysis"),
    [setCurrentView],
  );

  // --- P31 対策: 個別セレクタ使用 ---
  const availableSkills = useAvailableSkillsMetadata() ?? [];
  const importedSkills = useImportedSkills() ?? [];
  const isLoading = useIsLoadingSkills();
  const error = useSkillError();
  const filter = useSkillFilter();
  // CategoryId と SkillCategory は型が異なるため、string | null として扱う
  const category = useSkillCategory() as string | null;
  const fetchSkills = useFetchSkills();
  const importSkill = useImportSkill();
  const removeSkill = useRemoveSkill();
  const setSkillFilter = useSetSkillFilter();
  const setSkillCategory = useSetSkillCategory();

  // --- ローカル状態 ---
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailSkillName, setDetailSkillName] = useState<string | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteTargetSkillName, setDeleteTargetSkillName] = useState<
    string | null
  >(null);
  const [addingSkills, setAddingSkills] = useState<Map<string, boolean>>(
    new Map(),
  );

  // --- 初回データ取得 ---
  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  // --- インポート済みスキル名リスト ---
  const importedSkillNames = useMemo(
    () => importedSkills.map((s) => String(s.name)),
    [importedSkills],
  );

  // --- フィルタリング ---
  const filteredSkills = useMemo(() => {
    let result = availableSkills;

    // カテゴリフィルタ
    if (category && category !== "all") {
      result = result.filter((skill) => matchesCategory(skill, category));
    }

    // キーワードフィルタ
    if (filter.trim()) {
      const keyword = filter.toLowerCase().trim();
      result = result.filter((skill) => {
        const name = normalizeSearchText(skill.name);
        const desc = normalizeSearchText(skill.description);
        return name.includes(keyword) || desc.includes(keyword);
      });
    }

    return result;
  }, [availableSkills, category, filter]);

  // --- おすすめスキル ---
  const featuredSkills = useFeaturedSkills({
    allSkills: availableSkills,
    importedSkillNames,
  });

  // --- ハンドラ ---
  const handleAddSkill = useCallback(
    async (skillName: string) => {
      if (addingSkills.has(skillName)) {
        return;
      }

      // 既にインポート済みの場合はアニメーションを出さずに状態同期だけ実施
      if (importedSkillNames.includes(skillName)) {
        await importSkill(skillName);
        return;
      }

      setAddingSkills((prev) => {
        const next = new Map(prev);
        next.set(skillName, true);
        return next;
      });

      try {
        await importSkill(skillName);
      } finally {
        // 成功アニメーション後にクリア
        setTimeout(() => {
          setAddingSkills((prev) => {
            const next = new Map(prev);
            next.delete(skillName);
            return next;
          });
        }, 1500);
      }
    },
    [addingSkills, importedSkillNames, importSkill],
  );

  const handleRemoveSkill = useCallback(
    async (skillName: string) => {
      await removeSkill(skillName);
      setIsDetailOpen(false);
      setDetailSkillName(null);
      setIsDeleteConfirmOpen(false);
      setDeleteTargetSkillName(null);
    },
    [removeSkill],
  );

  const handleOpenDetail = useCallback((skillName: string) => {
    setDetailSkillName(skillName);
    setIsDetailOpen(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setIsDetailOpen(false);
    setDetailSkillName(null);
  }, []);

  const handleEditSkill = useCallback(
    (skillName: string): void => {
      setCurrentSkillName(skillName);
      setCurrentView("skill-editor");
      handleCloseDetail();
    },
    [setCurrentSkillName, setCurrentView, handleCloseDetail],
  );

  const handleAnalyzeSkill = useCallback(
    (skillName: string): void => {
      setCurrentSkillName(skillName);
      setCurrentView("skillAnalysis");
      handleCloseDetail();
    },
    [setCurrentSkillName, setCurrentView, handleCloseDetail],
  );

  const handleRequestDelete = useCallback((skillName: string) => {
    setDeleteTargetSkillName(skillName);
    setIsDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (deleteTargetSkillName) {
      await handleRemoveSkill(deleteTargetSkillName);
    }
  }, [deleteTargetSkillName, handleRemoveSkill]);

  const handleCancelDelete = useCallback(() => {
    setIsDeleteConfirmOpen(false);
    setDeleteTargetSkillName(null);
  }, []);

  const handleSetFilter = useCallback(
    (value: string) => {
      setSkillFilter(value);
    },
    [setSkillFilter],
  );

  const handleSetCategory = useCallback(
    (categoryId: CategoryId) => {
      // CategoryId と SkillCategory は型が異なるため、
      // Store に格納する際の型変換が必要。
      // "all" は null（フィルタなし）、それ以外は文字列として Store に格納する。
      // matchesCategory() が string ベースでキーワードマッチするため、
      // Store 内部では文字列として正しく機能する。
      if (categoryId === "all") {
        setSkillCategory(null);
      } else {
        (setSkillCategory as (v: string | null) => void)(categoryId);
      }
    },
    [setSkillCategory],
  );

  return {
    availableSkills,
    importedSkills,
    isLoading,
    error,
    filter,
    category,
    isDetailOpen,
    detailSkillName,
    isDeleteConfirmOpen,
    deleteTargetSkillName,
    addingSkills,
    filteredSkills,
    featuredSkills,
    importedSkillNames,
    navigateToSkillCreate,
    navigateToWorkspace,
    navigateToSkillAnalysis,
    handleEditSkill,
    handleAnalyzeSkill,
    handleAddSkill,
    handleRemoveSkill,
    handleOpenDetail,
    handleCloseDetail,
    handleConfirmDelete,
    handleCancelDelete,
    handleRequestDelete,
    handleSetFilter,
    handleSetCategory,
  };
}
