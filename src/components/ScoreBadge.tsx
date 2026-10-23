interface ScoreBadgeProps {
  score: number;
}

export function ScoreBadge({ score }: ScoreBadgeProps) {
  const color =
    score >= 75 ? "bg-green-100 text-green-800 border-green-300" :
    score >= 55 ? "bg-yellow-100 text-yellow-800 border-yellow-300" :
                  "bg-red-100 text-red-800 border-red-300";

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-semibold border ${color}`}>
      {score}
    </span>
  );
}
