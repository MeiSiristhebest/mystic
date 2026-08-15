import { testZiweiSuite } from "../tests/ziwei/patterns.spec";
import { testZiweiAdvancedSuite } from "../tests/ziwei/advanced.spec";
import { testVedicSuite } from "../tests/vedic/dasha.spec";
import { testVedicAdvancedSuite } from "../tests/vedic/advanced.spec";
import { testNihaixiaSuite } from "../tests/nihaixia/rules.spec";
import { testNihaixiaDifferentialSuite } from "../tests/nihaixia/differential.spec";
import { testBaziSuite } from "../tests/bazi/bazi.spec";
import { testConflictSuite } from "../tests/reasoning/conflict.spec";

function main() {
  console.log("================================================================================");
  console.log("🚀 MYSTIC DETERMINISTIC DOMAIN ENGINES: COMPREHENSIVE VERIFICATION HARNESS");
  console.log("================================================================================\n");

  let totalPassed = 0;
  let totalFailed = 0;

  const r1 = testZiweiSuite();
  totalPassed += r1.passed;
  totalFailed += r1.failed;
  console.log();

  const r1Adv = testZiweiAdvancedSuite();
  totalPassed += r1Adv.passed;
  totalFailed += r1Adv.failed;
  console.log();

  const r2 = testVedicSuite();
  totalPassed += r2.passed;
  totalFailed += r2.failed;
  console.log();

  const r2Adv = testVedicAdvancedSuite();
  totalPassed += r2Adv.passed;
  totalFailed += r2Adv.failed;
  console.log();

  const r3 = testNihaixiaSuite();
  totalPassed += r3.passed;
  totalFailed += r3.failed;
  console.log();

  const r3Diff = testNihaixiaDifferentialSuite();
  totalPassed += r3Diff.passed;
  totalFailed += r3Diff.failed;
  console.log();

  const r4 = testBaziSuite();
  totalPassed += r4.passed;
  totalFailed += r4.failed;
  console.log();

  const r5 = testConflictSuite();
  totalPassed += r5.passed;
  totalFailed += r5.failed;
  console.log();

  console.log("================================================================================");
  console.log(`🏁 VERIFICATION SUMMARY: ${totalPassed} Passed, ${totalFailed} Failed`);
  console.log("================================================================================\n");

  if (totalFailed > 0) {
    process.exit(1);
  }
}

main();
