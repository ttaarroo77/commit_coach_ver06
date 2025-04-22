import { markStepAsCompleted, getStepStatus, getCompletedSteps } from '../utils/developmentFlow';

const args = process.argv.slice(2);
const stepNumber = args[0];

if (!stepNumber) {
  console.error('使用方法: npm run progress <step_number>');
  console.error('例: npm run progress 121');
  process.exit(1);
}

const stepNum = parseInt(stepNumber, 10);

if (isNaN(stepNum)) {
  console.error('ステップ番号は数値である必要があります');
  process.exit(1);
}

async function updateProgress() {
  try {
    await markStepAsCompleted(stepNum);
    const completedSteps = await getCompletedSteps();
    console.log('\n現在の進捗状況:');
    console.log(`完了したステップ数: ${completedSteps.length}`);
    console.log('完了したステップ:', completedSteps.join(', '));
  } catch (error) {
    console.error('進捗の更新中にエラーが発生しました:', error);
    process.exit(1);
  }
}

updateProgress(); 