import React, { useState } from "react";
import { SiGoogletranslate } from "react-icons/si";
import { Button, Modal } from "react-bootstrap";
import { translate } from "../../services/chat";
import Spinner from "react-bootstrap/Spinner";

const ButtonTranslate = ({ text }: any) => {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClose = () => setShow(false);
  const [translateText, setTranslateText] = useState<string>("");

  const handleTranslate = async () => {
    try {
      setLoading(true);
      const data = await translate(text);
      if (data.success && data.translatedText) {
        setShow(true);
        setTranslateText(data.translatedText);
      } else {
        console.error("Translation failed:", data.error);
      }
    } catch (error) {
      console.error("Error translate:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button className="translate" onClick={handleTranslate}>
        {loading ? (
          <Spinner size={"sm"} animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        ) : (
          <SiGoogletranslate size={30} color={"midnightblue"} />
        )}
      </button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Message</Modal.Title>
        </Modal.Header>
        <Modal.Body>{translateText}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ButtonTranslate;
