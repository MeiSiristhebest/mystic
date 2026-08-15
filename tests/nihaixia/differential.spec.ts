import { runDifferentialDiagnosis } from '../../lib/nihaixia/differential';

export function testNihaixiaDifferentialSuite() {
  console.log("▶ [TEST SUITE] Nihaixia Deep Pulse & Tongue Differential Diagnosis Suite");

  let passed = 0;
  let failed = 0;

  // 1. Exterior Wind Strike Pathway (太阳中风)
  const diffTaiyang = runDifferentialDiagnosis(['恶风', '自汗', '发热'], { depth: '浮', speed: '缓' }, { body: '淡红', coating: '薄白' });
  if (diffTaiyang.dominantStage === 'taiyang' && diffTaiyang.differentialFormula.includes('桂枝汤')) {
    console.log(`  ✓ [DIFFERENTIAL TAIYANG PASS] ${diffTaiyang.pathwayName} -> ${diffTaiyang.differentialFormula}`);
    passed++;
  } else {
    console.error(`  ✗ [DIFFERENTIAL TAIYANG FAIL] ${diffTaiyang.dominantStage}`);
    failed++;
  }

  // 2. Shaoyang Shuji Pathway (少阳枢机)
  const diffShaoyang = runDifferentialDiagnosis(['胸胁苦满', '口苦咽干', '目眩喜呕'], { shape: '弦' });
  if (diffShaoyang.dominantStage === 'shaoyang' && diffShaoyang.differentialFormula.includes('小柴胡汤')) {
    console.log(`  ✓ [DIFFERENTIAL SHAOYANG PASS] ${diffShaoyang.pathwayName} -> ${diffShaoyang.differentialFormula}`);
    passed++;
  } else {
    console.error(`  ✗ [DIFFERENTIAL SHAOYANG FAIL] ${diffShaoyang.dominantStage}`);
    failed++;
  }

  // 3. Shaoyin True Yang Deficiency Pathway (少阴阳虚)
  const diffShaoyin = runDifferentialDiagnosis(['手足冰冷过肘膝', '但欲寐', '夜尿清长'], { depth: '沉', shape: '微' });
  if (diffShaoyin.dominantStage === 'shaoyin' && diffShaoyin.differentialFormula.includes('真武汤')) {
    console.log(`  ✓ [DIFFERENTIAL SHAOYIN PASS] ${diffShaoyin.pathwayName} -> ${diffShaoyin.differentialFormula}`);
    passed++;
  } else {
    console.error(`  ✗ [DIFFERENTIAL SHAOYIN FAIL] ${diffShaoyin.dominantStage}`);
    failed++;
  }

  return { passed, failed };
}
