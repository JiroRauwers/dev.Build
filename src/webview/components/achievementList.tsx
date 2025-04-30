import type React from "react";
import { Zap, FlaskRoundIcon as Flask, X } from "lucide-react";
import "./achievements.css";

interface Achievement {
  id: string;
  title: string;
  icon: React.ReactNode;
  colorClass: string;
  expired?: boolean;
}

export default function AchievementsList() {
  const achievements: Achievement[] = [
    {
      id: "syntax-sorcerer",
      title: "Syntax Sorcerer",
      icon: <Zap className="achievement-icon" />,
      colorClass: "achievement-icon-yellow",
    },
    {
      id: "strong-linter",
      title: "Strong Linter",
      icon: <Flask className="achievement-icon" />,
      colorClass: "achievement-icon-green",
    },
    {
      id: "living-on-edge",
      title: "Living on the Edge",
      icon: <X className="achievement-icon" />,
      colorClass: "achievement-icon-gray",
      expired: true,
    },
  ];

  return (
    <div className="achievements-list">
      <h3>ACHIEVEMENTS</h3>
      <div className="achievements-container">
        {achievements.map((achievement) => (
          <AchievementItem key={achievement.id} achievement={achievement} />
        ))}
      </div>
    </div>
  );
}

function AchievementItem({ achievement }: { achievement: Achievement }) {
  return (
    <div className="achievement-item">
      <div className={achievement.colorClass}>{achievement.icon}</div>
      <div className="achievement-details">
        <div className="achievement-title">{achievement.title}</div>
        {achievement.expired && (
          <div className="achievement-expired">EXPIRED</div>
        )}
      </div>
    </div>
  );
}
