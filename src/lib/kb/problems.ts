// The problems inside one ticket. The desk counts every report where its tenant files it
// (causes.ts) and footnotes the ones it read differently (desk-notes.json). A one-day move is not
// a day/month swap, so it is a problem of its own: it keeps its place in its tenant's row, as the
// desk counts it, and gets a row of its own too.
import { groupByCause, type CauseGroup, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = CauseGroup['cause'] | 'one-day move';
export type ProblemGroup = Omit<CauseGroup, 'cause'> & { problem: Problem };

export function groupByProblem(
  reports: Report[],
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): ProblemGroup[] {
  const groups: ProblemGroup[] = groupByCause(reports, tenantOf).map(({ cause, ...g }) => ({ problem: cause, ...g }));
  const moved = reports.filter((r) => oneDayMove.includes(r.id));
  // ponytail: no tenant → one 'unplaced' group, which is just groupByCause's stats for these reports.
  for (const { cause, ...g } of groupByCause(moved, () => undefined)) groups.push({ problem: 'one-day move', ...g });
  return groups;
}
