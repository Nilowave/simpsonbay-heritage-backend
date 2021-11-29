import styled, { css } from "styled-components";

export const Detail = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 4rem;
  padding: 0.6rem 2rem;
  margin: 0.5rem 0;
  border: 1px solid rgba(0, 0, 0, 0.05);
`;

export const Label = styled.p`
  font-family: Lato;
  margin: 0;
  line-height: normal;
  color: #9ea7b8;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
`;

export const Value = styled.p`
  position: relative;
  margin: 0;
  line-height: 12px;
  color: ${(props) => props.color || "#292b2c"};
  font-size: 13px;
  font-weight: 400;
  text-transform: none;
  text-align: right;
  border: solid 1px transparent;
  padding: 2px;
  border-radius: 3px;

  ${(props) =>
    props.color &&
    css`
      border-color: ${props.color};
      padding: 2px 4px;
    `}

  ${(props) =>
    props.isStatus &&
    css`
      padding: 4px 8px;
      text-transform: uppercase;
      font-size: 11px;
      font-weight: 600;
      ${props.color === "green" && "background-color: rgba(0, 255, 0, 0.1);"}
      ${props.color === "red" && "background-color: rgba(255, 0, 0, 0.1);"}
      ${props.color === "grey" && "background-color: rgba(0, 0, 0, 0.1);"}
    `}
`;
