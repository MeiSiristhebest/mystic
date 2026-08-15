/**
 * Cross-Domain Conflict Detector and Multi-Domain Dialectical Synthesizer.
 * 
 * Prevents "pseudo-consensus hallucination" by detecting real tensions,
 * temporal scope mismatches, and polarity/valence disagreements across Ziwei, Vedic, TCM (Nihaixia), and Bazi.
 * 
 * Epistemic & Temporal Features:
 * 1. Millisecond-precision Date Timestamp Intersections (Eliminates integer-year truncation errors).
 * 2. Natal Baseline Decoupling: Natal structural baselines do not falsely trigger "time overlap contradictions" with transient transits.
 * 3. SourceTier & EvidenceType structural eligibility filtering (Excludes tertiary branch and heuristic analogies from hard arbitration).
 * 4. Objective relation naming (temporal_precedence, corroborating, contradicting, surface_vs_root, temporally_separate).
 * 5. Prompt Pipeline Dialectic Firewall generation.
 */

import { CanonicalEvidenceNode, CrossDomainConflict, CrossDomainPerspective, DomainType, EvidenceRelation, EvidenceTemporalScope, RelationType } from '../contracts/types';

export interface ParsedTimeInterval {
  startTimeMs: number;
  endTimeMs: number;
  isNatalBaseline: boolean;
}

export function parseTemporalInterval(scope?: EvidenceTemporalScope): ParsedTimeInterval {
  if (!scope || scope.scopeType === 'natal' || scope.isNatalBaseline) {
    return { startTimeMs: 0, endTimeMs: 0, isNatalBaseline: true };
  }

  // Exact YYYY-MM-DD parsing
  if (scope.startDate && scope.endDate) {
    const sMs = Date.parse(`${scope.startDate}T00:00:00Z`);
    const eMs = Date.parse(`${scope.endDate}T23:59:59Z`);
    if (!isNaN(sMs) && !isNaN(eMs)) {
      return { startTimeMs: sMs, endTimeMs: eMs, isNatalBaseline: false };
    }
  }

  // Parse YYYY-MM-DD or YYYY format from timeWindow
  if (scope.timeWindow) {
    const fullDateMatch = scope.timeWindow.match(/(\d{4}-\d{2}-\d{2})\s*[-~至]\s*(\d{4}-\d{2}-\d{2})/);
    if (fullDateMatch) {
      const sMs = Date.parse(`${fullDateMatch[1]}T00:00:00Z`);
      const eMs = Date.parse(`${fullDateMatch[2]}T23:59:59Z`);
      if (!isNaN(sMs) && !isNaN(eMs)) {
        return { startTimeMs: sMs, endTimeMs: eMs, isNatalBaseline: false };
      }
    }

    const yearMatch = scope.timeWindow.match(/(\d{4})\s*[-~至]\s*(\d{4})/);
    if (yearMatch) {
      const sMs = Date.parse(`${yearMatch[1]}-01-01T00:00:00Z`);
      const eMs = Date.parse(`${yearMatch[2]}-12-31T23:59:59Z`);
      if (!isNaN(sMs) && !isNaN(eMs)) {
        return { startTimeMs: sMs, endTimeMs: eMs, isNatalBaseline: false };
      }
    }
  }

  return { startTimeMs: 0, endTimeMs: 0, isNatalBaseline: false };
}

export class CrossDomainConflictDetector {
  /**
   * Check if two temporal scopes have an active overlapping window in dynamic time.
   * Explicitly isolates natal baseline from transient dynamic dasha/transits.
   */
  static checkTemporalOverlap(scopeA?: EvidenceTemporalScope, scopeB?: EvidenceTemporalScope): {
    hasOverlap: boolean;
    isNatalComparison: boolean;
    aPrecedesB: boolean;
    bPrecedesA: boolean;
  } {
    const rA = parseTemporalInterval(scopeA);
    const rB = parseTemporalInterval(scopeB);

    if (rA.isNatalBaseline || rB.isNatalBaseline) {
      return { hasOverlap: false, isNatalComparison: true, aPrecedesB: false, bPrecedesA: false };
    }

    if (rA.startTimeMs === 0 || rB.startTimeMs === 0) {
      return { hasOverlap: true, isNatalComparison: false, aPrecedesB: false, bPrecedesA: false };
    }

    const hasOverlap = Math.max(rA.startTimeMs, rB.startTimeMs) <= Math.min(rA.endTimeMs, rB.endTimeMs);
    const aPrecedesB = rA.endTimeMs < rB.startTimeMs;
    const bPrecedesA = rB.endTimeMs < rA.startTimeMs;

    return { hasOverlap, isNatalComparison: false, aPrecedesB, bPrecedesA };
  }

