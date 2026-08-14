/**
 * Cross-Domain Conflict Detector and Multi-Domain Dialectical Synthesizer.
 * 
 * Prevents "pseudo-consensus hallucination" by detecting real tensions,
 * timing mismatches, and polarity disagreements across Ziwei, Vedic, TCM (Nihaixia), and Bazi.
 */

import { CanonicalEvidenceNode, CrossDomainConflict, CrossDomainPerspective, DomainType } from '../contracts/types';

export class CrossDomainConflictDetector {
  /**
   * Analyze evidence nodes across domains and detect dimensional tensions and contradictions.
   */
  static detectConflicts(evidences: CanonicalEvidenceNode[]): CrossDomainConflict[] {
    const dimensions: Array<'career' | 'health' | 'wealth' | 'relationship' | 'timing'> = [
      'career', 'health', 'wealth', 'relationship', 'timing'
    ];

    const conflicts: CrossDomainConflict[] = [];

    for (const dim of dimensions) {
      const dimEvidences = evidences.filter(e => e.dimension === dim);
      if (dimEvidences.length === 0) continue;

      // Group by domain
      const domainMap = new Map<DomainType, CanonicalEvidenceNode[]>();
      for (const ev of dimEvidences) {
        if (!domainMap.has(ev.domain)) {
          domainMap.set(ev.domain, []);
        }
        domainMap.get(ev.domain)!.push(ev);
      }

      // Need at least 2 different domains to form a cross-domain comparison
      if (domainMap.size < 2) continue;

      const perspectives: CrossDomainPerspective[] = [];
      let favorableCount = 0;
      let unfavorableCount = 0;
      let transformativeCount = 0;

      for (const [domain, evList] of domainMap.entries()) {
        const topEv = evList.sort((a, b) => b.confidence - a.confidence)[0];
        perspectives.push({
          domain,
          dimension: dim,
          stance: topEv.polarity,
          keyClaim: `${topEv.ruleName}：${topEv.canonicalInterpretation.slice(0, 120)}...`,
          evidenceIds: evList.map(e => e.id),
        });

        if (topEv.polarity === 'favorable') favorableCount++;
        else if (topEv.polarity === 'unfavorable') unfavorableCount++;
        else if (topEv.polarity === 'transformative') transformativeCount++;
      }

      // Conflict logic: has both favorable and unfavorable/transformative stances
      const hasConflict = favorableCount > 0 && (unfavorableCount > 0 || transformativeCount > 0);

      let conflictType: CrossDomainConflict['conflictType'] = undefined;
      let tensionDescription = '';
      let synthesisStrategy = '';

      if (hasConflict) {
        if (favorableCount > 0 && unfavorableCount > 0) {
          conflictType = 'direct_contradiction';
          tensionDescription = `在【${dim}】维度上，不同推演体系出现直接分歧：部分系统指示正面吉象，而另一系统提示显著阻力或破局考验。`;
          synthesisStrategy = `严禁强行统一或模棱两可；必须向用户客观呈现两方的立论依据（如表面机会 vs 底层暗礁），指导用户采取“防守型进取”策略。`;
        } else if (dim === 'timing' || transformativeCount > 0) {
          conflictType = 'timing_mismatch';
          tensionDescription = `在【${dim}】时机节奏上，短期格局与底层长期运势存在相位差（如表面变动窗口已开，但底层深层大运尚未就位）。`;
          synthesisStrategy = `区分“表层趋势”与“深层运律”，建议用户在微观上试水、在宏观重资产决策上保持定力。`;
        } else {
          conflictType = 'surface_vs_root';
          tensionDescription = `系统呈现出“外在环境机运”与“内在身心能量/体质负荷”的张力。`;
          synthesisStrategy = `优先以底层身心真阳/体能健康为基石，避免在身体赤字状态下过度消耗心力。`;
        }

        conflicts.push({
          dimension: dim,
          hasConflict: true,
          conflictType,
          perspectives,
          tensionDescription,
          synthesisStrategy,
        });
      } else {
        // Systems are in consensus or neutral alignment
        conflicts.push({
          dimension: dim,
          hasConflict: false,
          conflictType: 'complementary_tension',
          perspectives,
          tensionDescription: `各体系在【${dim}】维度上呈现多维互补共振。`,
          synthesisStrategy: `多视角相互印证，可提炼出各体系共识的深层启示。`,
        });
      }
    }

    return conflicts;
  }

  /**
   * Format Conflict and Evidence Report into Prompt Pipeline Context Block
   */
  static formatConflictPromptBlock(conflicts: CrossDomainConflict[]): string {
    if (conflicts.length === 0) return '';

    const sections = conflicts.map(c => {
      const perspectiveLines = c.perspectives.map(p => 
        `  - 【${p.domain.toUpperCase()} 视角】(立场: ${p.stance}) -> ${p.keyClaim}`
      ).join('\n');

      return `### 维度: ${c.dimension.toUpperCase()} ${c.hasConflict ? '⚠️ [检测到体系张力/分歧]' : '✅ [多体系共振]'}
- 冲突类型: ${c.conflictType || '一致'}
- 核心张力描述: ${c.tensionDescription}
- 证据视角列表:
${perspectiveLines}
- 综合推理原则: ${c.synthesisStrategy}`;
    }).join('\n\n');

    return `<cross_domain_dialectic_firewall>
【多体系辩证推理与反伪共识规范】
1. 当检测到体系分歧时，绝对禁止“抹平矛盾”或生硬宣称“所有体系惊人一致”。
2. 必须在输出中设立专属段落，分别列出各体系的立论依据与观察视角。
3. 将冲突转化为对求问者极具启发性的“阴阳张力决策建议”（例如：紫微揭示显性机遇，吠陀提醒时间沉淀，经方警示身心负荷）。

${sections}
</cross_domain_dialectic_firewall>`;
  }
}
