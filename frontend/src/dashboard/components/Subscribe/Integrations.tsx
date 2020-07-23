import React, {
  Fragment, FunctionComponent, useEffect, useState
} from "react";

import { getMetas } from "../../api";
import { IntegrationInfo, IntegrationMeta, IntegrationType } from "../../api/types";
import Integration from "./Integration";

export interface IntegrationsProps {
  isEnabled: (type: IntegrationType) => boolean;
  onIntegrationToggle: (type: IntegrationType, info: IntegrationInfo) => void;
}

const Integrations: FunctionComponent<IntegrationsProps> = ({ isEnabled, onIntegrationToggle }) => {
  const [metas, setMetas] = useState<IntegrationMeta | null>(null);
  const [expanded, setExpanded] = useState<string[]>([]);

  useEffect(() => {
    const get = async () => {
      const res = await getMetas();
      setMetas(res);
    };

    get();
  }, []);

  const handleShowClick = (name: string) => {
    if (!expanded.includes(name)) setExpanded(prev => [...prev, name]);
    else {
      setExpanded(prev => {
        const newExp = prev.slice();
        const i = prev.indexOf(name);
        if (i >= 0) newExp.splice(i, 1);

        return newExp;
      });
    }
  };

  if (!metas) return <p>Loading..</p>;

  return (
    <Fragment>
      {Object.entries(metas).map(([type, info]) => (
        <Integration
          key={type}
          type={type as IntegrationType}
          meta={info}
          showMore={expanded.includes(type)}
          onShowClick={() => handleShowClick(type)}
          enabled={isEnabled(type as IntegrationType)}
          onToggle={() => onIntegrationToggle(type as IntegrationType, info)} />
      ))}
    </Fragment>
  );
};

export default Integrations;
