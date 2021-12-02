import React, { useState, useEffect, useRef } from "react";
import { formatDistance } from "date-fns";
import { request } from "strapi-helper-plugin";
import Detail from "../Detail";
import spinner from "../../../assets/icons/spinner.svg";
import * as S from "./index.styles";

// const API_DOMAIN = "http://localhost:1337";
const API_DOMAIN = "";

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
  const inputField = useRef(null);
  const hiddenSave = useRef(null);
  const [status, setStatus] = useState(StatusTypes.LOADING);
  const [statusColor, setStatusColor] = useState(StatusColors.GREY);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [configData, setConfigData] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

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

        setTimeout(() => {
          hiddenSave.current.click();
        }, 100);
      })
      .catch((err) => {
        setStatus(StatusTypes.ERROR);
        strapi.notification.toggle({
          type: "warning",
          message: "There was an error syncing the pages.",
        });
        console.error(err);
      });
  };

  const handleImport = () => {
    if (inputField.current) {
      if (inputField.current.value) {
        console.log(inputField.current.value);
        try {
          const value = JSON.parse(inputField.current.value);

          const cc = props.onChange({
            target: { name: "book_pages", value: inputField.current.value },
          });
          console.log(cc);

          setTimeout(() => {
            hiddenSave.current.click();
          }, 100);
        } catch (err) {
          strapi.notification.toggle({
            type: "warning",
            message: "Incorrect import data format.",
          });
        }
      }
    }
  };

  useEffect(() => {
    console.log(props.value);
    const value = JSON.parse(props.value);
    setConfigData(value);
  }, [props.value]);

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
        let book;
        try {
          book = await request(`${API_DOMAIN}/e-book`);
          const userIsAdmin = book.user.roles.filter(
            (role) => role.code === "strapi-super-admin"
          )[0];
          if (userIsAdmin) setIsAdmin(true);
        } catch (err) {
          console.error(err.message);
        }
        console.log("book", book);

        if (!configData) {
          console.log("np config", configData);
          setStatus(StatusTypes.NOT_SYNCED);
          return;
        }

        const _lastUpdate = formatDistance(
          new Date(configData.last_update),
          new Date(),
          { addSuffix: true }
        );

        setLastUpdate(_lastUpdate);

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
          message:
            "There was an error requesting E-book information. Make sure the E-book is pulished.",
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
        {isAdmin && <S.SInput ref={inputField} type="text" name="import" />}
      </S.DetailsWrapper>

      {isAdmin && (
        <>
          <S.ButtonsWrapper>
            <S.SButton onClick={handleImport} type="button" color="#9a9a9a">
              Import
            </S.SButton>
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
              </>
            )}
          </S.ButtonsWrapper>
          {(status === StatusTypes.NOT_SYNCED ||
            status === StatusTypes.SYNCING) && (
            <S.Note>
              {status === StatusTypes.SYNCING ? (
                <span>Sync will take a few minutes.</span>
              ) : (
                <span>Pages must be manually synced after a PDF update.</span>
              )}
            </S.Note>
          )}
          <S.SaveButton ref={hiddenSave}>save</S.SaveButton>
        </>
      )}
    </S.Wrapper>
  );
};

export default PdfConverter;
