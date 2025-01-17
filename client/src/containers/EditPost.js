import "./EditPost.css";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import Loading from "../components/Loading";
import { useState, useEffect, useRef } from "react";
import { useHistory, useParams } from "react-router-dom";
import { getPost, updatePost } from "../api";
import { getLocalToken } from "../utils";

function EditPost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [rise, setRise] = useState(false);
  const [fall, setFall] = useState(false);
  const [isPostUpdateLoading, setIsPostUpdateLoading] = useState(false);
  const [error, setError] = useState(false);
  const history = useHistory();
  const refTitle = useRef();
  const refContent = useRef();
  const { coinId, postId } = useParams();
  const [isPostLoading, setIsPostLoading] = useState(false);

  useEffect(() => {
    const loadPost = async () => {
      setIsPostLoading(true);
      try {
        const post = await getPost(coinId, postId);
        setTitle(post.title);
        setContent(post.content);
        setIsPostLoading(false);
      } catch (error) {
        console.log(error);
      }
    };
    loadPost();
  }, [coinId, postId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsPostUpdateLoading(true);

    try {
      const token = getLocalToken();

      if (!token) {
        return history.push("/login");
      }

      const result = await updatePost(token, coinId, postId, {
        title,
        content,
        rise,
        fall,
      });

      if (!result) {
        throw new Error("post update failed");
      }

      setIsPostUpdateLoading(false);
      history.replace(`/coins/${coinId}/posts/${postId}`);
    } catch (error) {
      if (error.message === "post update failed") {
        setError(true);
        refTitle.current.focus();
        setTimeout(() => {
          setError(false);
        }, 3000);
      }
      setIsPostUpdateLoading(false);
    }
  };

  const handleEnter = (event) => {
    if (event.keyCode === 13) {
      switch (event.target.id) {
        case "title":
          refContent.current.focus();
          break;
        default:
          break;
      }
    }
  };

  const validateForm = () => {
    return title.length > 0 && content.length > 0 && (rise || fall);
  };

  const handleRise = () => {
    setRise(true);
    setFall(false);
  };

  const handleFall = () => {
    setFall(true);
    setRise(false);
  };

  return isPostLoading ? (
    <Loading />
  ) : (
    <Form className="editPostFormContainer" onSubmit={handleSubmit}>
      <div className="editPostHeader">
        <div className="editPostTitle">
          <Form.Group controlId="title">
            <Form.Control
              placeholder="제목을 1 ~ 30자를 입력해주세요."
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleEnter}
              ref={refTitle}
            />
          </Form.Group>
        </div>
        <div className="editPostRiseFallBtnContainer">
          <Button
            variant={rise ? "danger" : "outline-danger"}
            className="editPostRiseBtn"
            onClick={handleRise}
          >
            오른다
          </Button>
          <Button
            variant={fall ? "primary" : "outline-primary"}
            onClick={handleFall}
          >
            내린다
          </Button>
        </div>
      </div>
      <Form.Group controlId="content">
        <Form.Control
          placeholder="내용을 1 ~ 300자를 입력해주세요."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          ref={refContent}
          className="editPostContentInput"
          as="textarea"
        />
      </Form.Group>
      {error && alert("제목을 1 ~ 30자, 내용을 1 ~ 300자를 입력해주세요.")}
      <Button disabled={!validateForm()} type="submit" className="editPostBtn">
        {isPostUpdateLoading ? (
          <>
            <Spinner
              as="span"
              animation="border"
              role="status"
              aria-hidden="true"
              size="sm"
            />
            <span className="visually-hidden">Loading...</span>
          </>
        ) : (
          "수정하기"
        )}
      </Button>
    </Form>
  );
}

export default EditPost;
