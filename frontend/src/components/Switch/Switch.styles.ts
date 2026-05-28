import styled from 'styled-components';

export const SwitchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

export const SwitchLabel = styled.span`
  color: ${({ theme }) => theme.colors.disabledText};
  text-align: center;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-style: normal;
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  line-height: 127%;
`;

export const SwitchTrack = styled.div<{ $checked: boolean; $disabled: boolean }>`
  position: relative;
  width: 32.903px;
  height: 20px;
  background-color: ${({ theme, $checked }) =>
    $checked ? theme.colors.primary : theme.colors.coolGray};
  border-radius: 64.516px;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};
  transition: background-color 0.2s ease-in-out;
  outline: none;
  flex-shrink: 0;

  &:focus-visible {
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.white},
      0 0 0 4px ${({ theme }) => theme.colors.primary};
  }

  &:hover:not(:disabled) {
    background-color: ${({ theme, $checked }) =>
      $checked ? theme.colors.hoverPrimary : theme.colors.coolGray};
  }
`;

export const SwitchThumb = styled.div<{ $checked: boolean }>`
  position: absolute;
  top: 50%;
  left: ${({ $checked }) => ($checked ? 'calc(100% - 18.609px)' : '1.19px')};
  width: 17.419px;
  height: 17.419px;
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: 64.516px;
  transform: translateY(-50%);
  transition: left 0.2s ease-in-out;
  box-shadow:
    0px 0px 0px 0px rgba(0, 0, 0, 0.04),
    0px 1.935px 5.161px 0px rgba(0, 0, 0, 0.15),
    0px 1.935px 0.645px 0px rgba(0, 0, 0, 0.06);
`;
