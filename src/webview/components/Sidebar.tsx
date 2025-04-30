import React, { useState, useEffect } from "react";
import "./Sidebar.css";
import { Button } from "./Button";

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
    </div>
  );
};

export default Sidebar;
