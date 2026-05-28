import React from 'react';
import { SwitchContainer, SwitchLabel, SwitchTrack, SwitchThumb } from './Switch.styles';

export interface SwitchProps {
  /** Whether the switch is checked/active */
  checked: boolean;
  /** Callback when switch state changes */
  onChange: (value: boolean) => void;
  /** Label text for the switch */
  label?: string;
  /** Whether the switch is disabled */
  disabled?: boolean;
  /** Additional CSS class name */
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({ checked, onChange, label, disabled = false, className }) => {
  const handleClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onChange(!checked);
    }
  };

  return (
    <SwitchContainer className={className}>
      {label && <SwitchLabel>{label}</SwitchLabel>}
      <SwitchTrack
        role="switch"
        aria-checked={checked}
        $checked={checked}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        $disabled={disabled}
      >
        <SwitchThumb $checked={checked} />
      </SwitchTrack>
    </SwitchContainer>
  );
};

export default Switch;
