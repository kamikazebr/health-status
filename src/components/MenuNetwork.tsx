import React, { useState } from "react";
import { NETWORKS } from "../hooks/usePriceOracleTime";

export default function MenuNetwork() {
  return (
    <div>
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
            <span> </span>
          </>
        );
      })}
    </div>
  );
}
