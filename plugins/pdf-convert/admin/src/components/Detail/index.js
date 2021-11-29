import React from "react";
import * as S from "./index.styles";

const Detail = ({ label, value, color }) => {
  return (
    <S.Detail>
      <S.Label>{label}</S.Label>
      <S.Value color={color}>{value}</S.Value>
    </S.Detail>
  );
};

export default Detail;
