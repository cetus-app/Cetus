import React, { FunctionComponent } from "react";

import { ApiKey } from "../../api/types";

interface ApiKeyPickerProps {
  isActive: boolean;
  onToggle: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  selectedName?: string;
  apiKeys: ApiKey[];
  onKeyClick: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, id: string) => void;
}

const ApiKeyPicker: FunctionComponent<ApiKeyPickerProps> = ({
  isActive, onToggle, selectedName, apiKeys, onKeyClick
}) => (
  <div className={`api-key-picker dropdown${isActive ? " is-active" : ""}`}>
    <div className="dropdown-trigger">
      <button className="button" type="button" onClick={onToggle}>
        <span>{selectedName || "Choose API key"}</span>
        <span className="icon is-small">
          <i className="fas fa-angle-down" />
        </span>
      </button>
    </div>

    <div className="dropdown-menu">
      <div className="dropdown-content">
        {apiKeys.map(key => (
          // eslint-disable-next-line jsx-a11y/anchor-is-valid
          <a key={key.id} href="#" className="dropdown-item" onClick={e => onKeyClick(e, key.id)}>{key.name}</a>
        ))}
      </div>
    </div>
  </div>
);

export default ApiKeyPicker;
