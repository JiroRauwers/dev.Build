import React, { useState, useEffect } from "react";
import "./Sidebar.css";
import { Button } from "./Button";
import StatsChart from "./statsChart";
import AchievementsList from "./achievementList";
import XpProgress from "./xpProgress";
import ProfileInfo from "./profileInfo";
import { useVscode } from "../context/vscode";

const Sidebar: React.FC = () => {
  const vscode = useVscode();

  const [items, setItems] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    // Load saved items from globalState when the component mounts
    const savedItems = vscode.getState()?.items || [];
    setItems(savedItems);

    // Send a message to the extension to request data
    vscode.postMessage({
      type: "getNoteData",
    });

    // Listen for messages from the extension
    window.addEventListener("message", (event) => {
      const message = event.data;
      switch (message.type) {
        case "update":
          setItems(message.data);
          break;
        default:
          console.error("Unknown message type:", message.type);
      }
    });

    return () => {
      // Cleanup event listener on unmount
      window.removeEventListener("message", () => {});
    };
  }, [vscode]);

  const handleAddItem = () => {
    if (inputValue.trim() !== "") {
      const notes = [...items, inputValue];
      setItems(notes);
      setInputValue("");

      // Send the updated items to the extension
      vscode.postMessage({
        type: "updateNotes",
        notes: notes,
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
    </div>
  );
};

export default Sidebar;
