import React, { useState, useEffect } from "react";
import { formatDistance } from "date-fns";
import { request } from "strapi-helper-plugin";
import Detail from "../Detail";
import spinner from "../../../assets/icons/spinner.svg";
import * as S from "./index.styles";

const API_DOMAIN = "http://localhost:1337";

const StatusTypes = {
  SYNCED: "Synced",
  LOADING: "Loading...",
  SYNCING: "Syncing...",
  CONVERTING: "Coverting pages...",
  UPLOADING: "Uploading pages...",
  NOT_SYNCED: "Out of sync",
  ERROR: "ERROR",
};

const StatusColors = {
  RED: "red",
  GREY: "grey",
  BLUE: "#007EFF",
  GREEN: "green",
};

const PdfConverter = (props) => {
  const [status, setStatus] = useState(StatusTypes.LOADING);
  const [statusColor, setStatusColor] = useState(StatusColors.GREY);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [configData, setConfigData] = useState(null);

  const handleSyncClick = () => {
    setStatus(StatusTypes.SYNCING);

    request(`${API_DOMAIN}/convert-pdf`, {
      method: "POST",
    })
      .then((response) => {
        setConfigData(response);
        setStatus(StatusTypes.SYNCED);

        const updateValue = JSON.stringify(response);

        props.onChange({ target: { name: "book_pages", value: updateValue } });

        strapi.notification.toggle({
          type: "success",
          message: "Syncing E-book pages success.",
        });
      })
      .catch((err) => {
        setStatus(StatusTypes.ERROR);
        strapi.notification.toggle({
          type: "warning",
          message: "There was an error syncing the pages.",
        });
        console.log(err);
      });
  };

  useEffect(() => {
    const value = JSON.parse(props.value);
    setConfigData(value);
  }, [props.value]);

  useEffect(() => {
    console.log(props);
  }, [props]);

  useEffect(() => {
    switch (status) {
      case StatusTypes.ERROR:
      case StatusTypes.NOT_SYNCED:
        setStatusColor(StatusColors.RED);
        break;
      case StatusTypes.SYNCED:
        setStatusColor(StatusColors.GREEN);
        break;
      default:
        setStatusColor(StatusColors.GREY);
    }
  }, [status]);

  useEffect(() => {
    (async () => {
      try {
        if (!configData) {
          setStatus(StatusTypes.NOT_SYNCED);
          return;
        }

        const _lastUpdate = formatDistance(
          new Date(configData.last_update),
          new Date(),
          { addSuffix: true }
        );

        setLastUpdate(_lastUpdate);
        const book = await request(`${API_DOMAIN}/e-book`);
        console.log(book);

        // Compare book last updates
        if (book.file.updated_at !== configData.file.updated_at) {
          setStatus(StatusTypes.NOT_SYNCED);
          strapi.notification.toggle({
            type: "info",
            message: "Book pages are out of sync.",
          });
        } else {
          setStatus(StatusTypes.SYNCED);
        }
      } catch (err) {
        setStatus(StatusTypes.ERROR);
        strapi.notification.toggle({
          type: "warning",
          message: "There was an error requesting E-book information.",
        });
      }
    })();
  }, [configData]);

  return (
    <S.Wrapper>
      <S.Title>Pages</S.Title>
      <S.DetailsWrapper>
        <Detail label="Status" value={status} color={statusColor} isStatus />
        <Detail
          label="Total Pages"
          value={configData ? configData.pages : "~"}
        />
        <Detail label="Last Synced" value={lastUpdate ? lastUpdate : "~"} />
      </S.DetailsWrapper>
      {(status === StatusTypes.NOT_SYNCED ||
        status === StatusTypes.SYNCING) && (
        <>
          <S.ConvertButton
            disabled={status === StatusTypes.SYNCING}
            onClick={handleSyncClick}
            type="button"
          >
            {status === StatusTypes.SYNCING ? (
              <img src={spinner} width="24px" />
            ) : (
              <span>Sync pages</span>
            )}
          </S.ConvertButton>
          <S.Note>
            {status === StatusTypes.SYNCING ? (
              <span>Sync will take a few minutes.</span>
            ) : (
              <span>Pages must be manually synced after a PDF update.</span>
            )}
          </S.Note>
        </>
      )}
    </S.Wrapper>
  );
};

export default PdfConverter;
