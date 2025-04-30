import React from "react";

export const Button = (
  props: React.PropsWithChildren<{ className?: string; onClick?: () => void }>
) => {
  return (
    <button
      {...props}
      className={`sidebar-button ${props.className || ""}`.trim()}
    />
  );
};
