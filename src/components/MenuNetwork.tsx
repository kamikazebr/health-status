import React, { useState } from "react";
import { NETWORKS } from "../hooks/usePriceOracleTime";

export default function MenuNetwork() {
  return (
    <div className="menu">
      {Object.keys(NETWORKS).map((network) => {
        return (
          <>
            <a
              className="network_link"
              key={network}
              href={`?network=${network}`}
            >
              {network}
            </a>
          </>
        );
      })}
    </div>
  );
}
