interface PairHeatmapProps {
  sessions: { driver: string; navigator: string; durationMinutes: number }[];
  members: string[];
}

export default function PairHeatmap({ sessions, members }: PairHeatmapProps) {
  const matrix = members.reduce(
    (acc, m1) => {
      acc[m1] = members.reduce(
        (inner, m2) => {
          inner[m2] = sessions
            .filter((s) => (s.driver === m1 && s.navigator === m2) || (s.driver === m2 && s.navigator === m1))
            .reduce((sum, s) => sum + s.durationMinutes, 0);
          return inner;
        },
        {} as Record<string, number>,
      );
      return acc;
    },
    {} as Record<string, Record<string, number>>,
  );

  const maxDuration = Math.max(...Object.values(matrix).flatMap((m) => Object.values(m)), 1);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr>
            <th className="p-2 text-zinc-500 font-mono"></th>
            {members.map((m) => (
              <th key={m} className="p-2 text-zinc-500 font-mono text-center">
                {m.split(' ')[0]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {members.map((m1) => (
            <tr key={m1}>
              <td className="p-2 text-zinc-400 font-mono">{m1.split(' ')[0]}</td>
              {members.map((m2) => {
                if (m1 === m2)
                  return (
                    <td key={m2} className="p-2 text-center text-zinc-700">
                      —
                    </td>
                  );
                const duration = matrix[m1][m2];
                const intensity = Math.min(1, duration / maxDuration);
                return (
                  <td
                    key={m2}
                    className="p-2 text-center rounded"
                    style={{ backgroundColor: `rgba(99, 102, 241, ${intensity * 0.5 + 0.05})` }}
                    title={`${m1} & ${m2}: ${Math.round(duration / 60)}h`}
                  >
                    <span className="text-zinc-400 font-mono">{Math.round(duration / 60)}h</span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
