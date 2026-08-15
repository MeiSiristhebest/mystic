/**
 * Cross-Domain Conflict Detector and Multi-Domain Dialectical Synthesizer.
 * 
 * Prevents "pseudo-consensus hallucination" by detecting real tensions,
 * temporal scope mismatches, and polarity disagreements across Ziwei, Vedic, TCM (Nihaixia), and Bazi.
 * 
 * Features:
 * - Dynamic Evidence Relation Inference (corroborating, contradicting, timing_precursor, surface_vs_root)
 * - Multi-factor confidence-weighted perspective resolution
 * - Temporal scope intersection analysis
 */

import { CanonicalEvidenceNode, CrossDomainConflict, CrossDomainPerspective, DomainType, EvidenceRelation } from '../contracts/types';

export class CrossDomainConflictDetector {
  /**
   * Infer semantic relations across evidence nodes and populate evidence.relations
   */
  static inferEvidenceRelations(evidences: CanonicalEvidenceNode[]): void {
    for (let i = 0; i < evidences.length; i++) {
      const nodeA = evidences[i];
      if (!nodeA.relations) nodeA.relations = [];

      for (let j = i + 1; j < evidences.length; j++) {
        const nodeB = evidences[j];
        if (!nodeB.relations) nodeB.relations = [];

        // Cross-domain or same-domain relation inference
        if (nodeA.dimension === nodeB.dimension || (nodeA.dimension === 'health' && nodeB.dimension === 'career')) {
          let relationType: EvidenceRelation['relationType'] = 'complementary';
          let descA = '';
          let descB = '';

          const isHealthVsCareer = (nodeA.dimension === 'health' && nodeB.dimension === 'career') ||
                                   (nodeA.dimension === 'career' && nodeB.dimension === 'health');

          if (isHealthVsCareer) {
            relationType = 'surface_vs_root';
            descA = `【表本关系】与【${nodeB.ruleName}】构成外在机运推进与内在体能真阳负荷的辩证张力。`;
            descB = `【表本关系】与【${nodeA.ruleName}】构成内在体能负荷与外在社会事业推进的辩证张力。`;
          } else if (nodeA.polarity === nodeB.polarity && nodeA.polarity !== 'neutral') {
            relationType = 'corroborating';
            descA = `【同频印证】与【${nodeB.ruleName}】在【${nodeA.dimension}】维度形成共振，彼此印证。`;
            descB = `【同频印证】与【${nodeA.ruleName}】在【${nodeB.dimension}】维度形成共振，彼此印证。`;
          } else if (
            (nodeA.polarity === 'favorable' && nodeB.polarity === 'unfavorable') ||
            (nodeA.polarity === 'unfavorable' && nodeB.polarity === 'favorable')
          ) {
            relationType = 'contradicting';
            descA = `【直接分歧】与【${nodeB.ruleName}】对【${nodeA.dimension}】吉凶定性存在直接张力。`;
            descB = `【直接分歧】与【${nodeA.ruleName}】对【${nodeB.dimension}】吉凶定性存在直接张力。`;
          } else {
            relationType = 'complementary';
            descA = `【多维互补】与【${nodeB.ruleName}】从不同视角提供互补观察。`;
            descB = `【多维互补】与${nodeA.ruleName}从不同视角提供互补观察。`;
          }

          nodeA.relations.push({
            targetEvidenceId: nodeB.id,
            relationType,
            description: descA,
          });

          nodeB.relations.push({
            targetEvidenceId: nodeA.id,
            relationType,
            description: descB,
          });
        }
      }
    }
  }

  /**
   * Analyze evidence nodes across domains and detect dimensional tensions and contradictions.
   * Incorporates time-window, multi-factor confidence, and domain perspective scope.
   */
  static detectConflicts(evidences: CanonicalEvidenceNode[]): CrossDomainConflict[] {
    // 1. Populate semantic relation edges
    this.inferEvidenceRelations(evidences);

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

      // Time window tracking
      const timeWindows: string[] = [];

      for (const [domain, evList] of domainMap.entries()) {
        const topEv = evList.sort((a, b) => (b.confidenceBreakdown?.overall ?? b.confidence) - (a.confidenceBreakdown?.overall ?? a.confidence))[0];
        
        // Extract time scope if present in parameters or temporalScope
        const timeScope = topEv.temporalScope?.timeWindow || topEv.parameters?.timeWindow || topEv.parameters?.dashaPeriod || topEv.parameters?.scope;
        if (timeScope && typeof timeScope === 'string') {
          timeWindows.push(timeScope);
        }

        perspectives.push({
          domain,
          dimension: dim,
          stance: topEv.polarity,
          keyClaim: `${topEv.ruleName}：${topEv.canonicalInterpretation.slice(0, 120)}...`,
          temporalScope: topEv.temporalScope,
          evidenceIds: evList.map(e => e.id),
        });

        if (topEv.polarity === 'favorable') favorableCount++;
        else if (topEv.polarity === 'unfavorable') unfavorableCount++;
        else if (topEv.polarity === 'transformative') transformativeCount++;
      }

      // Conflict logic: has opposing stances
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
          const windowNote = timeWindows.length > 0 ? ` (涉及时间窗口: ${timeWindows.join(' vs ')})` : '';
          tensionDescription = `在【${dim}】时机节奏上，短期格局与底层长期运势存在相位差${windowNote}（如表面变动窗口已开，但底层深层大运尚未就位）。`;
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
        `  - 【${p.domain.toUpperCase()} 视角】(立场: ${p.stance}${p.temporalScope?.timeWindow ? `, 时域: ${p.temporalScope.timeWindow}` : ''}) -> ${p.keyClaim}`
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
