import React, { useEffect } from "react";
import * as S from "./index.styles";
import CopyIcon from "../../assets/icons/copy.svg";
import { useContentManagerEditViewDataManager } from "strapi-helper-plugin";

const CopyLink = (props) => {
  const { modifiedData } = useContentManagerEditViewDataManager();

  const handleCopyClick = () => {
    if (modifiedData) {
      const key = props.placeholder || "link";
      if (modifiedData[key]) {
        console.log("copy", modifiedData[key]);
        navigator.clipboard.writeText(modifiedData[key]).then(() => {
          strapi.notification.toggle({
            type: "success",
            message: "Link copied to clipboard",
          });
        });
      }
    } else {
      strapi.notification.toggle({
        type: "warning",
        message: "There is no link to copy",
      });
    }
  };

  return (
    <>
      <p>Copy link</p>
      <S.SButton onClick={handleCopyClick} type="button">
        Copy <img src={CopyIcon} alt="Copy icon" />
      </S.SButton>
    </>
  );
};

export default CopyLink;
