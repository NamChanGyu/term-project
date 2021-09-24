import "./Coin.css";
import Loading from "../components/Loading";
import Posts from "../components/Posts";
import { useState, useEffect } from "react";
import { getCoin } from "../api/coins.api";
import { useParams } from "react-router-dom";
import { getPosts } from "../api/posts.api";

function Coin() {
  const [coin, setCoin] = useState();
  const [posts, setPosts] = useState();
  const { coinId } = useParams();

  useEffect(() => {
    const loadCoin = async () => {
      try {
        const coin = await getCoin(coinId);
        setCoin(coin);
      } catch (error) {
        console.log(error);
      }
    };
    loadCoin();

    const loadPosts = async () => {
      try {
        const posts = await getPosts(coinId);
        setPosts(posts);
      } catch (error) {
        console.log(error);
      }
    };
    loadPosts();
  }, [coinId]);

  return coin ? (
    <section className="coinContainer">
      <div className="coinHeader">
        <img src={coin.image} />
        <h5 className="coinName">{coin.name}</h5>
        <h5>{coin.symbol}</h5>
      </div>
      <div className="coinTradePrice">
        <p>현재가</p>
        <h5
          className="coinPrice"
          style={
            coin.change === "RISE"
              ? { color: "#ff3b30" }
              : coin.change === "FALL"
              ? { color: "#007aff" }
              : { color: "" }
          }
        >
          {Number(Number(coin.tradePrice).toFixed(2)).toLocaleString("en-US")}
        </h5>
        <p>전일대비</p>
        <h5
          className="coinChange"
          style={
            coin.change === "RISE"
              ? { color: "#ff3b30" }
              : coin.change === "FALL"
              ? { color: "#007aff" }
              : { color: "" }
          }
        >
          {coin.change === "RISE" ? "+" : ""}
          {Number(
            Number(
              ((coin.tradePrice - coin.prevClosingPrice) /
                coin.prevClosingPrice) *
                100
            ).toFixed(2)
          ).toLocaleString("en-US") + "%"}
        </h5>
      </div>
      <div className="coinDescriptionContainer">
        <h5>코인소개</h5>
        <p className="coinDescription">{coin.description}</p>
      </div>
      <div className="coinLinkContainer">
        <a
          className="coinLink"
          href={coin.homepage}
          target="_blank"
          rel="noreferrer"
        >
          웹사이트
        </a>
        <a
          className="coinLink"
          href={coin.github}
          target="_blank"
          rel="noreferrer"
        >
          저장소
        </a>
        <a
          className="coinLink"
          href={coin.whitepaper}
          target="_blank"
          rel="noreferrer"
        >
          백서
        </a>
      </div>
      <div className="coinMetaContainer">
        <div className="coinMeta">
          <span>
            <span className="coinMetaFont">최초발행</span> {coin.initialRelease}
          </span>
          <span className="coinSupplyLimit">
            <span className="coinMetaFont">총 발행한도</span> {coin.supplyLimit}
          </span>
        </div>
        <div className="coinAuthor">
          <span>
            <span className="coinMetaFont">개발자</span> {coin.author}
          </span>
        </div>
      </div>
      <Posts coinId={coinId} posts={posts} />
    </section>
  ) : (
    <Loading />
  );
}
export default Coin;
