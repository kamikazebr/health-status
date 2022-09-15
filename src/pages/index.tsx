import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../../styles/Home.module.css";
import { atom, useAtom } from "jotai";
import { useAtomValue, useHydrateAtoms } from "jotai/utils";
import { useEffect } from "react";
import { Contract, ethers } from "ethers";
import usePriceOracleTime, { timeConverter } from "../hooks/usePriceOracleTime";

export const getServerSideProps: GetServerSideProps<{
  initialCount: number;
}> = async (context) => {
  return { props: { initialCount: 42 } };
};

export default function Home({
  initialCount,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  // useHydrateAtoms([[countAtom, initialCount]] as const);

  // const [count, setCount] = useAtom(countAtom);
  // const doubleCount = useAtomValue(doubleAtom);

  const {
    checkOracle,
    dateTimeCountdown,
    timeUntil,
    canConsult,
    isLoading,
    currentNetwork,
  } = usePriceOracleTime();
  useEffect(() => {
    checkOracle();
  }, [checkOracle]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Price Oracle Health Status</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 className={styles.title}>Price Oracle Health Status</h1>
      <main className={styles.main}>
        {isLoading ? (
          <h3>Loading...</h3>
        ) : (
          <>
            <>
              <h3>Network:</h3>
              <div>{currentNetwork}</div>
              <h3>Can Consult Prices:</h3>
              <div>{canConsult ? "Yes" : "No"}</div>
            </>
            {dateTimeCountdown > 0 && (
              <>
                <h3>Need wait until:</h3>
                <div>{timeConverter(dateTimeCountdown)}</div>
                <h3>When:</h3>
                <div>{timeUntil}</div>
              </>
            )}
          </>
        )}
        {/* <button onClick={checkOracle}>Update</button> */}
      </main>
      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{" "}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  );
}
