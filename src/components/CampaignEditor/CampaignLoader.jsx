import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../apiClient';
import Icon from '../shared/Icon/Icon';
import { errorMessage } from '../../shared/auth';
import ui from '../../shared/ui.module.css';

const CampaignLoader = ({ campaignId, children }) => {
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');

  const reload = useCallback(async () => {
    try {
      const res = await apiClient.api.getCampaign(campaignId);
      setCampaign(res.data);
      setPageError('');
    } catch (err) {
      setPageError(errorMessage(err, 'Не удалось загрузить кампанию'));
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    reload();
  }, [reload]);

  if (loading) {
    return (
      <div className={ui.page}>
        <p className={ui.message}>Загрузка кампании…</p>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className={ui.page}>
        <Link to="/app/campaigns" className={ui.backLink}>
          <Icon name="arrowLeft" size={16} /> Мои кампании
        </Link>
        <p className={ui.errorBanner}>{pageError}</p>
      </div>
    );
  }

  return children({ campaign, setCampaign, reload });
};

export default CampaignLoader;
