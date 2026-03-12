"use client";

import { useState, useCallback, useEffect } from "react";
import { UpsellModal, useUpsellListener } from "./UpsellModal";
import {
  DemoInviteBlockedModal,
  useDemoInviteBlockedListener
} from "./DemoInviteBlockedModal";

export function UpsellModalTrigger() {
  const [upsellOpen, setUpsellOpen] = useState(false);
  const [inviteBlockedOpen, setInviteBlockedOpen] = useState(false);
  const openUpsell = useCallback(() => setUpsellOpen(true), []);
  const openInviteBlocked = useCallback(() => setInviteBlockedOpen(true), []);
  useUpsellListener(openUpsell);
  useDemoInviteBlockedListener(openInviteBlocked);

  return (
    <>
      <UpsellModal open={upsellOpen} onClose={() => setUpsellOpen(false)} />
      <DemoInviteBlockedModal
        open={inviteBlockedOpen}
        onClose={() => setInviteBlockedOpen(false)}
      />
    </>
  );
}
