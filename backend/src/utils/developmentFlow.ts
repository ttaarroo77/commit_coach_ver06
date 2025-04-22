import fs from 'fs';
import path from 'path';

// プロジェクトのルートディレクトリを取得
const PROJECT_ROOT = path.resolve(__dirname, '../../../');
const DEVELOPMENT_FLOW_PATH = path.join(PROJECT_ROOT, 'docs/overview/development_flow.md');

interface StepPattern {
  unchecked: RegExp;
  checked: RegExp;
  replacement: string | ((match: string) => string);
}

export const markStepAsCompleted = async (stepNumber: number): Promise<void> => {
  try {
    const content = fs.readFileSync(DEVELOPMENT_FLOW_PATH, 'utf8');

    // 複数のパターンを試す
    const patterns: StepPattern[] = [
      // 通常のステップパターン（例：121. [ ] **Step 121**）
      {
        unchecked: new RegExp(`${stepNumber}\\. \\[ \\] \\*\\*Step ${stepNumber}\\*\\*`),
        checked: new RegExp(`${stepNumber}\\. \\[x\\] \\*\\*Step ${stepNumber}\\*\\*`),
        replacement: `${stepNumber}. [x] **Step ${stepNumber}**`
      },
      // 見出しパターン（例：1. **基本エンドポイント確認** (Step 121-130)）
      {
        unchecked: new RegExp(`\\*\\*[^*]+\\*\\* \\(Step ${stepNumber}-\\d+\\)`),
        checked: new RegExp(`\\[x\\] \\*\\*[^*]+\\*\\* \\(Step ${stepNumber}-\\d+\\)`),
        replacement: (match: string): string => `[x] ${match}`
      }
    ];

    // 各パターンを試す
    for (const pattern of patterns) {
      // すでに完了している場合は次のパターンへ
      if (content.includes(pattern.checked.source)) {
        console.log(`Step ${stepNumber} is already marked as completed.`);
        return;
      }

      // パターンにマッチする行を探す
      const match = content.match(pattern.unchecked);
      if (match) {
        // ステップを完了としてマーク
        const updatedContent = content.replace(
          match[0],
          typeof pattern.replacement === 'function' ? pattern.replacement(match[0]) : pattern.replacement
        );

        // ファイルを更新
        fs.writeFileSync(DEVELOPMENT_FLOW_PATH, updatedContent);
        console.log(`Step ${stepNumber} marked as completed.`);
        return;
      }
    }

    // どのパターンにもマッチしない場合はエラー
    throw new Error(`Step ${stepNumber} not found in development flow.`);
  } catch (error) {
    console.error(`Error marking step ${stepNumber} as completed:`, error);
    throw error;
  }
};

export const getStepStatus = async (stepNumber: number): Promise<boolean> => {
  try {
    const content = fs.readFileSync(DEVELOPMENT_FLOW_PATH, 'utf8');
    const patterns = [
      new RegExp(`${stepNumber}\\. \\[x\\] \\*\\*Step ${stepNumber}\\*\\*`),
      new RegExp(`\\[x\\] \\*\\*[^*]+\\*\\* \\(Step ${stepNumber}-\\d+\\)`)
    ];
    return patterns.some(pattern => content.includes(pattern.source));
  } catch (error) {
    console.error(`Error getting status for step ${stepNumber}:`, error);
    throw error;
  }
};

export const getCompletedSteps = async (): Promise<number[]> => {
  try {
    const content = fs.readFileSync(DEVELOPMENT_FLOW_PATH, 'utf8');
    const completedSteps: number[] = [];

    // 完了したステップを探す（両方のパターン）
    const patterns = [
      /\d+\. \[x\] \*\*Step (\d+)\*\*/g,
      /\[x\] \*\*[^*]+\*\* \(Step (\d+)-\d+\)/g
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        completedSteps.push(parseInt(match[1], 10));
      }
    }

    return completedSteps.sort((a, b) => a - b);
  } catch (error) {
    console.error('Error getting completed steps:', error);
    throw error;
  }
};