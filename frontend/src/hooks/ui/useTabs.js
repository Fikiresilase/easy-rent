import { useState } from 'react';

export function useTabs(defaultTab = 'Posts') {
  const [tab, setTab] = useState(defaultTab);

  return { tab, setTab };
}