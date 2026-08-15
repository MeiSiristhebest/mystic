/**
 * Cross-Domain Conflict Detector and Multi-Domain Dialectical Synthesizer.
 * 
 * Prevents "pseudo-consensus hallucination" by detecting real tensions,
 * temporal scope mismatches, and polarity disagreements across Ziwei, Vedic, TCM (Nihaixia), and Bazi.
 * 
 * Features:
 * - Semantic Eligibility & Temporal Scope Intersection Analysis
 * - Dynamic Evidence Relation Inference (corroborating, contradicting, timing_precursor, surface_vs_root, temporally_separate)
 * - Epistemic SourceTier filtering (prevents heuristic inferences from contaminating core conflict arbitration)
 * - Multi-factor confidence-weighted perspective resolution
 */

import { CanonicalEvidenceNode, CrossDomainConflict, CrossDomainPerspective, DomainType, EvidenceRelation, EvidenceTemporalScope } from '../contracts/types';

export interface ParsedTimeRange {
  startYear: number;
  endYear: number;
  isNatal: boolean;
}

export function parseTemporalScope(scope?: EvidenceTemporalScope): ParsedTimeRange {
  if (!scope || scope.scopeType === 'natal') {
    return { startYear: 0, endYear: 9999, isNatal: true };
  }

  if (scope.startDate && scope.endDate) {
    const sY = parseInt(scope.startDate.slice(0, 4), 10) || 0;
    const eY = parseInt(scope.endDate.slice(0, 4), 10) || 9999;
    return { startYear: sY, endYear: eY, isNatal: false };
  }

  if (scope.timeWindow) {
    const match = scope.timeWindow.match(/(\d{4})\s*[-~至]\s*(\d{4})/);
    if (match) {
      return {
        startYear: parseInt(match[1], 10),
        endYear: parseInt(match[2], 10),
        isNatal: false,
      };
    }
  }

  return { startYear: 0, endYear: 9999, isNatal: false };
}

export class CrossDomainConflictDetector {
  /**
   * Check if two temporal scopes have an active overlapping window
   */
  static checkTemporalOverlap(scopeA?: EvidenceTemporalScope, scopeB?: EvidenceTemporalScope): {
    hasOverlap: boolean;
    aPrecedesB: boolean;
    bPrecedesA: boolean;
  } {
    const rA = parseTemporalScope(scopeA);
    const rB = parseTemporalScope(scopeB);

    if (rA.isNatal || rB.isNatal) {
      return { hasOverlap: true, aPrecedesB: false, bPrecedesA: false };
    }

    const hasOverlap = Math.max(rA.startYear, rB.startYear) <= Math.min(rA.endYear, rB.endYear);
    const aPrecedesB = rA.endYear < rB.startYear;
    const bPrecedesA = rB.endYear < rA.startYear;

    return { hasOverlap, aPrecedesB, bPrecedesA };
  }

  /**
   * Check if an evidence node is semantically eligible for primary structural relation inference
   */
  static isEligibleForStructuralRelation(node: CanonicalEvidenceNode): boolean {
    if (node.level === 'optional') return false;
    if (node.evidenceType === 'heuristic_inference') return false;
    return true;
  }

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

        const timing = this.checkTemporalOverlap(nodeA.temporalScope, nodeB.temporalScope);
        const isHealthVsCareer = (nodeA.dimension === 'health' && nodeB.dimension === 'career') ||
                                 (nodeA.dimension === 'career' && nodeB.dimension === 'health');

        // Health vs Career Surface/Root Tension
        if (isHealthVsCareer) {
          const healthNode = nodeA.dimension === 'health' ? nodeA : nodeB;
          const careerNode = nodeA.dimension === 'career' ? nodeA : nodeB;
          
          // Surface vs Root only triggers if health has deficit/warning and career has active drive
          const isHealthDeficit = healthNode.polarity === 'unfavorable' || (healthNode.level === 'warning' || healthNode.level === 'contraindication');
          const isCareerActive = careerNode.polarity === 'favorable' || careerNode.polarity === 'transformative';

          if (isHealthDeficit && isCareerActive && this.isEligibleForStructuralRelation(healthNode) && this.isEligibleForStructuralRelation(careerNode)) {
            nodeA.relations.push({
              targetEvidenceId: nodeB.id,
              relationType: 'surface_vs_root',
              description: `【表本关系】外在事业推进（${careerNode.ruleName}）与内在体能真阳负荷（${healthNode.ruleName}）构成辩证张力。`,
            });
            nodeB.relations.push({
              targetEvidenceId: nodeA.id,
              relationType: 'surface_vs_root',
              description: `【表本关系】内在体能负荷（${healthNode.ruleName}）与外在社会事业推进（${careerNode.ruleName}）构成辩证张力。`,
            });
            continue;
          }
        }

