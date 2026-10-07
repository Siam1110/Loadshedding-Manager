import { Feeder } from '../types';

export interface OptimizationResult {
  recommendedFeeders: Feeder[];
  totalShedLoad: number;
  difference: number;
  shortage: number;
}

export const calculateOptimalFeeders = (
  feeders: Feeder[],
  requiredShedding: number
): OptimizationResult => {
  const eligibleFeeders = feeders.filter(f => f.isActive && !f.isProtected && !f.isCurrentlyShed);
  
  if (requiredShedding <= 0 || eligibleFeeders.length === 0) {
    return { recommendedFeeders: [], totalShedLoad: 0, difference: 0, shortage: requiredShedding > 0 ? requiredShedding : 0 };
  }

  const sortedFeeders = [...eligibleFeeders].sort((a, b) => a.priority - b.priority);

  let bestCombination: Feeder[] = [];
  let bestDifference = Infinity;
  let bestTotal = 0;

  const totalPossible = sortedFeeders.reduce((acc, f) => acc + f.currentLoad, 0);
  if (totalPossible < requiredShedding) {
    return {
      recommendedFeeders: sortedFeeders,
      totalShedLoad: Number(totalPossible.toFixed(2)),
      difference: Number((requiredShedding - totalPossible).toFixed(2)),
      shortage: Number((requiredShedding - totalPossible).toFixed(2))
    };
  }

  const findCombinations = (index: number, currentSet: Feeder[], currentSum: number) => {
    const diff = Math.abs(currentSum - requiredShedding);

    if (diff < bestDifference) {
      bestDifference = diff;
      bestCombination = [...currentSet];
      bestTotal = currentSum;
    } else if (Math.abs(diff - bestDifference) < 0.001) {
      const currentPrioritySum = currentSet.reduce((sum, f) => sum + f.priority, 0);
      const bestPrioritySum = bestCombination.reduce((sum, f) => sum + f.priority, 0);
      if (currentPrioritySum < bestPrioritySum) {
        bestCombination = [...currentSet];
        bestTotal = currentSum;
      }
    }

    if (currentSum >= requiredShedding + 0.5) return;

    for (let i = index; i < sortedFeeders.length; i++) {
      findCombinations(i + 1, [...currentSet, sortedFeeders[i]], currentSum + sortedFeeders[i].currentLoad);
    }
  };

  findCombinations(0, [], 0);

  return {
    recommendedFeeders: bestCombination,
    totalShedLoad: Number(bestTotal.toFixed(2)),
    difference: Number((bestTotal - requiredShedding).toFixed(2)),
    shortage: 0
  };
};
    
