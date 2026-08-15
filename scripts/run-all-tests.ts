import { testZiweiSuite } from "../tests/ziwei/patterns.spec";
import { testVedicSuite } from "../tests/vedic/dasha.spec";
import { testNihaixiaSuite } from "../tests/nihaixia/rules.spec";
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

  const r2 = testVedicSuite();
  totalPassed += r2.passed;
  totalFailed += r2.failed;
  console.log();

  const r3 = testNihaixiaSuite();
  totalPassed += r3.passed;
  totalFailed += r3.failed;
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