  /**
   * Enforces strict Epistemic SourceTier & EvidenceType structural eligibility.
   * Only Primary Canon and Secondary Lore nodes of core/support level can trigger hard cross-domain contradictions.
   */
  static isStructurallyEligible(node: CanonicalEvidenceNode): boolean {
    if (node.level === 'optional') return false;
    if (node.evidenceType === 'heuristic_inference') return false;
    if (node.sourceTier === 'tertiary_branch' || node.sourceTier === 'school_notes') return false;
    return true;
  }

  /**
   * Infer structural relations across evidence nodes and populate evidence.relations
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

        // Domain Interaction Rule: Health Deficit vs Career Action (Surface vs Root)
        if (isHealthVsCareer) {
          const healthNode = nodeA.dimension === 'health' ? nodeA : nodeB;
          const careerNode = nodeA.dimension === 'career' ? nodeA : nodeB;
          
          const isHealthDeficit = healthNode.polarity === 'unfavorable' || (healthNode.level === 'warning' || healthNode.level === 'contraindication');
          const isCareerActive = careerNode.polarity === 'favorable' || careerNode.polarity === 'transformative';

          if (isHealthDeficit && isCareerActive && this.isStructurallyEligible(healthNode) && this.isStructurallyEligible(careerNode)) {
            nodeA.relations.push({
              targetEvidenceId: nodeB.id,
              relationType: 'surface_vs_root',
              description: `【领域交互规则·表本张力】外在事业推进（${careerNode.ruleName}）与内在体能真阳负荷（${healthNode.ruleName}）构成辩证张力。`,
            });
            nodeB.relations.push({
              targetEvidenceId: nodeA.id,
              relationType: 'surface_vs_root',
              description: `【领域交互规则·表本张力】内在体能负荷（${healthNode.ruleName}）与外在社会事业推进（${careerNode.ruleName}）构成辩证张力。`,
            });
            continue;
          }
        }

        // Same Dimension Relations
        if (nodeA.dimension === nodeB.dimension) {
          const bothEligible = this.isStructurallyEligible(nodeA) && this.isStructurallyEligible(nodeB);

          // Temporal Precedence (Objective chronological sequence without artificial causal assumptions)
          if (bothEligible && !timing.hasOverlap && !timing.isNatalComparison) {
            if (timing.aPrecedesB) {
              nodeA.relations.push({
                targetEvidenceId: nodeB.id,
                relationType: 'temporal_precedence',
                description: `【时序在先】${nodeA.ruleName}时间窗口处于前期，时序上早于后续${nodeB.ruleName}阶段。`,
              });
              nodeB.relations.push({
                targetEvidenceId: nodeA.id,
                relationType: 'complementary',
                description: `【时序承接】承接前期${nodeA.ruleName}阶段之运律轮转。`,
              });
              continue;
            } else if (timing.bPrecedesA) {
              nodeB.relations.push({
                targetEvidenceId: nodeA.id,
                relationType: 'temporal_precedence',
                description: `【时序在先】${nodeB.ruleName}时间窗口处于前期，时序上早于后续${nodeA.ruleName}阶段。`,
              });
              nodeA.relations.push({
                targetEvidenceId: nodeB.id,
                relationType: 'complementary',
                description: `【时序承接】承接前期${nodeB.ruleName}阶段之运律轮转。`,
              });
              continue;
            }
          }

          // Polarity / Valence Match -> Corroborating
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

          // Opposing Dynamic Polarities (Direct Contradiction only in active overlapping window)
          const isDirectContradiction = (nodeA.polarity === 'favorable' && nodeB.polarity === 'unfavorable') ||
                                       (nodeB.polarity === 'favorable' && nodeA.polarity === 'unfavorable');

          if (isDirectContradiction && bothEligible) {
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
            } else if (!timing.isNatalComparison) {
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
   * Incorporates exact time-window, SourceTier filtering, and domain perspective scope.
   */
  static detectConflicts(evidences: CanonicalEvidenceNode[]): CrossDomainConflict[] {
    // 1. Populate semantic relation edges
    this.inferEvidenceRelations(evidences);

    const dimensions: Array<'career' | 'health' | 'wealth' | 'relationship' | 'timing' | 'structural'> = [
      'career', 'health', 'wealth', 'relationship', 'timing', 'structural'
    ];

    const conflicts: CrossDomainConflict[] = [];

    for (const dim of dimensions) {
      // Filter out optional/tertiary nodes from causing primary domain conflict
      const dimEvidences = evidences.filter(e => e.dimension === dim && this.isStructurallyEligible(e));
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

      const timeWindows: string[] = [];

      for (const [domain, evList] of domainMap.entries()) {
        const topEv = evList.sort((a, b) => (b.confidenceBreakdown?.overall ?? b.confidence) - (a.confidenceBreakdown?.overall ?? a.confidence))[0];
        
        const timeScope = topEv.temporalScope?.timeWindow || topEv.parameters?.timeWindow || topEv.parameters?.dashaPeriod || topEv.parameters?.scope;
        if (timeScope && typeof timeScope === 'string') {
          timeWindows.push(timeScope);
        }

        perspectives.push({
          domain,
          dimension: dim,
          stance: topEv.polarity,
          valence: topEv.valence,
          keyClaim: `${topEv.ruleName}：${topEv.canonicalInterpretation.slice(0, 120)}...`,
          temporalScope: topEv.temporalScope,
          evidenceIds: evList.map(e => e.id),
        });

        if (topEv.polarity === 'favorable') favorableCount++;
        else if (topEv.polarity === 'unfavorable') unfavorableCount++;
        else if (topEv.polarity === 'transformative') transformativeCount++;
      }

      // Stricter conflict logic: Direct contradiction requires explicit favorable vs unfavorable opposition
      const hasDirectContradiction = favorableCount > 0 && unfavorableCount > 0;
      const hasTimingMismatch = dim === 'timing' && timeWindows.length > 1;

      let conflictType: CrossDomainConflict['conflictType'] = undefined;
      let tensionDescription = '';
      let synthesisStrategy = '';

      if (hasDirectContradiction) {
        conflictType = 'direct_contradiction';
        tensionDescription = `在【${dim}】维度上，不同推演体系出现直接分歧：部分系统指示正面吉象，而另一系统提示显著阻力或破局考验。`;
        synthesisStrategy = `严禁强行统一或模棱两可；必须向用户客观呈现两方的立论依据（如表面机会 vs 底层暗礁），指导用户采取“防守型进取”策略。`;

        conflicts.push({
          dimension: dim,
          hasConflict: true,
          conflictType,
          perspectives,
          tensionDescription,
          synthesisStrategy,
        });
      } else if (hasTimingMismatch) {
        conflictType = 'timing_mismatch';
        const windowNote = timeWindows.length > 0 ? ` (涉及时间窗口: ${timeWindows.join(' vs ')})` : '';
        tensionDescription = `在【${dim}】时机节奏上，短期格局与底层长期运势存在相位差${windowNote}。`;
        synthesisStrategy = `区分“表层趋势”与“深层运律”，建议用户在微观上试水、在宏观重资产决策上保持定力。`;

        conflicts.push({
          dimension: dim,
          hasConflict: true,
          conflictType,
          perspectives,
          tensionDescription,
          synthesisStrategy,
        });
      } else {
        // Systems are in concord, neutral, or non-conflicting transformative state
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
