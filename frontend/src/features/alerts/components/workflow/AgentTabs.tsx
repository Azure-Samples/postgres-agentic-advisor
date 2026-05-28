import React, { useRef, useState, useEffect, useCallback } from 'react';
import { TabBar, TabBarWrapper, TabScrollFade, TabScrollButton, TabItem, TabActiveBar } from './AgentTabs.styles';
import { TabScrollChevronRightIcon, TabScrollChevronLeftIcon } from '../../../../icons';

interface WorkflowAgentTab {
  id: string;
  label: string;
}

interface AgentTabsProps {
  activeAgentId: string;
  tabs: WorkflowAgentTab[];
  onTabChange: (agentId: string) => void;
}

/**
 * Reusable horizontal tab bar listing all 7 agents.
 * Active tab gets primary colour and a 2 px underline. Scrollable when narrow.
 *
 * Scroll indicator behaviour:
 *  - Default: right-side gradient + right chevron → scrolls right
 *  - At rightmost position: switches to left-side gradient + left chevron → scrolls left
 */
const AgentTabs: React.FC<AgentTabsProps> = ({ activeAgentId, tabs, onTabChange }) => {
  const tabBarRef = useRef<HTMLDivElement>(null);
  // true = we are at the rightmost scroll position (or no overflow)
  const [atEnd, setAtEnd] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = tabBarRef.current;
    if (!el) return;
    const overflow = el.scrollWidth > el.clientWidth + 1;
    setHasOverflow(overflow);
    const isAtEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
    setAtEnd(isAtEnd);
  }, []);

  useEffect(() => {
    const el = tabBarRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      ro.disconnect();
    };
  }, [updateScrollState]);

  // Scroll the active tab into view whenever the active agent changes.
  useEffect(() => {
    const el = tabBarRef.current;
    if (!el) return;
    const activeTab = el.querySelector('[aria-selected="true"]') as HTMLElement | null;
    if (!activeTab) return;
    const tabLeft = activeTab.offsetLeft;
    const tabRight = tabLeft + activeTab.offsetWidth;
    if (tabLeft < el.scrollLeft) {
      el.scrollTo({ left: tabLeft - 8, behavior: 'smooth' });
    } else if (tabRight > el.scrollLeft + el.clientWidth) {
      el.scrollTo({ left: tabRight - el.clientWidth + 8, behavior: 'smooth' });
    }
  }, [activeAgentId]);

  const handleScroll = () => {
    const el = tabBarRef.current;
    if (!el) return;
    if (atEnd) {
      el.scrollBy({ left: -160, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: 160, behavior: 'smooth' });
    }
  };

  const side = atEnd ? 'left' : 'right';

  return (
    <TabBarWrapper>
      <TabBar ref={tabBarRef} role="tablist" aria-label="Agent workflow tabs">
        {tabs.map(({ id, label }) => {
          const isActive = id === activeAgentId;
          return (
            <TabItem key={id} role="tab" aria-selected={isActive} $active={isActive} onClick={() => onTabChange(id)}>
              {label}
              {isActive && <TabActiveBar />}
            </TabItem>
          );
        })}
      </TabBar>
      {hasOverflow && <TabScrollFade $side={side} aria-hidden="true" />}
      {hasOverflow && (
        <TabScrollButton
          type="button"
          $side={side}
          onClick={handleScroll}
          aria-label={atEnd ? 'Scroll tabs left' : 'Scroll tabs right'}
        >
          {atEnd ? <TabScrollChevronLeftIcon /> : <TabScrollChevronRightIcon />}
        </TabScrollButton>
      )}
    </TabBarWrapper>
  );
};

export default AgentTabs;
