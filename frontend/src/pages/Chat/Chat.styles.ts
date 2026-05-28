import styled, { css } from 'styled-components';

export const ShellStyled = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing[4]};
    height: calc(100vh - 136px);
    overflow: hidden;
`;

export const ShellHeader = styled.div`
    display: flex;
    justify-content: space-between;
    width: 100%;
    align-items: center;
    gap: ${({ theme }) => theme.spacing[2]};
`;

export const HeaderContentWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: ${({ theme }) => theme.spacing[3]};
`;

export const ShellContentWrapper = styled.div`
    display: flex;
    background-color: ${({ theme }) => theme.colors.white};
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    border: ${({ theme }) => theme.border.light};
    flex: 1;
    min-height: 0;
    overflow: hidden;
`;

export const DropDownWrapper = styled.div`
    margin: 0 ${({ theme }) => theme.spacing[3]};
`
export const GoBackButton = styled.button`
    background: transparent;
    border: none;
    display: flex;
    gap: ${({ theme }) => theme.spacing[3]};
    flex-direction: row;
    align-items: center;
    cursor: pointer;
    padding-left: 7px;

    >span{
        color: ${({ theme }) => theme.colors.black};
        font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
        font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    }
`;

// side panel styles
export const ChatSidePanelWrapper = styled.div`
    display: flex;
    flex-direction: column;
    min-width: 416px;
    max-width: 416px;
    border-right: ${({ theme }) => theme.border.light};
    padding: ${({ theme }) => theme.spacing[5]} 0;
    gap: ${({ theme }) => theme.spacing[6]};
    height: calc(100vh - 200px);
    overflow: hidden;
`;

// Chat History Styles
export const ChatHistoryContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 0 ${({ theme }) => theme.spacing[5]};
    flex: 1;
    min-height: 0;
    overflow: hidden;
`;

export const TilesWrapperStyled = styled.div`
    display: flex;
    flex-direction: column;
    gap: 24px;
    overflow-y: auto;
    flex: 1;
    min-height: 0;
    padding-right: ${({ theme }) => theme.spacing[2]};

    /* Custom scrollbar styling */
    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-track {
        background: ${({ theme }) => theme.colors.neutralGray};
        border-radius: ${({ theme }) => theme.borderRadius.sm};
    }

    &::-webkit-scrollbar-thumb {
        background: ${({ theme }) => theme.colors.coolGray};
        border-radius: ${({ theme }) => theme.borderRadius.sm};
    }

    &::-webkit-scrollbar-thumb:hover {
        background: ${({ theme }) => theme.colors.contentTertiary};
    }
`;

export const ContainerTitleStyled = styled.h2`
    color: ${({ theme }) => theme.colors.contentPrimary};
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    margin: 0;
    flex-shrink: 0;
`;

export const SessionsHeaderWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
`;

export const SessionItemWrapper = styled.div<{ $isActive?: boolean }>`
    display: flex;
    flex-direction: column;
    padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[4]};
        background-color: ${({ theme, $isActive }) =>
            $isActive ? theme.colors.lightGray : theme.colors.white};
        border: 1px solid ${({ theme, $isActive }) =>
            $isActive ? theme.colors.primary : theme.colors.border};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background-color: ${({ theme }) => theme.colors.neutralGray};
        border-color: ${({ theme }) => theme.colors.primary};
    }
`;

export const SessionTitle = styled.span`
    color: ${({ theme }) => theme.colors.contentPrimary};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
`;

export const SessionActionsWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${({ theme }) => theme.spacing[2]};
    width: 100%;
`;

export const DeleteButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border: none;
    background: transparent;
    color: ${({ theme }) => theme.colors.contentTertiary};
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    border-radius: ${({ theme }) => theme.borderRadius.sm};
    opacity: 0;
    transition: all 0.2s ease;
    flex-shrink: 0;

    &:hover {
        background: ${({ theme }) => theme.colors.neutralGray};
        color: #ef4444;
    }

    ${SessionItemWrapper}:hover & {
        opacity: 1;
    }
`;

export const NewChatHint = styled.span`
    color: ${({ theme }) => theme.colors.contentTertiary};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    text-align: center;
    line-height: 1.5;
`;

export const SessionsLoadingWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${({ theme }) => theme.spacing[6]};
    color: ${({ theme }) => theme.colors.contentSecondary};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

export const EmptySessionsMessage = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${({ theme }) => theme.spacing[6]};
    color: ${({ theme }) => theme.colors.contentTertiary};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    text-align: center;
`;

// Alert Box Styles
export const AlertBoxWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing[4]};
    padding: 0 ${({ theme }) => theme.spacing[5]};
    flex-shrink: 0;
`;

export const AlertsContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing[2]};
    max-height: 220px;
    overflow-y: auto;
    padding-right: ${({ theme }) => theme.spacing[1]};

    /* Custom scrollbar */
    &::-webkit-scrollbar {
        width: 6px;
    }
    &::-webkit-scrollbar-track {
        background: transparent;
        border-radius: 3px;
    }
    &::-webkit-scrollbar-thumb {
        background: ${({ theme }) => theme.colors.coolGray};
        border-radius: 3px;
    }
    &::-webkit-scrollbar-thumb:hover {
        background: ${({ theme }) => theme.colors.contentTertiary};
    }
`;


// chat related styles

export const ChatHeaderStyled = styled.div`
    display: flex;
    border-bottom: ${({ theme }) => theme.border.light};
    padding: ${({ theme }) => theme.spacing[5]};
    width: 100%;
    justify-content: space-between;
    gap: ${({ theme }) => theme.spacing[8]};
`;



export const ChatMainArea = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    overflow: hidden;
`;
