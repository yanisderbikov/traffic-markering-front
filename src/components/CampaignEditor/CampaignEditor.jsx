import React from 'react';
import { useParams } from 'react-router-dom';
import CampaignLoader from './CampaignLoader';
import CampaignOverview from './CampaignOverview';
import CampaignWizard from './CampaignWizard';
import DraftStart from './DraftStart';
import { isUnfinishedDraft } from './campaignForm';

const CampaignEditor = () => {
  const { campaignId } = useParams();

  if (campaignId === 'new') return <DraftStart />;

  return (
    <CampaignLoader key={campaignId} campaignId={campaignId}>
      {({ campaign, setCampaign, reload }) =>
        isUnfinishedDraft(campaign) ? (
          <CampaignWizard
            campaign={campaign}
            onLaunched={(saved) => {
              setCampaign(saved);
              window.scrollTo({ top: 0 });
            }}
          />
        ) : (
          <CampaignOverview campaign={campaign} onReload={reload} />
        )
      }
    </CampaignLoader>
  );
};

export default CampaignEditor;
