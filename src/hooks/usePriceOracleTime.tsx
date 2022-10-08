import { ethers, Contract } from "ethers";
import { atom, useAtom } from "jotai";
import moment from "moment";
import React, { useCallback, useState } from "react";
import jsonInterface from "../abi/oracle.json";

const dateTimeCountdownAtom = atom(0);
const timeUntilAtom = atom<string | undefined>("");
export function timeConverter(unixTimestamp: number) {
  return new Intl.DateTimeFormat("default", {
    dateStyle: "long",
    timeStyle: "long",
  }).format(new Date(unixTimestamp * 1000));
}
function timesFromNow(dateTime: number) {
  return moment(new Date(dateTime * 1000)).fromNow();
}

let interval = 0;

export const NETWORKS = {
  gnosis: {
    rpcProvider: "https://rpc.gnosischain.com",
    chainId: 100,
    oracleAddress: "0x6f38d112b13eda1e3abafc61e296be2e27f15071", //Gnosis
    honeyTokenPair: "0x4505b262dc053998c10685dc5f9098af8ae5c8ad", // Gnosis
    honeyToken: "0x71850b7e9ee3f13ab46d67167341e4bdc905eef9", // Gnosis
    stableToken: "0xe91d153e0b41518a2ce8dd3d7944fa863463a97d", // Gnosis
  },
  rinkeby: {
    rpcProvider:
      "https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
    chainId: 4,
    oracleAddress: "0xa87f58dbbe3a4d01d7f776e02b4dd3237f598095", //Rinkeby
    honeyTokenPair: "0x355339ddebf3471a6ae1f9e7194c7aee30ad6223", // Rinkeby
    honeyToken: "0x3050e20fabe19f8576865811c9f28e85b96fa4f9", // Rinkeby
    stableToken: "0x531eab8bb6a2359fe52ca5d308d85776549a0af9", // Rinkeby
  },
  polygon: {
    rpcProvider: "https://polygon-rpc.com",
    chainId: 137,
    honeyTokenPair: "0x72acef580b77fa28cd906ca3e1c0b971ebd82ab2",
    honeyToken: "0xb371248dd0f9e4061ccf8850e9223ca48aa7ca4b",
    oracleAddress: "0x15f627b9c47bbfbbc2194c9a8db2e722e090a690",
    stableToken: "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
  },
};

export type NetworkType = keyof typeof NETWORKS;

function usePriceOracleTime() {
  const [dateTimeCountdown, setDateTimeCountdown] = useAtom(
    dateTimeCountdownAtom
  );

  const [timeUntil, setTimeUntil] = useAtom(timeUntilAtom);

  const [canUpdate, setCanUpdate] = useState(false);
  const [canConsult, setCanConsult] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [currentNetwork, setCurrentNetwork] = useState<
    NetworkType | undefined
  >();

  const checkOracle = useCallback(
    async (networkChain: NetworkType = "gnosis") => {
      setLoading(true);
      setCurrentNetwork(networkChain);

      const {
        oracleAddress,
        honeyToken,
        honeyTokenPair,
        stableToken,
        rpcProvider,
        chainId,
      } = NETWORKS[networkChain];

      const provider = new ethers.providers.JsonRpcProvider(
        rpcProvider,
        chainId
      );

      let oracle = new Contract(oracleAddress, jsonInterface, provider);

      let blockNumber = await provider.getBlockNumber(); //24187689
      // let blockNumber = 24187589;
      console.log("blockNumber", blockNumber);
      const timestamp = (await provider.getBlock(blockNumber)).timestamp;

      const w = (await oracle.windowSize()) * 1;
      console.log(`windowSize: ${w}`);
      const p = (await oracle.periodSize()) * 1;
      console.log(`periodSize: ${p}`);
      const g = (await oracle.granularity()) * 1;
      console.log(`granularity: ${g}`);

      // let timestamp = (await web3.eth.getBlock(await web3.eth.getBlockNumber()))
      //   .timestamp;
      console.log(`current timestamp: ${timestamp}`);
      const ob = (await oracle.observationIndexOf(timestamp)) * 1;

      console.log(`observationIndexOf: ${ob}`);
      let first = (ob + 1) % g;
      console.log(`getFirstObservationIndexOf: ${first}`);

      // for (let n = first; n <= first; n++) {
      const obFirst = await oracle.pairObservations(honeyTokenPair, first);
      const obCurrent = await oracle.pairObservations(honeyTokenPair, ob);
      // console.log(d);
      let obTimestamp = ethers.BigNumber.from(obCurrent.timestamp).toNumber();
      let obTimestampFirst = ethers.BigNumber.from(
        obFirst.timestamp
      ).toNumber();
      let timeElapsedFirst = timestamp - obTimestampFirst;
      let timeElapsed = timestamp - obTimestamp;
      let timeTgo = obTimestamp + p;

      console.log(`d.timestamp: ${obCurrent.timestamp}`);
      console.log(`timeTgo: ${timeTgo}`);

      console.log(
        `timeElapsed: ${timeElapsed} windowsize: ${w} periodSize: ${p}`
      );

      console.log(
        `timeElapsedFirst: ${timeElapsedFirst} windowsize: ${w} periodSize: ${p}`
      );

      console.log(`d.timestampFirst: ${obFirst.timestamp}`);

      let _canConsult = timeElapsedFirst <= w;
      let _canUpdate = timeElapsed > p;
      console.log("canUpdate", _canUpdate);
      console.log("_canConsult", _canConsult);
      setCanUpdate(_canUpdate);
      setCanConsult(_canConsult);
      if (_canConsult) {
        const name = await oracle.consult(
          honeyToken,
          ethers.BigNumber.from(1),
          stableToken
        );
        console.log("price", name.toNumber());
      }
      // if (_canUpdate) {
      // } else {
      console.log("time", timeConverter(timeTgo));
      setDateTimeCountdown(timeTgo);
      startInterval(timeTgo);
      // }
      let dd = timeConverter(obTimestamp);
      console.log(dd);
      setLoading(false);
    },
    []
  );

  const startInterval = useCallback((dateTime) => {
    if (dateTime > 0) {
      if (interval != 0) {
        console.log("CLEAR INTERVAL");
        window.clearInterval(interval);
      }

      const _timeUntil = timesFromNow(dateTime);
      setTimeUntil(_timeUntil);
      console.log("fromNow", _timeUntil);

      interval = window.setInterval(() => {
        const _timeUntil = timesFromNow(dateTime);
        setTimeUntil(_timeUntil);
        console.log("fromNow", _timeUntil);
      }, 1000 * 60);
    }
  }, []);

  return {
    dateTimeCountdown,
    isLoading,
    timeUntil,
    checkOracle,
    canUpdate,
    canConsult,
    currentNetwork,
    startInterval,
  };
}

export default usePriceOracleTime;
