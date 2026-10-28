// The problems inside one ticket. causes.ts sorts every report by its tenant; that is right for a
// day/month swap and wrong for a report that is not a swap. The desk marks those in desk-notes.json.
import { groupByCause, type CauseGroup, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = CauseGroup['cause'] | 'one-day move';
export type ProblemGroup = Omit<CauseGroup, 'cause'> & { problem: Problem };

// A one-day move (Monday for Tuesday, Lisbon and Toronto on different days) is not the parser and
// not the hint: no day and month trade places. It is its own problem, whatever the tenant.
export function groupByProblem(
  reports: Report[],
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): ProblemGroup[] {
  const moved = reports.filter((r) => oneDayMove.includes(r.id));
  const swaps = reports.filter((r) => !oneDayMove.includes(r.id));
  const groups: ProblemGroup[] = groupByCause(swaps, tenantOf).map(({ cause, ...g }) => ({ problem: cause, ...g }));
  // ponytail: no tenant → one 'unplaced' group, which is just groupByCause's stats for these reports.
  for (const { cause, ...g } of groupByCause(moved, () => undefined)) groups.push({ problem: 'one-day move', ...g });
  return groups.sort((a, b) => b.reports.length - a.reports.length);
}
