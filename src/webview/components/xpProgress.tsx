import "./xpProgress.css";

interface XpProgressProps {
  level: number;
  current: number;
  max: number;
}

export default function XpProgress({ level, current, max }: XpProgressProps) {
  const percentage = (current / max) * 100;

  return (
    <div className="xp-progress">
      <div className="xp-level">Lv. {level} XP</div>
      <div className="xp-bar-container">
        <div className="xp-bar" style={{ width: `${percentage}%` }}></div>
      </div>
      <div className="xp-values">
        {current} / {max}
      </div>
    </div>
  );
}
