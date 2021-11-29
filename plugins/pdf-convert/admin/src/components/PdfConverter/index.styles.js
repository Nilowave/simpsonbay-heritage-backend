import styled from "styled-components";

export const Wrapper = styled.div`
  margin-bottom: 2.3rem;
`;

export const Note = styled.p`
  color: #673333;
  opacity: 0.8;
  font-size: 13px;
  margin: 1rem 0;
  font-weight: 600;
  text-align: right;
`;

export const Title = styled.h5`
  margin-bottom: 1rem;
  color: #333740;
  font-weight: 500;
  font-size: 1.3rem;
  line-height: 1.5;
`;

export const ConvertButton = styled.button`
  padding: 1rem 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #175c4c;
  border-radius: 3px;
  color: white;
  font-weight: 600;
  letter-spacing: 1.2px;
  margin-left: auto;
  transition: all 0.5s ease;

  &:disabled {
    background-color: #aaa;
    color: #333;
  }
`;

export const DetailsWrapper = styled.div`
  /* max-width: 70%; */
  margin-bottom: 2rem;
`;
