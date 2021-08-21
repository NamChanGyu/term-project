import "./News.css";

const NewsItem = ({ article }) => {
  const { title, description, url, urlToImage, publishedAt } = article;
  return (
    <div className="newsItemContainer">
      {urlToImage && (
        <div className="newsThumbnail">
          <a href={url} target="_blank" rel="noopener noreferrer">
            <img src={urlToImage} alt="thumbnail" />
          </a>
          <p className="newsTitle">
            <a
              className="newsTitleLink"
              href={url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {title}
            </a>
          </p>
        </div>
      )}
      <div>
        <p className="newsDescription">{description}</p>
        <span className="newsPublishedAt">{publishedAt.substr(0, 10)}</span>
        &nbsp;
        <span className="newsPublishedAt">{publishedAt.substr(11, 8)}</span>
      </div>
    </div>
  );
};

export default NewsItem;