        // Same Dimension Relations
        if (nodeA.dimension === nodeB.dimension) {
          const bothEligible = this.isEligibleForStructuralRelation(nodeA) && this.isEligibleForStructuralRelation(nodeB);

          // Timing Precursor Relation (Strict semantic eligibility: both must be core/support structural nodes)
          if (bothEligible && !timing.hasOverlap) {
            if (timing.aPrecedesB) {
              nodeA.relations.push({
                targetEvidenceId: nodeB.id,
                relationType: 'timing_precursor',
                description: `【时机前驱】${nodeA.ruleName}处于前期发展周期，为后续${nodeB.ruleName}之阶段演进奠定基础。`,
              });
              nodeB.relations.push({
                targetEvidenceId: nodeA.id,
                relationType: 'complementary',
                description: `【时运承接】承接前期${nodeA.ruleName}阶段的能量积蓄与结构塑形。`,
              });
              continue;
            } else if (timing.bPrecedesA) {
              nodeB.relations.push({
                targetEvidenceId: nodeA.id,
                relationType: 'timing_precursor',
                description: `【时机前驱】${nodeB.ruleName}处于前期发展周期，为后续${nodeA.ruleName}之阶段演进奠定基础。`,
              });
              nodeA.relations.push({
                targetEvidenceId: nodeB.id,
                relationType: 'complementary',
                description: `【时运承接】承接前期${nodeB.ruleName}阶段的能量积蓄与结构塑形。`,
              });
              continue;
            }
          }

          // Polarity Match -> Corroborating
          if (nodeA.polarity === nodeB.polarity && nodeA.polarity !== 'neutral') {
            nodeA.relations.push({
              targetEvidenceId: nodeB.id,
              relationType: 'corroborating',
              description: `【同频印证】与【${nodeB.ruleName}】在【${nodeA.dimension}】维度形成共振，彼此印证。`,
            });
            nodeB.relations.push({
              targetEvidenceId: nodeA.id,
              relationType: 'corroborating',
              description: `【同频印证】与【${nodeA.ruleName}】在【${nodeB.dimension}】维度形成共振，彼此印证。`,
            });
            continue;
          }

          // Opposing Polarities
          const isOpposing = (nodeA.polarity === 'favorable' && (nodeB.polarity === 'unfavorable' || nodeB.polarity === 'transformative')) ||
                             (nodeB.polarity === 'favorable' && (nodeA.polarity === 'unfavorable' || nodeA.polarity === 'transformative'));

          if (isOpposing && bothEligible) {
            if (timing.hasOverlap) {
              nodeA.relations.push({
                targetEvidenceId: nodeB.id,
                relationType: 'contradicting',
                description: `【时域交集分歧】在重叠活跃周期内，与【${nodeB.ruleName}】对【${nodeA.dimension}】吉凶定性存在直接张力。`,
              });
              nodeB.relations.push({
                targetEvidenceId: nodeA.id,
                relationType: 'contradicting',
                description: `【时域交集分歧】在重叠活跃周期内，与【${nodeA.ruleName}】对【${nodeB.dimension}】吉凶定性存在直接张力。`,
              });
            } else {
              nodeA.relations.push({
                targetEvidenceId: nodeB.id,
                relationType: 'temporally_separate',
                description: `【跨时段相位差】虽立场相反，但活跃于不同时间窗口，代表不同发展阶段之运律轮转。`,
              });
              nodeB.relations.push({
                targetEvidenceId: nodeA.id,
                relationType: 'temporally_separate',
                description: `【跨时段相位差】虽立场相反，但活跃于不同时间窗口，代表不同发展阶段之运律轮转。`,
              });
            }
            continue;
          }
        }

        // Generic Cross-Domain Complementary
        nodeA.relations.push({
          targetEvidenceId: nodeB.id,
          relationType: 'complementary',
          description: `【多维互补】与【${nodeB.ruleName}】从不同视角提供互补观察。`,
        });
        nodeB.relations.push({
          targetEvidenceId: nodeA.id,
          relationType: 'complementary',
          description: `【多维互补】与【${nodeA.ruleName}】从不同视角提供互补观察。`,
        });
      }
    }
  }

  /**
   * Analyze evidence nodes across domains and detect dimensional tensions and contradictions.
   * Incorporates time-window, epistemic filtering, and domain perspective scope.
   */
  static detectConflicts(evidences: CanonicalEvidenceNode[]): CrossDomainConflict[] {
    // 1. Populate semantic relation edges
    this.inferEvidenceRelations(evidences);

    const dimensions: Array<'career' | 'health' | 'wealth' | 'relationship' | 'timing'> = [
      'career', 'health', 'wealth', 'relationship', 'timing'
    ];

    const conflicts: CrossDomainConflict[] = [];

    for (const dim of dimensions) {
      // Filter out optional/heuristic nodes from causing primary domain conflict
      const dimEvidences = evidences.filter(e => e.dimension === dim && this.isEligibleForStructuralRelation(e));
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

      // Conflict logic: has opposing stances across active eligible nodes
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
