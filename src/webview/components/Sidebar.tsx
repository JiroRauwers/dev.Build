import React, { useState, useEffect } from "react";
import "./Sidebar.css";
import { Button } from "./Button";
import StatsChart from "./statsChart";
import AchievementsList from "./achievementList";
import XpProgress from "./xpProgress";
import ProfileInfo from "./profileInfo";

interface SidebarProps {
  vscode: {
    postMessage: (message: any) => void;
    getState: () => any;
    setState: (state: any) => void;
  };
}

const Sidebar: React.FC<SidebarProps> = ({ vscode }) => {
  const [items, setItems] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    // Send a message to the extension to request initial data
    vscode.postMessage({ type: "getData" });
  }, [vscode]);

  const handleAddItem = () => {
    if (inputValue.trim() !== "") {
      const newItems = [...items, inputValue];
      setItems(newItems);
      setInputValue("");

      // Send the updated items to the extension
      vscode.postMessage({
        type: "updateItems",
        items: newItems,
      });
    }
  };

  const devStats = {
    stability: 7,
    speed: 8,
    code: 6,
    creativity: 9,
    risk: 5,
  };

  return (
    <div className="sidebar">
      <h2 className="sidebar-title">test</h2>

      <div className="rpg-dashboard">
        {/* Profile Info Component */}
        <ProfileInfo
          username="JIRO"
          title="Go Hard or Go Home"
          titleDescription="have no version control and no testing"
        />

        {/* Stats section */}
        <div className="stats-section">
          <h2>STATS</h2>
          <div className="stats-container">
            <div className="stats-grid">
              <div className="stats-column">
                <StatsChart stats={devStats} />
                {/* XP Progress moved here, right under the StatsChart */}
                <div className="level-info">
                  <p className="project-name">Main-project</p>
                  <XpProgress level={8} current={458} max={900} />
                </div>
              </div>
              <AchievementsList />
            </div>
          </div>
        </div>
      </div>

      <div className="sidebar-content">
        <div className="input-group">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Add new item..."
            className="sidebar-input"
          />
          <Button onClick={handleAddItem}> teste Add</Button>
        </div>

        <ul className="sidebar-list">
          {items.map((item, index) => (
            <li key={index} className="sidebar-list-item">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
